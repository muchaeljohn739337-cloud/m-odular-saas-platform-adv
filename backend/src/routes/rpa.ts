import { Router, Request, Response } from "express";
import { Server as SocketIOServer } from "socket.io";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import {
  createWorkflow,
  getWorkflows,
  getWorkflowById,
  updateWorkflow,
  deleteWorkflow,
  executeWorkflow,
  getExecutions,
} from "../services/rpaService";

const router = Router();
router.use(authenticateToken, requireAdmin);

let io: SocketIOServer | null = null;

export function setRPASocketIO(socketIO: SocketIOServer) {
  io = socketIO;
}

export function broadcastRPAUpdate(event: string, data: any) {
  if (io) {
    io.emit(`rpa:${event}`, data);
  }
}

// Get all workflows
router.get("/workflows", async (req: Request, res: Response) => {
  try {
    const { status, page = "1", limit = "20" } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const { items, count } = await getWorkflows({
      status: status as string | undefined,
      limit: limitNum,
      offset,
    });

    return res.json({
      success: true,
      workflows: items,
      total: count,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(count / limitNum),
    });
  } catch (error) {
    console.error("[RPA] Error fetching workflows:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch workflows",
    });
  }
});

// Get single workflow
router.get("/workflows/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const workflow = await getWorkflowById(id);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: "Workflow not found",
      });
    }

    return res.json({ success: true, workflow });
  } catch (error) {
    console.error("[RPA] Error fetching workflow:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch workflow",
    });
  }
});

// Create workflow
router.post("/workflows", async (req: Request, res: Response) => {
  try {
    const { name, status } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: name",
      });
    }

    const workflow = await createWorkflow({
      name,
      status,
    });

    broadcastRPAUpdate("workflow:created", workflow);

    return res.status(201).json({ success: true, workflow });
  } catch (error) {
    console.error("[RPA] Error creating workflow:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create workflow",
    });
  }
});

// Update workflow
router.patch("/workflows/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    const workflow = await updateWorkflow(id, {
      name,
      status,
    });

    broadcastRPAUpdate("workflow:updated", workflow);

    return res.json({ success: true, workflow });
  } catch (error) {
    console.error("[RPA] Error updating workflow:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update workflow",
    });
  }
});

// Delete workflow
router.delete("/workflows/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteWorkflow(id);

    broadcastRPAUpdate("workflow:deleted", { id });

    return res.json({ success: true, message: "Workflow deleted" });
  } catch (error) {
    console.error("[RPA] Error deleting workflow:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete workflow",
    });
  }
});

// Execute workflow manually
router.post("/workflows/:id/execute", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { actions } = req.body;

    const execution = await executeWorkflow({
      workflowId: id,
      result: {
        trigger: "manual",
        timestamp: new Date().toISOString(),
        actions: actions || [],
      },
    });

    broadcastRPAUpdate("execution:started", execution);

    return res.status(202).json({
      success: true,
      execution,
      message: "Workflow execution started",
    });
  } catch (error: any) {
    console.error("[RPA] Error executing workflow:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to execute workflow",
    });
  }
});

// Get executions
router.get("/executions", async (req: Request, res: Response) => {
  try {
    const { workflowId, status, page = "1", limit = "20" } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const { items, count } = await getExecutions({
      workflowId: workflowId as string | undefined,
      status: status as string | undefined,
      limit: limitNum,
      offset,
    });

    return res.json({
      success: true,
      executions: items,
      total: count,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(count / limitNum),
    });
  } catch (error) {
    console.error("[RPA] Error fetching executions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch executions",
    });
  }
});

export default router;
