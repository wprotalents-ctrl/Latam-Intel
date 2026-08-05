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
  try {
    const news = await fetchFreshNews(force);
    res.json(news);
  } catch (e: any) {
    // Never 500 the dashboard — return empty + reason
    res.json([]);
  }
}

// ── /api/market-intel/brief ───────────────────────────────────────────────────
async function handleBrief(req: VercelRequest, res: VercelResponse) {
  try {
    // URL param override (for testing) — only if env var is not set
    // Allows manual workaround: /api/market-intel/brief?key=AQ.Ab8R...
    const envKey = process.env.GEMINI_API_KEY;
    const urlKey = (req.query.key as string) || '';
    const gKey = envKey || urlKey;
    if (!gKey) {
      return res.json({
        brief: null,
        reason: 'GEMINI_API_KEY is missing',
        debug: {
          envKey,
          urlKey,
          reqQuery: req.query,
          reqUrl: req.url,
        },
      });
    }
    const ai = getGemini(gKey);
    const [newsSnap, trendsSnap] = await Promise.all([
      db.collection("market_news").orderBy("publishedAt", "desc").limit(5).get(),
      db.collection("market_intel_snapshots").orderBy("date", "desc").limit(1).get(),
    ]);
    const newsContext = newsSnap.docs.map((d) => d.data().title).join("\n");
    const trendsContext = trendsSnap.empty ? "" : JSON.stringify(trendsSnap.docs[0].data().trends);
    const r = await ai.models.generateContent({
      model: GEMINI_FLASH_L,
      contents: `Write a 150-word LATAM AI workforce brief. Direct, no filler, data-driven.
NEWS: ${newsContext}
TRENDS: ${trendsContext}`,
    });
    res.json({ brief: r.text });
  } catch (e: any) {
    // Soft-fail: brief generation failed — return null with reason
    res.json({ brief: null, reason: e?.message || 'brief generation failed' });
  }
}

// ── /api/market-intel/crypto-news ────────────────────────────────────────────
async function handleCryptoNews(res: VercelResponse) {
  if (!process.env.NEWSDATA_API_KEY) {
    return res.json([]);
  }
  try {
    const API_KEY = process.env.NEWSDATA_API_KEY;
    const r = await fetch(
      `https://newsdata.io/api/1/news?apikey=${API_KEY}&q=crypto+blockchain+web3+LATAM&language=en&size=5`
    );
    const data = await r.json();
    const articles = (data.results || [])
      .filter((a: any) => a.title && a.link)
      .map((a: any) => ({ title: a.title, url: a.link, source: a.source_id }));
    res.json(articles);
  } catch {
    res.json([]);
  }
}

// ── /api/market-intel/trends ──────────────────────────────────────────────────
async function handleTrends(res: VercelResponse) {
  try {
    const snap = await db.collection("market_intel_snapshots").orderBy("date", "desc").limit(1).get();
    if (snap.empty) return res.json({ sectors: [], companies: [] });
    res.json(snap.docs[0].data().trends || { sectors: [], companies: [] });
  } catch {
    res.json({ sectors: [], companies: [] });
  }
}

// ── /api/market-intel/volume ──────────────────────────────────────────────────
async function handleVolume(res: VercelResponse) {
  try {
    const snap = await db.collection("market_intel_snapshots").orderBy("date", "desc").limit(7).get();
    res.json(snap.docs.map((d) => d.data().volume || []));
  } catch {
    res.json([]);
  }
}

// ── /api/market-intel/env-test ────────────────────────────────────────────────
// Diagnostic endpoint: which env var names actually reach the function?
// Tests a variety of name patterns to see if Vercel is filtering by name.
async function handleEnvTest(req: VercelRequest, res: VercelResponse) {
  const probe = (name: string) => {
    const v = process.env[name];
    if (v === undefined) return 'undefined';
    if (v === '') return 'empty-string';
    if (v === null) return 'null';
    return `present(len=${v.length})`;
  };
  return res.json({
    GEMINI_API_KEY: probe('GEMINI_API_KEY'),
    NEWSDATA_API_KEY: probe('NEWSDATA_API_KEY'),
    SUPABASE_URL: probe('SUPABASE_URL'),
    SUPABASE_SERVICE_ROLE_KEY: probe('SUPABASE_SERVICE_ROLE_KEY'),
    VITE_SUPABASE_URL: probe('VITE_SUPABASE_URL'),
    VITE_SUPABASE_ANON_KEY: probe('VITE_SUPABASE_ANON_KEY'),
    // Test if any user env var is making it through at all
    randomTestVar: probe('RANDOM_TEST_VAR_THAT_WAS_NEVER_SET'),
    allKeysCount: Object.keys(process.env).length,
    allEnvKeys: Object.keys(process.env).sort(),
  });
}

// ── Main dispatcher ───────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  // section comes from rewrite: /api/market-intel/news → /api/market-intel?section=news
  const section = (req.query.section as string) || "";

  try {
    switch (section) {
      case "news":        return await handleNews(req, res);
      case "brief":       return await handleBrief(req, res);
      case "crypto-news": return await handleCryptoNews(res);
      case "trends":      return await handleTrends(res);
      case "volume":      return await handleVolume(res);
      case "env-test":    return await handleEnvTest(req, res);
      default:
        return res.status(400).json({ error: `Unknown section: "${section}". Use: news, brief, crypto-news, trends, volume, env-test` });
    }
  } catch (e: any) {
    // Outer safety net — never 500
    res.status(200).json({ error: e?.message || 'unknown' });
  }
}
