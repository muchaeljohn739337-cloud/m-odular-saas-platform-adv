import bcrypt from "bcryptjs";
import express from "express";
import prisma from "../prismaClient";

const router = express.Router();

/**
 * Internal endpoint to seed admin user in production
 * Protected by x-api-key header
 * Used when free-tier database doesn't allow direct SQL shell access
 *
 * @route POST /api/internal/seed-admin
 * @security x-api-key header must match process.env.API_KEY
 */
router.post("/seed-admin", async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];

    // Verify API key
    if (!apiKey || apiKey !== process.env.API_KEY) {
      return res.status(401).json({ error: "Unauthorized - Invalid API key" });
    }

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@advanciapay.com" },
    });

    if (existingAdmin) {
      return res.json({
        success: true,
        message: "Admin user already exists",
        email: "admin@advanciapay.com",
        userId: existingAdmin.id,
      });
    }

    // Create admin user with proper defaults
    const passwordHash = await bcrypt.hash("Admin123!", 10);

    const admin = await prisma.user.create({
      data: {
        email: "admin@advanciapay.com",
        username: "admin",
        passwordHash,
        firstName: "System",
        lastName: "Admin",
        role: "ADMIN",
        active: true,
        termsAccepted: true,
        termsAcceptedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: "Admin user created successfully",
      email: admin.email,
      userId: admin.id,
    });
  } catch (error) {
    console.error("Failed to seed admin:", error);
    res.status(500).json({
      error: "Failed to create admin user",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
