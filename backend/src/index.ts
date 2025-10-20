import dotenv from 'dotenv';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import app from './app';
import { config } from './config';
import { setSocketIO as setNotificationSocket } from './services/notificationService';
import { setTransactionSocketIO } from './routes/transactions';
import prisma from './prismaClient';
import paymentsRouter from './routes/payments';
import debitCardRouter, { setDebitCardSocketIO } from './routes/debitCard';
import medbedsRouter, { setMedbedsSocketIO } from './routes/medbeds';
import supportRouter from './routes/support';
import analyticsRouter from './routes/analytics';
import authRouter from './routes/auth';
import adminUsersRouter, { setAdminUsersSocketIO } from './routes/users';
import transactionsRouter from './routes/transactions';
import chatRouter, { setChatSocketIO } from './routes/chat';
import { activityLogger } from './middleware/activityLogger';
import { rateLimit, validateInput } from './middleware/security';

// Load environment variables
dotenv.config();

// Create HTTP server and attach Socket.IO
// Create server
const server = http.createServer(app);

// Configure CORS with allowed origins
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (config.allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);

// Stripe webhook MUST use raw body, so register it BEFORE express.json()
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!config.stripeSecretKey) {
    return res.status(503).json({ error: 'Stripe not configured' });
  }
  try {
    const Stripe = (await import('stripe')).default;
    const stripeClient = new Stripe(config.stripeSecretKey, { apiVersion: '2023-10-16' });
    const sig = req.headers['stripe-signature'];
    if (!sig) return res.status(400).json({ error: 'Missing stripe-signature header' });
    const event = config.stripeWebhookSecret
      ? stripeClient.webhooks.constructEvent((req as any).body, sig, config.stripeWebhookSecret)
      : JSON.parse((req as any).body.toString());

    console.log(`🔔 Webhook received: ${event.type}`);
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const userId = session.metadata?.userId;
      const metaType = session.metadata?.type as string | undefined;
      const ticketId = session.metadata?.ticketId as string | undefined;
      const amount = (session.amount_total || 0) / 100;
      if (userId) {
        try {
          // 1) Record funds to admin portfolio (USD)
          await prisma.adminPortfolio.upsert({
            where: { currency: 'USD' },
            update: { balance: { increment: amount } },
            create: { currency: 'USD', balance: amount },
          });
          await prisma.adminTransfer.create({
            data: {
              userId,
              currency: 'USD',
              amount,
              source: metaType === 'debit_card' ? 'stripe:debit-card' : 'stripe:checkout',
              note: metaType === 'debit_card' ? `Debit card purchase - Session ${session.id}` : `Stripe deposit - Session ${session.id}`,
            },
          });

          if (metaType === 'debit_card') {
            // Debit card flow: do NOT credit user balance; mark ticket and notify admins
            if (ticketId) {
              try {
                await prisma.supportTicket.update({ where: { id: ticketId }, data: { status: 'IN_PROGRESS', response: 'Payment received. Processing debit card order.' } });
              } catch {}
            }
            try { io.to('admins').emit('admin:debit-card:paid', { userId, amount, ticketId, sessionId: session.id }); } catch {}
          } else {
            // Default flow: credit user and emit transaction events
            await prisma.user.update({ where: { id: userId }, data: { usdBalance: { increment: amount } } });
            const tx = await prisma.transaction.create({
              data: { userId, amount, type: 'credit', description: `Stripe deposit - Session ${session.id}`, status: 'completed' },
            });
            console.log(`✅ USD balance updated: +$${amount}`);
            try {
              const payload = { ...tx, amount: Number(tx.amount) } as any;
              io.to(`user-${userId}`).emit('transaction-created', payload);
              io.emit('global-transaction', payload);
              io.to('admins').emit('admin:transaction', payload);
              io.to(`user-${userId}`).emit('balance-updated', { userId, delta: amount });
            } catch (emitErr) {
              console.error('⚠️  Socket emit failed:', emitErr);
            }
          }
        } catch (dbError) {
          console.error('❌ Database update failed:', dbError);
        }
      } else {
        console.log('⚠️  No userId in metadata - balance not updated');
      }
    }
    if (event.type === 'checkout.session.expired') {
      const session = event.data.object as any;
      console.log(`❌ Payment expired: ${session.id}`);
    }
    res.json({ received: true });
  } catch (error: any) {
    console.error('❌ Webhook error:', error.message || error);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// JSON parser and common middlewares AFTER webhook
app.use(express.json());
app.use(validateInput);
app.use(activityLogger);
app.use('/api', rateLimit({ windowMs: 60_000, maxRequests: 300 }));

// Regular routes
app.use('/api/payments', paymentsRouter);
app.use('/api/debit-card', debitCardRouter);
app.use('/api/medbeds', medbedsRouter);
app.use('/api/support', supportRouter);
app.use('/api/admin/analytics', analyticsRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminUsersRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/chat', chatRouter);
const io = new SocketIOServer(server, {
  cors: {
    origin: config.allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket.IO connection handling
// JWT auth for Socket.IO handshake
io.use(async (socket, next) => {
  try {
    const token = (socket.handshake.auth?.token as string) || (socket.handshake.query?.token as string);
    if (!token) return next(new Error('Auth token required'));
    const cleaned = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
    const payload = jwt.verify(cleaned, config.jwtSecret) as { userId: string; email?: string };
    const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { id: true, role: true, active: true } });
    if (!user || user.active === false) return next(new Error('Account disabled'));
    (socket as any).data = { userId: user.id, role: user.role };
    next();
  } catch (e) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const { userId, role } = (socket as any).data || {};
  if (userId) socket.join(`user-${userId}`);
  if (role === 'ADMIN') socket.join('admins');

  // Optional: clients may request to join again with validation
  socket.on('join-room', (reqUserId: string) => {
    if (reqUserId && reqUserId === userId) socket.join(`user-${userId}`);
  });
});

// Inject Socket.IO into services/routers that need it
setNotificationSocket(io);
setTransactionSocketIO(io);
setAdminUsersSocketIO(io);
setDebitCardSocketIO(io);
setMedbedsSocketIO(io);
setChatSocketIO(io);

// Start server
const PORT = config.port || process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});