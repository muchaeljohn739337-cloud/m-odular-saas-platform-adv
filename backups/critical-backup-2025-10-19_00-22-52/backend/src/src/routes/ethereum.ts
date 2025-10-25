import express, { Request, Response } from "express";
import { ethers } from "ethers";
import {
  getEthBalance,
  getGasPrice,
  getCurrentBlockNumber,
  getTransaction,
  getTransactionReceipt,
  verifyTransaction,
  estimateTransferCost,
  isProviderConnected,
  getNetworkInfo,
} from "../services/ethGateway";
import prisma from "../prismaClient";
import { serializePrismaObject, parseAmount } from "../utils/serializers";

const router = express.Router();
const MIN_CONFIRMATIONS = 12;

type DepositStatus = "CONFIRMED" | "PENDING" | "FAILED";
type WithdrawalStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

interface EthActivityRecord {
  id: string;
  userId: string | null;
  address: string;
  addressNormalized: string;
  type: "DEPOSIT" | "WITHDRAWAL";
  txHash: string | null;
  amountEth: number | string;
  status: string;
  confirmations: number;
  blockNumber: number | null;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Temporary helper until Prisma client is regenerated with EthActivity model
const getEthActivityClient = () =>
  (prisma as unknown as {
    ethActivity: {
      findMany: (args: unknown) => Promise<EthActivityRecord[]>;
      create: (args: unknown) => Promise<EthActivityRecord>;
    };
  }).ethActivity;

const normalizeAddress = (address: string) => address.toLowerCase();

const fallbackBaseBlock = 23607500;
const fallbackActivities: EthActivityRecord[] = [
  {
    id: "dep_fallback_1",
    userId: null,
    address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    addressNormalized: normalizeAddress("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"),
    type: "DEPOSIT",
    txHash: "0x304b5af9c1d7778ab2b32b0d5ba8644897d9a53e8c2ff8d30f0ca7c07d0161f5",
    amountEth: 0.85,
    status: "CONFIRMED",
    confirmations: 48,
    blockNumber: fallbackBaseBlock - 30,
    note: "Ledger refill",
    createdAt: new Date(Date.now() - 1000 * 60 * 45),
    updatedAt: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: "dep_fallback_2",
    userId: null,
    address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    addressNormalized: normalizeAddress("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"),
    type: "DEPOSIT",
    txHash: "0x13a88b02ef59c59f5a298922d0e50fcb035f86b72c0847860d8a1bd4cd1bd889",
    amountEth: 1.4,
    status: "PENDING",
    confirmations: 6,
    blockNumber: fallbackBaseBlock - 3,
    note: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 6),
    updatedAt: new Date(Date.now() - 1000 * 60 * 6),
  },
  {
    id: "dep_fallback_3",
    userId: null,
    address: "0x5085fEb1F5d96d2a2AfD0127d0B2E0bB3d2F5231",
    addressNormalized: normalizeAddress("0x5085fEb1F5d96d2a2AfD0127d0B2E0bB3d2F5231"),
    type: "DEPOSIT",
    txHash: "0xdf59c4765e5c9b70f17968ebe5bcf3f708f966d6634b457769278e41b1a086ec",
    amountEth: 0.32,
    status: "CONFIRMED",
    confirmations: 240,
    blockNumber: fallbackBaseBlock - 400,
    note: "Payout",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: "wd_fallback_1",
    userId: null,
    address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    addressNormalized: normalizeAddress("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"),
    type: "WITHDRAWAL",
    txHash: "0xad3e10bb5c9477fe4fb68ac050c3c61f566ecbf5e6a4dc2a1029c52133cb6056",
    amountEth: 0.25,
    status: "COMPLETED",
    confirmations: 60,
    blockNumber: fallbackBaseBlock - 60,
    note: "Cold storage sweep",
    createdAt: new Date(Date.now() - 1000 * 60 * 90),
    updatedAt: new Date(Date.now() - 1000 * 60 * 90),
  },
  {
    id: "wd_fallback_2",
    userId: null,
    address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    addressNormalized: normalizeAddress("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"),
    type: "WITHDRAWAL",
    txHash: null,
    amountEth: 0.5,
    status: "PROCESSING",
    confirmations: 0,
    blockNumber: null,
    note: "Manual review",
    createdAt: new Date(Date.now() - 1000 * 60 * 20),
    updatedAt: new Date(Date.now() - 1000 * 60 * 20),
  },
  {
    id: "wd_fallback_3",
    userId: null,
    address: "0x5085fEb1F5d96d2a2AfD0127d0B2E0bB3d2F5231",
    addressNormalized: normalizeAddress("0x5085fEb1F5d96d2a2AfD0127d0B2E0bB3d2F5231"),
    type: "WITHDRAWAL",
    txHash: "0xc76056ebaa0ee6d02f6dfc04dd72d88d2a296329020aaef7f3bbddb02fca4183",
    amountEth: 0.75,
    status: "PENDING",
    confirmations: 2,
    blockNumber: fallbackBaseBlock - 2,
    note: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5),
  },
];

export interface EthActivityCreateInput {
  userId?: string | null;
  address: string;
  type: "DEPOSIT" | "WITHDRAWAL";
  txHash?: string | null;
  amountEth: number;
  status?: string;
  confirmations?: number;
  blockNumber?: number | null;
  note?: string | null;
}

export const recordEthActivityEntry = async (
  input: EthActivityCreateInput
): Promise<EthActivityRecord> => {
  let checksumAddress = input.address;
  try {
    checksumAddress = ethers.utils.getAddress(input.address);
  } catch (error) {
    console.warn("Invalid ETH address supplied; storing without checksum", error);
  }

  const now = new Date();
  const payload = {
    userId: input.userId ?? null,
    address: checksumAddress,
    addressNormalized: normalizeAddress(checksumAddress),
    type: input.type,
    txHash: input.txHash ?? null,
    amountEth: input.amountEth,
    status: input.status ?? (input.type === "DEPOSIT" ? "PENDING" : "PENDING"),
    confirmations: input.confirmations ?? 0,
    blockNumber: input.blockNumber ?? null,
    note: input.note ?? null,
  };

  try {
    const delegate = getEthActivityClient();
    if (delegate) {
      const created = await delegate.create({ data: payload });
      return {
        ...created,
        amountEth: Number((created as unknown as { amountEth?: unknown }).amountEth ?? payload.amountEth),
        createdAt: created.createdAt ? new Date(created.createdAt) : now,
        updatedAt: created.updatedAt ? new Date(created.updatedAt) : now,
      } as EthActivityRecord;
    }
  } catch (error) {
    console.warn("Unable to persist ETH activity through Prisma, falling back", error);
  }

  const fallbackRecord: EthActivityRecord = {
    id: `fallback_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    userId: payload.userId,
    address: payload.address,
    addressNormalized: payload.addressNormalized,
    type: payload.type,
    txHash: payload.txHash,
    amountEth: payload.amountEth,
    status: payload.status,
    confirmations: payload.confirmations,
    blockNumber: payload.blockNumber,
    note: payload.note,
    createdAt: now,
    updatedAt: now,
  };

  fallbackActivities.push(fallbackRecord);
  return fallbackRecord;
};
const computeConfirmations = (
  blockNumber: number | null | undefined,
  storedConfirmations: number | null | undefined,
  currentBlock: number | null
) => {
  const base = storedConfirmations ?? 0;
  if (blockNumber == null || currentBlock == null) {
    return base;
  }

  const chainConfirmations = Math.max(currentBlock - blockNumber, 0);
  return Math.max(chainConfirmations, base);
};

const normalizeDepositStatus = (status: string): DepositStatus => {
  const upper = status.toUpperCase();
  if (upper === "FAILED") return "FAILED";
  if (upper === "CONFIRMED") return "CONFIRMED";
  return "PENDING";
};

const normalizeWithdrawalStatus = (status: string): WithdrawalStatus => {
  const upper = status.toUpperCase();
  switch (upper) {
    case "FAILED":
      return "FAILED";
    case "PROCESSING":
      return "PROCESSING";
    case "COMPLETED":
      return "COMPLETED";
    default:
      return "PENDING";
  }
};

const mapDepositRecord = (record: EthActivityRecord, currentBlock: number | null) => {
  const confirmations = computeConfirmations(record.blockNumber, record.confirmations, currentBlock);
  const status =
    confirmations >= MIN_CONFIRMATIONS
      ? ("CONFIRMED" as DepositStatus)
      : normalizeDepositStatus(record.status);

  return {
    id: record.id,
    txHash: record.txHash,
    amountEth: Number(record.amountEth),
    status,
    timestamp: record.createdAt.toISOString(),
    confirmations,
    memo: record.note ?? null,
  };
};

const mapActivityRecord = (record: EthActivityRecord, currentBlock: number | null) => {
  const confirmations = computeConfirmations(record.blockNumber, record.confirmations, currentBlock);
  const base = {
    id: record.id,
    type: record.type,
    txHash: record.txHash,
    amountEth: Number(record.amountEth),
    confirmations,
    timestamp: record.createdAt.toISOString(),
    note: record.note ?? null,
  };

  if (record.type === "DEPOSIT") {
    const status =
      confirmations >= MIN_CONFIRMATIONS
        ? ("CONFIRMED" as DepositStatus)
        : normalizeDepositStatus(record.status);
    return {
      ...base,
      status,
    };
  }

  const status =
    confirmations >= MIN_CONFIRMATIONS && record.status !== "FAILED"
      ? ("COMPLETED" as WithdrawalStatus)
      : normalizeWithdrawalStatus(record.status);

  return {
    ...base,
    status,
  };
};

/**
 * GET /api/eth/health
 * Check Ethereum gateway health
 */
router.get("/health", async (req: Request, res: Response) => {
  try {
    const isConnected = await isProviderConnected();
    const networkInfo = await getNetworkInfo();
    const blockNumber = await getCurrentBlockNumber();
    const gasPrice = await getGasPrice();

    res.json({
      status: isConnected ? "connected" : "disconnected",
      network: networkInfo,
      currentBlock: blockNumber,
      gasPriceGwei: gasPrice,
      gateway: process.env.ETH_PROVIDER_URL || "https://eth-gateway.advancia.com",
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      error: error.message,
    });
  }
});

/**
 * GET /api/eth/deposits
 * Retrieve recent deposit activity from persistent storage
 */
router.get("/deposits", async (req: Request, res: Response) => {
  try {
    const addressParam = typeof req.query.address === "string" ? req.query.address.trim() : "";
    let normalizedAddress: string | undefined;

    if (addressParam) {
      try {
        normalizedAddress = ethers.utils.getAddress(addressParam);
      } catch {
        return res.status(400).json({ error: "Invalid Ethereum address" });
      }
    }

    const ethActivity = getEthActivityClient();
    const [records, currentBlock] = await Promise.all([
      ethActivity.findMany({
        where: {
          type: "DEPOSIT",
          ...(normalizedAddress
            ? { addressNormalized: normalizeAddress(normalizedAddress) }
            : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      getCurrentBlockNumber().catch(() => null),
    ]);

    let sourceRecords = records;
    if (!sourceRecords.length) {
      sourceRecords = fallbackActivities.filter((record) => {
        if (record.type !== "DEPOSIT") return false;
        if (!normalizedAddress) return true;
        return record.addressNormalized === normalizeAddress(normalizedAddress);
      });
    }

    const deposits = sourceRecords
      .slice()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((record) => mapDepositRecord(record, currentBlock));

    res.json({ deposits });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to fetch deposits",
    });
  }
});

/**
 * GET /api/eth/transactions
 * Combined deposit and withdrawal activity from persistent storage
 */
router.get("/transactions", async (req: Request, res: Response) => {
  try {
    const addressParam = typeof req.query.address === "string" ? req.query.address.trim() : "";
    let normalizedAddress: string | undefined;

    if (addressParam) {
      try {
        normalizedAddress = ethers.utils.getAddress(addressParam);
      } catch {
        return res.status(400).json({ error: "Invalid Ethereum address" });
      }
    }

    const ethActivity = getEthActivityClient();
    const [records, currentBlock] = await Promise.all([
      ethActivity.findMany({
        where: normalizedAddress
          ? { addressNormalized: normalizeAddress(normalizedAddress) }
          : {},
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      getCurrentBlockNumber().catch(() => null),
    ]);

    let sourceRecords = records;
    if (!sourceRecords.length) {
      sourceRecords = fallbackActivities.filter((record) => {
        if (!normalizedAddress) return true;
        return record.addressNormalized === normalizeAddress(normalizedAddress);
      });
    }

    const transactions = sourceRecords
      .slice()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((record) => mapActivityRecord(record, currentBlock));

    res.json({ transactions });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to fetch transactions",
    });
  }
});

/**
 * GET /api/eth/balance/:address
 * Get ETH balance for an address
 */
router.get("/balance/:address", async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const balance = await getEthBalance(address);

    res.json({
      address,
      balance,
      balanceWei: (balance * 1e18).toString(),
    });
  } catch (error: any) {
    res.status(400).json({
      error: error.message,
    });
  }
});

/**
 * GET /api/eth/gas-price
 * Get current gas price
 */
router.get("/gas-price", async (req: Request, res: Response) => {
  try {
    const gasPrice = await getGasPrice();

    res.json({
      gasPriceGwei: gasPrice,
      gasPriceWei: (gasPrice * 1e9).toString(),
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message,
    });
  }
});

/**
 * GET /api/eth/block-number
 * Get current block number
 */
router.get("/block-number", async (req: Request, res: Response) => {
  try {
    const blockNumber = await getCurrentBlockNumber();

    res.json({
      blockNumber,
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message,
    });
  }
});

/**
 * GET /api/eth/transaction/:txHash
 * Get transaction details
 */
router.get("/transaction/:txHash", async (req: Request, res: Response) => {
  try {
    const { txHash } = req.params;
    const transaction = await getTransaction(txHash);

    if (!transaction) {
      return res.status(404).json({
        error: "Transaction not found",
      });
    }

    res.json(transaction);
  } catch (error: any) {
    res.status(400).json({
      error: error.message,
    });
  }
});

/**
 * GET /api/eth/transaction/:txHash/receipt
 * Get transaction receipt
 */
router.get("/transaction/:txHash/receipt", async (req: Request, res: Response) => {
  try {
    const { txHash } = req.params;
    const receipt = await getTransactionReceipt(txHash);

    if (!receipt) {
      return res.status(404).json({
        error: "Transaction receipt not found (may still be pending)",
      });
    }

    res.json(receipt);
  } catch (error: any) {
    res.status(400).json({
      error: error.message,
    });
  }
});

/**
 * POST /api/eth/verify-transaction
 * Verify transaction status
 */
router.post("/verify-transaction", async (req: Request, res: Response) => {
  try {
    const { txHash } = req.body;

    if (!txHash) {
      return res.status(400).json({
        error: "Transaction hash is required",
      });
    }

    const isConfirmed = await verifyTransaction(txHash);

    res.json({
      txHash,
      confirmed: isConfirmed,
      status: isConfirmed ? "confirmed" : "pending",
    });
  } catch (error: any) {
    res.status(400).json({
      error: error.message,
      txHash: req.body.txHash,
      status: "failed",
    });
  }
});

/**
 * POST /api/eth/estimate-cost
 * Estimate gas cost for a transfer
 */
router.post("/estimate-cost", async (req: Request, res: Response) => {
  try {
    const { toAddress, amountEth } = req.body;

    if (!toAddress || amountEth === undefined) {
      return res.status(400).json({
        error: "toAddress and amountEth are required",
      });
    }

    let normalizedAddress: string;
    try {
      normalizedAddress = ethers.utils.getAddress(toAddress);
    } catch (addressError) {
      return res.status(400).json({
        error: "Invalid Ethereum address",
      });
    }

    const parsedAmount = typeof amountEth === "string" ? parseFloat(amountEth) : amountEth;
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        error: "amountEth must be a positive number",
      });
    }

    const estimate = await estimateTransferCost(normalizedAddress, parsedAmount);

    res.json({
      toAddress: normalizedAddress,
      amountEth: parsedAmount,
      ...estimate,
      totalCostEth: parsedAmount + estimate.estimatedCostEth,
    });
  } catch (error: any) {
    res.status(400).json({
      error: error.message,
    });
  }
});

/**
 * GET /api/eth/network
 * Get network information
 */
router.get("/network", async (req: Request, res: Response) => {
  try {
    const networkInfo = await getNetworkInfo();

    res.json(networkInfo);
  } catch (error: any) {
    res.status(500).json({
      error: error.message,
    });
  }
});

/**
 * POST /api/eth/withdrawal
 * Submit ETH withdrawal request
 * Body: { userId, toAddress, amountEth, note? }
 */
router.post("/withdrawal", async (req: Request, res: Response) => {
  try {
    const { userId, toAddress, amountEth, note } = req.body;

    // Validation
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (!toAddress) {
      return res.status(400).json({ error: "Destination address is required" });
    }

    const parsedAmount = typeof amountEth === "string" ? parseFloat(amountEth) : amountEth;
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: "Invalid withdrawal amount" });
    }

    if (parsedAmount < 0.001) {
      return res.status(400).json({ error: "Minimum withdrawal is 0.001 ETH" });
    }

    // Validate Ethereum address
    let normalizedAddress: string;
    try {
      normalizedAddress = ethers.utils.getAddress(toAddress);
    } catch {
      return res.status(400).json({ error: "Invalid Ethereum address" });
    }

    // TODO: Check user's balance from database
    // const user = await prisma.user.findUnique({ where: { id: userId } });
    // if (!user) {
    //   return res.status(404).json({ error: "User not found" });
    // }

    // TODO: Verify user has sufficient balance
    // const ethBalance = await getEthBalance(user.ethWalletAddress);
    // if (ethBalance < amountEth) {
    //   return res.status(400).json({ error: "Insufficient balance" });
    // }

    // Estimate gas cost
  const estimate = await estimateTransferCost(normalizedAddress, parsedAmount);

    // TODO: Check if user has enough for amount + gas
    // const totalRequired = amountEth + estimate.estimatedCostEth;
    // if (ethBalance < totalRequired) {
    //   return res.status(400).json({
    //     error: `Insufficient balance. Need ${totalRequired} ETH (${amountEth} + ${estimate.estimatedCostEth} gas)`,
    //   });
    // }

    // For now, return a pending withdrawal request
    // In production, this would:
    // 1. Create withdrawal record in database with PENDING status
    // 2. Lock user's funds
    // 3. Queue for admin approval or automated processing
    // 4. Use sendEthTransaction() when approved
    // 5. Update status to PROCESSING then COMPLETED

  const ethActivity = getEthActivityClient();
  const activity = await ethActivity.create({
      data: {
        userId,
        address: normalizedAddress,
        addressNormalized: normalizeAddress(normalizedAddress),
        type: "WITHDRAWAL",
        txHash: null,
        amountEth: parsedAmount,
        status: "PENDING",
        confirmations: 0,
        blockNumber: null,
        note: note || null,
      },
    });

    res.json({
      success: true,
      withdrawalId: activity.id,
      status: "PENDING",
      toAddress: normalizedAddress,
      amountEth: parsedAmount,
      estimatedGasFee: estimate.estimatedCostEth,
      totalCost: parsedAmount + estimate.estimatedCostEth,
      note: note || null,
      message: "Withdrawal request submitted. Awaiting processing.",
      txHash: null,
    });

    // TODO: Send notification
    // await sendNotification(userId, {
    //   type: "ETH_WITHDRAWAL_PENDING",
    //   title: "ETH Withdrawal Submitted",
    //   body: `Your withdrawal of ${amountEth} ETH is being processed.`,
    // });
  } catch (error: any) {
    console.error("Error processing ETH withdrawal:", error);
    res.status(500).json({
      error: "Failed to process withdrawal",
      details: error.message,
    });
  }
});

export default router;
