import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../_lib/firebase';
import admin from 'firebase-admin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { clientId, radarId } = req.query;

  if (!clientId || !radarId) {
    return res.status(400).json({ error: 'clientId and radarId are required' });
  }

  const radarRef = db.collection('clients').doc(clientId as string).collection('cvRadars').doc(radarId as string);

  try {
    // GET - Retrieve radar with its matches
    if (req.method === 'GET') {
      const radarSnap = await radarRef.get();

      if (!radarSnap.exists) {
        return res.status(404).json({ error: 'Radar not found' });
      }

      const radar = radarSnap.data();

      // Fetch all matches for this radar
      const matchesSnap = await radarRef.collection('matches').orderBy('createdAt', 'desc').get();
      const matches = matchesSnap.docs.map((doc) => {
        const data = doc.data();
        return {
          matchId: doc.id,
          candidateId: data.candidateId,
          candidateName: data.candidateName,
          candidateEmail: data.candidateEmail || '',
          matchScore: data.matchScore,
          matchBreakdown: data.matchBreakdown || {
            skillsScore: 0,
            experienceScore: 0,
            locationScore: 0,
            salaryScore: 0,
          },
          reasoning: data.reasoning || [],
          status: data.status,
          createdAt: data.createdAt,
          candidateProfile: data.candidateProfile || {},
        };
      });

      // Calculate stats
      const byStatus = matches.reduce(
        (acc, m) => {
          acc[m.status] = (acc[m.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      return res.status(200).json({
        success: true,
        radar: {
          id: radarSnap.id,
          ...radar,
        },
        matches,
        stats: {
          totalMatches: matches.length,
          avgScore: matches.length > 0 ? Math.round(matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length) : 0,
          byStatus,
        },
      });
    }

    // PUT - Update radar
    if (req.method === 'PUT') {
      const { radarName, criteria, isActive, matchThreshold, notifyOnMatch } = req.body;

      const updateData: any = {};
      if (radarName !== undefined) updateData.radarName = radarName;
      if (criteria !== undefined) updateData.criteria = criteria;
      if (isActive !== undefined) updateData.isActive = isActive;
      if (matchThreshold !== undefined) updateData.matchThreshold = matchThreshold;
      if (notifyOnMatch !== undefined) updateData.notifyOnMatch = notifyOnMatch;
      updateData.updatedAt = admin.firestore.Timestamp.now();

      if (Object.keys(updateData).length === 1) {
        // Only updatedAt was set
        return res.status(400).json({ error: 'No fields to update' });
      }

      await radarRef.update(updateData);

      return res.status(200).json({
        success: true,
        message: 'Radar updated successfully',
      });
    }

    // DELETE - Soft delete (mark as inactive)
    if (req.method === 'DELETE') {
      await radarRef.update({
        isActive: false,
        updatedAt: admin.firestore.Timestamp.now(),
      });

      return res.status(200).json({
        success: true,
        message: 'Radar deleted successfully',
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('cvradar/[radarId] error:', err);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}
