import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, MapPin, Building2, ExternalLink, Briefcase,
  Loader2, AlertCircle, Clock, TrendingUp,
  TrendingDown, ChevronRight, Radio, Users, Globe, RefreshCw, Linkedin,
  Zap, BookOpen, DollarSign, Compass, Award, Target, Rocket, ArrowUpRight,
  FileText, Mic2, Star, Lightbulb
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

// ── Candidate Portal ──────────────────────────────────────────────────────────

type SectionKey = 'kickoff' | 'resume' | 'interview' | 'negotiate' | 'remote' | 'career' | 'ai';

interface PortalArticle {
  title: string;
  desc: string;
  url: string;
  tag: string;
}

interface PortalSection {
  label: string;
  tag: string;
  Icon: React.ElementType;
  color: string;
  accent: string;
  desc: string;
  articles: PortalArticle[];
}

const PORTAL_SECTIONS: Record<SectionKey, PortalSection> = {
  kickoff: {
    label: 'Kick Off',
    tag: 'START HERE',
    Icon: Rocket,
    color: 'text-accent',
    accent: 'bg-accent text-black',
    desc: 'Build your strategy before you send a single application.',
    articles: [
      { title: 'Define Your Dream Job', desc: 'Start with what you actually want — the foundation of any successful search.', url: 'https://medium.com/@deluca.gabi/setting-up-your-job-search-strategy-start-with-your-dream-job-4a10c065b24f', tag: 'STRATEGY' },
      { title: 'Create Your SSoT (Single Source of Truth)', desc: 'Stay organised during your search with one central document.', url: 'https://medium.com/@deluca.gabi/stay-organized-during-your-job-search-80d651270dda', tag: 'ORGANISATION' },
      { title: 'Must-Have Tools During Your Job Search', desc: 'The best free websites to land the right job at the right salary.', url: 'https://medium.com/@deluca.gabi/excellent-websites-to-help-you-get-the-right-job-and-the-right-salary-6b677431eb1a', tag: 'TOOLS' },
      { title: 'The Job Search Canvas', desc: 'A visual framework to map your job search like a product launch.', url: 'https://medium.com/@deluca.gabi/d393e1fd3e0e', tag: 'FRAMEWORK' },
      { title: 'Start (and Keep) a Brag Book', desc: 'Document your wins continuously — your future interview prep will thank you.', url: 'https://medium.com/@deluca.gabi/personal-brag-book-what-is-and-how-to-use-it-2827782db4ce', tag: 'CAREER INTEL' },
    ],
  },
  resume: {
    label: 'Resume & Apply',
    tag: 'APPLICATIONS',
    Icon: FileText,
    color: 'text-emerald-400',
    accent: 'bg-emerald-500 text-black',
    desc: 'Stand out from hundreds of applicants with a sharp application.',
    articles: [
      { title: 'Free Tools to Tweak Your Resumé', desc: 'The best free tools to polish your resume before applying anywhere.', url: 'https://medium.com/@deluca.gabi/free-tools-to-tweak-your-resume-abebb4e10f2f', tag: 'TOOLS' },
      { title: 'Review Your Resumé — Keywords', desc: 'Get past ATS filters by optimising for the right keywords before you apply.', url: 'https://medium.com/@deluca.gabi/before-you-apply-review-your-resume-c4c4d5f51d66', tag: 'ATS' },
      { title: 'Review Your Resumé — Grammar', desc: 'Grammar and translation tools to make your resume internationally polished.', url: 'https://medium.com/@deluca.gabi/tools-to-tweak-your-resume-translation-and-grammar-edition-8e8893c12cf9', tag: 'QUALITY' },
      { title: 'How to Write a Cover Letter #1', desc: 'If you decide to write one — read this first. The essentials explained.', url: 'https://medium.com/@deluca.gabi/if-you-decide-to-write-a-cover-letter-then-read-this-8ed083f0345c', tag: 'WRITING' },
      { title: 'How to Write a Cover Letter #2', desc: 'The 3 Whys framework that will guide every cover letter you ever write.', url: 'https://medium.com/@deluca.gabi/the-3-whys-that-will-guide-you-when-writing-your-cover-letter-c7da7f495674', tag: 'WRITING' },
      { title: 'How to Write a LinkedIn Profile That Gets Inbound', desc: 'Optimise every section of your LinkedIn to attract recruiters passively.', url: 'https://www.linkedin.com/business/talent/blog/talent-acquisition/linkedin-profile-tips-for-job-seekers', tag: 'LINKEDIN' },
    ],
  },
  interview: {
    label: 'Interview',
    tag: 'PREP',
    Icon: Mic2,
    color: 'text-blue-400',
    accent: 'bg-blue-500 text-white',
    desc: 'Walk into every interview prepared, confident, and strategic.',
    articles: [
      { title: 'How to Prepare for ANY Interview', desc: 'A simple, repeatable method that works for any role at any company.', url: 'https://medium.com/@deluca.gabi/a-simple-method-to-prepare-for-a-job-interview-and-more-d935862c89de', tag: 'FRAMEWORK' },
      { title: 'How to Prepare for a Remote Interview', desc: 'Practical tips on tech setup, body language, and async follow-up.', url: 'https://medium.com/@deluca.gabi/how-to-prepare-for-a-remote-interview-practical-tips-for-candidates-944d0d05f38e', tag: 'REMOTE' },
      { title: 'How to Prepare for Your FIRST Interview', desc: 'Just got your first interview invite? This step-by-step guide is for you.', url: 'https://medium.com/@deluca.gabi/i-just-got-my-first-interview-now-what-c80daa9f5130', tag: 'BEGINNERS' },
      { title: 'Free Tools for a TECH Interview', desc: 'System design, coding challenges, and behavioural prep — all free.', url: 'https://medium.com/@deluca.gabi/technical-interview-free-tools-that-will-help-you-prepare-for-it-a05239e2618b', tag: 'TECH' },
      { title: 'Free Tools to Better Prepare for Any Interview', desc: 'Research, roleplay, and confidence tools for every type of interview.', url: 'https://medium.com/@deluca.gabi/free-tools-to-better-prepare-for-a-job-interview-aa9bcdfa1798', tag: 'TOOLS' },
      { title: 'Great Questions to Ask at the End', desc: 'The best questions to ask at the end — organised by interview type.', url: 'https://medium.com/@deluca.gabi/great-questions-to-ask-during-different-types-of-job-interviews-5f9044bf2ad0', tag: 'TACTICS' },
    ],
  },
  negotiate: {
    label: 'Negotiate',
    tag: 'OFFERS',
    Icon: DollarSign,
    color: 'text-yellow-400',
    accent: 'bg-yellow-500 text-black',
    desc: 'Never leave money on the table. Know your worth, own the conversation.',
    articles: [
      { title: 'What Is Your Salary Expectation?', desc: 'How to answer the most stressful question without underselling yourself.', url: 'https://medium.com/@deluca.gabi/what-is-your-salary-expectation-be744cf8255f', tag: 'SALARY' },
      { title: 'How to Choose Between 2+ Job Offers', desc: 'A clear framework for deciding when you\'re lucky enough to have options.', url: 'https://medium.com/@deluca.gabi/how-to-choose-between-multiple-job-offers-9984104997df', tag: 'DECISION' },
      { title: 'Salary Benchmarks: What Are Engineers Earning?', desc: 'Real comp data for tech roles across LATAM, USA, and EU. Updated 2026.', url: 'https://www.levels.fyi/', tag: 'DATA' },
      { title: 'LATAM Salary in USD: The Full Guide', desc: 'USD remote salaries vs local — the real gap and how to position yourself.', url: 'https://remote.com/blog/employer-of-record-latin-america', tag: 'LATAM' },
    ],
  },
  remote: {
    label: 'Remote Work',
    tag: 'REMOTE',
    Icon: Globe,
    color: 'text-violet-400',
    accent: 'bg-violet-500 text-white',
    desc: 'Win at remote — from landing your first role to thriving long-term.',
    articles: [
      { title: 'Guides and Tools for Remote Work', desc: 'The essential guide to working remotely in 2026 — tools, culture, async.', url: 'https://medium.com/@deluca.gabi/guides-and-tools-about-remote-work-bd65dc1046c', tag: 'GUIDE' },
      { title: 'Best Websites to Find Remote Work', desc: 'The two best platforms for finding legitimately remote tech roles.', url: 'https://medium.com/@deluca.gabi/2-great-platforms-to-find-remote-work-a66ad2e07a8a', tag: 'JOB BOARDS' },
      { title: 'How to Approach Anyone on LinkedIn', desc: 'Message templates for reaching out to recruiters and hiring managers cold.', url: 'https://medium.com/@deluca.gabi/how-to-approach-a-recruiter-or-literally-anyone-on-linkedin-with-templates-dba6811e74be', tag: 'NETWORKING' },
      { title: 'Communicate Clearly with BLUF', desc: 'Bottom Line Up Front — the async written communication method that gets replies.', url: 'https://medium.com/@deluca.gabi/bluf-the-method-for-better-and-effective-written-communication-179f46827d34', tag: 'COMMUNICATION' },
      { title: 'How to Make the Best of Remote Work', desc: 'Productivity, structure, and mental health for full-time remote professionals.', url: 'https://drive.google.com/file/d/12fpRf0663UHEifdLYIHXlOhcoN3cq8mv/view?usp=sharing', tag: 'WELLBEING' },
    ],
  },
  career: {
    label: 'Career Growth',
    tag: 'LONG GAME',
    Icon: Compass,
    color: 'text-pink-400',
    accent: 'bg-pink-500 text-white',
    desc: 'Think beyond the next job. Build the career you actually want.',
    articles: [
      { title: 'Understand Yourself Professionally', desc: 'Websites and tools to figure out your strengths, values, and working style.', url: 'https://medium.com/@deluca.gabi/helpful-resources-to-understand-who-you-are-professionally-680b409aa42e', tag: 'SELF-DISCOVERY' },
      { title: '16 Personalities Test (Free)', desc: 'One of the most-used free personality assessments — great for career planning.', url: 'https://www.16personalities.com/', tag: 'ASSESSMENT' },
      { title: 'Career Transition: A New Perspective', desc: 'Why a career transition isn\'t as scary as it looks — using an algebra analogy.', url: 'https://medium.com/@deluca.gabi/how-algebra-can-help-you-understand-that-a-career-transition-isnt-that-big-of-a-change-d59ecebeb6a7', tag: 'MINDSET' },
      { title: 'How to Make a Career Transition', desc: 'Make a career change without starting from zero — a practical roadmap.', url: 'https://medium.com/@deluca.gabi/how-to-make-a-career-transition-without-starting-over-6b6f6129d0a3', tag: 'TRANSITION' },
      { title: 'How to Build Trust at Work', desc: 'What trust actually is and how to earn it with your team and managers.', url: 'https://medium.com/@deluca.gabi/ready-how-do-you-build-trust-26406398fc57', tag: 'CULTURE' },
      { title: 'What IS Trust?', desc: 'A deeper look at the psychology of trust — and why it\'s your most valuable asset.', url: 'https://medium.com/@deluca.gabi/what-is-trust-be7f2eb3d639', tag: 'CULTURE' },
    ],
  },
  ai: {
    label: 'AI Skills',
    tag: 'FUTURE-PROOF',
    Icon: Zap,
    color: 'text-violet-400',
    accent: 'bg-violet-500 text-white',
    desc: 'The skills that separate the hired from the overlooked in 2026.',
    articles: [
      { title: 'Top AI & ML Skills Every Tech Pro Needs in 2026', desc: 'Prompt engineering, RAG, fine-tuning — now table stakes for senior roles.', url: 'https://www.coursera.org/articles/ai-skills', tag: 'SKILLS' },
      { title: 'Prompt Engineering for Developers (Free Course)', desc: 'Learn to write effective prompts for GPT-4, Claude, and Gemini — 1 hour.', url: 'https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/', tag: 'FREE COURSE' },
      { title: 'System Design Primer (GitHub)', desc: 'The most-starred system design guide on GitHub — essential for senior interviews.', url: 'https://github.com/donnemartin/system-design-primer', tag: 'INTERVIEWS' },
      { title: 'WEF Future of Jobs Report 2025', desc: 'Which roles are growing, which are declining, and what skills matter most.', url: 'https://www.weforum.org/publications/the-future-of-jobs-report-2025/', tag: 'MARKET DATA' },
      { title: 'AI-Assisted Coding: GitHub Copilot Guide', desc: 'How to use AI pair-programming tools effectively — and put it on your CV.', url: 'https://docs.github.com/en/copilot', tag: 'TOOLS' },
      { title: 'Kaggle: Free ML Courses', desc: 'Free hands-on machine learning courses from beginner to advanced.', url: 'https://www.kaggle.com/learn', tag: 'FREE COURSE' },
    ],
  },
};

const SECTION_ORDER: SectionKey[] = ['kickoff', 'resume', 'interview', 'negotiate', 'remote', 'career', 'ai'];

function CandidateResourcesPanel() {
  const [activeSection, setActiveSection] = useState<SectionKey>('kickoff');
  const section = PORTAL_SECTIONS[activeSection];

  return (
    <section className="border-b border-border bg-surface/20">
      <div className="px-6 md:px-10 pt-8 pb-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Radio size={10} className="text-accent animate-pulse" />
          <span className="mono text-[9px] text-accent tracking-widest font-bold">CANDIDATE INTELLIGENCE // YOUR VIP PORTAL</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border mb-6">
          {[
            { icon: <Users size={10} />, value: '23K+', label: 'Network' },
            { icon: <Award size={10} />, value: '500+', label: 'Placed' },
            { icon: <Globe size={10} />, value: '12', label: 'Countries' },
            { icon: <Star size={10} />, value: '20yr', label: 'Experience' },
          ].map((s, i) => (
            <div key={i} className="bg-bg px-4 py-3 flex items-center gap-3">
              <span className="text-accent">{s.icon}</span>
              <span className="text-lg font-black text-accent">{s.value}</span>
              <span className="mono text-[8px] text-text/30 uppercase tracking-widest">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar mb-6 pb-1">
          {SECTION_ORDER.map(key => {
            const s = PORTAL_SECTIONS[key];
            const isActive = activeSection === key;
            return (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`flex items-center gap-2 px-3 py-2 mono text-[8px] font-bold border whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? `${s.accent} border-transparent`
                    : 'bg-bg border-border text-text/30 hover:text-text/60 hover:border-text/20'
                }`}
              >
                <s.Icon size={10} />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Section content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* Section desc */}
            <div className="flex items-center gap-3 mb-4">
              <span className={`mono text-[8px] font-bold ${section.color}`}>{section.tag}</span>
              <span className="mono text-[9px] text-text/30">{section.desc}</span>
            </div>

            {/* Articles grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {section.articles.map((a, i) => (
                <motion.a
                  key={i}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group border border-border bg-bg hover:border-accent/30 p-4 flex flex-col gap-2 transition-colors"
                >
                  <span className={`mono text-[7px] font-bold ${section.color}`}>{a.tag}</span>
                  <p className="text-xs font-bold leading-snug group-hover:text-accent transition-colors flex-1">
                    {a.title}
                  </p>
                  <p className="mono text-[9px] text-text/40 leading-snug line-clamp-2">
                    {a.desc}
                  </p>
                  <span className="mono text-[7px] text-text/20 group-hover:text-accent transition-colors flex items-center gap-1 mt-1">
                    READ <ArrowUpRight size={8} />
                  </span>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Career signal strip */}
        <div className="mt-6 border border-border bg-bg p-4">
          <div className="mono text-[8px] text-accent font-bold mb-3 flex items-center gap-2">
            <Lightbulb size={9} /> CAREER SIGNAL // WEEKLY INTEL
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: <TrendingUp size={11} className="text-accent shrink-0 mt-0.5" />, tip: 'Add AI / ML to your LinkedIn — searches for "prompt engineering" are up 400% YoY.' },
              { icon: <Globe size={11} className="text-emerald-400 shrink-0 mt-0.5" />, tip: 'USD/EUR remote roles pay 3–5× local rates for senior LATAM engineers. Target them first.' },
              { icon: <Target size={11} className="text-blue-400 shrink-0 mt-0.5" />, tip: 'Recruiters spend ~7 sec on a resume. Lead with measurable impact, not job duties.' },
              { icon: <TrendingDown size={11} className="text-red-400 shrink-0 mt-0.5" />, tip: 'Roles most at risk from AI: manual QA, data entry, basic content, junior frontend.' },
            ].map((tip, i) => (
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
