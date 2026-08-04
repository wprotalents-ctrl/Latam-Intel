// api/newsletter/generate.ts — generate weekly newsletter via Gemini
// Triggered by Vercel Cron (GET) or manual curl (POST with x-cron-secret)
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from '../_lib/cors.js';
import { fetchFreshNews } from '../_lib/news.js';
import { getGemini, GEMINI_FLASH } from '../_lib/gemini.js';

export const config = { maxDuration: 60 };

// Vercel Cron sends GET; manual triggers use POST with x-cron-secret
// We accept both, but only verify the secret for POST.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS preflight
  if (handleCors(req, res)) return;

  // For POST requests, verify cron secret
  if (req.method === 'POST') {
    const secret = req.headers['x-cron-secret'] as string;
    if (!secret || secret !== process.env.CRON_SECRET) {
      return res.status(401).json({ error: 'Invalid or missing x-cron-secret' });
    }
  }

  // Only allow GET (cron) and POST (manual)
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).end();
  }

  try {
    // 1. Fetch recent news
    const news = await fetchFreshNews(true);
    const newsContext = news.slice(0, 10).map((a, i) => `${i + 1}. ${a.title}`).join('\n');

    // 2. Generate newsletter content in 3 languages
    const ai = getGemini();

    const prompt = `You are the editor of "Workforce Daily" by WProTalents — a LATAM tech workforce intelligence newsletter.
Based on the following recent news headlines about LATAM tech/hiring/AI, write a newsletter issue.

RECENT NEWS:\n${newsContext}

TODAY'S DATE CONTEXT: August 2026

Generate the output as a JSON object with this exact structure (no markdown, just raw JSON):
{
  "week_label": "Week 31 · Aug 2026",
  "subject_line": { "EN": "", "ES": "", "PT": "" },
  "preview_text": { "EN": "", "ES": "", "PT": "" },
  "free_teaser": { "EN": "", "ES": "", "PT": "" },
  "body_html": { "EN": "", "ES": "", "PT": "" }
}

Rules:
- Subject lines should be compelling, under 80 chars, mention LATAM + AI/salaries/hiring
- Free teaser: 2-3 sentences teasing the key insight, ends with a CTA to subscribe
- Body HTML: use simple HTML (h2, h3, p, ul, li, strong, em, br). No inline styles. Keep it scannable.
- Content must be specific, data-driven, and actionable for LATAM tech professionals
- Include at least: a lead story, 3-4 key takeaways with bullet points, and a "So What" section
- Keep total body under 800 words per language
- The ES and PT versions should be proper translations, not just English with different words`;

    const r = await ai.models.generateContent({
      model: GEMINI_FLASH,
      contents: prompt,
      config: {
    responseMimeType: 'application/json',
  },
    });

    const parsed = JSON.parse(r.text);

    // 3. Store in Supabase
    const issueId = `workforce-daily-${new Date().toISOString().slice(0, 10)}`;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey) {
      const { createClient } = await import('@supabase/supabase-js');
      const sb = createClient(supabaseUrl, supabaseKey);
      await sb.from('newsletter_issues').upsert(
        {
          id: issueId,
          week_label: parsed.week_label,
          subject_line: parsed.subject_line.EN,
          preview_text: parsed.preview_text.EN,
          category: 'Workforce Daily',
          free_teaser: parsed.free_teaser.EN,
          paid_analysis: {
            en: { subject: parsed.subject_line.EN, body: parsed.body_html.EN },
            es: { subject: parsed.subject_line.ES, body: parsed.body_html.ES },
            pt: { subject: parsed.subject_line.PT, body: parsed.body_html.PT },
          },
          published_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    }

    return res.json({
      success: true,
      issueId,
      subject: parsed.subject_line.EN,
      week_label: parsed.week_label,
    });
  } catch (e: any) {
    console.error('[newsletter/generate] error:', e.message);
    return res.status(500).json({ error: e.message });
  }
}
