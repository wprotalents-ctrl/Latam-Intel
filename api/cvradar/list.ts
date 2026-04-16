import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../_lib/firebase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const clientId = req.query.clientId as string;

  if (!clientId) {
    return res.status(400).json({ error: 'clientId query parameter is required' });
  }

  try {
    // Fetch all radars for the client
    const snap = await db
      .collection('clients')
      .doc(clientId)
      .collection('cvRadars')
      .orderBy('createdAt', 'desc')
      .get();

    const radars = await Promise.all(
      snap.docs.map(async (doc) => {
        const data = doc.data();

        // Count matches for each radar
        const matchesSnap = await doc.ref.collection('matches').where('status', '==', 'new').get();
        const newMatchCount = matchesSnap.size;

        return {
          id: doc.id,
          radarName: data.radarName,
          isActive: data.isActive,
          matchThreshold: data.matchThreshold,
          newMatches: newMatchCount,
          lastMatchedAt: data.lastMatchedAt,
          createdAt: data.createdAt,
        };
      })
    );

    return res.status(200).json({
      success: true,
      radars,
      totalCount: radars.length,
    });
  } catch (err) {
    console.error('cvradar/list error:', err);
    return res.status(500).json({ error: 'Failed to list radars' });
  }
}
