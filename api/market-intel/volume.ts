import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "../_lib/cors.js";
import { db } from "../_lib/firebase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  try {
    const snap = await db.collection("market_intel_snapshots").orderBy("date", "desc").limit(7).get();
    res.json(snap.docs.map((d) => d.data().volume || []));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
