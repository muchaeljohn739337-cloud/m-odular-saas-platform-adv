/**
 * Token Wallet API Routes (Stub for testing)
 * TODO: Implement full token wallet logic
 */

import { Router, Request, Response } from "express";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Get user token wallets
router.get(
  "/wallets",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      // Stub: Return empty wallets array
      res.json([]);
    } catch (error) {
      console.error("Error fetching token wallets:", error);
      res.status(500).json({ error: "Failed to fetch token wallets" });
    }
  }
);

// Get token balance
router.get(
  "/balance",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      // Stub: Return zero balance
      res.json({
        totalBalance: "0.00",
        balances: [],
      });
    } catch (error) {
      console.error("Error fetching token balance:", error);
      res.status(500).json({ error: "Failed to fetch token balance" });
    }
  }
);

export default router;
