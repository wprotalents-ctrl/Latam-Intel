import type { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";
import { handleCors } from "./_lib/cors";
import { getGemini, GEMINI_FLASH } from "./_lib/gemini";
import { fetchFreshNews } from "./_lib/news";
import { getSupabase } from "./_lib/supabase";
import { db, admin } from "./_lib/firebase";
import { Type } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method !== "POST") return res.status(405).end();

  if (req.headers["x-cron-secret"] !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const action = (req.query.action as string) || "generate";

  // POST /api/newsletter?action=generate
  if (action === "generate") {
    try {
      const news = await fetchFreshNews(true);
      const newsContext = news.slice(0, 8)
        .map((n: any) => `${n.title}: ${n.description}`).join("\n\n");

      const weekNum   = Math.ceil(new Date().getDate() / 7);
      const monthYear = new Date().toLocaleString("en-US", { month: "short", year: "numeric" });
      const issueId   = `workforce-daily-${new Date().toISOString().split("T")[0]}`;

      const ai = getGemini();
      const r  = await ai.models.generateContent({
        model: GEMINI_FLASH,
        contents: `You are the editorial voice of LATAM INTEL "Workforce Daily" — $29/mo newsletter for HR leaders.
AUTHOR: Juan Carlos Molina, WProTalents founder. 20yr recruiter. 23K LinkedIn. BR/MX/CO/AR/CL expert.
TONE: Direct. No B2B jargon. Data-driven. "So what?" after every insight.

Write this week's full issue covering ALL 5 categories:
Workforce Daily | TechJobs | AI Impact | Recruitment | HR

NEWS: ${newsContext}

For each: subject_line, free_teaser (150w), paid_analysis (400w), slack_hook, country_codes, is_hiring_signal, target_persona`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subject_line: { type: Type.STRING },
              preview_text: { type: Type.STRING },
              categories: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category:         { type: Type.STRING },
                    subject_line:     { type: Type.STRING },
                    free_teaser:      { type: Type.STRING },
                    paid_analysis:    { type: Type.STRING },
                    slack_hook:       { type: Type.STRING },
                    country_codes:    { type: Type.ARRAY, items: { type: Type.STRING } },
                    is_hiring_signal: { type: Type.BOOLEAN },
                    target_persona:   { type: Type.STRING },
                  },
                  required: ["category","subject_line","free_teaser","paid_analysis","slack_hook","is_hiring_signal","target_persona"],
                },
              },
            },
            required: ["subject_line","preview_text","categories"],
          },
        },
      });

      const issue   = JSON.parse(r.text);
      const primary = issue.categories.find((c: any) => c.is_hiring_signal) || issue.categories[0];
      const record  = {
        id:               issueId,
        week_label:       `Week ${weekNum} · ${monthYear}`,
        subject_line:     issue.subject_line,
        preview_text:     issue.preview_text,
        category:         primary.category,
        country_codes:    primary.country_codes || [],
        is_hiring_signal: primary.is_hiring_signal,
        target_persona:   primary.target_persona,
        free_teaser:      primary.free_teaser,
        slack_hook:       primary.slack_hook,
        paid_analysis:    { sections: issue.categories },
        published_at:     new Date().toISOString(),
        created_at:       new Date().toISOString(),
      };

      const sb = getSupabase();
      if (sb) await (sb.from("newsletter_issues") as any).upsert(record, { onConflict: "id" });
      await db.collection("newsletter_issues").doc(issueId).set({
        ...record, createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.json({ success: true, issueId, weekLabel: record.week_label });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  // POST /api/newsletter?action=send
  if (action === "send") {
    const key   = process.env.BEEHIIV_API_KEY;
    const pubId = process.env.BEEHIIV_PUB_ID;
    if (!key || !pubId) return res.status(500).json({ error: "Beehiiv not configured" });

    const sb = getSupabase();
    if (!sb) return res.status(500).json({ error: "Supabase not configured" });

    try {
      const { data: issues } = await (sb.from("newsletter_issues") as any)
        .select("*").order("published_at", { ascending: false }).limit(1);

      if (!issues?.length) return res.status(404).json({ error: "No issue found. Generate first." });

      const issue = issues[0];
      const html  = `
        <h1>${issue.subject_line}</h1>
        <p style="color:#888;font-size:12px;">${issue.week_label} · LATAM INTEL Workforce Daily</p>
        <hr/>
        <p>${issue.free_teaser}</p>
        ${issue.slack_hook ? `<blockquote style="border-left:3px solid #00ff88;padding-left:12px;">
          <strong>Slack it:</strong> "${issue.slack_hook}"
        </blockquote>` : ""}
        <hr/>
        <p><strong>🔒 Full deep-dive for Executive members ($29/mo).</strong></p>
        <a href="https://intel.wprotalents.lat/members"
           style="background:#00ff88;color:#000;padding:12px 24px;font-weight:bold;text-decoration:none;display:inline-block;">
          Read the Full Issue →
        </a>
        <hr/>
        <p style="font-size:12px;color:#999;">
          Hiring AI/tech talent in LATAM? <a href="https://wprotalents.lat">WProTalents</a> — reply to this email.
        </p>`;

      const postRes = await axios.post(
        `https://api.beehiiv.com/v2/publications/${pubId}/posts`,
        { subject: issue.subject_line, preview_text: issue.preview_text || issue.free_teaser.slice(0,100),
          content_html: html, audience: "free", status: "confirmed" },
        { headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" } }
      );

      const beehiivPostId = postRes.data?.data?.id;
      const beehiivWebUrl = postRes.data?.data?.web_url;
      if (beehiivPostId) {
        await (sb.from("newsletter_issues") as any)
          .update({ beehiiv_post_id: beehiivPostId, beehiiv_web_url: beehiivWebUrl })
          .eq("id", issue.id);
      }

      return res.json({ success: true, beehiivPostId, beehiivWebUrl });
    } catch (e: any) {
      return res.status(500).json({ error: e.response?.data || e.message });
    }
  }

  res.status(400).json({ error: `Unknown action: ${action}` });
}
