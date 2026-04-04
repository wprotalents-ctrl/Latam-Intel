/// <reference types="vite/client" />
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock, Crown, CreditCard, Coins, ArrowLeft, Download,
  ExternalLink, FileText, BarChart2, Wrench, BookOpen,
  Users, Calendar, ChevronRight, Star, Zap, Globe,
  TrendingUp, BriefcaseBusiness, Mail, Phone, Loader2,
  Check, Shield, Clock, ChevronDown, ChevronUp
} from 'lucide-react';
import { auth } from '../firebase';

import { getUserProfile, getNewsletterIssues, getMemberResources } from '../lib/supabase';
import type { SupabaseUser, NewsletterIssue, MemberResource } from '../lib/supabase';
import type { User } from 'firebase/auth';

// @ts-ignore

// ─── Category colors ───────────────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  'Workforce Daily': { color: 'text-blue-400',  bg: 'bg-blue-400/10',  label: 'WFD' },
  'TechJobs':        { color: 'text-green-400', bg: 'bg-green-400/10', label: 'TECH' },
  'AI Impact':       { color: 'text-purple-400',bg: 'bg-purple-400/10',label: 'AI' },
  'Recruitment':     { color: 'text-orange-400',bg: 'bg-orange-400/10',label: 'REC' },
  'HR':              { color: 'text-pink-400',  bg: 'bg-pink-400/10',  label: 'HR' },
};

const RESOURCE_ICONS: Record<string, any> = {
  'Salary Data': BarChart2,
  'AI Tools':    Wrench,
  'Playbooks':   BookOpen,
  'Templates':   FileText,
  'Reports':     TrendingUp,
};

// ─── Paywall Component ────────────────────────────────────────────────────────
function PaywallGate({ user }: { user: User | null }) {
  const [loading, setLoading] = useState<'card' | 'crypto' | null>(null);

  const handleCard = async () => {
    if (!user) return;
    setLoading('card');
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, customerEmail: user.email }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (e) { console.error(e); }
    finally { setLoading(null); }
  };

  const handleCrypto = async () => {
    if (!user) return;
    setLoading('crypto');
    try {
      const res = await fetch('/api/create-crypto-charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, userEmail: user.email }),
      });
      const { url } = await res.json();
      window.location.href = url;
    } catch (e) { console.error(e); }
    finally { setLoading(null); }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full"
      >
        {/* Lock icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-20 h-20 bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Lock className="text-accent" size={36} />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent flex items-center justify-center">
              <Crown size={12} className="text-black" />
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tighter uppercase mb-3">
            Members Only
          </h1>
          <p className="text-text/60 leading-relaxed">
            The full Workforce Daily archive, LATAM salary data, AI recruitment tools,
            and private WPro resources — all for <span className="text-accent font-bold">$29/month</span>.
          </p>
        </div>

        {/* What you get */}
        <div className="bg-surface border border-border p-6 mb-6 space-y-3">
          {[
            { icon: FileText,    text: 'Full Workforce Daily archive — every issue, fully readable' },
            { icon: BarChart2,   text: 'LATAM Salary Intelligence — 40+ roles, 5 countries' },
            { icon: Wrench,      text: 'AI Recruitment Toolkit — prompts, scorecards, workflows' },
            { icon: BookOpen,    text: 'WPro Playbooks — LATAM hiring strategies that actually work' },
            { icon: BriefcaseBusiness, text: 'Private WPro job board — roles not posted publicly' },
          ].map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="shrink-0 w-5 h-5 bg-accent/10 flex items-center justify-center mt-0.5">
                <Check size={10} className="text-accent" />
              </div>
              <span className="text-sm text-text/70">{text}</span>
            </div>
          ))}
        </div>

        {/* Payment buttons */}
        {user ? (
          <div className="space-y-3">
            <button
              onClick={handleCard}
              disabled={loading !== null}
              className="w-full py-4 bg-accent text-black font-bold hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CreditCard size={18} />
              {loading === 'card' ? 'Connecting...' : 'Subscribe — $29/mo with Card'}
            </button>
            <button
              onClick={handleCrypto}
              disabled={loading !== null}
              className="w-full py-4 bg-surface border border-border text-text font-bold hover:border-accent/40 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Coins size={18} />
              {loading === 'crypto' ? 'Connecting...' : 'Pay with Crypto (USDC / BTC / ETH)'}
            </button>
            <p className="text-center text-xs text-text/30 flex items-center justify-center gap-1">
              <Shield size={10} /> Secure · Cancel anytime · Instant access
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-text/50 text-sm mb-4">Sign in with Google to subscribe</p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-auth-modal'))}
              className="px-8 py-3 bg-text text-bg font-bold hover:opacity-90 transition"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Back link */}
        <div className="text-center mt-8">
          <button
            onClick={() => window.location.href = '/'}
            className="text-sm text-text/40 hover:text-accent transition flex items-center gap-1 mx-auto"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Newsletter Archive ───────────────────────────────────────────────────────
function NewsletterArchive({ issues }: { issues: NewsletterIssue[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (issues.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-border">
        <Clock size={32} className="text-text/20 mx-auto mb-3" />
        <p className="text-text/40 mono text-sm">First issue drops next Monday at 8am</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {issues.map((issue) => {
        const cat = CATEGORY_CONFIG[issue.category] || CATEGORY_CONFIG['Workforce Daily'];
        const isOpen = expanded === issue.id;

        return (
          <motion.div
            key={issue.id}
            layout
            className="bg-surface border border-border hover:border-accent/30 transition-colors"
          >
            <button
              onClick={() => setExpanded(isOpen ? null : issue.id)}
              className="w-full text-left p-6 flex items-start gap-4"
            >
              <div className={`shrink-0 px-2 py-1 mono text-[9px] font-bold ${cat.bg} ${cat.color}`}>
                {cat.label}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="mono text-[10px] text-text/30">{issue.week_label}</span>
                  {issue.is_hiring_signal && (
                    <span className="px-1.5 py-0.5 bg-green-400/10 text-green-400 mono text-[8px] font-bold">
                      HIRING SIGNAL
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-text leading-tight pr-8">{issue.subject_line}</h3>
                <p className="text-sm text-text/50 mt-1 line-clamp-2">{issue.free_teaser}</p>
              </div>
              {isOpen ? <ChevronUp size={16} className="shrink-0 text-text/40 mt-1" /> : <ChevronDown size={16} className="shrink-0 text-text/40 mt-1" />}
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 border-t border-border pt-6 space-y-6">
                    {/* Slack hook */}
                    {issue.slack_hook && (
                      <div className="bg-bg border border-border p-4">
                        <p className="mono text-[9px] text-accent mb-2">SLACK HOOK · copy & share</p>
                        <p className="text-sm text-text/70 italic">"{issue.slack_hook}"</p>
                      </div>
                    )}

                    {/* Full paid analysis */}
                    {issue.paid_analysis ? (
                      <div className="space-y-4">
                        {Array.isArray(issue.paid_analysis.sections)
                          ? issue.paid_analysis.sections.map((section: any, i: number) => (
                            <div key={i}>
                              <h4 className="font-bold text-text mb-2">{section.heading}</h4>
                              {section.paragraphs?.map((p: string, j: number) => (
                                <p key={j} className="text-text/70 text-sm leading-relaxed mb-2">{p}</p>
                              ))}
                              {section.soWhat && (
                                <div className="mt-2 pl-4 border-l-2 border-accent">
                                  <p className="mono text-[9px] text-accent mb-1">SO WHAT?</p>
                                  <p className="text-sm text-text font-medium">{section.soWhat}</p>
                                </div>
                              )}
                            </div>
                          ))
                          : <p className="text-text/70 text-sm leading-relaxed">{JSON.stringify(issue.paid_analysis)}</p>
                        }
                      </div>
                    ) : (
                      <p className="text-text/70 text-sm leading-relaxed">{issue.free_teaser}</p>
                    )}

                    {/* Country codes */}
                    {issue.country_codes && issue.country_codes.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Globe size={12} className="text-text/30" />
                        {issue.country_codes.map((c) => (
                          <span key={c} className="mono text-[9px] px-2 py-0.5 border border-border text-text/40">
                            {c}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Beehiiv link */}
                    {issue.beehiiv_web_url && (
                      <a
                        href={issue.beehiiv_web_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs text-accent hover:underline"
                      >
                        View in browser <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Resources Grid ───────────────────────────────────────────────────────────
function ResourcesGrid({ resources }: { resources: MemberResource[] }) {
  const grouped = resources.reduce((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {} as Record<string, MemberResource[]>);

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([category, items]) => {
        const Icon = RESOURCE_ICONS[category] || FileText;
        return (
          <div key={category}>
            <div className="flex items-center gap-2 mb-4">
              <Icon size={16} className="text-accent" />
              <h3 className="mono text-[10px] font-bold text-text/60 uppercase tracking-widest">{category}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((r) => (
                <div key={r.id} className="bg-surface border border-border p-5 hover:border-accent/30 transition-colors group">
                  <h4 className="font-bold text-text mb-2 group-hover:text-accent transition-colors">{r.title}</h4>
                  {r.description && <p className="text-sm text-text/50 mb-4">{r.description}</p>}
                  <div className="flex gap-3">
                    {r.file_url && (
                      <a
                        href={r.file_url}
                        className="flex items-center gap-1 text-xs bg-accent text-black px-3 py-1.5 font-bold hover:opacity-90 transition"
                      >
                        <Download size={12} /> Download
                      </a>
                    )}
                    {r.external_url && (
                      <a
                        href={r.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs border border-border px-3 py-1.5 font-bold hover:border-accent/40 transition"
                      >
                        <ExternalLink size={12} /> Open
                      </a>
                    )}
                    {!r.file_url && !r.external_url && (
                      <span className="text-xs text-text/30 mono">Coming soon</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Salary Snapshot ─────────────────────────────────────────────────────────
const SALARY_DATA = [
  { role: 'AI/ML Engineer', country: 'BR', min: 8000, max: 18000, currency: 'USD/yr', remote: true },
  { role: 'AI/ML Engineer', country: 'MX', min: 7000, max: 16000, currency: 'USD/yr', remote: true },
  { role: 'AI/ML Engineer', country: 'CO', min: 6000, max: 14000, currency: 'USD/yr', remote: true },
  { role: 'Data Scientist', country: 'BR', min: 7000, max: 15000, currency: 'USD/yr', remote: true },
  { role: 'Data Scientist', country: 'AR', min: 5000, max: 12000, currency: 'USD/yr', remote: true },
  { role: 'LLM Engineer',  country: 'BR', min: 10000, max: 22000, currency: 'USD/yr', remote: true },
  { role: 'LLM Engineer',  country: 'MX', min: 9000,  max: 20000, currency: 'USD/yr', remote: true },
  { role: 'Head of AI',    country: 'BR', min: 18000, max: 40000, currency: 'USD/yr', remote: true },
  { role: 'Head of AI',    country: 'CO', min: 14000, max: 32000, currency: 'USD/yr', remote: true },
  { role: 'AI Recruiter',  country: 'CL', min: 4000,  max: 9000,  currency: 'USD/yr', remote: true },
  { role: 'MLOps Engineer', country: 'BR', min: 9000, max: 18000, currency: 'USD/yr', remote: true },
  { role: 'AI Product Manager', country: 'MX', min: 8000, max: 17000, currency: 'USD/yr', remote: true },
];

const FLAG: Record<string, string> = { BR: '🇧🇷', MX: '🇲🇽', CO: '🇨🇴', AR: '🇦🇷', CL: '🇨🇱' };

function SalaryTable() {
  const [filter, setFilter] = useState('All');
  const countries = ['All', 'BR', 'MX', 'CO', 'AR', 'CL'];
  const filtered = filter === 'All' ? SALARY_DATA : SALARY_DATA.filter(d => d.country === filter);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 overflow-x-auto">
        {countries.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-4 py-2 mono text-[10px] border whitespace-nowrap transition ${
              filter === c ? 'bg-accent text-black border-accent font-bold' : 'border-border text-text/50 hover:border-accent/30'
            }`}
          >
            {c !== 'All' ? `${FLAG[c]} ${c}` : 'All'}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left pb-3 pr-4 mono text-[9px] text-text/40 font-bold uppercase">Role</th>
              <th className="text-left pb-3 pr-4 mono text-[9px] text-text/40 font-bold uppercase">Country</th>
              <th className="text-left pb-3 pr-4 mono text-[9px] text-text/40 font-bold uppercase">Range (USD/yr)</th>
              <th className="text-left pb-3 mono text-[9px] text-text/40 font-bold uppercase">Type</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                <td className="py-3 pr-4 font-medium text-text">{d.role}</td>
                <td className="py-3 pr-4 text-text/60">{FLAG[d.country]} {d.country}</td>
                <td className="py-3 pr-4 font-mono text-accent font-bold">
                  ${d.min.toLocaleString()} – ${d.max.toLocaleString()}
                </td>
                <td className="py-3">
                  {d.remote && (
                    <span className="px-2 py-0.5 bg-green-400/10 text-green-400 mono text-[8px] font-bold">REMOTE</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-surface border border-border">
        <p className="text-xs text-text/40">
          Data sourced from WProTalents active search mandates, Glassdoor LATAM, LinkedIn Salary, and direct
          candidate conversations (Q1 2026). Ranges represent base salary for remote roles paid in USD.
          Equity, bonuses, and benefits not included. Updated quarterly.
        </p>
      </div>
    </div>
  );
}

// ─── WPro CTA ─────────────────────────────────────────────────────────────────
function WProCTA() {
  return (
    <div className="bg-surface border border-accent/20 p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
          <Users size={24} className="text-accent" />
        </div>
        <div>
          <h3 className="font-black text-xl tracking-tighter uppercase mb-1">Hiring in LATAM?</h3>
          <p className="text-text/60 text-sm">
            23,000+ vetted AI/tech professionals. We fill senior roles in 21 days or less.
            US & EU firms only.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { stat: '21 days', label: 'Avg. time to fill' },
          { stat: '23K+', label: 'Vetted professionals' },
          { stat: '94%', label: 'Offer acceptance rate' },
        ].map(({ stat, label }) => (
          <div key={label} className="text-center py-4 border border-border">
            <div className="text-2xl font-black text-accent">{stat}</div>
            <div className="mono text-[9px] text-text/40 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href="https://wprotalents.lat"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-4 bg-accent text-black font-bold text-center hover:opacity-90 transition flex items-center justify-center gap-2"
        >
          Start a Search <ChevronRight size={16} />
        </a>
        <a
          href="mailto:info@wprotalents.lat"
          className="flex-1 py-4 border border-border font-bold text-center hover:border-accent/40 transition flex items-center justify-center gap-2"
        >
          <Mail size={16} /> Email Juan Directly
        </a>
      </div>

      <p className="mono text-[9px] text-text/30 text-center mt-4">
        Founder-led · Retained search · Senior roles only · 20yr LATAM track record
      </p>
    </div>
  );
}

// ─── Main MembersPage ─────────────────────────────────────────────────────────
type Tab = 'archive' | 'salary' | 'resources' | 'wpro';

export default function MembersPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('archive');
  const [issues, setIssues] = useState<NewsletterIssue[]>([]);
  const [resources, setResources] = useState<MemberResource[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Auth listener
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        const p = await getUserProfile(u.uid);
        setProfile(p);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const isPremium = profile?.subscription_status === 'premium';

  // Load data once confirmed premium
  useEffect(() => {
    if (!isPremium) return;
    setDataLoading(true);
    Promise.all([
      getNewsletterIssues(true),
      getMemberResources(),
    ]).then(([iss, res]) => {
      setIssues(iss);
      setResources(res);
      setDataLoading(false);
    });
  }, [isPremium]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="text-accent animate-spin" size={32} />
      </div>
    );
  }

  if (!user || !isPremium) {
    return <PaywallGate user={user} />;
  }

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: 'archive',   label: 'Newsletter Archive', icon: FileText },
    { id: 'salary',    label: 'Salary Intel',       icon: BarChart2 },
    { id: 'resources', label: 'Resources',          icon: BookOpen },
    { id: 'wpro',      label: 'Hire with WPro',     icon: Users },
  ];

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.href = '/'}
              className="text-text/40 hover:text-accent transition"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              <Crown size={16} className="text-accent" />
              <span className="font-black tracking-tighter uppercase">LATAM INTEL · Members</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-2 py-1 bg-accent/10 border border-accent/20 mono text-[9px] text-accent font-bold">
              EXECUTIVE
            </div>
            {user.photoURL && (
              <img src={user.photoURL} alt={user.displayName || ''} className="w-8 h-8 rounded-full" />
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tighter uppercase mb-1">
            Welcome back, {user.displayName?.split(' ')[0] || 'Member'}
          </h1>
          <p className="text-text/50 text-sm">
            Your exclusive LATAM AI workforce intelligence hub.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border mb-8 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-3 mono text-[10px] font-bold whitespace-nowrap border-b-2 transition-all ${
                activeTab === id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-text/50 hover:text-text'
              }`}
            >
              <Icon size={14} />
              {label.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {dataLoading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="text-accent animate-spin" size={32} />
              </div>
            ) : (
              <>
                {activeTab === 'archive' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-black uppercase tracking-tighter">Workforce Daily Archive</h2>
                      <span className="mono text-[9px] text-text/30">{issues.length} issues</span>
                    </div>
                    <NewsletterArchive issues={issues} />
                  </div>
                )}
                {activeTab === 'salary' && (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-xl font-black uppercase tracking-tighter mb-1">LATAM Salary Intelligence</h2>
                      <p className="text-sm text-text/50">AI & tech roles, 5 countries. Updated Q1 2026.</p>
                    </div>
                    <SalaryTable />
                  </div>
                )}
                {activeTab === 'resources' && (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-xl font-black uppercase tracking-tighter mb-1">WPro Resources</h2>
                      <p className="text-sm text-text/50">Playbooks, templates, and tools — built from 20 years of LATAM recruiting.</p>
                    </div>
                    <ResourcesGrid resources={resources} />
                  </div>
                )}
                {activeTab === 'wpro' && (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-xl font-black uppercase tracking-tighter mb-1">Hire with WProTalents</h2>
                      <p className="text-sm text-text/50">As a member, you get priority access to our founder-led search service.</p>
                    </div>
                    <WProCTA />
                  </div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
