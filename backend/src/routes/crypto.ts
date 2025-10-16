import { Router } from "express";
import prisma from "../prismaClient";

const router = Router();

// ============================================
// ADMIN ROUTES - Manage crypto settings
// ============================================

// Get admin crypto settings
router.get("/admin/settings", async (req, res) => {
  try {
    let settings = await prisma.adminSettings.findFirst();
    
    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.adminSettings.create({
        data: {
          processingFeePercent: 2.5,
          minPurchaseAmount: 10,
        },
      });
    }
    
    res.json(settings);
  } catch (error) {
    console.error("Error fetching admin settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// Update admin crypto settings
router.put("/admin/settings", async (req, res) => {
  try {
    const {
      btcAddress,
      ethAddress,
      usdtAddress,
      ltcAddress,
      exchangeRateBtc,
      exchangeRateEth,
      exchangeRateUsdt,
      processingFeePercent,
      minPurchaseAmount,
    } = req.body;

    let settings = await prisma.adminSettings.findFirst();
    
    if (!settings) {
      settings = await prisma.adminSettings.create({
        data: req.body,
      });
    } else {
      settings = await prisma.adminSettings.update({
        where: { id: settings.id },
        data: req.body,
      });
    }
    
    res.json(settings);
  } catch (error) {
    console.error("Error updating admin settings:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

// Get all crypto orders (admin view)
router.get("/admin/orders", async (req, res) => {
  try {
    const { status, cryptoType, limit = 50, offset = 0 } = req.query;
    
    const where: any = {};
    if (status) where.status = status;
    if (cryptoType) where.cryptoType = cryptoType;
    
    const orders = await prisma.cryptoOrder.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: Number(limit),
      skip: Number(offset),
    });
    
    const total = await prisma.cryptoOrder.count({ where });
    
    res.json({ orders, total });
  } catch (error) {
    console.error("Error fetching crypto orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Update crypto order status (admin completes the order)
router.put("/admin/orders/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, txHash, adminNotes } = req.body;
    
    const updateData: any = { status, adminNotes, updatedAt: new Date() };
    
    if (txHash) updateData.txHash = txHash;
    if (status === "completed") updateData.completedAt = new Date();
    if (status === "cancelled") updateData.cancelledAt = new Date();
    
    const order = await prisma.cryptoOrder.update({
      where: { id: orderId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });
    
    res.json(order);
  } catch (error) {
    console.error("Error updating crypto order:", error);
    res.status(500).json({ error: "Failed to update order" });
  }
});

// Get all withdrawal requests (admin view)
router.get("/admin/withdrawals", async (req, res) => {
  try {
    const { status, cryptoType, limit = 50, offset = 0 } = req.query;
    
    const where: any = {};
    if (status) where.status = status;
    if (cryptoType) where.cryptoType = cryptoType;
    
    const withdrawals = await prisma.cryptoWithdrawal.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: Number(limit),
      skip: Number(offset),
    });
    
    const total = await prisma.cryptoWithdrawal.count({ where });
    
    res.json({ withdrawals, total });
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    res.status(500).json({ error: "Failed to fetch withdrawals" });
  }
});

// Approve/Reject withdrawal request (admin action)
router.put("/admin/withdrawals/:withdrawalId", async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const { status, adminNotes, adminApprovedBy, txHash, networkFee } = req.body;
    
    const updateData: any = { status, adminNotes, updatedAt: new Date() };
    
    if (adminApprovedBy) updateData.adminApprovedBy = adminApprovedBy;
    if (txHash) updateData.txHash = txHash;
    if (networkFee) updateData.networkFee = networkFee;
    
    if (status === "approved") updateData.approvedAt = new Date();
    if (status === "rejected") updateData.rejectedAt = new Date();
    if (status === "completed") updateData.completedAt = new Date();
    if (status === "cancelled") updateData.cancelledAt = new Date();
    
    const withdrawal = await prisma.cryptoWithdrawal.update({
      where: { id: withdrawalId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });
    
    res.json(withdrawal);
  } catch (error) {
    console.error("Error updating withdrawal:", error);
    res.status(500).json({ error: "Failed to update withdrawal" });
  }
});

// ============================================
// USER ROUTES - Purchase and withdraw crypto
// ============================================

// Create crypto purchase order
router.post("/purchase", async (req, res) => {
  try {
    const { userId, cryptoType, usdAmount, userWalletAddress } = req.body;
    
    if (!userId || !cryptoType || !usdAmount) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Get admin settings for exchange rates and fees
    const settings = await prisma.adminSettings.findFirst();
    if (!settings) {
      return res.status(500).json({ error: "System not configured. Contact admin." });
    }
    
    // Check minimum purchase amount
    if (Number(usdAmount) < Number(settings.minPurchaseAmount)) {
      return res.status(400).json({
        error: `Minimum purchase amount is $${settings.minPurchaseAmount}`,
      });
    }
    
    // Get user and check balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Calculate processing fee
    const processingFee = (Number(usdAmount) * Number(settings.processingFeePercent)) / 100;
    const totalUsd = Number(usdAmount) + processingFee;
    
    // Check if user has sufficient USD balance
    if (Number(user.usdBalance) < totalUsd) {
      return res.status(400).json({
        error: `Insufficient balance. Need $${totalUsd.toFixed(2)}, have $${Number(user.usdBalance).toFixed(2)}`,
      });
    }
    
    // Get exchange rate based on crypto type
    let exchangeRate = 0;
    let adminAddress = "";
    
    switch (cryptoType.toUpperCase()) {
      case "BTC":
        exchangeRate = Number(settings.exchangeRateBtc || 0);
        adminAddress = settings.btcAddress || "";
        break;
      case "ETH":
        exchangeRate = Number(settings.exchangeRateEth || 0);
        adminAddress = settings.ethAddress || "";
        break;
      case "USDT":
        exchangeRate = Number(settings.exchangeRateUsdt || 1);
        adminAddress = settings.usdtAddress || "";
        break;
      default:
        return res.status(400).json({ error: "Unsupported cryptocurrency" });
    }
    
    if (!exchangeRate || exchangeRate === 0) {
      return res.status(400).json({ error: `Exchange rate not set for ${cryptoType}` });
    }
    
    if (!adminAddress) {
      return res.status(400).json({ error: `Admin wallet not configured for ${cryptoType}` });
    }
    
    // Calculate crypto amount
    const cryptoAmount = Number(usdAmount) / exchangeRate;
    
    // Deduct USD from user balance
    await prisma.user.update({
      where: { id: userId },
      data: {
        usdBalance: {
          decrement: totalUsd,
        },
      },
    });
    
    // Create crypto order
    const order = await prisma.cryptoOrder.create({
      data: {
        userId,
        cryptoType: cryptoType.toUpperCase(),
        usdAmount,
        cryptoAmount,
        exchangeRate,
        processingFee,
        totalUsd,
        status: "pending",
        adminAddress,
        userWalletAddress: userWalletAddress || null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });
    
    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId,
        amount: totalUsd * -1, // Negative for debit
        type: "debit",
        description: `Crypto purchase: ${cryptoAmount.toFixed(8)} ${cryptoType}`,
        status: "completed",
      },
    });
    
    res.json(order);
  } catch (error) {
    console.error("Error creating crypto purchase:", error);
    res.status(500).json({ error: "Failed to create purchase order" });
  }
});

// Request crypto withdrawal
router.post("/withdrawal", async (req, res) => {
  try {
    const { userId, cryptoType, cryptoAmount, withdrawalAddress } = req.body;
    
    if (!userId || !cryptoType || !cryptoAmount || !withdrawalAddress) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    if (Number(cryptoAmount) <= 0) {
      return res.status(400).json({ error: "Amount must be greater than 0" });
    }
    
    // Get admin settings for exchange rate
    const settings = await prisma.adminSettings.findFirst();
    if (!settings) {
      return res.status(500).json({ error: "System not configured" });
    }
    
    // Get exchange rate
    let exchangeRate = 0;
    switch (cryptoType.toUpperCase()) {
      case "BTC":
        exchangeRate = Number(settings.exchangeRateBtc || 0);
        break;
      case "ETH":
        exchangeRate = Number(settings.exchangeRateEth || 0);
        break;
      case "USDT":
        exchangeRate = Number(settings.exchangeRateUsdt || 1);
        break;
      default:
        return res.status(400).json({ error: "Unsupported cryptocurrency" });
    }
    
    if (!exchangeRate || exchangeRate === 0) {
      return res.status(400).json({ error: `Exchange rate not available for ${cryptoType}` });
    }
    
    // Calculate USD equivalent
    const usdEquivalent = Number(cryptoAmount) * exchangeRate;
    
    // Create withdrawal request
    const withdrawal = await prisma.cryptoWithdrawal.create({
      data: {
        userId,
        cryptoType: cryptoType.toUpperCase(),
        cryptoAmount,
        usdEquivalent,
        withdrawalAddress,
        status: "pending",
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });
    
    res.json(withdrawal);
  } catch (error) {
    console.error("Error creating withdrawal request:", error);
    res.status(500).json({ error: "Failed to create withdrawal request" });
  }
});

// Get user's crypto orders
router.get("/orders/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const orders = await prisma.cryptoOrder.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    
    res.json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get user's withdrawal requests
router.get("/withdrawals/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const withdrawals = await prisma.cryptoWithdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    
    res.json(withdrawals);
  } catch (error) {
    console.error("Error fetching user withdrawals:", error);
    res.status(500).json({ error: "Failed to fetch withdrawals" });
  }
});

// Get current exchange rates
router.get("/rates", async (req, res) => {
  try {
    const settings = await prisma.adminSettings.findFirst();
    
    if (!settings) {
      return res.status(404).json({ error: "Exchange rates not configured" });
    }
    
    res.json({
      BTC: settings.exchangeRateBtc,
      ETH: settings.exchangeRateEth,
      USDT: settings.exchangeRateUsdt,
      processingFeePercent: settings.processingFeePercent,
      minPurchaseAmount: settings.minPurchaseAmount,
    });
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    res.status(500).json({ error: "Failed to fetch rates" });
  }
});

export default router;

