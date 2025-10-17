import express, { Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * DEMO LOANS ROUTES
 * These are simplified demo endpoints for loan features
 * Replace with full implementation when needed
 */

// Get demo loan offers (no database required)
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
      }
    ];
    
    res.json({ offers });
  } catch (error) {
    console.error('Error fetching loan offers:', error);
    res.status(500).json({ error: 'Failed to fetch loan offers' });
  }
});

// Get user loans (demo - returns empty array)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Demo: return empty array until loan feature is fully implemented
    res.json({ 
      loans: [],
      message: 'Loan feature coming soon'
    });
  } catch (error) {
    console.error('Error fetching loans:', error);
    res.status(500).json({ error: 'Failed to fetch loans' });
  }
});

// Apply for loan (demo - returns success message)
router.post('/apply', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, termMonths, purpose } = req.body;
    
    // Basic validation
    if (!amount || !termMonths) {
      return res.status(400).json({ error: 'Amount and term are required' });
    }
    
    // Demo response
    res.json({ 
      message: 'Loan application received (demo mode)',
      application: {
        amount,
        termMonths,
        purpose,
        status: 'pending_review'
      }
    });
  } catch (error) {
    console.error('Error applying for loan:', error);
    res.status(500).json({ error: 'Failed to submit loan application' });
  }
});

export default router;
