/**
 * MedBeds Routes - READ-ONLY MODE
 * ================================
 * All write operations disabled for launch phase
 * Users and admins can view MedBed information only
 * Booking/payment features will be enabled in future release
 */

import { Router } from "express";
import type { Server as IOServer } from "socket.io";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import prisma from "../prismaClient";

const router = Router();
let ioRef: IOServer | null = null;

export function setMedbedsSocketIO(io: IOServer) {
  ioRef = io;
}

// ============================================================
// PUBLIC ENDPOINTS - View MedBed Information
// ============================================================

/**
 * GET /api/medbeds/info
 * Get general MedBed information and chamber types (public)
 */
router.get("/info", (req, res) => {
  res.json({
    success: true,
    status: "preview",
    message: "MedBed services coming soon. Currently in view-only mode.",
    chambers: [
      {
        type: "regeneration",
        name: "Regeneration Chamber",
        description: "Advanced cellular regeneration and healing",
        duration: "60-120 minutes",
        available: false,
        comingSoon: true,
      },
      {
        type: "rejuvenation",
        name: "Rejuvenation Pod",
        description: "Age reversal and tissue restoration",
        duration: "90-180 minutes",
        available: false,
        comingSoon: true,
      },
      {
        type: "diagnostic",
        name: "Diagnostic Scanner",
        description: "Full-body health analysis and detection",
        duration: "30-45 minutes",
        available: false,
        comingSoon: true,
      },
      {
        type: "wellness",
        name: "Wellness Suite",
        description: "Stress relief and immune system boost",
        duration: "45-90 minutes",
        available: false,
        comingSoon: true,
      },
    ],
    features: [
      "Non-invasive treatments",
      "AI-powered diagnostics",
      "Personalized healing protocols",
      "Real-time health monitoring",
      "Secure booking system",
    ],
    launchPhase: "Phase 1 - Information Only",
    bookingEnabled: false,
  });
});

/**
 * GET /api/medbeds/chambers
 * Get available chamber types with details (public)
 */
router.get("/chambers", (req, res) => {
  res.json({
    success: true,
    chambers: [
      {
        id: "regen-1",
        type: "regeneration",
        name: "Regeneration Chamber Alpha",
        description: "Primary cellular regeneration unit for tissue repair and healing acceleration",
        benefits: ["Accelerated wound healing", "Cellular regeneration", "Pain reduction", "Inflammation control"],
        pricePerHour: 150,
        currency: "USD",
        status: "coming_soon",
        availability: null,
        image: "/images/medbeds/regeneration.jpg",
      },
      {
        id: "rejuv-1",
        type: "rejuvenation",
        name: "Rejuvenation Pod Beta",
        description: "Advanced age-reversal and tissue restoration technology",
        benefits: ["Skin rejuvenation", "Energy restoration", "Cognitive enhancement", "Longevity support"],
        pricePerHour: 200,
        currency: "USD",
        status: "coming_soon",
        availability: null,
        image: "/images/medbeds/rejuvenation.jpg",
      },
      {
        id: "diag-1",
        type: "diagnostic",
        name: "Quantum Diagnostic Scanner",
        description: "Full-body health analysis with AI-powered detection",
        benefits: [
          "Complete health scan",
          "Early disease detection",
          "Nutritional analysis",
          "Personalized recommendations",
        ],
        pricePerHour: 100,
        currency: "USD",
        status: "coming_soon",
        availability: null,
        image: "/images/medbeds/diagnostic.jpg",
      },
    ],
  });
});

/**
 * GET /api/medbeds/faq
 * Frequently asked questions (public)
 */
router.get("/faq", (req, res) => {
  res.json({
    success: true,
    faqs: [
      {
        question: "What are MedBeds?",
        answer:
          "MedBeds are advanced healing technology chambers that use quantum energy and AI diagnostics to promote cellular regeneration, healing, and overall wellness.",
      },
      {
        question: "Are MedBed treatments safe?",
        answer:
          "Yes, all MedBed treatments are non-invasive and designed with safety as the top priority. Each session is monitored by AI systems and qualified technicians.",
      },
      {
        question: "How long does a typical session last?",
        answer:
          "Session duration varies by treatment type: Diagnostic scans take 30-45 minutes, Wellness treatments 45-90 minutes, and Regeneration/Rejuvenation sessions 60-180 minutes.",
      },
      {
        question: "When will booking be available?",
        answer:
          "We are currently in Phase 1 (Information Only). Booking functionality will be enabled in Phase 2. Subscribe to our newsletter for updates.",
      },
      {
        question: "What payment methods will be accepted?",
        answer:
          "We will accept credit cards (Stripe), cryptocurrency (BTC, ETH, USDT), and account balance payments when booking opens.",
      },
      {
        question: "Is there a waiting list?",
        answer:
          "Yes! You can join our priority waiting list by registering an account. Priority members will be notified first when booking opens.",
      },
    ],
  });
});

// ============================================================
// USER ENDPOINTS - View-Only (Requires Authentication)
// ============================================================

/**
 * GET /api/medbeds/my-bookings
 * Get user's booking history (view-only)
 */
router.get("/my-bookings", authenticateToken as any, async (req: any, res) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const bookings = await prisma.medbeds_bookings.findMany({
      where: { userId },
      orderBy: { sessionDate: "desc" },
    });

    res.json({
      success: true,
      bookings: bookings.map((b: any) => ({
        id: b.id,
        chamberType: b.chamberType,
        chamberName: b.chamberName,
        sessionDate: b.sessionDate,
        duration: b.duration,
        cost: b.cost?.toString() || "0",
        status: b.status,
        paymentStatus: b.paymentStatus,
        createdAt: b.createdAt,
      })),
      message:
        bookings.length === 0
          ? "No bookings yet. Booking will be available soon!"
          : "Viewing booking history (read-only mode)",
    });
  } catch (e) {
    console.error("Error fetching bookings", e);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

/**
 * GET /api/medbeds/waitlist-status
 * Check user's waitlist status
 */
router.get("/waitlist-status", authenticateToken as any, async (req: any, res) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, email: true, createdAt: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Calculate waitlist position based on account creation date
    const usersAhead = await prisma.users.count({
      where: {
        createdAt: { lt: user.createdAt },
        active: true,
      },
    });

    res.json({
      success: true,
      waitlist: {
        position: usersAhead + 1,
        registeredAt: user.createdAt,
        status: "registered",
        estimatedAccess: "Phase 2 Launch",
        benefits: ["Priority booking access", "Early notification when booking opens", "Exclusive member pricing"],
      },
    });
  } catch (e) {
    console.error("Error checking waitlist", e);
    res.status(500).json({ error: "Failed to check waitlist status" });
  }
});

// ============================================================
// BLOCKED ENDPOINTS - No Write Operations Allowed
// ============================================================

/**
 * POST /api/medbeds/book-with-payment - DISABLED
 */
router.post("/book-with-payment", authenticateToken as any, (req, res) => {
  res.status(503).json({
    success: false,
    error: "Booking temporarily disabled",
    message: "MedBed booking is currently in preview mode. We will notify you when booking opens.",
    status: "coming_soon",
    estimatedLaunch: "Phase 2",
  });
});

/**
 * POST /api/medbeds/book - DISABLED
 */
router.post("/book", authenticateToken as any, (req, res) => {
  res.status(503).json({
    success: false,
    error: "Booking temporarily disabled",
    message: "MedBed booking is currently in preview mode. We will notify you when booking opens.",
    status: "coming_soon",
    estimatedLaunch: "Phase 2",
  });
});

// ============================================================
// ADMIN ENDPOINTS - View-Only (No Modifications)
// ============================================================

/**
 * GET /api/medbeds/admin/bookings
 * View all bookings (admin read-only)
 */
router.get("/admin/bookings", requireAdmin as any, async (req, res) => {
  try {
    const { status, paymentStatus, limit = 100 } = req.query;
    const where: any = {};

    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    const bookings = await prisma.medbeds_bookings.findMany({
      where,
      include: {
        users: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { sessionDate: "desc" },
      take: Number(limit),
    });

    res.json({
      success: true,
      mode: "read-only",
      message: "Admin view mode - modifications disabled for launch phase",
      bookings: bookings.map((b: any) => ({
        id: b.id,
        userId: b.userId,
        chamberType: b.chamberType,
        chamberName: b.chamberName,
        sessionDate: b.sessionDate,
        duration: b.duration,
        cost: b.cost?.toString() || "0",
        status: b.status,
        paymentStatus: b.paymentStatus,
        notes: b.notes,
        createdAt: b.createdAt,
        user: b.users,
      })),
      totalCount: bookings.length,
    });
  } catch (e) {
    console.error("Error fetching admin bookings", e);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

/**
 * GET /api/medbeds/admin/stats
 * View MedBed statistics (admin)
 */
router.get("/admin/stats", requireAdmin as any, async (req, res) => {
  try {
    const [totalBookings, pendingBookings, completedBookings, waitlistCount] = await Promise.all([
      prisma.medbeds_bookings.count(),
      prisma.medbeds_bookings.count({ where: { status: "scheduled" } }),
      prisma.medbeds_bookings.count({ where: { status: "completed" } }),
      prisma.users.count({ where: { active: true } }),
    ]);

    res.json({
      success: true,
      mode: "read-only",
      stats: {
        totalBookings,
        pendingBookings,
        completedBookings,
        cancelledBookings: totalBookings - pendingBookings - completedBookings,
        waitlistUsers: waitlistCount,
        systemStatus: "preview_mode",
        bookingEnabled: false,
      },
    });
  } catch (e) {
    console.error("Error fetching stats", e);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

/**
 * PATCH /api/medbeds/admin/bookings/:id - DISABLED
 * Admin cannot modify bookings during preview mode
 */
router.patch("/admin/bookings/:id", requireAdmin as any, (req, res) => {
  res.status(503).json({
    success: false,
    error: "Modifications disabled",
    message: "Booking modifications are disabled during preview mode. System is read-only.",
    mode: "read-only",
  });
});

/**
 * DELETE /api/medbeds/admin/bookings/:id - DISABLED
 * Admin cannot delete bookings during preview mode
 */
router.delete("/admin/bookings/:id", requireAdmin as any, (req, res) => {
  res.status(503).json({
    success: false,
    error: "Deletions disabled",
    message: "Booking deletions are disabled during preview mode. System is read-only.",
    mode: "read-only",
  });
});

// ============================================================
// HEALTH & STATUS
// ============================================================

/**
 * GET /api/medbeds/health
 * System health check
 */
router.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "operational",
    mode: "read-only",
    version: "1.0.0-preview",
    features: {
      viewChambers: true,
      viewBookings: true,
      createBookings: false,
      modifyBookings: false,
      payments: false,
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
