import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "./_lib/cors.js";
import { getGemini, GEMINI_FLASH_L } from "./_lib/gemini.js";
import { fetchFreshNews } from "./_lib/news.js";
import { db, admin } from "./_lib/firebase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const action = (req.query.action as string) || "news";

  try {
    // GET /api/market-intel?action=news
    if (action === "news") {
      const news = await fetchFreshNews();
      return res.json(news);
    }

    // GET /api/market-intel?action=brief
    if (action === "brief") {
      const [newsSnap, trendsSnap] = await Promise.all([
        db.collection("market_news").orderBy("publishedAt", "desc").limit(5).get(),
        db.collection("market_intel_snapshots").orderBy("date", "desc").limit(1).get(),
      ]);
      const newsContext   = newsSnap.docs.map((d) => d.data().title).join("\n");
      const trendsContext = trendsSnap.empty ? "" : JSON.stringify(trendsSnap.docs[0].data().trends);
      const ai = getGemini();
      const r  = await ai.models.generateContent({
        model: GEMINI_FLASH_L,
        contents: `Write a 150-word LATAM AI workforce brief. Direct, no filler, data-driven.
NEWS: ${newsContext}
TRENDS: ${trendsContext}`,
      });
      return res.json({ brief: r.text });
    }

    // GET /api/market-intel?action=trends
    if (action === "trends") {
      const snap = await db.collection("market_intel_snapshots").orderBy("date", "desc").limit(1).get();
      if (snap.empty) return res.json({ sectors: [], companies: [] });
      return res.json(snap.docs[0].data().trends || { sectors: [], companies: [] });
    }

    // GET /api/market-intel?action=volume
    if (action === "volume") {
      const snap = await db.collection("market_intel_snapshots").orderBy("date", "desc").limit(7).get();
      return res.json(snap.docs.map((d) => d.data().volume || []));
    }

    // POST /api/market-intel?action=sync
    if (action === "sync") {
      if (req.method !== "POST") return res.status(405).end();
      const { syncMarketIntel } = await import("../backend/intel/marketIntelService");
      const result = await syncMarketIntel(db);
      return res.json(result);
    }

    res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
