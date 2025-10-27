// NEW ENDPOINT: Admin User Registration Approval
// File: backend/src/routes/admin.ts (Add to existing admin routes)

/**
 * POST /api/admin/users/approve-registration
 *
 * Admin endpoint to approve or reject pending user registrations
 *
 * @requires Admin role
 * @param userId - ID of user to approve/reject
 * @param approved - boolean (true = approve, false = reject)
 */
router.post(
  "/users/approve-registration",
  authenticateToken,
  requireAdmin,
  async (req: any, res) => {
    try {
      const { userId, approved } = req.body;

      if (!userId || typeof approved !== "boolean") {
        return res.status(400).json({
          error: "userId and approved (boolean) are required",
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          active: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Update user active status
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { active: approved },
      });

      // Notify user of decision
      const statusText = approved ? "approved" : "rejected";
      const notificationMsg = approved
        ? "Your registration has been approved! You can now log in and access all features."
        : "Your registration has been rejected. Please contact support for more information.";

      try {
        await createNotification({
          userId: user.id,
          type: "email",
          category: "admin",
          title: `Registration ${statusText.toUpperCase()}`,
          message: notificationMsg,
          priority: approved ? "high" : "medium",
        });
      } catch (notifyErr) {
        console.error("Failed to notify user of approval decision:", notifyErr);
        // Don't fail approval if notification fails
      }

      // Log admin action
      console.log(
        `✅ Admin ${req.user.userId} ${statusText} registration for user ${user.email}`
      );

      return res.json({
        message: `User registration ${statusText}`,
        user: {
          id: updated.id,
          email: updated.email,
          firstName: updated.firstName,
          lastName: updated.lastName,
          active: updated.active,
        },
      });
    } catch (err) {
      console.error("Admin approval error:", err);
      return res.status(500).json({ error: "Failed to process approval" });
    }
  }
);

/**
 * GET /api/admin/users/pending-approvals
 *
 * Get list of all pending user registrations
 *
 * @requires Admin role
 */
router.get(
  "/users/pending-approvals",
  authenticateToken,
  requireAdmin,
  async (req: any, res) => {
    try {
      const pending = await prisma.user.findMany({
        where: { active: false },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          username: true,
          createdAt: true,
          termsAccepted: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return res.json({
        message: `Found ${pending.length} pending registrations`,
        pending,
      });
    } catch (err) {
      console.error("Error fetching pending approvals:", err);
      return res
        .status(500)
        .json({ error: "Failed to fetch pending approvals" });
    }
  }
);

/**
 * POST /api/admin/users/bulk-approve
 *
 * Approve or reject multiple user registrations
 *
 * @requires Admin role
 * @param userIds - array of user IDs
 * @param approved - boolean (true = approve, false = reject all)
 */
router.post(
  "/users/bulk-approve",
  authenticateToken,
  requireAdmin,
  async (req: any, res) => {
    try {
      const { userIds, approved } = req.body;

      if (!Array.isArray(userIds) || typeof approved !== "boolean") {
        return res.status(400).json({
          error: "userIds (array) and approved (boolean) are required",
        });
      }

      const updated = await prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { active: approved },
      });

      // Get updated users for notification
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, email: true, firstName: true, lastName: true },
      });

      // Notify each user
      const statusText = approved ? "approved" : "rejected";
      for (const user of users) {
        try {
          await createNotification({
            userId: user.id,
            type: "email",
            category: "admin",
            title: `Registration ${statusText.toUpperCase()}`,
            message: `Your registration has been ${statusText}.`,
          });
        } catch (err) {
          console.error(`Failed to notify ${user.email}:`, err);
        }
      }

      return res.json({
        message: `${updated.count} user registrations ${statusText}`,
        count: updated.count,
      });
    } catch (err) {
      console.error("Bulk approval error:", err);
      return res.status(500).json({ error: "Failed to process bulk approval" });
    }
  }
);
