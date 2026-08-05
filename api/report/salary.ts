// api/report/salary.ts
// Serverless endpoint that generates a branded PDF salary report for the
// company portal. Companies enter role/country/seniority in the salary
// bench, hit "Download PDF report" -> get a multi-page PDF they can
// forward internally (WPRO-branded, provenance-stamped).
//
// Self-contained: salary math is inlined (mirror of src/lib/intelligence.ts
// + src/lib/shareSalaryCard.ts) so this works even when Vercel env vars
// are not injected (same constraint that broke the OG endpoint initially).
//
// PDF generation uses pdf-lib (pure JS, no native deps, works in Vercel
// serverless). Each report includes:
//   1. Cover with role/country/seniority summary
//   2. Salary table (local mid, remote mid, 5-country comparison)
//   3. Per-role LATAM market context (text, no charts - PDFs are for
//      printing/forwarding, not for clicking)
//   4. Provenance footer with sources + last-updated date
//   5. Share-back link to the live calculator

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';

type RoleKey = 'ai_ml' | 'llm' | 'data' | 'backend' | 'frontend' | 'fullstack' | 'devops' | 'product' | 'data_eng' | 'eng_manager';
type CountryCode = 'BR' | 'MX' | 'CO' | 'AR' | 'CL';
type Lang = 'EN' | 'ES' | 'PT';

// ── Inlined salary math (mirror of src/lib/intelligence.ts) ──
// Keep in sync with intelligence.ts and shareSalaryCard.ts.
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

const ENGLISH_MULT = { basic: 1.00, conversational: 1.12, fluent: 1.28, bilingual: 1.40 } as const;

function getSeniority(yearsExp: number): 'junior' | 'mid' | 'senior' | 'staff' {
  if (yearsExp <= 3) return 'junior';
  if (yearsExp <= 6) return 'mid';
  if (yearsExp <= 10) return 'senior';
  return 'staff';
}

const ROLE_LABELS: Record<RoleKey, Record<Lang, string>> = {
  ai_ml:       { EN: 'AI / ML Engineer',   ES: 'Ing. IA / ML',         PT: 'Eng. IA / ML' },
  llm:         { EN: 'LLM Engineer',       ES: 'Ing. LLM',             PT: 'Eng. LLM' },
  data:        { EN: 'Data Scientist',     ES: 'Científico de Datos',  PT: 'Cientista de Dados' },
  backend:     { EN: 'Backend Engineer',   ES: 'Ing. Backend',         PT: 'Eng. Backend' },
  frontend:    { EN: 'Frontend Engineer',  ES: 'Ing. Frontend',        PT: 'Eng. Frontend' },
  fullstack:   { EN: 'Full Stack',         ES: 'Full Stack',           PT: 'Full Stack' },
  devops:      { EN: 'DevOps / SRE',       ES: 'DevOps / SRE',         PT: 'DevOps / SRE' },
  product:     { EN: 'Product Manager',    ES: 'Product Manager',      PT: 'Product Manager' },
  data_eng:    { EN: 'Data Engineer',      ES: 'Ing. de Datos',        PT: 'Eng. de Dados' },
  eng_manager: { EN: 'Eng. Manager',       ES: 'Gerente de Ing.',      PT: 'Gerente de Eng.' },
};

const COUNTRY_NAMES: Record<CountryCode, Record<Lang, string>> = {
  BR: { EN: 'Brazil',    ES: 'Brasil',    PT: 'Brasil' },
  MX: { EN: 'Mexico',    ES: 'México',    PT: 'México' },
  CO: { EN: 'Colombia',  ES: 'Colombia',  PT: 'Colômbia' },
  AR: { EN: 'Argentina', ES: 'Argentina', PT: 'Argentina' },
  CL: { EN: 'Chile',     ES: 'Chile',     PT: 'Chile' },
};

const SENIORITY_LABEL: Record<string, Record<Lang, string>> = {
  junior:  { EN: 'Junior',     ES: 'Junior',  PT: 'Júnior' },
  mid:     { EN: 'Mid-level',  ES: 'Medio',   PT: 'Pleno' },
  senior:  { EN: 'Senior',     ES: 'Senior',  PT: 'Sênior' },
  staff:   { EN: 'Staff/Lead', ES: 'Lead',    PT: 'Lead' },
};

const COPY: Record<Lang, {
  title: string; subtitle: string; reportFor: string; role: string; country: string;
  years: string; seniority: string; local: string; remote: string; uplift: string;
  fiveCountry: string; methodology: string; sources: string; lastUpdated: string;
  shareBack: string; shareBackDesc: string; footer: string; page: string; of: string;
}> = {
  EN: {
    title: 'LATAM Salary Benchmark Report',
    subtitle: 'Live market data for tech hiring decisions',
    reportFor: 'Report for',
    role: 'Role', country: 'Country', years: 'Years experience', seniority: 'Seniority band',
    local: 'Local market mid (USD/year)', remote: 'Remote USD (US/EU company)',
    uplift: 'Remote uplift', fiveCountry: '5-Country Comparison (same role, same seniority)',
    methodology: 'Methodology',
    sources: 'Sources: Mismo · Howdy · Levels.fyi LATAM · Nexton · Terminal',
    lastUpdated: 'Last updated: 2026-08-04',
    shareBack: 'See this benchmark live',
    shareBackDesc: 'Use this link to share with your team - opens the live calculator with these exact parameters:',
    footer: 'WProTalents · intel.wprotalents.lat · Confidential salary report',
    page: 'Page', of: 'of',
  },
  ES: {
    title: 'Reporte de Benchmark Salarial LATAM',
    subtitle: 'Datos de mercado en vivo para decisiones de contratación tech',
    reportFor: 'Reporte para',
    role: 'Rol', country: 'País', years: 'Años de experiencia', seniority: 'Banda de seniority',
    local: 'Mercado local medio (USD/año)', remote: 'Remoto USD (empresa US/UE)',
    uplift: 'Uplift remoto', fiveCountry: 'Comparación 5 países (mismo rol, misma seniority)',
    methodology: 'Metodología',
    sources: 'Fuentes: Mismo · Howdy · Levels.fyi LATAM · Nexton · Terminal',
    lastUpdated: 'Última actualización: 2026-08-04',
    shareBack: 'Ver este benchmark en vivo',
    shareBackDesc: 'Usa este enlace para compartir con tu equipo - abre la calculadora en vivo con estos parámetros exactos:',
    footer: 'WProTalents · intel.wprotalents.lat · Reporte salarial confidencial',
    page: 'Página', of: 'de',
  },
  PT: {
    title: 'Relatório de Benchmark Salarial LATAM',
    subtitle: 'Dados de mercado ao vivo para decisões de contratação tech',
    reportFor: 'Relatório para',
    role: 'Função', country: 'País', years: 'Anos de experiência', seniority: 'Faixa de senioridade',
    local: 'Mercado local médio (USD/ano)', remote: 'Remoto USD (empresa US/UE)',
    uplift: 'Uplift remoto', fiveCountry: 'Comparação 5 países (mesma função, mesma senioridade)',
    methodology: 'Metodologia',
    sources: 'Fontes: Mismo · Howdy · Levels.fyi LATAM · Nexton · Terminal',
    lastUpdated: 'Última atualização: 2026-08-04',
    shareBack: 'Veja este benchmark ao vivo',
    shareBackDesc: 'Use este link para compartilhar com sua equipe - abre a calculadora ao vivo com estes parâmetros exatos:',
    footer: 'WProTalents · intel.wprotalents.lat · Relatório salarial confidencial',
    page: 'Página', of: 'de',
  },
};

// Brand colors (matching the orange #ff6b00 of the live site)
const ORANGE = rgb(1.0, 0.42, 0.0);
const DARK_BG = rgb(0.04, 0.04, 0.04);
const WHITE = rgb(1, 1, 1);
const GRAY_LIGHT = rgb(0.65, 0.65, 0.65);
const GRAY_MID = rgb(0.4, 0.4, 0.4);

function fmt(n: number): string {
  return '$' + n.toLocaleString('en-US');
}

// Compute salary for a (role, country, years) combo
function compute(role: RoleKey, country: CountryCode, years: number, englishLevel: keyof typeof ENGLISH_MULT = 'conversational') {
  const seniority = getSeniority(years);
  const base = BASE_SALARY[role][country];
  const local = base * SENIORITY_MULT[seniority];
  const localMid = Math.round(local / 500) * 500;
  const remoteMid = Math.round(local * REMOTE_MULT[country] * ENGLISH_MULT[englishLevel] / 500) * 500;
  const remoteUplift = Math.round(((remoteMid - localMid) / localMid) * 100);
  return { marketMid: localMid, remoteMid, remoteUplift, seniority };
}

// Helper: draw a WPRO W mark in the top-left of a page
function drawWMark(page: PDFPage, font: PDFFont, fontBold: PDFFont, size: number, x: number, y: number) {
  page.drawText('W', {
    x, y, size: size * 1.4, font: fontBold, color: ORANGE,
  });
  page.drawText('PRO', {
    x: x + size * 1.0, y, size, font: fontBold, color: WHITE,
  });
  page.drawText('·  INTEL', {
    x: x + size * 3.0, y, size, font, color: ORANGE,
  });
}

// Helper: add a horizontal divider line
function drawDivider(page: PDFPage, y: number, x1: number, x2: number, color = GRAY_MID) {
  page.drawLine({ start: { x: x1, y }, end: { x: x2, y }, thickness: 0.5, color });
}

// Helper: draw text with word wrap
function drawWrappedText(
  page: PDFPage, text: string, opts: { x: number; y: number; size: number;
  font: PDFFont; color: any; maxWidth: number; lineHeight?: number; }
) {
  const lineHeight = opts.lineHeight ?? opts.size * 1.4;
  const words = text.split(' ');
  let line = '';
  let cursorY = opts.y;
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    const width = opts.font.widthOfTextAtSize(test, opts.size);
    if (width > opts.maxWidth && line) {
      page.drawText(line, { x: opts.x, y: cursorY, size: opts.size, font: opts.font, color: opts.color });
      cursorY -= lineHeight;
      line = word;
    } else {
      line = test;
    }
  }
  if (line) {
    page.drawText(line, { x: opts.x, y: cursorY, size: opts.size, font: opts.font, color: opts.color });
  }
}

async function buildPdf(opts: {
  role: RoleKey; country: CountryCode; years: number; lang: Lang;
}): Promise<Uint8Array> {
  const { role, country, years, lang } = opts;
  const T = COPY[lang];
  const roleLabel = ROLE_LABELS[role][lang];
  const countryLabel = COUNTRY_NAMES[country][lang];
  const seniority = getSeniority(years);
  const seniorityLabel = SENIORITY_LABEL[seniority][lang];
  const result = compute(role, country, years);

  const pdfDoc = await PDFDocument.create();
  const helv = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const courier = await pdfDoc.embedFont(StandardFonts.Courier);

  // ── Page 1: Cover ──
  const page1 = pdfDoc.addPage([612, 792]); // US Letter
  const { width, height } = page1.getSize();

  // Dark background
  page1.drawRectangle({ x: 0, y: 0, width, height, color: DARK_BG });

  // WPRO mark
  drawWMark(page1, helv, helvBold, 14, 50, height - 60);

  // Title
  page1.drawText(T.title, {
    x: 50, y: height - 150, size: 24, font: helvBold, color: ORANGE,
  });
  page1.drawText(T.subtitle, {
    x: 50, y: height - 180, size: 11, font: helv, color: GRAY_LIGHT,
  });

  // Divider
  drawDivider(page1, height - 210, 50, width - 50, ORANGE);

  // Specs
  let y = height - 260;
  page1.drawText(T.reportFor, { x: 50, y, size: 9, font: helv, color: GRAY_LIGHT });
  y -= 18;
  page1.drawText(`${roleLabel}  ·  ${countryLabel}  ·  ${years} ${T.years}  ·  ${seniorityLabel}`, {
    x: 50, y, size: 18, font: helvBold, color: WHITE,
  });
  y -= 50;

  // Big numbers
  page1.drawText(T.local, { x: 50, y, size: 9, font: helv, color: GRAY_LIGHT });
  y -= 38;
  page1.drawText(fmt(result.marketMid), {
    x: 50, y, size: 36, font: helvBold, color: WHITE,
  });
  y -= 50;

  page1.drawText(T.remote, { x: 50, y, size: 9, font: helv, color: ORANGE });
  y -= 38;
  page1.drawText(fmt(result.remoteMid), {
    x: 50, y, size: 36, font: helvBold, color: ORANGE,
  });
  page1.drawText(`  (${T.uplift} +${result.remoteUplift}%)`, {
    x: 250, y: y + 12, size: 12, font: helvOblique, color: ORANGE,
  });
  y -= 60;

  // Footer
  page1.drawText(T.lastUpdated, { x: 50, y: 60, size: 8, font: helv, color: GRAY_LIGHT });
  page1.drawText(T.sources, { x: 50, y: 48, size: 8, font: helv, color: GRAY_LIGHT });
  page1.drawText(T.footer, { x: 50, y: 30, size: 7, font: helvOblique, color: GRAY_MID });

  // Page number
  page1.drawText(`${T.page} 1`, { x: width - 80, y: 30, size: 8, font: helv, color: GRAY_MID });

  // ── Page 2: 5-country comparison ──
  const page2 = pdfDoc.addPage([612, 792]);
  page2.drawRectangle({ x: 0, y: 0, width, height, color: DARK_BG });
  drawWMark(page2, helv, helvBold, 10, 50, height - 50);
  page2.drawText(T.fiveCountry, {
    x: 50, y: height - 100, size: 14, font: helvBold, color: WHITE,
  });
  page2.drawText(`${roleLabel}  ·  ${seniorityLabel}`, {
    x: 50, y: height - 118, size: 9, font: helv, color: GRAY_LIGHT,
  });
  drawDivider(page2, height - 140, 50, width - 50, ORANGE);

  // Table header
  let ty = height - 170;
  page2.drawText('COUNTRY', { x: 50, y: ty, size: 8, font: helvBold, color: GRAY_LIGHT });
  page2.drawText('LOCAL (USD)', { x: 220, y: ty, size: 8, font: helvBold, color: GRAY_LIGHT });
  page2.drawText('REMOTE (USD)', { x: 350, y: ty, size: 8, font: helvBold, color: GRAY_LIGHT });
  page2.drawText('UPLIFT', { x: 490, y: ty, size: 8, font: helvBold, color: GRAY_LIGHT });
  ty -= 6;
  drawDivider(page2, ty, 50, width - 50, GRAY_MID);
  ty -= 18;

  // Table rows for all 5 countries
  const allCountries: CountryCode[] = ['BR', 'MX', 'CO', 'AR', 'CL'];
  for (const c of allCountries) {
    const r = compute(role, c, years);
    const isHighlighted = c === country;
    const rowColor = isHighlighted ? ORANGE : WHITE;
    page2.drawText(COUNTRY_NAMES[c][lang] + (isHighlighted ? '  <--' : ''), {
      x: 50, y: ty, size: 11, font: isHighlighted ? helvBold : helv, color: rowColor,
    });
    page2.drawText(fmt(r.marketMid), {
      x: 220, y: ty, size: 11, font: helv, color: WHITE,
    });
    page2.drawText(fmt(r.remoteMid), {
      x: 350, y: ty, size: 11, font: helv, color: ORANGE,
    });
    page2.drawText(`+${r.remoteUplift}%`, {
      x: 490, y: ty, size: 11, font: helv, color: WHITE,
    });
    ty -= 22;
  }

  // Highlighted note
  ty -= 20;
  drawWrappedText(page2,
    `<-- = Selected country. Use the live calculator to see real-time data for each market: intel.wprotalents.lat/?role=${role}&country=${country}&years=${years}`,
    { x: 50, y: ty, size: 8, font: helvOblique, color: GRAY_LIGHT, maxWidth: width - 100 }
  );

  // Methodology note
  ty -= 80;
  page2.drawText(T.methodology, { x: 50, y: ty, size: 10, font: helvBold, color: ORANGE });
  ty -= 16;
  drawWrappedText(page2,
    'BASE_SALARY (local market mid-anchor for 3-6yr) is multiplied by SENIORITY_MULT (junior 0.59, mid 1.00, senior 1.55, staff 2.17) and rounded to the nearest $500. Remote-USD is local × REMOTE_MULT (BR/MX/CO 1.70, AR/CL 1.50) × ENGLISH_MULT (conversational 1.12, fluent 1.28, bilingual 1.40). The remote multiplier is smaller for AR/CL because local pay there is already high; larger for CO/BR/MX because local is lower and remote contracts close the gap to US/EU bands.',
    { x: 50, y: ty, size: 9, font: helv, color: GRAY_LIGHT, maxWidth: width - 100 }
  );

  // Footer
  page2.drawText(T.lastUpdated, { x: 50, y: 60, size: 8, font: helv, color: GRAY_LIGHT });
  page2.drawText(T.sources, { x: 50, y: 48, size: 8, font: helv, color: GRAY_LIGHT });
  page2.drawText(T.footer, { x: 50, y: 30, size: 7, font: helvOblique, color: GRAY_MID });
  page2.drawText(`${T.page} 2`, { x: width - 80, y: 30, size: 8, font: helv, color: GRAY_MID });

  // ── Page 3: Share back to live ──
  const page3 = pdfDoc.addPage([612, 792]);
  page3.drawRectangle({ x: 0, y: 0, width, height, color: DARK_BG });
  drawWMark(page3, helv, helvBold, 10, 50, height - 50);
  page3.drawText(T.shareBack, {
    x: 50, y: height - 100, size: 14, font: helvBold, color: WHITE,
  });
  drawDivider(page3, height - 130, 50, width - 50, ORANGE);

  drawWrappedText(page3, T.shareBackDesc, {
    x: 50, y: height - 170, size: 10, font: helv, color: GRAY_LIGHT, maxWidth: width - 100
  });

  // Deep link in a "code block" style
  const linkY = height - 240;
  page3.drawRectangle({
    x: 50, y: linkY - 50, width: width - 100, height: 60,
    color: rgb(0.08, 0.08, 0.08), borderColor: ORANGE, borderWidth: 1,
  });
  page3.drawText(`https://intel.wprotalents.lat/?role=${role}&country=${country}&years=${years}`, {
    x: 60, y: linkY - 18, size: 9, font: courier, color: ORANGE,
  });

  // QR code would be nice but adds a dep - skip for now

  // Brand block
  let by = linkY - 100;
  page3.drawText('About WProTalents', { x: 50, y: by, size: 10, font: helvBold, color: ORANGE });
  by -= 18;
  drawWrappedText(page3,
    'WProTalents is a 20-year veteran LATAM tech recruitment firm with 23,000+ vetted professionals across Brazil, Mexico, Colombia, Argentina, and Chile. Latam-Intel is our free market intelligence tool - the same salary data we use to negotiate mandates, now available to everyone.',
    { x: 50, y: by, size: 9, font: helv, color: GRAY_LIGHT, maxWidth: width - 100 }
  );
  by -= 80;
  drawWrappedText(page3,
    'For comp planning at scale, CV Radar (auto-match candidates to your JDs), or a custom LATAM hiring engagement: wprotalents@gmail.com · +57 324 313 2500',
    { x: 50, y: by, size: 9, font: helvBold, color: WHITE, maxWidth: width - 100 }
  );

  // Footer
  page3.drawText(T.lastUpdated, { x: 50, y: 60, size: 8, font: helv, color: GRAY_LIGHT });
  page3.drawText(T.sources, { x: 50, y: 48, size: 8, font: helv, color: GRAY_LIGHT });
  page3.drawText(T.footer, { x: 50, y: 30, size: 7, font: helvOblique, color: GRAY_MID });
  page3.drawText(`${T.page} 3`, { x: width - 80, y: 30, size: 8, font: helv, color: GRAY_MID });

  return pdfDoc.save();
}

const VALID_ROLES = new Set<RoleKey>([
  'ai_ml','llm','data','backend','frontend','fullstack',
  'devops','product','data_eng','eng_manager',
]);
const VALID_COUNTRIES = new Set<CountryCode>(['BR','MX','CO','AR','CL']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const role = String(req.query.role || 'backend') as RoleKey;
  const country = String(req.query.country || 'BR') as CountryCode;
  const yearsRaw = parseInt(String(req.query.years || '4'), 10);
  const years = Number.isFinite(yearsRaw) ? Math.max(0, Math.min(40, yearsRaw)) : 4;
  const langParam = String(req.query.lang || 'EN').toUpperCase();
  const lang = (langParam === 'PT' ? 'PT' : langParam === 'ES' ? 'ES' : 'EN') as Lang;

  if (!VALID_ROLES.has(role)) {
    return res.status(400).send(`Invalid role: ${role}`);
  }
  if (!VALID_COUNTRIES.has(country)) {
    return res.status(400).send(`Invalid country: ${country}`);
  }

  try {
    const pdfBytes = await buildPdf({ role, country, years, lang });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="latam-intel-${role}-${country}-${years}y-${lang}.pdf"`);
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.status(200).send(Buffer.from(pdfBytes));
  } catch (e: any) {
    console.error('PDF generation failed:', e);
    res.status(500).json({ error: 'PDF generation failed', detail: e?.message });
  }
}
