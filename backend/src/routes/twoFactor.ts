import express, { Request, Response } from "express";
import { TOTP, Secret } from "otpauth";
import QRCode from "qrcode";
import crypto from "crypto";
import prisma from "../prismaClient";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email?: string;
    role?: string;
  };
}

/**
 * POST /api/2fa/setup
 * Generate TOTP secret and QR code for user
 */
router.post("/setup", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const userId = req.user.userId;

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, totpEnabled: true, totpSecret: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if 2FA is already enabled
    if (user.totpEnabled && user.totpSecret) {
      return res.status(400).json({
        error: "2FA already enabled",
        message: "Please disable existing 2FA before setting up new credentials",
      });
    }

    // Generate new TOTP secret
    const secret = new Secret({ size: 20 });
    const totp = new TOTP({
      issuer: "Advancia",
      label: user.email,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: secret,
    });

    // Generate QR code
    const otpauthUrl = totp.toString();
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    // Generate backup codes (10 codes)
    const backupCodes = Array.from({ length: 10 }, () =>
      crypto.randomBytes(4).toString("hex").toUpperCase()
    );

    // Store the secret in database (not enabled yet, requires verification)
    await prisma.user.update({
      where: { id: userId },
      data: {
        totpSecret: secret.base32,
        totpEnabled: false, // Not enabled until verified
        totpVerified: false,
        backupCodes: backupCodes,
      },
    });

    res.json({
      success: true,
      message: "2FA setup initiated. Please scan the QR code and verify.",
      secret: secret.base32,
      qrCode: qrCodeDataUrl,
      backupCodes: backupCodes,
      otpauthUrl: otpauthUrl,
    });
  } catch (error) {
    console.error("Error setting up 2FA:", error);
    res.status(500).json({ error: "Failed to setup 2FA" });
  }
});

/**
 * POST /api/2fa/verify
 * Verify TOTP code and enable 2FA
 */
router.post("/verify", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { code } = req.body;

    if (!code || typeof code !== "string" || code.length !== 6) {
      return res.status(400).json({ error: "Invalid TOTP code format" });
    }

    const userId = req.user.userId;

    // Get user with TOTP secret
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { totpSecret: true, totpEnabled: true },
    });

    if (!user || !user.totpSecret) {
      return res.status(400).json({
        error: "2FA not set up",
        message: "Please call /api/2fa/setup first",
      });
    }

    // Create TOTP instance with user's secret
    const totp = new TOTP({
      issuer: "Advancia",
      label: req.user.email || "",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: Secret.fromBase32(user.totpSecret),
    });

    // Validate the code
    const delta = totp.validate({ token: code, window: 1 });

    if (delta === null) {
      return res.status(400).json({
        error: "Invalid TOTP code",
        message: "The code you entered is incorrect or expired",
      });
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: userId },
      data: {
        totpEnabled: true,
        totpVerified: true,
      },
    });

    res.json({
      success: true,
      message: "2FA successfully enabled",
      enabled: true,
    });
  } catch (error) {
    console.error("Error verifying 2FA:", error);
    res.status(500).json({ error: "Failed to verify 2FA" });
  }
});

/**
 * POST /api/2fa/validate
 * Validate TOTP code during login
 */
router.post("/validate", async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: "Email and code required" });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        totpSecret: true,
        totpEnabled: true,
        backupCodes: true,
      },
    });

    if (!user || !user.totpEnabled || !user.totpSecret) {
      return res.status(400).json({ error: "2FA not enabled for this user" });
    }

    // Check if it's a backup code first
    if (user.backupCodes.includes(code.toUpperCase())) {
      // Remove used backup code
      const updatedCodes = user.backupCodes.filter((c) => c !== code.toUpperCase());
      await prisma.user.update({
        where: { id: user.id },
        data: { backupCodes: updatedCodes },
      });

      return res.json({
        success: true,
        message: "Backup code validated",
        userId: user.id,
        email: user.email,
        backupCodeUsed: true,
        remainingBackupCodes: updatedCodes.length,
      });
    }

    // Validate TOTP code
    const totp = new TOTP({
      issuer: "Advancia",
      label: user.email,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: Secret.fromBase32(user.totpSecret),
    });

    const delta = totp.validate({ token: code, window: 1 });

    if (delta === null) {
      return res.status(400).json({
        error: "Invalid code",
        message: "The TOTP code is incorrect or expired",
      });
    }

    res.json({
      success: true,
      message: "2FA validated successfully",
      userId: user.id,
      email: user.email,
    });
  } catch (error) {
    console.error("Error validating 2FA:", error);
    res.status(500).json({ error: "Failed to validate 2FA" });
  }
});

/**
 * POST /api/2fa/disable
 * Disable 2FA for user
 */
router.post("/disable", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "TOTP code required to disable 2FA" });
    }

    const userId = req.user.userId;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { totpSecret: true, totpEnabled: true, email: true },
    });

    if (!user || !user.totpEnabled || !user.totpSecret) {
      return res.status(400).json({ error: "2FA not enabled" });
    }

    // Validate code before disabling
    const totp = new TOTP({
      issuer: "Advancia",
      label: user.email,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: Secret.fromBase32(user.totpSecret),
    });

    const delta = totp.validate({ token: code, window: 1 });

    if (delta === null) {
      return res.status(400).json({
        error: "Invalid TOTP code",
        message: "Please provide a valid code to disable 2FA",
      });
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: userId },
      data: {
        totpEnabled: false,
        totpSecret: null,
        totpVerified: false,
        backupCodes: [],
      },
    });

    res.json({
      success: true,
      message: "2FA disabled successfully",
    });
  } catch (error) {
    console.error("Error disabling 2FA:", error);
    res.status(500).json({ error: "Failed to disable 2FA" });
  }
});

/**
 * GET /api/2fa/status
 * Check if 2FA is enabled for authenticated user
 */
router.get("/status", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        totpEnabled: true,
        totpVerified: true,
        backupCodes: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      enabled: user.totpEnabled,
      verified: user.totpVerified,
      backupCodesRemaining: user.backupCodes.length,
    });
  } catch (error) {
    console.error("Error checking 2FA status:", error);
    res.status(500).json({ error: "Failed to check 2FA status" });
  }
});

/**
 * POST /api/2fa/regenerate-backup-codes
 * Generate new backup codes (requires TOTP verification)
 */
router.post(
  "/regenerate-backup-codes",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const { code } = req.body;

      if (!code) {
        return res.status(400).json({ error: "TOTP code required" });
      }

      const userId = req.user.userId;

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { totpSecret: true, totpEnabled: true, email: true },
      });

      if (!user || !user.totpEnabled || !user.totpSecret) {
        return res.status(400).json({ error: "2FA not enabled" });
      }

      // Validate code
      const totp = new TOTP({
        issuer: "Advancia",
        label: user.email,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: Secret.fromBase32(user.totpSecret),
      });

      const delta = totp.validate({ token: code, window: 1 });

      if (delta === null) {
        return res.status(400).json({ error: "Invalid TOTP code" });
      }

      // Generate new backup codes
      const backupCodes = Array.from({ length: 10 }, () =>
        crypto.randomBytes(4).toString("hex").toUpperCase()
      );

      await prisma.user.update({
        where: { id: userId },
        data: { backupCodes: backupCodes },
      });

      res.json({
        success: true,
        message: "Backup codes regenerated",
        backupCodes: backupCodes,
      });
    } catch (error) {
      console.error("Error regenerating backup codes:", error);
      res.status(500).json({ error: "Failed to regenerate backup codes" });
    }
  }
);

export default router;
