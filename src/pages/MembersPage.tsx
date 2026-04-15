/// <reference types="vite/client" />
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock, Crown, Coins, ArrowLeft, Download,
  ExternalLink, FileText, BarChart2, Wrench, BookOpen,
  Users, Calendar, ChevronRight, Star, Zap, Globe,
  TrendingUp, BriefcaseBusiness, Mail, Phone, Loader2,
  Check, Shield, Clock, ChevronDown, ChevronUp
} from 'lucide-react';
import { auth, db } from '../firebase';

import { getUserProfile, getMemberResources } from '../lib/supabase';
import CandidateIntel from '../components/CandidateIntel';
import ClientJobPostForm, { type ClientJobPostData } from '../components/ClientJobPostForm';
import ClientInsightsCard from '../components/ClientInsightsCard';
import { generateHiringPlan, type HiringPlan } from '../lib/hiringPlan';
import { estimateNetworkReach, type NetworkReach } from '../lib/networkReach';
import type { SupabaseUser, MemberResource } from '../lib/supabase';
import type { User } from 'firebase/auth';
import { AuthModal } from '../components/AuthModal';

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

// ─── Sign-in Gate (non-logged-in users only) ─────────────────────────────────
function PaywallGate({ user: _user }: { user: User | null }) {

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-accent/30 bg-accent/5 mono text-[9px] text-accent">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            BETA ACCESS · FREE
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tighter uppercase mb-3">Members Area</h1>
          <p className="text-text/50 text-sm leading-relaxed">
            Sign in to unlock LATAM salary data, the US hiring signal, remote salary calculator, and AI job market briefings — free during beta.
          </p>
        </div>

        {/* Perks preview */}
        <div className="bg-surface border border-border p-5 mb-6 space-y-2.5">
          {[
            'LATAM Salary Benchmarks — 40+ roles · 5 countries',
            'US Hiring Signal — powered by live BLS data',
            'Remote Salary Calculator — what US companies pay vs what you charge',
            'AI Job Market Briefings — weekly signal, no fluff',
            'WPro Playbooks — 20 years of LATAM recruiting strategy',
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="shrink-0 w-4 h-4 bg-accent/10 flex items-center justify-center mt-0.5">
                <Check size={8} className="text-accent" />
              </div>
              <span className="mono text-[9px] text-text/60">{text}</span>
            </div>
          ))}
        </div>

        {/* Sign-in CTA */}
        <div className="text-center space-y-3">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('wpro-open-auth'))}
            className="w-full py-4 bg-accent text-black font-black hover:opacity-90 transition mono text-[11px] tracking-widest"
          >
            SIGN IN · GET FREE BETA ACCESS
          </button>
          <p className="mono text-[8px] text-text/25">No credit card · No commitment · Founding Member pricing coming soon</p>
        </div>

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

// ─── Access Tab ──────────────────────────────────────────────────────────────
// ─── CoinGecko: Crypto price ticker for AccessTab ────────────────────────────
interface CryptoPrice { id: string; symbol: string; usd: number; usd_24h_change: number; }

function useCryptoPrices() {
  const [prices, setPrices] = React.useState<CryptoPrice[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    async function fetchPrices() {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,usd-coin,tether&vs_currencies=usd&include_24hr_change=true'
        );
        if (!res.ok) throw new Error('coingecko failed');
        const data = await res.json();
        if (cancelled) return;
        const built: CryptoPrice[] = [
          { id: 'bitcoin',  symbol: 'BTC',  usd: data.bitcoin?.usd  || 0, usd_24h_change: data.bitcoin?.usd_24h_change  || 0 },
          { id: 'ethereum', symbol: 'ETH',  usd: data.ethereum?.usd || 0, usd_24h_change: data.ethereum?.usd_24h_change || 0 },
          { id: 'usd-coin', symbol: 'USDC', usd: data['usd-coin']?.usd || 1, usd_24h_change: data['usd-coin']?.usd_24h_change || 0 },
          { id: 'tether',   symbol: 'USDT', usd: data.tether?.usd   || 1, usd_24h_change: data.tether?.usd_24h_change   || 0 },
        ].filter(p => p.usd > 0);
        setPrices(built);
      } catch { /* silently fail — payment works without prices */ }
      finally { if (!cancelled) setLoading(false); }
    }
    fetchPrices();
    const id = setInterval(fetchPrices, 5 * 60 * 1000); // refresh every 5 min
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return { prices, loading };
}

function CryptoTicker({ lang = 'EN' }: { lang?: string }) {
  const { prices, loading } = useCryptoPrices();
  const label: Record<string, string> = { EN: 'ACCEPTED CURRENCIES · LIVE RATES', ES: 'CRIPTOS ACEPTADAS · PRECIOS EN VIVO', PT: 'CRIPTOS ACEITAS · PREÇOS AO VIVO' };

  if (loading) return (
    <div className="border border-border p-4 animate-pulse">
      <div className="h-3 bg-surface w-40 mb-3" />
      <div className="grid grid-cols-4 gap-2">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-surface" />)}</div>
    </div>
  );
  if (prices.length === 0) return null;

  return (
    <div className="border border-border p-4">
      <p className="mono text-[8px] text-text/30 mb-3 tracking-widest">{label[lang] || label.EN}</p>
      <div className="grid grid-cols-4 gap-2">
        {prices.map(p => {
          const up = p.usd_24h_change >= 0;
          const isStable = p.symbol === 'USDC' || p.symbol === 'USDT';
          return (
            <div key={p.id} className="bg-surface border border-border p-2 flex flex-col items-center">
              <span className="mono text-[8px] font-bold text-accent">{p.symbol}</span>
              <span className="mono text-[10px] font-black text-text mt-1">
                {isStable ? '$1.00' : `$${p.usd.toLocaleString('en', { maximumFractionDigits: 0 })}`}
              </span>
              {!isStable && (
                <span className={`mono text-[7px] ${up ? 'text-green-400' : 'text-red-400'}`}>
                  {up ? '+' : ''}{p.usd_24h_change.toFixed(1)}%
                </span>
              )}
              {isStable && <span className="mono text-[7px] text-text/30">stable</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface AccessTabProps {
  user: User;
  executiveUntil: Date | null;
  lang: 'EN' | 'ES' | 'PT';
}

function AccessTab({ user, executiveUntil, lang }: AccessTabProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const T = {
    EN: {
      active: 'Executive Access — Active',
      expires: 'Expires',
      daysLeft: 'days remaining',
      renew: 'Renew for another 30 days — $29 USDC',
      noAccess: 'No active subscription',
      payNow: 'Get Executive Access — $29 USDC',
      payDesc: 'Pay once in crypto. Get 30 days of full Executive access — salary data, AI tools, and market intelligence.',
      accepted: 'Accepted: USDC · USDT · ETH · BTC · DAI',
      connecting: 'Opening payment...',
      how: 'How it works',
      step1: 'Click the button — a secure Coinbase Commerce page opens.',
      step2: 'Pay $29 in any stablecoin or crypto.',
      step3: 'Access activates automatically within seconds of confirmation.',
      noStripe: 'No Stripe. No card. No subscription traps.',
      history: 'Payment History',
      pending: 'pending',
      confirmed: 'confirmed',
    },
    ES: {
      active: 'Acceso Ejecutivo — Activo',
      expires: 'Vence el',
      daysLeft: 'días restantes',
      renew: 'Renovar 30 días más — $29 USDC',
      noAccess: 'Sin suscripción activa',
      payNow: 'Obtener Acceso Ejecutivo — $29 USDC',
      payDesc: 'Pago único en cripto. 30 días de acceso completo — datos salariales, herramientas IA e inteligencia de mercado.',
      accepted: 'Aceptamos: USDC · USDT · ETH · BTC · DAI',
      connecting: 'Abriendo pago...',
      how: 'Cómo funciona',
      step1: 'Haz clic — se abre una página segura de Coinbase Commerce.',
      step2: 'Paga $29 en cualquier stablecoin o cripto.',
      step3: 'El acceso se activa automáticamente en segundos.',
      noStripe: 'Sin Stripe. Sin tarjeta. Sin trampas de suscripción.',
      history: 'Historial de Pagos',
      pending: 'pendiente',
      confirmed: 'confirmado',
    },
    PT: {
      active: 'Acesso Executivo — Ativo',
      expires: 'Expira em',
      daysLeft: 'dias restantes',
      renew: 'Renovar por mais 30 dias — $29 USDC',
      noAccess: 'Sem assinatura ativa',
      payNow: 'Obter Acesso Executivo — $29 USDC',
      payDesc: 'Pagamento único em cripto. 30 dias de acesso completo — dados salariais, ferramentas de IA e inteligência de mercado.',
      accepted: 'Aceitos: USDC · USDT · ETH · BTC · DAI',
      connecting: 'Abrindo pagamento...',
      how: 'Como funciona',
      step1: 'Clique no botão — abre uma página segura do Coinbase Commerce.',
      step2: 'Pague $29 em qualquer stablecoin ou cripto.',
      step3: 'O acesso é ativado automaticamente em segundos após a confirmação.',
      noStripe: 'Sem Stripe. Sem cartão. Sem armadilhas de assinatura.',
      history: 'Histórico de Pagamentos',
      pending: 'pendente',
      confirmed: 'confirmado',
    },
  };
  const t = T[lang];

  const daysLeft = executiveUntil
    ? Math.max(0, Math.ceil((executiveUntil.getTime() - Date.now()) / 86400000))
    : 0;

  const handlePay = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/create-crypto-charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, userEmail: user.email }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError(data.error || 'Payment creation failed. Try again.');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Status card */}
      <div className={`border p-6 ${executiveUntil ? 'border-accent/40 bg-accent/5' : 'border-border bg-surface/30'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-2 h-2 rounded-full ${executiveUntil ? 'bg-accent' : 'bg-text/20'}`} />
          <span className="mono text-[10px] font-bold tracking-widest uppercase">
            {executiveUntil ? t.active : t.noAccess}
          </span>
        </div>
        {executiveUntil && (
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-accent">{daysLeft}</span>
              <span className="text-text/50 mono text-[10px]">{t.daysLeft}</span>
            </div>
            <p className="mono text-[9px] text-text/40">
              {t.expires} {executiveUntil.toLocaleDateString(lang === 'EN' ? 'en-US' : lang === 'ES' ? 'es-CO' : 'pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            {/* Days bar */}
            <div className="mt-3 h-1 bg-border">
              <div className="h-1 bg-accent transition-all" style={{ width: `${Math.min(100, (daysLeft / 30) * 100)}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Pay button */}
      <div>
        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full py-4 bg-accent text-black font-black hover:opacity-90 transition flex items-center justify-center gap-3 disabled:opacity-50 mono text-[11px] tracking-widest"
        >
          <Coins size={18} />
          {loading ? t.connecting : (executiveUntil ? t.renew : t.payNow)}
        </button>
        <p className="mono text-[8px] text-text/30 text-center mt-2">{t.accepted}</p>
        {error && <p className="mono text-[9px] text-red-400 text-center mt-2">{error}</p>}
      </div>

      {/* Live crypto prices */}
      <CryptoTicker lang={lang} />

      {/* How it works */}
      <div className="border border-border p-6">
        <p className="mono text-[9px] font-bold text-accent tracking-widest mb-4">{t.how.toUpperCase()}</p>
        <div className="space-y-3">
          {[t.step1, t.step2, t.step3].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="mono text-[10px] font-black text-accent shrink-0 mt-0.5">0{i + 1}</span>
              <span className="text-sm text-text/60">{step}</span>
            </div>
          ))}
        </div>
        <p className="mono text-[8px] text-text/25 mt-4 pt-4 border-t border-border">{t.noStripe}</p>
      </div>
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
    <div className="space-y-6">

      {/* Hero CTA block */}
      <div className="bg-surface border border-accent/20 p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
            <Users size={24} className="text-accent" />
          </div>
          <div>
            <h3 className="font-black text-xl tracking-tighter uppercase mb-1">{ms.hireFast}</h3>
            <p className="text-text/60 text-sm">
              {ms.hireDesc}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border mb-6">
          {[
            { stat: '21 days', label: ms.statLabels[0] },
            { stat: '23K+', label: ms.statLabels[1] },
            { stat: '94%', label: ms.statLabels[2] },
            { stat: '40–60%', label: ms.statLabels[3] },
          ].map(({ stat, label }) => (
            <div key={label} className="bg-surface text-center py-5">
              <div className="text-2xl font-black text-accent">{stat}</div>
              <div className="mono text-[9px] text-text/40 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* What's included */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {[
            { title: 'Retained Search', desc: 'Dedicated search for your role — not posted on job boards.' },
            { title: '3–5 Qualified Profiles', desc: 'In your inbox within 5 business days. No noise, no spray & pray.' },
            { title: 'LATAM Market Intelligence', desc: 'Comp data, candidate availability, and hiring benchmarks included.' },
            { title: 'Direct Hire — No Middlemen', desc: 'You interview and hire directly. We structure the deal.' },
          ].map((item) => (
            <div key={item.title} className="border border-border p-4 bg-bg">
              <p className="mono text-[8px] font-bold text-accent mb-1">{item.title}</p>
              <p className="text-xs text-text/50 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <a
            href="https://wprotalents.lat"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-4 bg-accent text-black font-bold text-center hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            Start a Search <ChevronRight size={16} />
          </a>
          <a
            href="mailto:info@wprotalents.lat?subject=Discovery Call Request — LATAM Intel Member&body=Hi Juan,%0A%0AI'd like to schedule a discovery call to discuss a hiring need.%0A%0ARole: %0ATimeline: %0ALocation/remote: "
            className="flex-1 py-4 border border-border font-bold text-center hover:border-accent/40 transition flex items-center justify-center gap-2"
          >
            <Mail size={16} /> Book a Discovery Call
          </a>
        </div>

        <p className="mono text-[9px] text-text/30 text-center">
          Founder-led · Retained search · Senior roles only · US & EU firms · 20yr LATAM track record
        </p>
      </div>

      {/* Testimonials */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Star size={12} className="text-accent" />
          <span className="mono text-[9px] font-bold text-text/50 uppercase tracking-widest">What Clients Say</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              quote: 'We hired a senior ML engineer in 18 days. The candidate was exactly what we described — better than anyone we found through LinkedIn.',
              author: 'VP Engineering',
              company: 'US SaaS Company',
              role: 'ML Engineer hire',
            },
            {
              quote: 'Juan\'s understanding of the LATAM market is unmatched. We\'ve now made 4 hires through WPro and every single one has been a success.',
              author: 'Head of Talent',
              company: 'EU Fintech',
              role: '4 senior hires',
            },
            {
              quote: 'We reduced our hiring cost by 52% without compromising on quality. The engineers WPro placed are some of our best performers.',
              author: 'CTO',
              company: 'US AI Startup',
              role: 'Full engineering team',
            },
            {
              quote: 'Fast, transparent, and founder-led. Juan is personally involved in every search — that\'s rare in recruiting.',
              author: 'CEO',
              company: 'EU Tech Scale-up',
              role: 'Data Science lead',
            },
          ].map((t, i) => (
            <div key={i} className="bg-surface border border-border p-5">
              <p className="text-sm text-text/70 leading-relaxed italic mb-4">"{t.quote}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-text">{t.author}</p>
                  <p className="mono text-[9px] text-text/40">{t.company}</p>
                </div>
                <span className="mono text-[8px] bg-accent/10 text-accent px-2 py-0.5">{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Roles we fill */}
      <div className="border border-border p-6 bg-surface">
        <p className="mono text-[9px] font-bold text-text/50 uppercase tracking-widest mb-4">Roles We Specialize In</p>
        <div className="flex flex-wrap gap-2">
          {[
            'AI / ML Engineer', 'LLM Engineer', 'Data Scientist', 'MLOps', 'Head of AI',
            'Backend Engineer', 'Full Stack', 'DevOps / SRE', 'Data Engineer',
            'AI Product Manager', 'Engineering Manager', 'CTO-as-a-Service',
          ].map(role => (
            <span key={role} className="mono text-[8px] border border-border px-2 py-1 text-text/50 hover:border-accent/30 hover:text-accent/70 transition-colors">
              {role}
            </span>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <a
            href="mailto:info@wprotalents.lat?subject=Custom role inquiry"
            className="mono text-[9px] text-accent hover:underline flex items-center gap-1"
          >
            Don't see your role? Email us — we search for any senior tech role. <ChevronRight size={10} />
          </a>
        </div>
      </div>

    </div>
  );
}

// ─── Main MembersPage ─────────────────────────────────────────────────────────
type Tab = 'intel' | 'access' | 'salary' | 'resources' | 'wpro';

export default function MembersPage() {
  const lang = (() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('wpro_lang') : null;
    return (saved === 'EN' || saved === 'ES' || saved === 'PT') ? saved as 'EN' | 'ES' | 'PT' : 'EN';
  })();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('intel');
  const [executiveUntil, setExecutiveUntil] = useState<Date | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [resources, setResources] = useState<MemberResource[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  // Client hiring intelligence
  const [hiringPlan, setHiringPlan] = useState<HiringPlan | null>(null);
  const [networkReach, setNetworkReach] = useState<NetworkReach | null>(null);
  const [lastFormData, setLastFormData] = useState<ClientJobPostData | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // Listen for sign-in trigger from PaywallGate
  useEffect(() => {
    const handler = () => setIsAuthOpen(true);
    window.addEventListener('wpro-open-auth', handler);
    return () => window.removeEventListener('wpro-open-auth', handler);
  }, []);

  // Auth listener
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        const [p, snap] = await Promise.all([
          getUserProfile(u.uid),
          db.collection('users').doc(u.uid).get(),
        ]);
        setProfile(p);
        const data = snap.data();
        // Mark as beta member in Firestore (idempotent)
        if (!data?.betaMember) {
          db.collection('users').doc(u.uid).set({
            betaMember: true,
            betaJoinedAt: new Date().toISOString(),
            email: u.email,
          }, { merge: true }).catch(() => {});
        }
        if (data?.executiveUntil) {
          const until = data.executiveUntil.toDate?.() ?? new Date(data.executiveUntil);
          if (until > new Date()) setExecutiveUntil(until);
        }
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const isPremium = profile?.subscription_status === 'premium' || executiveUntil !== null;

  // Load data once confirmed premium
  useEffect(() => {
    setDataLoading(true);
    getMemberResources().then((res) => {
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

  // BETA: any logged-in user gets full access — isPremium gates only the Access tab payment state
  if (!user) {
    return (
      <>
        <PaywallGate user={null} />
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </>
    );
  }

  const TAB_LABELS: Record<'EN'|'ES'|'PT', Record<Tab, string>> = {
    EN: { intel: 'My Market Value', access: 'My Access', salary: 'Salary Intel', resources: 'Resources', wpro: 'Hire with WPro' },
    ES: { intel: 'Mi Valor de Mercado', access: 'Mi Acceso', salary: 'Intel Salarial', resources: 'Recursos', wpro: 'Contratar con WPro' },
    PT: { intel: 'Meu Valor de Mercado', access: 'Meu Acesso', salary: 'Intel Salarial', resources: 'Recursos', wpro: 'Contratar com WPro' },
  };
  const SECTION_LABELS: Record<'EN'|'ES'|'PT', Record<Tab, { title: string; desc: string }>> = {
    EN: {
      intel:     { title: 'My Market Value',        desc: 'Enter your profile — see your real market salary, best opportunities, and skills to learn for maximum ROI.' },
      access:    { title: 'My Executive Access', desc: 'Your active subscription, expiry, and payment options.' },
      salary:    { title: 'LATAM Salary Intelligence', desc: 'AI & tech roles, 5 countries. Updated Q1 2026.' },
      resources: { title: 'WPro Resources',          desc: 'Playbooks, templates, and tools — built from 20 years of LATAM recruiting.' },
      wpro:      { title: 'Hire with WProTalents',   desc: 'As a member, you get priority access to our founder-led search service.' },
    },
    ES: {
      intel:     { title: 'Mi Valor de Mercado',     desc: 'Ingresa tu perfil — ve tu salario real de mercado, mejores oportunidades y habilidades a aprender para máximo ROI.' },
      access:    { title: 'Mi Acceso Ejecutivo', desc: 'Tu suscripción activa, vencimiento y opciones de pago.' },
      salary:    { title: 'Inteligencia Salarial LATAM', desc: 'Roles AI y tech, 5 países. Actualizado Q1 2026.' },
      resources: { title: 'Recursos WPro',           desc: 'Playbooks, plantillas y herramientas — construidos desde 20 años de reclutamiento LATAM.' },
      wpro:      { title: 'Contratar con WProTalents', desc: 'Como miembro, tienes acceso prioritario a nuestro servicio de búsqueda liderado por el fundador.' },
    },
    PT: {
      intel:     { title: 'Meu Valor de Mercado',   desc: 'Insira seu perfil — veja seu salário real de mercado, melhores oportunidades e habilidades a aprender para máximo ROI.' },
      access:    { title: 'Meu Acesso Executivo', desc: 'Sua assinatura ativa, vencimento e opções de pagamento.' },
      salary:    { title: 'Inteligência Salarial LATAM', desc: 'Funções de AI e tech, 5 países. Atualizado Q1 2026.' },
      resources: { title: 'Recursos WPro',           desc: 'Playbooks, templates e ferramentas — construídos a partir de 20 anos de recrutamento no LATAM.' },
      wpro:      { title: 'Contratar com WProTalents', desc: 'Como membro, você tem acesso prioritário ao nosso serviço de busca liderado pelo fundador.' },
    },
  };
  const tl = TAB_LABELS[lang];
  const sl = SECTION_LABELS[lang];
  const MS = {
    EN: {
      welcomeBack: 'Welcome back',
      member: 'Member',
      hubDesc: 'Your exclusive LATAM AI workforce intelligence hub.',
      hireFast: 'Hire LATAM Tech Talent — Fast',
      hireDesc: '23,000+ vetted AI & tech professionals. Senior roles filled in 21 days or less. US & EU companies only. Founder-led. No junior recruiters.',
      statLabels: ['Avg. time to fill', 'Vetted professionals', 'Offer acceptance', 'Cost vs US hiring'],
    },
    ES: {
      welcomeBack: 'Bienvenido de nuevo',
      member: 'Miembro',
      hubDesc: 'Tu hub exclusivo de inteligencia del mercado laboral IA en LATAM.',
      hireFast: 'Contratar Talento Tech LATAM — Rápido',
      hireDesc: '23,000+ profesionales IA y tech verificados. Roles senior cubiertos en 21 días o menos. Solo empresas de EE.UU. y UE. Liderado por el fundador.',
      statLabels: ['Tiempo promedio de contratación', 'Profesionales verificados', 'Aceptación de oferta', 'Costo vs contratación en EE.UU.'],
    },
    PT: {
      welcomeBack: 'Bem-vindo de volta',
      member: 'Membro',
      hubDesc: 'Seu hub exclusivo de inteligência do mercado de trabalho IA na LATAM.',
      hireFast: 'Contratar Talento Tech LATAM — Rápido',
      hireDesc: '23.000+ profissionais de IA e tech verificados. Vagas sênior preenchidas em 21 dias ou menos. Apenas empresas dos EUA e UE. Liderado pelo fundador.',
      statLabels: ['Tempo médio de contratação', 'Profissionais verificados', 'Aceitação de oferta', 'Custo vs contratação nos EUA'],
    },
  };
  const ms = MS[lang];


  const TABS: { id: Tab; label: string; icon: any; badge?: string }[] = [
    { id: 'intel',     label: tl.intel,     icon: TrendingUp, badge: 'NEW' },
    { id: 'access',    label: tl.access,    icon: Crown },
    { id: 'salary',    label: tl.salary,    icon: BarChart2 },
    { id: 'resources', label: tl.resources, icon: BookOpen },
    { id: 'wpro',      label: tl.wpro,      icon: Users },
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
            {ms.welcomeBack}, {user.displayName?.split(' ')[0] || ms.member}
          </h1>
          <p className="text-text/50 text-sm">
            {ms.hubDesc}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border mb-8 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon, badge }) => (
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
              {badge && (
                <span className="bg-accent text-black mono text-[6px] font-black px-1 py-0.5 leading-none">
                  {badge}
                </span>
              )}
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
                {activeTab === 'intel' && (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-xl font-black uppercase tracking-tighter mb-1">My Market Value</h2>
                      <p className="text-sm text-text/50">Enter your profile — see your real market salary, best opportunities, and exact skills to learn for maximum ROI.</p>
                    </div>
                    <CandidateIntel lang={lang} />
                  </div>
                )}
                {activeTab === 'access' && (
                  <AccessTab user={user} executiveUntil={executiveUntil} lang={lang} />
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

                    {/* Job post form + instant insights */}
                    <div className="border border-border bg-surface/30 p-6 mb-6">
                      <div className="flex items-center gap-2 mb-5">
                        <span className="mono text-[9px] font-bold text-accent tracking-widest uppercase">Post a Role — Get Instant Hiring Intelligence</span>
                      </div>
                      <ClientJobPostForm
                        loading={insightsLoading}
                        onSubmit={(data) => {
                          setInsightsLoading(true);
                          const seniority = data.seniority;
                          const roleKey = data.role
                            .toLowerCase()
                            .replace(/\s*\/\s*/g, '_')
                            .replace(/\s+/g, '_')
                            .replace(/[^a-z_]/g, '');
                          const plan = generateHiringPlan(data, {});
                          const reach = estimateNetworkReach({ role: roleKey, seniority });
                          setHiringPlan(plan);
                          setNetworkReach(reach);
                          setLastFormData(data);
                          setInsightsLoading(false);
                        }}
                      />
                      {hiringPlan && networkReach && lastFormData && (
                        <ClientInsightsCard
                          plan={hiringPlan}
                          reach={networkReach}
                          role={lastFormData.role}
                          seniority={lastFormData.seniority}
                          planType={lastFormData.planType}
                        />
                      )}
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
