import { NextFunction, Request, Response } from "express";

/**
 * Tailscale Authentication Middleware
 *
 * Ensures requests are coming from within the Tailscale network (100.64.0.0/10 CGNAT range).
 * This provides network-level access control on top of JWT authentication.
 *
 * Use cases:
 * - Protect admin endpoints (SHIELD dashboard, Vault access)
 * - Secure service-to-service communication
 * - Development access to production-like environments
 *
 * Security layers:
 * 1. Tailscale (network access) - this middleware
 * 2. JWT authentication (user identity)
 * 3. Role-based authorization (admin check)
 */

/**
 * Middleware to require Tailscale network access.
 *
 * Development mode: Bypasses check unless TAILSCALE_STRICT=true
 * Production mode: Enforces Tailscale IP range (100.64.0.0/10)
 *
 * Returns 403 Forbidden if request is not from Tailscale network.
 */
export function requireTailscale(req: Request, res: Response, next: NextFunction): void {
  // Development bypass (unless strict mode enabled)
  if (process.env.NODE_ENV === "development" && process.env.TAILSCALE_STRICT !== "true") {
    console.log("[Tailscale] Development mode - bypassing Tailscale check");
    return next();
  }

  // Extract client IP (handle Cloudflare proxy)
  const forwardedFor = req.headers["x-forwarded-for"];
  let clientIP: string;

  if (forwardedFor) {
    // Cloudflare sends: x-forwarded-for: client_ip, cloudflare_ip
    // We want the first IP (actual client)
    const ips = typeof forwardedFor === "string" ? forwardedFor.split(",") : forwardedFor;
    clientIP = ips[0].trim();
  } else {
    clientIP = req.ip || req.socket.remoteAddress || "unknown";
  }

  // Check if IP is in Tailscale CGNAT range (100.64.0.0/10)
  // Valid range: 100.64.0.0 to 100.127.255.255
  const isTailscale = /^100\.(6[4-9]|[7-9]\d|1[0-2]\d)\./.test(clientIP);

  if (!isTailscale) {
    console.warn(`[Tailscale] Access denied from non-Tailscale IP: ${clientIP}`);
    res.status(403).json({
      success: false,
      error: "Access denied: Tailscale network access required",
      code: "TAILSCALE_REQUIRED",
      message: "This endpoint is only accessible via Tailscale network. Please connect to Tailscale and try again.",
    });
    return;
  }

  console.log(`[Tailscale] Access granted from Tailscale IP: ${clientIP}`);
  next();
}

/**
 * Get Tailscale user information from request headers.
 *
 * When running behind Tailscale's HTTPS proxy, these headers are available:
 * - Tailscale-User: user@example.com
 * - Tailscale-Name: Display Name
 * - Tailscale-Login: login-name
 * - Tailscale-Profile-Picture: url
 */
export function getTailscaleUser(req: Request): string | null {
  return (req.headers["tailscale-user"] as string) || null;
}

/**
 * Get Tailscale device name from request.
 * Useful for audit logging and access control.
 */
export function getTailscaleDevice(req: Request): string | null {
  return (req.headers["tailscale-device"] as string) || null;
}

/**
 * Check if request is from Tailscale network without blocking.
 * Use this for conditional logic or logging.
 */
export function isTailscaleRequest(req: Request): boolean {
  const forwardedFor = req.headers["x-forwarded-for"];
  let clientIP: string;

  if (forwardedFor) {
    const ips = typeof forwardedFor === "string" ? forwardedFor.split(",") : forwardedFor;
    clientIP = ips[0].trim();
  } else {
    clientIP = req.ip || req.socket.remoteAddress || "unknown";
  }

  return /^100\.(6[4-9]|[7-9]\d|1[0-2]\d)\./.test(clientIP);
}
