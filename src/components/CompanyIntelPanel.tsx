import { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, ExternalLink, Globe2 } from 'lucide-react';
import {
  SKILL_DEMAND_DATA,
  ENGLISH_LEVEL_DATA,
  EOR_TOOLS,
  type SkillDemand,
} from '../lib/intelligence';

interface Props {
  lang?: string;
}

const T = {
  EN: {
    panelTitle: 'LATAM Market Intelligence',
    panelSub: 'Free data — updated quarterly from WProTalents network',
    // Section 1
    skillTitle: 'Skill Demand by Country',
    skillSub: 'Which skills are most in demand — and what companies pay for them',
    skillCol1: 'Skill', skillCol2: 'Demand', skillCol3: 'Avg USD/yr', skillCol4: 'Trend',
    // Section 2
    englishTitle: 'English Proficiency by Country',
    englishSub: 'Critical for async remote work — % of tech workforce at each level',
    b2Label: 'B2+ (conversational)', c1Label: 'C1+ (professional)', twLabel: 'Technical writing',
    englishNote: 'Source: EF English Proficiency Index + WProTalents network data (2025)',
    // Section 3
    eorTitle: 'Hire Legally in LATAM from Day 1',
    eorSub: 'Employer of Record tools — so you never worry about compliance',
    eorPerMonth: '/mo per employee',
    eorBestFor: 'Best for',
    eorCountries: 'LATAM countries',
    eorPros: 'Pros', eorCons: 'Cons',
    eorCta: 'Get started →',
    eorDisclaimer: 'WProTalents earns a referral fee when you sign up via these links. This does not affect our recommendations.',
    collapse: 'Hide', expand: 'Show',
  },
  ES: {
    panelTitle: 'Inteligencia de Mercado LATAM',
    panelSub: 'Datos gratuitos — actualizados trimestralmente desde la red WProTalents',
    skillTitle: 'Demanda de Skills por País',
    skillSub: 'Qué skills tienen más demanda — y cuánto pagan las empresas por ellos',
    skillCol1: 'Skill', skillCol2: 'Demanda', skillCol3: 'Prom. USD/año', skillCol4: 'Tendencia',
    englishTitle: 'Nivel de Inglés por País',
    englishSub: 'Crítico para trabajo remoto asíncrono — % del personal tech en cada nivel',
    b2Label: 'B2+ (conversacional)', c1Label: 'C1+ (profesional)', twLabel: 'Escritura técnica',
    englishNote: 'Fuente: EF English Proficiency Index + datos de la red WProTalents (2025)',
    eorTitle: 'Contrata Legalmente en LATAM desde el Día 1',
    eorSub: 'Herramientas Employer of Record — para no preocuparte por el cumplimiento',
    eorPerMonth: '/mes por empleado',
    eorBestFor: 'Ideal para',
    eorCountries: 'Países LATAM',
    eorPros: 'Pros', eorCons: 'Contras',
    eorCta: 'Comenzar →',
    eorDisclaimer: 'WProTalents recibe una comisión cuando te registras a través de estos enlaces. Esto no afecta nuestras recomendaciones.',
    collapse: 'Ocultar', expand: 'Mostrar',
  },
  PT: {
    panelTitle: 'Inteligência de Mercado LATAM',
    panelSub: 'Dados gratuitos — atualizados trimestralmente pela rede WProTalents',
    skillTitle: 'Demanda de Skills por País',
    skillSub: 'Quais skills têm mais demanda — e o que as empresas pagam por elas',
    skillCol1: 'Skill', skillCol2: 'Demanda', skillCol3: 'Média USD/ano', skillCol4: 'Tendência',
    englishTitle: 'Nível de Inglês por País',
    englishSub: 'Crítico para trabalho remoto assíncrono — % da força técnica em cada nível',
    b2Label: 'B2+ (conversacional)', c1Label: 'C1+ (profissional)', twLabel: 'Escrita técnica',
    englishNote: 'Fonte: EF English Proficiency Index + dados da rede WProTalents (2025)',
    eorTitle: 'Contrate Legalmente na LATAM desde o Dia 1',
    eorSub: 'Ferramentas Employer of Record — para nunca se preocupar com conformidade',
    eorPerMonth: '/mês por funcionário',
    eorBestFor: 'Ideal para',
    eorCountries: 'Países LATAM',
    eorPros: 'Prós', eorCons: 'Contras',
    eorCta: 'Começar →',
    eorDisclaimer: 'WProTalents recebe uma comissão de indicação quando você se cadastra por esses links. Isso não afeta nossas recomendações.',
    collapse: 'Ocultar', expand: 'Mostrar',
  },
};

const COUNTRIES = ['Colombia', 'Brazil', 'Mexico', 'Argentina', 'Chile'];

const trendIcon = (trend: SkillDemand['trend']) => {
  if (trend === 'rising')  return <TrendingUp  size={10} className="text-green-400" />;
  if (trend === 'falling') return <TrendingDown size={10} className="text-red-400"  />;
  return <Minus size={10} className="text-text/30" />;
};

const trendLabel = (trend: SkillDemand['trend']) =>
  trend === 'rising' ? '↑' : trend === 'falling' ? '↓' : '→';

function SectionToggle({ label, open, onToggle, collapseLabel, expandLabel }: {
  label: string; open: boolean; onToggle: () => void; collapseLabel: string; expandLabel: string;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 ml-auto mono text-[8px] text-text/30 hover:text-accent transition-colors"
    >
      {open ? collapseLabel : expandLabel}
      {open ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
    </button>
  );
}

export default function CompanyIntelPanel({ lang = 'EN' }: Props) {
  const t = T[lang as keyof typeof T] || T.EN;

  const [skillCountry, setSkillCountry] = useState('Colombia');
  const [openSkill,    setOpenSkill]    = useState(true);
  const [openEnglish,  setOpenEnglish]  = useState(true);
  const [openEOR,      setOpenEOR]      = useState(true);

  const filteredSkills = SKILL_DEMAND_DATA.filter(d => d.country === skillCountry)
    .sort((a, b) => b.demandScore - a.demandScore);

  const sel = 'bg-bg border border-border px-2 py-1.5 mono text-[10px] focus:outline-none focus:border-accent/40 transition-colors text-text';

  return (
    <div className="space-y-4">
      {/* Panel header */}
      <div className="flex items-center gap-2 mb-1">
        <Globe2 size={13} className="text-accent" />
        <div>
          <span className="mono text-[9px] font-bold text-accent tracking-widest uppercase">{t.panelTitle}</span>
          <p className="mono text-[7px] text-text/30 mt-0.5">{t.panelSub}</p>
        </div>
      </div>

      {/* ── Section 1: Skill Demand ─────────────────────────────── */}
      <div className="border border-border bg-bg/50">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <span className="mono text-[9px] font-bold text-text/70 uppercase tracking-widest flex-1">{t.skillTitle}</span>
          <SectionToggle label="" open={openSkill} onToggle={() => setOpenSkill(v => !v)} collapseLabel={t.collapse} expandLabel={t.expand} />
        </div>
        {openSkill && (
          <div className="p-4">
            <p className="mono text-[8px] text-text/40 mb-3">{t.skillSub}</p>
            {/* Country picker */}
            <div className="flex gap-1.5 flex-wrap mb-4">
              {COUNTRIES.map(c => (
                <button key={c} onClick={() => setSkillCountry(c)}
                  className={`px-2.5 py-1 mono text-[8px] border transition-colors ${
                    skillCountry === c
                      ? 'border-accent bg-accent/10 text-accent font-bold'
                      : 'border-border text-text/40 hover:border-text/30'
                  }`}>
                  {c}
                </button>
              ))}
            </div>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    {[t.skillCol1, t.skillCol2, t.skillCol3, t.skillCol4].map(h => (
                      <th key={h} className="pb-2 mono text-[7px] text-text/30 uppercase tracking-widest font-normal pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSkills.map(row => (
                    <tr key={row.skill} className="border-b border-border/30 hover:bg-surface/30 transition-colors">
                      <td className="py-2.5 pr-4 mono text-[10px] font-bold text-text">{row.skill}</td>
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-border rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent rounded-full"
                              style={{ width: `${row.demandScore}%` }}
                            />
                          </div>
                          <span className="mono text-[9px] text-text/50">{row.demandScore}</span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-4 mono text-[10px] text-text/70">
                        ${(row.avgSalaryUSD / 1000).toFixed(0)}K
                      </td>
                      <td className="py-2.5">
                        <span className="flex items-center gap-1 mono text-[9px]">
                          {trendIcon(row.trend)}
                          <span className={row.trend === 'rising' ? 'text-green-400' : row.trend === 'falling' ? 'text-red-400' : 'text-text/30'}>
                            {trendLabel(row.trend)}
                          </span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Section 2: English Proficiency ─────────────────────── */}
      <div className="border border-border bg-bg/50">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <span className="mono text-[9px] font-bold text-text/70 uppercase tracking-widest flex-1">{t.englishTitle}</span>
          <SectionToggle label="" open={openEnglish} onToggle={() => setOpenEnglish(v => !v)} collapseLabel={t.collapse} expandLabel={t.expand} />
        </div>
        {openEnglish && (
          <div className="p-4">
            <p className="mono text-[8px] text-text/40 mb-4">{t.englishSub}</p>
            <div className="space-y-3">
              {ENGLISH_LEVEL_DATA.map(row => (
                <div key={row.country} className="space-y-1.5">
                  <p className="mono text-[9px] font-bold text-text/70">{row.country}</p>
                  {[
                    { label: t.b2Label, val: row.b2Plus  },
                    { label: t.c1Label, val: row.c1Plus  },
                    { label: t.twLabel, val: row.techWriting },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="mono text-[7px] text-text/30 w-32 shrink-0">{label}</span>
                      <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${val >= 60 ? 'bg-green-500' : val >= 40 ? 'bg-yellow-500' : 'bg-red-500/70'}`}
                          style={{ width: `${val}%` }}
                        />
                      </div>
                      <span className={`mono text-[9px] w-8 text-right ${val >= 60 ? 'text-green-400' : val >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {val}%
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <p className="mono text-[7px] text-text/20 mt-4">{t.englishNote}</p>
          </div>
        )}
      </div>

      {/* ── Section 3: EOR Tool Comparison ─────────────────────── */}
      <div className="border border-border bg-bg/50">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <span className="mono text-[9px] font-bold text-text/70 uppercase tracking-widest flex-1">{t.eorTitle}</span>
          <SectionToggle label="" open={openEOR} onToggle={() => setOpenEOR(v => !v)} collapseLabel={t.collapse} expandLabel={t.expand} />
        </div>
        {openEOR && (
          <div className="p-4">
            <p className="mono text-[8px] text-text/40 mb-4">{t.eorSub}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EOR_TOOLS.map(tool => (
                <div key={tool.name} className="border border-border bg-bg p-4 flex flex-col gap-2">
                  {/* Name + price */}
                  <div className="flex items-center justify-between">
                    <span className="mono text-[11px] font-black text-text">{tool.name}</span>
                    <span className="mono text-[9px] text-accent font-bold">
                      ${tool.monthlyFeeUSD}<span className="text-text/30 font-normal">{t.eorPerMonth}</span>
                    </span>
                  </div>
                  {/* Best for */}
                  <div>
                    <span className="mono text-[7px] text-text/30 uppercase tracking-widest">{t.eorBestFor}: </span>
                    <span className="mono text-[8px] text-text/60">{tool.bestFor}</span>
                  </div>
                  {/* Countries */}
                  <div className="flex flex-wrap gap-1">
                    {tool.countries.map(c => (
                      <span key={c} className="mono text-[7px] bg-surface border border-border px-1.5 py-0.5 text-text/40">{c}</span>
                    ))}
                  </div>
                  {/* Pros */}
                  <div>
                    <p className="mono text-[7px] text-green-400/70 uppercase tracking-widest mb-0.5">{t.eorPros}</p>
                    <ul className="space-y-0.5">
                      {tool.pros.map(p => (
                        <li key={p} className="mono text-[8px] text-text/50 flex items-start gap-1">
                          <span className="text-green-400 shrink-0">+</span>{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Cons */}
                  <div>
                    <p className="mono text-[7px] text-red-400/70 uppercase tracking-widest mb-0.5">{t.eorCons}</p>
                    <ul className="space-y-0.5">
                      {tool.cons.map(c => (
                        <li key={c} className="mono text-[8px] text-text/50 flex items-start gap-1">
                          <span className="text-red-400 shrink-0">−</span>{c}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* CTA */}
                  <a
                    href={tool.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto flex items-center gap-1 mono text-[8px] text-accent font-bold hover:underline"
                  >
                    {t.eorCta} <ExternalLink size={9} />
                  </a>
                </div>
              ))}
            </div>
            <p className="mono text-[7px] text-text/20 mt-4 leading-relaxed">{t.eorDisclaimer}</p>
          </div>
        )}
      </div>
    </div>
  );
}
