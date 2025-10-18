// Chatbot API Routes
// REST endpoints for Botpress chatbot integration

import express, { Request, Response } from "express";
import chatbotSupport from "../rpa/chatbot";

const router = express.Router();

/**
 * GET /api/chatbot/balance/:userId
 * Get user balance for chatbot
 */
router.get("/balance/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const balance = await chatbotSupport.getUserBalance(userId);
    
    res.json({ balance });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch balance",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/chatbot/transactions/:userId
 * Get recent transactions for chatbot
 */
router.get("/transactions/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 5;
    
    const transactions = await chatbotSupport.getRecentTransactions(userId, limit);
    
    res.json({ transactions });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch transactions",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/chatbot/kyc/:userId
 * Get KYC status for chatbot
 */
router.get("/kyc/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const kycStatus = await chatbotSupport.getKYCStatus(userId);
    
    res.json(kycStatus);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch KYC status",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/chatbot/crypto-orders/:userId
 * Get crypto orders for chatbot
 */
router.get("/crypto-orders/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 5;
    
    const orders = await chatbotSupport.getCryptoOrders(userId, limit);
    
    res.json({ orders });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch crypto orders",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/chatbot/faq
 * Handle FAQ questions
 */
router.post("/faq", async (req: Request, res: Response) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }
    
    const response = await chatbotSupport.handleFAQ(question);
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      error: "Failed to process FAQ",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/chatbot/support-ticket
 * Create support ticket
 */
router.post("/support-ticket", async (req: Request, res: Response) => {
  try {
    const { userId, message } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({ error: "userId and message are required" });
    }
    
    const ticketId = await chatbotSupport.createSupportTicket(userId, message);
    
    res.json({
      success: true,
      ticketId,
      message: "Support ticket created. Our team will respond within 24 hours.",
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to create support ticket",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/chatbot/webhook
 * Botpress webhook endpoint
 */
router.post("/webhook", async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    
    // Verify webhook signature (in production)
    // const signature = req.headers['x-botpress-signature'];
    // if (!verifySignature(signature, payload)) {
    //   return res.status(401).json({ error: 'Invalid signature' });
    // }
    
    const response = await chatbotSupport.processWebhook(payload);
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      error: "Webhook processing failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/chatbot/analytics
 * Get chatbot analytics
 */
router.get("/analytics", async (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate as string)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate as string)
      : new Date();
    
    const analytics = await chatbotSupport.getAnalytics(startDate, endDate);
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch analytics",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/chatbot/health
 * Chatbot health check
 */
router.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    service: "chatbot",
    timestamp: new Date().toISOString(),
  });
});

export default router;
