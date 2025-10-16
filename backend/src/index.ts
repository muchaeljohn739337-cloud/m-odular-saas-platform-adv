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
import loansRouter from "./routes/loans";
import systemRouter from "./routes/system";
import { config } from "./config";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.frontendUrl,
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: config.frontendUrl,
  credentials: true
}));

// Stripe webhook needs raw body - must be before express.json()
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

// Parse JSON for all other routes
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/tokens", tokenRouter);
app.use("/api/rewards", rewardsRouter);
app.use("/api/health", healthRouter);
app.use("/api/users", usersRouter);
app.use("/api/transactions", createTransactionRouter(io));
// Compatibility mount for singular form used by clients/tests
app.use("/api/transaction", createTransactionRouter(io));
app.use("/api/payments", paymentsRouter);
app.use("/api/recovery", recoveryRouter);
app.use("/api/crypto", cryptoRouter);
app.use("/api/loans", loansRouter);
app.use("/api/system", systemRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
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

server.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port}`);
  console.log(`📡 Socket.IO server ready`);
});

// Export io (if needed elsewhere)
export { io };