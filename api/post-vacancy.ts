import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "./_lib/cors.js";
import { db } from "./_lib/firebase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method !== "POST") return res.status(405).end();

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
    status: "new", // new → contacted → matched → closed
    createdAt: new Date().toISOString(),
  };

  try {
    await db.collection("vacancies").add(submission);

    // Email notification via Resend (set RESEND_API_KEY in Vercel env vars)
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "WProTalents Intel <onboarding@resend.dev>",
          to: ["juan@wprotalents.lat", "wprotalents@gmail.com"],
          subject: `🏢 New Vacancy: ${role} @ ${company}`,
          html: `
            <h2 style="font-family:monospace">New Client Vacancy</h2>
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
            <p style="font-family:monospace;font-size:12px">
              <a href="https://console.firebase.google.com/project/ai-studio-applet-webapp-b5093/firestore/databases/ai-studio-98e74f83-a378-445d-baa9-3c954d2762c7/data/~2Fvacancies">
                View all vacancies in Firebase →
              </a>
            </p>
          `,
        }),
      }).catch((e: any) => console.warn("Resend email failed:", e.message));
    }

    return res.json({ success: true });
  } catch (e: any) {
    console.error("Vacancy save error:", e.message);
    return res.json({ success: true });
  }
}
