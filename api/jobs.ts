// api/jobs.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

// ---------- Helper: region detection ----------
function region(location: string): 'LATAM' | 'USA' | 'Europe' | 'Worldwide' {
  const loc = location.toLowerCase();
  if (loc.includes('brazil') || loc.includes('mexico') || loc.includes('colombia') || loc.includes('argentina') || loc.includes('chile') || loc.includes('peru') || loc.includes('latam')) return 'LATAM';
  if (loc.includes('us') || loc.includes('usa') || loc.includes('united states') || loc.includes('new york') || loc.includes('california') || loc.includes('texas') || loc.includes('miami')) return 'USA';
  if (loc.includes('uk') || loc.includes('germany') || loc.includes('france') || loc.includes('spain') || loc.includes('netherlands') || loc.includes('europe')) return 'Europe';
  return 'Worldwide';
}

// ---------- Helper: fetch with timeout ----------
const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
};

async function timed(url: string, options?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: { ...BROWSER_HEADERS, ...(options?.headers || {}) }
    });
    clearTimeout(timeout);
    return res;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

// Source health tracking — lets the UI show meaningful errors instead of "0 roles"
interface SourceHealth {
  name: string;
  status: 'ok' | 'empty' | 'error' | 'no-key';
  count: number;
  error?: string;
}

// ---------- Job sources ----------

// 1. Remotive (remote tech jobs)
async function remotive(): Promise<{ jobs: any[]; health: SourceHealth }> {
  try {
    const r = await timed('https://remotive.com/api/remote-jobs?limit=50');
    if (!r.ok) {
      return { jobs: [], health: { name: 'Remotive', status: 'error', count: 0, error: `HTTP ${r.status}` } };
    }
    const data = await r.json();
    const jobs = (data.jobs || []).map((j: any) => ({
      id: `remotive-${j.id}`,
      title: j.title,
      company: j.company_name,
      location: j.candidate_required_location || 'Remote',
      url: j.url,
      salary: j.salary || null,
      tags: j.category,
      source: 'Remotive',
      region: region(j.candidate_required_location || 'Remote'),
      postedAt: j.publication_date,
    }));
    return { jobs, health: { name: 'Remotive', status: jobs.length ? 'ok' : 'empty', count: jobs.length } };
  } catch (e: any) {
    return { jobs: [], health: { name: 'Remotive', status: 'error', count: 0, error: e?.message || 'fetch failed' } };
  }
}

// 2. Arbeitnow (developer jobs)
async function arbeitnow(): Promise<{ jobs: any[]; health: SourceHealth }> {
  try {
    const r = await timed('https://www.arbeitnow.com/api/job-board-api');
    if (!r.ok) {
      return { jobs: [], health: { name: 'Arbeitnow', status: 'error', count: 0, error: `HTTP ${r.status}` } };
    }
    const data = await r.json();
    const jobs = (data.data || []).map((j: any) => ({
      id: `arbeitnow-${j.slug}`,
      title: j.title,
      company: j.company_name,
      location: j.location || 'Remote',
      url: j.url,
      salary: null,
      tags: j.tags?.join(', ') || '',
      source: 'Arbeitnow',
      region: region(j.location || 'Remote'),
      postedAt: j.created_at,
    }));
    return { jobs, health: { name: 'Arbeitnow', status: jobs.length ? 'ok' : 'empty', count: jobs.length } };
  } catch (e: any) {
    return { jobs: [], health: { name: 'Arbeitnow', status: 'error', count: 0, error: e?.message || 'fetch failed' } };
  }
}

// 3. Jobicy (remote jobs, free, no key) — primary fallback for the free sources
async function jobicy(): Promise<{ jobs: any[]; health: SourceHealth }> {
  try {
    const r = await timed('https://jobicy.com/api/v2/remote-jobs?count=50');
    if (!r.ok) {
      return { jobs: [], health: { name: 'Jobicy', status: 'error', count: 0, error: `HTTP ${r.status}` } };
    }
    const data = await r.json();
    const jobs = (data.jobs || []).map((j: any) => ({
      id: `jobicy-${j.id}`,
      title: j.jobTitle,
      company: j.companyName,
      location: 'Remote',
      url: j.url,
      salary: j.salary ? `${j.salaryCurrency} ${j.salaryMin}–${j.salaryMax}` : null,
      tags: j.tags?.join(', ') || '',
      source: 'Jobicy',
      region: 'Worldwide',
      postedAt: j.publishedDate,
    }));
    return { jobs, health: { name: 'Jobicy', status: jobs.length ? 'ok' : 'empty', count: jobs.length } };
  } catch (e: any) {
    return { jobs: [], health: { name: 'Jobicy', status: 'error', count: 0, error: e?.message || 'fetch failed' } };
  }
}

// 4. The Muse (requires API key, but they have a free tier)
async function themuse(): Promise<{ jobs: any[]; health: SourceHealth }> {
  const apiKey = process.env.THE_MUSE_API_KEY;
  if (!apiKey) {
    return { jobs: [], health: { name: 'The Muse', status: 'no-key', count: 0, error: 'THE_MUSE_API_KEY not set' } };
  }
  try {
    const r = await timed(`https://www.themuse.com/api/public/jobs?page=1&api_key=${apiKey}`);
    if (!r.ok) {
      return { jobs: [], health: { name: 'The Muse', status: 'error', count: 0, error: `HTTP ${r.status}` } };
    }
    const data = await r.json();
    const jobs = (data.results || []).map((j: any) => ({
      id: `muse-${j.id}`,
      title: j.name,
      company: j.company?.name || 'Unknown',
      location: j.locations?.map((l: any) => l.name).join(', ') || 'Remote',
      url: j.refs?.landing_page,
      salary: null,
      tags: j.levels?.join(', ') || '',
      source: 'The Muse',
      region: region(j.locations?.map((l: any) => l.name).join(', ') || 'Remote'),
      postedAt: j.publication_date,
    }));
    return { jobs, health: { name: 'The Muse', status: jobs.length ? 'ok' : 'empty', count: jobs.length } };
  } catch (e: any) {
    return { jobs: [], health: { name: 'The Muse', status: 'error', count: 0, error: e?.message || 'fetch failed' } };
  }
}

// 5. Adzuna – uses ADZUNA_APP_ID and ADZUNA_APP_KEY (set in Vercel)
async function adzuna(): Promise<{ jobs: any[]; health: SourceHealth }> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) {
    return { jobs: [], health: { name: 'Adzuna', status: 'no-key', count: 0, error: 'ADZUNA_APP_ID or ADZUNA_APP_KEY not set' } };
  }
  try {
    const countries = [
      { code: 'us', query: 'software engineer remote' },
      { code: 'gb', query: 'software engineer remote' },
      { code: 'br', query: 'desenvolvedor remote' },
    ];
    const results = await Promise.allSettled(
      countries.map(c =>
        timed(`https://api.adzuna.com/v1/api/jobs/${c.code}/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=50&what=${encodeURIComponent(c.query)}&content_type=application/json`)
          .then(r => r.json())
      )
    );
    const jobs: any[] = [];
    for (const r of results) {
      if (r.status === 'fulfilled') jobs.push(...(r.value?.results || []));
    }
    const mapped = jobs.map((j: any) => ({
      id: `adzuna-${j.id}`,
      title: j.title,
      company: j.company?.display_name || 'Unknown',
      location: j.location?.display_name || 'Remote',
      url: j.redirect_url,
      salary: j.salary_min ? `$${Math.round(j.salary_min/1000)}k–$${Math.round((j.salary_max||j.salary_min)/1000)}k` : null,
      tags: j.category?.label || '',
      source: 'Adzuna',
      region: region(j.location?.display_name || 'Remote'),
      postedAt: j.created,
    }));
    return { jobs: mapped, health: { name: 'Adzuna', status: mapped.length ? 'ok' : 'empty', count: mapped.length } };
  } catch (e: any) {
    return { jobs: [], health: { name: 'Adzuna', status: 'error', count: 0, error: e?.message || 'fetch failed' } };
  }
}

// 6. Findwork – requires free API key from findwork.dev
async function findwork(): Promise<{ jobs: any[]; health: SourceHealth }> {
  const apiKey = process.env.FINDWORK_API_KEY;
  if (!apiKey) {
    return { jobs: [], health: { name: 'Findwork', status: 'no-key', count: 0, error: 'FINDWORK_API_KEY not set' } };
  }
  try {
    const r = await timed('https://findwork.dev/api/jobs/?remote=true&limit=100', {
      headers: { Authorization: `Token ${apiKey}` }
    });
    if (!r.ok) {
      return { jobs: [], health: { name: 'Findwork', status: 'error', count: 0, error: `HTTP ${r.status}` } };
    }
    const data = await r.json();
    const jobs = (data.results || []).map((j: any) => ({
      id: `findwork-${j.id}`,
      title: j.role,
      company: j.company_name,
      location: j.location || 'Remote',
      url: j.url,
      salary: null,
      tags: (j.keywords || []).join(', '),
      source: 'Findwork',
      region: region(j.location || 'Remote'),
      postedAt: j.date_posted,
    }));
    return { jobs, health: { name: 'Findwork', status: jobs.length ? 'ok' : 'empty', count: jobs.length } };
  } catch (e: any) {
    return { jobs: [], health: { name: 'Findwork', status: 'error', count: 0, error: e?.message || 'fetch failed' } };
  }
}

// ---------- In‑memory cache (30 minutes) ----------
let cachedJobs: any[] | null = null;
let cachedHealth: SourceHealth[] | null = null;
let cacheTime = 0;
const CACHE_DURATION = 30 * 60 * 1000;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Return cached data if fresh
  if (cachedJobs && Date.now() - cacheTime < CACHE_DURATION) {
    return res.status(200).json({ jobs: cachedJobs, health: cachedHealth, cached: true });
  }

  try {
    // Fetch from all sources concurrently. RemoteOK intentionally excluded — it blocks serverless IPs.
    const [remotiveRes, arbeitnowRes, jobicyRes, themuseRes, adzunaRes, findworkRes] = await Promise.allSettled([
      remotive(),
      arbeitnow(),
      jobicy(),
      themuse(),
      adzuna(),
      findwork(),
    ]);

    const allJobs: any[] = [];
    const health: SourceHealth[] = [];
    const collect = (result: PromiseSettledResult<{ jobs: any[]; health: SourceHealth }>) => {
      if (result.status === 'fulfilled' && result.value) {
        allJobs.push(...result.value.jobs);
        health.push(result.value.health);
      } else {
        health.push({ name: 'unknown', status: 'error', count: 0, error: result.status === 'rejected' ? String(result.reason) : 'unknown' });
      }
    };

    collect(remotiveRes);
    collect(arbeitnowRes);
    collect(jobicyRes);
    collect(themuseRes);
    collect(adzunaRes);
    collect(findworkRes);

    // Remove duplicates by id
    const unique = Array.from(new Map(allJobs.map(job => [job.id, job])).values());
    // Sort by date (newest first)
    unique.sort((a, b) => (b.postedAt || '').localeCompare(a.postedAt || ''));

    console.log(`[jobs] aggregated ${unique.length} jobs`, JSON.stringify(health));

    // Update cache
    cachedJobs = unique;
    cachedHealth = health;
    cacheTime = Date.now();

    return res.status(200).json({ jobs: unique, health, cached: false });
  } catch (error: any) {
    console.error('Job aggregation error:', error);
    // Serve stale cache rather than error
    if (cachedJobs) {
      return res.status(200).json({ jobs: cachedJobs, health: cachedHealth, cached: true, stale: true });
    }
    // Return empty array with error info — never 500 to the client
    return res.status(200).json({
      jobs: [],
      health: [{ name: 'aggregator', status: 'error', count: 0, error: error?.message || 'unknown' }],
      cached: false,
    });
  }
}

