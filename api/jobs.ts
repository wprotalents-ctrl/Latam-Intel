import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "./_lib/cors.js";
import { getGemini, GEMINI_FLASH_L } from "./_lib/gemini.js";

// Inline job fetchers (avoids importing your service files which import Vite)
async function fetchRemotive() {
  const res = await fetch("https://remotive.com/api/remote-jobs?category=software-dev&limit=20");
  const data = await res.json() as any;
  return (data.jobs || [])
    .filter((j: any) => /ai|machine learning|llm|data scientist|ml engineer/i.test(j.title))
    .map((j: any) => ({
      id: `remotive-${j.id}`,
      title: j.title,
      company: j.company_name,
      location: j.candidate_required_location || "Remote",
      url: j.url,
      salary: j.salary || "Not specified",
      source: "Remotive",
      region: "Worldwide",
    }));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method !== "GET") return res.status(405).end();

  const lang = (req.query.lang as string) || "EN";

  try {
    const jobs = await fetchRemotive();

    if (lang !== "EN" && process.env.GEMINI_API_KEY && jobs.length > 0) {
      try {
        const ai = getGemini();
        const slice = jobs.slice(0, 15);
        const r = await ai.models.generateContent({
          model: GEMINI_FLASH_L,
          contents: `Translate these job titles and locations to ${lang === "ES" ? "Spanish" : "Portuguese"}.
Return ONLY a JSON array with "id", "title", "location".
JOBS: ${JSON.stringify(slice.map((j: any) => ({ id: j.id, title: j.title, location: j.location })))}`,
          config: { responseMimeType: "application/json" },
        });
        const translated = JSON.parse(r.text);
        return res.json([
          ...slice.map((j: any) => {
            const t = translated.find((x: any) => x.id === j.id);
            return t ? { ...j, title: t.title, location: t.location } : j;
          }),
          ...jobs.slice(15),
        ]);
      } catch (e) { /* fall through to untranslated */ }
    }

    res.json(jobs);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
