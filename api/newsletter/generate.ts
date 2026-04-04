import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "../_lib/cors";
import { getGemini, GEMINI_FLASH } from "../_lib/gemini";
import { fetchFreshNews } from "../_lib/news";
import { getSupabase } from "../_lib/supabase";
import { db, admin } from "../_lib/firebase";
import { Type } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method !== "POST") return res.status(405).end();

  // Protect with cron secret
  if (req.headers["x-cron-secret"] !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

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
      contents: `You are the editorial voice of LATAM INTEL "Workforce Daily" — $29/mo newsletter for HR leaders tracking AI's impact on LATAM workforce.

AUTHOR: Juan Carlos Molina, WProTalents founder. 20yr recruiter. 23K LinkedIn connections. BR/MX/CO/AR/CL expert.
TONE: Direct. No B2B jargon. Data-driven. "So what?" after every insight. Never start with clichés.

Write this week's full issue covering ALL 5 categories:
1. Workforce Daily — LATAM AI market shifts
2. TechJobs — technical roles and talent scarcity
3. AI Impact — automation reshaping LATAM sectors
4. Recruitment — operational intel for HR leaders
5. HR — policy, legal, remote-work culture

NEWS THIS WEEK: ${newsContext}

For each: subject_line, free_teaser (150w), paid_analysis (400w with sections), slack_hook, country_codes, is_hiring_signal, target_persona`,
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

    const record = {
      id: issueId,
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

    // Save to Supabase
    const sb = getSupabase();
    if (sb) await sb.from("newsletter_issues").upsert(record, { onConflict: "id" });

    // Backup to Firestore
    await db.collection("newsletter_issues").doc(issueId).set({
      ...record, createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true, issueId, weekLabel: record.week_label, categories: issue.categories.length });
  } catch (e: any) {
    console.error("[Newsletter/generate]", e);
    res.status(500).json({ error: e.message });
  }
}
