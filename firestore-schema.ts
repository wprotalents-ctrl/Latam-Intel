/**
 * CV Radar Feature - Firestore Data Models
 * 
 * This file defines the TypeScript interfaces for the CV Radar feature.
 * These collections enable clients to register talent requirements and
 * receive automated notifications when matching candidates are found.
 */

import { Timestamp } from 'firebase-admin/firestore';

/**
 * CLIENT CV RADAR PROFILE
 * Location: /clients/{clientId}/cvRadars/{radarId}
 * 
 * Stores a client's talent search profile/requirements.
 * When new candidates match these criteria, the client is notified.
 */
export interface CVRadar {
  // Metadata
  id: string;                           // Firestore document ID
  clientId: string;                     // Reference to client (auth.uid)
  radarName: string;                    // User-friendly name (e.g., "Senior Full Stack - Mexico")
  
  // Talent Criteria
  criteria: {
    // Core role information
    roleTitle: string;                  // e.g., "Full Stack Engineer", "Product Manager"
    seniorityLevel: 'junior' | 'mid' | 'senior' | 'lead';
    
    // Location preferences
    targetLocations: string[];          // e.g., ["Mexico", "Colombia", "Argentina"]
    
    // Skills requirements
    requiredSkills: {
      [skillName: string]: {
        proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
        isRequired: boolean;            // true = must have; false = nice to have
        yearsRequired?: number;         // Min years with this skill
      }
    };
    
    // Experience range
    minYearsExperience: number;
    maxYearsExperience?: number;
    
    // Budget
    salaryRange: {
      min: number;                      // USD/year
      max: number;                      // USD/year
      currency: 'USD' | 'MXN' | 'COP' | 'ARS' | 'BRL';
    };
    
    // Nice-to-haves
    additionalCriteria?: {
      languages?: string[];             // e.g., ["English", "Spanish", "Portuguese"]
      education?: string[];             // e.g., ["Bachelor's in CS", "Bootcamp"]
      certifications?: string[];        // e.g., ["AWS Solutions Architect", "Kubernetes"]
    };
  };

  // Status
  isActive: boolean;                    // Can toggle on/off without deleting
  notificationEmail: string;            // Where to send match alerts
  notifyOnMatch: boolean;               // Enable/disable notifications
  matchThreshold: number;               // 0-100, minimum score to notify (default 75)
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastMatchedAt?: Timestamp;
}

/**
 * CV RADAR MATCH RECORD (Subcollection)
 * Location: /clients/{clientId}/cvRadars/{radarId}/matches/{matchId}
 * 
 * Records each time a candidate matches a radar.
 * Audit trail - records are append-only, never deleted.
 */
export interface CVRadarMatch {
  // Match Identification
  matchId: string;                      // Document ID
  radarId: string;                      // Reference to parent radar
  candidateId: string;                  // Reference to jobPost document
  
  // Candidate Info
  candidateName: string;
  candidateEmail: string;
  
  // Match Scoring
  matchScore: number;                   // 0-100 overall score
  matchBreakdown: {
    skillsScore: number;                // 0-100 (40% weight)
    experienceScore: number;            // 0-100 (25% weight)
    locationScore: number;              // 0 or 100 (15% weight)
    salaryScore: number;                // 0-100 (20% weight)
  };
  
  // Match Reasoning
  matchReasoning?: string[];            // Human-readable explanations
  
  // Status Tracking
  status: 'new' | 'viewed' | 'contacted' | 'rejected' | 'hired';
  clientNotes?: string;                 // Client's notes about this match
  
  // Timeline
  notificationSentAt: Timestamp;        // When email was sent
  clientActionAt?: Timestamp;           // When client took action (viewed, contacted, etc.)
  
  // Audit
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * ENHANCED JOB POSTS (Candidate Profiles)
 * Location: /jobPosts/{postId}
 * 
 * When candidates are added, their profile is tagged with matched radar IDs.
 * CV Radar matching is triggered on jobPost creation.
 */
export interface JobPostWithCandidateProfile {
  // Existing fields (preserved)
  role: string;
  seniority: 'junior' | 'mid' | 'senior' | 'lead';
  country: string;
  salary?: number;
  description?: string;
  planType: 'free' | 'promoted';
  companyEmail?: string;
  status: 'active' | 'archived' | 'filled';
  createdAt: Timestamp;
  
  // NEW: Candidate Profile (for CV Radar matching)
  candidateProfile?: {
    name: string;
    email: string;
    roleTitle: string;                  // e.g., "Full Stack Engineer"
    seniorityLevel: 'junior' | 'mid' | 'senior' | 'lead';
    locations: string[];                // e.g., ["Mexico", "Colombia"]
    
    // Skills with proficiency levels
    skills: {
      [skillName: string]: {
        proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
        yearsExperience: number;
      }
    };
    
    // Experience summary
    totalYearsExperience: number;
    
    // Salary expectations
    salary?: number;
    salaryExpectation?: number;
    
    // Languages and education
    languages?: string[];               // e.g., ["English", "Spanish", "Portuguese"]
    education?: string[];
    certifications?: string[];
  };
  
  // CV Radar tracking
  matchedRadarIds?: string[];           // Which radars this candidate matched
}

/**
 * SCORING ALGORITHM RESULT
 * Returned by matching engine, not stored directly
 */
export interface MatchResult {
  score: number;                        // 0-100 overall match score
  breakdown: {
    skillsScore: number;
    experienceScore: number;
    locationScore: number;
    salaryScore: number;
  };
  reasoning: string[];                  // Human-readable explanations
  isMatch: boolean;                     // score >= threshold?
}

/**
 * FIRESTORE COLLECTION PATHS SUMMARY
 * 
 * /clients/{clientId}/cvRadars/{radarId}
 *   - One document per radar
 *   - Stores talent requirements and notification settings
 *   - Subcollection: /matches/{matchId} (audit trail of all matches)
 * 
 * /jobPosts/{postId}
 *   - Existing collection, enhanced with candidateProfile field
 *   - Triggers CV Radar matching on creation
 *   - matchedRadarIds array tracks which radars matched this candidate
 */

/**
 * FIRESTORE RULES REQUIRED
 * 
 * ✓ Clients can only read/write their own cvRadars
 * ✓ Matches subcollection: append-only (never delete)
 * ✓ Cloud Function has service account access
 * ✓ jobPosts: authenticated create, public read
 */

/**
 * CLOUD FUNCTION TRIGGER
 * 
 * Event: firestore.onDocumentCreate('jobPosts/{postId}')
 * Action:
 *   1. Fetch candidate profile from jobPost
 *   2. Fetch all active cvRadars from Firestore
 *   3. Score candidate against each radar using matchingEngine
 *   4. For matches (score >= threshold):
 *      - Create match record in Firestore
 *      - Send email notification via Resend
 *      - Update radar's lastMatchedAt timestamp
 *   5. Add candidateId to radar's matchedRadarIds array
 */
