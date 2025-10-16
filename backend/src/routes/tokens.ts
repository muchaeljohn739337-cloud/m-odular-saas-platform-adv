import express from "express";
import prisma from "../prismaClient";
import { Decimal } from "@prisma/client/runtime/library";

const router = express.Router();

// ============================================
// TOKEN WALLET ENDPOINTS
// ============================================

/**
 * GET /api/tokens/balance/:userId
 * Get token wallet balance for a user
 */
router.get("/balance/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    let wallet = await prisma.tokenWallet.findUnique({
      where: { userId },
    });
    
    // Create wallet if doesn't exist
    if (!wallet) {
      wallet = await prisma.tokenWallet.create({
        data: { userId },
      });
    }
    
    res.json({
      balance: wallet.balance.toString(),
      lockedBalance: wallet.lockedBalance.toString(),
      lifetimeEarned: wallet.lifetimeEarned.toString(),
      tokenType: wallet.tokenType,
      availableBalance: wallet.balance.minus(wallet.lockedBalance).toString(),
    });
  } catch (error) {
    console.error("Error fetching token balance:", error);
    res.status(500).json({ error: "Failed to fetch balance" });
  }
});

/**
 * GET /api/tokens/history/:userId
 * Get token transaction history
 */
router.get("/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const type = req.query.type as string;
    
    const wallet = await prisma.tokenWallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          where: type ? { type } : undefined,
          orderBy: { createdAt: "desc" },
          take: limit,
        },
      },
    });
    
    if (!wallet) {
      return res.json({ transactions: [] });
    }
    
    const formattedTransactions = wallet.transactions.map(tx => ({
      ...tx,
      amount: tx.amount.toString(),
    }));
    
    res.json({ transactions: formattedTransactions });
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

/**
 * POST /api/tokens/withdraw
 * Withdraw tokens to external address
 */
router.post("/withdraw", async (req, res) => {
  try {
    const { userId, amount, toAddress } = req.body;
    
    if (!userId || !amount || !toAddress) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const wallet = await prisma.tokenWallet.findUnique({
      where: { userId },
    });
    
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }
    
    const withdrawAmount = new Decimal(amount);
    const availableBalance = wallet.balance.minus(wallet.lockedBalance);
    
    if (availableBalance.lt(withdrawAmount)) {
      return res.status(400).json({ 
        error: "Insufficient balance",
        available: availableBalance.toString(),
        requested: withdrawAmount.toString()
      });
    }
    
    // Simulate withdrawal fee (1%)
    const fee = withdrawAmount.mul(0.01);
    const netAmount = withdrawAmount.minus(fee);
    
    // Update wallet and create transaction
    const result = await prisma.$transaction([
      prisma.tokenWallet.update({
        where: { userId },
        data: {
          balance: { decrement: withdrawAmount },
        },
      }),
      prisma.tokenTransaction.create({
        data: {
          walletId: wallet.id,
          amount: withdrawAmount,
          type: "withdraw",
          description: `Withdrawal to ${toAddress}`,
          toAddress,
          status: "completed",
          metadata: {
            fee: fee.toString(),
            netAmount: netAmount.toString(),
            timestamp: new Date().toISOString(),
          },
        },
      }),
    ]);
    
    res.json({
      success: true,
      newBalance: result[0].balance.toString(),
      transaction: {
        ...result[1],
        amount: result[1].amount.toString(),
      },
      fee: fee.toString(),
      netAmount: netAmount.toString(),
    });
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    res.status(500).json({ error: "Failed to process withdrawal" });
  }
});

/**
 * POST /api/tokens/cashout
 * Cash out tokens (convert to fiat)
 */
router.post("/cashout", async (req, res) => {
  try {
    const { userId, amount } = req.body;
    
    if (!userId || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const wallet = await prisma.tokenWallet.findUnique({
      where: { userId },
    });
    
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }
    
    const cashoutAmount = new Decimal(amount);
    const availableBalance = wallet.balance.minus(wallet.lockedBalance);
    
    if (availableBalance.lt(cashoutAmount)) {
      return res.status(400).json({ error: "Insufficient balance" });
    }
    
    // Exchange rate: 1 ADVANCIA = $0.10 USD
    const exchangeRate = 0.10;
    const fiatAmount = cashoutAmount.mul(exchangeRate);
    
    // Processing fee (2% for cashout)
    const fee = cashoutAmount.mul(0.02);
    const netTokens = cashoutAmount.minus(fee);
    const netFiat = netTokens.mul(exchangeRate);
    
    const result = await prisma.$transaction([
      prisma.tokenWallet.update({
        where: { userId },
        data: {
          balance: { decrement: cashoutAmount },
        },
      }),
      prisma.tokenTransaction.create({
        data: {
          walletId: wallet.id,
          amount: cashoutAmount,
          type: "cashout",
          description: `Cash out: $${netFiat.toFixed(2)} USD`,
          metadata: {
            fiatAmount: netFiat.toString(),
            rate: exchangeRate,
            fee: fee.toString(),
            currency: "USD",
            timestamp: new Date().toISOString(),
          },
          status: "completed",
        },
      }),
    ]);
    
    res.json({
      success: true,
      tokenAmount: cashoutAmount.toString(),
      fiatAmount: netFiat.toString(),
      fee: fee.toString(),
      exchangeRate,
      newBalance: result[0].balance.toString(),
      transaction: {
        ...result[1],
        amount: result[1].amount.toString(),
      },
    });
  } catch (error) {
    console.error("Error processing cashout:", error);
    res.status(500).json({ error: "Failed to process cashout" });
  }
});

/**
 * POST /api/tokens/transfer
 * Transfer tokens to another user
 */
router.post("/transfer", async (req, res) => {
  try {
    const { fromUserId, toUserId, amount, message } = req.body;
    
    if (!fromUserId || !toUserId || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    if (fromUserId === toUserId) {
      return res.status(400).json({ error: "Cannot transfer to yourself" });
    }
    
    const [fromWallet, toWallet] = await Promise.all([
      prisma.tokenWallet.findUnique({ where: { userId: fromUserId } }),
      prisma.tokenWallet.findUnique({ where: { userId: toUserId } }),
    ]);
    
    if (!fromWallet) {
      return res.status(404).json({ error: "Sender wallet not found" });
    }
    
    const transferAmount = new Decimal(amount);
    const availableBalance = fromWallet.balance.minus(fromWallet.lockedBalance);
    
    if (availableBalance.lt(transferAmount)) {
      return res.status(400).json({ error: "Insufficient balance" });
    }
    
    // Create recipient wallet if it doesn't exist
    let recipientWallet = toWallet;
    if (!toWallet) {
      recipientWallet = await prisma.tokenWallet.create({
        data: { userId: toUserId },
      });
    }
    
    // Execute transfer
    const result = await prisma.$transaction([
      // Deduct from sender
      prisma.tokenWallet.update({
        where: { userId: fromUserId },
        data: { balance: { decrement: transferAmount } },
      }),
      // Add to recipient
      prisma.tokenWallet.update({
        where: { userId: toUserId },
        data: { balance: { increment: transferAmount } },
      }),
      // Record sender transaction
      prisma.tokenTransaction.create({
        data: {
          walletId: fromWallet.id,
          amount: transferAmount,
          type: "transfer",
          description: message || `Transfer to user ${toUserId}`,
          toAddress: toUserId,
          status: "completed",
        },
      }),
      // Record recipient transaction
      prisma.tokenTransaction.create({
        data: {
          walletId: recipientWallet!.id,
          amount: transferAmount,
          type: "transfer",
          description: message || `Transfer from user ${fromUserId}`,
          fromAddress: fromUserId,
          status: "completed",
        },
      }),
    ]);
    
    res.json({
      success: true,
      senderNewBalance: result[0].balance.toString(),
      recipientNewBalance: result[1].balance.toString(),
      amount: transferAmount.toString(),
    });
  } catch (error) {
    console.error("Error processing transfer:", error);
    res.status(500).json({ error: "Failed to process transfer" });
  }
});

/**
 * POST /api/tokens/award-bonus
 * Award bonus tokens (called after credit transactions)
 */
router.post("/award-bonus", async (req, res) => {
  try {
    const { userId, transactionAmount, percentage = 15 } = req.body;
    
    if (!userId || !transactionAmount) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const bonusAmount = new Decimal(transactionAmount).mul(percentage / 100);
    
    let wallet = await prisma.tokenWallet.findUnique({
      where: { userId },
    });
    
    if (!wallet) {
      wallet = await prisma.tokenWallet.create({
        data: { userId },
      });
    }
    
    const result = await prisma.$transaction([
      prisma.tokenWallet.update({
        where: { userId },
        data: {
          balance: { increment: bonusAmount },
          lifetimeEarned: { increment: bonusAmount },
        },
      }),
      prisma.tokenTransaction.create({
        data: {
          walletId: wallet.id,
          amount: bonusAmount,
          type: "bonus",
          description: `${percentage}% bonus on transaction`,
          metadata: {
            baseAmount: transactionAmount,
            percentage,
            calculatedAt: new Date().toISOString(),
          },
          status: "completed",
        },
      }),
    ]);
    
    console.log(`💰 Awarded ${bonusAmount} tokens (${percentage}%) to user ${userId}`);
    
    res.json({
      success: true,
      bonusAmount: bonusAmount.toString(),
      newBalance: result[0].balance.toString(),
      lifetimeEarned: result[0].lifetimeEarned.toString(),
    });
  } catch (error) {
    console.error("Error awarding bonus:", error);
    res.status(500).json({ error: "Failed to award bonus" });
  }
});

/**
 * GET /api/tokens/exchange-rate
 * Get current token exchange rate
 */
router.get("/exchange-rate", (req, res) => {
  // In production, this would fetch from an exchange API
  res.json({
    tokenSymbol: "ADVANCIA",
    rates: {
      USD: 0.10,
      EUR: 0.09,
      GBP: 0.08,
    },
    lastUpdated: new Date().toISOString(),
    marketCap: "1000000",
    volume24h: "50000",
  });
});

/**
 * GET /api/tokens/stats/:userId
 * Get comprehensive token statistics
 */
router.get("/stats/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const wallet = await prisma.tokenWallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
    
    if (!wallet) {
      return res.json({
        totalEarned: "0",
        totalSpent: "0",
        totalTransactions: 0,
        averageTransaction: "0",
      });
    }
    
    const earned = wallet.transactions
      .filter(tx => ["earn", "bonus", "reward"].includes(tx.type))
      .reduce((sum, tx) => sum.plus(tx.amount), new Decimal(0));
    
    const spent = wallet.transactions
      .filter(tx => ["withdraw", "cashout", "transfer"].includes(tx.type))
      .reduce((sum, tx) => sum.plus(tx.amount), new Decimal(0));
    
    res.json({
      balance: wallet.balance.toString(),
      lifetimeEarned: wallet.lifetimeEarned.toString(),
      totalEarned: earned.toString(),
      totalSpent: spent.toString(),
      totalTransactions: wallet.transactions.length,
      averageTransaction: wallet.transactions.length > 0
        ? earned.plus(spent).div(wallet.transactions.length).toString()
        : "0",
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
