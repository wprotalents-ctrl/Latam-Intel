import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, MapPin, Building2, ExternalLink, Briefcase,
  Loader2, AlertCircle, Clock, TrendingUp,
  TrendingDown, ChevronRight, Radio, Users, Globe, RefreshCw, Linkedin,
  Zap, BookOpen, DollarSign, Compass, Award, Target, Rocket, ArrowUpRight,
  FileText, Mic2, Star, Lightbulb, Bookmark, BookmarkCheck, Copy, Check,
  Newspaper, Mail, Lock, BarChart2
} from 'lucide-react';
import { computeMarketValue } from '../lib/intelligence';
import type { RoleKey, CountryCode, EnglishLevel } from '../lib/intelligence';
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

const QUICK_FILTERS = ['AI / ML', 'Software Engineer', 'Data', 'DevOps', 'Product', 'Design', 'Remote LATAM'];

const MATCH_ROLE_TYPES = ['Software Engineer', 'Data', 'DevOps', 'Design', 'Product', 'Marketing', 'AI / ML'];
const MATCH_SENIORITIES = ['Junior', 'Mid', 'Senior', 'Lead'];
const MATCH_REGIONS = ['Worldwide', 'LATAM', 'USA', 'Europe'];

interface MatchPrefs { roleType: string; seniority: string; region: string; }
const MATCH_KEY = 'wpro_match_prefs';

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
    matchTitle: 'Quick Match',
    matchRoleType: 'Role type',
    matchSeniority: 'Seniority',
    matchRegion: 'Region',
    matchTopPicks: 'Top picks for you',
    matchBadge: 'MATCH',
    matchEmpty: 'Set your preferences above to see personalized picks.',
    matchCollapse: 'Hide picks',
    matchExpand: 'Show picks',
    // MarketValueTeaser
    teaserBadge: 'MARKET VALUE CALCULATOR · FREE PREVIEW',
    teaserFullDash: 'Full dashboard → Executive Members',
    teaserRole: 'ROLE',
    teaserCountry: 'COUNTRY',
    teaserYearsExp: 'YEARS EXP',
    teaserCalculate: 'CALCULATE →',
    teaserLocalMid: 'LOCAL MARKET MID',
    teaserRemote: 'REMOTE (USD)',
    teaserUplift: 'uplift · /year',
    teaserPerYear: '/year',
    teaserLockedLabel: 'Full dashboard · Executive Members',
    teaserUnlock: 'Unlock for $29/mo',
    teaserLockedSections: ['Salary by English Level', 'Best Markets for You', 'Skills ROI'],
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
    matchTitle: 'Búsqueda Rápida',
    matchRoleType: 'Tipo de rol',
    matchSeniority: 'Nivel',
    matchRegion: 'Región',
    matchTopPicks: 'Seleccionados para ti',
    matchBadge: 'MATCH',
    matchEmpty: 'Configura tus preferencias arriba para ver picks personalizados.',
    matchCollapse: 'Ocultar picks',
    matchExpand: 'Mostrar picks',
    // MarketValueTeaser
    teaserBadge: 'CALCULADORA DE VALOR DE MERCADO · VISTA PREVIA',
    teaserFullDash: 'Dashboard completo → Miembros Ejecutivos',
    teaserRole: 'ROL',
    teaserCountry: 'PAÍS',
    teaserYearsExp: 'AÑOS DE EXP',
    teaserCalculate: 'CALCULAR →',
    teaserLocalMid: 'VALOR DE MERCADO LOCAL',
    teaserRemote: 'REMOTO (USD)',
    teaserUplift: 'uplift · /año',
    teaserPerYear: '/año',
    teaserLockedLabel: 'Dashboard completo · Miembros Ejecutivos',
    teaserUnlock: 'Desbloquear por $29/mes',
    teaserLockedSections: ['Salario por Nivel de Inglés', 'Mejores Mercados para Ti', 'ROI de Habilidades'],
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
    matchTitle: 'Busca Rápida',
    matchRoleType: 'Tipo de cargo',
    matchSeniority: 'Nível',
    matchRegion: 'Região',
    matchTopPicks: 'Selecionados para você',
    matchBadge: 'MATCH',
    matchEmpty: 'Configure suas preferências acima para ver sugestões personalizadas.',
    matchCollapse: 'Ocultar sugestões',
    matchExpand: 'Mostrar sugestões',
    // MarketValueTeaser
    teaserBadge: 'CALCULADORA DE VALOR DE MERCADO · PRÉVIA GRATUITA',
    teaserFullDash: 'Dashboard completo → Membros Executivos',
    teaserRole: 'FUNÇÃO',
    teaserCountry: 'PAÍS',
    teaserYearsExp: 'ANOS DE EXP',
    teaserCalculate: 'CALCULAR →',
    teaserLocalMid: 'VALOR DE MERCADO LOCAL',
    teaserRemote: 'REMOTO (USD)',
    teaserUplift: 'uplift · /ano',
    teaserPerYear: '/ano',
    teaserLockedLabel: 'Dashboard completo · Membros Executivos',
    teaserUnlock: 'Desbloquear por $29/mês',
    teaserLockedSections: ['Salário por Nível de Inglês', 'Melhores Mercados para Você', 'ROI de Habilidades'],
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

type SectionKey = 'launch' | 'strike' | 'roomread' | 'ratecard' | 'zerocommute' | 'compound' | 'aileverage';

interface PortalArticle {
  title: string;
  desc: string;
  url: string;
  tag: string;
  wpro?: boolean;
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
  launch: {
    label: 'Launch Protocol',
    tag: 'START HERE',
    Icon: Rocket,
    color: 'text-accent',
    accent: 'bg-accent text-black',
    desc: 'Build your strategy before you send a single application.',
    articles: [
      { title: 'Identify Your Job Search North Star', desc: 'Clarify what you\'re actually looking for — role, comp, culture — before spending a single hour applying.', url: 'https://hbr.org/2021/01/figuring-out-your-career-goals', tag: 'STRATEGY' },
      { title: 'Build Your Job Search Command Center', desc: 'Track every application, follow-up, and contact in one organised system so nothing falls through the cracks.', url: 'https://www.notion.com/templates/job-search-tracker', tag: 'ORGANISATION' },
      { title: 'LATAM to Global: Your USD Remote Roadmap', desc: 'The exact steps LATAM professionals take to transition from local pay to USD/EUR remote compensation.', url: 'https://remote.com/blog/employer-of-record-latin-america', tag: 'LATAM' },
      { title: 'Subscribe to Workforce Daily — Free', desc: 'Weekly AI hiring signals, LATAM salary moves, and market intel delivered to your inbox. Curated by WProTalents.', url: 'https://latam-intel.vercel.app', tag: 'WPRO INTEL', wpro: true },
      { title: 'Brag Doc: Track Your Wins Continuously', desc: 'The single habit that makes every resume update, performance review, and salary negotiation dramatically easier.', url: 'https://hbr.org/2022/01/how-to-build-a-brag-document', tag: 'CAREER INTEL' },
    ],
  },
  strike: {
    label: 'Strike Package',
    tag: 'GET HIRED',
    Icon: FileText,
    color: 'text-emerald-400',
    accent: 'bg-emerald-500 text-black',
    desc: 'Stand out from hundreds of applicants with a sharp, ATS-optimised application.',
    articles: [
      { title: 'ATS-Proof Your Resume: The 10-Step Checklist', desc: 'Over 75% of resumes never reach a human. Use these steps to get through the filter first.', url: 'https://www.jobscan.co/blog/beat-applicant-tracking-system/', tag: 'ATS' },
      { title: 'Resume Keywords That Get You Past the Filter', desc: 'How to identify the right keywords for each role and embed them naturally in your resume.', url: 'https://www.linkedin.com/pulse/how-use-keywords-your-resume-get-noticed-recruiters-linkedin-news/', tag: 'KEYWORDS' },
      { title: 'The LinkedIn Profile Formula That Attracts Inbound', desc: 'Optimise every section — headline, about, experience — to appear in recruiter searches passively.', url: 'https://www.linkedin.com/business/talent/blog/talent-acquisition/linkedin-profile-tips-for-job-seekers', tag: 'LINKEDIN' },
      { title: 'How to Write a Cover Letter That Gets Read', desc: 'When to write one, what to include, and the structure that makes hiring managers stop scrolling.', url: 'https://hbr.org/2014/02/how-to-write-a-cover-letter', tag: 'WRITING' },
      { title: 'Get Your Profile in Front of 23K+ Hiring Managers', desc: 'WProTalents features vetted LATAM candidates to our network of US & EU companies — free, within 48h.', url: '#linkedin-boost', tag: 'WPRO EXCLUSIVE', wpro: true },
      { title: 'Free Resume Review Tools Ranked by Recruiters', desc: 'The best free tools to check your resume for ATS compliance, grammar, and impact before you apply.', url: 'https://resume.io', tag: 'TOOLS' },
    ],
  },
  roomread: {
    label: 'Room Read',
    tag: 'INTERVIEW',
    Icon: Mic2,
    color: 'text-blue-400',
    accent: 'bg-blue-500 text-white',
    desc: 'Walk into every interview prepared, confident, and strategic.',
    articles: [
      { title: 'How to Research Any Company Before an Interview', desc: 'The 30-minute research framework that makes you sound like an insider — and earns the offer.', url: 'https://hbr.org/2019/10/how-to-prepare-for-any-type-of-job-interview', tag: 'RESEARCH' },
      { title: 'The STAR Method: Master Behavioural Questions', desc: 'Situation, Task, Action, Result — the one framework that works for every behavioural interview question.', url: 'https://www.themuse.com/advice/star-interview-method', tag: 'FRAMEWORK' },
      { title: 'Remote Interview Mastery: Setup, Presence & Follow-Up', desc: 'Camera angles, lighting, async follow-up templates, and the nuances of remote-first hiring panels.', url: 'https://www.toptal.com/remote/how-to-ace-a-remote-job-interview', tag: 'REMOTE' },
      { title: 'Tech Interview Handbook (Free, Open Source)', desc: 'The most comprehensive free guide to algorithms, system design, and behavioural prep for tech roles.', url: 'https://www.techinterviewhandbook.org/', tag: 'TECH' },
      { title: '30 Questions to Ask at the End of Any Interview', desc: 'The questions that signal intellectual curiosity, preparation, and genuine interest — sorted by interview type.', url: 'https://www.glassdoor.com/blog/good-questions-to-ask-in-an-interview/', tag: 'TACTICS' },
      { title: 'Pramp: Free Mock Interview Practice', desc: 'Practice real technical and behavioural interviews with peers. Free, live, and brutally honest feedback.', url: 'https://www.pramp.com/', tag: 'PRACTICE' },
    ],
  },
  ratecard: {
    label: 'Rate Card',
    tag: 'NEGOTIATE',
    Icon: DollarSign,
    color: 'text-yellow-400',
    accent: 'bg-yellow-500 text-black',
    desc: 'Never leave money on the table. Know your worth, own the conversation.',
    articles: [
      { title: '15 Rules for Negotiating a Job Offer (HBR)', desc: 'The definitive Harvard Business Review playbook for salary negotiation — used by professionals worldwide.', url: 'https://hbr.org/2014/06/15-rules-for-negotiating-a-job-offer', tag: 'NEGOTIATION' },
      { title: 'Real Compensation Data for Tech & AI Roles', desc: 'Verified salary, equity, and total comp data for hundreds of roles across global tech companies.', url: 'https://www.levels.fyi/', tag: 'DATA' },
      { title: 'LATAM Salary in USD: The Full Picture', desc: 'USD remote pay vs local rates — the real gap, how companies calculate it, and how to close it.', url: 'https://remote.com/blog/employer-of-record-latin-america', tag: 'LATAM' },
      { title: 'How to Choose Between Multiple Job Offers', desc: 'A structured decision framework for when you\'re lucky enough to have options and need to choose wisely.', url: 'https://www.glassdoor.com/blog/evaluate-job-offer/', tag: 'DECISION' },
      { title: 'Salary Negotiation Scripts That Actually Work', desc: 'Word-for-word email and call scripts for countering an offer, asking for more, and not blinking first.', url: 'https://www.glassdoor.com/blog/guide/salary-negotiation-scripts/', tag: 'SCRIPTS' },
    ],
  },
  zerocommute: {
    label: 'Zero-Commute Stack',
    tag: 'REMOTE',
    Icon: Globe,
    color: 'text-violet-400',
    accent: 'bg-violet-500 text-white',
    desc: 'Win at remote — from landing your first role to thriving long-term.',
    articles: [
      { title: 'GitLab\'s All-Remote Work Guide (Best in Class)', desc: 'The most detailed, battle-tested remote work guide on the internet — built by a 2,000-person remote company.', url: 'https://about.gitlab.com/company/culture/all-remote/guide/', tag: 'GUIDE' },
      { title: 'Best Job Boards for Remote LATAM Roles in 2026', desc: 'The top platforms where US and EU companies actively search for LATAM remote talent — ranked by quality.', url: 'https://remotive.com', tag: 'JOB BOARDS' },
      { title: 'How to Cold Message Recruiters on LinkedIn', desc: 'Message frameworks and templates for reaching out to US/EU recruiters and hiring managers without being ignored.', url: 'https://www.linkedin.com/pulse/how-message-recruiter-linkedin-get-response-job-search-guide/', tag: 'NETWORKING' },
      { title: 'Military Precision: Write Emails That Get Responses', desc: 'The BLUF (Bottom Line Up Front) method for async written communication — used by top remote teams.', url: 'https://hbr.org/2016/11/how-to-write-email-with-military-precision', tag: 'COMMUNICATION' },
      { title: 'Remote Work Toolkit: Productivity & Wellbeing', desc: 'Structure, tools, and routines for sustainable full-time remote work — without burning out or disappearing.', url: 'https://www.notion.com/templates/remote-work-toolkit', tag: 'WELLBEING' },
    ],
  },
  compound: {
    label: 'Compound Career',
    tag: 'LONG GAME',
    Icon: Compass,
    color: 'text-pink-400',
    accent: 'bg-pink-500 text-white',
    desc: 'Think beyond the next job. Build the career you actually want.',
    articles: [
      { title: 'CliftonStrengths: Discover What You\'re Best At', desc: 'One of the most widely-used strengths assessments. Understand your natural talents before your next move.', url: 'https://www.gallup.com/cliftonstrengths/en/strengthsquest.aspx', tag: 'SELF-DISCOVERY' },
      { title: '16 Personalities — Free Career Planning Assessment', desc: 'One of the most-used free personality assessments. Great for understanding your working style and fit.', url: 'https://www.16personalities.com/', tag: 'ASSESSMENT' },
      { title: 'How to Pivot Careers Without Starting From Zero', desc: 'The HBR framework for making a career transition that builds on existing experience rather than erasing it.', url: 'https://hbr.org/2021/07/how-to-make-a-career-pivot', tag: 'TRANSITION' },
      { title: 'Build Credibility Fast in the First 90 Days', desc: 'What to do — and avoid — in your first 3 months to establish trust and set the tone for your tenure.', url: 'https://hbr.org/2018/01/how-to-build-trust-in-the-first-90-days-of-a-new-job', tag: 'CULTURE' },
      { title: 'AI Upskilling for Long-Term Career Resilience', desc: 'The skills that separate candidates who thrive in the AI era from those who get left behind. Plan accordingly.', url: 'https://www.coursera.org/articles/ai-skills', tag: 'FUTURE-PROOF' },
      { title: 'WPro Workforce Daily — LATAM Market Intel', desc: 'Subscribe for weekly hiring signals, salary trends, and AI workforce data. Built for LATAM professionals.', url: 'https://latam-intel.vercel.app', tag: 'WPRO INTEL', wpro: true },
    ],
  },
  aileverage: {
    label: 'AI Leverage',
    tag: 'FUTURE-PROOF',
    Icon: Zap,
    color: 'text-violet-400',
    accent: 'bg-violet-500 text-white',
    desc: 'The skills that separate the hired from the overlooked in 2026.',
    articles: [
      { title: 'Top AI & ML Skills Every Tech Pro Needs in 2026', desc: 'Prompt engineering, RAG, fine-tuning, and agentic systems — now table stakes for senior roles globally.', url: 'https://www.coursera.org/articles/ai-skills', tag: 'SKILLS' },
      { title: 'Prompt Engineering for Developers (Free Course)', desc: 'Andrew Ng\'s 1-hour course on writing effective prompts for GPT-4, Claude, and Gemini. Career-changing.', url: 'https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/', tag: 'FREE COURSE' },
      { title: 'System Design Primer (Most-Starred GitHub Guide)', desc: 'The go-to open-source system design guide for senior engineering interviews at top companies worldwide.', url: 'https://github.com/donnemartin/system-design-primer', tag: 'INTERVIEWS' },
      { title: 'WEF Future of Jobs Report 2025', desc: 'Which roles are growing, which are declining, and the exact skills that will define hiring in 2025–2030.', url: 'https://www.weforum.org/publications/the-future-of-jobs-report-2025/', tag: 'MARKET DATA' },
      { title: 'GitHub Copilot: AI-Assisted Coding Guide', desc: 'How to use AI pair-programming tools effectively, improve your output, and put it convincingly on your CV.', url: 'https://docs.github.com/en/copilot', tag: 'TOOLS' },
      { title: 'Kaggle: Free Machine Learning Courses', desc: 'Hands-on ML courses from beginner to advanced — with certificates, datasets, and a global community.', url: 'https://www.kaggle.com/learn', tag: 'FREE COURSE' },
    ],
  },
};

const SECTION_ORDER: SectionKey[] = ['launch', 'strike', 'roomread', 'ratecard', 'zerocommute', 'compound', 'aileverage'];

// ── Market Value Teaser (free users) ─────────────────────────────────────────
function MarketValueTeaser({ lang = 'EN' }: { lang?: string }) {
  const tt = T[lang as keyof typeof T] || T.EN;
  const [role, setRole] = useState<RoleKey>('backend');
  const [country, setCountry] = useState<CountryCode>('BR');
  const [yearsExp, setYearsExp] = useState(4);
  const [shown, setShown] = useState(false);
  // Email gate
  const [email, setEmail] = useState('');
  const [captured, setCaptured] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const ROLE_OPTS: Record<string, { value: RoleKey; label: string }[]> = {
    EN: [
      { value: 'ai_ml', label: 'AI / ML Engineer' }, { value: 'llm', label: 'LLM Engineer' },
      { value: 'data', label: 'Data Scientist' }, { value: 'backend', label: 'Backend Engineer' },
      { value: 'frontend', label: 'Frontend Engineer' }, { value: 'fullstack', label: 'Full Stack' },
      { value: 'devops', label: 'DevOps / SRE' }, { value: 'product', label: 'Product Manager' },
      { value: 'data_eng', label: 'Data Engineer' }, { value: 'eng_manager', label: 'Eng. Manager' },
    ],
    ES: [
      { value: 'ai_ml', label: 'Ing. IA / ML' }, { value: 'llm', label: 'Ing. LLM' },
      { value: 'data', label: 'Científico de Datos' }, { value: 'backend', label: 'Ing. Backend' },
      { value: 'frontend', label: 'Ing. Frontend' }, { value: 'fullstack', label: 'Full Stack' },
      { value: 'devops', label: 'DevOps / SRE' }, { value: 'product', label: 'Product Manager' },
      { value: 'data_eng', label: 'Ing. de Datos' }, { value: 'eng_manager', label: 'Gerente de Ing.' },
    ],
    PT: [
      { value: 'ai_ml', label: 'Eng. IA / ML' }, { value: 'llm', label: 'Eng. LLM' },
      { value: 'data', label: 'Cientista de Dados' }, { value: 'backend', label: 'Eng. Backend' },
      { value: 'frontend', label: 'Eng. Frontend' }, { value: 'fullstack', label: 'Full Stack' },
      { value: 'devops', label: 'DevOps / SRE' }, { value: 'product', label: 'Product Manager' },
      { value: 'data_eng', label: 'Eng. de Dados' }, { value: 'eng_manager', label: 'Gerente de Eng.' },
    ],
  };
  const roleOpts = ROLE_OPTS[lang] || ROLE_OPTS.EN;

  const COUNTRY_OPTS: { value: CountryCode; flag: string; label: string }[] = [
    { value: 'BR', flag: '🇧🇷', label: 'Brasil / Brazil' }, { value: 'MX', flag: '🇲🇽', label: 'México / Mexico' },
    { value: 'CO', flag: '🇨🇴', label: 'Colombia' }, { value: 'AR', flag: '🇦🇷', label: 'Argentina' },
    { value: 'CL', flag: '🇨🇱', label: 'Chile' },
  ];

  const preview = computeMarketValue({
    role, country, yearsExp,
    englishLevel: 'conversational' as EnglishLevel,
    skills: [], hasRemoteExp: false, hasPortfolio: false,
  }, lang as 'EN' | 'ES' | 'PT');

  const fmt = (n: number) => '$' + n.toLocaleString();

  async function captureEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email || capturing) return;
    setCapturing(true);
    try {
      await Promise.allSettled([
        fetch('https://leads.wprotalents.lat/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, role, country, yearsExp, source: 'market-value-teaser' }),
        }),
        fetch('/api/subscribe-newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }),
      ]);
    } finally {
      setCaptured(true);
      setCapturing(false);
    }
  }

  return (
    <div className="border-b border-border bg-surface/30">
      <div className="px-6 md:px-10 py-6 max-w-7xl mx-auto">
        <div className="border border-accent/20 bg-accent/5">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-accent/10">
            <BarChart2 size={12} className="text-accent" />
            <span className="mono text-[9px] font-bold text-accent tracking-widest">{tt.teaserBadge}</span>
            <div className="h-px flex-1 bg-accent/10" />
            <span className="mono text-[7px] text-text/30">{tt.teaserFullDash}</span>
          </div>

          <div className="p-5">
            {/* Quick inputs */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div>
                <label className="mono text-[7px] text-text/30 block mb-1">{tt.teaserRole}</label>
                <select value={role} onChange={e => { setRole(e.target.value as RoleKey); setShown(false); }}
                  className="w-full bg-bg border border-border px-2 py-2 mono text-[10px] focus:outline-none focus:border-accent/50 transition-colors">
                  {roleOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mono text-[7px] text-text/30 block mb-1">{tt.teaserCountry}</label>
                <select value={country} onChange={e => { setCountry(e.target.value as CountryCode); setShown(false); }}
                  className="w-full bg-bg border border-border px-2 py-2 mono text-[10px] focus:outline-none focus:border-accent/50 transition-colors">
                  {COUNTRY_OPTS.map(o => <option key={o.value} value={o.value}>{o.flag} {o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mono text-[7px] text-text/30 block mb-1">{tt.teaserYearsExp}</label>
                <input type="number" min={0} max={30} value={yearsExp}
                  onChange={e => { setYearsExp(Number(e.target.value)); setShown(false); }}
                  className="w-full bg-bg border border-border px-2 py-2 mono text-[10px] focus:outline-none focus:border-accent/50 transition-colors" />
              </div>
            </div>

            <button
              onClick={() => setShown(true)}
              className="w-full py-2.5 bg-accent text-black mono text-[9px] font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mb-4"
            >
              <BarChart2 size={11} /> {tt.teaserCalculate}
            </button>

            <AnimatePresence>
              {shown && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {/* Market mid — local free, remote gated */}
                  <div className="grid grid-cols-2 gap-px bg-border">
                    <div className="bg-bg p-4 text-center">
                      <p className="mono text-[7px] text-text/30 mb-1">{tt.teaserLocalMid}</p>
                      <p className="text-xl font-black text-text">{fmt(preview.marketMid)}</p>
                      <p className="mono text-[7px] text-text/20 mt-0.5">{preview.seniorityLabel} · {tt.teaserPerYear}</p>
                    </div>
                    {captured ? (
                      <div className="bg-accent/5 p-4 text-center">
                        <p className="mono text-[7px] text-accent mb-1">{tt.teaserRemote}</p>
                        <p className="text-xl font-black text-accent">{fmt(preview.remoteMid)}</p>
                        <p className="mono text-[7px] text-text/20 mt-0.5">+{preview.remoteUplift}% {tt.teaserUplift}</p>
                      </div>
                    ) : (
                      <div className="bg-accent/5 p-4 flex flex-col items-center justify-center gap-2 relative">
                        {/* Blurred remote value behind the gate */}
                        <p className="mono text-[7px] text-accent mb-0.5">{tt.teaserRemote}</p>
                        <p className="text-xl font-black text-accent opacity-20 blur-[5px] select-none">{fmt(preview.remoteMid)}</p>
                        <form onSubmit={captureEmail} className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-3">
                          <Mail size={11} className="text-accent" />
                          <p className="mono text-[7px] text-text/50 text-center leading-tight">Enter email to unlock</p>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full bg-bg border border-accent/40 px-2 py-1 mono text-[9px] focus:outline-none focus:border-accent text-center placeholder:text-text/20"
                          />
                          <button
                            type="submit"
                            disabled={capturing}
                            className="w-full py-1 bg-accent text-black mono text-[8px] font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-1 disabled:opacity-50"
                          >
                            {capturing ? <Loader2 size={9} className="animate-spin" /> : <><ChevronRight size={9} /> {lang === 'PT' ? 'VER SALÁRIO' : lang === 'ES' ? 'VER SALARIO' : 'SEE REMOTE'}</>}
                          </button>
                        </form>
                      </div>
                    )}
                  </div>

                  {/* Locked sections */}
                  <div className="relative">
                    <div className="grid grid-cols-3 gap-px bg-border opacity-30 blur-[2px] pointer-events-none select-none">
                      {tt.teaserLockedSections.map((label: string) => (
                        <div key={label} className="bg-surface p-4 text-center">
                          <p className="mono text-[7px] text-text/30 mb-1">{label.toUpperCase()}</p>
                          <p className="text-lg font-black text-text">$••,•••</p>
                        </div>
                      ))}
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <Lock size={16} className="text-accent" />
                      <p className="mono text-[8px] font-bold text-text">{tt.teaserLockedLabel}</p>
                      <a
                        href="/members"
                        className="mono text-[8px] bg-accent text-black px-4 py-1.5 font-bold hover:opacity-90 transition-opacity flex items-center gap-1"
                      >
                        {tt.teaserUnlock} <ChevronRight size={9} />
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function CandidateResourcesPanel({ onLinkedInBoost }: { onLinkedInBoost: () => void }) {
  const [activeSection, setActiveSection] = useState<SectionKey>('launch');
  const section = PORTAL_SECTIONS[activeSection];

  return (
    <section className="border-b border-border bg-surface/20">
      <div className="px-6 md:px-10 pt-8 pb-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <Radio size={10} className="text-accent animate-pulse" />
          <span className="mono text-[9px] text-accent tracking-widest font-bold">CANDIDATE INTELLIGENCE // WPRO CAREER PORTAL</span>
          <div className="h-px flex-1 bg-border" />
          <a
            href="https://wprotalents.lat"
            target="_blank"
            rel="noopener noreferrer"
            className="mono text-[8px] text-text/30 hover:text-accent transition-colors flex items-center gap-1"
          >
            wprotalents.lat <ArrowUpRight size={8} />
          </a>
        </div>

        {/* Stats + Join CTA strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-border mb-6">
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
          {/* Get featured CTA as 5th stat */}
          <button
            onClick={onLinkedInBoost}
            className="bg-accent/10 border-l border-accent/20 px-4 py-3 flex items-center gap-2 hover:bg-accent/20 transition-colors group col-span-2 sm:col-span-1"
          >
            <Linkedin size={12} className="text-[#0077B5] shrink-0" />
            <div className="text-left">
              <div className="mono text-[8px] font-bold text-accent group-hover:text-accent">GET FEATURED</div>
              <div className="mono text-[7px] text-text/30">Free · 48h</div>
            </div>
            <ArrowUpRight size={9} className="text-accent ml-auto" />
          </button>
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
            {/* Section header */}
            <div className="flex items-center gap-3 mb-4">
              <span className={`mono text-[8px] font-bold ${section.color}`}>{section.tag}</span>
              <span className="mono text-[9px] text-text/30">{section.desc}</span>
            </div>

            {/* Articles grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {section.articles.map((a, i) => (
                <motion.a
                  key={i}
                  href={a.url === '#linkedin-boost' ? undefined : a.url}
                  onClick={a.url === '#linkedin-boost' ? (e) => { e.preventDefault(); onLinkedInBoost(); } : undefined}
                  target={a.url === '#linkedin-boost' ? undefined : '_blank'}
                  rel={a.url === '#linkedin-boost' ? undefined : 'noopener noreferrer'}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`group border bg-bg hover:border-accent/30 p-4 flex flex-col gap-2 transition-colors cursor-pointer ${
                    a.wpro ? 'border-accent/20 bg-accent/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`mono text-[7px] font-bold ${a.wpro ? 'text-accent' : section.color}`}>{a.tag}</span>
                    {a.wpro && (
                      <span className="mono text-[6px] bg-accent text-black px-1.5 py-0.5 font-black">WPRO</span>
                    )}
                  </div>
                  <p className="text-xs font-bold leading-snug group-hover:text-accent transition-colors flex-1">
                    {a.title}
                  </p>
                  <p className="mono text-[9px] text-text/40 leading-snug line-clamp-2">
                    {a.desc}
                  </p>
                  <span className="mono text-[7px] text-text/20 group-hover:text-accent transition-colors flex items-center gap-1 mt-1">
                    {a.url === '#linkedin-boost' ? 'SUBMIT' : 'READ'} <ArrowUpRight size={8} />
                  </span>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Career signal strip */}
        <div className="mt-6 border border-border bg-bg p-4">
          <div className="mono text-[8px] text-accent font-bold mb-3 flex items-center gap-2">
            <Lightbulb size={9} /> CAREER SIGNAL // WPRO WEEKLY INTEL
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: <TrendingUp size={11} className="text-accent shrink-0 mt-0.5" />, tip: 'Add AI / ML to your LinkedIn — searches for "prompt engineering" are up 400% YoY among US & EU recruiters.' },
              { icon: <Globe size={11} className="text-emerald-400 shrink-0 mt-0.5" />, tip: 'USD/EUR remote roles pay 3–5× local rates for senior LATAM engineers. Prioritise global-first companies.' },
              { icon: <Target size={11} className="text-blue-400 shrink-0 mt-0.5" />, tip: 'Recruiters spend ~7 seconds on a resume. Lead with measurable impact, not duties. Numbers > everything.' },
              { icon: <TrendingDown size={11} className="text-red-400 shrink-0 mt-0.5" />, tip: 'Roles most at risk from AI: manual QA, data entry, basic content writing, and junior frontend (2026 WEF).' },
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                {tip.icon}
                <p className="mono text-[9px] text-text/50 leading-relaxed">{tip.tip}</p>
              </div>
            ))}
          </div>

          {/* Newsletter CTA */}
          <div className="mt-4 pt-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Newspaper size={11} className="text-accent" />
              <p className="mono text-[9px] text-text/50">
                Get this intel weekly — <span className="text-accent font-bold">Workforce Daily</span> by WProTalents. Free.
              </p>
            </div>
            <a
              href="https://latam-intel.vercel.app"
              className="mono text-[8px] font-bold border border-accent text-accent px-4 py-1.5 hover:bg-accent hover:text-black transition-colors whitespace-nowrap flex items-center gap-1.5"
            >
              <Mail size={9} /> SUBSCRIBE FREE →
            </a>
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
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [matchPrefs, setMatchPrefs] = useState<MatchPrefs>(() => {
    try { return JSON.parse(localStorage.getItem(MATCH_KEY) || '{}'); } catch { return {}; }
  });
  const [matchOpen, setMatchOpen] = useState(true);

  const saveMatchPrefs = (prefs: MatchPrefs) => {
    setMatchPrefs(prefs);
    localStorage.setItem(MATCH_KEY, JSON.stringify(prefs));
  };

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

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

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

  // ── Smart match scoring ───────────────────────────────────────────────────
  const hasPrefs = matchPrefs.roleType || matchPrefs.seniority || matchPrefs.region;
  const topMatches = hasPrefs ? (() => {
    const roleKw: Record<string, string[]> = {
      'Software Engineer': ['engineer', 'developer', 'software', 'backend', 'frontend', 'fullstack', 'full stack', 'full-stack'],
      'Data':              ['data', 'analyst', 'scientist', 'analytics', 'bi ', 'business intelligence'],
      'DevOps':            ['devops', 'sre', 'infrastructure', 'cloud', 'aws', 'platform', 'reliability'],
      'Design':            ['design', 'ux', 'ui ', 'product design', 'figma'],
      'Product':           ['product manager', 'product owner', 'pm ', 'p.m.'],
      'Marketing':         ['marketing', 'growth', 'content', 'seo', 'paid'],
      'AI / ML':           ['ai ', 'ml ', 'machine learning', 'llm', 'deep learning', 'nlp', 'pytorch', 'tensorflow'],
    };
    const seniorKw: Record<string, string[]> = {
      'Junior':  ['junior', 'jr.', 'jr ', 'entry', 'associate', 'graduate'],
      'Mid':     ['mid', 'intermediate', 'ii ', 'level 2', 'iii '],
      'Senior':  ['senior', 'sr.', 'sr ', 'staff', 'principal'],
      'Lead':    ['lead', 'manager', 'head of', 'director', 'vp '],
    };
    return jobs
      .map(j => {
        const hay = `${j.title} ${j.tags} ${j.location}`.toLowerCase();
        let score = 0;
        if (matchPrefs.roleType) {
          const kws = roleKw[matchPrefs.roleType] ?? [];
          if (kws.some(k => hay.includes(k))) score += 3;
        }
        if (matchPrefs.seniority) {
          const kws = seniorKw[matchPrefs.seniority] ?? [];
          if (kws.some(k => hay.includes(k))) score += 2;
        }
        if (matchPrefs.region && matchPrefs.region !== 'Worldwide') {
          if (j.region === matchPrefs.region) score += 2;
        } else if (matchPrefs.region === 'Worldwide') {
          score += 1;
        }
        return { job: j, score };
      })
      .filter(x => x.score >= 3)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(x => x.job);
  })() : [];

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

      {/* LinkedIn Boost CTA — enhanced */}
      <div className="mb-5 border border-[#0077B5]/30 bg-[#0077B5]/5">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 bg-[#0077B5]/10 flex items-center justify-center shrink-0">
            <Linkedin size={16} className="text-[#0077B5]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="mono text-[9px] font-bold text-text/70">
              Get featured to <span className="text-[#0077B5]">23K+ US & EU hiring managers</span>
            </p>
            <p className="mono text-[8px] text-text/30 mt-0.5">WProTalents posts your profile on LinkedIn · Free · Within 48h · No recruiter fees</p>
          </div>
          <button
            onClick={() => setShowLinkedIn(true)}
            className="mono text-[8px] font-bold bg-[#0077B5] text-white px-4 py-2 hover:opacity-90 transition-opacity whitespace-nowrap flex items-center gap-1.5"
          >
            GET FEATURED <ArrowUpRight size={9} />
          </button>
        </div>
      </div>

      {/* ── Quick Match bar ─────────────────────────────────────── */}
      <div className="border border-border bg-surface/30 p-3 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={10} className="text-accent" />
          <span className="mono text-[9px] font-bold text-accent tracking-widest uppercase">{t.matchTitle}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {/* Role Type */}
          <div>
            <label className="mono text-[7px] text-text/30 uppercase tracking-widest block mb-1">{t.matchRoleType}</label>
            <select
              value={matchPrefs.roleType || ''}
              onChange={e => saveMatchPrefs({ ...matchPrefs, roleType: e.target.value })}
              className="w-full bg-bg border border-border px-2 py-1.5 mono text-[10px] focus:outline-none focus:border-accent/40 transition-colors text-text"
            >
              <option value="">Any</option>
              {MATCH_ROLE_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {/* Seniority */}
          <div>
            <label className="mono text-[7px] text-text/30 uppercase tracking-widest block mb-1">{t.matchSeniority}</label>
            <select
              value={matchPrefs.seniority || ''}
              onChange={e => saveMatchPrefs({ ...matchPrefs, seniority: e.target.value })}
              className="w-full bg-bg border border-border px-2 py-1.5 mono text-[10px] focus:outline-none focus:border-accent/40 transition-colors text-text"
            >
              <option value="">Any</option>
              {MATCH_SENIORITIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {/* Region */}
          <div>
            <label className="mono text-[7px] text-text/30 uppercase tracking-widest block mb-1">{t.matchRegion}</label>
            <select
              value={matchPrefs.region || ''}
              onChange={e => saveMatchPrefs({ ...matchPrefs, region: e.target.value })}
              className="w-full bg-bg border border-border px-2 py-1.5 mono text-[10px] focus:outline-none focus:border-accent/40 transition-colors text-text"
            >
              <option value="">Any</option>
              {MATCH_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Top 10 matches ───────────────────────────────────────── */}
      {hasPrefs && topMatches.length >= 3 && (
        <div className="border border-accent/20 bg-accent/5 mb-5">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-accent/10">
            <Star size={10} className="text-accent" />
            <span className="mono text-[9px] font-bold text-accent tracking-widest uppercase flex-1">{t.matchTopPicks}</span>
            <button onClick={() => setMatchOpen(v => !v)} className="mono text-[8px] text-text/30 hover:text-accent transition-colors">
              {matchOpen ? t.matchCollapse : t.matchExpand}
            </button>
          </div>
          {matchOpen && (
            <div className="divide-y divide-accent/10">
              {topMatches.map(job => (
                <a key={job.id} href={job.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-start gap-3 px-4 py-3 hover:bg-accent/5 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="mono text-[7px] font-bold text-accent bg-accent/10 px-1.5 py-0.5">{t.matchBadge}</span>
                      <h4 className="mono text-[10px] font-bold text-text group-hover:text-accent transition-colors truncate">{job.title}</h4>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="mono text-[8px] text-text/40">{job.company}</span>
                      {job.location && <span className="mono text-[8px] text-text/30">· {job.location}</span>}
                      {job.salary && <span className="mono text-[8px] text-green-400/70">· {job.salary}</span>}
                    </div>
                  </div>
                  <ExternalLink size={10} className="text-text/20 group-hover:text-accent shrink-0 mt-1 transition-colors" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
      {hasPrefs && topMatches.length < 3 && !loading && (
        <p className="mono text-[8px] text-text/30 mb-4">{t.matchEmpty}</p>
      )}

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
        {saved.size > 0 && (
          <span className="mono text-[8px] px-2.5 py-1 border border-accent/20 text-accent/60">
            <BookmarkCheck size={9} className="inline mr-1" />{saved.size} saved
          </span>
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
                const isSaved = saved.has(job.id);
                return (
                  <motion.a
                    key={job.id}
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.015, 0.3) }}
                    className="group border border-border bg-surface hover:border-accent/40 hover:bg-surface/80 transition-colors flex flex-col cursor-pointer relative"
                  >
                    {/* Save button */}
                    <button
                      onClick={(e) => toggleSave(job.id, e)}
                      className={`absolute top-3 right-3 z-10 transition-colors ${isSaved ? 'text-accent' : 'text-text/10 group-hover:text-text/30 hover:!text-accent'}`}
                      title={isSaved ? 'Saved' : 'Save job'}
                    >
                      {isSaved ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
                    </button>

                    <div className="p-4 flex flex-col flex-1 gap-2">
                      <div className="flex items-center justify-between pr-5">
                        <span className={`mono text-[7px] border px-1.5 py-0.5 ${rs}`}>{job.region}</span>
                        {ago && <span className="mono text-[7px] text-text/15 flex items-center gap-0.5"><Clock size={7} />{ago}</span>}
                      </div>
                      <div className="mono text-[8px] text-accent/60 truncate flex items-center gap-1 pr-5">
                        <Building2 size={8} className="shrink-0" />{job.company}
                      </div>
                      <h3 className="text-xs font-bold leading-snug line-clamp-2 group-hover:text-accent transition-colors flex-1 pr-5">
                        {job.title}
                      </h3>
                      <div className="mono text-[8px] text-text/25 flex items-center gap-1 truncate">
                        <MapPin size={8} className="shrink-0" />{job.location}
                      </div>
                      {job.salary && <div className="mono text-[8px] text-accent/70 font-bold">{job.salary}</div>}
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

          {/* Bottom CTA after jobs */}
          {!loading && !error && filtered.length > 0 && (
            <div className="mt-8 border border-accent/10 bg-accent/5 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="mono text-[9px] font-bold text-accent mb-1">WANT COMPANIES TO FIND YOU FIRST?</p>
                <p className="mono text-[8px] text-text/40">WProTalents features vetted LATAM candidates to US & EU hiring managers. Free.</p>
              </div>
              <button
                onClick={() => setShowLinkedIn(true)}
                className="mono text-[8px] font-bold bg-accent text-black px-5 py-2.5 hover:opacity-90 transition-opacity whitespace-nowrap flex items-center gap-2"
              >
                <Linkedin size={11} /> GET FEATURED →
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
  const [showLinkedIn, setShowLinkedIn] = useState(false);
  return (
    <div className="min-h-screen bg-bg">
      <MarketValueTeaser lang={lang} />
      <CandidateResourcesPanel onLinkedInBoost={() => setShowLinkedIn(true)} />
      <JobPortal lang={lang} t={t} onPostVacancy={() => setShowVacancy(true)} />
      <PostVacancyModal isOpen={showVacancy} onClose={() => setShowVacancy(false)} lang={lang} />
      <LinkedInBoostModal isOpen={showLinkedIn} onClose={() => setShowLinkedIn(false)} lang={lang} />
    </div>
  );
}
