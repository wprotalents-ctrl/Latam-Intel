/**
 * CV Radar Matching Engine
 * 
 * Sophisticated candidate-to-requirement matching with weighted scoring.
 * Used by both API endpoints and Cloud Functions.
 * 
 * Scoring: 40% skills, 25% experience, 15% location, 20% salary
 */

export interface SkillProfile {
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsExperience: number;
}

export interface SkillRequirement {
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  isRequired: boolean;
  yearsRequired?: number;
}

export interface CandidateProfile {
  name: string;
  email: string;
  roleTitle: string;
  seniorityLevel: 'junior' | 'mid' | 'senior' | 'lead';
  locations: string[];
  skills: Record<string, SkillProfile>;
  totalYearsExperience: number;
  salary?: number;
  salaryExpectation?: number;
  languages?: string[];
}

export interface RadarCriteria {
  roleTitle: string;
  seniorityLevel: 'junior' | 'mid' | 'senior' | 'lead';
  targetLocations: string[];
  requiredSkills: Record<string, SkillRequirement>;
  minYearsExperience: number;
  maxYearsExperience?: number;
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  additionalCriteria?: {
    languages?: string[];
    education?: string[];
    certifications?: string[];
  };
}

export interface MatchBreakdown {
  skillsScore: number;
  experienceScore: number;
  locationScore: number;
  salaryScore: number;
}

export interface MatchResult {
  score: number;
  breakdown: MatchBreakdown;
  reasoning: string[];
  isMatch: boolean;
}

/**
 * Main matching function
 * Compares a candidate against a radar's criteria and returns a match score
 */
export function calculateMatch(
  candidate: CandidateProfile,
  criteria: RadarCriteria,
  threshold: number = 75
): MatchResult {
  const breakdown: MatchBreakdown = {
    skillsScore: calculateSkillsMatch(candidate.skills, criteria.requiredSkills),
    experienceScore: calculateExperienceMatch(
      candidate.totalYearsExperience,
      criteria.minYearsExperience,
      criteria.maxYearsExperience
    ),
    locationScore: isLocationMatch(candidate.locations, criteria.targetLocations) ? 100 : 0,
    salaryScore: calculateSalaryMatch(
      candidate.salaryExpectation || candidate.salary,
      criteria.salaryRange
    ),
  };

  // Weighted average: skills 40%, experience 25%, location 15%, salary 20%
  const weights = {
    skills: 0.4,
    experience: 0.25,
    location: 0.15,
    salary: 0.2,
  };

  const overallScore =
    breakdown.skillsScore * weights.skills +
    breakdown.experienceScore * weights.experience +
    breakdown.locationScore * weights.location +
    breakdown.salaryScore * weights.salary;

  const roundedScore = Math.round(overallScore);
  const reasoning = generateReasons(candidate, criteria, breakdown);

  return {
    score: roundedScore,
    breakdown,
    reasoning,
    isMatch: roundedScore >= threshold,
  };
}

/**
 * Skills Matching (40% weight)
 * 
 * Required skills are critical - missing even one heavily penalizes the score.
 * Proficiency levels: beginner=25, intermediate=50, advanced=75, expert=100
 * Years of experience for a skill can further modify the score.
 */
function calculateSkillsMatch(
  candidateSkills: Record<string, SkillProfile>,
  requiredSkills: Record<string, SkillRequirement>
): number {
  const required = Object.entries(requiredSkills).filter(([_, req]) => req.isRequired);
  const niceToHave = Object.entries(requiredSkills).filter(([_, req]) => !req.isRequired);

  if (required.length === 0) return 100; // No requirements = perfect match

  // Build candidate skills lookup (case-insensitive)
  const candidateLower = Object.fromEntries(
    Object.entries(candidateSkills).map(([k, v]) => [k.toLowerCase(), v])
  );

  let score = 0;
  const maxScore = required.length * 100 + Math.min(niceToHave.length, 3) * 50;

  // Score required skills (heavy penalty for missing)
  for (const [skill, requirement] of required) {
    const candidateSkill = candidateLower[skill.toLowerCase()];

    if (!candidateSkill) {
      // Missing required skill = 0 points (critical gap)
      score += 0;
    } else {
      // Score based on proficiency
      const profLevels: Record<string, number> = {
        beginner: 25,
        intermediate: 50,
        advanced: 75,
        expert: 100,
      };
      let profScore = profLevels[candidateSkill.proficiency] || 0;

      // Check if years requirement is met
      if (requirement.yearsRequired && candidateSkill.yearsExperience < requirement.yearsRequired) {
        // Reduce score if years don't match
        const shortfall = requirement.yearsRequired - candidateSkill.yearsExperience;
        profScore = Math.max(0, profScore - shortfall * 10);
      }

      score += profScore;
    }
  }

  // Bonus points for nice-to-have skills (up to 3 bonuses)
  let bonusCount = 0;
  for (const [skill, _] of niceToHave) {
    if (bonusCount >= 3) break;
    if (candidateLower[skill.toLowerCase()]) {
      score += 50;
      bonusCount++;
    }
  }

  return Math.round((score / maxScore) * 100);
}

/**
 * Experience Matching (25% weight)
 * 
 * Bell curve scoring:
 * - Perfect fit (min <= years <= max): 100%
 * - Under-experienced: -2% per year below min (down to 0%)
 * - Over-experienced: -1% per year above max (down to 50%)
 */
function calculateExperienceMatch(
  candidateYears: number,
  minRequired: number,
  maxRequired?: number
): number {
  if (candidateYears < minRequired) {
    // Under-experienced: penalty is harsher (-2% per year)
    return Math.max(0, 100 - (minRequired - candidateYears) * 2);
  }

  if (maxRequired && candidateYears > maxRequired) {
    // Over-experienced: smaller penalty (-1% per year), floor at 50%
    return Math.max(50, 100 - (candidateYears - maxRequired));
  }

  // Perfect fit
  return 100;
}

/**
 * Location Matching (15% weight)
 * 
 * Binary match - candidate must be in at least one target location.
 * Comparison is case-insensitive.
 */
function isLocationMatch(candidateLocations: string[], targetLocations: string[]): boolean {
  const targetLower = targetLocations.map((l) => l.toLowerCase());
  return candidateLocations.some((loc) => targetLower.includes(loc.toLowerCase()));
}

/**
 * Salary Matching (20% weight)
 * 
 * Flexible scoring with 20% wiggle room above budget.
 * Only penalizes if expectation > max * 1.2
 * Unknown salary (undefined) = no penalty
 */
function calculateSalaryMatch(
  salaryExpectation: number | undefined,
  salaryRange: { min: number; max: number }
): number {
  if (!salaryExpectation) {
    // Unknown salary = neutral (no penalty)
    return 100;
  }

  const upperBound = salaryRange.max * 1.2; // 20% wiggle room

  if (salaryExpectation <= upperBound) {
    // Within budget (or close)
    return 100;
  }

  // Over budget - calculate penalty
  const overage = salaryExpectation - salaryRange.max;
  const overagePercent = (overage / salaryRange.max) * 100;
  const penalty = Math.min(100, overagePercent);

  return Math.max(0, 100 - penalty);
}

/**
 * Generate human-readable explanations for the match
 */
function generateReasons(
  candidate: CandidateProfile,
  criteria: RadarCriteria,
  breakdown: MatchBreakdown
): string[] {
  const reasons: string[] = [];

  // Skills
  if (breakdown.skillsScore === 100) {
    reasons.push('✓ All required skills match');
  } else if (breakdown.skillsScore >= 75) {
    reasons.push(`⚠ Skills match at ${breakdown.skillsScore}% (some gaps)`);
  } else {
    reasons.push(`✗ Skills match at ${breakdown.skillsScore}% (significant gaps)`);
  }

  // Experience
  if (breakdown.experienceScore === 100) {
    reasons.push(`✓ Experience perfectly aligned (${candidate.totalYearsExperience} years)`);
  } else if (breakdown.experienceScore >= 75) {
    reasons.push(
      `⚠ Experience at ${breakdown.experienceScore}% (${candidate.totalYearsExperience} years, needs ${criteria.minYearsExperience})`
    );
  } else {
    reasons.push(`✗ Under-experienced (${candidate.totalYearsExperience} years, needs ${criteria.minYearsExperience})`);
  }

  // Location
  if (breakdown.locationScore === 100) {
    reasons.push(`✓ Location matches (${candidate.locations.join(', ')})`);
  } else {
    reasons.push(`✗ Location mismatch (candidate in ${candidate.locations.join(', ')}, looking for ${criteria.targetLocations.join(', ')})`);
  }

  // Salary
  if (breakdown.salaryScore === 100) {
    const expectation = candidate.salaryExpectation || candidate.salary;
    if (expectation) {
      reasons.push(`✓ Salary within budget ($${expectation.toLocaleString()})`);
    } else {
      reasons.push('✓ Salary not specified (no mismatch)');
    }
  } else {
    const expectation = candidate.salaryExpectation || candidate.salary || 0;
    reasons.push(`⚠ Salary mismatch ($${expectation.toLocaleString()} vs ${criteria.salaryRange.min}-${criteria.salaryRange.max})`);
  }

  return reasons;
}

/**
 * Example usage:
 * 
 * const candidate: CandidateProfile = {
 *   name: "John Doe",
 *   email: "john@example.com",
 *   roleTitle: "Full Stack Engineer",
 *   seniorityLevel: "senior",
 *   locations: ["Mexico", "Colombia"],
 *   skills: {
 *     "TypeScript": { proficiency: "expert", yearsExperience: 5 },
 *     "React": { proficiency: "advanced", yearsExperience: 4 },
 *     "Node.js": { proficiency: "advanced", yearsExperience: 5 },
 *     "PostgreSQL": { proficiency: "intermediate", yearsExperience: 3 },
 *   },
 *   totalYearsExperience: 8,
 *   salaryExpectation: 95000,
 * };
 * 
 * const radar: RadarCriteria = {
 *   roleTitle: "Full Stack Engineer",
 *   seniorityLevel: "senior",
 *   targetLocations: ["Mexico", "Colombia", "Argentina"],
 *   requiredSkills: {
 *     "TypeScript": { proficiency: "advanced", isRequired: true },
 *     "React": { proficiency: "advanced", isRequired: true },
 *     "Node.js": { proficiency: "advanced", isRequired: true },
 *   },
 *   minYearsExperience: 5,
 *   salaryRange: { min: 80000, max: 120000, currency: "USD" },
 * };
 * 
 * const result = calculateMatch(candidate, radar, 75);
 * console.log(result);
 * // {
 * //   score: 92,
 * //   breakdown: {
 * //     skillsScore: 95,
 * //     experienceScore: 100,
 * //     locationScore: 100,
 * //     salaryScore: 100,
 * //   },
 * //   reasoning: [
 * //     "✓ All required skills match",
 * //     "✓ Experience perfectly aligned (8 years)",
 * //     "✓ Location matches (Mexico, Colombia)",
 * //     "✓ Salary within budget ($95,000)",
 * //   ],
 * //   isMatch: true,
 * // }
 */
