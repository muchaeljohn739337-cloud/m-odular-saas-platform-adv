import express from "express";
import { Server } from "socket.io";

// Temporary in-memory storage (will be replaced with Prisma once DB is set up)
interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: "credit" | "debit";
  createdAt: Date;
}

const transactions: Transaction[] = [];

export default function createTransactionRouter(io: Server) {
  const router = express.Router();

  // Create new transaction
  router.post("/", async (req, res) => {
    const { userId, amount, type } = req.body;

    try {
      // Validate input
      if (!userId || amount === undefined || !type) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: userId, amount, type"
        });
      }

      // Create transaction
      const transaction: Transaction = {
        id: Date.now().toString(),
        userId,
        amount: typeof amount === "string" ? parseFloat(amount) : Number(amount),
        type,
        createdAt: new Date()
      };

      transactions.push(transaction);

      // Emit real-time update
      try {
        io.to(`user-${userId}`).emit("transaction-created", transaction);
        io.emit("global-transaction", transaction);
      } catch (emitErr) {
        console.warn("Socket emit failed (non-fatal):", emitErr);
      }

      res.status(201).json({
        success: true,
        transaction
      });

    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  });

  // Get transactions for a user
  router.get("/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const userTransactions = transactions.filter(t => t.userId === userId);
      
      res.json({
        success: true,
        transactions: userTransactions
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  });

  // Compatibility route: recent transactions for a user
  router.get("/recent/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const userTransactions = transactions
        .filter(t => t.userId === userId)
        .slice(-10);

      res.json({
        success: true,
        transactions: userTransactions
      });
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  });

  // Get all transactions (for admin/demo purposes)
  router.get("/", async (req, res) => {
    try {
      res.json({
        success: true,
        transactions: transactions.slice(-50) // Return last 50 transactions
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  });

  // Calculate balance for a user
  router.get("/balance/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const userTransactions = transactions.filter(t => t.userId === userId);
      
      const balance = userTransactions.reduce((acc, transaction) => {
        return transaction.type === "credit" 
          ? acc + transaction.amount 
          : acc - transaction.amount;
      }, 0);

      res.json({
        success: true,
        balance: parseFloat(balance.toFixed(2))
      });
    } catch (error) {
      console.error("Error calculating balance:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  });

  return router;
}