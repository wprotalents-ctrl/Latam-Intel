// @ts-nocheck
import { createClient } from "@supabase/supabase-js";

let client: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;
    client = createClient(url, key);
  }
  return client;
}

export async function syncUserToSupabase(params: {
  firebaseUid: string;
  email: string;
  subscriptionStatus: "free" | "premium";
  stripeCustomerId?: string;
  paymentMethod?: "card" | "crypto";
}) {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from("users").upsert(
    {
      id: params.firebaseUid,
      email: params.email,
      subscription_status: params.subscriptionStatus,
      stripe_customer_id: params.stripeCustomerId,
      payment_method: params.paymentMethod,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
}
