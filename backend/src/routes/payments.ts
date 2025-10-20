import { Router } from "express";
import Stripe from "stripe";
import { config } from "../config";
import prisma from "../prismaClient";
import { authenticateToken } from "../middleware/auth";

const router = Router();

const stripeClient = config.stripeSecretKey
  ? new Stripe(config.stripeSecretKey, {
      apiVersion: "2023-10-16",
    })
  : null;

// Quick health endpoint to verify Stripe wiring
router.get("/health", (req, res) => {
  return res.json({ stripeConfigured: Boolean(stripeClient) });
});

// Create a Checkout Session, requiring auth; attach userId to metadata server-side
router.post("/checkout-session", authenticateToken as any, async (req: any, res) => {
  if (!stripeClient) {
    return res.status(503).json({ error: "Stripe is not configured. Please provide STRIPE_SECRET_KEY." });
  }

  const { amount, currency = "usd", metadata } = req.body || {};
  if (!amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({ error: "A positive amount is required." });
  }

  try {
    const userId = req.user?.userId;
    const mergedMetadata = { ...(metadata ?? {}), ...(userId ? { userId } : {}) } as Record<string, string>;
    const session = await stripeClient.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: Math.round(Number(amount) * 100),
            product_data: { name: "Account Top-Up" },
          },
          quantity: 1,
        },
      ],
      metadata: mergedMetadata,
      success_url: `${config.frontendUrl}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.frontendUrl}/payments/cancel`,
    });

    return res.json({ url: session.url, id: session.id });
  } catch (error) {
    console.error("Stripe checkout session error", error);
    return res.status(500).json({ error: "Unable to create checkout session." });
  }
});

// Retrieve a Checkout Session by id for the authenticated user
router.get("/session/:id", authenticateToken as any, async (req: any, res) => {
  if (!stripeClient) {
    return res.status(503).json({ error: "Stripe is not configured." });
  }
  const sessionId = req.params.id;
  if (!sessionId) return res.status(400).json({ error: "session id required" });

  try {
    const session = await stripeClient.checkout.sessions.retrieve(sessionId);
    const metaUserId = (session.metadata?.userId as string) || undefined;
    if (metaUserId && metaUserId !== req.user?.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return res.json({
      id: session.id,
      amount_total: session.amount_total,
      currency: session.currency,
      status: session.status,
      payment_status: session.payment_status,
      metadata: session.metadata || {},
    });
  } catch (err: any) {
    console.error("Error retrieving session", err?.message || err);
    return res.status(404).json({ error: "Session not found" });
  }
});

// Note: webhook will be registered in index.ts with raw body
export default router;
