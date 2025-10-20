import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import prisma from '../prismaClient';
import type { Server as IOServer } from 'socket.io';

const router = Router();
let ioRef: IOServer | null = null;
export function setMedbedsSocketIO(io: IOServer) { ioRef = io; }

// Book appointment: creates a support ticket and pings admins
router.post('/book', authenticateToken as any, async (req: any, res) => {
  const { fullName, email, phone, preferredDate, preferredTime, notes } = req.body || {};
  if (!fullName || !email || !phone || !preferredDate) return res.status(400).json({ error: 'Missing required fields' });
  try {
    const userId = req.user?.userId;
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: userId,
        subject: 'Med Beds Appointment Request',
        message: `Full Name: ${fullName}\nEmail: ${email}\nPhone: ${phone}\nPreferred Date: ${preferredDate}\nPreferred Time: ${preferredTime || ''}\nNotes: ${notes || ''}`,
        category: 'GENERAL',
        status: 'OPEN',
      },
    });
    try { ioRef?.to('admins').emit('admin:medbeds:booking', { ticketId: ticket.id, userId, fullName, preferredDate, preferredTime }); } catch {}
    res.json({ success: true, ticketId: ticket.id });
  } catch (e) {
    console.error('Medbeds booking error', e);
    res.status(500).json({ error: 'Failed to submit booking' });
  }
});

export default router;
