import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "../prismaClient";
import { config } from "../config";
import { rateLimit } from "../middleware/security";
import * as nodemailer from "nodemailer";
import twilio from "twilio";
import { z } from "zod";
import { getRedis } from "../services/redisClient";

const router = express.Router();

// Optional API key guard (lenient in development)
const validateApiKey = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const apiKey = req.headers["x-api-key"];
  const expectedKey = process.env.API_KEY;
  if (process.env.NODE_ENV === "development" && !expectedKey) {
    return next();
  }
  if (!apiKey || apiKey !== expectedKey) {
    return res.status(401).json({ error: "Invalid or missing API key" });
  }
  next();
};

// POST /api/auth/register
router.post("/register", validateApiKey, async (req, res) => {
  try {
    const { email, password, username, firstName, lastName } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, ...(username ? [{ username }] : [])] },
      select: { id: true },
    });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        username: username || email.split("@")[0],
        passwordHash,
        firstName: firstName || "",
        lastName: lastName || "",
        termsAccepted: true,
        termsAcceptedAt: new Date(),
      },
    });

    const token = jwt.sign({ userId: user.id, email: user.email }, config.jwtSecret, {
      expiresIn: "7d",
    });

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ error: "Failed to register user" });
  }
});

// POST /api/auth/login
router.post("/login", validateApiKey, async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ email }, { username: email }] },
      select: { id: true, email: true, username: true, firstName: true, lastName: true, passwordHash: true, usdBalance: true },
    });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Update last login (best effort)
    try {
      await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
    } catch {}

    const token = jwt.sign({ userId: user.id, email: user.email }, config.jwtSecret, {
      expiresIn: "7d",
    });

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        usdBalance: user.usdBalance?.toString?.() ?? "0",
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Failed to login" });
  }
});

export default router;

// ------- OTP (Email/SMS) Flows (Redis-backed) ------- //
const otpLimiter = rateLimit({ windowMs: 60_000, maxRequests: 5 });

const sendOtpSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/).optional(),
}).refine((d) => !!d.email || !!d.phone, { message: "Provide email or phone" });

const verifyOtpSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/).optional(),
  code: z.string().length(6),
}).refine((d) => !!d.email || !!d.phone, { message: "Provide email or phone" });

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getTwilioClient() {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env as any;
  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
    return twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  }
  return null;
}

// POST /api/auth/send-otp
router.post("/send-otp", otpLimiter, async (req, res) => {
  try {
    const { email, phone } = sendOtpSchema.parse(req.body || {});

    const user = await prisma.user.findFirst({ where: email ? { email } : { username: phone } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const code = generateCode();
    const key = email || phone!;

    const redis = getRedis();
    const ttlSeconds = 5 * 60;
    const maxAttemptsWindow = 10 * 60; // 10 minutes
    const maxSendPerWindow = 5;
    const countKey = `otp:cnt:${key}`;
    const lockKey = `otp:lock:${key}`;

    // Fallback in-memory store when Redis not configured
    const mem: any = (global as any).__otpMem || ((global as any).__otpMem = new Map<string, any>());

    if (redis) {
      const locked = await redis.get(lockKey);
      if (locked) return res.status(429).json({ error: "Too many attempts. Try later." });
      const cnt = await redis.incr(countKey);
      if (cnt === 1) await redis.expire(countKey, maxAttemptsWindow);
      if (cnt > maxSendPerWindow) {
        await redis.set(lockKey, '1', 'EX', 30 * 60); // 30 min lockout
        return res.status(429).json({ error: "Too many OTP requests. Try again later." });
      }
      await redis.setex(`otp:${key}`, ttlSeconds, code);
    } else {
      const now = Date.now();
      const entry = mem.get(key) || { count: 0, windowStart: now };
      if (now - entry.windowStart > maxAttemptsWindow * 1000) {
        entry.count = 0;
        entry.windowStart = now;
      }
      entry.count += 1;
      if (entry.count > maxSendPerWindow) {
        return res.status(429).json({ error: "Too many OTP requests. Try again later." });
      }
      mem.set(key, { ...entry, code, exp: now + ttlSeconds * 1000 });
    }

    if (phone) {
      const client = getTwilioClient();
      const from = process.env.TWILIO_PHONE_NUMBER;
      if (client && from) {
        await client.messages.create({ to: phone, from, body: `Your Advancia verification code is ${code}` });
      } else {
        console.log(`[DEV] OTP for ${phone}: ${code}`);
      }
    } else if (email) {
      // Send via nodemailer if configured, else log
      if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
        });
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Your verification code",
          text: `Your Advancia verification code is ${code}`,
        });
      } else {
        console.log(`[DEV] OTP for ${email}: ${code}`);
      }
    }

    return res.json({ message: "OTP sent" });
  } catch (err) {
    if ((err as any)?.name === 'ZodError') {
      return res.status(400).json({ error: (err as any).issues });
    }
    console.error("send-otp error:", err);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
});

// POST /api/auth/verify-otp
router.post("/verify-otp", otpLimiter, async (req, res) => {
  try {
    const { email, phone, code } = verifyOtpSchema.parse(req.body || {});
    const key = email || phone!;

    const redis = getRedis();
    let stored: string | null = null;
    if (redis) {
      stored = await redis.get(`otp:${key}`);
      if (!stored) return res.status(400).json({ error: "No OTP requested or OTP expired" });
      if (String(code) !== stored) return res.status(400).json({ error: "Invalid OTP" });
      await redis.del(`otp:${key}`);
    } else {
      const mem: any = (global as any).__otpMem || ((global as any).__otpMem = new Map<string, any>());
      const entry = mem.get(key);
      if (!entry || Date.now() > entry.exp) return res.status(400).json({ error: "No OTP requested or OTP expired" });
      if (String(code) !== entry.code) return res.status(400).json({ error: "Invalid OTP" });
      mem.delete(key);
    }

    const user = await prisma.user.findFirst({ where: email ? { email } : { username: phone } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const token = jwt.sign({ userId: user.id, email: user.email }, config.jwtSecret, { expiresIn: "7d" });
    return res.json({ message: "OTP verified", token });
  } catch (err) {
    if ((err as any)?.name === 'ZodError') {
      return res.status(400).json({ error: (err as any).issues });
    }
    console.error("verify-otp error:", err);
    return res.status(500).json({ error: "Failed to verify OTP" });
  }
});
