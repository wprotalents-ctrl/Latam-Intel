import axios from "axios";
import { db, admin } from "./firebase.js";

const QUERIES = [
  "LATAM tech jobs remote hiring 2026",
  "software engineer remote Latin America salary",
  "Colombia Brazil Mexico developer hiring AI",
  "remote work technology talent Latin America",
  "AI artificial intelligence jobs LATAM nearshore",
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

    const articles = (response.data.results || [])
      .filter((a: any) => a.title && a.link)
      .map((a: any) => ({
        title: a.title,
        description: a.description || "",
        url: a.link,
        source: a.source_id,
        publishedAt: a.pubDate,
      }));

    if (articles.length > 0) {
      const batch = db.batch();
      articles.forEach((article: any) => {
        const ref = db.collection("market_news").doc();
        batch.set(ref, {
          ...article,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });
      await batch.commit();

      await db.collection("_cache").doc("news_last_fetch").set({
        timestamp: admin.firestore.FieldValue.serverTimestamp(), query,
      });
    }

    return articles;
  } catch (e) {
    // Fallback: serve stale cache
    const snap = await db.collection("market_news")
      .orderBy("publishedAt", "desc").limit(15).get();
    return snap.docs.map((d) => d.data());
  }
}
