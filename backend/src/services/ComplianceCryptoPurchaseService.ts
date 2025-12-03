import { PrismaClient } from "@prisma/client";
import CurrencyService, { ComplianceCheck, CurrencyCode, RiskLevel } from "./CurrencyService";

const prisma = new PrismaClient();

export interface CryptoPurchaseRequest {
  userId: string;
  cryptoType: "BTC" | "ETH" | "USDT";
  amount: number; // Amount of crypto to purchase
  currency: CurrencyCode;
  ipAddress: string;
  userAgent?: string;
}

export interface CryptoPurchase {
  id: string;
  userId: string;
  cryptoType: string;
  amount: number;
  currency: CurrencyCode;
  fiatAmount: number;
  exchangeRate: number;
  status: string;
  complianceCheckPassed: boolean;
  requiresKYC: boolean;
  requiresManualApproval: boolean;
  riskLevel: RiskLevel;
  wireReference?: string;
  wireVerified: boolean;
  adminApproved: boolean;
  complianceNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WireTransferInstructions {
  beneficiaryName: string;
  bankName: string;
  accountNumber: string;
  routingNumber?: string;
  swiftCode?: string;
  iban?: string;
  reference: string;
  amount: number;
  currency: CurrencyCode;
  notes: string[];
}

/**
 * Service for handling bank-compliant crypto purchases
 * Follows USA FinCEN and Canada FINTRAC regulations
 */
export class ComplianceCryptoPurchaseService {
  // Current crypto exchange rates (would come from real-time API)
  private static CRYPTO_RATES = {
    BTC: 43000, // USD per BTC
    ETH: 2300, // USD per ETH
    USDT: 1.0, // USD per USDT
  };

  /**
   * Step 1: Initiate crypto purchase with compliance checks
   */
  static async initiatePurchase(request: CryptoPurchaseRequest): Promise<{
    success: boolean;
    purchaseId?: string;
    complianceCheck: ComplianceCheck;
    wireInstructions?: WireTransferInstructions;
    message: string;
    nextSteps?: string[];
  }> {
    const { userId, cryptoType, amount, currency, ipAddress, userAgent } = request;

    // 1. Calculate fiat amount needed
    const cryptoRateUSD = this.CRYPTO_RATES[cryptoType];
    const fiatAmountUSD = amount * cryptoRateUSD;

    // Convert to user's currency if not USD
    let fiatAmount = fiatAmountUSD;
    let exchangeRate = 1.0;

    if (currency !== "USD") {
      const conversion = await CurrencyService.convertCurrency(fiatAmountUSD, "USD", currency);
      if (!conversion) {
        return {
          success: false,
          complianceCheck: {
            passed: false,
            requiresKYC: false,
            requiresManualApproval: false,
            riskLevel: "CRITICAL",
            exceedsThreshold: false,
            details: ["Exchange rate not available for selected currency"],
          },
          message: "Currency conversion error",
        };
      }
      fiatAmount = conversion.amount;
      exchangeRate = conversion.rate;
    }

    // 2. Perform compliance check
    const complianceCheck = await CurrencyService.performComplianceCheck(userId, currency, fiatAmount, ipAddress);

    // 3. Log compliance event
    await CurrencyService.logComplianceEvent(userId, "CRYPTO_PURCHASE_INITIATED", {
      currency,
      amount: fiatAmount,
      riskLevel: complianceCheck.riskLevel,
      requiresReporting: complianceCheck.exceedsThreshold,
      reportingThresholdType: complianceCheck.thresholdType,
      notes: complianceCheck.details.join("; "),
      ipAddress,
      userAgent,
    });

    // 4. If compliance check fails, stop here
    if (!complianceCheck.passed) {
      return {
        success: false,
        complianceCheck,
        message: "Compliance check failed. Manual review required.",
        nextSteps: [
          "Your transaction has been flagged for manual review",
          "Our compliance team will contact you within 24-48 hours",
          "Please ensure your KYC documents are up to date",
        ],
      };
    }

    // 5. Create purchase record
    const wireReference = `WIRE-${userId.substring(0, 8)}-${Date.now()}`;

    const purchase = await prisma.crypto_purchases.create({
      data: {
        id: `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: userId,
        cryptoType: cryptoType,
        amount: amount,
        currency: currency,
        fiatAmount: fiatAmount,
        exchangeRate: exchangeRate,
        status: complianceCheck.requiresManualApproval ? "pending_approval" : "pending_wire",
        complianceCheckPassed: complianceCheck.passed,
        requiresKyc: complianceCheck.requiresKYC,
        requiresManualApproval: complianceCheck.requiresManualApproval,
        riskLevel: complianceCheck.riskLevel,
        wireReference: wireReference,
        wireVerified: false,
        adminApproved: false,
        complianceNotes: complianceCheck.details.join("\n"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // 6. Generate wire transfer instructions
    const wireInstructions = this.generateWireInstructions(currency, fiatAmount, wireReference, complianceCheck);

    // 7. Prepare response
    const nextSteps: string[] = [];

    if (complianceCheck.requiresKYC) {
      nextSteps.push("Complete KYC verification before proceeding");
    }

    if (complianceCheck.requiresManualApproval) {
      nextSteps.push("Your purchase requires manual approval due to the transaction amount or risk level");
      nextSteps.push("Our compliance team will review within 24-48 hours");
    }

    nextSteps.push("Initiate wire transfer using the provided instructions");
    nextSteps.push(`Include reference code: ${wireReference} in your wire transfer`);
    nextSteps.push("Wire transfers typically take 1-3 business days to process");
    nextSteps.push("Once we receive and verify your wire transfer, your crypto will be delivered");

    return {
      success: true,
      purchaseId: purchase.id,
      complianceCheck,
      wireInstructions,
      message: "Purchase initiated successfully. Please complete wire transfer.",
      nextSteps,
    };
  }

  /**
   * Generate wire transfer instructions based on currency
   */
  private static generateWireInstructions(
    currency: CurrencyCode,
    amount: number,
    reference: string,
    complianceCheck: ComplianceCheck
  ): WireTransferInstructions {
    const currencyInfo = CurrencyService.getCurrencyInfo(currency);

    const baseInstructions = {
      beneficiaryName: "Your Platform Name LLC",
      amount,
      currency,
      reference,
      notes: [
        `IMPORTANT: Include reference code "${reference}" in your wire transfer`,
        "Wire transfers typically take 1-3 business days",
        "Do not send cash or money orders",
        "Only bank wire transfers are accepted for compliance reasons",
        `${currencyInfo.regulatoryNotes}`,
      ],
    };

    // Currency-specific bank details
    switch (currency) {
      case "USD":
        return {
          ...baseInstructions,
          bankName: "Bank of America",
          accountNumber: "1234567890",
          routingNumber: "026009593",
          swiftCode: "BOFAUS3N",
          notes: [
            ...baseInstructions.notes,
            "USA Wire Transfer: Use routing number for domestic, SWIFT for international",
            "Bank address: 100 Federal Street, Boston, MA 02110",
          ],
        };

      case "CAD":
        return {
          ...baseInstructions,
          bankName: "Royal Bank of Canada",
          accountNumber: "9876543210",
          routingNumber: "000309191", // Transit + Institution number
          swiftCode: "ROYCCAT2",
          notes: [
            ...baseInstructions.notes,
            "Canada Wire Transfer: Include transit and institution numbers",
            "Bank address: 200 Bay Street, Toronto, ON M5J 2J5",
          ],
        };

      case "EUR":
        return {
          ...baseInstructions,
          bankName: "Deutsche Bank",
          accountNumber: "0532013000", // Account extracted from IBAN
          iban: "DE89370400440532013000",
          swiftCode: "DEUTDEFF",
          notes: [
            ...baseInstructions.notes,
            "SEPA Transfer: Use IBAN for eurozone transfers",
            "Bank address: Taunusanlage 12, 60325 Frankfurt, Germany",
          ],
        };

      case "GBP":
        return {
          ...baseInstructions,
          bankName: "Barclays Bank",
          accountNumber: "12345678",
          iban: "GB29NWBK60161331926819",
          swiftCode: "BARCGB22",
          notes: [
            ...baseInstructions.notes,
            "UK Wire Transfer: Use sort code 20-00-00 and account number",
            "Bank address: 1 Churchill Place, London E14 5HP",
          ],
        };

      default:
        return baseInstructions as WireTransferInstructions;
    }
  }

  /**
   * Step 2: Admin verifies wire transfer received
   */
  static async verifyWireTransfer(
    purchaseId: string,
    adminId: string,
    verified: boolean,
    notes?: string
  ): Promise<{ success: boolean; message: string; purchase?: CryptoPurchase }> {
    const purchase = await prisma.crypto_purchases.findUnique({
      where: { id: purchaseId },
    });

    if (!purchase) {
      return { success: false, message: "Purchase not found" };
    }

    if (purchase.wireVerified) {
      return { success: false, message: "Wire transfer already verified" };
    }

    // Update purchase with wire verification
    const updated = await prisma.crypto_purchases.update({
      where: { id: purchaseId },
      data: {
        wireVerified: verified,
        wireVerifiedAt: new Date(),
        wireVerifiedBy: adminId,
        status: verified
          ? purchase.requiresManualApproval
            ? "pending_admin_approval"
            : "processing"
          : "wire_verification_failed",
        complianceNotes: notes
          ? `${purchase.complianceNotes}\n\nWire Verification: ${notes}`
          : purchase.complianceNotes,
        updatedAt: new Date(),
      },
    });

    // Log compliance event
    await CurrencyService.logComplianceEvent(purchase.userId, "WIRE_TRANSFER_VERIFIED", {
      transactionId: purchaseId,
      currency: purchase.currency as CurrencyCode,
      amount: purchase.fiatAmount,
      notes: `Wire transfer ${verified ? "verified" : "rejected"} by admin ${adminId}`,
    });

    return {
      success: true,
      message: verified ? "Wire transfer verified successfully" : "Wire transfer verification failed",
      purchase: updated as any,
    };
  }

  /**
   * Step 3: Admin approves high-value purchase
   */
  static async approvePurchase(
    purchaseId: string,
    adminId: string,
    approved: boolean,
    notes?: string
  ): Promise<{ success: boolean; message: string; purchase?: CryptoPurchase }> {
    const purchase = await prisma.crypto_purchases.findUnique({
      where: { id: purchaseId },
    });

    if (!purchase) {
      return { success: false, message: "Purchase not found" };
    }

    if (!purchase.wireVerified) {
      return { success: false, message: "Wire transfer must be verified first" };
    }

    if (purchase.adminApproved) {
      return { success: false, message: "Purchase already approved" };
    }

    // Update purchase with admin approval
    const updated = await prisma.crypto_purchases.update({
      where: { id: purchaseId },
      data: {
        adminApproved: approved,
        adminApprovedAt: new Date(),
        adminApprovedBy: adminId,
        status: approved ? "processing" : "rejected",
        complianceNotes: notes ? `${purchase.complianceNotes}\n\nAdmin Decision: ${notes}` : purchase.complianceNotes,
        updatedAt: new Date(),
      },
    });

    // Log compliance event
    await CurrencyService.logComplianceEvent(purchase.userId, "PURCHASE_ADMIN_REVIEW", {
      transactionId: purchaseId,
      currency: purchase.currency as CurrencyCode,
      amount: purchase.fiatAmount,
      riskLevel: purchase.riskLevel as RiskLevel,
      requiresReporting: purchase.fiatAmount >= 10000,
      notes: `Purchase ${approved ? "approved" : "rejected"} by admin ${adminId}`,
    });

    // If approved, proceed to deliver crypto
    if (approved) {
      await this.completePurchase(purchaseId);
    }

    return {
      success: true,
      message: approved ? "Purchase approved and processing" : "Purchase rejected",
      purchase: updated as any,
    };
  }

  /**
   * Step 4: Complete purchase and deliver crypto
   */
  static async completePurchase(purchaseId: string): Promise<void> {
    const purchase = await prisma.crypto_purchases.findUnique({
      where: { id: purchaseId },
    });

    if (!purchase) {
      throw new Error("Purchase not found");
    }

    try {
      // 1. Update user's crypto balance
      const balanceField = `${purchase.cryptoType.toLowerCase()}Balance`;

      await prisma.users.update({
        where: { id: purchase.userId },
        data: {
          [balanceField]: {
            increment: purchase.amount,
          },
        },
      });

      // 2. Update user's annual transaction volume
      await prisma.users.update({
        where: { id: purchase.userId },
        data: {
          annualTransactionVolume: {
            increment: purchase.fiatAmount,
          },
          lastTransactionDate: new Date(),
        },
      });

      // 3. Mark purchase as completed
      await prisma.crypto_purchases.update({
        where: { id: purchaseId },
        data: {
          status: "completed",
          completedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // 4. Log compliance event
      await CurrencyService.logComplianceEvent(purchase.userId, "CRYPTO_PURCHASE_COMPLETED", {
        transactionId: purchaseId,
        currency: purchase.currency as CurrencyCode,
        amount: purchase.fiatAmount,
        riskLevel: purchase.riskLevel as RiskLevel,
        notes: `${purchase.amount} ${purchase.cryptoType} delivered to user`,
      });

      // 5. Send notification email (would integrate with EmailService)
      console.log(
        `Crypto purchase completed: ${purchase.amount} ${purchase.cryptoType} delivered to user ${purchase.userId}`
      );
    } catch (error) {
      // Mark purchase as failed
      await prisma.crypto_purchases.update({
        where: { id: purchaseId },
        data: {
          status: "failed",
          failureReason: error instanceof Error ? error.message : "Unknown error",
          updatedAt: new Date(),
        },
      });

      throw error;
    }
  }

  /**
   * Get purchase status
   */
  static async getPurchaseStatus(purchaseId: string): Promise<CryptoPurchase | null> {
    const purchase = await prisma.crypto_purchases.findUnique({
      where: { id: purchaseId },
    });

    return purchase as any;
  }

  /**
   * Get user's purchase history
   */
  static async getUserPurchases(userId: string, limit: number = 20): Promise<CryptoPurchase[]> {
    const purchases = await prisma.crypto_purchases.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return purchases as any;
  }

  /**
   * Get pending purchases for admin review
   */
  static async getPendingAdminApprovals(limit: number = 50): Promise<CryptoPurchase[]> {
    const purchases = await prisma.crypto_purchases.findMany({
      where: {
        OR: [{ status: "pending_approval" }, { status: "pending_admin_approval" }],
        wireVerified: true,
        adminApproved: false,
      },
      orderBy: { createdAt: "asc" },
      take: limit,
    });

    return purchases as any;
  }

  /**
   * Get pending wire verifications for admin
   */
  static async getPendingWireVerifications(limit: number = 50): Promise<CryptoPurchase[]> {
    const purchases = await prisma.crypto_purchases.findMany({
      where: {
        status: "pending_wire",
        wireVerified: false,
      },
      orderBy: { createdAt: "asc" },
      take: limit,
    });

    return purchases as any;
  }

  /**
   * Update crypto exchange rates
   */
  static async updateCryptoRates(rates: { BTC?: number; ETH?: number; USDT?: number }): Promise<void> {
    if (rates.BTC) this.CRYPTO_RATES.BTC = rates.BTC;
    if (rates.ETH) this.CRYPTO_RATES.ETH = rates.ETH;
    if (rates.USDT) this.CRYPTO_RATES.USDT = rates.USDT;
  }

  /**
   * Get current crypto rates
   */
  static getCryptoRates() {
    return { ...this.CRYPTO_RATES };
  }
}

export default ComplianceCryptoPurchaseService;
