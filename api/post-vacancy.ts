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

    const emailEndpoint = process.env.NOTIFICATION_EMAIL_ENDPOINT;
    if (emailEndpoint) {
      await fetch(emailEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "juancarlosmolinadussan@gmail.com",
          subject: `🏢 New Vacancy: ${role} @ ${company}`,
          text: `New client vacancy submission:\n\nCompany: ${company}\nWebsite: ${website || "N/A"}\nContact: ${contact}\nRole: ${role}\nSeniority: ${experience}\nSkills: ${skills}\nBudget: ${budget || "Not specified"}\nJob URL: ${jobUrl || "N/A"}\n\nDescription:\n${description || "N/A"}`,
        }),
      }).catch(() => {});
    }

    return res.json({ success: true });
  } catch (e: any) {
    console.error("Vacancy save error:", e.message);
    return res.json({ success: true });
  }
}
