import { Request } from "express";
import prisma from "../prismaClient";

/**
 * Simple logger for AI Core and agents
 */
export const logger = {
  info: (message: string, metadata?: any) => {
    console.log(`[INFO] ${message}`, metadata || "");
  },
  warn: (message: string, metadata?: any) => {
    console.warn(`[WARN] ${message}`, metadata || "");
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error || "");
  },
  debug: (message: string, metadata?: any) => {
    if (process.env.DEBUG) {
      console.log(`[DEBUG] ${message}`, metadata || "");
    }
  },
};

/**
 * Log admin login attempts for security auditing
 */
export async function logAdminLogin(
  req: Request,
  email: string,
  status: "SUCCESS" | "FAILED_PASSWORD" | "FAILED_OTP" | "OTP_SENT",
  phone?: string
): Promise<void> {
  try {
    const ip =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";

    await prisma.admin_login_logs.create({
      data: {
        email,
        phone,
        status,
        ipAddress: Array.isArray(ip) ? ip[0] : ip,
        userAgent,
      },
    });

    console.log(`🔐 Admin login attempt logged: ${email} - ${status}`);
  } catch (error) {
    console.error("❌ Failed to log admin login attempt:", error);
    // Don't throw - logging shouldn't break the auth flow
  }
}
