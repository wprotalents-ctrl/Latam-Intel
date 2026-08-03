import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "../_lib/cors.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method !== "GET") return res.status(405).end();

  const { email } = req.query as { email?: string };
  if (!email) return res.status(400).json({ error: "email required" });

  // Look up subscriber in Supabase by email
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: "Supabase not configured" });
  }

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(supabaseUrl, supabaseKey);

    // Check subscribers table for premium status
    const { data: subscriber, error } = await sb
      .from("subscribers")
      .select("is_premium, premium_until")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (error || !subscriber) {
      return res.json({ isPremium: false, subscriptionStatus: "free" });
    }

    // If premium_until is set and still in the future, user is premium
    let isPremium = !!subscriber.is_premium;
    if (subscriber.premium_until) {
      isPremium = new Date(subscriber.premium_until) > new Date();
    }

    res.json({
      isPremium,
      subscriptionStatus: isPremium ? "premium" : "free",
      premiumUntil: subscriber.premium_until || null,
    });
  } catch (e: any) {
    console.error("[members/verify] error:", e.message);
    res.status(500).json({ error: e.message });
  }
}
