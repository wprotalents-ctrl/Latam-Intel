import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "../_lib/cors.js";
import { db } from "../_lib/firebase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  try {
    const snap = await db.collection("market_intel_snapshots").orderBy("date", "desc").limit(1).get();
    if (snap.empty) return res.json({ sectors: [], companies: [] });
    res.json(snap.docs[0].data().trends || { sectors: [], companies: [] });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
