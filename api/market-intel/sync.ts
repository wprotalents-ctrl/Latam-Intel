import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "../_lib/cors";
import { db } from "../_lib/firebase";
import { syncMarketIntel } from "../../backend/intel/marketIntelService";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method !== "POST") return res.status(405).end();
  try {
    const result = await syncMarketIntel(db);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
