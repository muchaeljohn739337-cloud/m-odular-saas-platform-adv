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
import { authenticateToken } from "../middleware/auth";
import {
  createNotification,
  notifyAllAdmins,
} from "../services/notificationService";

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
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
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

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret,
      {
        expiresIn: "7d",
      }
    );

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
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        passwordHash: true,
        usdBalance: true,
      },
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
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });
    } catch {}

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret,
      {
        expiresIn: "7d",
      }
    );

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

// ============================================
// DOCTOR REGISTRATION (Invite-Only)
// ============================================

const registerDoctorSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  specialization: z.string().min(1),
  licenseNumber: z.string().min(1),
  phoneNumber: z.string().optional(),
  inviteCode: z.string().min(1, "Invite code is required"),
});

// POST /api/auth/register-doctor
router.post("/register-doctor", validateApiKey, async (req, res) => {
  try {
    const data = registerDoctorSchema.parse(req.body);

    // Verify invite code
    const expectedCode = process.env.DOCTOR_INVITE_CODE;
    if (!expectedCode) {
      return res.status(500).json({
        error: "Server configuration error: DOCTOR_INVITE_CODE not set",
      });
    }

    if (data.inviteCode !== expectedCode) {
      return res.status(403).json({ error: "Invalid invite code" });
    }

    // Check if doctor already exists
    const existing = await prisma.doctor.findFirst({
      where: { email: data.email },
      select: { id: true },
    });
    if (existing) {
      return res
        .status(400)
        .json({ error: "Doctor with this email already exists" });
    }

    // Check license number uniqueness
    const existingLicense = await prisma.doctor.findFirst({
      where: { licenseNumber: data.licenseNumber },
      select: { id: true },
    });
    if (existingLicense) {
      return res
        .status(400)
        .json({ error: "License number already registered" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create doctor (status: PENDING by default)
    const doctor = await prisma.doctor.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        specialization: data.specialization,
        licenseNumber: data.licenseNumber,
        phoneNumber: data.phoneNumber || null,
        inviteCode: data.inviteCode,
        status: "PENDING",
      },
    });

    // Generate JWT for doctor
    const token = jwt.sign(
      { doctorId: doctor.id, email: doctor.email, type: "doctor" },
      config.jwtSecret,
      { expiresIn: "7d" }
    );

    // Notify all admins about new doctor registration
    console.log("📢 Notifying admins about new doctor registration...");
    await notifyAllAdmins({
      type: "all",
      category: "admin",
      title: "New Doctor Registration",
      message: `Dr. ${doctor.firstName} ${doctor.lastName} (${doctor.specialization}) has registered. Review their credentials and verify their account.`,
      priority: "high",
      data: {
        doctorId: doctor.id,
        email: doctor.email,
        specialization: doctor.specialization,
        licenseNumber: doctor.licenseNumber,
      },
    });

    return res.status(201).json({
      message: "Doctor registered successfully. Awaiting admin verification.",
      token,
      doctor: {
        id: doctor.id,
        email: doctor.email,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialization: doctor.specialization,
        status: doctor.status,
      },
    });
  } catch (err) {
    if ((err as any)?.name === "ZodError") {
      return res.status(400).json({ error: (err as any).issues });
    }
    console.error("Doctor registration error:", err);
    return res.status(500).json({ error: "Failed to register doctor" });
  }
});

// POST /api/auth/login-doctor
router.post("/login-doctor", validateApiKey, async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const doctor = await prisma.doctor.findFirst({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        specialization: true,
        status: true,
        passwordHash: true,
      },
    });

    if (!doctor || !doctor.passwordHash) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, doctor.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { doctorId: doctor.id, email: doctor.email, type: "doctor" },
      config.jwtSecret,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Doctor login successful",
      token,
      doctor: {
        id: doctor.id,
        email: doctor.email,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialization: doctor.specialization,
        status: doctor.status,
      },
    });
  } catch (err) {
    console.error("Doctor login error:", err);
    return res.status(500).json({ error: "Failed to login doctor" });
  }
});

// ------- OTP (Email/SMS) Flows (Redis-backed) ------- //
const otpLimiter = rateLimit({ windowMs: 60_000, maxRequests: 5 });

const sendOtpSchema = z
  .object({
    email: z.string().email().optional(),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{6,14}$/)
      .optional(),
  })
  .refine((d) => !!d.email || !!d.phone, { message: "Provide email or phone" });

const verifyOtpSchema = z
  .object({
    email: z.string().email().optional(),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{6,14}$/)
      .optional(),
    code: z.string().length(6),
  })
  .refine((d) => !!d.email || !!d.phone, { message: "Provide email or phone" });

// Simple SMTP test payload
const testSmtpSchema = z.object({
  to: z.string().email(),
  subject: z.string().optional(),
  message: z.string().optional(),
});

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

    const user = await prisma.user.findFirst({
      where: email ? { email } : { username: phone },
    });
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
    const mem: any =
      (global as any).__otpMem ||
      ((global as any).__otpMem = new Map<string, any>());

    if (redis) {
      const locked = await redis.get(lockKey);
      if (locked)
        return res.status(429).json({ error: "Too many attempts. Try later." });
      const cnt = await redis.incr(countKey);
      if (cnt === 1) await redis.expire(countKey, maxAttemptsWindow);
      if (cnt > maxSendPerWindow) {
        await redis.set(lockKey, "1", "EX", 30 * 60); // 30 min lockout
        return res
          .status(429)
          .json({ error: "Too many OTP requests. Try again later." });
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
        return res
          .status(429)
          .json({ error: "Too many OTP requests. Try again later." });
      }
      mem.set(key, { ...entry, code, exp: now + ttlSeconds * 1000 });
    }

    if (phone) {
      const client = getTwilioClient();
      const from = process.env.TWILIO_PHONE_NUMBER;
      if (client && from) {
        await client.messages.create({
          to: phone,
          from,
          body: `Your Advancia verification code is ${code}`,
        });
      } else {
        console.log(`[DEV] OTP for ${phone}: ${code}`);
      }
    } else if (email) {
      // Send via nodemailer if configured, else log
      if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
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
    if ((err as any)?.name === "ZodError") {
      return res.status(400).json({ error: (err as any).issues });
    }
    console.error("send-otp error:", err);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
});

// POST /api/auth/test-smtp
// Sends a direct SMTP email using configured Gmail credentials; does NOT require DB
router.post("/test-smtp", validateApiKey, async (req, res) => {
  try {
    const { to, subject, message } = testSmtpSchema.parse(req.body || {});

    const EMAIL_USER = process.env.EMAIL_USER;
    const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
    const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;
    const EMAIL_REPLY_TO =
      process.env.EMAIL_REPLY_TO || EMAIL_USER || undefined;

    if (!EMAIL_USER || !EMAIL_PASSWORD) {
      return res.status(500).json({
        error:
          "SMTP not configured. Set EMAIL_USER and EMAIL_PASSWORD (Gmail App Password) in backend/.env",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: EMAIL_USER, pass: EMAIL_PASSWORD },
    });

    await transporter.sendMail({
      from: EMAIL_FROM,
      replyTo: EMAIL_REPLY_TO,
      to,
      subject: subject || "SMTP Test from Advancia",
      text:
        message ||
        "This is a direct SMTP test using Gmail. If you see this, your EMAIL_USER/EMAIL_PASSWORD work.",
    });

    return res.json({ message: "SMTP test email sent", to });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return res.status(400).json({ error: err.issues });
    }
    console.error("test-smtp error:", err);
    return res.status(500).json({ error: "Failed to send SMTP test email" });
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
      if (!stored)
        return res
          .status(400)
          .json({ error: "No OTP requested or OTP expired" });
      if (String(code) !== stored)
        return res.status(400).json({ error: "Invalid OTP" });
      await redis.del(`otp:${key}`);
    } else {
      const mem: any =
        (global as any).__otpMem ||
        ((global as any).__otpMem = new Map<string, any>());
      const entry = mem.get(key);
      if (!entry || Date.now() > entry.exp)
        return res
          .status(400)
          .json({ error: "No OTP requested or OTP expired" });
      if (String(code) !== entry.code)
        return res.status(400).json({ error: "Invalid OTP" });
      mem.delete(key);
    }

    const user = await prisma.user.findFirst({
      where: email ? { email } : { username: phone },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: "7d" }
    );
    return res.json({ message: "OTP verified", token });
  } catch (err) {
    if ((err as any)?.name === "ZodError") {
      return res.status(400).json({ error: (err as any).issues });
    }
    console.error("verify-otp error:", err);
    return res.status(500).json({ error: "Failed to verify OTP" });
  }
});

// POST /api/auth/test-email
// Sends a simple email notification to the authenticated user to verify SMTP configuration
router.post(
  "/test-email",
  validateApiKey,
  authenticateToken,
  async (req: any, res) => {
    try {
      const user = req.user;
      if (!user?.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const subject = req.body?.subject || "Test Email from Advancia";
      const message =
        req.body?.message ||
        "This is a test email sent from the Advancia backend to verify SMTP settings.";

      await createNotification({
        userId: user.userId,
        type: "email",
        category: "system",
        title: subject,
        message,
      });

      return res.json({ message: "Test email enqueued" });
    } catch (err) {
      console.error("test-email error:", err);
      return res.status(500).json({ error: "Failed to send test email" });
    }
  }
);

// GET /api/auth/me - Get current user data from token
router.get("/me", authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user });
  } catch (err) {
    console.error("auth/me error:", err);
    return res.status(500).json({ error: "Failed to fetch user data" });
  }
});

export default router;
