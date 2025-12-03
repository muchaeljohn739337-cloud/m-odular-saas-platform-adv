import { PrismaClient } from "@prisma/client";
import geoip from "geoip-lite";

const prisma = new PrismaClient();

// Supported currencies with regulatory thresholds
export const CURRENCIES = {
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    country: "USA",
    regulatoryBody: "FinCEN",
    reportingThreshold: 10000, // $10,000 USD triggers CTR (Currency Transaction Report)
    structuringThreshold: 10000,
    regulatoryNotes: "USA PATRIOT Act - Bank Secrecy Act requires reporting transactions over $10,000",
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    country: "Eurozone",
    regulatoryBody: "EU AML Directive",
    reportingThreshold: 10000, // €10,000 EUR
    structuringThreshold: 10000,
    regulatoryNotes: "5th Anti-Money Laundering Directive (5AMLD)",
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    country: "UK",
    regulatoryBody: "FCA",
    reportingThreshold: 8000, // £8,000 GBP (approx equivalent)
    structuringThreshold: 8000,
    regulatoryNotes: "Financial Conduct Authority regulations",
  },
  CAD: {
    code: "CAD",
    symbol: "C$",
    name: "Canadian Dollar",
    country: "Canada",
    regulatoryBody: "FINTRAC",
    reportingThreshold: 10000, // C$10,000 CAD triggers LCTR (Large Cash Transaction Report)
    structuringThreshold: 10000,
    regulatoryNotes: "Proceeds of Crime (Money Laundering) and Terrorist Financing Act",
  },
};

export type CurrencyCode = keyof typeof CURRENCIES;
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface ComplianceCheck {
  passed: boolean;
  requiresKYC: boolean;
  requiresManualApproval: boolean;
  riskLevel: RiskLevel;
  exceedsThreshold: boolean;
  thresholdType?: string;
  regulatoryNotes?: string;
  velocityWarning?: boolean;
  structuringDetected?: boolean;
  details: string[];
}

export interface ExchangeRate {
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode;
  rate: number;
  lastUpdated: Date;
  source: string;
}

export interface UserBalance {
  userId: string;
  currency: CurrencyCode;
  balance: number;
  lockedBalance: number;
  lastUpdated: Date;
}

export class CurrencyService {
  /**
   * Detect user's currency based on IP address
   */
  static detectCurrencyFromIP(ipAddress: string): CurrencyCode {
    const geo = geoip.lookup(ipAddress);

    if (!geo) return "USD"; // Default fallback

    const countryToCurrency: Record<string, CurrencyCode> = {
      US: "USD",
      CA: "CAD",
      GB: "GBP",
      UK: "GBP",
      // Eurozone countries
      DE: "EUR",
      FR: "EUR",
      IT: "EUR",
      ES: "EUR",
      NL: "EUR",
      BE: "EUR",
      AT: "EUR",
      PT: "EUR",
      FI: "EUR",
      IE: "EUR",
      GR: "EUR",
      LU: "EUR",
      SI: "EUR",
      CY: "EUR",
      MT: "EUR",
      SK: "EUR",
      EE: "EUR",
      LV: "EUR",
      LT: "EUR",
    };

    return countryToCurrency[geo.country] || "USD";
  }

  /**
   * Get country from IP address
   */
  static getCountryFromIP(ipAddress: string): string | null {
    const geo = geoip.lookup(ipAddress);
    return geo ? geo.country : null;
  }

  /**
   * Perform bank compliance check for crypto purchase
   */
  static async performComplianceCheck(
    userId: string,
    currency: CurrencyCode,
    amount: number,
    ipAddress: string
  ): Promise<ComplianceCheck> {
    const currencyInfo = CURRENCIES[currency];
    const details: string[] = [];

    let passed = true;
    let requiresKYC = false;
    let requiresManualApproval = false;
    let riskLevel: RiskLevel = "LOW";
    let exceedsThreshold = false;
    let thresholdType: string | undefined;
    let velocityWarning = false;
    let structuringDetected = false;

    // 1. Check if amount exceeds regulatory reporting threshold
    if (amount >= currencyInfo.reportingThreshold) {
      exceedsThreshold = true;
      thresholdType = `${currencyInfo.regulatoryBody} Reporting Threshold`;
      requiresKYC = true;
      requiresManualApproval = true;
      riskLevel = "HIGH";
      details.push(
        `Transaction of ${currencyInfo.symbol}${amount.toFixed(2)} exceeds ${currencyInfo.regulatoryBody} reporting threshold of ${currencyInfo.symbol}${currencyInfo.reportingThreshold}`
      );
      details.push(currencyInfo.regulatoryNotes);
      details.push("Enhanced due diligence required - KYC verification and manual approval needed");
    }

    // 2. Check user's KYC status
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        kycVerified: true,
        kycLevel: true,
        annualTransactionVolume: true,
        lastTransactionDate: true,
        country: true,
      },
    });

    if (!user) {
      passed = false;
      riskLevel = "CRITICAL";
      details.push("User not found");
      return {
        passed,
        requiresKYC,
        requiresManualApproval,
        riskLevel,
        exceedsThreshold,
        details,
        velocityWarning,
        structuringDetected,
      };
    }

    // 3. Check if user's country matches detected IP country
    const detectedCountry = this.getCountryFromIP(ipAddress);
    if (user.country && detectedCountry && user.country !== detectedCountry) {
      riskLevel = riskLevel === "LOW" ? "MEDIUM" : riskLevel;
      details.push(
        `Location mismatch: User country (${user.country}) differs from detected IP country (${detectedCountry})`
      );
      requiresManualApproval = true;
    }

    // 4. Check transaction velocity (anti-structuring detection)
    const velocityCheck = await this.checkTransactionVelocity(userId, currency, amount);
    if (velocityCheck.suspiciousPattern) {
      velocityWarning = true;
      structuringDetected = velocityCheck.structuringDetected;
      riskLevel = "HIGH";
      requiresManualApproval = true;
      passed = false;
      details.push("ALERT: Suspicious transaction velocity detected");
      details.push(
        `${velocityCheck.transactionCount} transactions totaling ${currencyInfo.symbol}${velocityCheck.totalAmount.toFixed(2)} in last ${velocityCheck.timeWindowHours} hours`
      );

      if (structuringDetected) {
        details.push(
          "⚠️ STRUCTURING DETECTED: Multiple transactions below reporting threshold may indicate attempt to avoid regulatory reporting"
        );
        details.push("This pattern violates anti-money laundering regulations and requires immediate manual review");
      }
    }

    // 5. Check KYC requirements for threshold amounts
    if (amount >= currencyInfo.reportingThreshold * 0.5) {
      // 50% of threshold
      requiresKYC = true;
      if (!user.kycVerified) {
        passed = false;
        riskLevel = riskLevel === "LOW" ? "MEDIUM" : riskLevel;
        details.push(
          `KYC verification required for transactions above ${currencyInfo.symbol}${(currencyInfo.reportingThreshold * 0.5).toFixed(2)}`
        );
      }
    }

    // 6. Check annual transaction volume
    const annualVolume = Number(user.annualTransactionVolume) || 0;
    if (annualVolume + amount > currencyInfo.reportingThreshold * 10) {
      // 10x threshold annually
      requiresManualApproval = true;
      riskLevel = riskLevel === "LOW" ? "MEDIUM" : "HIGH";
      details.push(
        `Annual transaction volume approaching regulatory scrutiny level: ${currencyInfo.symbol}${(annualVolume + amount).toFixed(2)}`
      );
    }

    // 7. Risk level determination
    if (riskLevel === "LOW" && requiresKYC) {
      riskLevel = "MEDIUM";
    }

    if (passed && riskLevel === "LOW") {
      details.push(`Transaction approved: ${currencyInfo.symbol}${amount.toFixed(2)} ${currency} within normal limits`);
    }

    return {
      passed,
      requiresKYC,
      requiresManualApproval,
      riskLevel,
      exceedsThreshold,
      thresholdType,
      regulatoryNotes: currencyInfo.regulatoryNotes,
      velocityWarning,
      structuringDetected,
      details,
    };
  }

  /**
   * Check transaction velocity for structuring detection
   */
  static async checkTransactionVelocity(
    userId: string,
    currency: CurrencyCode,
    currentAmount: number
  ): Promise<{
    suspiciousPattern: boolean;
    structuringDetected: boolean;
    transactionCount: number;
    totalAmount: number;
    timeWindowHours: number;
  }> {
    const currencyInfo = CURRENCIES[currency];
    const timeWindowHours = 24;
    const since = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000);

    // Check recent crypto purchases
    const recentPurchases = await prisma.crypto_purchases.findMany({
      where: {
        userId: userId,
        currency: currency,
        createdAt: { gte: since },
        status: { notIn: ["failed", "cancelled"] },
      },
      select: {
        fiatAmount: true,
        createdAt: true,
      },
    });

    const transactionCount = recentPurchases.length;
    const totalAmount = recentPurchases.reduce((sum, p) => sum + (p.fiatAmount || 0), 0) + currentAmount;

    // Structuring detection: Multiple transactions just below threshold
    const threshold = currencyInfo.structuringThreshold;
    const structuringThreshold = threshold * 0.9; // 90% of reporting threshold

    let structuringDetected = false;

    // Pattern 1: Multiple transactions between 80-95% of threshold
    const nearThresholdCount = recentPurchases.filter(
      (p) => p.fiatAmount >= threshold * 0.8 && p.fiatAmount < threshold * 0.95
    ).length;

    if (nearThresholdCount >= 2 && currentAmount >= threshold * 0.8 && currentAmount < threshold) {
      structuringDetected = true;
    }

    // Pattern 2: Total amount exceeds threshold but split into multiple sub-threshold transactions
    if (totalAmount >= threshold && transactionCount >= 3) {
      const avgTransaction = totalAmount / (transactionCount + 1);
      if (avgTransaction < threshold * 0.9) {
        structuringDetected = true;
      }
    }

    // Pattern 3: Rapid succession of transactions (4+ in 24 hours)
    const suspiciousPattern = transactionCount >= 4 || structuringDetected;

    return {
      suspiciousPattern,
      structuringDetected,
      transactionCount,
      totalAmount,
      timeWindowHours,
    };
  }

  /**
   * Get exchange rate between currencies
   */
  static async getExchangeRate(fromCurrency: CurrencyCode, toCurrency: CurrencyCode): Promise<ExchangeRate | null> {
    if (fromCurrency === toCurrency) {
      return {
        fromCurrency,
        toCurrency,
        rate: 1.0,
        lastUpdated: new Date(),
        source: "direct",
      };
    }

    const rateRecord = await prisma.currency_rates.findFirst({
      where: {
        fromCurrency: fromCurrency,
        toCurrency: toCurrency,
      },
    });

    if (!rateRecord) return null;

    return {
      fromCurrency,
      toCurrency,
      rate: rateRecord.rate,
      lastUpdated: rateRecord.lastUpdated,
      source: rateRecord.source,
    };
  }

  /**
   * Convert amount between currencies
   */
  static async convertCurrency(
    amount: number,
    fromCurrency: CurrencyCode,
    toCurrency: CurrencyCode
  ): Promise<{ amount: number; rate: number } | null> {
    const exchangeRate = await this.getExchangeRate(fromCurrency, toCurrency);

    if (!exchangeRate) return null;

    return {
      amount: amount * exchangeRate.rate,
      rate: exchangeRate.rate,
    };
  }

  /**
   * Get user balance in specific currency
   */
  static async getUserBalance(userId: string, currency: CurrencyCode): Promise<UserBalance | null> {
    const balance = await prisma.user_balances.findFirst({
      where: {
        userId: userId,
        currency: currency,
      },
    });

    if (!balance) return null;

    return {
      userId,
      currency,
      balance: balance.balance,
      lockedBalance: balance.lockedBalance || 0,
      lastUpdated: balance.lastUpdated,
    };
  }

  /**
   * Create or update user balance
   */
  static async updateUserBalance(
    userId: string,
    currency: CurrencyCode,
    amount: number,
    operation: "add" | "subtract"
  ): Promise<UserBalance> {
    const existing = await this.getUserBalance(userId, currency);

    if (!existing) {
      // Create new balance record
      const newBalance = await prisma.user_balances.create({
        data: {
          id: `bal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: userId,
          currency: currency,
          balance: operation === "add" ? amount : 0,
          lockedBalance: 0,
          lastUpdated: new Date(),
          createdAt: new Date(),
        },
      });

      return {
        userId,
        currency,
        balance: newBalance.balance,
        lockedBalance: newBalance.lockedBalance || 0,
        lastUpdated: newBalance.lastUpdated,
      };
    }

    // Update existing balance
    const newBalance = operation === "add" ? existing.balance + amount : existing.balance - amount;

    const updated = await prisma.user_balances.updateMany({
      where: {
        userId: userId,
        currency: currency,
      },
      data: {
        balance: newBalance,
        lastUpdated: new Date(),
      },
    });

    return {
      userId,
      currency,
      balance: newBalance,
      lockedBalance: existing.lockedBalance,
      lastUpdated: new Date(),
    };
  }

  /**
   * Log compliance event for regulatory audit trail
   */
  static async logComplianceEvent(
    userId: string,
    eventType: string,
    details: {
      transactionId?: string;
      currency?: CurrencyCode;
      amount?: number;
      riskLevel?: RiskLevel;
      requiresReporting?: boolean;
      reportingThresholdType?: string;
      notes?: string;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<void> {
    await prisma.compliance_logs.create({
      data: {
        id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        transaction_id: details.transactionId,
        event_type: eventType,
        jurisdiction: "GLOBAL",
        payload: {},
        compliance_result: {},
        currency: details.currency,
        amount: details.amount,
        risk_level: details.riskLevel,
        requires_reporting: details.requiresReporting || false,
        reporting_threshold_type: details.reportingThresholdType,
        details: details.notes || "",
        ip_address: details.ipAddress,
        user_agent: details.userAgent,
        created_at: new Date(),
      },
    });
  }

  /**
   * Update exchange rates from external API
   */
  static async updateExchangeRates(): Promise<void> {
    // This would integrate with a real exchange rate API like:
    // - exchangerate-api.com
    // - fixer.io
    // - openexchangerates.org

    // For now, this is a placeholder that would be called by a cron job
    console.log("Exchange rate update would occur here");

    // Example implementation:
    // const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    // const data = await response.json();
    // Update rates in database...
  }

  /**
   * Get currency info
   */
  static getCurrencyInfo(currency: CurrencyCode) {
    return CURRENCIES[currency];
  }

  /**
   * Get all supported currencies
   */
  static getSupportedCurrencies() {
    return Object.keys(CURRENCIES) as CurrencyCode[];
  }
}

export default CurrencyService;
