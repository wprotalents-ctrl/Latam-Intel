/**
 * CV Radar Matcher Cloud Function
 * 
 * Triggers on jobPosts/{postId} creation
 * Automatically matches new candidates against all active CV Radars
 * Sends email notifications and stores match records
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { MatchResult, calculateMatch, RadarCriteria, CandidateProfile } from '../../src/lib/matchingEngine';

const db = admin.firestore();

/**
 * Main Cloud Function - triggers when a new jobPost is created
 */
export const matchCvRadars = functions.firestore
  .document('jobPosts/{postId}')
  .onCreate(async (snap, context) => {
    const postId = context.params.postId;
    const jobPost = snap.data() as any;

    // Extract candidate profile
    const candidate = jobPost.candidateProfile;
    if (!candidate || !candidate.name) {
      console.log(`[CV Radar] Skipping ${postId}: No candidate profile`);
      return;
    }

    console.log(`[CV Radar] Processing: ${candidate.name} (${candidate.roleTitle})`);

    try {
      // Fetch all active CV Radars across all clients
      const radarsSnap = await db.collectionGroup('cvRadars')
        .where('isActive', '==', true)
        .get();

      console.log(`[CV Radar] Found ${radarsSnap.docs.length} active radars to check`);

      const matches: Array<{
        clientId: string;
        radarId: string;
        matchResult: MatchResult;
      }> = [];

      // Score candidate against each radar
      for (const radarDoc of radarsSnap.docs) {
        const radar = radarDoc.data() as any;
        const clientId = radarDoc.ref.parent.parent?.id;

        if (!clientId) {
          console.warn(`[CV Radar] Could not determine clientId for radar ${radarDoc.id}`);
          continue;
        }

        try {
          // Convert Firestore data to typed objects
          const criteria: RadarCriteria = {
            roleTitle: radar.criteria.roleTitle,
            seniorityLevel: radar.criteria.seniorityLevel,
            targetLocations: radar.criteria.targetLocations || [],
            requiredSkills: radar.criteria.requiredSkills || {},
            minYearsExperience: radar.criteria.minYearsExperience || 0,
            maxYearsExperience: radar.criteria.maxYearsExperience,
            salaryRange: radar.criteria.salaryRange || { min: 0, max: 1000000, currency: 'USD' },
            additionalCriteria: radar.criteria.additionalCriteria,
          };

          const matchResult = calculateMatch(candidate, criteria, radar.matchThreshold || 75);

          if (matchResult.isMatch) {
            matches.push({ clientId, radarId: radarDoc.id, matchResult });
            console.log(
              `[CV Radar] ✓ Match found: ${candidate.name} (${matchResult.score}%) for "${radar.radarName}"`
            );
          }
        } catch (err) {
          console.error(`[CV Radar] Error scoring against radar ${radarDoc.id}:`, err);
        }
      }

      console.log(`[CV Radar] Total matches: ${matches.length}`);

      // Process each match
      for (const match of matches) {
        await processMatch(postId, candidate, match.clientId, match.radarId, match.matchResult);
      }
    } catch (err) {
      console.error(`[CV Radar] Error in matchCvRadars for ${postId}:`, err);
      // Don't throw - we never want to break jobPosts creation
    }
  });

/**
 * Process a single match:
 * 1. Store match record in Firestore
 * 2. Send email notification
 * 3. Update radar's lastMatchedAt
 */
async function processMatch(
  candidateId: string,
  candidate: CandidateProfile,
  clientId: string,
  radarId: string,
  matchResult: MatchResult
): Promise<void> {
  try {
    // Get radar details (for notification settings and email)
    const radarRef = db.collection('clients').doc(clientId).collection('cvRadars').doc(radarId);
    const radarSnap = await radarRef.get();
    const radar = radarSnap.data() as any;

    if (!radar) {
      console.warn(`[CV Radar] Radar ${radarId} not found`);
      return;
    }

    // Create match record in Firestore
    const matchRef = radarRef.collection('matches').doc();
    await matchRef.set({
      matchId: matchRef.id,
      candidateId,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      matchScore: matchResult.score,
      matchBreakdown: matchResult.breakdown,
      matchReasoning: matchResult.reasoning,
      status: 'new',
      notificationSentAt: admin.firestore.Timestamp.now(),
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    });

    console.log(`[CV Radar] Stored match record: ${matchRef.id}`);

    // Send email notification if enabled
    if (radar.notifyOnMatch && radar.notificationEmail) {
      await sendMatchNotification(radar, candidate, matchResult);
    }

    // Update radar's lastMatchedAt and add to matchedRadarIds
    await radarRef.update({
      lastMatchedAt: admin.firestore.Timestamp.now(),
      matchedRadarIds: admin.firestore.FieldValue.arrayUnion(candidateId),
    });

    console.log(`[CV Radar] Updated radar ${radarId}`);
  } catch (err) {
    console.error(`[CV Radar] Error processing match:`, err);
  }
}

/**
 * Send email notification via Resend API
 */
async function sendMatchNotification(
  radar: any,
  candidate: CandidateProfile,
  matchResult: MatchResult
): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.warn('[CV Radar] RESEND_API_KEY not set, skipping email');
    return;
  }

  try {
    const html = generateMatchEmailHtml(radar, candidate, matchResult);

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CV Radar <matches@wprotalents.com>',
        to: [radar.notificationEmail],
        subject: `🎯 CV Match Found: ${candidate.name} (${matchResult.score}%) for "${radar.radarName}"`,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.warn(`[CV Radar] Resend API error (${response.status}):`, error);
      return;
    }

    console.log(`[CV Radar] Email sent to ${radar.notificationEmail}`);
  } catch (err) {
    console.error('[CV Radar] Error sending email:', err);
    // Don't throw - matching should not fail due to email errors
  }
}

/**
 * Generate HTML email for match notification
 */
function generateMatchEmailHtml(radar: any, candidate: CandidateProfile, matchResult: MatchResult): string {
  const scoreColor = matchResult.score >= 85 ? '#10b981' : matchResult.score >= 75 ? '#f59e0b' : '#ef4444';

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🎯 New CV Match Found</h1>
      </div>

      <!-- Main Content -->
      <div style="background: #f9fafb; padding: 30px 20px; border: 1px solid #e5e7eb; border-top: none;">
        
        <p style="margin-top: 0;">We found a candidate matching your <strong>"${radar.radarName}"</strong> radar.</p>

        <!-- Candidate Card -->
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h2 style="margin-top: 0; color: #0f766e;">${candidate.name}</h2>
          
          <div style="display: flex; align-items: baseline; gap: 10px; margin: 15px 0;">
            <span style="font-size: 14px; color: #6b7280;">Match Score:</span>
            <span style="font-size: 32px; font-weight: bold; color: ${scoreColor};">${matchResult.score}%</span>
          </div>

          <!-- Score Breakdown -->
          <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <h3 style="margin-top: 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Breakdown</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px;">
              <div>
                <span style="color: #6b7280;">Skills:</span>
                <strong style="display: block; color: #0f766e; font-size: 18px;">${matchResult.breakdown.skillsScore}%</strong>
              </div>
              <div>
                <span style="color: #6b7280;">Experience:</span>
                <strong style="display: block; color: #0f766e; font-size: 18px;">${matchResult.breakdown.experienceScore}%</strong>
              </div>
              <div>
                <span style="color: #6b7280;">Location:</span>
                <strong style="display: block; color: #0f766e; font-size: 18px;">${matchResult.breakdown.locationScore === 100 ? '✓' : '✗'}</strong>
              </div>
              <div>
                <span style="color: #6b7280;">Salary:</span>
                <strong style="display: block; color: #0f766e; font-size: 18px;">${matchResult.breakdown.salaryScore}%</strong>
              </div>
            </div>
          </div>

          <!-- Profile Summary -->
          <h4 style="margin-bottom: 10px; color: #1f2937;">Profile Summary</h4>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #4b5563; line-height: 1.8;">
            <li><strong>Role:</strong> ${candidate.roleTitle}</li>
            <li><strong>Location:</strong> ${candidate.locations.join(', ')}</li>
            <li><strong>Experience:</strong> ${candidate.totalYearsExperience} years</li>
            <li><strong>Skills:</strong> ${Object.keys(candidate.skills).join(', ')}</li>
            ${candidate.languages ? `<li><strong>Languages:</strong> ${candidate.languages.join(', ')}</li>` : ''}
          </ul>

          <!-- Match Reasoning -->
          <div style="background: #eff6ff; border-left: 4px solid #0f766e; padding: 12px; margin-top: 15px; border-radius: 4px;">
            <h4 style="margin-top: 0; color: #0f766e; font-size: 13px;">Why This Match?</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
              ${matchResult.reasoning.map((r) => `<li>${r}</li>`).join('')}
            </ul>
          </div>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.APP_URL || 'https://app.wprotalents.com'}/client-portal/radars" 
             style="display: inline-block; background: #0f766e; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
            Review in Dashboard →
          </a>
        </div>

        <p style="color: #6b7280; font-size: 12px;">
          Manage notifications in your CV Radar settings.
        </p>
      </div>

      <!-- Footer -->
      <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
        <p style="margin: 0; font-size: 12px; color: #6b7280;">
          © 2026 WProTalents • CV Radar Matching<br>
          <a href="https://wprotalents.com" style="color: #0f766e; text-decoration: none;">Visit Portal</a>
        </p>
      </div>

    </div>
  `;
}
