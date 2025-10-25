import { Router, Request, Response } from "express";
import {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
  getUserPreferences,
  updateUserPreferences,
} from "../services/notificationService";
import prisma from "../prismaClient";

const router = Router();

// Middleware to get user ID from request (assumes auth middleware sets req.user)
const getUserId = (req: Request): string | null => {
  return (req as any).user?.id || null;
};

/**
 * GET /api/notifications
 * Get user's notifications (paginated)
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const unreadOnly = req.query.unreadOnly === "true";
    const category = req.query.category as string;

    const result = await getUserNotifications(userId, {
      page,
      limit,
      unreadOnly,
      category,
    });

    res.json(result);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

/**
 * GET /api/notifications/unread-count
 * Get unread notification count
 */
router.get("/unread-count", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const count = await getUnreadCount(userId);
    res.json({ count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
});

/**
 * POST /api/notifications
 * Create a new notification (admin/system only)
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    if (!currentUser || currentUser.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { userId, type, priority, category, title, message, data } = req.body;

    if (!userId || !category || !title || !message) {
      return res.status(400).json({ error: "Missing required fields: userId, category, title, message" });
    }

    const notification = await createNotification({
      userId,
      type,
      priority,
      category,
      title,
      message,
      data,
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ error: "Failed to create notification" });
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark notification as read
 */
router.patch("/:id/read", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const notificationId = req.params.id;
    const notification = await markAsRead(notificationId, userId);

    res.json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read
 */
router.patch("/read-all", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await markAllAsRead(userId);
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking all as read:", error);
    res.status(500).json({ error: "Failed to mark all as read" });
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const notificationId = req.params.id;
    await deleteNotification(notificationId, userId);

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

/**
 * GET /api/notifications/preferences
 * Get user notification preferences
 */
router.get("/preferences", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const preferences = await getUserPreferences(userId);
    res.json(preferences);
  } catch (error) {
    console.error("Error fetching preferences:", error);
    res.status(500).json({ error: "Failed to fetch preferences" });
  }
});

/**
 * PUT /api/notifications/preferences
 * Update user notification preferences
 */
router.put("/preferences", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const updates = req.body;
    const preferences = await updateUserPreferences(userId, updates);

    res.json(preferences);
  } catch (error) {
    console.error("Error updating preferences:", error);
    res.status(500).json({ error: "Failed to update preferences" });
  }
});

/**
 * POST /api/notifications/subscribe-push
 * Subscribe to push notifications
 */
router.post("/subscribe-push", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { endpoint, keys, deviceInfo } = req.body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ error: "Invalid subscription data" });
    }

    const subscription = await prisma.pushSubscription.upsert({
      where: {
        userId_endpoint: {
          userId,
          endpoint,
        },
      },
      update: {
        p256dh: keys.p256dh,
        auth: keys.auth,
        deviceInfo,
        isActive: true,
      },
      create: {
        userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        deviceInfo,
      },
    });

    res.json({ success: true, subscription });
  } catch (error) {
    console.error("Error subscribing to push:", error);
    res.status(500).json({ error: "Failed to subscribe" });
  }
});

/**
 * DELETE /api/notifications/unsubscribe-push
 * Unsubscribe from push notifications
 */
router.delete("/unsubscribe-push", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { endpoint } = req.body;

    await prisma.pushSubscription.updateMany({
      where: { userId, endpoint },
      data: { isActive: false },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error unsubscribing from push:", error);
    res.status(500).json({ error: "Failed to unsubscribe" });
  }
});

export default router;
