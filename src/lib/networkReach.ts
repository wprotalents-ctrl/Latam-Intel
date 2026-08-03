export interface NetworkReachInput {
  role: string;
  seniority: 'junior' | 'mid' | 'senior';
  totalConnections?: number;
}

export interface NetworkReach {
  firstDegree: number;
  secondDegree: number;
  thirdDegree: number;
  impressions: number;
  applicantsLow: number;
  applicantsHigh: number;
}

const ROLE_FACTOR: Record<string, number> = {
  backend: 0.08,
  frontend: 0.08,
  fullstack: 0.08,
  devops: 0.08,
  ai_ml: 0.05,
  llm: 0.05,
  data: 0.05,
  data_eng: 0.05,
  product: 0.06,
  eng_manager: 0.06,
};

const SENIORITY_FACTOR: Record<'junior' | 'mid' | 'senior', number> = {
  junior: 1.2,
  mid: 1.0,
  senior: 0.7,
};

function round(n: number): number {
  return Math.round(n);
}

export function estimateNetworkReach({
  role,
  seniority,
  totalConnections = 23000,
}: NetworkReachInput): NetworkReach {
  const roleFactor = ROLE_FACTOR[role] ?? 0.07;
  const seniorityFactor = SENIORITY_FACTOR[seniority];

  const firstDegree = round(totalConnections * roleFactor * seniorityFactor);
  const secondDegree = round(firstDegree * 8);
  const thirdDegree = round(firstDegree * 25);
  const impressions = round(firstDegree * 0.6 + secondDegree * 0.2);
  const applicants = impressions * 0.01;
  const applicantsLow = round(applicants * 0.8);
  const applicantsHigh = round(applicants * 1.2);

  return {
    firstDegree,
    secondDegree,
    thirdDegree,
    impressions,
    applicantsLow,
    applicantsHigh,
  };
}
