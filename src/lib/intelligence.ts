// ─── LATAM Intelligence Engine ───────────────────────────────────────────────
// Pure computation — no API calls. Based on WProTalents search data + market
// benchmarks (Glassdoor LATAM, LinkedIn Salary, direct candidate conversations).
// All figures in USD/year. Updated Q1 2026.

export type RoleKey = 'ai_ml' | 'llm' | 'data' | 'backend' | 'frontend' | 'fullstack' | 'devops' | 'product' | 'data_eng' | 'eng_manager';
export type CountryCode = 'BR' | 'MX' | 'CO' | 'AR' | 'CL';
export type EnglishLevel = 'basic' | 'conversational' | 'fluent' | 'bilingual';
export type SeniorityKey = 'junior' | 'mid' | 'senior' | 'staff';
export type Lang = 'EN' | 'ES' | 'PT';

export interface CandidateInput {
  role: RoleKey;
  country: CountryCode;
  yearsExp: number;
  englishLevel: EnglishLevel;
  currentSalary?: number;
  skills: string[];
  hasRemoteExp: boolean;
  hasPortfolio: boolean;
}

export interface MarketValueResult {
  marketMin: number;
  marketMax: number;
  marketMid: number;
  remoteMid: number;
  percentile: number;
  underpaidBy: number | null;
  remoteUplift: number;
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
  opportunity: string;
  verdict: string;
  avgRemote: number;
  opportunityKey: 'hot' | 'strong' | 'saturated';
}

export interface SkillROI {
  skill: string;
  salaryBoost: number;
  timeToLearn: string;
  demand: 'Very High' | 'High' | 'Medium';
  alreadyHas: boolean;
}

export interface RemoteReadinessResult {
  score: number;
  ready: boolean;
  label: string;
  strengths: string[];
  gaps: string[];
  topAction: string;
}

// ─── Base salary data ─────────────────────────────────────────────────────────
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

const SENIORITY_MULT: Record<SeniorityKey, number> = {
  junior: 0.55, mid: 1.00, senior: 1.50, staff: 2.10,
};

const REMOTE_MULT: Record<CountryCode, number> = {
  BR: 1.65, MX: 1.55, CO: 1.70, AR: 1.80, CL: 1.45,
};

const ENGLISH_MULT: Record<EnglishLevel, number> = {
  basic: 1.00, conversational: 1.12, fluent: 1.28, bilingual: 1.40,
};

const RANGE_SPREAD = 0.30;

// ─── Translations ─────────────────────────────────────────────────────────────

const SENIORITY_LABELS: Record<SeniorityKey, Record<Lang, string>> = {
  junior: { EN: 'Junior',    ES: 'Junior',       PT: 'Júnior'   },
  mid:    { EN: 'Mid-level', ES: 'Nivel Medio',  PT: 'Pleno'    },
  senior: { EN: 'Senior',    ES: 'Senior',       PT: 'Sênior'   },
  staff:  { EN: 'Staff / Lead', ES: 'Lead / Staff', PT: 'Lead / Staff' },
};

const FLAG: Record<CountryCode, string> = { BR: '🇧🇷', MX: '🇲🇽', CO: '🇨🇴', AR: '🇦🇷', CL: '🇨🇱' };

const COUNTRY_NAME: Record<CountryCode, Record<Lang, string>> = {
  BR: { EN: 'Brazil',    ES: 'Brasil',    PT: 'Brasil'    },
  MX: { EN: 'Mexico',    ES: 'México',    PT: 'México'    },
  CO: { EN: 'Colombia',  ES: 'Colombia',  PT: 'Colômbia'  },
  AR: { EN: 'Argentina', ES: 'Argentina', PT: 'Argentina' },
  CL: { EN: 'Chile',     ES: 'Chile',     PT: 'Chile'     },
};

// Market verdict templates — generated from demand/competition scores
function getVerdict(demand: number, competition: number, country: CountryCode, role: RoleKey, lang: Lang): string {
  const net = demand - competition;
  const cName = COUNTRY_NAME[country][lang];

  const verdicts: Record<Lang, Record<string, string>> = {
    EN: {
      '2':  `${cName}: high demand, very low competition — move fast, this window won't last.`,
      '1':  `${cName}: solid demand with moderate competition — a strong profile wins here.`,
      '0':  `${cName}: balanced market. Differentiate with niche skills or seniority to stand out.`,
      '-1': `${cName}: competitive locally. Target USD remote roles directly for best results.`,
      '-2': `${cName}: saturated for this role. Upskill or pivot to an adjacent specialisation.`,
    },
    ES: {
      '2':  `${cName}: alta demanda, muy baja competencia — actúa rápido, esta ventana no durará.`,
      '1':  `${cName}: buena demanda con competencia moderada — un perfil sólido triunfa aquí.`,
      '0':  `${cName}: mercado equilibrado. Diferénciate con habilidades de nicho o seniority.`,
      '-1': `${cName}: mercado local competitivo. Apunta directamente a roles remotos en USD.`,
      '-2': `${cName}: saturado para este rol. Sube de nivel o pivota a una especialización cercana.`,
    },
    PT: {
      '2':  `${cName}: alta demanda, baixíssima concorrência — aja rápido, essa janela não vai durar.`,
      '1':  `${cName}: boa demanda com concorrência moderada — um perfil forte vence aqui.`,
      '0':  `${cName}: mercado equilibrado. Diferencie-se com habilidades de nicho ou senioridade.`,
      '-1': `${cName}: competitivo localmente. Foque em vagas remotas em USD para melhores resultados.`,
      '-2': `${cName}: saturado para essa função. Aprimore habilidades ou pivote para uma especialização próxima.`,
    },
  };

  const key = String(Math.max(-2, Math.min(2, net)));
  return verdicts[lang][key] || verdicts[lang]['0'];
}

const OPPORTUNITY_LABELS: Record<Lang, Record<'hot' | 'strong' | 'saturated', string>> = {
  EN: { hot: 'Hot 🔥',        strong: 'Strong ✅',     saturated: 'Saturated ⚠️'  },
  ES: { hot: 'Caliente 🔥',   strong: 'Sólido ✅',     saturated: 'Saturado ⚠️'   },
  PT: { hot: 'Quente 🔥',     strong: 'Sólido ✅',     saturated: 'Saturado ⚠️'   },
};

const DEMAND_LABELS: Record<Lang, Record<'High' | 'Medium' | 'Low', string>> = {
  EN: { High: 'High',  Medium: 'Medium', Low: 'Low'   },
  ES: { High: 'Alta',  Medium: 'Media',  Low: 'Baja'  },
  PT: { High: 'Alta',  Medium: 'Média',  Low: 'Baixa' },
};

const COMPETITION_LABELS: Record<Lang, Record<'High' | 'Medium' | 'Low', string>> = {
  EN: { High: 'High',  Medium: 'Medium', Low: 'Low'   },
  ES: { High: 'Alta',  Medium: 'Media',  Low: 'Baja'  },
  PT: { High: 'Alta',  Medium: 'Média',  Low: 'Baixa' },
};

// ─── Market demand matrix ─────────────────────────────────────────────────────
// demand & competition: 1=Low 2=Medium 3=High

const MARKET_MATRIX: Record<RoleKey, Record<CountryCode, { demand: number; competition: number }>> = {
  ai_ml:       { BR: { demand: 3, competition: 3 }, MX: { demand: 3, competition: 2 }, CO: { demand: 3, competition: 1 }, AR: { demand: 2, competition: 2 }, CL: { demand: 2, competition: 1 } },
  llm:         { BR: { demand: 3, competition: 2 }, MX: { demand: 3, competition: 1 }, CO: { demand: 2, competition: 1 }, AR: { demand: 2, competition: 2 }, CL: { demand: 2, competition: 1 } },
  data:        { BR: { demand: 3, competition: 3 }, MX: { demand: 3, competition: 2 }, CO: { demand: 2, competition: 2 }, AR: { demand: 2, competition: 3 }, CL: { demand: 2, competition: 1 } },
  backend:     { BR: { demand: 3, competition: 3 }, MX: { demand: 3, competition: 2 }, CO: { demand: 3, competition: 2 }, AR: { demand: 2, competition: 3 }, CL: { demand: 2, competition: 1 } },
  frontend:    { BR: { demand: 2, competition: 3 }, MX: { demand: 3, competition: 2 }, CO: { demand: 2, competition: 2 }, AR: { demand: 2, competition: 3 }, CL: { demand: 2, competition: 1 } },
  fullstack:   { BR: { demand: 3, competition: 3 }, MX: { demand: 3, competition: 2 }, CO: { demand: 3, competition: 1 }, AR: { demand: 2, competition: 3 }, CL: { demand: 2, competition: 2 } },
  devops:      { BR: { demand: 3, competition: 2 }, MX: { demand: 3, competition: 1 }, CO: { demand: 2, competition: 1 }, AR: { demand: 2, competition: 2 }, CL: { demand: 2, competition: 1 } },
  product:     { BR: { demand: 2, competition: 3 }, MX: { demand: 3, competition: 2 }, CO: { demand: 2, competition: 2 }, AR: { demand: 2, competition: 2 }, CL: { demand: 1, competition: 1 } },
  data_eng:    { BR: { demand: 3, competition: 2 }, MX: { demand: 3, competition: 1 }, CO: { demand: 2, competition: 1 }, AR: { demand: 2, competition: 2 }, CL: { demand: 2, competition: 1 } },
  eng_manager: { BR: { demand: 3, competition: 2 }, MX: { demand: 3, competition: 1 }, CO: { demand: 2, competition: 1 }, AR: { demand: 2, competition: 2 }, CL: { demand: 1, competition: 1 } },
};

// ─── Skills ROI ───────────────────────────────────────────────────────────────

const SKILLS_ROI_TABLE: { skill: string; boost: number; time: Record<Lang, string>; demand: 'Very High' | 'High' | 'Medium'; roles: RoleKey[] }[] = [
  { skill: 'LLM / Agentic AI',       boost: 22000, time: { EN: '3–4 months', ES: '3–4 meses', PT: '3–4 meses' }, demand: 'Very High', roles: ['ai_ml','llm','backend','fullstack','data','data_eng'] },
  { skill: 'AWS / Cloud (Certified)', boost: 13000, time: { EN: '2–3 months', ES: '2–3 meses', PT: '2–3 meses' }, demand: 'Very High', roles: ['backend','fullstack','devops','data_eng'] },
  { skill: 'Go (Golang)',             boost: 12000, time: { EN: '3–4 months', ES: '3–4 meses', PT: '3–4 meses' }, demand: 'Very High', roles: ['backend','devops','fullstack'] },
  { skill: 'Kubernetes / Helm',       boost: 10000, time: { EN: '6–8 weeks',  ES: '6–8 semanas', PT: '6–8 semanas' }, demand: 'High', roles: ['devops','backend','data_eng'] },
  { skill: 'PyTorch / ML Libs',       boost: 16000, time: { EN: '4–6 months', ES: '4–6 meses', PT: '4–6 meses' }, demand: 'Very High', roles: ['ai_ml','llm','data'] },
  { skill: 'System Design',           boost: 11000, time: { EN: '6–8 weeks',  ES: '6–8 semanas', PT: '6–8 semanas' }, demand: 'High', roles: ['backend','fullstack','ai_ml','llm','eng_manager'] },
  { skill: 'React Native',            boost: 8500,  time: { EN: '6–8 weeks',  ES: '6–8 semanas', PT: '6–8 semanas' }, demand: 'High', roles: ['frontend','fullstack'] },
  { skill: 'TypeScript (advanced)',   boost: 7000,  time: { EN: '3–4 weeks',  ES: '3–4 semanas', PT: '3–4 semanas' }, demand: 'High', roles: ['frontend','fullstack','backend'] },
  { skill: 'Rust',                    boost: 14000, time: { EN: '5–6 months', ES: '5–6 meses', PT: '5–6 meses' }, demand: 'High', roles: ['backend','devops'] },
  { skill: 'dbt / Modern Data Stack', boost: 9000,  time: { EN: '4–6 weeks',  ES: '4–6 semanas', PT: '4–6 semanas' }, demand: 'High', roles: ['data','data_eng'] },
  { skill: 'English → Fluent',        boost: 17000, time: { EN: '6–12 months', ES: '6–12 meses', PT: '6–12 meses' }, demand: 'Very High', roles: ['ai_ml','llm','data','backend','frontend','fullstack','devops','product','data_eng','eng_manager'] },
  { skill: 'Prompt Engineering',      boost: 8000,  time: { EN: '2–3 weeks',  ES: '2–3 semanas', PT: '2–3 semanas' }, demand: 'High', roles: ['product','data','fullstack','backend'] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSeniority(yearsExp: number): SeniorityKey {
  if (yearsExp <= 2) return 'junior';
  if (yearsExp <= 5) return 'mid';
  if (yearsExp <= 8) return 'senior';
  return 'staff';
}

function round(n: number, to = 500): number {
  return Math.round(n / to) * to;
}

// ─── Core functions ───────────────────────────────────────────────────────────

export function computeMarketValue(input: CandidateInput, lang: Lang = 'EN'): MarketValueResult {
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
    if      (cs < localMin * 0.75) percentile = 10;
    else if (cs < localMin)        percentile = 20;
    else if (cs < localMid)        percentile = 35;
    else if (cs < localMax)        percentile = 60;
    else if (cs < localMax * 1.25) percentile = 75;
    else                           percentile = 90;
    underpaidBy = cs < localMid ? round(localMid - cs, 100) : null;
  }

  return {
    marketMin: localMin, marketMax: localMax, marketMid: localMid,
    remoteMid, percentile, underpaidBy, remoteUplift,
    seniorityLabel: SENIORITY_LABELS[seniority][lang],
  };
}

export function computeSalaryGap(input: CandidateInput, lang: Lang = 'EN'): SalaryGapResult {
  const mv = computeMarketValue(input, lang);
  const localSalary = mv.marketMid;
  const remoteSalary = mv.remoteMid;
  const gap = remoteSalary - localSalary;
  const gapPercent = Math.round((gap / localSalary) * 100);
  const seniority = getSeniority(input.yearsExp);

  let topCountry: CountryCode = 'BR';
  let topSalary = 0;
  (Object.keys(BASE_SALARY[input.role]) as CountryCode[]).forEach(c => {
    const s = round(BASE_SALARY[input.role][c] * SENIORITY_MULT[seniority] * REMOTE_MULT[c] * ENGLISH_MULT[input.englishLevel]);
    if (s > topSalary) { topSalary = s; topCountry = c; }
  });

  return {
    localSalary, remoteSalary, gap, gapPercent,
    topPayingCountry: COUNTRY_NAME[topCountry][lang],
    topPayingSalary: topSalary,
    topPayingFlag: FLAG[topCountry],
  };
}

export function getBestMarkets(input: CandidateInput, lang: Lang = 'EN'): BestMarket[] {
  const seniority = getSeniority(input.yearsExp);
  const countries: CountryCode[] = ['BR', 'MX', 'CO', 'AR', 'CL'];

  return countries
    .map(c => {
      const { demand: d, competition: c2 } = MARKET_MATRIX[input.role][c];
      const net = d - c2;
      const opportunityKey: BestMarket['opportunityKey'] = net >= 2 ? 'hot' : net >= 0 ? 'strong' : 'saturated';
      const demand = d === 3 ? 'High' : d === 2 ? 'Medium' : 'Low' as const;
      const competition = c2 === 3 ? 'High' : c2 === 2 ? 'Medium' : 'Low' as const;
      const avgRemote = round(
        BASE_SALARY[input.role][c] * SENIORITY_MULT[seniority] * REMOTE_MULT[c] * ENGLISH_MULT[input.englishLevel]
      );
      return {
        country: c,
        flag: FLAG[c],
        name: COUNTRY_NAME[c][lang],
        demand: DEMAND_LABELS[lang][demand] as BestMarket['demand'],
        competition: COMPETITION_LABELS[lang][competition] as BestMarket['competition'],
        opportunity: OPPORTUNITY_LABELS[lang][opportunityKey],
        opportunityKey,
        verdict: getVerdict(d, c2, c, input.role, lang),
        avgRemote,
      };
    })
    .sort((a, b) => {
      const order = { hot: 0, strong: 1, saturated: 2 };
      return order[a.opportunityKey] - order[b.opportunityKey];
    });
}

export function getSkillsROI(input: CandidateInput, lang: Lang = 'EN'): SkillROI[] {
  const seniority = getSeniority(input.yearsExp);
  const mult = SENIORITY_MULT[seniority];
  return SKILLS_ROI_TABLE
    .filter(s => s.roles.includes(input.role))
    .map(s => ({
      skill: s.skill,
      salaryBoost: round(s.boost * mult, 500),
      timeToLearn: s.time[lang],
      demand: s.demand,
      alreadyHas: input.skills.some(us =>
        us.toLowerCase().includes(s.skill.toLowerCase().split(' ')[0].toLowerCase())
      ),
    }))
    .filter(s => !s.alreadyHas)
    .sort((a, b) => b.salaryBoost - a.salaryBoost)
    .slice(0, 4);
}

export function getRemoteReadiness(input: CandidateInput, lang: Lang = 'EN'): RemoteReadinessResult {
  let score = 0;
  const strengths: string[] = [];
  const gaps: string[] = [];

  const STRINGS = {
    EN: {
      bilingualStrength: 'Bilingual English — top 15% of LATAM candidates. Major advantage for US/EU roles.',
      fluentStrength: 'Fluent English — top 25% of LATAM candidates. Unlocks full remote salary premium.',
      englishGapFluent: 'English: reach fluency to unlock +28% remote salary premium. Single biggest lever.',
      englishGapBasic: 'English: biggest single blocker for US/EU remote roles. Prioritise this above all else.',
      seniorStrength: (yr: number) => `${yr}+ years experience — exceeds the 3yr minimum most US/EU companies require.`,
      juniorGap: 'Experience: most US/EU remote roles require 3+ years — target LATAM-remote roles first to build your track record.',
      remoteStrength: 'Prior remote experience — proves async communication competency to global hiring managers.',
      remoteGap: 'No remote experience on record — highlight async projects, open source, or freelance work to compensate.',
      portfolioStrength: 'Portfolio / GitHub — gives global recruiters concrete proof of your skills beyond a resume.',
      portfolioGap: 'No portfolio detected — 1–2 well-documented public projects will dramatically improve recruiter response rates.',
      readyLabel: 'Ready ✅',
      almostLabel: 'Almost There 🟡',
      notYetLabel: 'Not Yet 🔴',
      applyNow: 'Your profile is ready. Apply to US/EU remote roles now — start with companies on the WPro job board.',
    },
    ES: {
      bilingualStrength: 'Inglés bilingüe — top 15% de candidatos LATAM. Gran ventaja para roles en EE.UU./Europa.',
      fluentStrength: 'Inglés fluido — top 25% de candidatos LATAM. Accede a la prima salarial remota completa.',
      englishGapFluent: 'Inglés: alcanzar fluidez desbloquea +28% de prima salarial remota. La palanca más importante.',
      englishGapBasic: 'Inglés: el mayor obstáculo individual para roles remotos en EE.UU./Europa. Prioriza esto sobre todo.',
      seniorStrength: (yr: number) => `${yr}+ años de experiencia — supera el mínimo de 3 años que exigen la mayoría de empresas de EE.UU./Europa.`,
      juniorGap: 'Experiencia: la mayoría de roles remotos en EE.UU./Europa requieren 3+ años — apunta primero a roles remotos en LATAM para construir tu historial.',
      remoteStrength: 'Experiencia remota previa — demuestra competencia en comunicación asíncrona a equipos globales.',
      remoteGap: 'Sin experiencia remota registrada — destaca proyectos async, código abierto o trabajo freelance para compensar.',
      portfolioStrength: 'Portfolio / GitHub — da a los recruiters globales prueba concreta de tus habilidades más allá del CV.',
      portfolioGap: 'Sin portfolio detectado — 1–2 proyectos públicos bien documentados mejorarán drásticamente tus tasas de respuesta.',
      readyLabel: 'Listo ✅',
      almostLabel: 'Casi Listo 🟡',
      notYetLabel: 'Aún No 🔴',
      applyNow: 'Tu perfil está listo. Postúlate a roles remotos en EE.UU./Europa ahora — empieza con las empresas en el portal WPro.',
    },
    PT: {
      bilingualStrength: 'Inglês bilíngue — top 15% dos candidatos LATAM. Grande vantagem para vagas nos EUA/Europa.',
      fluentStrength: 'Inglês fluente — top 25% dos candidatos LATAM. Acessa o prêmio salarial remoto completo.',
      englishGapFluent: 'Inglês: atingir fluência desbloqueia +28% de prêmio salarial remoto. A maior alavanca disponível.',
      englishGapBasic: 'Inglês: maior obstáculo individual para vagas remotas nos EUA/Europa. Priorize acima de tudo.',
      seniorStrength: (yr: number) => `${yr}+ anos de experiência — supera o mínimo de 3 anos exigido pela maioria das empresas dos EUA/Europa.`,
      juniorGap: 'Experiência: a maioria das vagas remotas nos EUA/Europa exige 3+ anos — foque em vagas remotas no LATAM primeiro para construir histórico.',
      remoteStrength: 'Experiência remota prévia — demonstra competência em comunicação assíncrona para equipes globais.',
      remoteGap: 'Sem experiência remota registrada — destaque projetos async, open source ou freelance para compensar.',
      portfolioStrength: 'Portfolio / GitHub — oferece aos recruiters globais prova concreta das suas habilidades além do currículo.',
      portfolioGap: 'Nenhum portfolio detectado — 1–2 projetos públicos bem documentados melhorarão drasticamente suas taxas de resposta.',
      readyLabel: 'Pronto ✅',
      almostLabel: 'Quase Lá 🟡',
      notYetLabel: 'Ainda Não 🔴',
      applyNow: 'Seu perfil está pronto. Candidate-se a vagas remotas nos EUA/Europa agora — comece pelas empresas no portal WPro.',
    },
  };

  const s = STRINGS[lang];
  const seniority = getSeniority(input.yearsExp);

  // English — up to 40 pts
  const engScore = { basic: 5, conversational: 20, fluent: 35, bilingual: 40 }[input.englishLevel];
  score += engScore;
  if      (input.englishLevel === 'bilingual')     strengths.push(s.bilingualStrength);
  else if (input.englishLevel === 'fluent')         strengths.push(s.fluentStrength);
  else if (input.englishLevel === 'conversational') gaps.push(s.englishGapFluent);
  else                                              gaps.push(s.englishGapBasic);

  // Experience — up to 25 pts
  const expScore = { junior: 8, mid: 16, senior: 22, staff: 25 }[seniority];
  score += expScore;
  if (seniority === 'senior' || seniority === 'staff') strengths.push(s.seniorStrength(input.yearsExp));
  else if (seniority === 'junior')                      gaps.push(s.juniorGap);

  // Remote exp — up to 20 pts
  if (input.hasRemoteExp) { score += 20; strengths.push(s.remoteStrength); }
  else                    { score += 5;  gaps.push(s.remoteGap); }

  // Portfolio — up to 15 pts
  if (input.hasPortfolio) { score += 15; strengths.push(s.portfolioStrength); }
  else                    {              gaps.push(s.portfolioGap); }

  score = Math.min(100, score);
  const ready = score >= 70;
  const label = score >= 70 ? s.readyLabel : score >= 50 ? s.almostLabel : s.notYetLabel;
  const topAction = gaps[0] || s.applyNow;

  return { score, ready, label, strengths, gaps, topAction };
}
