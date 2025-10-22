import { Request, Response, NextFunction } from "express";

/**
 * Middleware to verify admin access via x-admin-key header
 * Compares against ADMIN_KEY environment variable
 */
export const adminAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const adminKey = req.headers["x-admin-key"];
  const expectedKey = process.env.ADMIN_KEY;

  if (!expectedKey) {
    res.status(500).json({
      error: "Server configuration error: ADMIN_KEY not set",
    });
    return;
  }

  if (!adminKey || adminKey !== expectedKey) {
    res.status(403).json({
      error: "Forbidden: Invalid or missing admin key",
    });
    return;
  }

  next();
};

/**
 * Optional: Combined admin auth that also checks JWT for admin role
 * Use this if you want both x-admin-key AND valid admin JWT
 */
export const adminAuthWithToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const adminKey = req.headers["x-admin-key"];
  const expectedKey = process.env.ADMIN_KEY;

  if (!expectedKey) {
    res.status(500).json({
      error: "Server configuration error: ADMIN_KEY not set",
    });
    return;
  }

  if (!adminKey || adminKey !== expectedKey) {
    res.status(403).json({
      error: "Forbidden: Invalid or missing admin key",
    });
    return;
  }

  // Check if user has admin role from JWT (if authenticateToken was applied before)
  const user = (req as any).user;
  if (user && user.role !== "ADMIN") {
    res.status(403).json({
      error: "Forbidden: Admin role required",
    });
    return;
  }

  next();
};
