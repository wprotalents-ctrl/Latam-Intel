// src/components/SalaryCalculator.tsx
// Market Value Calculator — used on both candidate and company portals.
// Originally inline in JobsPage.tsx as MarketValueTeaser, extracted so it
// can be embedded in Dashboard and Company portal "Salary Benchmarks" tab.
//
// Math: calls computeMarketValue from src/lib/intelligence.ts
//   - Reads BASE_SALARY + REMOTE_MULT (with live Supabase override if available)
//   - 5yr backend in Brazil + fluent English → ~$83,500 remote (was $14K before fix)
//   - Email gate for the remote number (lead capture) — no-op for the company
//     portal use case (HR doesn't need an email gate)

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart2, Mail, Loader2, ChevronRight, Lock } from 'lucide-react';
import {
  computeMarketValue,
  type RoleKey,
  type CountryCode,
  type EnglishLevel,
} from '../lib/intelligence';

const T = {
  EN: {
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
    teaserUnlock: 'Join Beta — Free Access',
    teaserLockedSections: ['Salary by English Level', 'Best Markets for You', 'Skills ROI'],
  },
  ES: {
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
    teaserUnlock: 'Unirse al Beta — Gratis',
    teaserLockedSections: ['Salario por Nivel de Inglés', 'Mejores Mercados para Ti', 'ROI de Habilidades'],
  },
  PT: {
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
    teaserLockedLabel: 'Dashboard completo → Membros Executivos',
    teaserUnlock: 'Entrar no Beta — Grátis',
    teaserLockedSections: ['Salário por Nível de Inglês', 'Melhores Mercados para Você', 'ROI de Habilidades'],
  },
};

interface SalaryCalculatorProps {
  lang?: string;
  /** Show the email gate before revealing the remote number. Default true (candidate flow). */
  emailGate?: boolean;
  /** Pre-fill role/country/years from external state (e.g. for company presets). */
  defaultRole?: RoleKey;
  defaultCountry?: CountryCode;
  defaultYearsExp?: number;
}

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

const COUNTRY_OPTS: { value: CountryCode; flag: string; label: string }[] = [
  { value: 'BR', flag: '🇧🇷', label: 'Brasil / Brazil' }, { value: 'MX', flag: '🇲🇽', label: 'México / Mexico' },
  { value: 'CO', flag: '🇨🇴', label: 'Colombia' }, { value: 'AR', flag: '🇦🇷', label: 'Argentina' },
  { value: 'CL', flag: '🇨🇱', label: 'Chile' },
];

export default function SalaryCalculator({
  lang = 'EN',
  emailGate = true,
  defaultRole = 'backend',
  defaultCountry = 'BR',
  defaultYearsExp = 4,
}: SalaryCalculatorProps) {
  const tt = T[lang as keyof typeof T] || T.EN;
  const [role, setRole] = useState<RoleKey>(defaultRole);
  const [country, setCountry] = useState<CountryCode>(defaultCountry);
  const [yearsExp, setYearsExp] = useState(defaultYearsExp);
  const [shown, setShown] = useState(false);
  const [email, setEmail] = useState('');
  const [emailConsent, setEmailConsent] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const roleOpts = ROLE_OPTS[lang] || ROLE_OPTS.EN;

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
      const res = await fetch('/api/members?action=subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, country, yearsExp, source: 'market-value-teaser' }),
      });
      if (!res.ok) throw new Error('Failed');
      setCaptured(true);
    } catch {
      setCapturing(false);
    } finally {
      setCapturing(false);
    }
  }

  return (
    <div className="border border-accent/20 bg-accent/5">
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
              {/* Market mid — local free, remote gated (only if emailGate) */}
              <div className="grid grid-cols-2 gap-px bg-border">
                <div className="bg-bg p-4 text-center">
                  <p className="mono text-[7px] text-text/30 mb-1">{tt.teaserLocalMid}</p>
                  <p className="text-xl font-black text-text">{fmt(preview.marketMid)}</p>
                  <p className="mono text-[7px] text-text/20 mt-0.5">{preview.seniorityLabel} · {tt.teaserPerYear}</p>
                </div>
                {!emailGate || captured ? (
                  <div className="bg-accent/5 p-4 text-center">
                    <p className="mono text-[7px] text-accent mb-1">{tt.teaserRemote}</p>
                    <p className="text-xl font-black text-accent">{fmt(preview.remoteMid)}</p>
                    <p className="mono text-[7px] text-text/20 mt-0.5">+{preview.remoteUplift}% {tt.teaserUplift}</p>
                  </div>
                ) : (
                  <div className="bg-accent/5 p-4 flex flex-col items-center justify-center gap-2 relative">
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
                        disabled={capturing || !emailConsent}
                        className="w-full py-1 bg-accent text-black mono text-[8px] font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        {capturing ? <Loader2 size={9} className="animate-spin" /> : <><ChevronRight size={9} /> {lang === 'PT' ? 'VER SALÁRIO' : lang === 'ES' ? 'VER SALARIO' : 'SEE REMOTE'}</>}
                      </button>
                      <label className="flex items-start gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={emailConsent}
                          onChange={e => setEmailConsent(e.target.checked)}
                          className="mt-0.5 shrink-0"
                        />
                        <span className="mono text-[7px] text-text/30 leading-tight">
                          I agree to the <a href="#privacy" onClick={e => { e.preventDefault(); e.stopPropagation(); }} className="text-accent">Privacy Policy</a> & communications consent.
                        </span>
                      </label>
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
  );
}
