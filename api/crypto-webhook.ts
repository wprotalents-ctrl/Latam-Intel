// @ts-nocheck
import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { db, admin } from "./_lib/firebase.js";

async function updateSupabaseSubscriber(email: string, isPremium: boolean, premiumUntil?: string) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey || !email) return;
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(supabaseUrl, supabaseKey);
    await sb.from("subscribers").upsert(
      {
        email: email.toLowerCase().trim(),
        is_premium: isPremium,
        premium_until: premiumUntil || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" }
    );
  } catch (e: any) {
    console.warn("[crypto-webhook] Supabase update error:", e.message);
  }
}

export const config = { maxDuration: 15 };

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  const computed = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return computed === signature;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const WEBHOOK_SECRET = process.env.COINBASE_COMMERCE_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) return res.status(500).json({ error: "Webhook secret not configured" });

  const signature = req.headers["x-cc-webhook-signature"] as string;
  if (!signature) return res.status(401).json({ error: "Missing signature" });

  // Vercel parses body — we need the raw string
  const rawBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body);

  if (!verifySignature(rawBody, signature, WEBHOOK_SECRET)) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  const event = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { type, data: charge } = event.event || event;

  if (type === "charge:confirmed" || type === "charge:resolved") {
    const { userId, userEmail } = charge.metadata || {};
    const now = new Date();
    const executiveUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days

    // Write to Supabase subscribers table
    await updateSupabaseSubscriber(userEmail || "", true, executiveUntil.toISOString());

    // Also update Firestore for backwards compat
    if (userId) {
      await db.collection("users").doc(userId).set({
        executiveUntil: admin.firestore.Timestamp.fromDate(executiveUntil),
        executiveSince: admin.firestore.Timestamp.fromDate(now),
        executiveEmail: userEmail || "",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      // Update payment record
      const paymentsSnap = await db.collection("users").doc(userId)
        .collection("payments")
        .where("chargeId", "==", charge.id)
        .limit(1).get();

      if (!paymentsSnap.empty) {
        await paymentsSnap.docs[0].ref.update({
          status: "confirmed",
          confirmedAt: now.toISOString(),
          executiveUntil: executiveUntil.toISOString(),
        });
      }
    }

    console.log(`Executive access granted to ${userEmail || userId} until ${executiveUntil.toISOString()}`);
  }

  if (type === "charge:failed") {
    const { userId, userEmail } = charge.metadata || {};
    await updateSupabaseSubscriber(userEmail || "", false);
    if (userId) {
      const paymentsSnap = await db.collection("users").doc(userId)
        .collection("payments")
        .where("chargeId", "==", charge.id)
        .limit(1).get();
      if (!paymentsSnap.empty) {
        await paymentsSnap.docs[0].ref.update({ status: "failed" });
      }
    }
  }

  res.status(200).json({ received: true });
}
