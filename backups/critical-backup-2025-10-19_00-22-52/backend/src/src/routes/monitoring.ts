import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Error reporting endpoint for RPA/admin monitoring
router.post('/error-report', async (req: Request, res: Response) => {
  try {
    const { userId, type, message, timestamp } = req.body;

    // Log error for RPA monitoring
    console.error(`[RPA-MONITOR] ${type}:`, {
      userId,
      message,
      timestamp,
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });

    // TODO: Store in database or send to monitoring service
    // For now, just log to console for admin review
    
    // Send silent success (don't expose details to client)
    res.status(200).json({ received: true });
  } catch (error) {
    // Silent fail - don't expose errors to client
    console.error('[RPA-MONITOR] Error logging failed:', error);
    res.status(200).json({ received: true });
  }
});

// Health check for admin monitoring
router.get('/health-detailed', async (req: Request, res: Response) => {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        api: 'online'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
