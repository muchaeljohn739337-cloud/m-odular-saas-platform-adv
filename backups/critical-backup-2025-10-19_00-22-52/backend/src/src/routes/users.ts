import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken, requireAdmin, logAdminAction } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// Get all users with their token wallet balances (ADMIN ONLY)
router.get("/users", authenticateToken, requireAdmin, async (req, res) => {
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
          select: {
            balance: true,
            tokenType: true,
            lockedBalance: true,
            lifetimeEarned: true,
          }
        },
        userTier: {
          select: {
            currentTier: true,
            points: true,
          }
        }
      },
    });
    
    // Format the response to include a combined name and primary balance
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
      email: user.email,
      role: user.userTier?.currentTier || 'bronze',
      balance: Number(user.tokenWallet?.balance || 0),
      wallet: user.tokenWallet,
      isActive: true
    }));
    
    res.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    // Return empty array instead of error when database is unavailable
    res.json([]);
  }
});

// Update user wallet balance (ADMIN ONLY)
router.post("/fund/:id", authenticateToken, requireAdmin, logAdminAction, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    
    if (!amount || typeof amount !== 'number') {
      return res.status(400).json({ error: "Invalid amount provided" });
    }
    
    // Get user first
    const user = await prisma.user.findUnique({
      where: { id },
      select: { 
        id: true, 
        username: true, 
        firstName: true, 
        lastName: true,
        tokenWallet: true 
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Update or create token wallet
    const wallet = await prisma.tokenWallet.upsert({
      where: { userId: id },
      update: {
        balance: amount,
        lifetimeEarned: {
          increment: amount
        }
      },
      create: {
        userId: id,
        balance: amount,
        lifetimeEarned: amount,
        tokenType: "ADVANCIA"
      }
    });
    
    // Create a token transaction record
    await prisma.tokenTransaction.create({
      data: {
        walletId: wallet.id,
        amount: amount,
        type: "bonus",
        status: "completed",
        description: "Admin balance adjustment"
      }
    });
    
    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
    
    res.json({ 
      message: `Updated balance for ${userName}`,
      user: {
        id: user.id,
        name: userName,
        balance: Number(amount),
        wallet
      }
    });
  } catch (error) {
    console.error("Error updating user balance:", error);
    res.status(500).json({ error: "Failed to update balance" });
  }
});

// Update user role/tier (ADMIN ONLY)
router.post("/update-role/:id", authenticateToken, requireAdmin, logAdminAction, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    const validTiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'admin'];
    if (!role || !validTiers.includes(role.toLowerCase())) {
      return res.status(400).json({ error: "Invalid role" });
    }
    
    const userTier = await prisma.userTier.upsert({
      where: { userId: id },
      update: { currentTier: role.toLowerCase() },
      create: {
        userId: id,
        currentTier: role.toLowerCase(),
        points: 0
      }
    });
    
    res.json({ 
      message: `User tier updated to ${role}`,
      role: userTier.currentTier 
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ error: "Failed to update user role" });
  }
});

export default router;
