import express from "express";
import prisma from "../prismaClient";
import { recordEthActivityEntry } from "./ethereum";
import { recordTransaction } from "./transaction";
import { serializePrismaObject, parseAmount } from "../utils/serializers";

const router = express.Router();

const SUPPORTED_CURRENCIES = ["USD", "ETH", "BTC"] as const;
type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

type DecimalLike = number | string | { toNumber?: () => number } | null | undefined;

interface AdminPortfolioRecord {
  id: string;
  currency: SupportedCurrency;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

interface AdminTransferRecord {
  id: string;
  adminId: string | null;
  userId: string | null;
  currency: SupportedCurrency;
  amount: number;
  note: string | null;
  source: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const fallbackPortfolio: AdminPortfolioRecord[] = [
  {
    id: "fallback_usd",
    currency: "USD",
    balance: 250000,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "fallback_eth",
    currency: "ETH",
    balance: 120,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "fallback_btc",
    currency: "BTC",
    balance: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const fallbackTransfers: AdminTransferRecord[] = [];

const getAdminPortfolioClient = () =>
  (prisma as unknown as {
    adminPortfolio?: {
      findMany: (args?: unknown) => Promise<any[]>;
      findUnique: (args: unknown) => Promise<any | null>;
      create: (args: unknown) => Promise<any>;
      update: (args: unknown) => Promise<any>;
    };
  }).adminPortfolio;

const getAdminTransferClient = () =>
  (prisma as unknown as {
    adminTransfer?: {
      findMany: (args?: unknown) => Promise<any[]>;
      create: (args: unknown) => Promise<any>;
    };
  }).adminTransfer;

const coerceNumber = (value: DecimalLike): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (typeof value === "object" && typeof value.toNumber === "function") {
    return value.toNumber();
  }
  return Number(value);
};

const ensureFallbackPortfolio = (currency: SupportedCurrency): AdminPortfolioRecord => {
  let record = fallbackPortfolio.find((entry) => entry.currency === currency);
  if (!record) {
    record = {
      id: `fallback_${currency.toLowerCase()}`,
      currency,
      balance: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    fallbackPortfolio.push(record);
  }
  return record;
};

const normalizeCurrency = (currency: string): SupportedCurrency => {
  const upper = currency.toUpperCase();
  if (SUPPORTED_CURRENCIES.includes(upper as SupportedCurrency)) {
    return upper as SupportedCurrency;
  }
  throw new Error(`Unsupported currency ${currency}`);
};

const aggregateTransfers = (records: AdminTransferRecord[], userId?: string) => {
  const summary: Record<SupportedCurrency, number> = {
    USD: 0,
    ETH: 0,
    BTC: 0,
  };

  records
    .filter((record) => (userId ? record.userId === userId : true))
    .forEach((record) => {
      summary[record.currency] += record.amount;
    });

  return summary;
};

const fetchTransfers = async (userId?: string): Promise<AdminTransferRecord[]> => {
  try {
    const delegate = getAdminTransferClient();
    if (!delegate) throw new Error("AdminTransfer delegate unavailable");

    const raw = await delegate.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: "desc" },
      take: userId ? undefined : 100,
    });

    return raw.map((entry) => ({
      id: entry.id,
      adminId: entry.adminId ?? null,
      userId: entry.userId ?? null,
      currency: entry.currency as SupportedCurrency,
      amount: coerceNumber(entry.amount),
      note: entry.note ?? null,
      source: entry.source ?? null,
      createdAt: entry.createdAt ? new Date(entry.createdAt) : new Date(),
      updatedAt: entry.updatedAt ? new Date(entry.updatedAt) : new Date(),
    }));
  } catch (error) {
    console.warn("Falling back to in-memory admin transfer store", error);
    return userId
      ? fallbackTransfers.filter((item) => item.userId === userId)
      : [...fallbackTransfers].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
};

const adjustAdminPortfolioBalance = async (
  currency: SupportedCurrency,
  delta: number
): Promise<AdminPortfolioRecord> => {
  try {
    const delegate = getAdminPortfolioClient();
    if (!delegate) throw new Error("AdminPortfolio delegate unavailable");

    let existing = await delegate.findUnique({ where: { currency } });

    if (!existing) {
      existing = await delegate.create({ data: { currency, balance: 0 } });
    }

    const currentBalance = coerceNumber(existing.balance);
    const nextBalance = currentBalance + delta;

    if (nextBalance < 0) {
      throw new Error("INSUFFICIENT_FUNDS");
    }

    const updated = await delegate.update({
      where: { currency },
      data: { balance: nextBalance },
    });

    return {
      id: updated.id,
      currency: updated.currency as SupportedCurrency,
      balance: coerceNumber(updated.balance),
      createdAt: updated.createdAt ? new Date(updated.createdAt) : new Date(),
      updatedAt: updated.updatedAt ? new Date(updated.updatedAt) : new Date(),
    };
  } catch (error) {
    if ((error as Error).message === "INSUFFICIENT_FUNDS") {
      throw error;
    }

    const record = ensureFallbackPortfolio(currency);
    const nextBalance = record.balance + delta;

    if (nextBalance < 0) {
      throw new Error("INSUFFICIENT_FUNDS");
    }

    record.balance = nextBalance;
    record.updatedAt = new Date();
    return { ...record };
  }
};

const createTransferRecord = async (
  payload: Omit<AdminTransferRecord, "id" | "createdAt" | "updatedAt">
): Promise<AdminTransferRecord> => {
  try {
    const delegate = getAdminTransferClient();
    if (!delegate) throw new Error("AdminTransfer delegate unavailable");

    const created = await delegate.create({
      data: {
        adminId: payload.adminId,
        userId: payload.userId,
        currency: payload.currency,
        amount: payload.amount,
        note: payload.note,
        source: payload.source,
      },
    });

    return {
      id: created.id,
      adminId: created.adminId ?? null,
      userId: created.userId ?? null,
      currency: created.currency as SupportedCurrency,
      amount: coerceNumber(created.amount),
      note: created.note ?? null,
      source: created.source ?? null,
      createdAt: created.createdAt ? new Date(created.createdAt) : new Date(),
      updatedAt: created.updatedAt ? new Date(created.updatedAt) : new Date(),
    };
  } catch (error) {
    console.warn("Falling back to in-memory transfer log", error);
    const record: AdminTransferRecord = {
      id: `transfer_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      adminId: payload.adminId,
      userId: payload.userId,
      currency: payload.currency,
      amount: payload.amount,
      note: payload.note,
      source: payload.source,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    fallbackTransfers.unshift(record);
    return record;
  }
};

router.get("/portfolio", async (_req, res) => {
  try {
    const delegate = getAdminPortfolioClient();
    if (!delegate) throw new Error("AdminPortfolio delegate unavailable");

    const raw = await delegate.findMany({ orderBy: { currency: "asc" } });
    const portfolios: AdminPortfolioRecord[] = raw.map((entry) => ({
      id: entry.id,
      currency: entry.currency as SupportedCurrency,
      balance: coerceNumber(entry.balance),
      createdAt: entry.createdAt ? new Date(entry.createdAt) : new Date(),
      updatedAt: entry.updatedAt ? new Date(entry.updatedAt) : new Date(),
    }));

    return res.json({ success: true, portfolios: portfolios.map(serializePrismaObject) });
  } catch (error) {
    console.warn("Falling back to in-memory portfolio", error);
    const portfolios = [...fallbackPortfolio].sort((a, b) => a.currency.localeCompare(b.currency));
    return res.json({ success: true, portfolios: portfolios.map(serializePrismaObject) });
  }
});

router.get("/portfolio/transfers", async (req, res) => {
  try {
    const { userId } = req.query as { userId?: string };
    const transfers = await fetchTransfers(userId);
    return res.json({ success: true, transfers: transfers.map(serializePrismaObject) });
  } catch (error) {
    console.error("Failed to fetch admin transfers", error);
    return res.status(500).json({ success: false, error: "Unable to fetch admin transfers" });
  }
});

router.get("/portfolio/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const transfers = await fetchTransfers(userId);
    const totals = aggregateTransfers(transfers, userId);
    return res.json({ success: true, userId, totals, transfers: transfers.map(serializePrismaObject) });
  } catch (error) {
    console.error("Failed to aggregate transfers", error);
    return res.status(500).json({ success: false, error: "Unable to aggregate admin transfers" });
  }
});

router.post("/portfolio/transfer", async (req, res) => {
  try {
    const { userId, currency: rawCurrency, amount, note, adminId } = req.body as {
      userId?: string;
      currency?: string;
      amount?: number | string;
      note?: string;
      adminId?: string;
    };

    if (!userId) {
      return res.status(400).json({ success: false, error: "userId is required" });
    }

    if (rawCurrency === undefined) {
      return res.status(400).json({ success: false, error: "currency is required" });
    }

    if (amount === undefined) {
      return res.status(400).json({ success: false, error: "amount is required" });
    }

    const currency = normalizeCurrency(rawCurrency);
    const numericAmount =
      typeof amount === "string" ? Number(amount.trim()) : Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, error: "amount must be a positive number" });
    }

    let updatedPortfolio: AdminPortfolioRecord;
    try {
      updatedPortfolio = await adjustAdminPortfolioBalance(currency, -numericAmount);
    } catch (error) {
      if ((error as Error).message === "INSUFFICIENT_FUNDS") {
        return res.status(400).json({ success: false, error: "Insufficient admin balance" });
      }
      throw error;
    }

    const transferRecord = await createTransferRecord({
      adminId: adminId ?? null,
      userId,
      currency,
      amount: numericAmount,
      note: note ?? null,
      source: "ADMIN_PORTFOLIO",
    });

    if (currency === "USD") {
      await recordTransaction({
        userId,
        amount: numericAmount,
        type: "credit",
        currency: "USD",
        source: "ADMIN_PORTFOLIO",
        metadata: { transferId: transferRecord.id, note },
        notificationTitle: "Admin Top Up",
        notificationMessage: `Admin sent $${numericAmount.toFixed(2)} to your wallet`,
      });
    }

    if (currency === "ETH") {
      let ethAddress = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
      try {
        const delegate = (prisma as unknown as {
          user?: {
            findUnique: (args: unknown) => Promise<{ ethWalletAddress?: string | null } | null>;
          };
        }).user;
        if (delegate) {
          const user = await delegate.findUnique({
            where: { id: userId },
            select: { ethWalletAddress: true },
          });
          if (user?.ethWalletAddress) {
            ethAddress = user.ethWalletAddress;
          }
        }
      } catch (error) {
        console.warn("Unable to resolve user ETH address; using default", error);
      }

      await recordEthActivityEntry({
        userId,
        address: ethAddress,
        type: "DEPOSIT",
        amountEth: numericAmount,
        status: "PENDING",
        note: note ?? "Admin portfolio transfer",
      });
    }

    const transfers = await fetchTransfers(userId);
    const totals = aggregateTransfers(transfers, userId);

    return res.status(201).json({
      success: true,
      transfer: transferRecord,
      portfolio: updatedPortfolio,
      userTotals: totals,
    });
  } catch (error) {
    console.error("Failed to complete admin transfer", error);
    return res.status(500).json({ success: false, error: "Unable to transfer funds from admin portfolio" });
  }
});

export default router;
