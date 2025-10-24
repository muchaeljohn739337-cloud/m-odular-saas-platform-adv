import { Router } from "express";
import Stripe from "stripe";
import { config } from "../config";
import prisma from "../prismaClient";

const router = Router();

const stripeClient = config.stripeSecretKey
  ? new Stripe(config.stripeSecretKey, {
      apiVersion: "2023-10-16",
    })
  : null;

router.post("/checkout-session", async (req, res) => {
  if (!stripeClient) {
    return res.status(503).json({
      error: "Stripe is not configured. Please provide STRIPE_SECRET_KEY.",
    });
  }

  const { amount, currency = "usd", metadata } = req.body || {};

  if (!amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({ error: "A positive amount is required." });
  }

  try {
    const session = await stripeClient.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: Math.round(Number(amount) * 100),
            product_data: {
              name: "Account Top-Up",
            },
          },
          quantity: 1,
        },
      ],
      metadata: metadata ?? {},
      success_url: `${config.frontendUrl}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.frontendUrl}/payments/cancel`,
    });

    return res.json({ url: session.url, id: session.id });
  } catch (error) {
    console.error("Stripe checkout session error", error);
    return res.status(500).json({ error: "Unable to create checkout session." });
  }
});

// Stripe Webhook Handler
router.post("/webhook", async (req, res) => {
  if (!stripeClient) {
    return res.status(503).json({ error: "Stripe not configured" });
  }

  const sig = req.headers["stripe-signature"];

  if (!sig) {
    return res.status(400).json({ error: "Missing stripe-signature header" });
  }

  try {
    // Verify webhook signature
    const event = config.stripeWebhookSecret
      ? stripeClient.webhooks.constructEvent(
          req.body,
          sig,
          config.stripeWebhookSecret
        )
      : JSON.parse(req.body.toString());

    console.log(`🔔 Webhook received: ${event.type}`);

    // Handle successful payment
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const amount = (session.amount_total || 0) / 100; // Convert cents to dollars

      console.log(`✅ Payment successful!`);
      console.log(`   User: ${userId}`);
      console.log(`   Amount: $${amount}`);
      console.log(`   Session: ${session.id}`);

      // Update user USD balance in database
      if (userId) {
        try {
          // Add USD to user balance
          await prisma.user.update({
            where: { id: userId },
            data: { usdBalance: { increment: amount } }
          });
          
          // Create transaction record
          await prisma.transaction.create({
            data: {
              userId,
              amount,
              type: "credit",
              description: `Stripe deposit - Session ${session.id}`,
              status: "completed"
            }
          });

          console.log(`✅ USD balance updated: +$${amount}`);
        } catch (dbError) {
          console.error(`❌ Database update failed:`, dbError);
        }
      } else {
        console.log(`⚠️  No userId in metadata - balance not updated`);
      }
    }

    // Handle failed payment
    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`❌ Payment expired: ${session.id}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error("❌ Webhook error:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

export default router;
