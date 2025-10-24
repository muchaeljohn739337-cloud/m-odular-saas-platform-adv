import { Router, Request, Response } from "express";
import prisma from "../prismaClient";

const router = Router();

/**
 * GET /api/notify/stats
 * Get notification system statistics
 * Returns: total notifications, unread count, failed emails
 */
router.get("/stats", async (req: Request, res: Response) => {
  try {
    // Note: These queries will work once notification models are added to Prisma schema
    const total = await prisma.notification.count();
    const unread = await prisma.notification.count({ 
      where: { isRead: false } 
    });
    const failedEmails = await prisma.notification.count({ 
      where: { 
        emailSent: false,
        type: "email"
      } 
    });

    res.json({ 
      total, 
      unread, 
      failedEmails,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fetching notification stats:", error);
    // Return zeros if notification table doesn't exist yet
    res.json({ 
      total: 0, 
      unread: 0, 
      failedEmails: 0,
      error: "Notification system not yet initialized"
    });
  }
});

/**
 * GET /api/notify/export
 * Export notifications as CSV
 * Includes: notifications, RPA logs, and email sync results
 */
router.get("/export", async (req: Request, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            email: true,
            username: true,
          },
        },
      },
    });

    // Get email notifications
    const emailNotifications = await prisma.notificationLog.findMany({
      where: {
        channel: "email",
      },
      orderBy: { sentAt: "desc" },
      take: 50,
    });

    // Build CSV
    let csv = "Section,Title,Message,Status,Type,CreatedAt,UserEmail,Username\n";

    // Add notifications
    for (const n of notifications) {
      const title = n.title.replace(/"/g, '""');
      const message = n.message.replace(/"/g, '""');
      const status = n.isRead ? "read" : "unread";
      const userEmail = n.user?.email || "N/A";
      const username = n.user?.username || "N/A";

      csv += `Notification,"${title}","${message}",${status},${n.type},${n.createdAt.toISOString()},"${userEmail}","${username}"\n`;
    }

    // Add email logs
    for (const log of emailNotifications) {
      const status = log.status;
      const errorMsg = log.errorMessage ? log.errorMessage.replace(/"/g, '""') : "N/A";

      csv += `Email Log,"Email Notification","${errorMsg}",${status},email,${log.sentAt.toISOString()},N/A,N/A\n`;
    }

    // Get RPA logs from audit logs
    const rpaLogs = await prisma.auditLog.findMany({
      where: {
        ipAddress: "SYSTEM-RPA",
      },
      orderBy: { timestamp: "desc" },
      take: 10,
    });

    for (const log of rpaLogs) {
      const action = log.action;
      const details = typeof log.metadata === "string" ? log.metadata.replace(/"/g, '""') : JSON.stringify(log.metadata);

      csv += `RPA Log,"${action}","${details}",completed,rpa,${log.timestamp.toISOString()},N/A,N/A\n`;
    }

    res.setHeader("Content-Disposition", "attachment; filename=notifications-report.csv");
    res.setHeader("Content-Type", "text/csv");
    res.send(csv);
  } catch (error) {
    console.error("Error exporting notifications:", error);
    res.status(500).json({ 
      error: "Failed to export notifications",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * GET /api/notify/recent
 * Get recent notifications for admin dashboard
 */
router.get("/recent", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;

    const recent = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: {
          select: {
            email: true,
            username: true,
          },
        },
      },
    });

    res.json(recent);
  } catch (error) {
    console.error("Error fetching recent notifications:", error);
    res.json([]);
  }
});

export default router;
