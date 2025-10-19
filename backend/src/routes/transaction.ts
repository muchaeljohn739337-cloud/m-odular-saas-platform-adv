import express from "express";
import { Server } from "socket.io";
import { createNotification } from "../services/notificationService";
import { parseAmount, serializePrismaObject } from "../utils/serializers";

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: "credit" | "debit";
  createdAt: Date;
  currency?: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

const transactions: Transaction[] = [];
let ioRef: Server | null = null;

export const setTransactionSocketIO = (io: Server) => {
  ioRef = io;
};

interface RecordTransactionOptions {
  userId: string;
  amount: number | string;
  type: "credit" | "debit";
  currency?: string;
  source?: string;
  metadata?: Record<string, unknown>;
  notificationTitle?: string;
  notificationMessage?: string;
}

export const recordTransaction = async ({
  userId,
  amount,
  type,
  currency,
  source,
  metadata,
  notificationTitle,
  notificationMessage,
}: RecordTransactionOptions): Promise<Transaction> => {
  const numericAmount = parseAmount(amount);
  if (numericAmount === null || numericAmount <= 0) {
    throw new Error("INVALID_TRANSACTION_AMOUNT");
  }
  const transaction: Transaction = {
    id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
    userId,
    amount: numericAmount,
    type,
    createdAt: new Date(),
    currency,
    source,
    metadata,
  };

  transactions.push(transaction);

  if (ioRef) {
    try {
      ioRef.to(`user-${userId}`).emit("transaction-created", transaction);
      ioRef.emit("global-transaction", transaction);
    } catch (emitErr) {
      console.warn("Socket emit failed (non-fatal):", emitErr);
    }
  }

  try {
    await createNotification({
      userId,
      type: "all",
      priority: numericAmount > 1000 ? "high" : "normal",
      category: "transaction",
      title:
        notificationTitle || (type === "credit" ? "Funds Received" : "Funds Sent"),
      message:
        notificationMessage ||
        `${type === "credit" ? "Received" : "Sent"} $${numericAmount.toFixed(2)}`,
      data: {
        transactionId: transaction.id,
        amount: numericAmount,
        type,
        currency,
        source,
        ...(metadata || {}),
      },
    });
  } catch (notifyErr) {
    console.warn("Notification creation failed (non-fatal):", notifyErr);
  }

  return transaction;
};

export default function createTransactionRouter(io: Server) {
  const router = express.Router();
  setTransactionSocketIO(io);

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

      const transaction = await recordTransaction({ userId, amount, type });

      res.status(201).json({
        success: true,
        transaction
      });

    } catch (error) {
      if (error instanceof Error && error.message === "INVALID_TRANSACTION_AMOUNT") {
        return res.status(400).json({
          success: false,
          error: "Invalid transaction amount"
        });
      }
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

  // Calculate balance for a user with detailed breakdown
  router.get("/balance/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const userTransactions = transactions.filter(t => t.userId === userId);
      
      // Calculate main balance (credits - debits)
      const balance_main = userTransactions.reduce((acc, transaction) => {
        return transaction.type === "credit" 
          ? acc + transaction.amount 
          : acc - transaction.amount;
      }, 0);

      // Calculate bonus/earnings (15% of all credits)
      const totalCredits = userTransactions
        .filter(t => t.type === "credit")
        .reduce((sum, t) => sum + t.amount, 0);
      
      const bonus_amount = totalCredits * 0.15; // 15% bonus on credits

      // Referral rewards (placeholder - can be customized)
      const referral_amount = 0;

      // Total available balance
      const total = balance_main + bonus_amount + referral_amount;

      res.json({
        success: true,
        userId,
        balance_main: parseFloat(balance_main.toFixed(2)),
        earnings: parseFloat(bonus_amount.toFixed(2)), // Maps to bonus_amount
        referral: parseFloat(referral_amount.toFixed(2)), // Maps to referral_amount
        total: parseFloat(total.toFixed(2)),
        // Legacy compatibility
        balance: parseFloat(total.toFixed(2))
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