import express, { Response, NextFunction } from 'express';
import prisma from '../prismaClient';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all loans for the authenticated user
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    const loans = await prisma.loan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ loans });
  } catch (error) {
    console.error('Error fetching loans:', error);
    res.status(500).json({ error: 'Failed to fetch loans' });
  }
});

// Get loan offers
router.get('/offers', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const offers = [
      {
        id: '1',
        name: 'Personal Loan',
        minAmount: 1000,
        maxAmount: 25000,
        interestRate: 5.5,
        minTerm: 6,
        maxTerm: 48,
        description: 'Flexible personal loan with competitive rates'
      },
      {
        id: '2',
        name: 'Quick Cash',
        minAmount: 500,
        maxAmount: 5000,
        interestRate: 7.9,
        minTerm: 3,
        maxTerm: 24,
        description: 'Fast approval for urgent needs'
      },
      {
        id: '3',
        name: 'Premium Loan',
        minAmount: 10000,
        maxAmount: 50000,
        interestRate: 4.2,
        minTerm: 12,
        maxTerm: 60,
        description: 'Best rates for larger amounts'
      }
    ];
    
    res.json({ offers });
  } catch (error) {
    console.error('Error fetching loan offers:', error);
    res.status(500).json({ error: 'Failed to fetch loan offers' });
  }
});

// Apply for a loan
router.post('/apply', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { amount, termMonths, purpose } = req.body;
    
    // Validate input
    if (!amount || !termMonths) {
      return res.status(400).json({ error: 'Amount and term are required' });
    }
    
    if (amount < 1 || amount > 25000) {
      return res.status(400).json({ error: 'Loan amount must be between $1 and $25,000' });
    }
    
    if (termMonths < 6 || termMonths > 48) {
      return res.status(400).json({ error: 'Loan term must be between 6 and 48 months' });
    }
    
    // Check for existing active loans
    const activeLoans = await prisma.loan.count({
      where: {
        userId,
        status: { in: ['pending', 'active'] }
      }
    });
    
    if (activeLoans >= 3) {
      return res.status(400).json({ 
        error: 'You have reached the maximum number of active loans (3)' 
      });
    }
    
    // Calculate monthly payment (simple interest formula)
    const monthlyRate = 0.055 / 12; // 5.5% annual rate
    const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                          (Math.pow(1 + monthlyRate, termMonths) - 1);
    
    // Calculate due date
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + termMonths);
    
    // Create the loan
    const loan = await prisma.loan.create({
      data: {
        userId,
        amount,
        interestRate: 5.5,
        termMonths,
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
        remainingBalance: amount,
        status: 'pending',
        purpose: purpose || 'Personal',
        dueDate
      }
    });
    
    res.status(201).json({ 
      message: 'Loan application submitted successfully',
      loan 
    });
  } catch (error) {
    console.error('Error applying for loan:', error);
    res.status(500).json({ error: 'Failed to apply for loan' });
  }
});

// Approve a loan (admin only)
router.post('/:id/approve', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const loan = await prisma.loan.findUnique({
      where: { id }
    });
    
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    
    if (loan.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending loans can be approved' });
    }
    
    // Update loan status
    const updatedLoan = await prisma.loan.update({
      where: { id },
      data: { 
        status: 'active',
        approvedAt: new Date()
      }
    });
    
    // Credit the loan amount to user's account
    await prisma.user.update({
      where: { id: loan.userId },
      data: {
        usdBalance: { increment: loan.amount }
      }
    });
    
    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId: loan.userId,
        type: 'credit',
        amount: loan.amount,
        status: 'completed',
        description: `Loan approved - ${loan.amount} USD`,
        category: 'loan'
      }
    });
    
    res.json({ 
      message: 'Loan approved successfully',
      loan: updatedLoan 
    });
  } catch (error) {
    console.error('Error approving loan:', error);
    res.status(500).json({ error: 'Failed to approve loan' });
  }
});

// Make a loan payment
router.post('/:id/payment', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid payment amount is required' });
    }
    
    const loan = await prisma.loan.findUnique({
      where: { id }
    });
    
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    
    if (loan.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to make payments on this loan' });
    }
    
    if (loan.status !== 'active') {
      return res.status(400).json({ error: 'Can only make payments on active loans' });
    }
    
    // Check user balance
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user || user.usdBalance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    // Calculate new remaining balance
    const newBalance = Number(loan.remainingBalance) - amount;
    
    // Update loan
    const updatedLoan = await prisma.loan.update({
      where: { id },
      data: {
        remainingBalance: Math.max(0, newBalance),
        status: newBalance <= 0 ? 'paid' : 'active'
      }
    });
    
    // Deduct from user balance
    await prisma.user.update({
      where: { id: userId },
      data: {
        usdBalance: { decrement: amount }
      }
    });
    
    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId,
        type: 'debit',
        amount,
        status: 'completed',
        description: `Loan payment - ${amount} USD`,
        category: 'loan_payment'
      }
    });
    
    res.json({
      message: 'Payment processed successfully',
      loan: updatedLoan
    });
  } catch (error) {
    console.error('Error processing loan payment:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

// Get specific loan details
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    
    const loan = await prisma.loan.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    
    // Regular users can only see their own loans
    // Admins can see all loans
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (loan.userId !== userId && user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view this loan' });
    }
    
    res.json({ loan });
  } catch (error) {
    console.error('Error fetching loan details:', error);
    res.status(500).json({ error: 'Failed to fetch loan details' });
  }
});

export default router;
