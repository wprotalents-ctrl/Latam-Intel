import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "./_lib/cors.js";

// Lemon Squeezy checkout
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method !== "POST") return res.status(405).end();

  const { userId, customerEmail } = req.body;
  const apiKey    = process.env.LEMON_SQUEEZY_API_KEY;
  const variantId = process.env.LEMON_SQUEEZY_VARIANT_ID;
  const storeId   = process.env.LEMON_SQUEEZY_STORE_ID;

  if (!apiKey || !variantId || !storeId)
    return res.status(500).json({ error: "Lemon Squeezy not configured" });

  try {
    const r = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              email: customerEmail,
              custom: { user_id: userId },
            },
            product_options: {
              redirect_url: "https://intel.wprotalents.lat/members?success=true",
            },
          },
          relationships: {
            store:   { data: { type: "stores",  id: storeId } },
            variant: { data: { type: "variants", id: variantId } },
          },
        },
      }),
    });
    const data = await r.json();
    const url = data?.data?.attributes?.url;
    if (!url) return res.status(500).json({ error: "No checkout URL", data });
    res.json({ url });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
