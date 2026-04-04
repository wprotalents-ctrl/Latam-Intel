import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "../_lib/cors";
import { fetchFreshNews } from "../_lib/news";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method !== "GET") return res.status(405).end();
  try {
    const news = await fetchFreshNews();
    res.json(news);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
