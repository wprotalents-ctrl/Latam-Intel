// ─── LATAM Intelligence Engine ───────────────────────────────────────────────
// Pure computation — no API calls. Based on WProTalents search data + market
// benchmarks (Glassdoor LATAM, LinkedIn Salary, direct candidate conversations).
// All figures in USD/year unless noted. Updated Q1 2026.

// ─── Types ───────────────────────────────────────────────────────────────────

export type RoleKey = 'ai_ml' | 'llm' | 'data' | 'backend' | 'frontend' | 'fullstack' | 'devops' | 'product' | 'data_eng' | 'eng_manager';
export type CountryCode = 'BR' | 'MX' | 'CO' | 'AR' | 'CL';
export type EnglishLevel = 'basic' | 'conversational' | 'fluent' | 'bilingual';
export type SeniorityKey = 'junior' | 'mid' | 'senior' | 'staff';

export interface CandidateInput {
  role: RoleKey;
  country: CountryCode;
  yearsExp: number;
  englishLevel: EnglishLevel;
  currentSalary?: number;      // USD/year, optional
  skills: string[];
  hasRemoteExp: boolean;
  hasPortfolio: boolean;
}

export interface MarketValueResult {
  marketMin: number;
  marketMax: number;
  marketMid: number;
  remoteMid: number;
  percentile: number;          // 0–100
  underpaidBy: number | null;  // null if currentSalary not provided
  remoteUplift: number;        // % gain going remote
  seniorityLabel: string;
}

export interface SalaryGapResult {
  localSalary: number;
  remoteSalary: number;
  gap: number;
  gapPercent: number;
  topPayingCountry: string;
  topPayingSalary: number;
  topPayingFlag: string;
}

export interface BestMarket {
  country: CountryCode;
  flag: string;
  name: string;
  demand: 'High' | 'Medium' | 'Low';
  competition: 'High' | 'Medium' | 'Low';
  opportunity: 'Hot 🔥' | 'Strong ✅' | 'Saturated ⚠️';
  verdict: string;
  avgRemote: number;
}

export interface SkillROI {
  skill: string;
  salaryBoost: number;
  timeToLearn: string;
  demand: 'Very High' | 'High' | 'Medium';
  alreadyHas: boolean;
}

export interface RemoteReadinessResult {
  score: number;        // 0–100
  ready: boolean;       // score >= 70
  label: 'Ready ✅' | 'Almost There 🟡' | 'Not Yet 🔴';
  strengths: string[];
  gaps: string[];
  topAction: string;
}

// ─── Base Data ────────────────────────────────────────────────────────────────

// Mid-level (3–5yr), local pay, USD/year
const BASE_SALARY: Record<RoleKey, Record<CountryCode, number>> = {
  ai_ml:       { BR: 12000, MX: 10500, CO: 9000,  AR: 8000,  CL: 10500 },
  llm:         { BR: 16000, MX: 14000, CO: 12500, AR: 11000, CL: 14000 },
  data:        { BR: 10500, MX: 9500,  CO: 8500,  AR: 7500,  CL: 9500  },
  backend:     { BR: 9500,  MX: 8500,  CO: 7500,  AR: 6500,  CL: 8500  },
  frontend:    { BR: 8000,  MX: 7500,  CO: 6500,  AR: 5500,  CL: 7500  },
  fullstack:   { BR: 9500,  MX: 8500,  CO: 7500,  AR: 7000,  CL: 8500  },
  devops:      { BR: 11000, MX: 10000, CO: 9000,  AR: 8000,  CL: 10000 },
  product:     { BR: 9500,  MX: 9000,  CO: 8000,  AR: 7000,  CL: 9000  },
  data_eng:    { BR: 11000, MX: 10000, CO: 9000,  AR: 8000,  CL: 10000 },
  eng_manager: { BR: 18000, MX: 16000, CO: 14000, AR: 13000, CL: 16000 },
};

// Seniority multipliers on base salary
const SENIORITY_MULT: Record<SeniorityKey, number> = {
  junior: 0.55,
  mid:    1.00,
  senior: 1.50,
  staff:  2.10,
};

// Local-to-remote multiplier (accounts for currency devaluation + remote premium)
const REMOTE_MULT: Record<CountryCode, number> = {
  BR: 1.65,
  MX: 1.55,
  CO: 1.70,
  AR: 1.80,  // ARS deeply undervalued → huge remote uplift
  CL: 1.45,  // CLP more stable → smaller gap
};

// English level multiplier on remote salary
const ENGLISH_MULT: Record<EnglishLevel, number> = {
  basic:         1.00,
  conversational: 1.12,
  fluent:        1.28,
  bilingual:     1.40,
};

// Salary range: ±% around mid
const RANGE_SPREAD = 0.30;

// Skills ROI table — boost is additional USD/year at mid level
const SKILLS_ROI_TABLE: { skill: string; boost: number; time: string; demand: 'Very High' | 'High' | 'Medium'; roles: RoleKey[] }[] = [
  { skill: 'LLM / Agentic AI',      boost: 22000, time: '3–4 months', demand: 'Very High', roles: ['ai_ml', 'llm', 'backend', 'fullstack', 'data', 'data_eng'] },
  { skill: 'AWS / Cloud (Certified)',boost: 13000, time: '2–3 months', demand: 'Very High', roles: ['backend', 'fullstack', 'devops', 'data_eng'] },
  { skill: 'Go (Golang)',            boost: 12000, time: '3–4 months', demand: 'Very High', roles: ['backend', 'devops', 'fullstack'] },
  { skill: 'Kubernetes / Helm',      boost: 10000, time: '6–8 weeks',  demand: 'High',      roles: ['devops', 'backend', 'data_eng'] },
  { skill: 'PyTorch / ML Libs',      boost: 16000, time: '4–6 months', demand: 'Very High', roles: ['ai_ml', 'llm', 'data'] },
  { skill: 'System Design',          boost: 11000, time: '6–8 weeks',  demand: 'High',      roles: ['backend', 'fullstack', 'ai_ml', 'llm', 'eng_manager'] },
  { skill: 'React Native',           boost: 8500,  time: '6–8 weeks',  demand: 'High',      roles: ['frontend', 'fullstack'] },
  { skill: 'TypeScript (advanced)',  boost: 7000,  time: '3–4 weeks',  demand: 'High',      roles: ['frontend', 'fullstack', 'backend'] },
  { skill: 'Rust',                   boost: 14000, time: '5–6 months', demand: 'High',      roles: ['backend', 'devops'] },
  { skill: 'dbt / Modern Data Stack',boost: 9000,  time: '4–6 weeks',  demand: 'High',      roles: ['data', 'data_eng'] },
  { skill: 'English → Fluent',       boost: 17000, time: '6–12 months',demand: 'Very High', roles: ['ai_ml','llm','data','backend','frontend','fullstack','devops','product','data_eng','eng_manager'] },
  { skill: 'Prompt Engineering',     boost: 8000,  time: '2–3 weeks',  demand: 'High',      roles: ['product', 'data', 'fullstack', 'backend'] },
];

// Market demand/competition score by country per role category
// demand: 1=Low, 2=Med, 3=High — competition: 1=Low, 2=Med, 3=High
const MARKET_MATRIX: Record<RoleKey, Record<CountryCode, { demand: number; competition: number; verdict: string }>> = {
  ai_ml:       { BR: { demand: 3, competition: 3, verdict: 'Huge market, fierce competition. Strong profile needed.' }, MX: { demand: 3, competition: 2, verdict: 'High demand, less saturated. Your best bet right now.' }, CO: { demand: 3, competition: 1, verdict: 'Fastest-growing AI hub. Low competition — move fast.' }, AR: { demand: 2, competition: 2, verdict: 'Solid market. USD remote roles are the priority here.' }, CL: { demand: 2, competition: 1, verdict: 'Smaller pool, less competition. Good entry point.' } },
  llm:         { BR: { demand: 3, competition: 2, verdict: 'Strong demand. Most LLM roles here are remote-first.' }, MX: { demand: 3, competition: 1, verdict: 'Very few qualified LLM engineers. Premium rates available.' }, CO: { demand: 2, competition: 1, verdict: 'Emerging demand. First-mover advantage is real.' }, AR: { demand: 2, competition: 2, verdict: 'Good market but salary expectations vary widely.' }, CL: { demand: 2, competition: 1, verdict: 'Small market, but quality companies hiring here.' } },
  data:        { BR: { demand: 3, competition: 3, verdict: 'Saturated at junior/mid. Senior data roles still strong.' }, MX: { demand: 3, competition: 2, verdict: 'Growing fast. US companies specifically target MX data talent.' }, CO: { demand: 2, competition: 2, verdict: 'Balanced market. Differentiate with ML or cloud skills.' }, AR: { demand: 2, competition: 3, verdict: 'High competition. Pivot to ML/AI to stand out.' }, CL: { demand: 2, competition: 1, verdict: 'Underserved market. Good opportunity for data professionals.' } },
  backend:     { BR: { demand: 3, competition: 3, verdict: 'Highly competitive. Specialise in a niche stack to break through.' }, MX: { demand: 3, competition: 2, verdict: 'Strong hiring from US firms. Node/Go/Python in high demand.' }, CO: { demand: 3, competition: 2, verdict: 'Rising fast. Colombian devs building strong reputation globally.' }, AR: { demand: 2, competition: 3, verdict: 'Saturated locally. Target US remote explicitly.' }, CL: { demand: 2, competition: 1, verdict: 'Good demand, less competition than Brazil or Argentina.' } },
  frontend:    { BR: { demand: 2, competition: 3, verdict: 'Competitive market. React + TypeScript expertise is table stakes.' }, MX: { demand: 3, competition: 2, verdict: 'Strong US demand for MX frontend devs. Next.js/React preferred.' }, CO: { demand: 2, competition: 2, verdict: 'Stable demand. Add mobile (React Native) to differentiate.' }, AR: { demand: 2, competition: 3, verdict: 'Saturated. Consider fullstack or mobile specialisation.' }, CL: { demand: 2, competition: 1, verdict: 'Less competition. Good for senior frontend profiles.' } },
  fullstack:   { BR: { demand: 3, competition: 3, verdict: 'Very competitive. Differentiate with a strong portfolio and niche.' }, MX: { demand: 3, competition: 2, verdict: 'High demand from US startups. Next.js + AWS is the winning stack.' }, CO: { demand: 3, competition: 1, verdict: 'Hot market. Colombian devs are underrepresented — big advantage.' }, AR: { demand: 2, competition: 3, verdict: 'Competitive but strong in USD remote. Go fullstack with cloud.' }, CL: { demand: 2, competition: 2, verdict: 'Balanced. Seniority and English level are the differentiators.' } },
  devops:      { BR: { demand: 3, competition: 2, verdict: 'Good demand, less saturated than dev roles. SRE especially valued.' }, MX: { demand: 3, competition: 1, verdict: 'Very few qualified DevOps/SRE professionals. Premium pricing.' }, CO: { demand: 2, competition: 1, verdict: 'Huge opportunity. Almost no local competition at senior level.' }, AR: { demand: 2, competition: 2, verdict: 'Moderate market. Focus on platform engineering to command premium.' }, CL: { demand: 2, competition: 1, verdict: 'Undersupplied market. Strong salaries for experienced DevOps.' } },
  product:     { BR: { demand: 2, competition: 3, verdict: 'Competitive. English fluency and AI product experience are key.' }, MX: { demand: 3, competition: 2, verdict: 'Growing fast. US companies prefer MX for time zone alignment.' }, CO: { demand: 2, competition: 2, verdict: 'Moderate demand. AI/ML product experience is a major differentiator.' }, AR: { demand: 2, competition: 2, verdict: 'Good market for senior PMs. English + remote experience critical.' }, CL: { demand: 1, competition: 1, verdict: 'Small market. Better to target US remote from the start.' } },
  data_eng:    { BR: { demand: 3, competition: 2, verdict: 'Strong demand. dbt + Spark + cloud stack commands premium rates.' }, MX: { demand: 3, competition: 1, verdict: 'High demand, very few qualified people. Excellent opportunity.' }, CO: { demand: 2, competition: 1, verdict: 'Underserved market. Data engineers in high demand from US firms.' }, AR: { demand: 2, competition: 2, verdict: 'Moderate. Differentiate with modern data stack (dbt, Airbyte).' }, CL: { demand: 2, competition: 1, verdict: 'Niche but premium. Less competition than any other LATAM country.' } },
  eng_manager: { BR: { demand: 3, competition: 2, verdict: 'Good market. English fluency + remote team experience are non-negotiable.' }, MX: { demand: 3, competition: 1, verdict: 'Very few qualified EMs. US companies paying top dollar for MX time zone.' }, CO: { demand: 2, competition: 1, verdict: 'Emerging. Senior ICs transitioning to EM have big advantage here.' }, AR: { demand: 2, competition: 2, verdict: 'Solid but competitive. Distributed team track record is key.' }, CL: { demand: 1, competition: 1, verdict: 'Small market. Targeting US remote directly is the better path.' } },
};

const FLAG: Record<CountryCode, string> = { BR: '🇧🇷', MX: '🇲🇽', CO: '🇨🇴', AR: '🇦🇷', CL: '🇨🇱' };
const COUNTRY_NAME: Record<CountryCode, string> = { BR: 'Brazil', MX: 'Mexico', CO: 'Colombia', AR: 'Argentina', CL: 'Chile' };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSeniority(yearsExp: number): SeniorityKey {
  if (yearsExp <= 2) return 'junior';
  if (yearsExp <= 5) return 'mid';
  if (yearsExp <= 8) return 'senior';
  return 'staff';
}

function getSeniorityLabel(key: SeniorityKey): string {
  return { junior: 'Junior', mid: 'Mid-level', senior: 'Senior', staff: 'Staff / Lead' }[key];
}

function round(n: number, to = 500): number {
  return Math.round(n / to) * to;
}

// ─── Core Functions ───────────────────────────────────────────────────────────

export function computeMarketValue(input: CandidateInput): MarketValueResult {
  const seniority = getSeniority(input.yearsExp);
  const base = BASE_SALARY[input.role][input.country];
  const local = base * SENIORITY_MULT[seniority];
  const localMin = round(local * (1 - RANGE_SPREAD));
  const localMax = round(local * (1 + RANGE_SPREAD));
  const localMid = round(local);

  const remoteMid = round(local * REMOTE_MULT[input.country] * ENGLISH_MULT[input.englishLevel]);
  const remoteUplift = Math.round(((remoteMid - localMid) / localMid) * 100);

  let percentile = 50;
  let underpaidBy: number | null = null;

  if (input.currentSalary != null) {
    const cs = input.currentSalary;
    if (cs < localMin * 0.75) percentile = 10;
    else if (cs < localMin) percentile = 20;
    else if (cs < localMid) percentile = 35;
    else if (cs < localMax) percentile = 60;
    else if (cs < localMax * 1.25) percentile = 75;
    else percentile = 90;

    underpaidBy = cs < localMid ? round(localMid - cs, 100) : null;
  }

  return {
    marketMin: localMin,
    marketMax: localMax,
    marketMid: localMid,
    remoteMid,
    percentile,
    underpaidBy,
    remoteUplift,
    seniorityLabel: getSeniorityLabel(seniority),
  };
}

export function computeSalaryGap(input: CandidateInput): SalaryGapResult {
  const mv = computeMarketValue(input);
  const localSalary = mv.marketMid;
  const remoteSalary = mv.remoteMid;
  const gap = remoteSalary - localSalary;
  const gapPercent = Math.round((gap / localSalary) * 100);

  // Find top-paying country for this role at user's seniority
  const seniority = getSeniority(input.yearsExp);
  let topCountry: CountryCode = 'BR';
  let topSalary = 0;
  (Object.keys(BASE_SALARY[input.role]) as CountryCode[]).forEach(c => {
    const s = round(BASE_SALARY[input.role][c] * SENIORITY_MULT[seniority] * REMOTE_MULT[c] * ENGLISH_MULT[input.englishLevel]);
    if (s > topSalary) { topSalary = s; topCountry = c; }
  });

  return {
    localSalary,
    remoteSalary,
    gap,
    gapPercent,
    topPayingCountry: COUNTRY_NAME[topCountry],
    topPayingSalary: topSalary,
    topPayingFlag: FLAG[topCountry],
  };
}

export function getBestMarkets(input: CandidateInput): BestMarket[] {
  const seniority = getSeniority(input.yearsExp);
  const countries: CountryCode[] = ['BR', 'MX', 'CO', 'AR', 'CL'];

  return countries
    .map(c => {
      const matrix = MARKET_MATRIX[input.role][c];
      const net = matrix.demand - matrix.competition; // -2 to +2
      const opportunity: BestMarket['opportunity'] =
        net >= 2 ? 'Hot 🔥' : net >= 0 ? 'Strong ✅' : 'Saturated ⚠️';
      const demand: BestMarket['demand'] = matrix.demand === 3 ? 'High' : matrix.demand === 2 ? 'Medium' : 'Low';
      const competition: BestMarket['competition'] = matrix.competition === 3 ? 'High' : matrix.competition === 2 ? 'Medium' : 'Low';
      const avgRemote = round(BASE_SALARY[input.role][c] * SENIORITY_MULT[seniority] * REMOTE_MULT[c] * ENGLISH_MULT[input.englishLevel]);
      return { country: c, flag: FLAG[c], name: COUNTRY_NAME[c], demand, competition, opportunity, verdict: matrix.verdict, avgRemote };
    })
    .sort((a, b) => {
      const order = { 'Hot 🔥': 0, 'Strong ✅': 1, 'Saturated ⚠️': 2 };
      return order[a.opportunity] - order[b.opportunity];
    });
}

export function getSkillsROI(input: CandidateInput): SkillROI[] {
  const seniority = getSeniority(input.yearsExp);
  const mult = SENIORITY_MULT[seniority];

  // Filter to role-relevant skills, exclude ones user already has
  const relevant = SKILLS_ROI_TABLE
    .filter(s => s.roles.includes(input.role))
    .map(s => ({
      skill: s.skill,
      salaryBoost: round(s.boost * mult, 500),
      timeToLearn: s.time,
      demand: s.demand,
      alreadyHas: input.skills.some(us =>
        us.toLowerCase().includes(s.skill.toLowerCase().split(' ')[0].toLowerCase())
      ),
    }))
    .filter(s => !s.alreadyHas)
    .sort((a, b) => b.salaryBoost - a.salaryBoost)
    .slice(0, 4);

  return relevant;
}

export function getRemoteReadiness(input: CandidateInput): RemoteReadinessResult {
  let score = 0;
  const strengths: string[] = [];
  const gaps: string[] = [];

  // English (0–40 pts)
  const engScore = { basic: 5, conversational: 20, fluent: 35, bilingual: 40 }[input.englishLevel];
  score += engScore;
  if (input.englishLevel === 'fluent' || input.englishLevel === 'bilingual') {
    strengths.push(`${input.englishLevel === 'bilingual' ? 'Bilingual' : 'Fluent'} English — top 20% of LATAM candidates`);
  } else if (input.englishLevel === 'conversational') {
    gaps.push('English: reach fluency to unlock +28% remote salary premium');
  } else {
    gaps.push('English: biggest single blocker for US/EU remote roles');
  }

  // Experience (0–25 pts)
  const seniority = getSeniority(input.yearsExp);
  const expScore = { junior: 8, mid: 16, senior: 22, staff: 25 }[seniority];
  score += expScore;
  if (seniority === 'senior' || seniority === 'staff') {
    strengths.push(`${input.yearsExp}+ years experience — above the threshold most US/EU companies require`);
  } else if (seniority === 'junior') {
    gaps.push('Experience: most US/EU remote roles require 3+ years — focus on local remote first');
  }

  // Remote experience (0–20 pts)
  if (input.hasRemoteExp) {
    score += 20;
    strengths.push('Prior remote experience — signals async communication competency');
  } else {
    score += 5;
    gaps.push('No remote experience — highlight async projects or open source contributions');
  }

  // Portfolio / GitHub (0–15 pts)
  if (input.hasPortfolio) {
    score += 15;
    strengths.push('Portfolio / GitHub — proves skills beyond a resume');
  } else {
    gaps.push('No portfolio — build 1–2 public projects to validate your skills to global recruiters');
  }

  score = Math.min(100, score);
  const ready = score >= 70;
  const label: RemoteReadinessResult['label'] =
    score >= 70 ? 'Ready ✅' : score >= 50 ? 'Almost There 🟡' : 'Not Yet 🔴';

  const topAction = gaps[0]
    ? gaps[0].split(':')[0] + ': ' + (gaps[0].split(':')[1] || '').trim()
    : 'Apply to US/EU remote roles now — your profile is ready.';

  return { score, ready, label, strengths, gaps, topAction };
}
