// api/og/salary.ts
// OG image endpoint — returns the share-my-salary SVG so that when a shared
// link is pasted into LinkedIn / X / WhatsApp, the platform fetches this
// image as the preview thumbnail.
//
// Usage: <meta property="og:image" content="https://intel.wprotalents.lat/api/og/salary?role=ai_ml&country=BR&years=7&lang=EN" />
//
// We return SVG (not PNG) for two reasons:
//   1. SVG is much smaller (~3KB vs ~50KB PNG) — better CDN cache
//   2. No headless browser / canvas needed — pure function call
// Most modern social platforms support SVG OG previews. For the rare
// platform that doesn't, the React component in the modal offers a
// manual PNG download.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { renderShareSvg, type RoleKey, type CountryCode } from '../../src/lib/shareSalaryCard';

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
  const lang = (langParam === 'PT' ? 'PT' : langParam === 'ES' ? 'ES' : 'EN') as 'EN' | 'ES' | 'PT';

  if (!VALID_ROLES.has(role)) {
    return res.status(400).send(`Invalid role: ${role}. Use one of: ${[...VALID_ROLES].join(', ')}`);
  }
  if (!VALID_COUNTRIES.has(country)) {
    return res.status(400).send(`Invalid country: ${country}. Use one of: ${[...VALID_COUNTRIES].join(', ')}`);
  }

  const svg = renderShareSvg({ role, country, yearsExp: years, lang });

  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  // Cache aggressively — the SVG is fully derived from the query string,
  // so 1-day cache + stale-while-revalidate is safe.
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800');
  res.status(200).send(svg);
}
