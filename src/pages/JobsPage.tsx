import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, MapPin, Building2, ExternalLink, Briefcase, Globe,
  Loader2, AlertCircle, Clock, Newspaper, TrendingUp, TrendingDown,
  ChevronRight, Radio, Users
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  salary: string | null;
  source: string;
  region: string;
  postedAt?: string;
}

interface NewsItem {
  title: string;
  link: string;
  pubDate?: string;
  source_id?: string;
  description?: string;
}

const REGIONS = ['All', 'LATAM', 'USA', 'Europe', 'Worldwide'];

const T = {
  EN: {
    clientBadge: "MARKET INTEL · FOR COMPANIES",
    clientDesc: "AI workforce intelligence — what's happening now with hiring, automation and LATAM talent.",
    loadingNews: "Fetching live intel...",
    noNews: "No intel available.",
    readMore: "READ",
    candidateBadge: "JOB PORTAL · FOR CANDIDATES",
    candidateDesc: "Live remote roles across US, EU & LATAM. Updated every 30 min.",
    search: "Search title or company...",
    apply: "APPLY",
    via: "via",
    scanning: "Loading jobs...",
    failed: "Feed unavailable",
    retry: "RETRY",
    noJobs: "No matching roles found.",
    liveRoles: "roles",
    all: "All",
  },
  ES: {
    clientBadge: "INTELIGENCIA DE MERCADO · PARA EMPRESAS",
    clientDesc: "Inteligencia laboral de IA — qué pasa ahora con la contratación, automatización y talento LATAM.",
    loadingNews: "Cargando inteligencia en vivo...",
    noNews: "Sin inteligencia disponible.",
    readMore: "LEER",
    candidateBadge: "PORTAL DE EMPLEO · PARA CANDIDATOS",
    candidateDesc: "Roles remotos en vivo en EE.UU., UE y LATAM. Actualizado cada 30 min.",
    search: "Buscar por título o empresa...",
    apply: "APLICAR",
    via: "vía",
    scanning: "Cargando empleos...",
    failed: "Feed no disponible",
    retry: "REINTENTAR",
    noJobs: "No se encontraron roles.",
    liveRoles: "roles",
    all: "Todo",
  },
  PT: {
    clientBadge: "INTELIGÊNCIA DE MERCADO · PARA EMPRESAS",
    clientDesc: "Inteligência de força de trabalho IA — o que está acontecendo agora com contratação, automação e talentos LATAM.",
    loadingNews: "Carregando inteligência ao vivo...",
    noNews: "Sem inteligência disponível.",
    readMore: "LER",
    candidateBadge: "PORTAL DE VAGAS · PARA CANDIDATOS",
    candidateDesc: "Vagas remotas ao vivo nos EUA, UE e LATAM. Atualizado a cada 30 min.",
    search: "Buscar por título ou empresa...",
    apply: "CANDIDATAR",
    via: "via",
    scanning: "Carregando vagas...",
    failed: "Feed indisponível",
    retry: "TENTAR NOVAMENTE",
    noJobs: "Nenhuma vaga encontrada.",
    liveRoles: "vagas",
    all: "Tudo",
  },
};

const REGION_STYLE: Record<string, string> = {
  LATAM: 'text-emerald-400 border-emerald-500/30',
  USA: 'text-blue-400 border-blue-500/30',
  Europe: 'text-violet-400 border-violet-500/30',
  Worldwide: 'text-accent border-accent/30',
};

function timeAgo(dateStr?: string): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return '1d';
  if (diff < 7) return `${diff}d`;
  if (diff < 30) return `${Math.floor(diff / 7)}w`;
  return null;
}

// ── CLIENT: News Intel Panel ──────────────────────────────────────────────────
function NewsIntelPanel({ lang, t }: { lang: string; t: typeof T.EN }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/market-intel/news')
      .then(r => r.json())
      .then(d => {
        const items = Array.isArray(d) ? d : (d.results || d.articles || []);
        setNews(items.slice(0, 12));
      })
      .catch(() => setNews([]))
      .finally(() => setLoading(false));
  }, []);

  // Fallback headline topics if news API fails
  const topics = [
    { label: "AI Replacing Jobs", icon: <TrendingDown size={12} className="text-red-400" /> },
    { label: "AI Creating Roles", icon: <TrendingUp size={12} className="text-emerald-400" /> },
    { label: "LATAM Tech Hiring", icon: <Users size={12} className="text-accent" /> },
    { label: "Remote EU Demand", icon: <Globe size={12} className="text-violet-400" /> },
  ];

  return (
    <section className="border-b border-border bg-surface/30">
      <div className="px-6 md:px-12 py-8 max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-6">
          <Radio size={12} className="text-accent animate-pulse" />
          <span className="mono text-[9px] text-accent tracking-widest font-bold">{t.clientBadge}</span>
          <div className="h-px flex-1 bg-border" />
          <span className="mono text-[9px] text-text/20">{t.candidateDesc.split('.')[0]}</span>
        </div>

        {/* Topic pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {topics.map(topic => (
            <div key={topic.label} className="flex items-center gap-1.5 border border-border bg-surface px-3 py-1.5 mono text-[9px] text-text/50">
              {topic.icon}
              {topic.label}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center gap-3 py-8 text-text/20 mono text-[10px]">
            <Loader2 size={14} className="animate-spin text-accent" />
            {t.loadingNews}
          </div>
        ) : news.length === 0 ? (
          <p className="mono text-[10px] text-text/20 py-4">{t.noNews}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {news.map((item, i) => (
              <motion.a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group border border-border bg-bg hover:border-accent/30 p-4 flex flex-col gap-2 transition-colors"
              >
                <div className="mono text-[8px] text-text/20 flex items-center gap-1.5 truncate">
                  <Newspaper size={8} />
                  {item.source_id || 'Intel'}
                  {item.pubDate && (
                    <span className="ml-auto">{timeAgo(item.pubDate)}</span>
                  )}
                </div>
                <p className="text-xs font-medium leading-snug line-clamp-3 group-hover:text-accent transition-colors">
                  {item.title}
                </p>
                <div className="flex items-center gap-1 mono text-[8px] text-accent/50 mt-auto">
                  {t.readMore} <ChevronRight size={8} />
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ── CANDIDATE: Job Portal ─────────────────────────────────────────────────────
function JobPortal({ lang, t }: { lang: string; t: typeof T.EN }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('All');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 30;

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`/api/jobs?lang=${lang}`)
      .then(r => r.json())
      .then(d => setJobs(Array.isArray(d) ? d : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [lang]);

  // Reset pagination on filter change
  useEffect(() => { setPage(1); }, [search, region]);

  const filtered = jobs.filter(j => {
    const matchSearch = !search ||
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase());
    const matchRegion = region === 'All' || j.region === region;
    return matchSearch && matchRegion;
  });

  const regionCounts = REGIONS.reduce((acc, r) => {
    acc[r] = r === 'All' ? jobs.length : jobs.filter(j => j.region === r).length;
    return acc;
  }, {} as Record<string, number>);

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  return (
    <section className="px-6 md:px-12 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Briefcase size={12} className="text-text/30" />
        <span className="mono text-[9px] text-text/40 tracking-widest font-bold">{t.candidateBadge}</span>
        <div className="h-px flex-1 bg-border" />
        {!loading && (
          <span className="mono text-[9px] text-text/20">
            <span className="text-accent font-bold">{filtered.length}</span> {t.liveRoles}
          </span>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text/25" />
          <input
            type="text"
            placeholder={t.search}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface border border-border pl-9 pr-4 py-2.5 mono text-[11px] text-text placeholder:text-text/20 focus:outline-none focus:border-accent/40 transition-colors"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {REGIONS.map(r => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`px-3 py-2.5 mono text-[9px] border whitespace-nowrap transition-all flex items-center gap-1 ${
                region === r
                  ? 'bg-accent text-black border-accent font-bold'
                  : 'bg-surface text-text/30 border-border hover:text-text/60 hover:border-text/20'
              }`}
            >
              {r}
              <span className={region === r ? 'text-black/50' : 'text-text/15'}>
                {regionCounts[r] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center gap-3 py-20 justify-center mono text-[10px] text-text/20">
          <Loader2 size={18} className="animate-spin text-accent" />
          {t.scanning}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-16 border border-dashed border-red-500/20">
          <AlertCircle size={24} className="text-red-500/60" />
          <span className="mono text-[10px] text-red-500/60">{t.failed}</span>
          <button
            onClick={() => { setError(false); setLoading(true); fetch(`/api/jobs?lang=${lang}`).then(r => r.json()).then(d => setJobs(Array.isArray(d) ? d : [])).catch(() => setError(true)).finally(() => setLoading(false)); }}
            className="mono text-[9px] border border-border px-4 py-2 hover:border-accent hover:text-accent transition-colors"
          >
            {t.retry}
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            <AnimatePresence mode="popLayout">
              {paginated.map((job, idx) => {
                const ago = timeAgo(job.postedAt);
                const rs = REGION_STYLE[job.region] || 'text-text/30 border-text/10';
                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.02, 0.4) }}
                    className="group border border-border bg-surface hover:border-accent/25 transition-colors flex flex-col"
                  >
                    <div className="p-4 flex flex-col flex-1 gap-2">
                      <div className="flex items-center justify-between">
                        <span className={`mono text-[7px] border px-1.5 py-0.5 ${rs}`}>
                          {job.region}
                        </span>
                        {ago && (
                          <span className="mono text-[7px] text-text/15 flex items-center gap-0.5">
                            <Clock size={7} />{ago}
                          </span>
                        )}
                      </div>
                      <div className="mono text-[8px] text-accent/60 truncate flex items-center gap-1">
                        <Building2 size={8} className="shrink-0" />{job.company}
                      </div>
                      <h3 className="text-xs font-bold leading-snug line-clamp-2 group-hover:text-accent transition-colors flex-1">
                        {job.title}
                      </h3>
                      <div className="mono text-[8px] text-text/30 flex items-center gap-1 truncate">
                        <MapPin size={8} className="shrink-0" />{job.location}
                      </div>
                      {job.salary && (
                        <div className="mono text-[8px] text-text/40">{job.salary}</div>
                      )}
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5 border-t border-text/5">
                      <span className="mono text-[7px] text-text/10">{t.via} {job.source}</span>
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mono text-[8px] font-bold flex items-center gap-1 text-text/30 hover:text-accent transition-colors"
                      >
                        {t.apply} <ExternalLink size={8} />
                      </a>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 border border-dashed border-border">
              <p className="mono text-[10px] text-text/20">{t.noJobs}</p>
            </div>
          )}

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setPage(p => p + 1)}
                className="mono text-[9px] border border-border px-8 py-3 text-text/40 hover:border-accent hover:text-accent transition-colors"
              >
                LOAD MORE · {filtered.length - paginated.length} remaining
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function JobsPage({ lang = 'EN' }: { lang?: string }) {
  const t = T[lang as keyof typeof T] || T.EN;
  return (
    <div className="min-h-screen bg-bg">
      <NewsIntelPanel lang={lang} t={t} />
      <JobPortal lang={lang} t={t} />
    </div>
  );
}
