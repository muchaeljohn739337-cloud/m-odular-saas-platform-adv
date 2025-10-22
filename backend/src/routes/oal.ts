/**
 * OAL (Object-Action-Location) Audit Log Routes
 *
 * Admin-only endpoints for viewing and managing audit logs
 */

import { Router, Request, Response } from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import {
  createOALLog,
  updateOALStatus,
  getOALLogs,
  getOALLogById,
  logBalanceAdjustment,
} from "../services/oalService";
import { OALStatus } from "@prisma/client";

const router = Router();

// All routes require admin authentication
router.use(authenticateToken, requireAdmin);

/**
 * GET /api/oal
 * Get audit logs with optional filters
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const {
      object,
      action,
      location,
      status,
      createdById,
      subjectId,
      limit,
      offset,
    } = req.query;

    const logs = await getOALLogs({
      object: object as string | undefined,
      action: action as string | undefined,
      location: location as string | undefined,
      status: status as OALStatus | undefined,
      createdById: createdById as string | undefined,
      subjectId: subjectId as string | undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    return res.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error("Error fetching OAL logs:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs",
    });
  }
});

/**
 * GET /api/oal/:id
 * Get a specific audit log by ID
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const log = await getOALLogById(id);

    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Audit log not found",
      });
    }

    return res.json({
      success: true,
      log,
    });
  } catch (error) {
    console.error("Error fetching OAL log:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch audit log",
    });
  }
});

/**
 * POST /api/oal
 * Create a new audit log entry
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { object, action, location, subjectId, metadata, status } = req.body;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!object || !action || !location) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: object, action, location",
      });
    }

    const log = await createOALLog({
      object,
      action,
      location,
      subjectId,
      metadata,
      createdById: userId,
      status,
    });

    return res.status(201).json({
      success: true,
      log,
    });
  } catch (error) {
    console.error("Error creating OAL log:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create audit log",
    });
  }
});

/**
 * PATCH /api/oal/:id/status
 * Update audit log status (approve/reject)
 */
router.patch("/:id/status", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!status || !["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be APPROVED, REJECTED, or PENDING",
      });
    }

    const log = await updateOALStatus({
      id,
      status: status as OALStatus,
      updatedById: userId,
    });

    return res.json({
      success: true,
      log,
    });
  } catch (error) {
    console.error("Error updating OAL status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update audit log status",
    });
  }
});

/**
 * POST /api/oal/balance-adjustment
 * Helper endpoint to log balance adjustments
 */
router.post("/balance-adjustment", async (req: Request, res: Response) => {
  try {
    const { userId: subjectUserId, currency, delta, reason } = req.body;
    const adminId = (req as any).user?.userId;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!subjectUserId || !currency || delta === undefined || !reason) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, currency, delta, reason",
      });
    }

    const log = await logBalanceAdjustment({
      userId: subjectUserId,
      adminId,
      currency,
      delta: parseFloat(delta),
      reason,
      location: "admin.api",
    });

    return res.status(201).json({
      success: true,
      log,
    });
  } catch (error) {
    console.error("Error logging balance adjustment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to log balance adjustment",
    });
  }
});

export default router;
