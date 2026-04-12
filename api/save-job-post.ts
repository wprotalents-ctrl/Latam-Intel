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
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    // Notify Juan — fire-and-forget, never block the response
    const notifyUrl = process.env.NOTIFICATION_EMAIL_ENDPOINT;
    if (notifyUrl) {
      fetch(notifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: `New ${String(planType).toUpperCase()} Job Post — ${role}`,
          body: [
            `Role: ${seniority ?? 'mid'} ${role}`,
            `Country: ${country ?? 'Any'}`,
            `Salary: ${salary ? `$${salary.toLocaleString()}` : 'Open'}`,
            `Plan: ${planType}`,
            `Email: ${companyEmail ?? 'Not provided'}`,
            '',
            `Firestore ID: ${docRef.id}`,
            `Description: ${(description ?? '').slice(0, 300)}`,
          ].join('\n'),
        }),
      }).catch(() => {});
    }

    return res.status(200).json({ success: true, id: docRef.id });
  } catch (err) {
    console.error('save-job-post error:', err);
    return res.status(500).json({ error: 'Failed to save job post' });
  }
}
