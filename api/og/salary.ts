// api/og/salary.ts
// OG image endpoint — returns the share-my-salary SVG so that when a shared
// link is pasted into LinkedIn / X / WhatsApp, the platform fetches this
// image as the preview thumbnail.
//
// Usage: <meta property="og:image" content="https://intel.wprotalents.lat/api/og/salary?role=ai_ml&country=BR&years=7&lang=EN" />
//
// IMPORTANT: This file inlines the salary math (BASE_SALARY, SENIORITY_MULT,
// REMOTE_MULT) so it doesn't depend on ../src/lib/intelligence.ts (which
// imports @supabase/supabase-js at module load, crashing Vercel functions).
// Keep this section in sync with src/lib/intelligence.ts.

import type { VercelRequest, VercelResponse } from '@vercel/node';

type RoleKey = 'ai_ml' | 'llm' | 'data' | 'backend' | 'frontend' | 'fullstack' | 'devops' | 'product' | 'data_eng' | 'eng_manager';
type CountryCode = 'BR' | 'MX' | 'CO' | 'AR' | 'CL';
type Lang = 'EN' | 'ES' | 'PT';

const BASE_SALARY: Record<RoleKey, Record<CountryCode, number>> = {
  ai_ml:       { BR: 65000, MX: 65000, CO: 55000, AR: 70000, CL: 70000 },
  llm:         { BR: 70000, MX: 70000, CO: 60000, AR: 75000, CL: 75000 },
  data:        { BR: 55000, MX: 55000, CO: 50000, AR: 60000, CL: 60000 },
  backend:     { BR: 45000, MX: 46000, CO: 42000, AR: 48000, CL: 51000 },
  frontend:    { BR: 45000, MX: 46000, CO: 42000, AR: 48000, CL: 51000 },
  fullstack:   { BR: 45000, MX: 46000, CO: 42000, AR: 48000, CL: 51000 },
  devops:      { BR: 55000, MX: 55000, CO: 50000, AR: 60000, CL: 60000 },
  product:     { BR: 45000, MX: 46000, CO: 42000, AR: 48000, CL: 51000 },
  data_eng:    { BR: 55000, MX: 55000, CO: 50000, AR: 60000, CL: 60000 },
  eng_manager: { BR: 58000, MX: 58000, CO: 54000, AR: 62000, CL: 65000 },
};

const SENIORITY_MULT: Record<'junior' | 'mid' | 'senior' | 'staff', number> = {
  junior: 0.59, mid: 1.00, senior: 1.55, staff: 2.17,
};

const REMOTE_MULT: Record<CountryCode, number> = {
  BR: 1.70, MX: 1.70, CO: 1.70, AR: 1.50, CL: 1.50,
};

const ENGLISH_MULT = { conversational: 1.12 } as const;

function getSeniority(yearsExp: number): 'junior' | 'mid' | 'senior' | 'staff' {
  if (yearsExp <= 3) return 'junior';
  if (yearsExp <= 6) return 'mid';
  if (yearsExp <= 10) return 'senior';
  return 'staff';
}

function computeShareValue(role: RoleKey, country: CountryCode, yearsExp: number) {
  const seniority = getSeniority(yearsExp);
  const base = BASE_SALARY[role][country];
  const local = base * SENIORITY_MULT[seniority];
  const localMid = Math.round(local / 500) * 500;
  const remoteMid = Math.round(local * REMOTE_MULT[country] * ENGLISH_MULT.conversational / 500) * 500;
  const remoteUplift = Math.round(((remoteMid - localMid) / localMid) * 100);
  return { marketMid: localMid, remoteMid, remoteUplift };
}

const ROLE_LABELS: Record<RoleKey, Record<Lang, string>> = {
  ai_ml:       { EN: 'AI / ML Engineer',   ES: 'Ing. IA / ML',          PT: 'Eng. IA / ML' },
  llm:         { EN: 'LLM Engineer',       ES: 'Ing. LLM',              PT: 'Eng. LLM' },
  data:        { EN: 'Data Scientist',     ES: 'Científico de Datos',   PT: 'Cientista de Dados' },
  backend:     { EN: 'Backend Engineer',   ES: 'Ing. Backend',          PT: 'Eng. Backend' },
  frontend:    { EN: 'Frontend Engineer',  ES: 'Ing. Frontend',         PT: 'Eng. Frontend' },
  fullstack:   { EN: 'Full Stack',         ES: 'Full Stack',            PT: 'Full Stack' },
  devops:      { EN: 'DevOps / SRE',       ES: 'DevOps / SRE',          PT: 'DevOps / SRE' },
  product:     { EN: 'Product Manager',    ES: 'Product Manager',       PT: 'Product Manager' },
  data_eng:    { EN: 'Data Engineer',      ES: 'Ing. de Datos',         PT: 'Eng. de Dados' },
  eng_manager: { EN: 'Eng. Manager',       ES: 'Gerente de Ing.',       PT: 'Gerente de Eng.' },
};

const COUNTRY_FLAGS: Record<CountryCode, string> = {
  BR: '🇧🇷', MX: '🇲🇽', CO: '🇨🇴', AR: '🇦🇷', CL: '🇨🇱',
};

const SENIORITY_LABEL: Record<string, Record<Lang, string>> = {
  junior:  { EN: 'Junior',     ES: 'Junior',  PT: 'Júnior' },
  mid:     { EN: 'Mid-level',  ES: 'Medio',   PT: 'Pleno' },
  senior:  { EN: 'Senior',     ES: 'Senior',  PT: 'Sênior' },
  staff:   { EN: 'Staff',      ES: 'Lead',    PT: 'Lead' },
};

function fmt(n: number): string {
  return '$' + n.toLocaleString('en-US');
}

const CARD_W = 1200;
const CARD_H = 630;

function renderShareSvg(role: RoleKey, country: CountryCode, yearsExp: number, lang: Lang): string {
  const roleLabel = ROLE_LABELS[role]?.[lang] || role;
  const flag = COUNTRY_FLAGS[country] || '';
  const seniority = SENIORITY_LABEL[getSeniority(yearsExp)][lang];

  const result = computeShareValue(role, country, yearsExp);
  const local = fmt(result.marketMid);
  const remote = fmt(result.remoteMid);
  const uplift = result.remoteUplift;

  const T = {
    EN: { title: 'MY MARKET VALUE', local: 'LOCAL', remote: 'REMOTE (USD)', yrs: 'YEARS', brand: 'intel.wprotalents.lat', tagline: 'LATAM Tech Workforce Intelligence', lastUpdated: 'Last updated 2026-08-04', source: 'Source: Mismo · Howdy · Levels.fyi · Nexton · Terminal' },
    ES: { title: 'MI VALOR DE MERCADO', local: 'LOCAL', remote: 'REMOTO (USD)', yrs: 'AÑOS', brand: 'intel.wprotalents.lat', tagline: 'Inteligencia del Mercado Laboral LATAM', lastUpdated: 'Última actualización 2026-08-04', source: 'Fuente: Mismo · Howdy · Levels.fyi · Nexton · Terminal' },
    PT: { title: 'MEU VALOR DE MERCADO', local: 'LOCAL', remote: 'REMOTO (USD)', yrs: 'ANOS', brand: 'intel.wprotalents.lat', tagline: 'Inteligência do Mercado de Trabalho LATAM', lastUpdated: 'Última atualização 2026-08-04', source: 'Fonte: Mismo · Howdy · Levels.fyi · Nexton · Terminal' },
  }[lang];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_W}" height="${CARD_H}" viewBox="0 0 ${CARD_W} ${CARD_H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0a0a0a"/>
      <stop offset="100%" stop-color="#1a0f08"/>
    </linearGradient>
    <linearGradient id="orange" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ff6b00"/>
      <stop offset="100%" stop-color="#ffaa00"/>
    </linearGradient>
  </defs>
  <rect width="${CARD_W}" height="${CARD_H}" fill="url(#bg)"/>
  <g transform="translate(60, 50)">
    <path d="M 0 0 L 10 30 L 20 0 L 30 30 L 40 0 M 50 0 L 50 30" stroke="url(#orange)" stroke-width="4" fill="none" stroke-linecap="round"/>
    <text x="65" y="25" font-family="Inter, sans-serif" font-size="22" font-weight="800" fill="#ffffff" letter-spacing="2">WPRO</text>
    <text x="195" y="25" font-family="JetBrains Mono, monospace" font-size="18" font-weight="500" fill="#ff6b00">·  INTEL</text>
  </g>
  <text x="60" y="160" font-family="JetBrains Mono, monospace" font-size="14" font-weight="700" fill="#ff6b00" letter-spacing="3">${T.title.toUpperCase()}</text>
  <g transform="translate(60, 195)">
    <rect x="0" y="0" width="${roleLabel.length * 14 + 40}" height="44" fill="#ff6b00" fill-opacity="0.1" stroke="#ff6b00" stroke-width="1.5"/>
    <text x="20" y="29" font-family="Inter, sans-serif" font-size="20" font-weight="700" fill="#ffffff">${roleLabel}</text>
    <rect x="${roleLabel.length * 14 + 60}" y="0" width="160" height="44" fill="#ffffff" fill-opacity="0.05" stroke="#ffffff" stroke-opacity="0.2" stroke-width="1"/>
    <text x="${roleLabel.length * 14 + 80}" y="29" font-family="Inter, sans-serif" font-size="20" font-weight="600" fill="#ffffff">${flag} ${country}</text>
    <rect x="${roleLabel.length * 14 + 240}" y="0" width="200" height="44" fill="#ffffff" fill-opacity="0.05" stroke="#ffffff" stroke-opacity="0.2" stroke-width="1"/>
    <text x="${roleLabel.length * 14 + 260}" y="29" font-family="Inter, sans-serif" font-size="20" font-weight="600" fill="#ffffff">${yearsExp} ${T.yrs} · ${seniority}</text>
  </g>
  <g transform="translate(60, 330)">
    <text font-family="JetBrains Mono, monospace" font-size="12" font-weight="500" fill="#999999" letter-spacing="2">${T.local}</text>
    <text y="80" font-family="Inter, sans-serif" font-size="88" font-weight="900" fill="#ffffff">${local}</text>
    <text y="115" font-family="JetBrains Mono, monospace" font-size="12" font-weight="500" fill="#666666">/ year</text>
  </g>
  <line x1="600" y1="290" x2="600" y2="470" stroke="#ff6b00" stroke-width="2" stroke-opacity="0.4"/>
  <g transform="translate(660, 330)">
    <text font-family="JetBrains Mono, monospace" font-size="12" font-weight="500" fill="#ff6b00" letter-spacing="2">${T.remote}</text>
    <text y="80" font-family="Inter, sans-serif" font-size="88" font-weight="900" fill="url(#orange)">${remote}</text>
    <text y="115" font-family="JetBrains Mono, monospace" font-size="12" font-weight="500" fill="#ff6b00">+${uplift}% / year</text>
  </g>
  <line x1="60" y1="510" x2="${CARD_W - 60}" y2="510" stroke="#ffffff" stroke-opacity="0.1" stroke-width="1"/>
  <text x="60" y="545" font-family="JetBrains Mono, monospace" font-size="13" font-weight="700" fill="#ff6b00">${T.brand}</text>
  <text x="60" y="565" font-family="Inter, sans-serif" font-size="13" font-weight="400" fill="#999999">${T.tagline}</text>
  <text x="${CARD_W - 60}" y="545" font-family="JetBrains Mono, monospace" font-size="11" font-weight="500" fill="#999999" text-anchor="end">${T.lastUpdated}</text>
  <text x="${CARD_W - 60}" y="565" font-family="JetBrains Mono, monospace" font-size="11" font-weight="500" fill="#999999" text-anchor="end">${T.source}</text>
  <text x="${CARD_W - 60}" y="600" font-family="JetBrains Mono, monospace" font-size="10" font-weight="500" fill="#666666" text-anchor="end">Anonymous · No personal data used</text>
</svg>`;
}

const VALID_ROLES = new Set<RoleKey>([
  'ai_ml','llm','data','backend','frontend','fullstack',
  'devops','product','data_eng','eng_manager',
]);
const VALID_COUNTRIES = new Set<CountryCode>(['BR','MX','CO','AR','CL']);

export default function handler(req: VercelRequest, res: VercelResponse) {
  const role = String(req.query.role || 'backend') as RoleKey;
  const country = String(req.query.country || 'BR') as CountryCode;
  const yearsRaw = parseInt(String(req.query.years || '4'), 10);
  const years = Number.isFinite(yearsRaw) ? Math.max(0, Math.min(40, yearsRaw)) : 4;
  const langParam = String(req.query.lang || 'EN').toUpperCase();
  const lang = (langParam === 'PT' ? 'PT' : langParam === 'ES' ? 'ES' : 'EN') as Lang;

  if (!VALID_ROLES.has(role)) {
    return res.status(400).send(`Invalid role: ${role}. Use one of: ${[...VALID_ROLES].join(', ')}`);
  }
  if (!VALID_COUNTRIES.has(country)) {
    return res.status(400).send(`Invalid country: ${country}. Use one of: ${[...VALID_COUNTRIES].join(', ')}`);
  }

  const svg = renderShareSvg(role, country, years, lang);

  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800');
  res.status(200).send(svg);
}
