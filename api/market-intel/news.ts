import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "../_lib/cors.js";
import { fetchFreshNews } from "../_lib/news.js";

export const config = { maxDuration: 30 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  try {
    const news = await fetchFreshNews();
    res.json(news);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
