// @ts-nocheck
import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { db, admin } from "../_lib/firebase.js";
import { syncUserToSupabase } from "../_lib/supabase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  // Verify signature
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!;
  const sig    = req.headers["x-signature"] as string;
  const body   = JSON.stringify(req.body);
  const hmac   = crypto.createHmac("sha256", secret).update(body).digest("hex");
  if (sig !== hmac) return res.status(401).json({ error: "Invalid signature" });

  const event    = req.headers["x-event-name"] as string;
  const meta     = req.body?.meta?.custom_data;
  const userId   = meta?.user_id;
  const email    = req.body?.data?.attributes?.user_email;
  const status   = req.body?.data?.attributes?.status;

  try {
    if (event === "subscription_created" || (event === "subscription_updated" && status === "active")) {
      if (userId) {
        await db.collection("users").doc(userId).set(
          { subscriptionStatus: "premium", updatedAt: admin.firestore.FieldValue.serverTimestamp() },
          { merge: true }
        );
        if (email) await syncUserToSupabase(userId, email, "premium");
      }
    }

    if (event === "subscription_cancelled" || event === "subscription_expired") {
      if (userId) {
        await db.collection("users").doc(userId).set(
          { subscriptionStatus: "free", updatedAt: admin.firestore.FieldValue.serverTimestamp() },
          { merge: true }
        );
        if (email) await syncUserToSupabase(userId, email, "free");
      }
    }

    res.json({ received: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
