import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, admin } from './_lib/firebase';

/*
  Consolidated CV Radar API — replaces:
    cvradar/create.ts      → POST /
    cvradar/list.ts       → GET /
    cvradar/[radarId].ts → GET|PUT|DELETE /:id
    cvradar/match/update.ts → POST /:id/match
*/

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const clientId = (req.query.clientId as string) || (req.body && req.body.clientId);
  const radarId = req.query.radarId as string;

  // POST /api/cvradar — create radar
  if (req.method === 'POST' && !radarId) {
    const { radarName, criteria, notificationEmail, matchThreshold, notifyOnMatch } = req.body || {};

    if (!radarName || !criteria || !notificationEmail) {
      return res.status(400).json({ error: 'radarName, criteria, and notificationEmail are required' });
    }
    if (!notificationEmail.includes('@')) {
      return res.status(400).json({ error: 'Valid notificationEmail required' });
    }

    try {
      const radarRef = await db
        .collection('clients')
        .doc(req.body.clientId as string)
        .collection('cvRadars')
        .add({
          radarName,
          criteria,
          isActive: true,
          notificationEmail,
          notifyOnMatch: notifyOnMatch !== false,
          matchThreshold: matchThreshold || 75,
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
        });
      return res.status(201).json({ success: true, radarId: radarRef.id });
    } catch (err) {
      console.error('cvradar create error:', err);
      return res.status(500).json({ error: 'Failed to create radar' });
    }
  }

  // GET /api/cvradar — list radars for client
  if (req.method === 'GET' && !radarId) {
    if (!clientId) return res.status(400).json({ error: 'clientId is required' });

    try {
      const snap = await db
        .collection('clients')
        .doc(clientId)
        .collection('cvRadars')
        .orderBy('createdAt', 'desc')
        .get();

      const radars = await Promise.all(
        snap.docs.map(async (doc) => {
          const data = doc.data();
          const matchesSnap = await doc.ref.collection('matches').where('status', '==', 'new').get();
          return {
            id: doc.id,
            radarName: data.radarName,
            isActive: data.isActive,
            matchThreshold: data.matchThreshold,
            newMatches: matchesSnap.size,
            lastMatchedAt: data.lastMatchedAt,
            createdAt: data.createdAt,
          };
        })
      );
      return res.status(200).json({ success: true, radars, totalCount: radars.length });
    } catch (err) {
      console.error('cvradar list error:', err);
      return res.status(500).json({ error: 'Failed to list radars' });
    }
  }

  // /:id — single radar operations
  if (radarId) {
    if (!clientId) return res.status(400).json({ error: 'clientId is required' });

    const radarRef = db
      .collection('clients')
      .doc(clientId)
      .collection('cvRadars')
      .doc(radarId);

    // GET /api/cvradar?radarId=xxx
    if (req.method === 'GET') {
      try {
        const doc = await radarRef.get();
        if (!doc.exists) return res.status(404).json({ error: 'Radar not found' });
        return res.status(200).json({ success: true, radar: { id: doc.id, ...doc.data() } });
      } catch (err) {
        console.error('cvradar get error:', err);
        return res.status(500).json({ error: 'Failed to get radar' });
      }
    }

    // PUT /api/cvradar?radarId=xxx
    if (req.method === 'PUT') {
      try {
        const updates = { ...req.body, updatedAt: admin.firestore.Timestamp.now() };
        delete updates.radarId;
        await radarRef.update(updates);
        return res.status(200).json({ success: true, message: 'Radar updated' });
      } catch (err) {
        console.error('cvradar update error:', err);
        return res.status(500).json({ error: 'Failed to update radar' });
      }
    }

    // DELETE /api/cvradar?radarId=xxx
    if (req.method === 'DELETE') {
      try {
        await radarRef.delete();
        return res.status(200).json({ success: true, message: 'Radar deleted' });
      } catch (err) {
        console.error('cvradar delete error:', err);
        return res.status(500).json({ error: 'Failed to delete radar' });
      }
    }

    // POST /api/cvradar?radarId=xxx/match — update match status
    if (req.method === 'POST') {
      const { matchId, status, candidateProfile } = req.body || {};
      if (!matchId) return res.status(400).json({ error: 'matchId is required' });

      try {
        const matchRef = radarRef.collection('matches').doc(matchId);
        const updates: Record<string, unknown> = { status, updatedAt: admin.firestore.Timestamp.now() };
        if (candidateProfile) updates.candidateProfile = candidateProfile;
        await matchRef.update(updates);
        return res.status(200).json({ success: true, message: 'Match updated' });
      } catch (err) {
        console.error('cvradar match update error:', err);
        return res.status(500).json({ error: 'Failed to update match' });
      }
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
