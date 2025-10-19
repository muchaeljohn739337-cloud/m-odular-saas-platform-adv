import { Router, Request, Response } from "express";
import { authenticateToken, allowRoles } from "../middleware/auth";
import prisma from "../prismaClient";

const router = Router();

// Get all support tickets (Admin only)
router.get("/tickets", authenticateToken, allowRoles("ADMIN", "STAFF"), async (req: Request, res: Response) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json({ tickets });
  } catch (error) {
    console.error("Error fetching support tickets:", error);
    res.status(500).json({ error: "Failed to fetch support tickets" });
  }
});

// Get user's own support tickets
router.get("/my-tickets", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const tickets = await prisma.supportTicket.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json({ tickets });
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

// Create a new support ticket
router.post("/tickets", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { subject, message, category } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: "Subject and message are required" });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        subject,
        message,
        category: category || "GENERAL",
        status: "OPEN"
      }
    });

    res.status(201).json({ ticket });
  } catch (error) {
    console.error("Error creating support ticket:", error);
    res.status(500).json({ error: "Failed to create support ticket" });
  }
});

// Update ticket status (Admin only)
router.patch("/tickets/:id", authenticateToken, allowRoles("ADMIN", "STAFF"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, response } = req.body;

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: {
        status,
        response,
        updatedAt: new Date()
      }
    });

    res.json({ ticket });
  } catch (error) {
    console.error("Error updating support ticket:", error);
    res.status(500).json({ error: "Failed to update support ticket" });
  }
});

// Get ticket by ID
router.get("/tickets/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;
    const userRole = (req as any).user.role;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true
          }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Users can only view their own tickets unless they're admin/staff
    if (ticket.userId !== userId && !["ADMIN", "STAFF"].includes(userRole)) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json({ ticket });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({ error: "Failed to fetch ticket" });
  }
});

export default router;
