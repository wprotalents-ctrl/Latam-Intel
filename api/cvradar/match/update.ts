import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../../lib/firebase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { radarId, matchId, clientId, status, clientNotes } = req.body;

  if (!radarId || !matchId || !clientId || !status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Update match status in Firestore
    const matchRef = db
      .collection('clients')
      .doc(clientId)
      .collection('cvRadars')
      .doc(radarId)
      .collection('matches')
      .doc(matchId);

    const updateData: Record<string, any> = {
      status,
      clientActionAt: new Date(),
    };

    if (clientNotes) {
      updateData.clientNotes = clientNotes;
    }

    await matchRef.update(updateData);

    return res.status(200).json({
      success: true,
      message: 'Match status updated',
      matchId,
      status,
    });
  } catch (error) {
    console.error('Error updating match:', error);
    return res.status(500).json({ error: 'Failed to update match' });
  }
}
