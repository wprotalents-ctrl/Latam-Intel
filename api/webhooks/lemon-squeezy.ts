// @ts-nocheck
import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { db, admin } from "../_lib/firebase.js";

async function updateSupabaseSubscriber(email: string, isPremium: boolean, premiumUntil?: string) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) return;
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(supabaseUrl, supabaseKey);
    await sb.from("subscribers").upsert(
      {
        email: email.toLowerCase().trim(),
        is_premium: isPremium,
        premium_until: premiumUntil || null,
        updated_at: new Date().toISOString(),
        // Ensure the row exists even if never subscribed to newsletter
      },
      { onConflict: "email" }
    );
  } catch (e: any) {
    console.warn("[lemon-squeezy webhook] Supabase update error:", e.message);
  }
}

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
  const renewsAt = req.body?.data?.attributes?.renews_at;
  const endsAt   = req.body?.data?.attributes?.ends_at;

  try {
    if (event === "subscription_created" || (event === "subscription_updated" && status === "active")) {
      // Calculate premium_until: use renews_at or ends_at, or default to 30 days from now
      const premiumUntil = (renewsAt || endsAt) || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      if (email) {
        await updateSupabaseSubscriber(email, true, premiumUntil);
      }
      if (userId) {
        await db.collection("users").doc(userId).set(
          { subscriptionStatus: "premium", updatedAt: admin.firestore.FieldValue.serverTimestamp() },
          { merge: true }
        );
      }
    }

    if (event === "subscription_cancelled" || event === "subscription_expired") {
      if (email) {
        await updateSupabaseSubscriber(email, false);
      }
      if (userId) {
        await db.collection("users").doc(userId).set(
          { subscriptionStatus: "free", updatedAt: admin.firestore.FieldValue.serverTimestamp() },
          { merge: true }
        );
      }
    }

    res.json({ received: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
