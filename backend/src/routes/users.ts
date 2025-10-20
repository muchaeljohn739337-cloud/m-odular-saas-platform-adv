import { Router } from "express";
import prisma from "../prismaClient";
import { authenticateToken, requireAdmin, logAdminAction } from "../middleware/auth";
import type { Server as IOServer } from "socket.io";

const router = Router();

let ioRef: IOServer | null = null;
export function setAdminUsersSocketIO(io: IOServer) {
  ioRef = io;
}

// GET /api/admin/users
router.get("/users", authenticateToken as any, requireAdmin as any, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        tokenWallet: {
          select: { balance: true, tokenType: true, lockedBalance: true, lifetimeEarned: true },
        },
        userTier: { select: { currentTier: true, points: true } },
      },
    });

    const formatted = users.map((u) => ({
      id: u.id,
      name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username,
      email: u.email,
      role: u.userTier?.currentTier || "bronze",
      balance: Number((u as any).tokenWallet?.balance || 0),
      wallet: (u as any).tokenWallet,
      isActive: true,
    }));

    return res.json(formatted);
  } catch (err) {
    console.error("Error fetching users:", err);
    return res.json([]);
  }
});

// POST /api/admin/fund/:id
router.post("/fund/:id", authenticateToken as any, requireAdmin as any, logAdminAction as any, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body || {};
    if (typeof amount !== "number" || isNaN(amount)) {
      return res.status(400).json({ error: "Invalid amount provided" });
    }

    const user = await prisma.user.findUnique({ where: { id }, select: { id: true, username: true, firstName: true, lastName: true } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const wallet = await prisma.tokenWallet.upsert({
      where: { userId: id },
      update: { balance: amount, lifetimeEarned: { increment: amount } },
      create: { userId: id, balance: amount, lifetimeEarned: amount, tokenType: "ADVANCIA" },
    });

    await prisma.tokenTransaction.create({
      data: { walletId: wallet.id, amount: amount, type: "bonus", status: "completed", description: "Admin balance adjustment" },
    });

    const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username;
    return res.json({ message: `Updated balance for ${userName}`, user: { id: user.id, name: userName, balance: Number(amount), wallet } });
  } catch (err) {
    console.error("Error updating user balance:", err);
    return res.status(500).json({ error: "Failed to update balance" });
  }
});

// POST /api/admin/fund-all
// Increment usdBalance for all users by amount; create transactions and admin accounting
router.post(
  "/fund-all",
  authenticateToken as any,
  requireAdmin as any,
  logAdminAction as any,
  async (req, res) => {
    try {
      const { amount, description, batchSize: bs } = req.body || {};
      const amt = Number(amount);
      const batchSize = Math.max(1, Math.min(10_000, Number(bs) || 1000));
      if (!amount || isNaN(amt) || amt <= 0) {
        return res.status(400).json({ error: "A positive amount is required." });
      }

      // Fetch all user IDs (filtering can be applied if desired)
      const users = await prisma.user.findMany({ select: { id: true } });
      const userIds = users.map((u) => u.id);
      const totalUsers = userIds.length;
      if (totalUsers === 0) return res.json({ creditedUsers: 0, amountPerUser: amt, totalAmount: 0, batchSize });

      let processed = 0;
      let batchIndex = 0;
      for (let i = 0; i < userIds.length; i += batchSize) {
        const chunk = userIds.slice(i, i + batchSize);
        const chunkTotal = amt * chunk.length;
        batchIndex += 1;

        await prisma.$transaction(async (tx) => {
          // Admin accounting for this batch
          await tx.adminPortfolio.upsert({
            where: { currency: "USD" },
            update: { balance: { decrement: chunkTotal } },
            create: { currency: "USD", balance: -chunkTotal },
          });
          await tx.adminTransfer.create({
            data: {
              currency: "USD",
              amount: chunkTotal,
              source: "admin:bulk-credit",
              note: `Bulk credit batch ${batchIndex} (+$${amt} x ${chunk.length})${description ? ` - ${description}` : ""}`,
            },
          });

          // Credit users in this batch
          await tx.user.updateMany({ where: { id: { in: chunk } }, data: { usdBalance: { increment: amt } } });
          await tx.transaction.createMany({
            data: chunk.map((id) => ({
              userId: id,
              amount: amt,
              type: "credit",
              description: description || "Admin bulk credit",
              status: "completed",
            })),
          });
        });

        processed += chunk.length;

        // Progress and user notifications (best-effort; may be heavy for very large batches)
        if (ioRef) {
          try {
            for (const id of chunk) ioRef.to(`user-${id}`).emit("balance-updated", { userId: id, delta: amt });
            ioRef.emit("admin:bulk-credit:progress", {
              processed,
              totalUsers,
              batchSize,
              amountPerUser: amt,
              batchIndex,
            });
          } catch (e) {
            console.error("Socket emit failed (bulk credit progress)", e);
          }
        }
      }

      ioRef?.emit("admin:bulk-credit:done", {
        processed: totalUsers,
        totalUsers,
        amountPerUser: amt,
        totalAmount: amt * totalUsers,
      });

      return res.json({ creditedUsers: totalUsers, amountPerUser: amt, totalAmount: amt * totalUsers, batchSize });
    } catch (err) {
      console.error("Error in bulk credit (batched):", err);
      return res.status(500).json({ error: "Failed to credit all users (batched)" });
    }
  }
);

// POST /api/admin/update-role/:id
router.post("/update-role/:id", authenticateToken as any, requireAdmin as any, logAdminAction as any, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body || {};
    const validTiers = ["bronze", "silver", "gold", "platinum", "diamond", "admin"];
    if (!role || !validTiers.includes(String(role).toLowerCase())) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const userTier = await prisma.userTier.upsert({
      where: { userId: id },
      update: { currentTier: String(role).toLowerCase() },
      create: { userId: id, currentTier: String(role).toLowerCase(), points: 0 },
    });

    return res.json({ message: `User tier updated to ${role}`, role: userTier.currentTier });
  } catch (err) {
    console.error("Error updating user role:", err);
    return res.status(500).json({ error: "Failed to update user role" });
  }
});

// GET /api/admin/bulk-credits/recent?limit=5
// Returns most recent AdminTransfer entries with source = 'admin:bulk-credit'
router.get("/bulk-credits/recent", authenticateToken as any, requireAdmin as any, async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 5));
    const rows = await prisma.adminTransfer.findMany({
      where: { source: "admin:bulk-credit" },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, amount: true, note: true, createdAt: true },
    });
    const result = rows.map((r) => ({
      id: r.id,
      amount: Number(r.amount),
      note: r.note || null,
      createdAt: r.createdAt,
    }));
    return res.json({ items: result });
  } catch (err) {
    console.error("Error fetching recent bulk credits:", err);
    return res.status(500).json({ error: "Failed to fetch recent bulk credits" });
  }
});

// GET /api/admin/bulk-credits?page=1&pageSize=5
// Paginated list with running total and total count
router.get("/bulk-credits", authenticateToken as any, requireAdmin as any, async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.max(1, Math.min(100, Number((req.query as any).pageSize) || 5));
    const skip = (page - 1) * pageSize;
    const where = { source: "admin:bulk-credit" as const };

    const [rows, aggregates] = await prisma.$transaction([
      prisma.adminTransfer.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        select: { id: true, amount: true, note: true, createdAt: true },
      }),
      prisma.adminTransfer.aggregate({ where, _sum: { amount: true }, _count: true }),
    ]);

    const totalItems = aggregates._count || 0;
    const totalAmount = Number(aggregates._sum?.amount || 0);
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    const items = rows.map((r) => ({ id: r.id, amount: Number(r.amount), note: r.note || null, createdAt: r.createdAt }));
    return res.json({ items, page, pageSize, totalItems, totalPages, totalAmount });
  } catch (err) {
    console.error("Error fetching paginated bulk credits:", err);
    return res.status(500).json({ error: "Failed to fetch bulk credits" });
  }
});

export default router;
