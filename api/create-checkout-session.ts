import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "./_lib/cors.js";

// Lemon Squeezy checkout — builds URL directly (no API call needed)
const CHECKOUT_BASE =
  "https://wprotalentslatamintel.lemonsqueezy.com/checkout/buy/480f510e-92ae-46f8-b238-da14e7cfe44f";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method !== "POST") return res.status(405).end();

  const { userId, customerEmail } = req.body;
  if (!userId) return res.status(400).json({ error: "userId required" });

  const params = new URLSearchParams();
  if (customerEmail) params.set("checkout[email]", customerEmail);
  params.set("checkout[custom][user_id]", userId);

  const url = `${CHECKOUT_BASE}?${params.toString()}`;
  res.json({ url });
}
