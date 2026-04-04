import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "./_lib/cors.js";
import { subscribeToBeehiiv } from "./_lib/beehiiv.js";
import { getSupabase } from "./_lib/supabase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method !== "POST") return res.status(405).end();

  const { email, subscriber_type, language } = req.body;
  if (!email) return res.status(400).json({ error: "email required" });

  try {
    await subscribeToBeehiiv(email);

    const sb = getSupabase();
    if (sb) {
      // Cast to any to avoid Supabase generated-types mismatch
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
