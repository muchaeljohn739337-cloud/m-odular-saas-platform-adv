import express from "express";
import jwt from "jsonwebtoken";
import { sendAlert } from "../utils/mailer";

const router = express.Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@advancia.com";
const ADMIN_PASS = process.env.ADMIN_PASS || "Admin@123";
const JWT_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh_secret_key";

// Store active sessions (in production, use Redis)
export const activeSessions: Record<string, any> = {};

// Broadcast helper (will be set from index.ts)
let broadcastSessionsFn: (() => void) | null = null;
export function setBroadcastSessions(fn: () => void) {
  broadcastSessionsFn = fn;
}

// Generate access and refresh tokens
function generateTokens(payload: any) {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
}

// Register session
export function registerSession(token: string, user: any) {
  activeSessions[token] = {
    email: user.email,
    role: user.role,
    createdAt: new Date().toISOString(),
  };
  if (broadcastSessionsFn) broadcastSessionsFn();
}

// POST /api/auth/admin/login
router.post("/login", async (req, res) => {
  const { email, password, remember } = req.body;

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASS) {
    // Send alert on failed login
    await sendAlert(
      "🚫 Advancia: Failed Admin Login",
      `Email: ${email}\nTime: ${new Date().toISOString()}`
    );
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const payload = { email, role: "admin" };
  const { accessToken, refreshToken } = generateTokens(payload);

  // Register session
  registerSession(accessToken, payload);

  // Send success alert
  await sendAlert(
    "🔐 Advancia: Admin Login",
    `Admin logged in: ${email}\nTime: ${new Date().toISOString()}`
  );

  res.json({ accessToken, refreshToken });
});

// POST /api/auth/admin/refresh
router.post("/refresh", (req, res) => {
  const { token } = req.body;
  try {
    const decoded: any = jwt.verify(token, REFRESH_SECRET);
    const { accessToken, refreshToken } = generateTokens({
      email: decoded.email,
      role: decoded.role,
    });
    
    // Register new session
    registerSession(accessToken, { email: decoded.email, role: decoded.role });
    
    res.json({ accessToken, refreshToken });
  } catch {
    res.status(403).json({ error: "Invalid refresh token" });
  }
});

export default router;
