import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "./_lib/cors.js";
import { db } from "./_lib/firebase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (req.method !== "POST") return res.status(405).end();

  const { name, role, skills, experience, availability, salary, contact, generatedPost, lang } = req.body;

  if (!name || !role || !skills || !contact) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const submission = {
    name, role, skills, experience, availability,
    salary: salary || null,
    contact, generatedPost, lang: lang || "EN",
    status: "pending", // pending → posted → done
    createdAt: new Date().toISOString(),
  };

  try {
    // Save to Firestore so Juan can see all pending submissions in one place
    await db.collection("linkedin_boosts").add(submission);

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
          subject: `🔥 New Talent Pool: ${name} — ${role}`,
          html: `
            <h2 style="font-family:monospace">New Talent Pool Submission</h2>
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
            <p style="font-family:monospace;font-size:12px">
              <a href="https://console.firebase.google.com/project/ai-studio-applet-webapp-b5093/firestore/databases/ai-studio-98e74f83-a378-445d-baa9-3c954d2762c7/data/~2Flinkedin_boosts">
                View all submissions in Firebase →
              </a>
            </p>
          `,
        }),
      }).catch((e: any) => console.warn("Resend email failed:", e.message));
    }

    return res.json({ success: true });
  } catch (e: any) {
    // Even if Firestore fails, return success to user — log the error
    console.error("LinkedIn boost save error:", e.message);
    return res.json({ success: true });
  }
}
