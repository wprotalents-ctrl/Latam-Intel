import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { handleCors } from "./_lib/cors";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method !== "POST") return res.status(405).end();

  const { priceId, userId, customerEmail } = req.body;
  if (!priceId) return res.status(400).json({ error: "priceId required" });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-01-27.acacia" as any,
  });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `https://intel.wprotalents.lat/members?success=true`,
      cancel_url:  `https://intel.wprotalents.lat/?canceled=true`,
      customer_email: customerEmail,
      client_reference_id: userId,
    });
    res.json({ id: session.id });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
