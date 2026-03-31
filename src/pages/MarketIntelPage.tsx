import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Newspaper, 
  BarChart3, 
  Sparkles, 
  Globe, 
  ArrowUpRight, 
  Loader2,
  AlertCircle,
  RefreshCw,
  Bitcoin
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Legend
} from 'recharts';

interface NewsItem {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
}

interface TrendData {
  sectors: { name: string; count: number }[];
  companies: { name: string; count: number }[];
}

interface VolumeData {
  country: string;
  count: number;
  date: string;
}

export default function MarketIntelPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [cryptoNews, setCryptoNews] = useState<NewsItem[]>([]);
  const [trends, setTrends] = useState<TrendData>({ sectors: [], companies: [] });
  const [volume, setVolume] = useState<VolumeData[]>([]);
  const [brief, setBrief] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [newsRes, cryptoRes, trendsRes, volumeRes, briefRes] = await Promise.all([
        fetch('/api/market-intel/news'),
        fetch('/api/market-intel/crypto-news'),
        fetch('/api/market-intel/trends'),
        fetch('/api/market-intel/volume'),
        fetch('/api/market-intel/brief')
      ]);

      if (!newsRes.ok || !cryptoRes.ok || !trendsRes.ok || !volumeRes.ok || !briefRes.ok) {
        throw new Error('Failed to fetch market intelligence data');
      }

      const [newsData, cryptoData, trendsData, volumeData, briefData] = await Promise.all([
        newsRes.json(),
        cryptoRes.json(),
        trendsRes.json(),
        volumeRes.json(),
        briefRes.json()
      ]);

      setNews(newsData);
      setCryptoNews(cryptoData);
      setTrends(trendsData);
      // Flatten volume data if it's an array of arrays
      setVolume(Array.isArray(volumeData[0]) ? volumeData[0] : volumeData);
      setBrief(briefData.brief);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/market-intel/sync', { method: 'POST' });
      if (!res.ok) throw new Error('Sync failed');
      await fetchAllData();
    } catch (err: any) {
      alert('Sync failed: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4">
        <Loader2 className="text-accent animate-spin" size={48} />
        <span className="mono text-accent animate-pulse uppercase tracking-widest">Gathering Market Intelligence...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-6 md:p-12">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-accent flex items-center justify-center text-black">
              <TrendingUp size={24} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Market Intel</h1>
          </div>
          <p className="text-white/60 max-w-2xl text-lg">
            Real-time tracking of global job markets, hiring trends, and AI-driven workforce shifts.
          </p>
        </div>
        <button 
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 bg-surface border border-border px-6 py-3 mono text-xs hover:border-accent transition-all disabled:opacity-50"
        >
          {syncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          SYNC LATEST DATA
        </button>
      </header>

      {error && (
        <div className="mb-12 p-6 bg-red-500/10 border border-red-500/20 flex items-center gap-4 text-red-500">
          <AlertCircle size={24} />
          <p className="font-bold uppercase tracking-tighter">Warning: {error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* AI Impact Brief */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-12 bg-surface border border-accent/20 p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles size={64} className="text-accent" />
          </div>
          <div className="flex items-center gap-2 mb-6">
            <Sparkles size={20} className="text-accent" />
            <h2 className="text-xl font-bold uppercase tracking-tight">AI Impact Brief</h2>
          </div>
          <div className="prose prose-invert max-w-none">
            <p className="text-lg leading-relaxed text-white/80 italic">
              "{brief}"
            </p>
          </div>
        </motion.section>

        {/* Today's Job News */}
        <section className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Newspaper size={20} className="text-accent" />
            <h2 className="text-xl font-bold uppercase tracking-tight">Today's Job News</h2>
          </div>
          <div className="space-y-4">
            {news.map((item, idx) => (
              <motion.a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="block p-6 bg-surface border border-border hover:border-accent/40 transition-all group"
              >
                <div className="flex justify-between items-start gap-4 mb-2">
                  <span className="mono text-[10px] text-accent uppercase">{item.source}</span>
                  <span className="mono text-[10px] text-white/20">{new Date(item.publishedAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-lg font-bold group-hover:text-accent transition-colors mb-2">{item.title}</h3>
                <p className="text-sm text-white/40 line-clamp-2">{item.description}</p>
                <div className="mt-4 flex items-center gap-1 text-accent mono text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                  READ FULL ARTICLE <ArrowUpRight size={12} />
                </div>
              </motion.a>
            ))}
          </div>
        </section>

        {/* Crypto & Web3 Pulse */}
        <section className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Bitcoin size={20} className="text-accent" />
            <h2 className="text-xl font-bold uppercase tracking-tight">Crypto & Web3 Pulse</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cryptoNews.map((item, idx) => (
              <motion.a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 bg-surface border border-border hover:border-accent/40 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="mono text-[8px] text-accent uppercase">{item.source}</span>
                  </div>
                  <h3 className="text-sm font-bold group-hover:text-accent transition-colors line-clamp-2">{item.title}</h3>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="mono text-[8px] text-white/20">{new Date(item.publishedAt).toLocaleDateString()}</span>
                  <ArrowUpRight size={12} className="text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.a>
            ))}
          </div>
        </section>

        {/* Hiring Trends & Volume */}
        <aside className="lg:col-span-5 space-y-8">
          {/* Hiring Sectors Chart */}
          <div className="bg-surface border border-border p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 size={18} className="text-accent" />
              <h2 className="text-sm font-bold uppercase tracking-widest">Top Hiring Sectors</h2>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends.sectors} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={100} 
                    stroke="#404040" 
                    fontSize={10}
                    tick={{ fill: '#666' }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #262626' }}
                    itemStyle={{ color: '#00ff00' }}
                  />
                  <Bar dataKey="count" fill="#00ff00" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* LATAM Volume Chart */}
          <div className="bg-surface border border-border p-6">
            <div className="flex items-center gap-2 mb-6">
              <Globe size={18} className="text-accent" />
              <h2 className="text-sm font-bold uppercase tracking-widest">LATAM Job Volume</h2>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volume}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                  <XAxis 
                    dataKey="country" 
                    stroke="#404040" 
                    fontSize={10}
                    tick={{ fill: '#666' }}
                  />
                  <YAxis 
                    stroke="#404040" 
                    fontSize={10}
                    tick={{ fill: '#666' }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #262626' }}
                    itemStyle={{ color: '#00ff00' }}
                  />
                  <Bar dataKey="count" fill="#00ff00" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Most Active Companies */}
          <div className="bg-surface border border-border p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-6">Most Active Companies</h2>
            <div className="space-y-4">
              {trends.companies.map((company, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-bg border border-border/50">
                  <span className="font-bold text-sm">{company.name}</span>
                  <span className="mono text-xs text-accent">{company.count} active roles</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
