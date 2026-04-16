import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../_lib/firebase';
import admin from 'firebase-admin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { clientId, radarName, criteria, notificationEmail, matchThreshold, notifyOnMatch } = req.body;

  // Validate required fields
  if (!clientId || !radarName || !criteria) {
    return res.status(400).json({ error: 'clientId, radarName, and criteria are required' });
  }

  if (!notificationEmail || !notificationEmail.includes('@')) {
    return res.status(400).json({ error: 'Valid notificationEmail is required' });
  }

  try {
    // Create radar document in Firestore
    const radarRef = await db
      .collection('clients')
      .doc(clientId)
      .collection('cvRadars')
      .add({
        radarName,
        criteria,
        isActive: true,
        notificationEmail,
        notifyOnMatch: notifyOnMatch !== false, // Default to true
        matchThreshold: matchThreshold || 75,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      });

    return res.status(201).json({
      success: true,
      radarId: radarRef.id,
      message: `CV Radar "${radarName}" created successfully`,
    });
  } catch (err) {
    console.error('cvradar/create error:', err);
    return res.status(500).json({ error: 'Failed to create radar' });
  }
}
