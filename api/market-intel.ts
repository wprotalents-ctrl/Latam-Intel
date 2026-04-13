// @ts-nocheck
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "./_lib/cors.js";
import { fetchFreshNews } from "./_lib/news.js";
import { getGemini, GEMINI_FLASH_L } from "./_lib/gemini.js";
import { db } from "./_lib/firebase.js";

export const config = { maxDuration: 30 };

// ── /api/market-intel/news ────────────────────────────────────────────────────
async function handleNews(req: VercelRequest, res: VercelResponse) {
  const force = req.query?.force === '1';
  const news = await fetchFreshNews(force);
  res.json(news);
}

// ── /api/market-intel/brief ───────────────────────────────────────────────────
async function handleBrief(res: VercelResponse) {
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
}

// ── /api/market-intel/crypto-news ────────────────────────────────────────────
async function handleCryptoNews(res: VercelResponse) {
  const API_KEY = process.env.NEWSDATA_API_KEY;
  if (!API_KEY) return res.json([]);
  const r = await fetch(
    `https://newsdata.io/api/1/news?apikey=${API_KEY}&q=crypto+blockchain+web3+LATAM&language=en&size=5`
  );
  const data = await r.json();
  const articles = (data.results || [])
    .filter((a: any) => a.title && a.link)
    .map((a: any) => ({ title: a.title, url: a.link, source: a.source_id }));
  res.json(articles);
}

// ── /api/market-intel/trends ──────────────────────────────────────────────────
async function handleTrends(res: VercelResponse) {
  const snap = await db.collection("market_intel_snapshots").orderBy("date", "desc").limit(1).get();
  if (snap.empty) return res.json({ sectors: [], companies: [] });
  res.json(snap.docs[0].data().trends || { sectors: [], companies: [] });
}

// ── /api/market-intel/volume ──────────────────────────────────────────────────
async function handleVolume(res: VercelResponse) {
  const snap = await db.collection("market_intel_snapshots").orderBy("date", "desc").limit(7).get();
  res.json(snap.docs.map((d) => d.data().volume || []));
}

// ── Main dispatcher ───────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  // section comes from rewrite: /api/market-intel/news → /api/market-intel?section=news
  const section = (req.query.section as string) || "";

  try {
    switch (section) {
      case "news":        return await handleNews(res);
      case "brief":       return await handleBrief(res);
      case "crypto-news": return await handleCryptoNews(res);
      case "trends":      return await handleTrends(res);
      case "volume":      return await handleVolume(res);
      default:
        return res.status(400).json({ error: `Unknown section: "${section}". Use: news, brief, crypto-news, trends, volume` });
    }
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
