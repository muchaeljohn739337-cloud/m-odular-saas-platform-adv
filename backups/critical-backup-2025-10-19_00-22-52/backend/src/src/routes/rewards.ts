import express from "express";
import prisma from "../prismaClient";
import { Decimal } from "@prisma/client/runtime/library";
import { createNotification } from "../services/notificationService";

const router = express.Router();

// Tier thresholds (points needed to reach each tier)
const TIER_THRESHOLDS = {
  bronze: 0,
  silver: 1000,
  gold: 5000,
  platinum: 15000,
  diamond: 50000,
};

// Tier multipliers for rewards
const TIER_MULTIPLIERS = {
  bronze: 1.0,
  silver: 1.2,
  gold: 1.5,
  platinum: 2.0,
  diamond: 3.0,
};

// ============================================
// REWARDS ENDPOINTS
// ============================================

/**
 * GET /api/rewards/:userId
 * Get all rewards for a user
 */
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const status = req.query.status as string;
    const type = req.query.type as string;
    
    const rewards = await prisma.reward.findMany({
      where: {
        userId,
        ...(status && { status }),
        ...(type && { type }),
      },
      orderBy: { createdAt: "desc" },
    });
    
    const formattedRewards = rewards.map(reward => ({
      ...reward,
      amount: reward.amount.toString(),
    }));
    
    res.json({ rewards: formattedRewards });
  } catch (error) {
    console.error("Error fetching rewards:", error);
    res.status(500).json({ error: "Failed to fetch rewards" });
  }
});

/**
 * GET /api/rewards/pending/:userId
 * Get pending (unclaimedrewards
 */
router.get("/pending/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const pendingRewards = await prisma.reward.findMany({
      where: {
        userId,
        status: "pending",
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });
    
    const totalPending = pendingRewards.reduce(
      (sum, reward) => sum.plus(reward.amount),
      new Decimal(0)
    );
    
    const formattedRewards = pendingRewards.map(reward => ({
      ...reward,
      amount: reward.amount.toString(),
    }));
    
    res.json({
      rewards: formattedRewards,
      totalPending: totalPending.toString(),
      count: pendingRewards.length,
    });
  } catch (error) {
    console.error("Error fetching pending rewards:", error);
    res.status(500).json({ error: "Failed to fetch pending rewards" });
  }
});

/**
 * POST /api/rewards/claim
 * Claim a pending reward
 */
router.post("/claim", async (req, res) => {
  try {
    const { userId, rewardId } = req.body;
    
    if (!userId || !rewardId) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
    });
    
    if (!reward) {
      return res.status(404).json({ error: "Reward not found" });
    }
    
    if (reward.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    if (reward.status !== "pending") {
      return res.status(400).json({ error: "Reward already claimed or expired" });
    }
    
    if (reward.expiresAt && reward.expiresAt < new Date()) {
      await prisma.reward.update({
        where: { id: rewardId },
        data: { status: "expired" },
      });
      return res.status(400).json({ error: "Reward has expired" });
    }
    
    // Get or create token wallet
    let wallet = await prisma.tokenWallet.findUnique({
      where: { userId },
    });
    
    if (!wallet) {
      wallet = await prisma.tokenWallet.create({
        data: { userId },
      });
    }
    
    // Get or create user tier
    let userTier = await prisma.userTier.findUnique({
      where: { userId },
    });
    
    if (!userTier) {
      userTier = await prisma.userTier.create({
        data: { userId },
      });
    }
    
    // Calculate bonus based on tier
    const tierMultiplier = TIER_MULTIPLIERS[userTier.currentTier as keyof typeof TIER_MULTIPLIERS] || 1.0;
    const bonusAmount = reward.amount.mul(tierMultiplier);
    
    // Claim reward
    const result = await prisma.$transaction([
      // Mark reward as claimed
      prisma.reward.update({
        where: { id: rewardId },
        data: {
          status: "claimed",
          claimedAt: new Date(),
        },
      }),
      // Add tokens to wallet
      prisma.tokenWallet.update({
        where: { userId },
        data: {
          balance: { increment: bonusAmount },
          lifetimeEarned: { increment: bonusAmount },
        },
      }),
      // Update user tier
      prisma.userTier.update({
        where: { userId },
        data: {
          points: { increment: Math.floor(reward.amount.toNumber()) },
          lifetimePoints: { increment: Math.floor(reward.amount.toNumber()) },
          lifetimeRewards: { increment: reward.amount },
        },
      }),
      // Create token transaction
      prisma.tokenTransaction.create({
        data: {
          walletId: wallet.id,
          amount: bonusAmount,
          type: "reward",
          description: `Claimed: ${reward.title}`,
          metadata: JSON.stringify({
            rewardId: reward.id,
            rewardType: reward.type,
            tierMultiplier,
          }),
          status: "completed",
        },
      }),
    ]);
    
    console.log(`🎁 User ${userId} claimed reward: ${reward.title} (+${bonusAmount} tokens)`);

    // Send notification
    try {
      await createNotification({
        userId,
        type: "all",
        priority: "normal",
        category: "reward",
        title: "Reward Claimed!",
        message: `You claimed ${bonusAmount.toFixed(2)} tokens for "${reward.title}"`,
        data: {
          rewardId: reward.id,
          amount: bonusAmount.toString(),
          type: reward.type,
          tierMultiplier,
        },
      });
    } catch (notifyErr) {
      console.warn("Reward notification failed (non-fatal):", notifyErr);
    }
    
    res.json({
      success: true,
      reward: {
        ...result[0],
        amount: result[0].amount.toString(),
      },
      tokensAdded: bonusAmount.toString(),
      newBalance: result[1].balance.toString(),
      newPoints: result[2].points,
    });
  } catch (error) {
    console.error("Error claiming reward:", error);
    res.status(500).json({ error: "Failed to claim reward" });
  }
});

/**
 * POST /api/rewards/create
 * Create a new reward (admin/system use)
 */
router.post("/create", async (req, res) => {
  try {
    const {
      userId,
      type,
      amount,
      title,
      description,
      expiresInDays,
      metadata,
    } = req.body;
    
    if (!userId || !type || !amount || !title || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;
    
    const reward = await prisma.reward.create({
      data: {
        userId,
        type,
        amount: new Decimal(amount),
        title,
        description,
        expiresAt,
        metadata,
      },
    });
    
    console.log(`🎁 Created reward for user ${userId}: ${title}`);
    
    res.json({
      success: true,
      reward: {
        ...reward,
        amount: reward.amount.toString(),
      },
    });
  } catch (error) {
    console.error("Error creating reward:", error);
    res.status(500).json({ error: "Failed to create reward" });
  }
});

/**
 * GET /api/rewards/summary/:userId
 * Get reward summary statistics
 */
router.get("/summary/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [claimed, pending, expired] = await Promise.all([
      prisma.reward.findMany({
        where: { userId, status: "claimed" },
      }),
      prisma.reward.findMany({
        where: { userId, status: "pending" },
      }),
      prisma.reward.findMany({
        where: { userId, status: "expired" },
      }),
    ]);
    
    const totalClaimed = claimed.reduce(
      (sum, r) => sum.plus(r.amount),
      new Decimal(0)
    );
    const totalPending = pending.reduce(
      (sum, r) => sum.plus(r.amount),
      new Decimal(0)
    );
    
    // Count by type
    const byType = [...claimed, ...pending].reduce((acc, reward) => {
      acc[reward.type] = (acc[reward.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    res.json({
      totalClaimed: totalClaimed.toString(),
      totalPending: totalPending.toString(),
      countClaimed: claimed.length,
      countPending: pending.length,
      countExpired: expired.length,
      byType,
    });
  } catch (error) {
    console.error("Error fetching reward summary:", error);
    res.status(500).json({ error: "Failed to fetch summary" });
  }
});

// ============================================
// USER TIER ENDPOINTS
// ============================================

/**
 * GET /api/rewards/tier/:userId
 * Get user tier information
 */
router.get("/tier/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    let userTier = await prisma.userTier.findUnique({
      where: { userId },
    });
    
    if (!userTier) {
      userTier = await prisma.userTier.create({
        data: { userId },
      });
    }
    
    // Calculate progress to next tier
    const currentTier = userTier.currentTier as keyof typeof TIER_THRESHOLDS;
    const nextTier = getNextTier(currentTier);
    const currentThreshold = TIER_THRESHOLDS[currentTier];
    const nextThreshold = nextTier ? TIER_THRESHOLDS[nextTier] : null;
    
    const progress = nextThreshold
      ? ((userTier.points - currentThreshold) / (nextThreshold - currentThreshold)) * 100
      : 100;
    
    const pointsToNextTier = nextThreshold
      ? Math.max(0, nextThreshold - userTier.points)
      : 0;
    
    res.json({
      ...userTier,
      lifetimeRewards: userTier.lifetimeRewards.toString(),
      currentTier: userTier.currentTier,
      nextTier,
      progress: Math.min(100, Math.max(0, progress)),
      pointsToNextTier,
      multiplier: TIER_MULTIPLIERS[currentTier],
    });
  } catch (error) {
    console.error("Error fetching tier info:", error);
    res.status(500).json({ error: "Failed to fetch tier info" });
  }
});

/**
 * POST /api/rewards/tier/update
 * Update user tier based on points (automatic)
 */
router.post("/tier/update", async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }
    
    let userTier = await prisma.userTier.findUnique({
      where: { userId },
    });
    
    if (!userTier) {
      userTier = await prisma.userTier.create({
        data: { userId },
      });
    }
    
    // Determine new tier based on points
    const newTier = calculateTier(userTier.points);
    
    if (newTier !== userTier.currentTier) {
      // Tier up! Create achievement reward
      userTier = await prisma.userTier.update({
        where: { userId },
        data: { currentTier: newTier },
      });
      
      // Award tier-up bonus
      const bonusAmount = new Decimal(100 * TIER_MULTIPLIERS[newTier as keyof typeof TIER_MULTIPLIERS]);
      
      await prisma.reward.create({
        data: {
          userId,
          type: "milestone",
          amount: bonusAmount,
          title: `Tier Up: ${newTier.toUpperCase()}`,
          description: `Congratulations! You've reached ${newTier} tier!`,
          status: "pending",
        },
      });
      
      console.log(`🏆 User ${userId} reached ${newTier} tier!`);
    }
    
    res.json({
      success: true,
      tier: userTier.currentTier,
      points: userTier.points,
      tierChanged: newTier !== userTier.currentTier,
    });
  } catch (error) {
    console.error("Error updating tier:", error);
    res.status(500).json({ error: "Failed to update tier" });
  }
});

/**
 * POST /api/rewards/streak/update
 * Update daily login streak
 */
router.post("/streak/update", async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }
    
    let userTier = await prisma.userTier.findUnique({
      where: { userId },
    });
    
    if (!userTier) {
      userTier = await prisma.userTier.create({
        data: { userId },
      });
    }
    
    const now = new Date();
    const lastActive = new Date(userTier.lastActiveDate);
    const hoursSinceLastActive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
    
    let newStreak = userTier.streak;
    let streakBroken = false;
    
    if (hoursSinceLastActive >= 24 && hoursSinceLastActive < 48) {
      // Continue streak
      newStreak += 1;
    } else if (hoursSinceLastActive >= 48) {
      // Streak broken
      newStreak = 1;
      streakBroken = true;
    }
    
    const longestStreak = Math.max(newStreak, userTier.longestStreak);
    
    userTier = await prisma.userTier.update({
      where: { userId },
      data: {
        streak: newStreak,
        longestStreak,
        lastActiveDate: now,
      },
    });
    
    // Award daily streak reward
    if (newStreak > 1 && !streakBroken) {
      const streakBonus = new Decimal(10 * newStreak); // Increasing bonus per day
      
      await prisma.reward.create({
        data: {
          userId,
          type: "daily",
          amount: streakBonus,
          title: `Daily Streak: Day ${newStreak}`,
          description: `You're on fire! ${newStreak} days in a row!`,
          status: "pending",
        },
      });
    }
    
    res.json({
      success: true,
      streak: newStreak,
      longestStreak,
      streakBroken,
    });
  } catch (error) {
    console.error("Error updating streak:", error);
    res.status(500).json({ error: "Failed to update streak" });
  }
});

/**
 * GET /api/rewards/leaderboard
 * Get rewards leaderboard
 */
router.get("/leaderboard", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || "lifetimeRewards";
    
    const leaderboard = await prisma.userTier.findMany({
      take: limit,
      orderBy: {
        [sortBy]: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    
    const formattedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      user: entry.user,
      tier: entry.currentTier,
      points: entry.points,
      lifetimePoints: entry.lifetimePoints,
      lifetimeRewards: entry.lifetimeRewards.toString(),
      streak: entry.streak,
      longestStreak: entry.longestStreak,
    }));
    
    res.json({ leaderboard: formattedLeaderboard });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateTier(points: number): string {
  if (points >= TIER_THRESHOLDS.diamond) return "diamond";
  if (points >= TIER_THRESHOLDS.platinum) return "platinum";
  if (points >= TIER_THRESHOLDS.gold) return "gold";
  if (points >= TIER_THRESHOLDS.silver) return "silver";
  return "bronze";
}

function getNextTier(currentTier: string): string | null {
  const tiers = ["bronze", "silver", "gold", "platinum", "diamond"];
  const currentIndex = tiers.indexOf(currentTier);
  return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
}

export default router;
