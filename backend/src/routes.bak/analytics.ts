import express, { Request, Response } from "express";
const router = express.Router();

// 📊 Example analytics route
router.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Analytics route active ✅",
    visitors: Math.floor(Math.random() * 1000),
    activeUsers: Math.floor(Math.random() * 500),
    transactions: Math.floor(Math.random() * 200),
  });
});

export default router;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Build where clause
      const whereClause: any = {
        createdAt: { gte: startDate },
        status: "completed",
      };

      if (type && (type === "credit" || type === "debit")) {
        whereClause.type = type;
      }

      // Get transactions grouped by date
      const transactions = await prisma.transaction.findMany({
        where: whereClause,
        select: {
          amount: true,
          createdAt: true,
          type: true,
        },
        orderBy: { createdAt: "asc" },
      });

      // Group by date
      const dateMap = new Map<string, { volume: number; count: number }>();

      transactions.forEach((tx) => {
        const dateKey = tx.createdAt.toISOString().split("T")[0];
        const current = dateMap.get(dateKey) || { volume: 0, count: 0 };
        current.volume += Number(tx.amount);
        current.count += 1;
        dateMap.set(dateKey, current);
      });

      // Fill in missing dates with zeros
      const result: {
        dates: string[];
        volumes: number[];
        counts: number[];
      } = {
        dates: [],
        volumes: [],
        counts: [],
      };

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split("T")[0];

        result.dates.push(dateKey);
        const data = dateMap.get(dateKey);
        result.volumes.push(data?.volume || 0);
        result.counts.push(data?.count || 0);
      }

      // Calculate totals
      const totalVolume = result.volumes.reduce((a, b) => a + b, 0);
      const totalCount = result.counts.reduce((a, b) => a + b, 0);
      const avgVolume = totalCount > 0 ? totalVolume / totalCount : 0;

      res.json({
        ...result,
        summary: {
          totalVolume: Math.round(totalVolume * 100) / 100,
          totalCount,
          avgVolume: Math.round(avgVolume * 100) / 100,
          periodDays: days,
        },
      });
    } catch (error) {
      console.error("Error fetching transaction analytics:", error);
      res.status(500).json({ error: "Failed to fetch transaction analytics" });
    }
  }
);

/**
 * GET /api/analytics/users
 * Get user registration and growth statistics
 * Query params: days (default: 30)
 */
router.get("/users", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;

    // Calculate start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get users registered in period
    const users = await prisma.user.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        role: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Get total users before period
    const usersBeforePeriod = await prisma.user.count({
      where: {
        createdAt: { lt: startDate },
      },
    });

    // Group by date
    const dateMap = new Map<string, number>();

    users.forEach((user) => {
      const dateKey = user.createdAt.toISOString().split("T")[0];
      dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
    });

    // Build result with cumulative counts
    const result: {
      dates: string[];
      newUsers: number[];
      totalUsers: number[];
    } = {
      dates: [],
      newUsers: [],
      totalUsers: [],
    };

    let cumulativeCount = usersBeforePeriod;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];

      const newCount = dateMap.get(dateKey) || 0;
      cumulativeCount += newCount;

      result.dates.push(dateKey);
      result.newUsers.push(newCount);
      result.totalUsers.push(cumulativeCount);
    }

    // Get active users (logged in within 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeUsers = await prisma.user.count({
      where: {
        lastLogin: { gte: sevenDaysAgo },
      },
    });

    // Get total users count
    const totalUsers = await prisma.user.count();

    res.json({
      ...result,
      summary: {
        totalUsers,
        activeUsers,
        newUsersInPeriod: users.length,
        growthRate:
          usersBeforePeriod > 0
            ? Math.round(((users.length / usersBeforePeriod) * 100 * 100) / 100)
            : 0,
        periodDays: days,
      },
    });
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    res.status(500).json({ error: "Failed to fetch user analytics" });
  }
});

/**
 * GET /api/analytics/revenue
 * Get revenue and currency distribution statistics
 * Query params: days (default: 30)
 */
router.get("/revenue", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get credit transactions (revenue)
    const creditTransactions = await prisma.transaction.findMany({
      where: {
        type: "credit",
        status: "completed",
        createdAt: { gte: startDate },
      },
      select: {
        amount: true,
        createdAt: true,
      },
    });

    // Group by date
    const dateMap = new Map<string, number>();

    creditTransactions.forEach((tx) => {
      const dateKey = tx.createdAt.toISOString().split("T")[0];
      dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + Number(tx.amount));
    });

    // Build result
    const result: {
      dates: string[];
      revenue: number[];
    } = {
      dates: [],
      revenue: [],
    };

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];

      result.dates.push(dateKey);
      result.revenue.push(dateMap.get(dateKey) || 0);
    }

    // Get token wallet distribution
    const tokenWallets = await prisma.tokenWallet.findMany({
      select: {
        balance: true,
        tokenType: true,
      },
    });

    const currencyDistribution: Record<string, number> = {};
    tokenWallets.forEach((wallet) => {
      const type = wallet.tokenType || "ADVANCIA";
      currencyDistribution[type] = (currencyDistribution[type] || 0) + Number(wallet.balance);
    });

    const totalRevenue = result.revenue.reduce((a, b) => a + b, 0);

    res.json({
      ...result,
      currencyDistribution,
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        avgDailyRevenue: Math.round((totalRevenue / days) * 100) / 100,
        periodDays: days,
      },
    });
  } catch (error) {
    console.error("Error fetching revenue analytics:", error);
    res.status(500).json({ error: "Failed to fetch revenue analytics" });
  }
});

/**
 * GET /api/analytics/summary
 * Get overall platform statistics summary
 */
router.get("/summary", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    // Get total users
    const totalUsers = await prisma.user.count();

    // Get active users (logged in within 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUsers = await prisma.user.count({
      where: {
        lastLogin: { gte: sevenDaysAgo },
      },
    });

    // Get total transactions
    const totalTransactions = await prisma.transaction.count({
      where: { status: "completed" },
    });

    // Get total volume
    const volumeResult = await prisma.transaction.aggregate({
      where: {
        status: "completed",
        type: "credit",
      },
      _sum: {
        amount: true,
      },
    });

    const totalVolume = volumeResult._sum.amount
      ? Math.round(Number(volumeResult._sum.amount) * 100) / 100
      : 0;

    // Get suspended users
    const suspendedUsers = 0; // Add when user suspension is implemented

    // Get pending KYC (if model exists)
    let pendingApprovals = 0;
    try {
      // This would require a KYC model
      // pendingApprovals = await prisma.kycVerification.count({
      //   where: { status: "pending" }
      // });
    } catch (e) {
      // KYC model might not exist yet
    }

    // Get users created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await prisma.user.count({
      where: {
        createdAt: { gte: today },
      },
    });

    // Get transactions today
    const transactionsToday = await prisma.transaction.count({
      where: {
        createdAt: { gte: today },
        status: "completed",
      },
    });

    res.json({
      totalUsers,
      activeUsers,
      totalTransactions,
      totalVolume,
      suspendedUsers,
      pendingApprovals,
      today: {
        newUsers: newUsersToday,
        transactions: transactionsToday,
      },
    });
  } catch (error) {
    console.error("Error fetching summary analytics:", error);
    res.status(500).json({ error: "Failed to fetch summary analytics" });
  }
});

/**
 * GET /api/analytics/health-stats
 * Get health reading statistics
 * Query params: days (default: 30)
 */
router.get(
  "/health-stats",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const days = parseInt(req.query.days as string) || 30;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get health readings count
      const totalReadings = await prisma.healthReading.count({
        where: {
          recordedAt: { gte: startDate },
        },
      });

      // Get unique users with health data
      const uniqueUsers = await prisma.healthReading.findMany({
        where: {
          recordedAt: { gte: startDate },
        },
        select: {
          userId: true,
        },
        distinct: ["userId"],
      });

      // Get average metrics
      const avgMetrics = await prisma.healthReading.aggregate({
        where: {
          recordedAt: { gte: startDate },
        },
        _avg: {
          heartRate: true,
          bloodPressureSys: true,
          bloodPressureDia: true,
          steps: true,
          sleepHours: true,
          oxygenLevel: true,
        },
      });

      res.json({
        totalReadings,
        uniqueUsers: uniqueUsers.length,
        averages: {
          heartRate: avgMetrics._avg.heartRate
            ? Math.round(avgMetrics._avg.heartRate)
            : null,
          bloodPressure: avgMetrics._avg.bloodPressureSys
            ? `${Math.round(avgMetrics._avg.bloodPressureSys)}/${Math.round(avgMetrics._avg.bloodPressureDia || 0)}`
            : null,
          steps: avgMetrics._avg.steps ? Math.round(avgMetrics._avg.steps) : null,
          sleepHours: avgMetrics._avg.sleepHours
            ? Math.round(Number(avgMetrics._avg.sleepHours) * 10) / 10
            : null,
          oxygenLevel: avgMetrics._avg.oxygenLevel
            ? Math.round(avgMetrics._avg.oxygenLevel)
            : null,
        },
        periodDays: days,
      });
    } catch (error) {
      console.error("Error fetching health analytics:", error);
      res.status(500).json({ error: "Failed to fetch health analytics" });
    }
  }
);

export default router;
