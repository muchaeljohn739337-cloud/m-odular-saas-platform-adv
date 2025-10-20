import express, { Request, Response } from "express";
import prisma from "../prismaClient";
import { authenticateToken, requireAdmin } from "../middleware/auth";
const router = express.Router();

// 🧰 Example support route
router.get("/", (req: Request, res: Response) => {
  res.json({ message: "Support route working properly ✅" });
});

router.post("/contact", (req: Request, res: Response) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }
  res.json({ success: true, msg: "Support ticket created successfully" });
});

export default router;

// --- Admin management endpoints ---
// GET /api/support/admin/tickets?subject=Med Beds Appointment Request&status=OPEN
router.get("/admin/tickets", authenticateToken as any, requireAdmin as any, async (req: Request, res: Response) => {
  try {
    const { subject, status, limit } = req.query as any;
    const take = Math.max(1, Math.min(100, Number(limit) || 20));
    const where: any = {};
    if (subject) where.subject = String(subject);
    if (status) where.status = String(status);
    const tickets = await prisma.supportTicket.findMany({ where, orderBy: { createdAt: "desc" }, take });
    res.json(tickets);
  } catch (e) {
    console.error("Admin list tickets error", e);
    res.status(500).json({ error: "Failed to list tickets" });
  }
});

// POST /api/support/admin/tickets/:id/status { status, response }
router.post("/admin/tickets/:id/status", authenticateToken as any, requireAdmin as any, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, response } = req.body as any;
    if (!status) return res.status(400).json({ error: "status required" });
    const updated = await prisma.supportTicket.update({ where: { id }, data: { status, response } });
    res.json(updated);
  } catch (e) {
    console.error("Admin update ticket status error", e);
    res.status(500).json({ error: "Failed to update ticket" });
  }
});
