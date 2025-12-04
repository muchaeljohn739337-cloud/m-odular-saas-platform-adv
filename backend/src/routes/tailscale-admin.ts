/**
 * Tailscale Admin Routes
 * 
 * Endpoints for managing Tailscale VPN configuration and monitoring.
 * Requires admin role + Tailscale VPN access.
 */

import express, { Request, Response } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { getAuthorizedTailscaleIps, isTailscaleEnabled, requireTailscaleAccess } from '../middleware/tailscale';
import logger from '../utils/logger';

const router = express.Router();

/**
 * GET /api/tailscale/status
 * 
 * Get Tailscale configuration and status
 */
router.get('/status', authenticateToken, requireAdmin, requireTailscaleAccess, async (req: Request, res: Response) => {
  try {
    const status = {
      enabled: isTailscaleEnabled(),
      authorizedIps: getAuthorizedTailscaleIps(),
      yourIp: (req as any).tailscale?.ip || req.ip,
      connectedViaTailscale: (req as any).tailscale?.verified || false,
      configuration: {
        TAILSCALE_ENABLED: process.env.TAILSCALE_ENABLED,
        TAILSCALE_ADMIN_IPS_COUNT: getAuthorizedTailscaleIps().length,
      },
    };

    res.json({
      success: true,
      status,
    });
  } catch (error: any) {
    logger.error('[Tailscale Admin] Error fetching status:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/tailscale/health
 * 
 * Health check for Tailscale connectivity
 */
router.get('/health', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const clientIp = req.ip;
    const isTailscale = clientIp?.startsWith('100.');

    res.json({
      success: true,
      health: {
        tailscaleEnabled: isTailscaleEnabled(),
        connectedViaTailscale: isTailscale,
        yourIp: clientIp,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    logger.error('[Tailscale Admin] Health check error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/tailscale/verify-ip
 * 
 * Verify if an IP is authorized for Tailscale access
 */
router.post('/verify-ip', authenticateToken, requireAdmin, requireTailscaleAccess, async (req: Request, res: Response) => {
  try {
    const { ip } = req.body;

    if (!ip) {
      return res.status(400).json({
        success: false,
        error: 'IP address required',
      });
    }

    const authorizedIps = getAuthorizedTailscaleIps();
    const isAuthorized = authorizedIps.includes(ip);
    const isTailscaleRange = /^100\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip);

    res.json({
      success: true,
      verification: {
        ip,
        isAuthorized,
        isTailscaleRange,
        reason: !isTailscaleRange 
          ? 'IP is not in Tailscale range (100.x.x.x)' 
          : !isAuthorized 
          ? 'IP is in Tailscale range but not whitelisted'
          : 'IP is authorized',
      },
    });
  } catch (error: any) {
    logger.error('[Tailscale Admin] IP verification error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/tailscale/protected-endpoints
 * 
 * List all endpoints protected by Tailscale
 */
router.get('/protected-endpoints', authenticateToken, requireAdmin, requireTailscaleAccess, async (req: Request, res: Response) => {
  try {
    const protectedEndpoints = [
      {
        path: '/api/dad/*',
        description: 'Dad Admin Console - Human oversight for AI decisions',
        protection: 'Tailscale VPN + Admin Role',
      },
      {
        path: '/api/tailscale/*',
        description: 'Tailscale Admin Routes - VPN configuration',
        protection: 'Tailscale VPN + Admin Role',
      },
      {
        path: '/api/system/emergency-shutdown',
        description: 'Emergency system shutdown',
        protection: 'Tailscale VPN + Admin Role',
      },
    ];

    res.json({
      success: true,
      endpoints: protectedEndpoints,
      totalProtected: protectedEndpoints.length,
    });
  } catch (error: any) {
    logger.error('[Tailscale Admin] Error listing endpoints:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
