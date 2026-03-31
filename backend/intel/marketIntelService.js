import axios from 'axios';
import admin from 'firebase-admin';

const NEWS_API_URL = 'https://newsapi.org/v2/everything';
const THEIRSTACK_API_URL = 'https://api.theirstack.com/v1/jobs/search';
const TECHMAP_API_URL = 'https://job-postings-rss-feed.p.rapidapi.com/jobs';
const CRYPTO_NEWS_API_URL = 'https://cryptocurrency-news2.p.rapidapi.com/v1/coinjournal';

/**
 * Fetch crypto news from RapidAPI
 */
export async function fetchCryptoNews() {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    console.warn('RAPIDAPI_KEY is missing. Skipping crypto news.');
    return [];
  }

  try {
    const response = await axios.get(CRYPTO_NEWS_API_URL, {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'cryptocurrency-news2.p.rapidapi.com'
      }
    });

    // The API returns an array of news objects
    const news = Array.isArray(response.data) ? response.data : (response.data.data || []);
    
    return news.map(item => ({
      title: item.title,
      description: item.description || '',
      url: item.url,
      source: 'CoinJournal',
      publishedAt: item.createdAt || new Date().toISOString()
    })).slice(0, 10);
  } catch (error) {
    console.error('Error fetching crypto news:', error.response?.data || error.message);
    return [];
  }
}

/**
 * Fetch market news from News API
 */
export async function fetchMarketNews() {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    console.warn('NEWS_API_KEY is missing. Skipping market news.');
    return [];
  }

  try {
    const response = await axios.get(NEWS_API_URL, {
      params: {
        q: '"AI jobs" OR "hiring trends" OR "tech layoffs" OR "remote work"',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 10,
        apiKey: apiKey
      }
    });

    return response.data.articles.map(article => ({
      title: article.title,
      description: article.description,
      url: article.url,
      source: article.source.name,
      publishedAt: article.publishedAt
    }));
  } catch (error) {
    console.error('Error fetching market news:', error.response?.data || error.message);
    return [];
  }
}

/**
 * Fetch hiring trends from TheirStack API
 */
export async function fetchHiringTrends() {
  const apiKey = process.env.THEIRSTACK_API_KEY;
  if (!apiKey) {
    console.warn('THEIRSTACK_API_KEY is missing. Skipping hiring trends.');
    return { sectors: [], companies: [] };
  }

  try {
    // TheirStack API often requires a POST request for search
    const response = await axios.post(THEIRSTACK_API_URL, {
      limit: 100,
      posted_at_max_days_ago: 7,
      // You can add more filters here based on TheirStack documentation
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const jobs = response.data.data || [];
    
    // Aggregate sectors
    const sectorCounts = {};
    const companyCounts = {};

    jobs.forEach(job => {
      const sector = job.industry || 'Other';
      const company = job.company_name || 'Unknown';

      sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
      companyCounts[company] = (companyCounts[company] || 0) + 1;
    });

    const sectors = Object.entries(sectorCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const companies = Object.entries(companyCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { sectors, companies };
  } catch (error) {
    console.error('Error fetching hiring trends:', error.response?.data || error.message);
    return { sectors: [], companies: [] };
  }
}

/**
 * Fetch LATAM job volume from Techmap API
 */
export async function fetchLATAMVolume() {
  const apiKey = process.env.RAPIDAPI_TECHMAP_KEY;
  if (!apiKey) {
    console.warn('RAPIDAPI_TECHMAP_KEY is missing. Skipping LATAM volume.');
    return [];
  }

  const countries = ['mx', 'ar', 'co', 'cl', 'br'];
  const volumeData = [];

  try {
    for (const country of countries) {
      const response = await axios.get(TECHMAP_API_URL, {
        params: { country },
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'job-postings-rss-feed.p.rapidapi.com'
        }
      });

      const jobs = Array.isArray(response.data) ? response.data : (response.data.jobs || []);
      volumeData.push({
        country: country.toUpperCase(),
        count: jobs.length,
        date: new Date().toISOString().split('T')[0]
      });
    }

    return volumeData;
  } catch (error) {
    console.error('Error fetching LATAM volume:', error.response?.data || error.message);
    return [];
  }
}

/**
 * Sync all market intelligence data to Firestore
 */
export async function syncMarketIntel(db) {
  try {
    const [news, trends, volume, cryptoNews] = await Promise.all([
      fetchMarketNews(),
      fetchHiringTrends(),
      fetchLATAMVolume(),
      fetchCryptoNews()
    ]);

    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const dateStr = new Date().toISOString().split('T')[0];

    // 1. Store news
    const newsBatch = db.batch();
    news.forEach(article => {
      const docId = Buffer.from(article.url).toString('base64').slice(0, 50);
      const ref = db.collection('market_news').doc(docId);
      newsBatch.set(ref, {
        ...article,
        updatedAt: timestamp
      }, { merge: true });
    });
    await newsBatch.commit();

    // 2. Store crypto news
    const cryptoBatch = db.batch();
    cryptoNews.forEach(article => {
      const docId = Buffer.from(article.url).toString('base64').slice(0, 50);
      const ref = db.collection('crypto_news').doc(docId);
      cryptoBatch.set(ref, {
        ...article,
        updatedAt: timestamp
      }, { merge: true });
    });
    await cryptoBatch.commit();

    // 3. Store trends and volume in a daily snapshot
    await db.collection('market_intel_snapshots').doc(dateStr).set({
      date: dateStr,
      trends,
      volume,
      createdAt: timestamp
    });

    return { status: 'success', date: dateStr };
  } catch (error) {
    console.error('Error syncing market intel:', error);
    throw error;
  }
}
