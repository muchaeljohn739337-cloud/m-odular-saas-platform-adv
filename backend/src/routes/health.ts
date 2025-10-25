import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const uptime = process.uptime();
  const mem = process.memoryUsage();
  
  res.json({
    status: 'healthy',
    service: 'advancia-backend',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(uptime),
    memory: {
      rss: Math.floor(mem.rss / 1024 / 1024) + 'MB',
      heapUsed: Math.floor(mem.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.floor(mem.heapTotal / 1024 / 1024) + 'MB',
    },
    environment: process.env.NODE_ENV || 'development',
  });
});

export default router;
