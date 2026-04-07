import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, MapPin, Building2, ExternalLink, Briefcase,
  Loader2, AlertCircle, Clock, Newspaper, TrendingUp,
  TrendingDown, ChevronRight, Radio, Users, Globe, RefreshCw, Linkedin
} from 'lucide-react';
import LinkedInBoostModal from '../components/LinkedInBoostModal';
import PostVacancyModal from '../components/PostVacancyModal';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  salary: string | null;
  tags: string;
  source: string;
  region: string;
  postedAt?: string;
}


const REGIONS = ['All', 'LATAM', 'USA', 'Europe', 'Worldwide'];

// Quick-filter chips for common searches
const QUICK_FILTERS = ['AI / ML', 'Software Engineer', 'Data', 'DevOps', 'Product', 'Design', 'Remote LATAM'];

const T = {
  EN: {
    clientBadge: 'MARKET INTEL · FOR COMPANIES',
    noNews: 'Loading latest AI workforce news...',
    read: 'READ',
    candidateBadge: 'JOB PORTAL · FOR CANDIDATES',
    candidateDesc: 'Live remote roles across LATAM, USA & Europe — updated every 30 min.',
    search: 'Search jobs, companies, skills...',
    apply: 'APPLY',
    via: 'via',
    loading: 'Aggregating jobs from multiple sources...',
    error: 'Could not load jobs',
    retry: 'RETRY',
    noJobs: 'No jobs match your search.',
    roles: 'roles',
    loadMore: 'LOAD MORE',
  },
  ES: {
    clientBadge: 'INTELIGENCIA DE MERCADO · PARA EMPRESAS',
    noNews: 'Cargando noticias de empleo IA...',
    read: 'LEER',
    candidateBadge: 'PORTAL DE EMPLEO · PARA CANDIDATOS',
    candidateDesc: 'Roles remotos en LATAM, EE.UU. y Europa — actualizado cada 30 min.',
    search: 'Buscar empleos, empresas, habilidades...',
    apply: 'APLICAR',
    via: 'vía',
    loading: 'Agregando empleos de múltiples fuentes...',
    error: 'No se pudieron cargar los empleos',
    retry: 'REINTENTAR',
    noJobs: 'Sin resultados.',
    roles: 'roles',
    loadMore: 'CARGAR MÁS',
  },
  PT: {
    clientBadge: 'INTELIGÊNCIA DE MERCADO · PARA EMPRESAS',
    noNews: 'Carregando notícias de emprego em IA...',
    read: 'LER',
    candidateBadge: 'PORTAL DE VAGAS · PARA CANDIDATOS',
    candidateDesc: 'Vagas remotas no LATAM, EUA e Europa — atualizado a cada 30 min.',
    search: 'Buscar vagas, empresas, habilidades...',
    apply: 'CANDIDATAR',
    via: 'via',
    loading: 'Agregando vagas de múltiplas fontes...',
    error: 'Não foi possível carregar as vagas',
    retry: 'TENTAR NOVAMENTE',
    noJobs: 'Nenhuma vaga encontrada.',
    roles: 'vagas',
    loadMore: 'CARREGAR MAIS',
  },
};

const REGION_STYLE: Record<string, string> = {
  LATAM: 'text-emerald-400 border-emerald-500/30',
  USA: 'text-blue-400 border-blue-500/30',
  Europe: 'text-violet-400 border-violet-500/30',
  Worldwide: 'text-accent border-accent/30',
};

function timeAgo(d?: string) {
  if (!d) return null;
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (isNaN(diff)) return null;
  if (diff === 0) return 'Today';
  if (diff === 1) return '1d';
  if (diff < 7) return `${diff}d`;
  if (diff < 31) return `${Math.floor(diff / 7)}w`;
  return null;
}

// ── Candidate resources panel ──────────────────────────────────────────────────
const CANDIDATE_ARTICLES = [
  {
    tag: 'AI SKILLS',
    title: 'Top AI & ML Skills Every Tech Professional Needs in 2026',
    desc: 'Prompt engineering, RAG, fine-tuning, and AI-assisted dev are now table stakes for senior roles.',
    url: 'https://www.coursera.org/articles/ai-skills',
    source: 'Coursera',
    color: 'text-violet-400',
  },
  {
    tag: 'JOB SEARCH',
    title: 'How to Land a Remote USD Role from Latin America',
    desc: 'A practical guide to targeting US & EU companies, acing async interviews, and negotiating in dollars.',
    url: 'https://remote.com/blog/how-to-find-remote-work',
    source: 'Remote.com',
    color: 'text-emerald-400',
  },
  {
    tag: 'FUTURE OF WORK',
    title: 'WEF Future of Jobs Report 2025 — Key Takeaways',
    desc: 'Which roles are growing fastest, which are declining, and what skills will define the next 5 years.',
    url: 'https://www.weforum.org/publications/the-future-of-jobs-report-2025/',
    source: 'World Economic Forum',
    color: 'text-blue-400',
  },
  {
    tag: 'APPLICATIONS',
    title: 'How to Write a Tech Resume That Passes ATS and Impresses Humans',
    desc: 'Formatting, keywords, and structure tips from recruiters who see 200+ resumes a week.',
    url: 'https://www.linkedin.com/pulse/how-make-your-resume-ats-friendly-linkedin-news/',
    source: 'LinkedIn',
    color: 'text-accent',
  },
  {
    tag: 'SALARY',
    title: 'What Are Senior Engineers Really Earning in 2026? (Remote Roles)',
    desc: 'Benchmark data across LATAM, USA, and EU for software, AI, and data roles.',
    url: 'https://www.levels.fyi/',
    source: 'Levels.fyi',
    color: 'text-yellow-400',
  },
  {
    tag: 'INTERVIEWS',
    title: 'System Design Interview Prep: The Complete 2026 Guide',
    desc: 'How to tackle architecture questions for FAANG and scale-up interviews — with real examples.',
    url: 'https://github.com/donnemartin/system-design-primer',
    source: 'GitHub',
    color: 'text-emerald-400',
  },
  {
    tag: 'AI TOOLS',
    title: 'Prompt Engineering for Developers: Free Short Course',
    desc: 'Learn to write effective prompts for GPT-4, Claude, and Gemini — now required in most senior JDs.',
    url: 'https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/',
    source: 'DeepLearning.AI',
    color: 'text-violet-400',
  },
  {
    tag: 'BRAND',
    title: 'Build a Developer Brand That Attracts Recruiters on LinkedIn',
    desc: 'How to optimise your profile, post strategically, and get inbound from hiring managers.',
    url: 'https://www.linkedin.com/business/talent/blog/talent-acquisition/linkedin-profile-tips-for-job-seekers',
    source: 'LinkedIn Talent',
    color: 'text-blue-400',
  },
];

const CAREER_TIPS = [
  { icon: <TrendingUp size={12} className="text-accent shrink-0" />, tip: 'Add AI / ML skills to your LinkedIn — searches for "prompt engineering" and "LLM" are up 400% YoY.' },
  { icon: <Globe size={12} className="text-emerald-400 shrink-0" />, tip: 'Target USD/EUR remote roles — avg compensation is 3–5× local rates for senior engineers in LATAM.' },
  { icon: <Users size={12} className="text-violet-400 shrink-0" />, tip: 'Recruiters spend ~7 seconds on a resume. Lead with impact numbers, not job duties.' },
  { icon: <TrendingDown size={12} className="text-red-400 shrink-0" />, tip: 'Roles most at risk from AI: manual QA, data entry, basic content creation, junior frontend.' },
];

function CandidateResourcesPanel() {
  return (
    <section className="border-b border-border bg-surface/20">
      <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Radio size={10} className="text-accent animate-pulse" />
          <span className="mono text-[9px] text-accent tracking-widest font-bold">CANDIDATE INTELLIGENCE // FOR YOU</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Articles grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-6">
          {CANDIDATE_ARTICLES.map((a, i) => (
            <motion.a
              key={i}
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group border border-border bg-bg hover:border-accent/30 p-4 flex flex-col gap-2 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className={`mono text-[7px] font-bold ${a.color}`}>{a.tag}</span>
                <span className="mono text-[7px] text-text/20">{a.source}</span>
              </div>
              <p className="text-[11px] font-bold leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                {a.title}
              </p>
              <p className="text-[10px] text-text/40 leading-snug line-clamp-2 flex-1">
                {a.desc}
              </p>
              <span className="mono text-[7px] text-accent/40 flex items-center gap-1 mt-auto group-hover:text-accent transition-colors">
                READ <ChevronRight size={7} />
              </span>
            </motion.a>
          ))}
        </div>

        {/* Career signal strip */}
        <div className="border border-border bg-bg p-4">
          <div className="mono text-[8px] text-accent font-bold mb-3 flex items-center gap-2">
            <TrendingUp size={9} /> CAREER SIGNAL // WEEKLY INTEL
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {CAREER_TIPS.map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                {tip.icon}
                <p className="mono text-[9px] text-text/50 leading-relaxed">{tip.tip}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

// ── Job portal ────────────────────────────────────────────────────────────────
function JobPortal({ lang, t, onPostVacancy }: { lang: string; t: typeof T.EN; onPostVacancy: () => void }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('All');
  const [page, setPage] = useState(1);
  const PAGE = 30;
  const [showLinkedIn, setShowLinkedIn] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    fetch(`/api/jobs?lang=${lang}&_=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setJobs(Array.isArray(d) ? d : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [lang]);
  useEffect(() => { setPage(1); }, [search, region]);

  const regionCounts = REGIONS.reduce((a, r) => {
    a[r] = r === 'All' ? jobs.length : jobs.filter(j => j.region === r).length;
    return a;
  }, {} as Record<string, number>);

  const filtered = jobs.filter(j => {
    const hay = `${j.title} ${j.company} ${j.tags} ${j.location}`.toLowerCase();
    const matchSearch = !search || search.toLowerCase().split(' ').every(w => hay.includes(w));
    const matchRegion = region === 'All' || j.region === region;
    return matchSearch && matchRegion;
  });

  const shown = filtered.slice(0, page * PAGE);
  const hasMore = shown.length < filtered.length;

  return (
    <section className="px-6 md:px-10 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Briefcase size={10} className="text-text/30" />
        <span className="mono text-[9px] text-text/40 tracking-widest font-bold">{t.candidateBadge}</span>
        <div className="h-px flex-1 bg-border" />
        {!loading && (
          <span className="mono text-[8px] text-text/20">
            <span className="text-accent font-bold">{filtered.length}</span> {t.roles}
            {jobs.length > 0 && <span className="text-text/10 ml-1">of {jobs.length} total</span>}
          </span>
        )}
        <button onClick={load} className="text-text/20 hover:text-accent transition-colors ml-1" title="Refresh">
          <RefreshCw size={11} />
        </button>
      </div>

      <p className="mono text-[9px] text-text/25 mb-4">{t.candidateDesc}</p>

      {/* LinkedIn Boost CTA */}
      <div className="mb-5 flex items-center gap-3 border border-[#0077B5]/20 bg-[#0077B5]/5 px-4 py-3">
        <Linkedin size={14} className="text-[#0077B5] shrink-0" />
        <span className="mono text-[9px] text-text/50 flex-1">Get featured to <span className="text-[#0077B5] font-bold">23K+ hiring managers</span> on LinkedIn — free, posted within 48h</span>
        <button
          onClick={() => setShowLinkedIn(true)}
          className="mono text-[8px] font-bold bg-[#0077B5] text-white px-3 py-1.5 hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          GET FEATURED →
        </button>
      </div>

      {/* Quick filters */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {QUICK_FILTERS.map(qf => (
          <button
            key={qf}
            onClick={() => setSearch(s => s === qf ? '' : qf)}
            className={`mono text-[8px] px-2.5 py-1 border transition-all ${
              search === qf
                ? 'bg-accent text-black border-accent font-bold'
                : 'border-border text-text/30 hover:border-text/30 hover:text-text/60'
            }`}
          >
            {qf}
          </button>
        ))}
        {search && !QUICK_FILTERS.includes(search) && (
          <button onClick={() => setSearch('')} className="mono text-[8px] px-2.5 py-1 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all">
            ✕ clear
          </button>
        )}
      </div>

      {/* Search + region row */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <div className="relative flex-1">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-text/20" />
          <input
            type="text"
            placeholder={t.search}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface border border-border pl-9 pr-4 py-2.5 mono text-[11px] text-text placeholder:text-text/20 focus:outline-none focus:border-accent/40 transition-colors"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {REGIONS.map(r => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`px-3 py-2.5 mono text-[8px] border whitespace-nowrap transition-all flex items-center gap-1 ${
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

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <Loader2 size={24} className="animate-spin text-accent" />
          <p className="mono text-[9px] text-text/20">{t.loading}</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-16 border border-dashed border-red-500/20">
          <AlertCircle size={20} className="text-red-500/50" />
          <p className="mono text-[9px] text-red-400">{t.error}</p>
          <button onClick={load} className="mono text-[8px] border border-border px-4 py-2 hover:border-accent hover:text-accent transition-colors">
            {t.retry}
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            <AnimatePresence mode="popLayout">
              {shown.map((job, idx) => {
                const ago = timeAgo(job.postedAt);
                const rs = REGION_STYLE[job.region] || 'text-text/30 border-text/10';
                return (
                  <motion.a
                    key={job.id}
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.015, 0.3) }}
                    className="group border border-border bg-surface hover:border-accent/40 hover:bg-surface/80 transition-colors flex flex-col cursor-pointer"
                  >
                    <div className="p-4 flex flex-col flex-1 gap-2">
                      <div className="flex items-center justify-between">
                        <span className={`mono text-[7px] border px-1.5 py-0.5 ${rs}`}>{job.region}</span>
                        {ago && <span className="mono text-[7px] text-text/15 flex items-center gap-0.5"><Clock size={7} />{ago}</span>}
                      </div>
                      <div className="mono text-[8px] text-accent/60 truncate flex items-center gap-1">
                        <Building2 size={8} className="shrink-0" />{job.company}
                      </div>
                      <h3 className="text-xs font-bold leading-snug line-clamp-2 group-hover:text-accent transition-colors flex-1">
                        {job.title}
                      </h3>
                      <div className="mono text-[8px] text-text/25 flex items-center gap-1 truncate">
                        <MapPin size={8} className="shrink-0" />{job.location}
                      </div>
                      {job.salary && <div className="mono text-[8px] text-text/40">{job.salary}</div>}
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5 border-t border-text/5">
                      <span className="mono text-[7px] text-text/10">{t.via} {job.source}</span>
                      <span className="mono text-[8px] font-bold flex items-center gap-1 text-text/30 group-hover:text-accent transition-colors">
                        {t.apply} <ExternalLink size={8} />
                      </span>
                    </div>
                  </motion.a>
                );
              })}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && !loading && (
            <div className="text-center py-16 border border-dashed border-border">
              <p className="mono text-[10px] text-text/20">{t.noJobs}</p>
            </div>
          )}

          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setPage(p => p + 1)}
                className="mono text-[9px] border border-border px-8 py-3 text-text/30 hover:border-accent hover:text-accent transition-colors"
              >
                {t.loadMore} · {filtered.length - shown.length} remaining
              </button>
            </div>
          )}
        </>
      )}
      <LinkedInBoostModal isOpen={showLinkedIn} onClose={() => setShowLinkedIn(false)} lang={lang} />
    </section>
  );
}

export default function JobsPage({ lang = 'EN' }: { lang?: string }) {
  const t = T[lang as keyof typeof T] || T.EN;
  const [showVacancy, setShowVacancy] = useState(false);
  return (
    <div className="min-h-screen bg-bg">
      <CandidateResourcesPanel />
      <JobPortal lang={lang} t={t} onPostVacancy={() => setShowVacancy(true)} />
      <PostVacancyModal isOpen={showVacancy} onClose={() => setShowVacancy(false)} lang={lang} />
    </div>
  );
}
