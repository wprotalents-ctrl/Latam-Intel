import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "../_lib/firebase";
import { handleCors } from "../_lib/cors";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method !== "GET") return res.status(405).end();

  const { uid } = req.query as { uid: string };
  if (!uid) return res.status(400).json({ error: "uid required" });

  try {
    const doc = await db.collection("users").doc(uid).get();
    if (!doc.exists) return res.json({ isPremium: false, subscriptionStatus: "free" });

    const data = doc.data()!;
    res.json({
      isPremium: data.subscriptionStatus === "premium",
      subscriptionStatus: data.subscriptionStatus || "free",
      paymentMethod: data.paymentMethod || null,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
