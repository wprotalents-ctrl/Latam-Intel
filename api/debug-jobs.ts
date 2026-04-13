// Temporary debug endpoint - test job sources from Vercel network
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const results: Record<string, any> = {};

  const test = async (name: string, url: string) => {
    try {
      const start = Date.now();
      const r = await fetch(url, { 
        signal: AbortSignal.timeout(8000),
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WProTalentsBot/1.0)' }
      });
      const data = await r.json();
      results[name] = { status: r.status, ms: Date.now()-start, count: Array.isArray(data.jobs||data.data) ? (data.jobs||data.data).length : Object.keys(data).slice(0,3) };
    } catch(e: any) {
      results[name] = { error: e.message };
    }
  };

  await Promise.all([
    test('remotive', 'https://remotive.com/api/remote-jobs?limit=5'),
    test('arbeitnow', 'https://www.arbeitnow.com/api/job-board-api'),
    test('jobicy', 'https://jobicy.com/api/v2/remote-jobs?count=5'),
  ]);

  res.json(results);
}
