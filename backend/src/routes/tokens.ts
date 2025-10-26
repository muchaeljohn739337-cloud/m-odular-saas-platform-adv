import { Router } from "express";
import prisma from "../prismaClient";
import { authenticateToken } from "../middleware/auth";
import { Decimal } from "@prisma/client/runtime/library";
import { serializeDecimalFields } from "../utils/decimal";
import { Server as SocketServer } from "socket.io";

const router = Router();

// Socket.IO instance (injected from index.ts)
let io: SocketServer | null = null;

export function setTokenSocketIO(socketServer: SocketServer) {
  io = socketServer;
  console.log("✅ Socket.IO injected into token service");
}

router.get("/balance/:userId", authenticateToken as any, async (req, res) => {
  try {
    const { userId } = req.params;
    
    let wallet = await prisma.tokenWallet.findUnique({
      where: { userId },
    });
    
    if (!wallet) {
      wallet = await prisma.tokenWallet.create({
        data: { userId },
      });
    }
    
    res.json(serializeDecimalFields(wallet));
  } catch (error: any) {
    console.error("[TOKENS] Error fetching balance:", error);
    res.status(500).json({ error: "Failed to fetch balance" });
  }
});

router.get("/history/:userId", authenticateToken as any, async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = Math.min(100, Number(req.query.limit) || 50);
    const offset = Math.max(0, Number(req.query.offset) || 0);
    
    const wallet = await prisma.tokenWallet.findUnique({
      where: { userId },
    });
    
    if (!wallet) {
      return res.json({ transactions: [], total: 0 });
    }
    
    const [transactions, total] = await Promise.all([
      prisma.tokenTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.tokenTransaction.count({
        where: { walletId: wallet.id },
      }),
    ]);
    
    res.json({
      transactions: transactions.map(t => serializeDecimalFields(t)),
      total,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error("[TOKENS] Error fetching history:", error);
    res.status(500).json({ error: "Failed to fetch transaction history" });
  }
});

router.post("/transfer", authenticateToken as any, async (req, res) => {
  try {
    const { fromUserId, toUserId, amount, description } = req.body;
    
    if (!fromUserId || !toUserId || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const transferAmount = new Decimal(amount);
    
    if (transferAmount.lte(0)) {
      return res.status(400).json({ error: "Amount must be positive" });
    }
    
    const result = await prisma.$transaction(async (tx) => {
      let fromWallet = await tx.tokenWallet.findUnique({
        where: { userId: fromUserId },
      });
      
      if (!fromWallet) {
        fromWallet = await tx.tokenWallet.create({
          data: { userId: fromUserId },
        });
      }
      
      if (fromWallet.balance.lt(transferAmount)) {
        throw new Error("Insufficient balance");
      }
      
      let toWallet = await tx.tokenWallet.findUnique({
        where: { userId: toUserId },
      });
      
      if (!toWallet) {
        toWallet = await tx.tokenWallet.create({
          data: { userId: toUserId },
        });
      }
      
      await tx.tokenWallet.update({
        where: { id: fromWallet.id },
        data: { balance: { decrement: transferAmount } },
      });
      
      await tx.tokenWallet.update({
        where: { id: toWallet.id },
        data: {
          balance: { increment: transferAmount },
          lifetimeEarned: { increment: transferAmount },
        },
      });
      
      const fromTx = await tx.tokenTransaction.create({
        data: {
          walletId: fromWallet.id,
          amount: transferAmount.neg(),
          type: "transfer",
          status: "completed",
          description: description || `Transfer to ${toUserId}`,
          toAddress: toUserId,
          metadata: JSON.stringify({ toUserId, timestamp: new Date().toISOString() }),
        },
      });
      
      const toTx = await tx.tokenTransaction.create({
        data: {
          walletId: toWallet.id,
          amount: transferAmount,
          type: "transfer",
          status: "completed",
          description: description || `Transfer from ${fromUserId}`,
          fromAddress: fromUserId,
          metadata: JSON.stringify({ fromUserId, timestamp: new Date().toISOString() }),
        },
      });
      
      return { fromTx, toTx, fromWallet, toWallet };
    });
    
    // Emit Socket.IO events to notify users
    if (io) {
      io.to(`user-${fromUserId}`).emit("token:transfer", {
        type: "sent",
        amount: transferAmount.toString(),
        to: toUserId,
        transactionId: result.fromTx.id,
      });
      
      io.to(`user-${toUserId}`).emit("token:transfer", {
        type: "received",
        amount: transferAmount.toString(),
        from: fromUserId,
        transactionId: result.toTx.id,
      });
    }
    
    res.json({
      success: true,
      transactionId: result.fromTx.id,
      message: "Transfer completed successfully",
    });
  } catch (error: any) {
    console.error("[TOKENS] Error processing transfer:", error);
    res.status(500).json({ error: error.message || "Failed to process transfer" });
  }
});

export default router;
