import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * POST /api/track-signup
 * Called after a new user picks their role. Appends a row to the
 * WProTalents Lead Capture Google Sheet via an Apps Script webhook.
 *
 * Requires env var: GOOGLE_SHEETS_WEBHOOK (Apps Script web app URL)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Public Apps Script webhook — not a secret, safe to hardcode
  const webhookUrl = 'https://script.google.com/macros/s/AKfycbxulk1Fvmyd5JaZdYYmPLJoX9Rb0Uok5XlFyLSze9AV4-XBBZukH4RCIhpPxe-SIceAVQ/exec';

  try {
    const { email, displayName, role, uid, timestamp } = req.body as {
      email: string;
      displayName?: string;
      role: 'candidate' | 'company';
      uid: string;
      timestamp: string;
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, displayName, role, uid, timestamp }),
    });

    const text = await response.text();
    console.log('Sheets webhook response:', text);

    return res.status(200).json({ success: true });
  } catch (err) {
    // Never block a signup over a sheet error
    console.error('Sheets webhook error:', err);
    return res.status(200).json({ success: false, error: String(err) });
  }
}
