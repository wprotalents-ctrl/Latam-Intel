// api/members.ts — consolidated: subscribe-newsletter + members/verify
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "./_lib/cors.js";
import { beehiivCreateSubscriber } from "./_lib/beehiiv.js";

// ── 1. Subscribe to newsletter ─────────────────────────────────────────────
async function handleSubscribe(req: VercelRequest, res: VercelResponse) {
  const { email, role, country, yearsExp, source } = req.body;
  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Valid email is required" });
  }

  // Upsert to Supabase subscribers table
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && supabaseKey) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const sb = createClient(supabaseUrl, supabaseKey);
      await sb.from("subscribers").upsert(
        {
          email: email.toLowerCase().trim(),
          subscriber_type: role || "reader",
          language: "EN",
          country: country || null,
          utm_source: source || "market-value-teaser",
          subscribed_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      );
    } catch (e: any) {
      console.error("[members/subscribe] Supabase upsert error:", e.message);
    }
  } else {
    console.warn("[members/subscribe] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set");
  }

  // Push to Beehiiv (fire-and-forget)
  beehiivCreateSubscriber(email.toLowerCase().trim(), {
    utm_source: source || "market-value-teaser",
    subscriber_type: role || "reader",
  }).catch(() => {});

  return res.json({ success: true });
}

// ── 2. Verify premium status ───────────────────────────────────────────────
async function handleVerify(req: VercelRequest, res: VercelResponse) {
  const { email } = req.query as { email?: string };
  if (!email) return res.status(400).json({ error: "email required" });

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: "Supabase not configured" });
  }

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(supabaseUrl, supabaseKey);

    const { data: subscriber, error } = await sb
      .from("subscribers")
      .select("is_premium, premium_until")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (error || !subscriber) {
      return res.json({ isPremium: false, subscriptionStatus: "free" });
    }

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

// ── Dispatcher ──────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const action = (req.query.action as string) || req.body?.action;

  if (req.method === "GET" && action === "verify") {
    return await handleVerify(req, res);
  }
  if (req.method === "POST" && (action === "subscribe" || !action)) {
    return await handleSubscribe(req, res);
  }

  return res.status(405).json({ error: 'Use ?action=subscribe (POST) or ?action=verify&email=... (GET)' });
}
