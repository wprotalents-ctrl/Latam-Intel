import type { VercelRequest, VercelResponse } from "@vercel/node";
import coinbase from "coinbase-commerce-node";
import { handleCors } from "./_lib/cors";

const { Client, resources } = coinbase;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method !== "POST") return res.status(405).end();

  const { userId, userEmail } = req.body;

  Client.init(process.env.COINBASE_COMMERCE_API_KEY!);

  try {
    const charge = await (resources.Charge as any).create({
      name: "LATAM INTEL Executive — Monthly",
      description: "Full Workforce Daily access, salary data, AI tools, WPro resources.",
      local_price: { amount: "29.00", currency: "USD" },
      pricing_type: "fixed_price",
      metadata: { userId, userEmail },
      redirect_url: "https://intel.wprotalents.lat/members?success=true",
      cancel_url:   "https://intel.wprotalents.lat/?canceled=true",
    });
    res.json({ url: charge.hosted_url });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
