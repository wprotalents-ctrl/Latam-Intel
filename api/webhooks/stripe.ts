import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { Resend } from "resend";
import { db, admin } from "../_lib/firebase";
import { syncUserToSupabase, getSupabase } from "../_lib/supabase";
import { subscribeToBeehiiv } from "../_lib/beehiiv";

// Raw body needed for Stripe signature verification
export const config = { api: { bodyParser: false } };

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-01-27.acacia" as any,
  });

  const rawBody = await getRawBody(req);
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (e: any) {
    return res.status(400).send(`Webhook Error: ${e.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId  = session.client_reference_id;
    const email   = session.customer_details?.email;

    if (userId) {
      await db.collection("users").doc(userId).set(
        { subscriptionStatus: "premium", stripeCustomerId: session.customer,
          updatedAt: admin.firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );

      if (email) {
        await syncUserToSupabase({ firebaseUid: userId, email, subscriptionStatus: "premium",
          stripeCustomerId: session.customer as string, paymentMethod: "card" });
        await subscribeToBeehiiv(email, true);

        if (process.env.RESEND_API_KEY) {
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: "LATAM INTEL <intel@wprotalents.lat>",
            to: email,
            subject: "You're in — LATAM INTEL Executive access is live",
            html: `<h1>Welcome.</h1>
<p>Your membership is active. Head to your hub:</p>
<a href="https://intel.wprotalents.lat/members" style="background:#00ff88;color:#000;padding:12px 24px;font-weight:bold;text-decoration:none;display:inline-block;">
  Open Members Hub →
</a>
<p style="color:#888;font-size:12px;">Questions? Reply to this email — goes straight to Juan.</p>`,
          });
        }
      }
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const snap = await db.collection("users")
      .where("stripeCustomerId", "==", sub.customer).get();
    for (const doc of snap.docs) {
      await doc.ref.set({ subscriptionStatus: "free" }, { merge: true });
    }
    const sb = getSupabase();
    if (sb) {
      await sb.from("users").update({ subscription_status: "free" })
        .eq("stripe_customer_id", sub.customer);
    }
  }

  res.json({ received: true });
}
