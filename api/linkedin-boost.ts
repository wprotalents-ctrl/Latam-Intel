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

    // Email Juan via simple fetch to a mailto-style service or just log
    // Using a simple fetch to an email API if configured, otherwise just save
    const emailEndpoint = process.env.NOTIFICATION_EMAIL_ENDPOINT;
    if (emailEndpoint) {
      await fetch(emailEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "juancarlosmolinadussan@gmail.com",
          subject: `🔥 New LinkedIn Boost: ${name} — ${role}`,
          text: `New candidate boost request:\n\nName: ${name}\nRole: ${role}\nSkills: ${skills}\nExperience: ${experience} years\nAvailability: ${availability}\nSalary: ${salary || "Not specified"}\nContact: ${contact}\n\n---\nGENERATED POST:\n\n${generatedPost}`,
        }),
      }).catch(() => {});
    }

    return res.json({ success: true });
  } catch (e: any) {
    // Even if Firestore fails, return success to user — log the error
    console.error("LinkedIn boost save error:", e.message);
    return res.json({ success: true });
  }
}
