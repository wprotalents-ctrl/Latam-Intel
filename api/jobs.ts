import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "./_lib/cors.js";

const TECH_TERMS = /engineer|developer|devops|architect|analyst|scientist|researcher|machine learning|ml |ai |data|cloud|platform|backend|frontend|fullstack|full.stack|software|python|java|react|node|typescript|infrastructure|security|qa |sre|product manager|designer|ux |ui /i;

const LATAM_TERMS = /latin america|latam|brazil|brasil|mexico|méxico|colombia|argentina|chile|peru|perú|ecuador|uruguay|costa rica|panama/i;
const EU_TERMS = /europe|eu |uk|united kingdom|germany|france|spain|netherlands|portugal|italy|ireland|sweden|poland|denmark|austria|belgium/i;
const USA_TERMS = /usa|united states|us only|north america|canada|\bus\b|new york|san francisco|seattle|austin|chicago|boston/i;

function detectRegion(location: string): string {
  const l = location.toLowerCase();
  if (LATAM_TERMS.test(l)) return "LATAM";
  if (EU_TERMS.test(l)) return "Europe";
  if (USA_TERMS.test(l)) return "USA";
  return "Worldwide";
}

async function fetchRemotive() {
  try {
    const categories = ["software-dev", "devops-sysadmin", "data", "product"];
    const results = await Promise.allSettled(
      categories.map(cat =>
        fetch(`https://remotive.com/api/remote-jobs?category=${cat}&limit=50`).then(r => r.json())
      )
    );
    const jobs: any[] = [];
    for (const r of results) {
      if (r.status === "fulfilled" && r.value?.jobs) jobs.push(...r.value.jobs);
    }
    return jobs
      .filter((j: any) => TECH_TERMS.test(j.title + " " + (j.category || "")))
      .map((j: any) => ({
        id: `remotive-${j.id}`,
        title: j.title,
        company: j.company_name,
        location: j.candidate_required_location || "Remote",
        url: j.url,
        salary: j.salary || null,
        source: "Remotive",
        region: detectRegion(j.candidate_required_location || ""),
        postedAt: j.publication_date,
      }));
  } catch { return []; }
}

async function fetchRemoteOK() {
  try {
    const res = await fetch("https://remoteok.com/api", {
      headers: { "User-Agent": "WProTalents Intel/1.0" }
    });
    const raw = await res.json() as any[];
    const data = Array.isArray(raw) ? raw.filter((j) => j.id && j.position) : [];
    return data
      .filter((j: any) => TECH_TERMS.test(j.position + " " + (j.tags || []).join(" ")))
      .slice(0, 100)
      .map((j: any) => ({
        id: `remoteok-${j.id}`,
        title: j.position,
        company: j.company || "Unknown",
        location: j.location || "Remote",
        url: j.url || `https://remoteok.com/remote-jobs/${j.id}`,
        salary: j.salary || null,
        source: "RemoteOK",
        region: detectRegion(j.location || ""),
        postedAt: j.date,
      }));
  } catch { return []; }
}

async function fetchArbeitnow() {
  try {
    const pages = await Promise.allSettled(
      [1, 2, 3, 4, 5].map(p =>
        fetch(`https://www.arbeitnow.com/api/job-board-api?page=${p}`).then(r => r.json())
      )
    );
    const jobs: any[] = [];
    for (const p of pages) {
      if (p.status === "fulfilled" && p.value?.data) jobs.push(...p.value.data);
    }
    return jobs
      .filter((j: any) => TECH_TERMS.test(j.title + " " + (j.tags || []).join(" ")))
      .map((j: any) => ({
        id: `arbeitnow-${j.slug}`,
        title: j.title,
        company: j.company_name,
        location: j.location || "Europe",
        url: j.url,
        salary: null,
        source: "Arbeitnow",
        region: "Europe",
        postedAt: new Date(j.created_at * 1000).toISOString(),
      }));
  } catch { return []; }
}

async function fetchHimalayas() {
  try {
    const res = await fetch("https://himalayas.app/jobs/api?limit=100");
    const data = await res.json() as any;
    return (data.jobs || [])
      .filter((j: any) => TECH_TERMS.test(j.title + " " + (j.categories || []).join(" ")))
      .map((j: any) => ({
        id: `himalayas-${j.slug || j.id}`,
        title: j.title,
        company: j.companyName || j.company?.name || "Unknown",
        location: (j.locationRestrictions || []).join(", ") || "Remote",
        url: `https://himalayas.app/jobs/${j.slug || j.id}`,
        salary: j.salary || null,
        source: "Himalayas",
        region: detectRegion((j.locationRestrictions || []).join(" ")),
        postedAt: j.createdAt || j.publishedAt,
      }));
  } catch { return []; }
}

async function fetchJobicy() {
  try {
    const res = await fetch("https://jobicy.com/api/v2/remote-jobs?count=100&tag=engineer");
    const data = await res.json() as any;
    return (data.jobs || [])
      .map((j: any) => ({
        id: `jobicy-${j.id}`,
        title: j.jobTitle,
        company: j.companyName,
        location: j.jobGeo || "Remote",
        url: j.url,
        salary: j.annualSalaryMin
          ? `$${Math.round(j.annualSalaryMin / 1000)}k–$${Math.round(j.annualSalaryMax / 1000)}k`
          : null,
        source: "Jobicy",
        region: detectRegion(j.jobGeo || ""),
        postedAt: j.pubDate,
      }));
  } catch { return []; }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const [remotive, remoteok, arbeitnow, himalayas, jobicy] = await Promise.allSettled([
    fetchRemotive(),
    fetchRemoteOK(),
    fetchArbeitnow(),
    fetchHimalayas(),
    fetchJobicy(),
  ]);

  const all = [
    ...(remotive.status === "fulfilled" ? remotive.value : []),
    ...(remoteok.status === "fulfilled" ? remoteok.value : []),
    ...(arbeitnow.status === "fulfilled" ? arbeitnow.value : []),
    ...(himalayas.status === "fulfilled" ? himalayas.value : []),
    ...(jobicy.status === "fulfilled" ? jobicy.value : []),
  ];

  // Deduplicate by title+company
  const seen = new Set<string>();
  const unique = all.filter(j => {
    const key = `${j.title.toLowerCase().trim()}|${j.company.toLowerCase().trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  unique.sort((a, b) => {
    const da = a.postedAt ? new Date(a.postedAt).getTime() : 0;
    const db = b.postedAt ? new Date(b.postedAt).getTime() : 0;
    return db - da;
  });

  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=900");
  res.json(unique);
}
