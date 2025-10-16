import { Router } from "express";
import Stripe from "stripe";
import { config } from "../config";

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

export default router;
