import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import Stripe from "stripe";
import { Resend } from "resend";
import axios from "axios";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import coinbase from "coinbase-commerce-node";
import { fetchRemotiveJobs } from "./src/services/jobsService";
const { Client, resources } = coinbase;

const app = express();
const PORT = 3000;

console.log("Starting server initialization...");

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: "gen-lang-client-0410385668",
  });
}
const db = getFirestore(admin.app(), "ai-studio-9279f702-e40c-457b-b350-29aa2957fe9a");
console.log("Firebase Admin initialized.");

// Initialize Stripe
let stripeClient: Stripe | null = null;
const getStripe = () => {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is missing");
    stripeClient = new Stripe(key, {
      apiVersion: "2025-01-27.acacia" as any,
    });
  }
  return stripeClient;
};

// Initialize Coinbase Commerce
let coinbaseInitialized = false;
const initCoinbase = () => {
  if (!coinbaseInitialized) {
    const key = process.env.COINBASE_COMMERCE_API_KEY;
    if (!key) throw new Error("COINBASE_COMMERCE_API_KEY is missing");
    Client.init(key);
    coinbaseInitialized = true;
  }
};

// Initialize Resend
let resendClient: Resend | null = null;
const getResend = () => {
  if (!resendClient) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is missing");
    resendClient = new Resend(key);
  }
  return resendClient;
};

app.use(cors());

// Stripe Webhook needs raw body
app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret || "");
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id;
    const customerEmail = session.customer_details?.email;

    if (userId) {
      await db.collection("users").doc(userId).set({
        subscriptionStatus: "premium",
        stripeCustomerId: session.customer as string,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      // Send welcome email
      if (customerEmail) {
        const resend = getResend();
        await resend.emails.send({
          from: "LATAM Intel <onboarding@resend.dev>",
          to: customerEmail,
          subject: "Welcome to LATAM Intel Executive",
          html: "<h1>Welcome!</h1><p>You now have full access to our daily deep-dive briefings and job impact reports.</p>",
        });
      }
    }
  }

  res.json({ received: true });
});

// Coinbase Webhook
app.post("/api/webhooks/coinbase", express.json(), async (req, res) => {
  const event = req.body.event;
  
  if (event.type === "charge:confirmed") {
    const userId = event.data.metadata.userId;
    const customerEmail = event.data.metadata.userEmail;

    if (userId) {
      await db.collection("users").doc(userId).set({
        subscriptionStatus: "premium",
        paymentMethod: "crypto",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      if (customerEmail) {
        const resend = getResend();
        await resend.emails.send({
          from: "LATAM Intel <onboarding@resend.dev>",
          to: customerEmail,
          subject: "Welcome to LATAM Intel Executive (Crypto)",
          html: "<h1>Welcome!</h1><p>Your crypto payment has been confirmed. You now have full access.</p>",
        });
      }
    }
  }

  res.json({ received: true });
});

app.use(express.json());

// API Routes
app.get("/api/jobs", async (req, res) => {
  try {
    const jobs = await fetchRemotiveJobs();
    res.json(jobs);
  } catch (error: any) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/ping", (req, res) => {
  res.send("pong");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Stripe Checkout Session
app.post("/api/create-checkout-session", async (req, res) => {
  const { priceId, userId, customerEmail } = req.body;

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.origin}/?success=true`,
      cancel_url: `${req.headers.origin}/?canceled=true`,
      customer_email: customerEmail,
      client_reference_id: userId,
    });

    res.json({ id: session.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Coinbase Commerce Charge
app.post("/api/create-crypto-charge", async (req, res) => {
  const { userId, userEmail } = req.body;

  try {
    initCoinbase();
    const { Charge } = resources;
    const charge = await Charge.create({
      name: "LATAM Intel Executive Subscription",
      description: "1 Month Premium Access",
      local_price: {
        amount: "29.00",
        currency: "USD",
      },
      pricing_type: "fixed_price",
      metadata: {
        userId,
        userEmail,
      },
      redirect_url: `${req.headers.origin}/?success=true`,
      cancel_url: `${req.headers.origin}/?canceled=true`,
    });

    res.json({ url: charge.hosted_url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Beehiiv Subscription Proxy
app.post("/api/subscribe-newsletter", async (req, res) => {
  const { email } = req.body;
  const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
  const BEEHIIV_PUB_ID = process.env.BEEHIIV_PUB_ID;

  if (!BEEHIIV_API_KEY || !BEEHIIV_PUB_ID) {
    return res.status(500).json({ error: "Beehiiv configuration missing" });
  }

  try {
    const response = await axios.post(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUB_ID}/subscriptions`,
      { email },
      {
        headers: {
          Authorization: `Bearer ${BEEHIIV_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// Resend Email Proxy
app.post("/api/send-email", async (req, res) => {
  const { to, subject, html } = req.body;
  try {
    const resend = getResend();
    const data = await resend.emails.send({
      from: "LATAM Intel <onboarding@resend.dev>",
      to,
      subject,
      html,
    });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// NewsData API Proxy
app.get("/api/external-news", async (req, res) => {
  const API_KEY = process.env.NEWSDATA_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: "NewsData API key missing" });

  try {
    const response = await axios.get(
      `https://newsdata.io/api/1/news?apikey=${API_KEY}&q=latin%20america%20tech%20jobs`
    );
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Daily Intelligence Sync (Triggered manually or via cron)
app.post("/api/sync-intelligence", async (req, res) => {
  const NEWS_API_KEY = process.env.NEWSDATA_API_KEY;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!NEWS_API_KEY || !GEMINI_API_KEY) {
    return res.status(500).json({ error: "API keys missing" });
  }

  try {
    // 1. Fetch latest news
    const newsResponse = await axios.get(
      `https://newsdata.io/api/1/news?apikey=${NEWS_API_KEY}&q=latin%20america%20tech%20jobs&language=en,es,pt`
    );
    const newsItems = newsResponse.data.results.slice(0, 5);
    const newsContext = newsItems.map((n: any) => `${n.title}: ${n.description}`).join("\n\n");

    // 2. Use Gemini to generate a briefing based on this news
    const { GoogleGenAI, Type } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    
    const prompt = `Based on the following recent news from Latin America, generate a premium intelligence briefing for tech executives.
    
    NEWS CONTEXT:
    ${newsContext}
    
    Follow the LATAM INTEL editorial voice: Direct, no filler, actionable "So what?".
    Generate the briefing in English, Spanish, and Portuguese.
    Mark it as isPremium: true.
    Category: TECH.`;

    const aiResponse = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            date: { type: Type.STRING },
            region: { type: Type.STRING },
            category: { type: Type.STRING },
            isPremium: { type: Type.BOOLEAN },
            content: {
              type: Type.OBJECT,
              properties: {
                EN: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, sections: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { heading: { type: Type.STRING }, paragraphs: { type: Type.ARRAY, items: { type: Type.STRING } }, soWhat: { type: Type.STRING } } } } } },
                ES: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, sections: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { heading: { type: Type.STRING }, paragraphs: { type: Type.ARRAY, items: { type: Type.STRING } }, soWhat: { type: Type.STRING } } } } } },
                PT: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, sections: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { heading: { type: Type.STRING }, paragraphs: { type: Type.ARRAY, items: { type: Type.STRING } }, soWhat: { type: Type.STRING } } } } } }
              }
            }
          }
        }
      }
    });

    const briefing = JSON.parse(aiResponse.text);
    
    // 3. Save to Firestore
    await db.collection("briefings").doc(briefing.id || Date.now().toString()).set({
      ...briefing,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ status: "success", briefingId: briefing.id });
  } catch (error: any) {
    console.error("Sync error:", error);
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  try {
    console.log("Starting startServer function...");
    // Vite middleware for development
    if (process.env.NODE_ENV !== "production") {
      console.log("Initializing Vite dev server...");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("Vite middleware attached.");
    } else {
      console.log("Serving production build...");
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

startServer();
