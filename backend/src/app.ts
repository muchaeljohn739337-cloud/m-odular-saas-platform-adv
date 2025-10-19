import express from 'express';
import supportRouter from './routes/support';
import analyticsRouter from './routes/analytics';
import { activityLogger } from './middleware/activityLogger';

const app = express();

// Add global activity logging
app.use(activityLogger);

// Register routes
app.use('/api/support', supportRouter);
app.use('/api/admin/analytics', analyticsRouter);

export default app;