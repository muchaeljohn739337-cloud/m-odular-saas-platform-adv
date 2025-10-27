// PowerShell script to add registration approval endpoints to admin.ts
$filePath = "c:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform\backend\src\routes\admin.ts"

# Read the file
$content = Get-Content $filePath -Raw

# Find the export statement
$exportMarker = "export default router;"
$exportIdx = $content.LastIndexOf($exportMarker)

if ($exportIdx -eq -1) {
    Write-Host "ERROR: Could not find export statement" -ForegroundColor Red
    exit 1
}

# New approval endpoints
$newEndpoints = @'

// ✨ NEW ENDPOINTS: Registration Approval System

// GET /api/admin/users/pending-approvals - List pending user registrations
router.get(
  "/users/pending-approvals",
  authenticateToken as any,
  requireAdmin as any,
  async (req, res) => {
    try {
      const { page = "1", limit = "20" } = req.query;
      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.min(100, Math.max(1, Number(limit)));
      const skip = (pageNum - 1) * limitNum;

      // Get pending users (where active = false)
      const [pendingUsers, totalCount] = await Promise.all([
        prisma.user.findMany({
          where: { active: false },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: "asc" },
          skip,
          take: limitNum,
        }),
        prisma.user.count({ where: { active: false } }),
      ]);

      return res.json({
        message: "Pending user registrations retrieved successfully",
        data: pendingUsers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          pages: Math.ceil(totalCount / limitNum),
        },
      });
    } catch (err) {
      console.error("Error fetching pending approvals:", err);
      return res.status(500).json({ error: "Failed to fetch pending approvals" });
    }
  }
);

// POST /api/admin/users/approve-registration - Approve or reject a registration
router.post(
  "/users/approve-registration",
  authenticateToken as any,
  requireAdmin as any,
  logAdminAction as any,
  async (req, res) => {
    try {
      const { userId, action, reason } = req.body;
      const adminId = (req as any).user?.userId;

      if (!userId || !action || !["approve", "reject"].includes(action)) {
        return res.status(400).json({
          error: "Invalid request. userId and action (approve/reject) required.",
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          active: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.active) {
        return res.status(400).json({ error: "User is already approved" });
      }

      if (action === "approve") {
        const approvedUser = await prisma.user.update({
          where: { id: userId },
          data: { active: true },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            active: true,
          },
        });

        return res.json({
          message: "User registration approved successfully",
          user: approvedUser,
        });
      } else {
        // Reject: delete the user or mark as rejected
        await prisma.user.delete({
          where: { id: userId },
        });

        return res.json({
          message: "User registration rejected and account deleted",
          userId,
          reason: reason || "No reason provided",
        });
      }
    } catch (err) {
      console.error("Error processing approval:", err);
      return res.status(500).json({ error: "Failed to process approval" });
    }
  }
);

// POST /api/admin/users/bulk-approve - Bulk approve or reject registrations
router.post(
  "/users/bulk-approve",
  authenticateToken as any,
  requireAdmin as any,
  logAdminAction as any,
  async (req, res) => {
    try {
      const { userIds, action } = req.body;
      const adminId = (req as any).user?.userId;

      if (
        !Array.isArray(userIds) ||
        userIds.length === 0 ||
        !action ||
        !["approve", "reject"].includes(action)
      ) {
        return res.status(400).json({
          error: "Invalid request. userIds (array) and action (approve/reject) required.",
        });
      }

      const maxBulkSize = 100;
      if (userIds.length > maxBulkSize) {
        return res.status(400).json({
          error: `Maximum bulk operation size is ${maxBulkSize} users`,
        });
      }

      const users = await prisma.user.findMany({
        where: { id: { in: userIds }, active: false },
        select: { id: true, email: true, firstName: true, lastName: true },
      });

      if (users.length === 0) {
        return res.status(400).json({
          error: "No pending users found in the provided list",
        });
      }

      let results = {
        processed: 0,
        approved: 0,
        rejected: 0,
        errors: [] as string[],
      };

      if (action === "approve") {
        // Approve users
        const updated = await prisma.user.updateMany({
          where: { id: { in: users.map((u) => u.id) }, active: false },
          data: { active: true },
        });
        results.approved = updated.count;
        results.processed = updated.count;
      } else {
        // Reject users (delete them)
        for (const user of users) {
          try {
            await prisma.user.delete({
              where: { id: user.id },
            });
            results.rejected++;
            results.processed++;
          } catch (err) {
            results.errors.push(
              `Failed to reject ${user.email}: ${String(err)}`
            );
          }
        }
      }

      return res.json({
        message: `Bulk ${action} completed`,
        results,
      });
    } catch (err) {
      console.error("Error processing bulk approval:", err);
      return res.status(500).json({ error: "Failed to process bulk approval" });
    }
  }
);

'@

# Insert before export statement
$newContent = $content.Substring(0, $exportIdx) + $newEndpoints + $content.Substring($exportIdx)

# Write back
Set-Content $filePath $newContent -Encoding UTF8
Write-Host "✅ Registration approval endpoints added to admin.ts!" -ForegroundColor Green
Write-Host "New endpoints:" -ForegroundColor Cyan
Write-Host "  • GET /api/admin/users/pending-approvals (list pending users)" -ForegroundColor Yellow
Write-Host "  • POST /api/admin/users/approve-registration (approve/reject single user)" -ForegroundColor Yellow
Write-Host "  • POST /api/admin/users/bulk-approve (bulk approve/reject)" -ForegroundColor Yellow
