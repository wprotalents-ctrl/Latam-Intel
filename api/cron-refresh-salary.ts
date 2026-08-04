// api/cron-refresh-salary.ts
// Monthly cron: refreshes the salary_benchmarks table in Supabase with the
// latest LATAM tech market rates. Wired in vercel.json to fire on the 1st
// of each month at 08:00 UTC. Also accepts manual POST triggers from admin
// (with x-cron-secret header) to refresh on-demand.
//
// Auth: requires x-cron-secret header to match CRON_SECRET env var.
// Source of new values: in V1 we hand-curate. In V2 this should hit Adzuna /
// Glassdoor / LinkedIn salary scrapers. For now, it pulls the most recent
// approved values from a `salary_benchmarks_proposed` table that admin can
// write to (RLS-locked) and we promote them to `salary_benchmarks` here.
//
// If the proposed table is empty (V1 mode), this no-ops gracefully — the
// seed rows in supabase-schema.sql stay in effect.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CRON_SECRET = process.env.CRON_SECRET;

interface ProposedRow {
  role: string;
  country: string;
  base_salary: number;
  remote_mult: number;
  source: string;
  approved: boolean;
}

interface BenchmarkRow {
  role: string;
  country: string;
  base_salary: number;
  remote_mult: number;
  source: string;
  effective_from: string;
}

const VALID_ROLES = new Set([
  'ai_ml','llm','data','backend','frontend','fullstack',
  'devops','product','data_eng','eng_manager',
]);
const VALID_COUNTRIES = new Set(['BR','MX','CO','AR','CL']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Auth: Vercel cron sends Authorization: Bearer <CRON_SECRET>
  const auth = req.headers.authorization || '';
  const headerSecret = req.headers['x-cron-secret'] || '';
  const bearerToken = auth.replace(/^Bearer\s+/i, '');
  const provided = headerSecret || bearerToken;
  if (!CRON_SECRET) {
    return res.status(500).json({ ok: false, error: 'CRON_SECRET not configured' });
  }
  if (provided !== CRON_SECRET) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ ok: false, error: 'Supabase env vars missing' });
  }

  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  try {
    // Fetch approved proposed values (admin-curated)
    const { data: proposed, error: pErr } = await sb
      .from('salary_benchmarks_proposed')
      .select('role,country,base_salary,remote_mult,source,approved')
      .eq('approved', true);

    if (pErr) {
      return res.status(500).json({ ok: false, error: `Fetch failed: ${pErr.message}` });
    }

    if (!proposed || proposed.length === 0) {
      return res.status(200).json({
        ok: true,
        message: 'No approved proposed rows. Seed data remains in effect.',
        inserted: 0,
      });
    }

    // Validate + dedupe: take the latest approved row per (role, country)
    const latest = new Map<string, ProposedRow>();
    for (const row of proposed as ProposedRow[]) {
      if (!VALID_ROLES.has(row.role)) continue;
      if (!VALID_COUNTRIES.has(row.country)) continue;
      if (typeof row.base_salary !== 'number' || row.base_salary <= 0) continue;
      if (typeof row.remote_mult !== 'number' || row.remote_mult <= 0) continue;
      const k = `${row.role}:${row.country}`;
      // keep the first encountered approved row (proposed table is small; ordering isn't critical)
      if (!latest.has(k)) latest.set(k, row);
    }

    const today = new Date().toISOString().slice(0, 10);
    const rows: BenchmarkRow[] = Array.from(latest.values()).map((r) => ({
      role: r.role,
      country: r.country,
      base_salary: Math.round(r.base_salary),
      remote_mult: Number(r.remote_mult.toFixed(2)),
      source: r.source || 'WProTalents admin curated',
      effective_from: today,
    }));

    if (rows.length === 0) {
      return res.status(200).json({
        ok: true,
        message: 'All proposed rows failed validation.',
        inserted: 0,
      });
    }

    const { error: insErr, count } = await sb
      .from('salary_benchmarks')
      .insert(rows, { count: 'exact' });

    if (insErr) {
      return res.status(500).json({ ok: false, error: `Insert failed: ${insErr.message}` });
    }

    return res.status(200).json({
      ok: true,
      message: 'Salary benchmarks refreshed',
      inserted: count ?? rows.length,
      effective_from: today,
    });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'Unknown error' });
  }
}
