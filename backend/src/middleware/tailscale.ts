/**
 * Tailscale VPN Middleware
 * 
 * Validates that requests come from authorized Tailscale network devices.
 * Used to secure sensitive endpoints like Dad Admin Console.
 */

import { NextFunction, Request, Response } from 'express';
import logger from '../utils/logger';

// Tailscale uses 100.x.x.x IP range (CGNAT)
const TAILSCALE_IP_RANGE = /^100\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;

/**
 * Get client IP from request, considering proxies
 */
function getClientIp(req: Request): string | null {
  // Check X-Forwarded-For header (for proxies)
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = typeof forwarded === 'string' ? forwarded.split(',') : forwarded;
    return ips[0].trim();
  }

  // Check X-Real-IP header
  const realIp = req.headers['x-real-ip'];
  if (realIp && typeof realIp === 'string') {
    return realIp;
  }

  // Fallback to req.ip
  return req.ip || req.socket.remoteAddress || null;
}

/**
 * Check if IP is in Tailscale range
 */
export function isTailscaleIp(ip: string | null): boolean {
  if (!ip) return false;
  return TAILSCALE_IP_RANGE.test(ip);
}

/**
 * Middleware: Require Tailscale VPN access
 * 
 * Usage:
 * router.use('/api/dad', requireTailscaleAccess, dadConsoleRouter);
 */
export function requireTailscaleAccess(req: Request, res: Response, next: NextFunction): void {
  const clientIp = getClientIp(req);
  
  // Check if Tailscale is enabled in environment
  const tailscaleEnabled = process.env.TAILSCALE_ENABLED === 'true';
  
  if (!tailscaleEnabled) {
    logger.warn('[Tailscale] VPN requirement disabled in environment');
    return next();
  }

  if (!clientIp) {
    logger.error('[Tailscale] Unable to determine client IP');
    return res.status(403).json({
      success: false,
      error: 'Access denied: Unable to verify network',
    });
  }

  if (!isTailscaleIp(clientIp)) {
    logger.warn(`[Tailscale] Access denied for IP: ${clientIp}`);
    return res.status(403).json({
      success: false,
      error: 'Access denied: Tailscale VPN required',
      hint: 'This endpoint requires connection via Tailscale VPN',
    });
  }

  // Check against whitelist if configured
  const allowedIps = process.env.TAILSCALE_ADMIN_IPS?.split(',').map(ip => ip.trim()) || [];
  if (allowedIps.length > 0 && !allowedIps.includes(clientIp)) {
    logger.warn(`[Tailscale] IP ${clientIp} not in whitelist`);
    return res.status(403).json({
      success: false,
      error: 'Access denied: Your device is not authorized',
    });
  }

  logger.info(`[Tailscale] Access granted for IP: ${clientIp}`);
  
  // Attach Tailscale info to request
  (req as any).tailscale = {
    ip: clientIp,
    verified: true,
  };

  next();
}

/**
 * Middleware: Mark Tailscale connections as trusted
 * 
 * Allows bypassing certain security checks like aggressive rate limiting.
 * Use this before SHIELD middleware.
 * 
 * Usage:
 * app.use(markTailscaleTrusted);
 */
export function markTailscaleTrusted(req: Request, res: Response, next: NextFunction): void {
  const clientIp = getClientIp(req);
  
  if (isTailscaleIp(clientIp)) {
    (req as any).isTrustedNetwork = true;
    (req as any).tailscale = {
      ip: clientIp,
      verified: true,
    };
    logger.debug(`[Tailscale] Marked request from ${clientIp} as trusted`);
  }

  next();
}

/**
 * Helper: Get list of authorized Tailscale IPs
 */
export function getAuthorizedTailscaleIps(): string[] {
  const ips = process.env.TAILSCALE_ADMIN_IPS?.split(',').map(ip => ip.trim()) || [];
  return ips.filter(ip => TAILSCALE_IP_RANGE.test(ip));
}

/**
 * Helper: Check if Tailscale is enabled
 */
export function isTailscaleEnabled(): boolean {
  return process.env.TAILSCALE_ENABLED === 'true';
}

export default {
  requireTailscaleAccess,
  markTailscaleTrusted,
  isTailscaleIp,
  getAuthorizedTailscaleIps,
  isTailscaleEnabled,
};
