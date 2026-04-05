import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "../_lib/cors.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  try {
    const API_KEY = process.env.NEWSDATA_API_KEY;
    if (!API_KEY) return res.json([]);
    const r = await fetch(
      `https://newsdata.io/api/1/news?apikey=${API_KEY}&q=crypto+blockchain+web3+LATAM&language=en&size=5`
    );
    const data = await r.json() as any;
    const articles = (data.results || [])
      .filter((a: any) => a.title && a.link)
      .map((a: any) => ({ title: a.title, url: a.link, source: a.source_id }));
    res.json(articles);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
