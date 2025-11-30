import { Request, Response, Router } from "express";
import { getAutoPrecisionCore } from "../ai/auto_precision_integration";
import { authenticateToken, requireAdmin } from "../middleware/auth";

const router = Router();

/**
 * ═══════════════════════════════════════════════════════════════
 * AUTO-PRECISION CORE API ENDPOINTS
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * POST /api/jobs/execute
 * Execute a job with full Auto-Precision Core capabilities
 */
router.post(
  "/execute",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { jobType, payload, options } = req.body;

      if (!jobType || !payload) {
        return res
          .status(400)
          .json({ error: "jobType and payload are required" });
      }

      const autoPrecision = getAutoPrecisionCore();
      const result = await autoPrecision.executeJob(jobType, payload, options);

      if (result.duplicate) {
        return res.status(409).json({
          error: "Duplicate job detected",
          existingJobId: result.existingJobId,
          message: result.message,
        });
      }

      res.json({
        success: result.success,
        jobId: result.jobId,
        data: result.data,
        executionTime: result.executionTime,
      });
    } catch (error: any) {
      console.error("Job execution error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * GET /api/jobs/:jobId
 * Get job status and results
 */
router.get(
  "/:jobId",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { jobId } = req.params;

      const { prisma } = require("../ai/auto_precision_integration");
      const job = await prisma.job.findUnique({
        where: { id: jobId },
      });

      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      res.json(job);
    } catch (error: any) {
      console.error("Error fetching job:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * POST /api/jobs/calculate
 * Perform precision-safe calculation
 */
router.post(
  "/calculate",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { operation, values } = req.body;

      if (!operation || !Array.isArray(values)) {
        return res
          .status(400)
          .json({ error: "operation and values array are required" });
      }

      const autoPrecision = getAutoPrecisionCore();
      const result = autoPrecision.calculate(operation, values);

      res.json({
        operation,
        inputs: values,
        result,
        precision_decimals: autoPrecision.config.precisionDecimals,
      });
    } catch (error: any) {
      console.error("Calculation error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * POST /api/jobs/search
 * AI-powered search across all data sources
 */
router.post(
  "/search",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { query, options } = req.body;

      if (!query) {
        return res.status(400).json({ error: "query is required" });
      }

      const autoPrecision = getAutoPrecisionCore();
      const results = await autoPrecision.search(query, options);

      res.json(results);
    } catch (error: any) {
      console.error("Search error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * GET /api/jobs/memory/recall
 * Recall similar past jobs for optimization
 */
router.get(
  "/memory/recall",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { jobType, payload, limit } = req.query;

      if (!jobType) {
        return res.status(400).json({ error: "jobType is required" });
      }

      const autoPrecision = getAutoPrecisionCore();
      const payloadObj = payload ? JSON.parse(String(payload)) : {};
      const similarJobs = await autoPrecision.recallSimilarJobs(
        String(jobType),
        payloadObj,
        limit ? parseInt(String(limit)) : 5
      );

      res.json({
        jobType,
        similarJobsCount: similarJobs.length,
        jobs: similarJobs,
      });
    } catch (error: any) {
      console.error("Recall error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * ═══════════════════════════════════════════════════════════════
 * ADMIN ENDPOINTS
 * ═══════════════════════════════════════════════════════════════
 */

router.use(requireAdmin); // All routes below require admin

/**
 * GET /api/jobs/statistics
 * Get Auto-Precision Core statistics
 */
router.get("/statistics", async (req: Request, res: Response) => {
  try {
    const autoPrecision = getAutoPrecisionCore();
    const stats = autoPrecision.getStatistics();

    res.json({
      ...stats,
      uptime_seconds: process.uptime(),
      memory_usage_mb: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
        2
      ),
    });
  } catch (error: any) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/jobs/rules
 * Create new business rule
 */
router.post("/rules", async (req: Request, res: Response) => {
  try {
    const { rule_name, job_type, condition, severity, error_message } =
      req.body;

    if (!rule_name || !job_type || !condition) {
      return res
        .status(400)
        .json({ error: "rule_name, job_type, and condition are required" });
    }

    const { prisma } = require("../ai/auto_precision_integration");
    const rule = await prisma.businessRule.create({
      data: {
        rule_name,
        job_type,
        condition,
        severity: severity || "MEDIUM",
        error_message,
        enabled: true,
      },
    });

    res.json(rule);
  } catch (error: any) {
    console.error("Error creating business rule:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/jobs/rules
 * List all business rules
 */
router.get("/rules", async (req: Request, res: Response) => {
  try {
    const { job_type, enabled } = req.query;

    const { prisma } = require("../ai/auto_precision_integration");
    const where: any = {};

    if (job_type) where.job_type = String(job_type);
    if (enabled !== undefined) where.enabled = enabled === "true";

    const rules = await prisma.businessRule.findMany({
      where,
      orderBy: { created_at: "desc" },
    });

    res.json(rules);
  } catch (error: any) {
    console.error("Error fetching business rules:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/jobs/rules/:id
 * Update business rule
 */
router.patch("/rules/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { prisma } = require("../ai/auto_precision_integration");
    const rule = await prisma.businessRule.update({
      where: { id },
      data: updates,
    });

    res.json(rule);
  } catch (error: any) {
    console.error("Error updating business rule:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/jobs/migrations
 * List migration checkpoints
 */
router.get("/migrations", async (req: Request, res: Response) => {
  try {
    const { status, migration_type } = req.query;

    const { prisma } = require("../ai/auto_precision_integration");
    const where: any = {};

    if (status) where.status = String(status);
    if (migration_type) where.migration_type = String(migration_type);

    const migrations = await prisma.migrationCheckpoint.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: 50,
    });

    res.json(migrations);
  } catch (error: any) {
    console.error("Error fetching migrations:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/jobs/migrate
 * Execute migration
 */
router.post("/migrate", async (req: Request, res: Response) => {
  try {
    const { migrationType, targetName, targetVersion, changes } = req.body;

    if (!migrationType || !targetName || !targetVersion || !changes) {
      return res.status(400).json({
        error:
          "migrationType, targetName, targetVersion, and changes are required",
      });
    }

    const autoPrecision = getAutoPrecisionCore();
    const result = await autoPrecision.executeMigration({
      migrationType,
      targetName,
      targetVersion,
      changes,
    });

    res.json(result);
  } catch (error: any) {
    console.error("Migration error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/jobs/cache/clear
 * Clear internal caches (maintenance)
 */
router.post("/cache/clear", async (req: Request, res: Response) => {
  try {
    const autoPrecision = getAutoPrecisionCore();
    autoPrecision.clearCaches();

    res.json({
      success: true,
      message: "Caches cleared successfully",
    });
  } catch (error: any) {
    console.error("Error clearing caches:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/jobs/health
 * Health check for Auto-Precision Core
 */
router.get("/health", async (req: Request, res: Response) => {
  try {
    const autoPrecision = getAutoPrecisionCore();
    const stats = autoPrecision.getStatistics();

    res.json({
      status: "healthy",
      auto_precision_active: true,
      statistics: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      status: "unhealthy",
      error: error.message,
    });
  }
});

export default router;
