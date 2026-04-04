import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import { db, admin } from "../_lib/firebase";
import { syncUserToSupabase } from "../_lib/supabase";
import { subscribeToBeehiiv } from "../_lib/beehiiv";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const event = req.body?.event;
  if (event?.type === "charge:confirmed") {
    const userId = event.data?.metadata?.userId;
    const email  = event.data?.metadata?.userEmail;

    if (userId) {
      await db.collection("users").doc(userId).set(
        { subscriptionStatus: "premium", paymentMethod: "crypto",
          updatedAt: admin.firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );
      if (email) {
        await syncUserToSupabase({ firebaseUid: userId, email,
          subscriptionStatus: "premium", paymentMethod: "crypto" });
        await subscribeToBeehiiv(email, true);

        if (process.env.RESEND_API_KEY) {
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: "LATAM INTEL <intel@wprotalents.lat>",
            to: email,
            subject: "Crypto confirmed — LATAM INTEL Executive live",
            html: `<h1>Confirmed.</h1><p>Crypto payment confirmed. Access your hub:</p>
<a href="https://intel.wprotalents.lat/members" style="background:#00ff88;color:#000;padding:12px 24px;font-weight:bold;text-decoration:none;display:inline-block;">Open Members Hub →</a>`,
          });
        }
      }
    }
  }

  res.json({ received: true });
}
