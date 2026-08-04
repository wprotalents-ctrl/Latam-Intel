// api/payments.ts — consolidated: create-checkout-session + create-crypto-charge
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "./_lib/cors.js";
import { db } from "./_lib/firebase.js";

// ── Lemon Squeezy checkout ──────────────────────────────────────────────────
const CHECKOUT_BASE =
  "https://wprotalentslatamintel.lemonsqueezy.com/checkout/buy/480f510e-92ae-46f8-b238-da14e7cfe44f";

async function createLemonSqueezyCheckout(req: VercelRequest, res: VercelResponse) {
  const { userId, customerEmail } = req.body;
  if (!userId) return res.status(400).json({ error: "userId required" });

  const params = new URLSearchParams();
  if (customerEmail) params.set("checkout[email]", customerEmail);
  params.set("checkout[custom][user_id]", userId);

  const url = `${CHECKOUT_BASE}?${params.toString()}`;
  res.json({ url });
}

// ── Coinbase Commerce charge ────────────────────────────────────────────────
async function createCryptoCharge(req: VercelRequest, res: VercelResponse) {
  const API_KEY = process.env.COINBASE_COMMERCE_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: "Coinbase Commerce not configured" });

  const { userId, userEmail } = req.body;
  if (!userId) return res.status(400).json({ error: "userId required" });

  try {
    const response = await fetch("https://api.commerce.coinbase.com/charges", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CC-Api-Key": API_KEY,
        "X-CC-Version": "2018-03-22",
      },
      body: JSON.stringify({
        name: "WProTalents Executive Access",
        description: "30 days of LATAM AI workforce intelligence — full dashboard, salary data, tools.",
        pricing_type: "fixed_price",
        local_price: { amount: "29.00", currency: "USD" },
        metadata: { userId, userEmail: userEmail || "" },
        redirect_url: `${process.env.APP_URL || "https://latam-intel.vercel.app"}/members?payment=success`,
        cancel_url:   `${process.env.APP_URL || "https://latam-intel.vercel.app"}/members?payment=cancelled`,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Charge creation failed");

    const charge = data.data;

    // Log pending charge to Firestore
    await db.collection("users").doc(userId).collection("payments").add({
      chargeId:  charge.id,
      chargeCode: charge.code,
      amount:    29,
      currency:  "USD",
      status:    "pending",
      createdAt: new Date().toISOString(),
    });

    res.json({ url: charge.hosted_url, chargeId: charge.id, chargeCode: charge.code });
  } catch (e: any) {
    console.error("Coinbase charge error:", e.message);
    res.status(500).json({ error: e.message });
  }
}

// ── Dispatcher ──────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method !== "POST") return res.status(405).end();

  const action = (req.query.action as string) || req.body?.action;

  switch (action) {
    case "checkout":    return await createLemonSqueezyCheckout(req, res);
    case "crypto-charge": return await createCryptoCharge(req, res);
    default: return res.status(400).json({ error: 'Use ?action=checkout or ?action=crypto-charge' });
  }
}
