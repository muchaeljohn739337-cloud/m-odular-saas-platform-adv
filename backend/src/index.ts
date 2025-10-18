import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import createTransactionRouter from "./routes/transaction";
import authRouter from "./routes/auth";
import tokenRouter from "./routes/tokens";
import rewardsRouter from "./routes/rewards";
import healthRouter from "./routes/health";
import usersRouter from "./routes/users";
import paymentsRouter from "./routes/payments";
import recoveryRouter from "./routes/recovery";
import cryptoRouter from "./routes/crypto";
import rpaRouter from "./rpa/routes";
import chatbotRouter from "./routes/chatbot";
import auditLogsRouter from "./routes/auditLogs";
import twoFactorRouter from "./routes/twoFactor";
import analyticsRouter from "./routes/analytics";
// import loansRouter from "./routes/loans"; // DISABLED: Causing TypeScript errors
import systemRouter from "./routes/system";
import notifyStatsRouter from "./routes/notifyStats";
import notificationRouter from "./routes/notifications";
import { config } from "./config";
import { rateLimit, validateInput, securityHeaders } from "./middleware/security";
import { setSocketIO, sendFallbackEmails } from "./services/notificationService";
import { setTokenSocketIO } from "./routes/tokens";
import cron from "node-cron";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Inject Socket.IO into notification service
setSocketIO(io);

// Inject Socket.IO into token routes
setTokenSocketIO(io);

// Middleware - Enhanced CORS with multiple origins support
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (config.allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Length", "X-Request-Id"],
  maxAge: 86400 // 24 hours
}));

// Security middlewares
app.use(securityHeaders);
app.use(validateInput);

// Rate limiting for authentication endpoints
app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 requests per 15 minutes
    message: "Too many authentication attempts, please try again later.",
  })
);

// General rate limiting for all API endpoints
app.use(
  "/api",
  rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  })
);

// Stripe webhook needs raw body - must be before express.json()
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

// Parse JSON for all other routes
app.use(express.json());

console.log('📋 Registering routes...');

// Routes
app.use("/api/auth", authRouter);
console.log('✓ Auth routes registered');
app.use("/api/2fa", twoFactorRouter);
console.log('✓ 2FA routes registered');
app.use("/api/tokens", tokenRouter);
console.log('✓ Token routes registered');
app.use("/api/rewards", rewardsRouter);
console.log('✓ Rewards routes registered');
app.use("/api/health", healthRouter);
console.log('✓ Health routes registered');
app.use("/api/users", usersRouter);
console.log('✓ User routes registered');
app.use("/api/transactions", createTransactionRouter(io));
console.log('✓ Transaction routes registered');
// Compatibility mount for singular form used by clients/tests
app.use("/api/transaction", createTransactionRouter(io));
app.use("/api/payments", paymentsRouter);
console.log('✓ Payment routes registered');
app.use("/api/recovery", recoveryRouter);
console.log('✓ Recovery routes registered');
app.use("/api/crypto", cryptoRouter);
console.log('✓ Crypto routes registered');
app.use("/api/audit-logs", auditLogsRouter);
console.log('✓ Audit log routes registered');
app.use("/api/analytics", analyticsRouter);
console.log('✓ Analytics routes registered');
// app.use("/api/loans", loansRouter); // DISABLED: Feature under development
// console.log('✓ Loans routes registered');
app.use("/api/system", systemRouter);
console.log('✓ System routes registered');
app.use("/api/rpa", rpaRouter);
console.log('✓ RPA automation routes registered');
app.use("/api/chatbot", chatbotRouter);
console.log('✓ Chatbot routes registered');
app.use("/api/notify", notifyStatsRouter);
console.log('✓ Notification stats routes registered');
app.use("/api/notifications", notificationRouter);
console.log('✓ Notification routes registered');

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Database test endpoint
app.get("/api/db-test", async (req, res) => {
  try {
    const prisma = require('./prismaClient').default;
    
    // Try to query the database
    const userCount = await prisma.user.count();
    
    res.json({
      status: "connected",
      message: "Database connection successful",
      userCount
    });
  } catch (error) {
    console.error("Database test error:", error);
    res.status(500).json({
      status: "error",
      message: "Database connection failed",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined room`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Schedule email fallback cron job (every 15 minutes)
cron.schedule("*/15 * * * *", async () => {
  console.log("⏰ Running scheduled email fallback for unread notifications...");
  try {
    await sendFallbackEmails();
  } catch (error) {
    console.error("❌ Email fallback cron job error:", error);
  }
});

const PORT = config.port || 4000;

console.log(`\n📍 About to listen on port ${PORT}...`);

server.listen(PORT, () => {
  console.log(`✅ Server successfully bound to port ${PORT}`);
  console.log(`🚀 Server running on port ${config.port}`);
  console.log(`📡 Socket.IO server ready`);
  console.log(`✅ All systems go! Ready to accept connections.`);
});

// Error handling
server.on('error', (error: any) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

console.log('✅ Backend server ready and listening...');

// Keep the Node process alive
let heartbeat = setInterval(() => {
  // Silent heartbeat to keep process alive
}, 30000);

// Prevent heartbeat from keeping the process alive indefinitely
heartbeat.unref();

// Debug: Verify server is really listening
setTimeout(() => {
  const addr = server.address();
  console.log(`\n🔍 Debug: Server address info:`, addr);
}, 100);