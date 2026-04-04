import axios from "axios";
import { db, admin } from "./firebase";

const QUERIES = [
  "AI jobs Latin America",
  "inteligencia artificial empleo LATAM",
  "tech hiring Brazil Mexico Colombia",
  "automation workforce Latin America",
  "remote work technology LATAM 2026",
];

export async function fetchFreshNews(forceRefresh = false) {
  const API_KEY = process.env.NEWSDATA_API_KEY;
  if (!API_KEY) return [];

  // 4-hour stale check
  if (!forceRefresh) {
    const cacheDoc = await db.collection("_cache").doc("news_last_fetch").get();
    if (cacheDoc.exists) {
      const lastFetch = cacheDoc.data()?.timestamp?.toDate?.() as Date | undefined;
      if (lastFetch && Date.now() - lastFetch.getTime() < 4 * 60 * 60 * 1000) {
        const snap = await db.collection("market_news")
          .orderBy("publishedAt", "desc").limit(15).get();
        return snap.docs.map((d) => d.data());
      }
    }
  }

  const query = QUERIES[Math.floor(Math.random() * QUERIES.length)];
  try {
    const response = await axios.get("https://newsdata.io/api/1/news", {
      params: { apikey: API_KEY, q: query, language: "en,es,pt", size: 10 },
    });

    const articles = (response.data.results || []).filter(
      (a: any) => a.title && a.description
    );

    const batch = db.batch();
    articles.forEach((a: any) => {
      const docId = Buffer.from(a.link || a.title).toString("base64").slice(0, 50);
      batch.set(db.collection("market_news").doc(docId), {
        title: a.title, description: a.description,
        url: a.link, source: a.source_id,
        publishedAt: a.pubDate || new Date().toISOString(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    });
    await batch.commit();

    await db.collection("_cache").doc("news_last_fetch").set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(), query,
    });

    return articles.map((a: any) => ({
      title: a.title, description: a.description,
      url: a.link, source: a.source_id, publishedAt: a.pubDate,
    }));
  } catch (err: any) {
    console.error("[News] Fetch failed:", err.response?.data || err.message);
    const snap = await db.collection("market_news")
      .orderBy("publishedAt", "desc").limit(10).get();
    return snap.docs.map((d) => d.data());
  }
}
