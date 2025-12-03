import { Request, Response, Router } from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import { CurrencyRequest } from "../middleware/currencyDetection";
import ComplianceCryptoPurchaseService from "../services/ComplianceCryptoPurchaseService";
import CurrencyService, { CurrencyCode } from "../services/CurrencyService";

const router = Router();

/**
 * GET /api/currency/supported
 * Get all supported currencies
 */
router.get("/supported", (req: Request, res: Response) => {
  try {
    const currencies = CurrencyService.getSupportedCurrencies().map((currencyCode) => ({
      ...CurrencyService.getCurrencyInfo(currencyCode),
    }));

    res.json({
      success: true,
      currencies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/currency/detect
 * Detect user's currency from IP
 */
router.get("/detect", (req: CurrencyRequest, res: Response) => {
  try {
    res.json({
      success: true,
      currency: req.detectedCurrency || "USD",
      country: req.detectedCountry || "US",
      currencyInfo: CurrencyService.getCurrencyInfo((req.detectedCurrency || "USD") as CurrencyCode),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/currency/rates/:from/:to
 * Get exchange rate between two currencies
 */
router.get("/rates/:from/:to", async (req: Request, res: Response) => {
  try {
    const { from, to } = req.params;

    const rate = await CurrencyService.getExchangeRate(
      from.toUpperCase() as CurrencyCode,
      to.toUpperCase() as CurrencyCode
    );

    if (!rate) {
      return res.status(404).json({
        success: false,
        error: "Exchange rate not found",
      });
    }

    res.json({
      success: true,
      rate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/currency/convert
 * Convert amount between currencies
 */
router.post("/convert", async (req: Request, res: Response) => {
  try {
    const { amount, from, to } = req.body;

    if (!amount || !from || !to) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: amount, from, to",
      });
    }

    const result = await CurrencyService.convertCurrency(
      parseFloat(amount),
      from.toUpperCase() as CurrencyCode,
      to.toUpperCase() as CurrencyCode
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        error: "Conversion not available",
      });
    }

    res.json({
      success: true,
      originalAmount: parseFloat(amount),
      convertedAmount: result.amount,
      fromCurrency: from.toUpperCase(),
      toCurrency: to.toUpperCase(),
      exchangeRate: result.rate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/currency/balance/:currency
 * Get user's balance in specific currency
 */
router.get("/balance/:currency", authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const { currency } = req.params;
    const balance = await CurrencyService.getUserBalance(userId, currency.toUpperCase() as CurrencyCode);

    res.json({
      success: true,
      balance: balance || {
        userId,
        currency: currency.toUpperCase(),
        balance: 0,
        lockedBalance: 0,
        lastUpdated: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/currency/crypto/purchase
 * Initiate compliant crypto purchase
 */
router.post("/crypto/purchase", authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const { cryptoType, amount, currency } = req.body;

    if (!cryptoType || !amount || !currency) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: cryptoType, amount, currency",
      });
    }

    // Get IP address
    const ipAddress =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      (req.headers["x-real-ip"] as string) ||
      req.socket.remoteAddress ||
      req.ip ||
      "";

    const result = await ComplianceCryptoPurchaseService.initiatePurchase({
      userId,
      cryptoType: cryptoType.toUpperCase(),
      amount: parseFloat(amount),
      currency: currency.toUpperCase() as CurrencyCode,
      ipAddress,
      userAgent: req.headers["user-agent"],
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/currency/crypto/purchases
 * Get user's crypto purchase history
 */
router.get("/crypto/purchases", authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const purchases = await ComplianceCryptoPurchaseService.getUserPurchases(userId, limit);

    res.json({
      success: true,
      purchases,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/currency/crypto/purchase/:id
 * Get specific purchase status
 */
router.get("/crypto/purchase/:id", authenticateToken as any, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const { id } = req.params;
    const purchase = await ComplianceCryptoPurchaseService.getPurchaseStatus(id);

    if (!purchase) {
      return res.status(404).json({
        success: false,
        error: "Purchase not found",
      });
    }

    // Verify ownership
    if (purchase.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    res.json({
      success: true,
      purchase,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/currency/crypto/rates
 * Get current crypto exchange rates
 */
router.get("/crypto/rates", (req: Request, res: Response) => {
  try {
    const rates = ComplianceCryptoPurchaseService.getCryptoRates();

    res.json({
      success: true,
      rates,
      lastUpdated: new Date(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// ===== ADMIN ROUTES =====

/**
 * GET /api/currency/admin/pending-wires
 * Get purchases pending wire verification
 */
router.get("/admin/pending-wires", requireAdmin as any, async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    if (userRole !== "admin" && userRole !== "super_admin") {
      return res.status(403).json({
        success: false,
        error: "Admin access required",
      });
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const purchases = await ComplianceCryptoPurchaseService.getPendingWireVerifications(limit);

    res.json({
      success: true,
      purchases,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/currency/admin/verify-wire/:id
 * Verify wire transfer received
 */
router.post("/admin/verify-wire/:id", requireAdmin as any, async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    if (userRole !== "admin" && userRole !== "super_admin") {
      return res.status(403).json({
        success: false,
        error: "Admin access required",
      });
    }

    const { id } = req.params;
    const { verified, notes } = req.body;

    const result = await ComplianceCryptoPurchaseService.verifyWireTransfer(id, adminId, verified === true, notes);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/currency/admin/pending-approvals
 * Get purchases pending admin approval
 */
router.get("/admin/pending-approvals", requireAdmin as any, async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    if (userRole !== "admin" && userRole !== "super_admin") {
      return res.status(403).json({
        success: false,
        error: "Admin access required",
      });
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const purchases = await ComplianceCryptoPurchaseService.getPendingAdminApprovals(limit);

    res.json({
      success: true,
      purchases,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/currency/admin/approve-purchase/:id
 * Approve high-value crypto purchase
 */
router.post("/admin/approve-purchase/:id", requireAdmin as any, async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    if (userRole !== "admin" && userRole !== "super_admin") {
      return res.status(403).json({
        success: false,
        error: "Admin access required",
      });
    }

    const { id } = req.params;
    const { approved, notes } = req.body;

    const result = await ComplianceCryptoPurchaseService.approvePurchase(id, adminId, approved === true, notes);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
