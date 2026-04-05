import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "./_lib/cors.js";

// Region detection only — no title filter, let frontend search/filter
const LATAM = /latin america|latam|brazil|brasil|mexico|colombia|argentina|chile|peru|ecuador|uruguay|costa rica|panama|bogot|lima|santiago|buenos aires|são paulo|remote.*latam/i;
const EU = /europe|eu |uk|united kingdom|germany|france|spain|netherlands|portugal|italy|ireland|sweden|poland|denmark|austria|belgium|switzerland|norway|finland/i;
const USA = /usa|united states|us only|north america|canada|new york|san francisco|seattle|austin|chicago|boston|remote.*us\b|\bus remote/i;

function region(loc: string) {
  if (LATAM.test(loc)) return "LATAM";
  if (EU.test(loc))    return "Europe";
  if (USA.test(loc))   return "USA";
  return "Worldwide";
}

// Fetch with per-source timeout so one slow API can't kill the whole request
function timed(url: string, opts: RequestInit = {}, ms = 12000): Promise<Response> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(id));
}

// ── Sources ────────────────────────────────────────────────────────────────────

async function remotive(): Promise<any[]> {
  // All categories in parallel — Remotive is reliable and fast
  const cats = ["software-dev","devops-sysadmin","data","product","design","finance-legal","marketing","all-other"];
  const results = await Promise.allSettled(
    cats.map(c => timed(`https://remotive.com/api/remote-jobs?category=${c}&limit=100`).then(r => r.json()))
  );
  const jobs: any[] = [];
  for (const r of results) {
    if (r.status === "fulfilled" && Array.isArray(r.value?.jobs)) jobs.push(...r.value.jobs);
  }
  return jobs.map(j => ({
    id: `remotive-${j.id}`,
    title: j.title,
    company: j.company_name,
    location: j.candidate_required_location || "Remote",
    url: j.url,
    salary: j.salary || null,
    tags: (j.tags || []).join(", "),
    source: "Remotive",
    region: region(j.candidate_required_location || ""),
    postedAt: j.publication_date,
  }));
}

async function arbeitnow(): Promise<any[]> {
  // EU-focused job board, paginate 3 pages (~60 jobs)
  const pages = await Promise.allSettled(
    [1,2,3].map(p => timed(`https://www.arbeitnow.com/api/job-board-api?page=${p}`).then(r => r.json()))
  );
  const jobs: any[] = [];
  for (const p of pages) {
    if (p.status === "fulfilled" && Array.isArray(p.value?.data)) jobs.push(...p.value.data);
  }
  return jobs.map(j => ({
    id: `arbeitnow-${j.slug}`,
    title: j.title,
    company: j.company_name,
    location: j.location || "Europe",
    url: j.url,
    salary: null,
    tags: (j.tags || []).join(", "),
    source: "Arbeitnow",
    region: j.remote ? region(j.location || "") : "Europe",
    postedAt: j.created_at ? new Date(j.created_at * 1000).toISOString() : null,
  }));
}

async function remoteok(): Promise<any[]> {
  try {
    const r = await timed("https://remoteok.com/api", { headers: { "User-Agent": "Mozilla/5.0" } });
    const data = await r.json() as any[];
    return (Array.isArray(data) ? data : [])
      .filter(j => j.id && j.position)
      .map(j => ({
        id: `remoteok-${j.id}`,
        title: j.position,
        company: j.company || "Unknown",
        location: j.location || "Remote",
        url: j.url || `https://remoteok.com/remote-jobs/${j.id}`,
        salary: j.salary || null,
        tags: (j.tags || []).join(", "),
        source: "RemoteOK",
        region: region(j.location || ""),
        postedAt: j.date || null,
      }));
  } catch { return []; }
}

async function jobicy(): Promise<any[]> {
  try {
    const r = await timed("https://jobicy.com/api/v2/remote-jobs?count=100");
    const data = await r.json() as any;
    return (data.jobs || []).map((j: any) => ({
      id: `jobicy-${j.id}`,
      title: j.jobTitle,
      company: j.companyName,
      location: j.jobGeo || "Remote",
      url: j.url,
      salary: j.annualSalaryMin ? `$${Math.round(j.annualSalaryMin/1000)}k–$${Math.round(j.annualSalaryMax/1000)}k` : null,
      tags: (j.jobIndustry || []).join(", "),
      source: "Jobicy",
      region: region(j.jobGeo || ""),
      postedAt: j.pubDate || null,
    }));
  } catch { return []; }
}

async function themuse(): Promise<any[]> {
  // The Muse has a large free public API — no key needed for basic access
  try {
    const pages = await Promise.allSettled(
      [1,2,3,4,5].map(p => timed(`https://www.themuse.com/api/public/jobs?page=${p}&api_key=test`).then(r => r.json()))
    );
    const jobs: any[] = [];
    for (const p of pages) {
      if (p.status === "fulfilled" && Array.isArray(p.value?.results)) jobs.push(...p.value.results);
    }
    return jobs.map(j => ({
      id: `muse-${j.id}`,
      title: j.name,
      company: j.company?.name || "Unknown",
      location: j.locations?.map((l: any) => l.name).join(", ") || "Remote",
      url: j.refs?.landing_page || `https://www.themuse.com/jobs/${j.id}`,
      salary: null,
      tags: j.categories?.map((c: any) => c.name).join(", ") || "",
      source: "The Muse",
      region: region(j.locations?.map((l: any) => l.name).join(" ") || ""),
      postedAt: j.publication_date || null,
    }));
  } catch { return []; }
}

// ── Handler ────────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const [r1, r2, r3, r4, r5] = await Promise.allSettled([
    remotive(),
    arbeitnow(),
    remoteok(),
    jobicy(),
    themuse(),
  ]);

  const all = [
    ...(r1.status === "fulfilled" ? r1.value : []),
    ...(r2.status === "fulfilled" ? r2.value : []),
    ...(r3.status === "fulfilled" ? r3.value : []),
    ...(r4.status === "fulfilled" ? r4.value : []),
    ...(r5.status === "fulfilled" ? r5.value : []),
  ];

  // Deduplicate by title+company
  const seen = new Set<string>();
  const unique = all.filter(j => {
    const key = `${(j.title||"").toLowerCase().trim()}|${(j.company||"").toLowerCase().trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort newest first
  unique.sort((a, b) => {
    const da = a.postedAt ? new Date(a.postedAt).getTime() : 0;
    const db = b.postedAt ? new Date(b.postedAt).getTime() : 0;
    return db - da;
  });

  // 30 min edge cache, 15 min stale-while-revalidate
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=900");
  res.json(unique);
}
