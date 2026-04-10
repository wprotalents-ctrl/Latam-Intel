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
async function timed(url: string, options?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeout);
    return res;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

// ---------- Job sources ----------

// 1. Remotive (remote tech jobs)
async function remotive(): Promise<any[]> {
  try {
    const r = await timed('https://remotive.com/api/remote-jobs?limit=50');
    const data = await r.json();
    return (data.jobs || []).map((j: any) => ({
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
  } catch { return []; }
}

// 2. Arbeitnow (developer jobs)
async function arbeitnow(): Promise<any[]> {
  try {
    const r = await timed('https://www.arbeitnow.com/api/job-board-api');
    const data = await r.json();
    return (data.data || []).map((j: any) => ({
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
  } catch { return []; }
}

// 3. RemoteOK (remote developer jobs)
async function remoteok(): Promise<any[]> {
  try {
    const r = await timed('https://remoteok.com/api');
    const data = await r.json();
    // first item is a header, skip it
    const jobs = Array.isArray(data) ? data.slice(1) : [];
    return jobs.map((j: any) => ({
      id: `remoteok-${j.id}`,
      title: j.position,
      company: j.company,
      location: j.location || 'Remote',
      url: j.url,
      salary: j.salary_min ? `$${j.salary_min}k–$${j.salary_max}k` : null,
      tags: j.tags?.join(', ') || '',
      source: 'RemoteOK',
      region: region(j.location || 'Remote'),
      postedAt: j.date,
    }));
  } catch { return []; }
}

// 4. Jobicy (remote jobs, free, no key)
async function jobicy(): Promise<any[]> {
  try {
    const r = await timed('https://jobicy.com/api/v2/remote-jobs?count=50');
    const data = await r.json();
    return (data.jobs || []).map((j: any) => ({
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
  } catch { return []; }
}

// 5. The Muse (requires API key, but they have a free tier)
async function themuse(): Promise<any[]> {
  const apiKey = process.env.THE_MUSE_API_KEY;
  if (!apiKey) return [];
  try {
    const r = await timed(`https://www.themuse.com/api/public/jobs?page=1&api_key=${apiKey}`);
    const data = await r.json();
    return (data.results || []).map((j: any) => ({
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
  } catch { return []; }
}

// 6. Adzuna – uses existing ADZUNA_APP_ID and ADZUNA_APP_KEY (set in Vercel)
async function adzuna(): Promise<any[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return [];
  try {
    const countries = [
      { code: 'us', query: 'software engineer remote' },
      { code: 'gb', query: 'software engineer remote' },
      { code: 'br', query: 'desenvolvedor remote' }, // Brazil
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
    return jobs.map((j: any) => ({
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
  } catch { return []; }
}

// 7. Findwork – requires free API key from findwork.dev
async function findwork(): Promise<any[]> {
  const apiKey = process.env.FINDWORK_API_KEY;
  if (!apiKey) return [];
  try {
    const r = await timed('https://findwork.dev/api/jobs/?remote=true&limit=100', {
      headers: { Authorization: `Token ${apiKey}` }
    });
    const data = await r.json();
    return (data.results || []).map((j: any) => ({
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
  } catch { return []; }
}

// ---------- In‑memory cache (30 minutes) ----------
let cachedJobs: any[] | null = null;
let cacheTime = 0;
const CACHE_DURATION = 30 * 60 * 1000;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Return cached data if fresh
  if (cachedJobs && Date.now() - cacheTime < CACHE_DURATION) {
    return res.status(200).json(cachedJobs);
  }

  try {
    // Fetch from all sources concurrently
    const [remotiveRes, arbeitnowRes, remoteokRes, jobicyRes, themuseRes, adzunaRes, findworkRes] = await Promise.allSettled([
      remotive(),
      arbeitnow(),
      remoteok(),
      jobicy(),
      themuse(),
      adzuna(),
      findwork(),
    ]);

    const allJobs: any[] = [];
    const addJobs = (result: PromiseSettledResult<any[]>, sourceName: string) => {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        allJobs.push(...result.value);
      } else {
        console.warn(`${sourceName} failed`);
      }
    };

    addJobs(remotiveRes, 'Remotive');
    addJobs(arbeitnowRes, 'Arbeitnow');
    addJobs(remoteokRes, 'RemoteOK');
    addJobs(jobicyRes, 'Jobicy');
    addJobs(themuseRes, 'The Muse');
    addJobs(adzunaRes, 'Adzuna');
    addJobs(findworkRes, 'Findwork');

    // Remove duplicates by id (simple)
    const unique = Array.from(new Map(allJobs.map(job => [job.id, job])).values());
    // Sort by date (newest first)
    unique.sort((a, b) => (b.postedAt || '').localeCompare(a.postedAt || ''));

    // Update cache
    cachedJobs = unique;
    cacheTime = Date.now();

    return res.status(200).json(unique);
  } catch (error) {
    console.error('Job aggregation error:', error);
    // If we have stale cache, serve it
    if (cachedJobs) return res.status(200).json(cachedJobs);
    return res.status(500).json({ error: 'Failed to fetch jobs' });
  }
}
