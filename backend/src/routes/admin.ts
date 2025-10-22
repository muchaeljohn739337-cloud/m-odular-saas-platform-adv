import express from "express";
import prisma from "../prismaClient";
import { adminAuth } from "../middleware/adminAuth";

const router = express.Router();

// GET /api/admin/doctors - List all doctors with filtering
router.get("/doctors", adminAuth, async (req, res) => {
  try {
    const { status } = req.query;

    const where: any = {};
    if (
      status &&
      ["PENDING", "VERIFIED", "SUSPENDED"].includes(status as string)
    ) {
      where.status = status;
    }

    const doctors = await prisma.doctor.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        specialization: true,
        licenseNumber: true,
        phoneNumber: true,
        status: true,
        verifiedAt: true,
        verifiedBy: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      doctors,
      count: doctors.length,
    });
  } catch (err) {
    console.error("Fetch doctors error:", err);
    return res.status(500).json({ error: "Failed to fetch doctors" });
  }
});

// GET /api/admin/doctor/:id - Get single doctor details
router.get("/doctor/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        consultations: {
          select: {
            id: true,
            status: true,
            scheduledAt: true,
            patient: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // Don't return password hash
    const { passwordHash, ...doctorData } = doctor;

    return res.json({ doctor: doctorData });
  } catch (err) {
    console.error("Fetch doctor error:", err);
    return res.status(500).json({ error: "Failed to fetch doctor" });
  }
});

// POST /api/admin/doctor/:id/verify - Verify a doctor
router.post("/doctor/:id/verify", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.body || {};

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    if (doctor.status === "VERIFIED") {
      return res.status(400).json({ error: "Doctor is already verified" });
    }

    const updated = await prisma.doctor.update({
      where: { id },
      data: {
        status: "VERIFIED",
        verifiedAt: new Date(),
        verifiedBy: adminId || "admin",
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        specialization: true,
        status: true,
        verifiedAt: true,
        verifiedBy: true,
      },
    });

    return res.json({
      message: "Doctor verified successfully",
      doctor: updated,
    });
  } catch (err) {
    console.error("Verify doctor error:", err);
    return res.status(500).json({ error: "Failed to verify doctor" });
  }
});

// POST /api/admin/doctor/:id/suspend - Suspend a doctor
router.post("/doctor/:id/suspend", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const updated = await prisma.doctor.update({
      where: { id },
      data: { status: "SUSPENDED" },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        specialization: true,
        status: true,
      },
    });

    return res.json({
      message: "Doctor suspended successfully",
      doctor: updated,
    });
  } catch (err) {
    console.error("Suspend doctor error:", err);
    return res.status(500).json({ error: "Failed to suspend doctor" });
  }
});

// DELETE /api/admin/doctor/:id - Delete a doctor (hard delete)
router.delete("/doctor/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    await prisma.doctor.delete({
      where: { id },
    });

    return res.json({ message: "Doctor deleted successfully" });
  } catch (err) {
    console.error("Delete doctor error:", err);
    return res.status(500).json({ error: "Failed to delete doctor" });
  }
});

export default router;
