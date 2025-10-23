import dotenv from "dotenv";
import http from "http";
import express from "express";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import app from "./app";
import { config } from "./config";
import { setSocketIO as setNotificationSocket } from "./services/notificationService";
import { setTransactionSocketIO } from "./routes/transactions";
import prisma from "./prismaClient";
import paymentsRouter from "./routes/payments";
import debitCardRouter, { setDebitCardSocketIO } from "./routes/debitCard";
import medbedsRouter, { setMedbedsSocketIO } from "./routes/medbeds";
import supportRouter, { setSupportSocketIO } from "./routes/support";
import analyticsRouter from "./routes/analytics";
import aiAnalyticsRouter from "./routes/aiAnalytics";
import authRouter from "./routes/auth";
import adminUsersRouter, { setAdminUsersSocketIO } from "./routes/users";
import transactionsRouter from "./routes/transactions";
import chatRouter, { setChatSocketIO } from "./routes/chat";
import adminRouter from "./routes/admin";
import consultationRouter from "./routes/consultation";
import systemRouter from "./routes/system";
import marketingRouter from "./routes/marketing";
import subscribersRouter from "./routes/subscribers";
import securityLevelRouter from "./routes/securityLevel";
import ipBlocksRouter from "./routes/ipBlocks";
import authAdminRouter, {
  setBroadcastSessions as setAuthBroadcast,
} from "./routes/authAdmin";
import sessionsRouter, {
  setBroadcastSessions as setSessionsBroadcast,
} from "./routes/sessions";
import withdrawalsRouter, { setWithdrawalSocketIO } from "./routes/withdrawals";
import oalRouter, { setOALSocketIO } from "./routes/oal";
import { activityLogger } from "./middleware/activityLogger";
import { rateLimit, validateInput } from "./middleware/security";
import { handleStripeWebhook, setPaymentsSocketIO } from "./routes/payments";
import { activeSessions } from "./routes/authAdmin";

// Load environment variables
dotenv.config();

// Create HTTP server and attach Socket.IO
// Create server
const server = http.createServer(app);

// Trust proxy (needed when behind Cloudflare/NGINX for correct IPs and HTTPS)
app.set("trust proxy", 1);

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
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

// JSON parser and common middlewares AFTER webhook
app.use(express.json());
app.use(validateInput);
app.use(activityLogger);
app.use("/api", rateLimit({ windowMs: 60_000, maxRequests: 300 }));

// Health check endpoint (critical for production monitoring)
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    version: "1.0.0",
  });
});

// Regular routes
app.use("/api/payments", paymentsRouter);
app.use("/api/debit-card", debitCardRouter);
app.use("/api/medbeds", medbedsRouter);
app.use("/api/support", supportRouter);
app.use("/api/admin/analytics", analyticsRouter);
app.use("/api/ai-analytics", aiAnalyticsRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminUsersRouter);
app.use("/api/admin", adminRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/chat", chatRouter);
app.use("/api/consultation", consultationRouter);
app.use("/api/system", systemRouter);
app.use("/api/marketing", marketingRouter);
app.use("/api/subscribers", subscribersRouter);
app.use("/api/admin/security", securityLevelRouter);
app.use("/api/admin/ip-blocks", ipBlocksRouter);
app.use("/api/auth/admin", authAdminRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/withdrawals", withdrawalsRouter);
app.use("/api/oal", oalRouter);

const io = new SocketIOServer(server, {
  cors: {
    origin: config.allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.IO connection handling
// JWT auth for Socket.IO handshake
io.use(async (socket, next) => {
  try {
    const token =
      (socket.handshake.auth?.token as string) ||
      (socket.handshake.query?.token as string);
    const guestSessionId =
      (socket.handshake.auth?.guestSessionId as string) ||
      (socket.handshake.query?.guestSessionId as string);
    if (!token) {
      // Allow unauthenticated chat listeners for guest chat sessions
      if (
        guestSessionId &&
        typeof guestSessionId === "string" &&
        guestSessionId.length >= 6
      ) {
        (socket as any).data = { guestSessionId };
        return next();
      }
      return next(new Error("Auth token or guestSessionId required"));
    }
    const cleaned = token.startsWith("Bearer ") ? token.split(" ")[1] : token;
    const payload = jwt.verify(cleaned, config.jwtSecret) as {
      userId: string;
      email?: string;
    };
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true, active: true },
    });
    if (!user || user.active === false)
      return next(new Error("Account disabled"));
    (socket as any).data = { userId: user.id, role: user.role };
    next();
  } catch (e) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  const { userId, role, guestSessionId } = (socket as any).data || {};
  if (userId) socket.join(`user-${userId}`);
  if (role === "ADMIN") socket.join("admins");
  if (guestSessionId) socket.join(`chat-session-${guestSessionId}`);

  // Optional: clients may request to join again with validation
  socket.on("join-room", (reqUserId: string) => {
    if (reqUserId && reqUserId === userId) socket.join(`user-${userId}`);
  });

  // Broadcast session updates to admins
  socket.emit("sessions:update", activeSessions);
});

// Broadcast sessions update helper
export function broadcastSessions() {
  io.to("admins").emit("sessions:update", activeSessions);
}

// Inject Socket.IO into services/routers that need it
setNotificationSocket(io);
setTransactionSocketIO(io);
setAdminUsersSocketIO(io);
setDebitCardSocketIO(io);
setMedbedsSocketIO(io);
setChatSocketIO(io);
setSupportSocketIO(io);
setPaymentsSocketIO(io);
setWithdrawalSocketIO(io);
setOALSocketIO(io);

// Wire up session broadcasting
setAuthBroadcast(broadcastSessions);
setSessionsBroadcast(broadcastSessions);

// Start server
const PORT = config.port || process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
