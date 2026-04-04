import type { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";
import { handleCors } from "../_lib/cors";
import { getSupabase } from "../_lib/supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method !== "POST") return res.status(405).end();

  if (req.headers["x-cron-secret"] !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const key   = process.env.BEEHIIV_API_KEY;
  const pubId = process.env.BEEHIIV_PUB_ID;
  if (!key || !pubId) return res.status(500).json({ error: "Beehiiv not configured" });

  const sb = getSupabase();
  if (!sb) return res.status(500).json({ error: "Supabase not configured" });

  try {
    const { data: issues } = await sb
      .from("newsletter_issues")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(1);

    if (!issues?.length) {
      return res.status(404).json({ error: "No issue found. Run /api/newsletter/generate first." });
    }

    const issue = issues[0];
    const html  = `
      <h1 style="font-family:monospace;">${issue.subject_line}</h1>
      <p style="color:#888;font-size:12px;">${issue.week_label} · LATAM INTEL Workforce Daily</p>
      <hr/>
      <p>${issue.free_teaser}</p>
      ${issue.slack_hook ? `<blockquote style="border-left:3px solid #00ff88;padding-left:12px;color:#555;">
        <strong>Slack it:</strong> "${issue.slack_hook}"
      </blockquote>` : ""}
      <hr/>
      <p><strong>🔒 Full deep-dive is for Executive members ($29/mo).</strong></p>
      <a href="https://intel.wprotalents.lat/members"
         style="background:#00ff88;color:#000;padding:12px 24px;font-weight:bold;
                text-decoration:none;display:inline-block;margin:16px 0;">
        Read the Full Issue →
      </a>
      <hr/>
      <p style="font-size:12px;color:#999;">
        Hiring senior AI/tech talent in LATAM?
        <a href="https://wprotalents.lat">WProTalents</a> —
        23K+ vetted professionals · 21-day fills · Founder-led.
        Reply to this email.
      </p>`;

    const postRes = await axios.post(
      `https://api.beehiiv.com/v2/publications/${pubId}/posts`,
      {
        subject:      issue.subject_line,
        preview_text: issue.preview_text || issue.free_teaser.slice(0, 100),
        content_html: html,
        audience:     "free",
        status:       "confirmed",
      },
      { headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" } }
    );

    const beehiivPostId = postRes.data?.data?.id;
    const beehiivWebUrl = postRes.data?.data?.web_url;

    if (beehiivPostId) {
      await sb.from("newsletter_issues")
        .update({ beehiiv_post_id: beehiivPostId, beehiiv_web_url: beehiivWebUrl })
        .eq("id", issue.id);
    }

    res.json({ success: true, beehiivPostId, beehiivWebUrl });
  } catch (e: any) {
    console.error("[Newsletter/send]", e.response?.data || e.message);
    res.status(500).json({ error: e.response?.data || e.message });
  }
}
