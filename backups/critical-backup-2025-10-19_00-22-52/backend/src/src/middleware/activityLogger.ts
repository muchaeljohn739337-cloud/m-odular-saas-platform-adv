import { Request, Response, NextFunction } from "express";
import prisma from "../prismaClient";

/**
 * Activity Logger Middleware
 * Logs user activity to the database for audit and analytics purposes
 */
export const activityLogger = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract user info if authenticated
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;

    // Skip logging for health checks and static assets
    const skipPaths = ["/api/health", "/api/status", "/favicon.ico", "/static"];
    const shouldSkip = skipPaths.some(path => req.path.startsWith(path));

    if (shouldSkip) {
      return next();
    }

    // Log the activity asynchronously (don't block the request)
    setImmediate(async () => {
      try {
        await prisma.activityLog.create({
          data: {
            userId: userId || null,
            action: `${req.method} ${req.path}`,
            ipAddress: req.ip || req.socket.remoteAddress || "unknown",
            userAgent: req.get("user-agent") || "unknown",
            metadata: {
              method: req.method,
              path: req.path,
              query: req.query,
              role: userRole || "guest"
            }
          }
        });
      } catch (logError) {
        // Don't throw errors from logging - just log to console
        console.error("Activity logging failed:", logError);
      }
    });

    next();
  } catch (error) {
    // Don't block requests if logging fails
    console.error("Activity logger middleware error:", error);
    next();
  }
};

/**
 * Log specific user actions (e.g., login, purchase, withdrawal)
 */
export const logUserAction = async (
  userId: string,
  action: string,
  metadata?: any,
  ipAddress?: string
) => {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        ipAddress: ipAddress || "unknown",
        userAgent: "server-side-action",
        metadata: metadata || {}
      }
    });
  } catch (error) {
    console.error("Failed to log user action:", error);
  }
};
