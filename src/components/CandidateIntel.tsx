import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp, Globe, Zap, Target, ChevronRight, ArrowUpRight,
  DollarSign, BarChart2, Map, Briefcase, Wifi, RefreshCw, Sparkles,
  AlertTriangle, CheckCircle, Clock, Linkedin
} from 'lucide-react';
import {
  computeMarketValue, computeSalaryGap, getBestMarkets, getSkillsROI, getRemoteReadiness,
  type CandidateInput, type RoleKey, type CountryCode, type EnglishLevel,
} from '../lib/intelligence';

// ─── Static option maps ────────────────────────────────────────────────────────

const ROLE_OPTIONS: { value: RoleKey; label: string }[] = [
  { value: 'ai_ml',       label: 'AI / ML Engineer' },
  { value: 'llm',         label: 'LLM Engineer' },
  { value: 'data',        label: 'Data Scientist' },
  { value: 'data_eng',    label: 'Data Engineer' },
  { value: 'backend',     label: 'Backend Engineer' },
  { value: 'fullstack',   label: 'Full Stack Engineer' },
  { value: 'frontend',    label: 'Frontend Engineer' },
  { value: 'devops',      label: 'DevOps / SRE' },
  { value: 'product',     label: 'Product Manager' },
  { value: 'eng_manager', label: 'Engineering Manager' },
];

const COUNTRY_OPTIONS: { value: CountryCode; flag: string; label: string }[] = [
  { value: 'BR', flag: '🇧🇷', label: 'Brazil' },
  { value: 'MX', flag: '🇲🇽', label: 'Mexico' },
  { value: 'CO', flag: '🇨🇴', label: 'Colombia' },
  { value: 'AR', flag: '🇦🇷', label: 'Argentina' },
  { value: 'CL', flag: '🇨🇱', label: 'Chile' },
];

const ENGLISH_OPTIONS: { value: EnglishLevel; label: string; desc: string }[] = [
  { value: 'basic',          label: 'Basic',        desc: 'Can read/write but struggle in calls' },
  { value: 'conversational', label: 'Conversational',desc: 'Can handle work calls with effort' },
  { value: 'fluent',         label: 'Fluent',        desc: 'Comfortable in all professional contexts' },
  { value: 'bilingual',      label: 'Bilingual',     desc: 'Native or near-native' },
];

const SKILLS_LIST = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Go', 'Rust', 'Java',
  'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Terraform',
  'PyTorch', 'TensorFlow', 'LLM / AI', 'dbt', 'Spark', 'SQL',
  'React Native', 'Next.js', 'FastAPI', 'GraphQL', 'Redis',
];

const cls = {
  label: 'mono text-[8px] text-text/40 block mb-1.5 uppercase tracking-widest font-bold',
  select: 'w-full bg-bg border border-border px-3 py-2.5 mono text-[11px] text-text focus:outline-none focus:border-accent/50 transition-colors appearance-none',
  chip: (active: boolean) =>
    `px-2.5 py-1 mono text-[8px] border transition-all cursor-pointer select-none ${
      active ? 'bg-accent text-black border-accent font-bold' : 'border-border text-text/30 hover:border-text/30 hover:text-text/60'
    }`,
};

function fmt(n: number) {
  return '$' + n.toLocaleString();
}

// ─── Section: Market Value ─────────────────────────────────────────────────────

function MarketValuePanel({ input }: { input: CandidateInput }) {
  const mv = computeMarketValue(input);
  const gap = computeSalaryGap(input);

  return (
    <div className="space-y-4">
      {/* Underpaid callout */}
      {mv.underpaidBy && mv.underpaidBy > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border border-red-500/30 bg-red-500/5 p-5"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="mono text-[9px] text-red-400 font-bold mb-1">MARKET SIGNAL</p>
              <p className="text-lg font-black text-text">
                You may be underpaid by{' '}
                <span className="text-red-400">{fmt(mv.underpaidBy)}/year</span>
              </p>
              <p className="mono text-[9px] text-text/40 mt-1">
                Based on {mv.seniorityLabel} {ROLE_OPTIONS.find(r => r.value === input.role)?.label} in {COUNTRY_OPTIONS.find(c => c.value === input.country)?.label}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Salary range */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border">
        {[
          { label: 'Market Min', value: fmt(mv.marketMin), sub: 'Local · ' + mv.seniorityLabel },
          { label: 'Market Mid', value: fmt(mv.marketMid), sub: 'Benchmark · Your target', accent: true },
          { label: 'Market Max', value: fmt(mv.marketMax), sub: 'Top 25% locally' },
        ].map(({ label, value, sub, accent }) => (
          <div key={label} className={`p-5 text-center ${accent ? 'bg-accent/5' : 'bg-surface'}`}>
            <div className={`text-2xl font-black ${accent ? 'text-accent' : 'text-text'}`}>{value}</div>
            <div className="mono text-[8px] text-text/40 mt-1">{label}</div>
            <div className="mono text-[7px] text-text/20 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Remote uplift */}
      <div className="border border-accent/20 bg-accent/5 p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="mono text-[8px] text-accent font-bold">GO REMOTE → EARN MORE</p>
            <p className="text-2xl font-black text-text mt-1">{fmt(mv.remoteMid)}<span className="text-sm font-normal text-text/40">/year</span></p>
            <p className="mono text-[9px] text-text/40 mt-0.5">Equivalent USD remote role · {mv.remoteUplift}% uplift vs local</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-accent">+{mv.remoteUplift}%</div>
            <div className="mono text-[8px] text-text/30">remote uplift</div>
          </div>
        </div>
        <div className="pt-3 border-t border-accent/10">
          <p className="mono text-[8px] text-text/30">
            Top paying country for your profile: <span className="text-accent font-bold">{gap.topPayingFlag} {gap.topPayingCountry} — {fmt(gap.topPayingSalary)}/yr remote</span>
          </p>
        </div>
      </div>

      {/* Percentile (only if currentSalary entered) */}
      {input.currentSalary && (
        <div className="border border-border p-4">
          <p className="mono text-[8px] text-text/40 mb-2">YOUR SALARY PERCENTILE (local market)</p>
          <div className="relative h-2 bg-border rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${mv.percentile}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-accent"
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="mono text-[7px] text-text/20">Bottom 10%</span>
            <span className="mono text-[8px] text-accent font-bold">Top {100 - mv.percentile}%</span>
            <span className="mono text-[7px] text-text/20">Top 10%</span>
          </div>
        </div>
      )}

      <p className="mono text-[7px] text-text/20">
        Estimates based on WProTalents active search mandates, LinkedIn Salary, and Glassdoor LATAM data. Q1 2026. ± 15% variance.
      </p>
    </div>
  );
}

// ─── Section: Best Markets ────────────────────────────────────────────────────

function BestMarketsPanel({ input }: { input: CandidateInput }) {
  const markets = getBestMarkets(input);
  const opportunityColor = {
    'Hot 🔥': 'text-orange-400 border-orange-400/30 bg-orange-400/5',
    'Strong ✅': 'text-green-400 border-green-400/30 bg-green-400/5',
    'Saturated ⚠️': 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5',
  };

  return (
    <div className="space-y-3">
      <p className="mono text-[9px] text-text/30 mb-4">
        Ranked by demand vs competition for your role. <span className="text-accent">Hot</span> = high demand, low competition.
      </p>
      {markets.map((m, i) => (
        <motion.div
          key={m.country}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.07 }}
          className="border border-border bg-surface p-4"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{m.flag}</span>
              <div>
                <p className="font-bold text-sm text-text">{m.name}</p>
                <p className="mono text-[8px] text-accent font-bold">{fmt(m.avgRemote)}/yr remote</p>
              </div>
            </div>
            <span className={`mono text-[8px] font-bold border px-2 py-0.5 ${opportunityColor[m.opportunity]}`}>
              {m.opportunity}
            </span>
          </div>
          <p className="mono text-[9px] text-text/40 leading-relaxed mb-3">{m.verdict}</p>
          <div className="flex gap-4">
            <div className="text-center">
              <div className={`mono text-[7px] font-bold ${m.demand === 'High' ? 'text-green-400' : m.demand === 'Medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                {m.demand}
              </div>
              <div className="mono text-[6px] text-text/20">DEMAND</div>
            </div>
            <div className="text-center">
              <div className={`mono text-[7px] font-bold ${m.competition === 'Low' ? 'text-green-400' : m.competition === 'Medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                {m.competition}
              </div>
              <div className="mono text-[6px] text-text/20">COMPETITION</div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Section: Skills ROI ──────────────────────────────────────────────────────

function SkillsROIPanel({ input }: { input: CandidateInput }) {
  const skills = getSkillsROI(input);
  const demandColor = { 'Very High': 'text-red-400', High: 'text-orange-400', Medium: 'text-yellow-400' };

  if (skills.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border">
        <CheckCircle size={24} className="text-green-400 mx-auto mb-3" />
        <p className="mono text-[10px] text-text/40">Your skill set looks strong for your role.</p>
        <p className="mono text-[9px] text-text/20 mt-1">Consider adding LLM / AI skills for the highest salary uplift.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="mono text-[9px] text-text/30 mb-4">
        Skills you don't have yet — ranked by salary impact for your seniority level.
      </p>
      {skills.map((s, i) => (
        <motion.div
          key={s.skill}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="border border-border bg-surface p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-sm text-text">{s.skill}</p>
                <span className={`mono text-[7px] font-bold ${demandColor[s.demand]}`}>{s.demand} DEMAND</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="mono text-[8px] text-text/40 flex items-center gap-1">
                  <Clock size={8} /> {s.timeToLearn}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xl font-black text-accent">+{fmt(s.salaryBoost)}</div>
              <div className="mono text-[7px] text-text/30">/year potential</div>
            </div>
          </div>
          {/* Visual bar */}
          <div className="mt-3 h-1 bg-border rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (s.salaryBoost / 25000) * 100)}%` }}
              transition={{ duration: 0.7, delay: i * 0.08 + 0.2 }}
              className="h-full bg-accent"
            />
          </div>
        </motion.div>
      ))}
      <div className="border border-border bg-bg p-4">
        <p className="mono text-[8px] text-text/40 mb-1">TOTAL POTENTIAL UPSIDE</p>
        <p className="text-2xl font-black text-accent">
          +{fmt(skills.reduce((sum, s) => sum + s.salaryBoost, 0))}/year
        </p>
        <p className="mono text-[8px] text-text/30 mt-1">
          If you added all {skills.length} skills above (realistic over 12–18 months)
        </p>
      </div>
    </div>
  );
}

// ─── Section: Remote Readiness ────────────────────────────────────────────────

function RemoteReadinessPanel({ input }: { input: CandidateInput }) {
  const r = getRemoteReadiness(input);
  const barColor = r.score >= 70 ? 'bg-green-400' : r.score >= 50 ? 'bg-yellow-400' : 'bg-red-400';

  return (
    <div className="space-y-4">
      {/* Score */}
      <div className="border border-border bg-surface p-6 text-center">
        <p className="mono text-[8px] text-text/40 mb-3">REMOTE READINESS SCORE</p>
        <div className={`text-5xl font-black mb-1 ${r.score >= 70 ? 'text-green-400' : r.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
          {r.score}
        </div>
        <div className="text-sm font-bold text-text mb-4">{r.label}</div>
        <div className="relative h-2 bg-border rounded-full overflow-hidden max-w-xs mx-auto">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${r.score}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full ${barColor}`}
          />
        </div>
        <p className="mono text-[8px] text-text/30 mt-3">
          {r.ready
            ? 'Your profile is ready for US & EU remote roles. Apply with confidence.'
            : 'Close these gaps to unlock global remote opportunities.'}
        </p>
      </div>

      {/* Strengths */}
      {r.strengths.length > 0 && (
        <div>
          <p className="mono text-[8px] text-green-400 font-bold mb-2">✓ STRENGTHS</p>
          <div className="space-y-2">
            {r.strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-2 border border-green-400/10 bg-green-400/5 px-3 py-2">
                <CheckCircle size={11} className="text-green-400 shrink-0 mt-0.5" />
                <p className="mono text-[9px] text-text/60">{s}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gaps */}
      {r.gaps.length > 0 && (
        <div>
          <p className="mono text-[8px] text-red-400 font-bold mb-2">⚡ GAPS TO CLOSE</p>
          <div className="space-y-2">
            {r.gaps.map((g, i) => (
              <div key={i} className="flex items-start gap-2 border border-red-400/10 bg-red-400/5 px-3 py-2">
                <Target size={11} className="text-red-400 shrink-0 mt-0.5" />
                <p className="mono text-[9px] text-text/60">{g}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top action */}
      <div className="border border-accent/20 bg-accent/5 p-4">
        <p className="mono text-[8px] text-accent font-bold mb-1">YOUR #1 NEXT ACTION</p>
        <p className="mono text-[9px] text-text/60">{r.topAction}</p>
      </div>

      {/* CTA */}
      {r.ready && (
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('open-linkedin-boost'))}
          className="w-full py-3 bg-[#0077B5] text-white font-bold mono text-[10px] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Linkedin size={14} /> GET FEATURED TO 23K+ HIRING MANAGERS →
        </button>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type IntelTab = 'value' | 'markets' | 'skills' | 'readiness';

const INTEL_TABS: { id: IntelTab; label: string; icon: React.ElementType }[] = [
  { id: 'value',    label: 'Market Value',      icon: DollarSign },
  { id: 'markets',  label: 'Best Markets',       icon: Map },
  { id: 'skills',   label: 'Skills ROI',         icon: Zap },
  { id: 'readiness',label: 'Remote Readiness',   icon: Wifi },
];

const DEFAULT_INPUT: CandidateInput = {
  role: 'backend',
  country: 'BR',
  yearsExp: 4,
  englishLevel: 'conversational',
  currentSalary: undefined,
  skills: [],
  hasRemoteExp: false,
  hasPortfolio: false,
};

export default function CandidateIntel() {
  const [input, setInput] = useState<CandidateInput>(DEFAULT_INPUT);
  const [computed, setComputed] = useState(false);
  const [activeTab, setActiveTab] = useState<IntelTab>('value');

  const set = <K extends keyof CandidateInput>(key: K, val: CandidateInput[K]) =>
    setInput(prev => ({ ...prev, [key]: val }));

  const toggleSkill = (skill: string) =>
    set('skills', input.skills.includes(skill)
      ? input.skills.filter(s => s !== skill)
      : [...input.skills, skill]);

  const handleCompute = () => setComputed(true);

  return (
    <div className="space-y-6">

      {/* Input form */}
      <div className="border border-border bg-surface">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Sparkles size={12} className="text-accent" />
          <span className="mono text-[9px] font-bold text-accent tracking-widest">YOUR PROFILE</span>
          {computed && (
            <button
              onClick={() => setComputed(false)}
              className="ml-auto mono text-[8px] text-text/30 hover:text-accent transition-colors flex items-center gap-1"
            >
              <RefreshCw size={9} /> Edit
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!computed ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 space-y-5"
            >
              {/* Role + Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={cls.label}>Your Role *</label>
                  <select value={input.role} onChange={e => set('role', e.target.value as RoleKey)} className={cls.select}>
                    {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={cls.label}>Your Country *</label>
                  <select value={input.country} onChange={e => set('country', e.target.value as CountryCode)} className={cls.select}>
                    {COUNTRY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.flag} {o.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Years + English */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={cls.label}>Years of Experience *</label>
                  <input
                    type="number" min={0} max={30}
                    value={input.yearsExp}
                    onChange={e => set('yearsExp', Number(e.target.value))}
                    className={cls.select}
                  />
                </div>
                <div>
                  <label className={cls.label}>English Level *</label>
                  <select value={input.englishLevel} onChange={e => set('englishLevel', e.target.value as EnglishLevel)} className={cls.select}>
                    {ENGLISH_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label} — {o.desc}</option>)}
                  </select>
                </div>
              </div>

              {/* Current salary (optional) */}
              <div>
                <label className={cls.label}>Current Salary — USD/year (optional)</label>
                <p className="mono text-[8px] text-text/20 mb-1.5">We use this to show how much you may be leaving on the table.</p>
                <input
                  type="number" min={0} step={500}
                  placeholder="e.g. 12000"
                  value={input.currentSalary ?? ''}
                  onChange={e => set('currentSalary', e.target.value ? Number(e.target.value) : undefined)}
                  className={cls.select}
                />
              </div>

              {/* Skills */}
              <div>
                <label className={cls.label}>Your Current Skills (select all that apply)</label>
                <div className="flex flex-wrap gap-1.5">
                  {SKILLS_LIST.map(s => (
                    <button key={s} type="button" onClick={() => toggleSkill(s)} className={cls.chip(input.skills.includes(s))}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Remote + Portfolio */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => set('hasRemoteExp', !input.hasRemoteExp)}
                  className={cls.chip(input.hasRemoteExp) + ' w-full justify-center py-2.5'}
                >
                  {input.hasRemoteExp ? '✓' : '○'} Remote Experience
                </button>
                <button
                  type="button"
                  onClick={() => set('hasPortfolio', !input.hasPortfolio)}
                  className={cls.chip(input.hasPortfolio) + ' w-full justify-center py-2.5'}
                >
                  {input.hasPortfolio ? '✓' : '○'} Portfolio / GitHub
                </button>
              </div>

              <button
                onClick={handleCompute}
                className="w-full py-3.5 bg-accent text-black font-black mono text-[11px] hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <BarChart2 size={14} /> CALCULATE MY MARKET VALUE →
              </button>

              <p className="mono text-[7px] text-text/20 text-center">
                Data from WProTalents active mandates + LinkedIn Salary + Glassdoor LATAM. Q1 2026. Estimates ± 15%.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="summary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-6 py-3 flex flex-wrap gap-4"
            >
              {[
                { label: 'Role', value: ROLE_OPTIONS.find(r => r.value === input.role)?.label },
                { label: 'Country', value: COUNTRY_OPTIONS.find(c => c.value === input.country)?.flag + ' ' + COUNTRY_OPTIONS.find(c => c.value === input.country)?.label },
                { label: 'Exp', value: `${input.yearsExp}yr` },
                { label: 'English', value: ENGLISH_OPTIONS.find(e => e.value === input.englishLevel)?.label },
                input.currentSalary ? { label: 'Current', value: fmt(input.currentSalary) + '/yr' } : null,
              ].filter(Boolean).map((item, i) => (
                <div key={i}>
                  <p className="mono text-[7px] text-text/20">{item!.label}</p>
                  <p className="mono text-[9px] font-bold text-text">{item!.value}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results */}
      <AnimatePresence>
        {computed && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Tab nav */}
            <div className="flex items-center gap-1 border-b border-border mb-6 overflow-x-auto">
              {INTEL_TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-1.5 px-4 py-3 mono text-[9px] font-bold whitespace-nowrap border-b-2 transition-all ${
                    activeTab === id ? 'border-accent text-accent' : 'border-transparent text-text/40 hover:text-text'
                  }`}
                >
                  <Icon size={12} /> {label.toUpperCase()}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {activeTab === 'value'    && <MarketValuePanel    input={input} />}
                {activeTab === 'markets'  && <BestMarketsPanel    input={input} />}
                {activeTab === 'skills'   && <SkillsROIPanel      input={input} />}
                {activeTab === 'readiness'&& <RemoteReadinessPanel input={input} />}
              </motion.div>
            </AnimatePresence>

            {/* Bottom CTA */}
            <div className="mt-8 border border-accent/20 bg-accent/5 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="mono text-[9px] font-bold text-accent mb-1">WANT US TO FIND YOU A ROLE AT THIS SALARY?</p>
                <p className="mono text-[8px] text-text/40">WProTalents places senior LATAM tech talent with US & EU companies. Free for candidates.</p>
              </div>
              <a
                href="https://wprotalents.lat"
                target="_blank"
                rel="noopener noreferrer"
                className="mono text-[9px] font-bold bg-accent text-black px-5 py-2.5 hover:opacity-90 transition-opacity whitespace-nowrap flex items-center gap-2 shrink-0"
              >
                Work with WPro <ChevronRight size={12} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
