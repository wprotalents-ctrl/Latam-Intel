// api/submissions.ts — consolidated: post-vacancy + save-job-post + linkedin-boost
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "./_lib/cors.js";
import { db } from "./_lib/firebase.js";

// ── Shared: send Resend email ───────────────────────────────────────────────
function sendNotification(subject: string, html: string) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;
  fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "WProTalents Intel <onboarding@resend.dev>",
      to: ["juan@wprotalents.lat", "wprotalents@gmail.com"],
      subject,
      html,
    }),
  }).catch((e: any) => console.warn("Resend email failed:", e.message));
}

const FIREBASE_CONSOLE =
  "https://console.firebase.google.com/project/ai-studio-applet-webapp-b5093/firestore/databases/ai-studio-98e74f83-a378-445d-baa9-3c954d2762c7/data";

// ── 1. Post Vacancy ────────────────────────────────────────────────────────
async function handleVacancy(req: VercelRequest, res: VercelResponse) {
  const { company, website, contact, role, skills, experience, budget, jobUrl, description, lang } = req.body;
  if (!company || !contact || !role || !skills) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const submission = {
    company, website: website || null,
    contact, role, skills, experience,
    budget: budget || null,
    jobUrl: jobUrl || null,
    description: description || null,
    lang: lang || "EN",
    status: "new",
    createdAt: new Date().toISOString(),
  };

  try {
    await db.collection("vacancies").add(submission);
    sendNotification(
      `\ud83c\udfe2 New Vacancy: ${role} @ ${company}`,
      `<h2 style="font-family:monospace">New Client Vacancy</h2>
      <table style="font-family:monospace;font-size:13px;border-collapse:collapse">
        <tr><td style="padding:4px 12px 4px 0;color:#666">Company</td><td><strong>${company}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Website</td><td>${website || "N/A"}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Contact</td><td>${contact}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Role</td><td>${role}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Seniority</td><td>${experience}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Skills</td><td>${skills}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Budget</td><td>${budget || "Not specified"}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Job URL</td><td>${jobUrl || "N/A"}</td></tr>
      </table>
      ${description ? `<hr style="margin:16px 0"/><h3 style="font-family:monospace">Description</h3><p style="font-family:monospace;font-size:12px">${description}</p>` : ""}
      <hr style="margin:16px 0"/>
      <p style="font-family:monospace;font-size:12px"><a href="${FIREBASE_CONSOLE}/~2Fvacancies">View all vacancies in Firebase \u2192</a></p>`,
    );
    return res.json({ success: true });
  } catch (e: any) {
    console.error("Vacancy save error:", e.message);
    return res.json({ success: true });
  }
}

// ── 2. Save Job Post ────────────────────────────────────────────────────────
async function handleJobPost(req: VercelRequest, res: VercelResponse) {
  const { role, seniority, country, salary, description, planType, companyEmail } = req.body as {
    role?: string; seniority?: string; country?: string; salary?: number;
    description?: string; planType?: string; companyEmail?: string;
  };
  if (!role || !planType) {
    return res.status(400).json({ error: "role and planType are required" });
  }

  try {
    const docRef = await db.collection('jobPosts').add({
      role, seniority: seniority ?? 'mid', country: country ?? 'Any LATAM',
      salary: salary ?? null, description: description ?? '',
      planType, companyEmail: companyEmail ?? null,
      status: 'active', createdAt: new Date().toISOString(),
    });

    sendNotification(
      `\ud83c\udfe2 New ${String(planType).toUpperCase()} Job Post \u2014 ${role}`,
      `<h2 style="font-family:monospace">New Client Job Post</h2>
      <table style="font-family:monospace;font-size:13px;border-collapse:collapse">
        <tr><td style="padding:4px 12px 4px 0;color:#666">Plan Type</td><td><strong>${String(planType).toUpperCase()}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Role</td><td><strong>${role}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Seniority</td><td>${seniority ?? 'mid'}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Country</td><td>${country ?? 'Any LATAM'}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Salary</td><td>${salary ? `$${salary.toLocaleString()}` : 'Open'}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Company Email</td><td>${companyEmail ?? 'Not provided'}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Firestore ID</td><td style="color:#999;font-size:11px">${docRef.id}</td></tr>
      </table>
      ${description ? `<hr style="margin:16px 0"/><h3 style="font-family:monospace">Description</h3><p style="font-family:monospace;font-size:12px;white-space:pre-wrap">${description}</p>` : ''}
      <hr style="margin:16px 0"/>
      <p style="font-family:monospace;font-size:12px"><a href="${FIREBASE_CONSOLE}/~2FjobPosts">View all job posts in Firebase \u2192</a></p>`,
    );

    return res.status(200).json({ success: true, id: docRef.id });
  } catch (err) {
    console.error('save-job-post error:', err);
    return res.status(500).json({ error: 'Failed to save job post' });
  }
}

// ── 3. LinkedIn Boost ──────────────────────────────────────────────────────
async function handleLinkedInBoost(req: VercelRequest, res: VercelResponse) {
  const { name, role, skills, experience, availability, salary, contact, generatedPost, lang } = req.body;
  if (!name || !role || !skills || !contact) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const submission = {
    name, role, skills, experience, availability,
    salary: salary || null, contact, generatedPost,
    lang: lang || "EN", status: "pending",
    createdAt: new Date().toISOString(),
  };

  try {
    await db.collection("linkedin_boosts").add(submission);
    sendNotification(
      `\ud83d\udd25 New Talent Pool: ${name} \u2014 ${role}`,
      `<h2 style="font-family:monospace">New Talent Pool Submission</h2>
      <table style="font-family:monospace;font-size:13px;border-collapse:collapse">
        <tr><td style="padding:4px 12px 4px 0;color:#666">Name</td><td><strong>${name}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Role</td><td>${role}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Skills</td><td>${skills}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Experience</td><td>${experience} years</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Availability</td><td>${availability}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Salary</td><td>${salary || "Not specified"}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Contact</td><td>${contact}</td></tr>
      </table>
      <hr style="margin:16px 0"/>
      <h3 style="font-family:monospace">Generated LinkedIn Post</h3>
      <pre style="background:#f5f5f5;padding:12px;font-size:12px;white-space:pre-wrap">${generatedPost}</pre>
      <hr style="margin:16px 0"/>
      <p style="font-family:monospace;font-size:12px"><a href="${FIREBASE_CONSOLE}/~2Flinkedin_boosts">View all submissions in Firebase \u2192</a></p>`,
    );
    return res.json({ success: true });
  } catch (e: any) {
    console.error("LinkedIn boost save error:", e.message);
    return res.json({ success: true });
  }
}

// ── Dispatcher ──────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method !== "POST") return res.status(405).end();

  const action = (req.query.action as string) || req.body?.action;

  switch (action) {
    case "vacancy":       return await handleVacancy(req, res);
    case "job-post":      return await handleJobPost(req, res);
    case "linkedin-boost": return await handleLinkedInBoost(req, res);
    default: return res.status(400).json({ error: 'Use ?action=vacancy, job-post, or linkedin-boost' });
  }
}
