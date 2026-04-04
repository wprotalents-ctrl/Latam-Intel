import axios from "axios";

export async function subscribeToBeehiiv(email: string, isPremium = false) {
  const key = process.env.BEEHIIV_API_KEY;
  const pubId = process.env.BEEHIIV_PUB_ID;
  if (!key || !pubId) return;

  try {
    await axios.post(
      `https://api.beehiiv.com/v2/publications/${pubId}/subscriptions`,
      {
        email,
        reactivate_existing: true,
        send_welcome_email: true,
        ...(isPremium && { tier: "premium" }),
        custom_fields: [{ name: "subscriber_type", value: "reader" }],
      },
      { headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("[Beehiiv]", e.response?.data || e.message);
  }
}
