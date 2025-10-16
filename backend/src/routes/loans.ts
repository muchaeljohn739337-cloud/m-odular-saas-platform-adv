import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Loan offers configuration
const LOAN_OFFERS = [
  { amount: 1000, interestRate: 7.5, termMonths: 6, monthlyPayment: 172.55 },
  { amount: 2500, interestRate: 8.0, termMonths: 12, monthlyPayment: 217.42 },
  { amount: 5000, interestRate: 8.5, termMonths: 12, monthlyPayment: 436.67 },
  { amount: 10000, interestRate: 9.0, termMonths: 24, monthlyPayment: 456.82 },
  { amount: 15000, interestRate: 9.5, termMonths: 36, monthlyPayment: 478.92 },
  { amount: 25000, interestRate: 10.0, termMonths: 48, monthlyPayment: 633.39 },
];

/**
 * GET /api/loans
 * Get all loans for a user
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // In production, get userId from authenticated session
    const userId = req.headers['x-user-id'] as string || '00000000-0000-0000-0000-000000000001';

    const loans = await prisma.loan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ loans });
  } catch (error) {
    console.error('Error fetching loans:', error);
    return res.status(500).json({ error: 'Failed to fetch loans' });
  }
});

/**
 * GET /api/loans/offers
 * Get available loan offers
 */
router.get('/offers', async (req: Request, res: Response) => {
  try {
    // In production, customize offers based on user credit score/history
    return res.status(200).json({ offers: LOAN_OFFERS });
  } catch (error) {
    console.error('Error fetching loan offers:', error);
    return res.status(500).json({ error: 'Failed to fetch loan offers' });
  }
});

/**
 * POST /api/loans/apply
 * Apply for a new loan
 */
router.post('/apply', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string || '00000000-0000-0000-0000-000000000001';
    const { amount, interestRate, termMonths, purpose } = req.body;

    // Validation
    if (!amount || !interestRate || !termMonths || !purpose) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (amount <= 0 || amount > 25000) {
      return res.status(400).json({ error: 'Invalid loan amount' });
    }

    // Check for active loans limit
    const activeLoans = await prisma.loan.count({
      where: {
        userId,
        status: { in: ['active', 'pending'] },
      },
    });

    if (activeLoans >= 3) {
      return res.status(400).json({ error: 'Maximum active loans limit reached (3)' });
    }

    // Calculate monthly payment using loan formula
    const monthlyRate = interestRate / 100 / 12;
    const monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);

    // Calculate due date
    const startDate = new Date();
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + termMonths);

    // Create loan
    const loan = await prisma.loan.create({
      data: {
        userId,
        amount,
        interestRate,
        termMonths,
        monthlyPayment,
        remainingBalance: amount,
        status: 'pending', // Admin approval required
        startDate,
        dueDate,
        purpose,
      },
    });

    // Create transaction record for loan application
    await prisma.transaction.create({
      data: {
        userId,
        amount,
        type: 'credit',
        description: `Loan application: ${purpose}`,
        category: 'loan',
        status: 'pending',
      },
    });

    return res.status(201).json({ 
      loan,
      message: 'Loan application submitted successfully. Pending approval.' 
    });
  } catch (error) {
    console.error('Error applying for loan:', error);
    return res.status(500).json({ error: 'Failed to apply for loan' });
  }
});

/**
 * POST /api/loans/:id/approve
 * Approve a loan (Admin only)
 */
router.post('/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const loan = await prisma.loan.findUnique({
      where: { id },
    });

    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    if (loan.status !== 'pending') {
      return res.status(400).json({ error: 'Loan is not in pending status' });
    }

    // Update loan status
    const updatedLoan = await prisma.loan.update({
      where: { id },
      data: {
        status: 'active',
        startDate: new Date(),
      },
    });

    // Add funds to user balance
    await prisma.user.update({
      where: { id: loan.userId },
      data: {
        usdBalance: {
          increment: loan.amount,
        },
      },
    });

    // Update transaction status
    await prisma.transaction.updateMany({
      where: {
        userId: loan.userId,
        category: 'loan',
        status: 'pending',
      },
      data: {
        status: 'completed',
      },
    });

    return res.status(200).json({ 
      loan: updatedLoan,
      message: 'Loan approved successfully' 
    });
  } catch (error) {
    console.error('Error approving loan:', error);
    return res.status(500).json({ error: 'Failed to approve loan' });
  }
});

/**
 * POST /api/loans/:id/payment
 * Make a payment on a loan
 */
router.post('/:id/payment', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const userId = req.headers['x-user-id'] as string || '00000000-0000-0000-0000-000000000001';

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }

    const loan = await prisma.loan.findUnique({
      where: { id },
    });

    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    if (loan.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (loan.status !== 'active') {
      return res.status(400).json({ error: 'Loan is not active' });
    }

    // Check user balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || Number(user.usdBalance) < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Calculate new remaining balance
    const newBalance = Math.max(0, loan.remainingBalance - amount);
    const isPaid = newBalance === 0;

    // Update loan
    const updatedLoan = await prisma.loan.update({
      where: { id },
      data: {
        remainingBalance: newBalance,
        status: isPaid ? 'paid' : 'active',
      },
    });

    // Deduct from user balance
    await prisma.user.update({
      where: { id: userId },
      data: {
        usdBalance: {
          decrement: amount,
        },
      },
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId,
        amount,
        type: 'debit',
        description: `Loan payment for ${loan.purpose}`,
        category: 'loan_payment',
        status: 'completed',
      },
    });

    return res.status(200).json({ 
      loan: updatedLoan,
      message: isPaid ? 'Loan paid in full!' : 'Payment successful' 
    });
  } catch (error) {
    console.error('Error processing loan payment:', error);
    return res.status(500).json({ error: 'Failed to process payment' });
  }
});

/**
 * GET /api/loans/:id
 * Get a specific loan by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'] as string || '00000000-0000-0000-0000-000000000001';

    const loan = await prisma.loan.findUnique({
      where: { id },
    });

    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    if (loan.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    return res.status(200).json({ loan });
  } catch (error) {
    console.error('Error fetching loan:', error);
    return res.status(500).json({ error: 'Failed to fetch loan' });
  }
});

export default router;
