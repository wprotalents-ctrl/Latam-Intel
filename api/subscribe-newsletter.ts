// api/subscribe-newsletter.ts — capture email + push to Supabase + Beehiiv
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "./_lib/cors.js";
import { beehiivCreateSubscriber } from "./_lib/beehiiv.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method !== "POST") return res.status(405).end();

  const { email, role, country, yearsExp, source } = req.body;
  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Valid email is required" });
  }

  // 1. Upsert to Supabase subscribers table
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
          language: "EN", // will be enriched from frontend context later
          country: country || null,
          utm_source: source || "market-value-teaser",
          subscribed_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      );
    } catch (e: any) {
      console.error("[subscribe-newsletter] Supabase upsert error:", e.message);
    }
  } else {
    console.warn("[subscribe-newsletter] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set");
  }

  // 2. Push to Beehiiv (fire-and-forget, don't block response)
  beehiivCreateSubscriber(email.toLowerCase().trim(), {
    utm_source: source || "market-value-teaser",
    subscriber_type: role || "reader",
  }).catch(() => {});

  return res.json({ success: true });
}
