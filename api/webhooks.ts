// api/webhooks.ts — consolidated: webhooks/lemon-squeezy + crypto-webhook
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
    console.warn("[webhook] Supabase update error:", e.message);
  }
}

// ── Lemon Squeezy webhook ───────────────────────────────────────────────────
function handleLemonSqueezy(req: VercelRequest, res: VercelResponse) {
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

  if (event === "subscription_created" || (event === "subscription_updated" && status === "active")) {
    const premiumUntil = (renewsAt || endsAt) || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    if (email) updateSupabaseSubscriber(email, true, premiumUntil);
    if (userId) {
      db.collection("users").doc(userId).set(
        { subscriptionStatus: "premium", updatedAt: admin.firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );
    }
  }

  if (event === "subscription_cancelled" || event === "subscription_expired") {
    if (email) updateSupabaseSubscriber(email, false);
    if (userId) {
      db.collection("users").doc(userId).set(
        { subscriptionStatus: "free", updatedAt: admin.firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );
    }
  }

  res.json({ received: true });
}

// ── Coinbase Commerce webhook ───────────────────────────────────────────────
async function handleCoinbase(req: VercelRequest, res: VercelResponse) {
  const WEBHOOK_SECRET = process.env.COINBASE_COMMERCE_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) return res.status(500).json({ error: "Webhook secret not configured" });

  const signature = req.headers["x-cc-webhook-signature"] as string;
  if (!signature) return res.status(401).json({ error: "Missing signature" });

  const rawBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
  const computed = crypto.createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex");
  if (computed !== signature) return res.status(401).json({ error: "Invalid signature" });

  const event = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { type, data: charge } = event.event || event;

  if (type === "charge:confirmed" || type === "charge:resolved") {
    const { userId, userEmail } = charge.metadata || {};
    const now = new Date();
    const executiveUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    await updateSupabaseSubscriber(userEmail || "", true, executiveUntil.toISOString());

    if (userId) {
      await db.collection("users").doc(userId).set({
        executiveUntil: admin.firestore.Timestamp.fromDate(executiveUntil),
        executiveSince: admin.firestore.Timestamp.fromDate(now),
        executiveEmail: userEmail || "",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      const paymentsSnap = await db.collection("users").doc(userId)
        .collection("payments").where("chargeId", "==", charge.id)
        .limit(1).get();

      if (!paymentsSnap.empty) {
        await paymentsSnap.docs[0].ref.update({
          status: "confirmed", confirmedAt: now.toISOString(),
          executiveUntil: executiveUntil.toISOString(),
        });
      }
    }
  }

  if (type === "charge:failed") {
    const { userId, userEmail } = charge.metadata || {};
    await updateSupabaseSubscriber(userEmail || "", false);
    if (userId) {
      const paymentsSnap = await db.collection("users").doc(userId)
        .collection("payments").where("chargeId", "==", charge.id)
        .limit(1).get();
      if (!paymentsSnap.empty) {
        await paymentsSnap.docs[0].ref.update({ status: "failed" });
      }
    }
  }

  res.status(200).json({ received: true });
}

// ── Dispatcher ──────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const type = (req.query.type as string) || "";
  switch (type) {
    case "lemon-squeezy": return handleLemonSqueezy(req, res);
    case "coinbase":      return handleCoinbase(req, res);
    default: return res.status(400).json({ error: 'Use ?type=lemon-squeezy or ?type=coinbase' });
  }
}
