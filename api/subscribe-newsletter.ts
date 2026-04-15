import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "./_lib/cors.js";
import { subscribeToBeehiiv } from "./_lib/beehiiv.js";
import { getSupabase } from "./_lib/supabase.js";

const SHEETS_WEBHOOK = 'https://script.google.com/macros/s/AKfycbwIe4Hd_UA7IpnNlIcLPUHwKA3PqEHgRtwZFXMdltSs_Q9AxYj9YLOeW0yALdFHz9LrfA/exec';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method \!== "POST") return res.status(405).end();

  const action = (req.query.action as string) || "subscribe";

  // ── action=track  (merged from track-signup.ts) ─────────────────────────
  if (action === "track") {
    try {
      const { email, displayName, role, uid, timestamp } = req.body;
      await fetch(SHEETS_WEBHOOK, {
        method: "POST",
        redirect: "follow",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, displayName, role, uid, timestamp }),
      });
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("Sheets webhook error:", err);
      return res.status(200).json({ success: false, error: String(err) });
    }
  }

  // ── action=subscribe  (default) ──────────────────────────────────────────
  const { email, subscriber_type, language } = req.body;
  if (\!email) return res.status(400).json({ error: "email required" });

  try {
    await subscribeToBeehiiv(email);

    const sb = getSupabase();
    if (sb) {
      await (sb.from("subscribers") as any).upsert(
        { email, subscriber_type: subscriber_type || "reader", language: language || "EN" },
        { onConflict: "email" }
      );
      if (subscriber_type === "hiring_manager" || subscriber_type === "company") {
        await (sb.from("leads") as any).insert({
          email, subscriber_type, source: "newsletter", status: "new",
        });
      }
    }

    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
