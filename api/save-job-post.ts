import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from './_lib/firebase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { role, seniority, country, salary, description, planType, companyEmail } = req.body as {
    role?: string;
    seniority?: string;
    country?: string;
    salary?: number;
    description?: string;
    planType?: string;
    companyEmail?: string;
  };

  if (!role || !planType) {
    return res.status(400).json({ error: 'role and planType are required' });
  }

  try {
    const docRef = await db.collection('jobPosts').add({
      role,
      seniority: seniority ?? 'mid',
      country: country ?? 'Any LATAM',
      salary: salary ?? null,
      description: description ?? '',
      planType,
      companyEmail: companyEmail ?? null,
      status: 'active',
      createdAt: new Date().toISOString(),
    });

    // Send email notification via Resend (fire-and-forget, never block the response)
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'WProTalents Intel <onboarding@resend.dev>',
          to: ['juan@wprotalents.lat', 'wprotalents@gmail.com'],
          subject: `🏢 New ${String(planType).toUpperCase()} Job Post — ${role}`,
          html: `
            <h2 style="font-family:monospace">New Client Job Post</h2>
            <table style="font-family:monospace;font-size:13px;border-collapse:collapse">
              <tr><td style="padding:4px 12px 4px 0;color:#666">Plan Type</td><td><strong>${String(planType).toUpperCase()}</strong></td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#666">Role</td><td><strong>${role}</strong></td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#666">Seniority</td><td>${seniority ?? 'mid'}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#666">Country</td><td>${country ?? 'Any LATAM'}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#666">Salary</td><td>${salary ? `$${salary.toLocaleString()}` : 'Open'}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#666">Company Email</td><td>${companyEmail ?? 'Not provided'}</td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#666">Firestore ID</td><td style="color:#999;font-size:11px">${docRef.id}</td></tr>
            </table>
            ${description ? `<hr style="margin:16px 0"/><h3 style="font-family:monospace">Description</h3><p style="font-family:monospace;font-size:12px;white-space:pre-wrap">${description}</p>` : ''}
            <hr style="margin:16px 0"/>
            <p style="font-family:monospace;font-size:12px">
              <a href="https://console.firebase.google.com/project/ai-studio-applet-webapp-b5093/firestore/databases/ai-studio-98e74f83-a378-445d-baa9-3c954d2762c7/data/~2FjobPosts">
                View all job posts in Firebase →
              </a>
            </p>
          `,
        }),
      }).catch((e: any) => console.warn('Resend email failed:', e.message));
    }

    return res.status(200).json({ success: true, id: docRef.id });
  } catch (err) {
    console.error('save-job-post error:', err);
    return res.status(500).json({ error: 'Failed to save job post' });
  }
}
