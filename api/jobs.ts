import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "./_lib/cors.js";

const AI_TERMS = /ai|machine learning|llm|ml engineer|data scientist|nlp|deep learning|generative|gpt|computer vision|data engineer|backend|fullstack|full.stack|frontend|software engineer|cloud|devops|python|react|node/i;

const LATAM_TERMS = /latin america|latam|brazil|brasil|mexico|méxico|colombia|argentina|chile|peru|perú|ecuador|uruguay|costa rica|panama/i;
const EU_TERMS = /europe|eu |uk|united kingdom|germany|france|spain|netherlands|portugal|italy|ireland|sweden|poland/i;
const USA_TERMS = /usa|united states|us only|north america|canada|\bus\b/i;

function detectRegion(location: string): string {
  const l = location.toLowerCase();
  if (LATAM_TERMS.test(l)) return "LATAM";
  if (EU_TERMS.test(l)) return "Europe";
  if (USA_TERMS.test(l)) return "USA";
  return "Worldwide";
}

async function fetchRemotive() {
  try {
    const res = await fetch("https://remotive.com/api/remote-jobs?limit=100");
    const data = await res.json() as any;
    return (data.jobs || [])
      .filter((j: any) => AI_TERMS.test(j.title + " " + (j.category || "")))
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
      .filter((j: any) => AI_TERMS.test(j.position + " " + (j.tags || []).join(" ")))
      .slice(0, 50)
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
    const res = await fetch("https://www.arbeitnow.com/api/job-board-api");
    const data = await res.json() as any;
    return (data.data || [])
      .filter((j: any) => AI_TERMS.test(j.title + " " + (j.tags || []).join(" ")))
      .slice(0, 50)
      .map((j: any) => ({
        id: `arbeitnow-${j.slug}`,
        title: j.title,
        company: j.company_name,
        location: j.location || "Remote",
        url: j.url,
        salary: null,
        source: "Arbeitnow",
        region: j.remote ? detectRegion(j.location || "") : "Europe",
        postedAt: new Date(j.created_at * 1000).toISOString(),
      }));
  } catch { return []; }
}

async function fetchHimalayas() {
  try {
    const res = await fetch("https://himalayas.app/jobs/api?limit=50");
    const data = await res.json() as any;
    return (data.jobs || [])
      .filter((j: any) => AI_TERMS.test(j.title + " " + (j.categories || []).join(" ")))
      .map((j: any) => ({
        id: `himalayas-${j.slug || j.id}`,
        title: j.title,
        company: j.companyName || j.company?.name || "Unknown",
        location: Array.isArray(j.locationRestrictions) ? j.locationRestrictions.join(", ") : "Remote",
        url: `https://himalayas.app/jobs/${j.slug || j.id}`,
        salary: j.salaryMin ? `${j.salaryMin}–${j.salaryMax || "?"}K ${j.salaryCurrencyCode || "USD"}` : null,
        source: "Himalayas",
        region: detectRegion(Array.isArray(j.locationRestrictions) ? j.locationRestrictions.join(" ") : "worldwide"),
        postedAt: j.createdAt,
      }));
  } catch { return []; }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method !== "GET") return res.status(405).end();

  const [r1, r2, r3, r4] = await Promise.allSettled([
    fetchRemotive(), fetchRemoteOK(), fetchArbeitnow(), fetchHimalayas()
  ]);

  const all = [
    ...(r1.status === "fulfilled" ? r1.value : []),
    ...(r2.status === "fulfilled" ? r2.value : []),
    ...(r3.status === "fulfilled" ? r3.value : []),
    ...(r4.status === "fulfilled" ? r4.value : []),
  ];

  // Deduplicate by title+company
  const seen = new Set<string>();
  const unique = all.filter((j) => {
    const key = `${j.title}|${j.company}`.toLowerCase();
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

  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=7200");
  res.json(unique);
}
