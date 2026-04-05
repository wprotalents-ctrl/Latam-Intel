import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "../_lib/cors.js";
import { getGemini, GEMINI_FLASH_L } from "../_lib/gemini.js";
import { db } from "../_lib/firebase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  try {
    const [newsSnap, trendsSnap] = await Promise.all([
      db.collection("market_news").orderBy("publishedAt", "desc").limit(5).get(),
      db.collection("market_intel_snapshots").orderBy("date", "desc").limit(1).get(),
    ]);
    const newsContext = newsSnap.docs.map((d) => d.data().title).join("\n");
    const trendsContext = trendsSnap.empty ? "" : JSON.stringify(trendsSnap.docs[0].data().trends);
    const ai = getGemini();
    const r = await ai.models.generateContent({
      model: GEMINI_FLASH_L,
      contents: `Write a 150-word LATAM AI workforce brief. Direct, no filler, data-driven.
NEWS: ${newsContext}
TRENDS: ${trendsContext}`,
    });
    res.json({ brief: r.text });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
