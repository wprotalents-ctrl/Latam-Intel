import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "./_lib/cors.js";

// NOWPayments invoice — individual-friendly crypto gateway
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method !== "POST") return res.status(405).end();

  const { userId, userEmail } = req.body;
  const apiKey = process.env.NOWPAYMENTS_API_KEY;

  if (!apiKey) return res.status(500).json({ error: "NOWPayments not configured" });

  try {
    const r = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        price_amount:    29,
        price_currency:  "usd",
        order_id:        `wpro-${userId}-${Date.now()}`,
        order_description: "LATAM INTEL Executive — Monthly Membership",
        ipn_callback_url: "https://intel.wprotalents.lat/api/webhooks/nowpayments",
        success_url:     "https://intel.wprotalents.lat/members?success=true",
        cancel_url:      "https://intel.wprotalents.lat/?canceled=true",
        customer_email:  userEmail,
      }),
    });
    const data = await r.json();
    if (!data.invoice_url) return res.status(500).json({ error: "No invoice URL", data });
    res.json({ url: data.invoice_url });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
