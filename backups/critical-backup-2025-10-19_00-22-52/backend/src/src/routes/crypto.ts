import { Router, Request, Response } from "express";
import prisma from "../prismaClient";
import { authenticateToken, requireAdmin, AuthRequest } from "../middleware/auth";
import { createNotification } from "../services/notificationService";
import { validateCryptoAddress } from "../utils/walletValidation";
import axios from "axios";

const router = Router();

// ============================================
// LIVE CRYPTO PRICES (BINANCE API)
// ============================================

/**
 * GET /api/crypto/prices
 * Get live crypto prices from Binance
 */
router.get("/prices", async (req: Request, res: Response) => {
  try {
    const symbols = ["BTCUSDT", "ETHUSDT", "LTCUSDT"];
    const prices: Record<string, number> = {};

    for (const symbol of symbols) {
      try {
        const response = await axios.get(
          `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
        );
        const cryptoName = symbol.replace("USDT", "");
        prices[cryptoName] = parseFloat(response.data.price);
      } catch (error) {
        console.error(`Error fetching ${symbol} price:`, error);
        prices[symbol.replace("USDT", "")] = 0;
      }
    }

    prices["USDT"] = 1.0;

    res.json({ prices, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Error fetching crypto prices:", error);
    res.status(500).json({ error: "Failed to fetch crypto prices" });
  }
});

// ============================================
// ADMIN ROUTES - Manage crypto settings
// ============================================

// Get admin crypto settings
router.get("/admin/settings", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
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
router.put("/admin/settings", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
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
router.get("/admin/orders", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
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

// Update crypto order status (admin completes/rejects the order)
router.put("/admin/orders/:orderId", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status, txHash, adminNotes } = req.body;
    const adminId = req.user!.userId;
    
    const order = await prisma.cryptoOrder.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({ error: `Order is already ${order.status}` });
    }

    const updateData: any = { status, adminNotes, updatedAt: new Date() };
    
    if (txHash) updateData.txHash = txHash;
    if (status === "completed") updateData.completedAt = new Date();
    if (status === "cancelled") updateData.cancelledAt = new Date();
    
    // If approving purchase, credit user's TokenWallet
    if (status === "completed") {
      let wallet = await prisma.tokenWallet.findUnique({
        where: { userId: order.userId },
      });

      if (!wallet) {
        wallet = await prisma.tokenWallet.create({
          data: { userId: order.userId },
        });
      }

      const cryptoField =
        order.cryptoType === "BTC" ? "btcBalance" :
        order.cryptoType === "ETH" ? "ethBalance" :
        order.cryptoType === "USDT" ? "usdtBalance" :
        order.cryptoType === "LTC" ? "ltcBalance" : null;

      if (cryptoField) {
        await prisma.tokenWallet.update({
          where: { id: wallet.id },
          data: {
            [cryptoField]: {
              increment: Number(order.cryptoAmount),
            },
          },
        });
      }

      await createNotification({
        userId: order.userId,
        type: "in-app",
        category: "transaction",
        title: "Crypto Purchase Approved! 🎉",
        message: `Your ${order.cryptoAmount} ${order.cryptoType} has been credited to your wallet.`,
        priority: "high",
      });
    } else if (status === "cancelled") {
      // Refund USD to user
      await prisma.user.update({
        where: { id: order.userId },
        data: {
          usdBalance: {
            increment: Number(order.totalUsd),
          },
        },
      });

      await createNotification({
        userId: order.userId,
        type: "in-app",
        category: "transaction",
        title: "Crypto Purchase Cancelled",
        message: `Your ${order.cryptoType} purchase has been cancelled. $${order.totalUsd} has been refunded.`,
        priority: "normal",
      });
    }

    const updatedOrder = await prisma.cryptoOrder.update({
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
    
    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating crypto order:", error);
    res.status(500).json({ error: "Failed to update order" });
  }
});

// Get all withdrawal requests (admin view)
router.get("/admin/withdrawals", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
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
router.put("/admin/withdrawals/:withdrawalId", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { withdrawalId } = req.params;
    const { status, adminNotes, txHash, networkFee } = req.body;
    const adminId = req.user!.userId;
    
    const withdrawal = await prisma.cryptoWithdrawal.findUnique({
      where: { id: withdrawalId },
      include: { user: true },
    });

    if (!withdrawal) {
      return res.status(404).json({ error: "Withdrawal not found" });
    }

    if (withdrawal.status !== "pending") {
      return res.status(400).json({ error: `Withdrawal is already ${withdrawal.status}` });
    }

    const updateData: any = { 
      status, 
      adminNotes, 
      adminApprovedBy: adminId,
      updatedAt: new Date() 
    };
    
    if (txHash) updateData.txHash = txHash;
    if (networkFee) updateData.networkFee = networkFee;
    
    if (status === "approved" || status === "completed") {
      updateData.approvedAt = new Date();
      if (status === "completed") updateData.completedAt = new Date();

      await createNotification({
        userId: withdrawal.userId,
        type: "in-app",
        category: "transaction",
        title: "Withdrawal Approved! 🎉",
        message: `Your withdrawal of ${withdrawal.cryptoAmount} ${withdrawal.cryptoType} has been processed.${txHash ? ` TX: ${txHash}` : ""}`,
        priority: "high",
      });
    } else if (status === "rejected") {
      updateData.rejectedAt = new Date();

      // Return crypto to user's wallet
      const cryptoField =
        withdrawal.cryptoType === "BTC" ? "btcBalance" :
        withdrawal.cryptoType === "ETH" ? "ethBalance" :
        withdrawal.cryptoType === "USDT" ? "usdtBalance" :
        withdrawal.cryptoType === "LTC" ? "ltcBalance" : null;

      if (cryptoField) {
        await prisma.tokenWallet.update({
          where: { userId: withdrawal.userId },
          data: {
            [cryptoField]: {
              increment: Number(withdrawal.cryptoAmount),
            },
          },
        });
      }

      await createNotification({
        userId: withdrawal.userId,
        type: "in-app",
        category: "transaction",
        title: "Withdrawal Request Rejected",
        message: `Your withdrawal of ${withdrawal.cryptoAmount} ${withdrawal.cryptoType} was rejected. Funds returned. Reason: ${adminNotes || "Admin decision"}`,
        priority: "high",
      });
    } else if (status === "cancelled") {
      updateData.cancelledAt = new Date();
    }

    const updatedWithdrawal = await prisma.cryptoWithdrawal.update({
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
    
    res.json(updatedWithdrawal);
  } catch (error) {
    console.error("Error updating withdrawal:", error);
    res.status(500).json({ error: "Failed to update withdrawal" });
  }
});

// ============================================
// USER ROUTES - Purchase and withdraw crypto
// ============================================

// Create crypto purchase order
router.post("/purchase", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { cryptoType, usdAmount, userWalletAddress } = req.body;
    const userId = req.user!.userId;
    
    if (!cryptoType || !usdAmount) {
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
    
    // Get live exchange rate from Binance
    let exchangeRate = 0;
    let adminAddress = "";
    
    try {
      if (cryptoType.toUpperCase() !== "USDT") {
        const priceResponse = await axios.get(
          `https://api.binance.com/api/v3/ticker/price?symbol=${cryptoType.toUpperCase()}USDT`
        );
        exchangeRate = parseFloat(priceResponse.data.price);
      } else {
        exchangeRate = 1.0;
      }
    } catch (error) {
      // Fallback to admin settings if Binance API fails
      switch (cryptoType.toUpperCase()) {
        case "BTC":
          exchangeRate = Number(settings.exchangeRateBtc || 0);
          break;
        case "ETH":
          exchangeRate = Number(settings.exchangeRateEth || 0);
          break;
        case "USDT":
          exchangeRate = 1.0;
          break;
      }
    }
    
    // Get admin wallet address
    switch (cryptoType.toUpperCase()) {
      case "BTC":
        adminAddress = settings.btcAddress || "";
        break;
      case "ETH":
        adminAddress = settings.ethAddress || "";
        break;
      case "USDT":
        adminAddress = settings.usdtAddress || "";
        break;
      case "LTC":
        adminAddress = settings.ltcAddress || "";
        break;
      default:
        return res.status(400).json({ error: "Unsupported cryptocurrency" });
    }
    
    if (!exchangeRate || exchangeRate === 0) {
      return res.status(400).json({ error: `Exchange rate not available for ${cryptoType}` });
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
        amount: totalUsd * -1,
        type: "debit",
        description: `Crypto purchase: ${cryptoAmount.toFixed(8)} ${cryptoType}`,
        status: "completed",
      },
    });
    
    // Notify user
    await createNotification({
      userId,
      type: "in-app",
      category: "transaction",
      title: "Crypto Purchase Order Created",
      message: `Your order for ${cryptoAmount.toFixed(8)} ${cryptoType} is pending admin approval.`,
      priority: "normal",
    });

    // Notify admins
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        type: "in-app",
        category: "admin",
        title: "New Crypto Purchase Order",
        message: `${user.email} wants to buy ${cryptoAmount.toFixed(8)} ${cryptoType} for $${usdAmount}`,
        priority: "high",
      });
    }
    
    res.json(order);
  } catch (error) {
    console.error("Error creating crypto purchase:", error);
    res.status(500).json({ error: "Failed to create purchase order" });
  }
});

// Request crypto withdrawal
router.post("/withdrawal", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { cryptoType, cryptoAmount, withdrawalAddress } = req.body;
    const userId = req.user!.userId;
    
    if (!cryptoType || !cryptoAmount || !withdrawalAddress) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    if (Number(cryptoAmount) <= 0) {
      return res.status(400).json({ error: "Amount must be greater than 0" });
    }

    // Validate wallet address
    const validation = validateCryptoAddress(withdrawalAddress, cryptoType);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error || "Invalid wallet address" });
    }
    
    // Get user's wallet
    const wallet = await prisma.tokenWallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      return res.status(400).json({ error: "Wallet not found" });
    }

    // Check crypto balance
    const cryptoField =
      cryptoType.toUpperCase() === "BTC" ? "btcBalance" :
      cryptoType.toUpperCase() === "ETH" ? "ethBalance" :
      cryptoType.toUpperCase() === "USDT" ? "usdtBalance" :
      cryptoType.toUpperCase() === "LTC" ? "ltcBalance" : null;

    if (!cryptoField) {
      return res.status(400).json({ error: "Unsupported crypto type" });
    }

    const currentBalance = Number((wallet as any)[cryptoField] || 0);

    if (currentBalance < Number(cryptoAmount)) {
      return res.status(400).json({
        error: "Insufficient balance",
        available: currentBalance,
        requested: cryptoAmount,
      });
    }
    
    // Get current USD equivalent
    let usdEquivalent = 0;
    try {
      if (cryptoType.toUpperCase() !== "USDT") {
        const priceResponse = await axios.get(
          `https://api.binance.com/api/v3/ticker/price?symbol=${cryptoType.toUpperCase()}USDT`
        );
        usdEquivalent = Number(cryptoAmount) * parseFloat(priceResponse.data.price);
      } else {
        usdEquivalent = Number(cryptoAmount);
      }
    } catch (error) {
      const settings = await prisma.adminSettings.findFirst();
      if (settings) {
        const rate =
          cryptoType.toUpperCase() === "BTC" ? Number(settings.exchangeRateBtc || 0) :
          cryptoType.toUpperCase() === "ETH" ? Number(settings.exchangeRateEth || 0) :
          cryptoType.toUpperCase() === "USDT" ? 1.0 : 0;
        usdEquivalent = Number(cryptoAmount) * rate;
      }
    }
    
    // Lock the crypto (deduct from balance)
    await prisma.tokenWallet.update({
      where: { id: wallet.id },
      data: {
        [cryptoField]: {
          decrement: Number(cryptoAmount),
        },
      },
    });

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
    
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Notify user
    await createNotification({
      userId,
      type: "in-app",
      category: "transaction",
      title: "Withdrawal Request Created",
      message: `Your request to withdraw ${cryptoAmount} ${cryptoType} is pending admin approval.`,
      priority: "normal",
    });

    // Notify admins
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        type: "in-app",
        category: "admin",
        title: "New Crypto Withdrawal Request",
        message: `${user?.email} wants to withdraw ${cryptoAmount} ${cryptoType}.`,
        priority: "high",
      });
    }
    
    res.json(withdrawal);
  } catch (error) {
    console.error("Error creating withdrawal request:", error);
    res.status(500).json({ error: "Failed to create withdrawal request" });
  }
});

// Get user's crypto orders
router.get("/orders/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const requestUserId = req.user!.userId;
    const userRole = req.user!.role;

    // Users can only see their own orders, admins can see all
    if (userId !== requestUserId && userRole !== "ADMIN") {
      return res.status(403).json({ error: "Access denied" });
    }
    
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
router.get("/withdrawals/:userId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const requestUserId = req.user!.userId;
    const userRole = req.user!.role;

    // Users can only see their own withdrawals, admins can see all
    if (userId !== requestUserId && userRole !== "ADMIN") {
      return res.status(403).json({ error: "Access denied" });
    }
    
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

