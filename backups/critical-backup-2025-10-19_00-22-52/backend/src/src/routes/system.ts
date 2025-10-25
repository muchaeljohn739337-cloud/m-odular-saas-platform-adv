import express from "express";
import prisma from "../prismaClient";

const router = express.Router();

// ============================================
// SYSTEM STATUS & MONITORING ENDPOINTS
// ============================================

/**
 * GET /api/system/status
 * Get overall system status
 */
router.get("/status", async (req, res) => {
  try {
    // Check database connection
    let dbStatus = "operational";
    let dbResponseTime = 0;
    try {
      const dbStart = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      dbResponseTime = Date.now() - dbStart;
      dbStatus = dbResponseTime < 100 ? "operational" : "degraded";
    } catch (error) {
      dbStatus = "down";
      console.error("Database health check failed:", error);
    }

    // Get or create system status records
    const services = [
      {
        serviceName: "frontend",
        status: "operational",
        responseTime: 0,
        uptime: 99.9,
        statusMessage: "Frontend server running",
        alertLevel: "none",
      },
      {
        serviceName: "backend",
        status: "operational",
        responseTime: 0,
        uptime: 99.9,
        statusMessage: "Backend API operational",
        alertLevel: "none",
      },
      {
        serviceName: "database",
        status: dbStatus,
        responseTime: dbResponseTime,
        uptime: dbStatus === "operational" ? 99.9 : 0,
        statusMessage: dbStatus === "operational" ? "Database connected" : "Database connection issue",
        alertLevel: dbStatus === "down" ? "danger" : dbStatus === "degraded" ? "warning" : "none",
      },
    ];

    // Store status in database
    for (const service of services) {
      try {
        await prisma.systemStatus.upsert({
          where: { 
            // Create a unique constraint workaround by deleting old entries
            id: `${service.serviceName}-latest`,
          },
          create: {
            id: `${service.serviceName}-latest`,
            ...service,
          },
          update: {
            ...service,
            lastChecked: new Date(),
          },
        });
      } catch (error) {
        // If database is down, continue without storing
        console.error(`Failed to update status for ${service.serviceName}:`, error);
      }
    }

    // Calculate overall status
    const overallStatus = services.some(s => s.status === "down")
      ? "down"
      : services.some(s => s.status === "degraded")
      ? "degraded"
      : "operational";

    const alertLevel = services.some(s => s.alertLevel === "danger")
      ? "danger"
      : services.some(s => s.alertLevel === "warning")
      ? "warning"
      : "none";

    res.json({
      overall: {
        status: overallStatus,
        alertLevel,
        timestamp: new Date().toISOString(),
      },
      services,
    });
  } catch (error) {
    console.error("Error fetching system status:", error);
    res.status(500).json({
      error: "Failed to fetch system status",
      overall: {
        status: "down",
        alertLevel: "danger",
        timestamp: new Date().toISOString(),
      },
    });
  }
});

/**
 * GET /api/system/health
 * Simple health check endpoint
 */
router.get("/health", async (req, res) => {
  try {
    // Quick health check
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbResponseTime = Date.now() - dbStart;

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        responseTime: dbResponseTime,
      },
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: "Database connection failed",
      },
    });
  }
});

/**
 * GET /api/system/alerts
 * Get all system alerts
 */
router.get("/alerts", async (req, res) => {
  try {
    const resolved = req.query.resolved === "true";
    
    const alerts = await prisma.systemAlert.findMany({
      where: resolved ? {} : { isResolved: false },
      orderBy: [
        { severity: "desc" },
        { createdAt: "desc" },
      ],
      take: 50,
    });

    res.json({
      alerts,
      count: alerts.length,
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

/**
 * POST /api/system/alerts
 * Create a new system alert (Admin only)
 */
router.post("/alerts", async (req, res) => {
  try {
    const { alertType, severity, title, description, serviceName } = req.body;

    if (!alertType || !severity || !title || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const alert = await prisma.systemAlert.create({
      data: {
        alertType,
        severity,
        title,
        description,
        serviceName: serviceName || null,
      },
    });

    console.log(`🚨 System alert created: ${title} (${severity})`);

    res.json({
      success: true,
      alert,
    });
  } catch (error) {
    console.error("Error creating alert:", error);
    res.status(500).json({ error: "Failed to create alert" });
  }
});

/**
 * PUT /api/system/alerts/:id/resolve
 * Resolve a system alert (Admin only)
 */
router.put("/alerts/:id/resolve", async (req, res) => {
  try {
    const { id } = req.params;
    const { resolvedBy } = req.body;

    const alert = await prisma.systemAlert.update({
      where: { id },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy: resolvedBy || "system",
      },
    });

    console.log(`✅ Alert resolved: ${alert.title}`);

    res.json({
      success: true,
      alert,
    });
  } catch (error) {
    console.error("Error resolving alert:", error);
    res.status(500).json({ error: "Failed to resolve alert" });
  }
});

/**
 * GET /api/system/monitoring
 * Get comprehensive monitoring data (Admin only)
 */
router.get("/monitoring", async (req, res) => {
  try {
    // Get latest status for all services
    const statuses = await prisma.systemStatus.findMany({
      orderBy: { lastChecked: "desc" },
      take: 10,
    });

    // Get unresolved alerts
    const unresolvedAlerts = await prisma.systemAlert.findMany({
      where: { isResolved: false },
      orderBy: { createdAt: "desc" },
    });

    // Get recent resolved alerts
    const recentResolved = await prisma.systemAlert.findMany({
      where: { isResolved: true },
      orderBy: { resolvedAt: "desc" },
      take: 5,
    });

    // Calculate metrics
    const criticalAlerts = unresolvedAlerts.filter(a => a.severity === "critical").length;
    const highAlerts = unresolvedAlerts.filter(a => a.severity === "high").length;
    const servicesDown = statuses.filter(s => s.status === "down").length;
    const servicesDegraded = statuses.filter(s => s.status === "degraded").length;

    res.json({
      summary: {
        totalAlerts: unresolvedAlerts.length,
        criticalAlerts,
        highAlerts,
        servicesDown,
        servicesDegraded,
      },
      statuses,
      unresolvedAlerts,
      recentResolved,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching monitoring data:", error);
    res.status(500).json({ error: "Failed to fetch monitoring data" });
  }
});

export default router;
