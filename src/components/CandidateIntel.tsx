import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DollarSign, Map, Zap, Wifi, RefreshCw, Sparkles,
  BarChart2, CheckCircle, Clock, Linkedin, ChevronRight,
  AlertTriangle, Target,
} from 'lucide-react';
import {
  computeMarketValue, computeSalaryGap, getBestMarkets, getSkillsROI, getRemoteReadiness,
  type CandidateInput, type RoleKey, type CountryCode, type EnglishLevel, type Lang,
} from '../lib/intelligence';

// ─── Translations ─────────────────────────────────────────────────────────────

const T = {
  EN: {
    sectionTitle: 'My Market Value',
    sectionDesc: 'Enter your profile — see your real market salary, best opportunities, and skills to learn for maximum ROI.',
    profileHeader: 'YOUR PROFILE',
    editBtn: 'Edit',
    roleLabel: 'Your Role',
    countryLabel: 'Your Country',
    yearsLabel: 'Years of Experience',
    englishLabel: 'English Level',
    salaryLabel: 'Current Salary — USD/year (optional)',
    salaryHint: 'We use this to show how much you may be leaving on the table.',
    skillsLabel: 'Your Current Skills (select all that apply)',
    remoteBtn: 'Remote Experience',
    portfolioBtn: 'Portfolio / GitHub',
    calcBtn: 'CALCULATE MY MARKET VALUE →',
    dataNote: 'Data from WProTalents mandates + LinkedIn Salary + Glassdoor LATAM. Q1 2026. Estimates ± 15%.',
    tabs: { value: 'Market Value', markets: 'Best Markets', skills: 'Skills ROI', readiness: 'Remote Readiness' },
    // Market Value panel
    marketSignal: 'MARKET SIGNAL',
    underpaidBy: 'You may be underpaid by',
    perYear: '/year',
    basedOn: 'Based on',
    in: 'in',
    marketMin: 'Market Min', marketMid: 'Market Mid', marketMax: 'Market Max',
    localSeniority: 'Local ·',
    benchmark: 'Benchmark · Your target',
    top25: 'Top 25% locally',
    goRemote: 'GO REMOTE → EARN MORE',
    remoteUplift: 'remote uplift',
    equivalentRole: 'Equivalent USD remote role ·',
    upliftVsLocal: '% uplift vs local',
    topPaying: 'Top paying country for your profile:',
    remoteYr: '/yr remote',
    percentileLabel: 'YOUR SALARY PERCENTILE (local market)',
    bottom10: 'Bottom 10%',
    top10: 'Top 10%',
    topPct: 'Top',
    // Best Markets panel
    marketsDesc: 'Ranked by demand vs competition for your role.',
    hot: 'Hot',
    strong: 'Strong',
    equal: '= high demand, low competition.',
    demandLabel: 'DEMAND',
    competitionLabel: 'COMPETITION',
    avgRemoteLabel: '/yr remote',
    // Skills ROI panel
    skillsDesc: "Skills you don't have yet — ranked by salary impact for your seniority level.",
    skillsEmpty: 'Your skill set looks strong for your role.',
    skillsEmptySub: 'Consider adding LLM / AI skills for the highest salary uplift.',
    totalUpside: 'TOTAL POTENTIAL UPSIDE',
    realisticNote: (n: number) => `If you added all ${n} skills above (realistic over 12–18 months)`,
    // Remote Readiness panel
    readinessScore: 'REMOTE READINESS SCORE',
    readyDesc: 'Your profile is ready for US & EU remote roles. Apply with confidence.',
    notReadyDesc: 'Close these gaps to unlock global remote opportunities.',
    strengthsLabel: '✓ STRENGTHS',
    gapsLabel: '⚡ GAPS TO CLOSE',
    topActionLabel: 'YOUR #1 NEXT ACTION',
    featuredBtn: 'GET FEATURED TO 23K+ HIRING MANAGERS →',
    // Bottom CTA
    ctaTitle: 'WANT US TO FIND YOU A ROLE AT THIS SALARY?',
    ctaDesc: 'WProTalents places senior LATAM tech talent with US & EU companies. Free for candidates.',
    ctaBtn: 'Work with WPro',
    currentLabel: 'Current',
    expLabel: 'Exp',
  },
  ES: {
    sectionTitle: 'Mi Valor de Mercado',
    sectionDesc: 'Ingresa tu perfil — ve tu salario real de mercado, mejores oportunidades y habilidades a aprender para máximo ROI.',
    profileHeader: 'TU PERFIL',
    editBtn: 'Editar',
    roleLabel: 'Tu Rol',
    countryLabel: 'Tu País',
    yearsLabel: 'Años de Experiencia',
    englishLabel: 'Nivel de Inglés',
    salaryLabel: 'Salario Actual — USD/año (opcional)',
    salaryHint: 'Usamos esto para mostrarte cuánto podrías estar dejando sobre la mesa.',
    skillsLabel: 'Tus Habilidades Actuales (selecciona todas las que apliquen)',
    remoteBtn: 'Experiencia Remota',
    portfolioBtn: 'Portfolio / GitHub',
    calcBtn: 'CALCULAR MI VALOR DE MERCADO →',
    dataNote: 'Datos de mandatos WProTalents + LinkedIn Salary + Glassdoor LATAM. Q1 2026. Estimaciones ± 15%.',
    tabs: { value: 'Valor de Mercado', markets: 'Mejores Mercados', skills: 'ROI de Habilidades', readiness: 'Preparación Remota' },
    marketSignal: 'SEÑAL DE MERCADO',
    underpaidBy: 'Podrías estar ganando de menos',
    perYear: '/año',
    basedOn: 'Basado en',
    in: 'en',
    marketMin: 'Mínimo', marketMid: 'Referencia', marketMax: 'Máximo',
    localSeniority: 'Local ·',
    benchmark: 'Referencia · Tu objetivo',
    top25: 'Top 25% local',
    goRemote: 'TRABAJA REMOTO → GANA MÁS',
    remoteUplift: 'prima remota',
    equivalentRole: 'Rol remoto equivalente en USD ·',
    upliftVsLocal: '% sobre salario local',
    topPaying: 'País que más paga para tu perfil:',
    remoteYr: '/año remoto',
    percentileLabel: 'TU PERCENTIL SALARIAL (mercado local)',
    bottom10: 'Percentil 10',
    top10: 'Percentil 90',
    topPct: 'Top',
    marketsDesc: 'Clasificados por demanda vs competencia para tu rol.',
    hot: 'Caliente',
    strong: 'Sólido',
    equal: '= alta demanda, baja competencia.',
    demandLabel: 'DEMANDA',
    competitionLabel: 'COMPETENCIA',
    avgRemoteLabel: '/año remoto',
    skillsDesc: 'Habilidades que aún no tienes — clasificadas por impacto salarial para tu nivel.',
    skillsEmpty: 'Tu conjunto de habilidades se ve sólido para tu rol.',
    skillsEmptySub: 'Considera agregar LLM / IA para el mayor incremento salarial.',
    totalUpside: 'POTENCIAL TOTAL DE AUMENTO',
    realisticNote: (n: number) => `Si agregas las ${n} habilidades anteriores (realista en 12–18 meses)`,
    readinessScore: 'PUNTAJE DE PREPARACIÓN REMOTA',
    readyDesc: 'Tu perfil está listo para roles remotos en EE.UU. y Europa. Postúlate con confianza.',
    notReadyDesc: 'Cierra estas brechas para acceder a oportunidades remotas globales.',
    strengthsLabel: '✓ FORTALEZAS',
    gapsLabel: '⚡ BRECHAS A CERRAR',
    topActionLabel: 'TU ACCIÓN #1 AHORA',
    featuredBtn: 'APARECER ANTE 23K+ HIRING MANAGERS →',
    ctaTitle: '¿QUIERES QUE TE ENCONTREMOS UN ROL CON ESTE SALARIO?',
    ctaDesc: 'WProTalents coloca talento tech senior de LATAM en empresas de EE.UU. y Europa. Gratis para candidatos.',
    ctaBtn: 'Trabajar con WPro',
    currentLabel: 'Actual',
    expLabel: 'Exp',
  },
  PT: {
    sectionTitle: 'Meu Valor de Mercado',
    sectionDesc: 'Insira seu perfil — veja seu salário real de mercado, melhores oportunidades e habilidades a aprender para máximo ROI.',
    profileHeader: 'SEU PERFIL',
    editBtn: 'Editar',
    roleLabel: 'Seu Cargo',
    countryLabel: 'Seu País',
    yearsLabel: 'Anos de Experiência',
    englishLabel: 'Nível de Inglês',
    salaryLabel: 'Salário Atual — USD/ano (opcional)',
    salaryHint: 'Usamos isso para mostrar quanto você pode estar deixando na mesa.',
    skillsLabel: 'Suas Habilidades Atuais (selecione todas que se aplicam)',
    remoteBtn: 'Experiência Remota',
    portfolioBtn: 'Portfolio / GitHub',
    calcBtn: 'CALCULAR MEU VALOR DE MERCADO →',
    dataNote: 'Dados de mandatos WProTalents + LinkedIn Salary + Glassdoor LATAM. Q1 2026. Estimativas ± 15%.',
    tabs: { value: 'Valor de Mercado', markets: 'Melhores Mercados', skills: 'ROI de Habilidades', readiness: 'Prontidão Remota' },
    marketSignal: 'SINAL DE MERCADO',
    underpaidBy: 'Você pode estar ganhando abaixo do mercado em',
    perYear: '/ano',
    basedOn: 'Com base em',
    in: 'em',
    marketMin: 'Mínimo', marketMid: 'Referência', marketMax: 'Máximo',
    localSeniority: 'Local ·',
    benchmark: 'Referência · Sua meta',
    top25: 'Top 25% local',
    goRemote: 'TRABALHE REMOTO → GANHE MAIS',
    remoteUplift: 'prêmio remoto',
    equivalentRole: 'Vaga remota equivalente em USD ·',
    upliftVsLocal: '% acima do salário local',
    topPaying: 'País que mais paga para o seu perfil:',
    remoteYr: '/ano remoto',
    percentileLabel: 'SEU PERCENTIL SALARIAL (mercado local)',
    bottom10: 'Percentil 10',
    top10: 'Percentil 90',
    topPct: 'Top',
    marketsDesc: 'Classificados por demanda vs concorrência para a sua função.',
    hot: 'Quente',
    strong: 'Sólido',
    equal: '= alta demanda, baixa concorrência.',
    demandLabel: 'DEMANDA',
    competitionLabel: 'CONCORRÊNCIA',
    avgRemoteLabel: '/ano remoto',
    skillsDesc: 'Habilidades que você ainda não tem — classificadas por impacto salarial para o seu nível.',
    skillsEmpty: 'Seu conjunto de habilidades parece sólido para a sua função.',
    skillsEmptySub: 'Considere adicionar LLM / IA para o maior aumento salarial.',
    totalUpside: 'POTENCIAL TOTAL DE AUMENTO',
    realisticNote: (n: number) => `Se você adicionar as ${n} habilidades acima (realista em 12–18 meses)`,
    readinessScore: 'PONTUAÇÃO DE PRONTIDÃO REMOTA',
    readyDesc: 'Seu perfil está pronto para vagas remotas nos EUA e Europa. Candidate-se com confiança.',
    notReadyDesc: 'Feche essas lacunas para acessar oportunidades remotas globais.',
    strengthsLabel: '✓ PONTOS FORTES',
    gapsLabel: '⚡ LACUNAS A FECHAR',
    topActionLabel: 'SUA AÇÃO #1 AGORA',
    featuredBtn: 'SER DESTAQUE PARA 23K+ HIRING MANAGERS →',
    ctaTitle: 'QUER QUE A GENTE ENCONTRE UMA VAGA COM ESSE SALÁRIO PARA VOCÊ?',
    ctaDesc: 'WProTalents conecta talentos sêniores do LATAM com empresas dos EUA e Europa. Gratuito para candidatos.',
    ctaBtn: 'Trabalhar com WPro',
    currentLabel: 'Atual',
    expLabel: 'Exp',
  },
};

// ─── Role / country / english options (trilingual) ────────────────────────────

const ROLE_OPTIONS: Record<Lang, { value: RoleKey; label: string }[]> = {
  EN: [
    { value: 'ai_ml', label: 'AI / ML Engineer' }, { value: 'llm', label: 'LLM Engineer' },
    { value: 'data', label: 'Data Scientist' }, { value: 'data_eng', label: 'Data Engineer' },
    { value: 'backend', label: 'Backend Engineer' }, { value: 'fullstack', label: 'Full Stack Engineer' },
    { value: 'frontend', label: 'Frontend Engineer' }, { value: 'devops', label: 'DevOps / SRE' },
    { value: 'product', label: 'Product Manager' }, { value: 'eng_manager', label: 'Engineering Manager' },
  ],
  ES: [
    { value: 'ai_ml', label: 'AI / ML Engineer' }, { value: 'llm', label: 'Ingeniero LLM' },
    { value: 'data', label: 'Científico de Datos' }, { value: 'data_eng', label: 'Ingeniero de Datos' },
    { value: 'backend', label: 'Desarrollador Backend' }, { value: 'fullstack', label: 'Desarrollador Full Stack' },
    { value: 'frontend', label: 'Desarrollador Frontend' }, { value: 'devops', label: 'DevOps / SRE' },
    { value: 'product', label: 'Product Manager' }, { value: 'eng_manager', label: 'Engineering Manager' },
  ],
  PT: [
    { value: 'ai_ml', label: 'Engenheiro AI / ML' }, { value: 'llm', label: 'Engenheiro LLM' },
    { value: 'data', label: 'Cientista de Dados' }, { value: 'data_eng', label: 'Engenheiro de Dados' },
    { value: 'backend', label: 'Desenvolvedor Backend' }, { value: 'fullstack', label: 'Desenvolvedor Full Stack' },
    { value: 'frontend', label: 'Desenvolvedor Frontend' }, { value: 'devops', label: 'DevOps / SRE' },
    { value: 'product', label: 'Product Manager' }, { value: 'eng_manager', label: 'Engineering Manager' },
  ],
};

const COUNTRY_OPTIONS: { value: CountryCode; flag: string; label: string }[] = [
  { value: 'BR', flag: '🇧🇷', label: 'Brasil / Brazil' },
  { value: 'MX', flag: '🇲🇽', label: 'México / Mexico' },
  { value: 'CO', flag: '🇨🇴', label: 'Colombia' },
  { value: 'AR', flag: '🇦🇷', label: 'Argentina' },
  { value: 'CL', flag: '🇨🇱', label: 'Chile' },
];

const ENGLISH_OPTIONS: Record<Lang, { value: EnglishLevel; label: string; desc: string }[]> = {
  EN: [
    { value: 'basic',          label: 'Basic',         desc: 'Can read but struggle in calls' },
    { value: 'conversational', label: 'Conversational', desc: 'Handle work calls with effort' },
    { value: 'fluent',         label: 'Fluent',         desc: 'Comfortable in all professional contexts' },
    { value: 'bilingual',      label: 'Bilingual',      desc: 'Native or near-native' },
  ],
  ES: [
    { value: 'basic',          label: 'Básico',          desc: 'Leo pero me cuesta en llamadas' },
    { value: 'conversational', label: 'Conversacional',   desc: 'Me defiendo en llamadas de trabajo' },
    { value: 'fluent',         label: 'Fluido',           desc: 'Cómodo en cualquier contexto profesional' },
    { value: 'bilingual',      label: 'Bilingüe',         desc: 'Nativo o casi nativo' },
  ],
  PT: [
    { value: 'basic',          label: 'Básico',       desc: 'Leio mas tenho dificuldade em chamadas' },
    { value: 'conversational', label: 'Conversacional',desc: 'Me viro em chamadas de trabalho' },
    { value: 'fluent',         label: 'Fluente',       desc: 'Confortável em qualquer contexto profissional' },
    { value: 'bilingual',      label: 'Bilíngue',      desc: 'Nativo ou quase nativo' },
  ],
};

const SKILLS_LIST = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Go', 'Rust', 'Java',
  'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Terraform',
  'PyTorch', 'TensorFlow', 'LLM / AI', 'dbt', 'Spark', 'SQL',
  'React Native', 'Next.js', 'FastAPI', 'GraphQL', 'Redis',
];

// ─── Shared helpers ───────────────────────────────────────────────────────────

const cls = {
  label: 'mono text-[8px] text-text/40 block mb-1.5 uppercase tracking-widest font-bold',
  select: 'w-full bg-bg border border-border px-3 py-2.5 mono text-[11px] text-text focus:outline-none focus:border-accent/50 transition-colors appearance-none',
  chip: (active: boolean) =>
    `px-2.5 py-1 mono text-[8px] border transition-all cursor-pointer select-none ${
      active ? 'bg-accent text-black border-accent font-bold' : 'border-border text-text/30 hover:border-text/30 hover:text-text/60'
    }`,
};

function fmt(n: number) { return '$' + n.toLocaleString(); }

type IntelTab = 'value' | 'markets' | 'skills' | 'readiness';

// ─── Market Value Panel ───────────────────────────────────────────────────────

function MarketValuePanel({ input, lang }: { input: CandidateInput; lang: Lang }) {
  const t = T[lang];
  const mv = computeMarketValue(input, lang);
  const gap = computeSalaryGap(input, lang);
  const roleName = ROLE_OPTIONS[lang].find(r => r.value === input.role)?.label ?? input.role;
  const countryName = COUNTRY_OPTIONS.find(c => c.value === input.country)?.label ?? input.country;

  return (
    <div className="space-y-4">
      {mv.underpaidBy && mv.underpaidBy > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          className="border border-red-500/30 bg-red-500/5 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="mono text-[9px] text-red-400 font-bold mb-1">{t.marketSignal}</p>
              <p className="text-lg font-black text-text">
                {t.underpaidBy}{' '}
                <span className="text-red-400">{fmt(mv.underpaidBy)}{t.perYear}</span>
              </p>
              <p className="mono text-[9px] text-text/40 mt-1">
                {t.basedOn} {mv.seniorityLabel} {roleName} {t.in} {countryName}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border">
        {[
          { label: t.marketMin, value: fmt(mv.marketMin), sub: t.localSeniority + ' ' + mv.seniorityLabel, accent: false },
          { label: t.marketMid, value: fmt(mv.marketMid), sub: t.benchmark, accent: true },
          { label: t.marketMax, value: fmt(mv.marketMax), sub: t.top25, accent: false },
        ].map(({ label, value, sub, accent }) => (
          <div key={label} className={`p-5 text-center ${accent ? 'bg-accent/5' : 'bg-surface'}`}>
            <div className={`text-2xl font-black ${accent ? 'text-accent' : 'text-text'}`}>{value}</div>
            <div className="mono text-[8px] text-text/40 mt-1">{label}</div>
            <div className="mono text-[7px] text-text/20 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      <div className="border border-accent/20 bg-accent/5 p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="mono text-[8px] text-accent font-bold">{t.goRemote}</p>
            <p className="text-2xl font-black text-text mt-1">{fmt(mv.remoteMid)}<span className="text-sm font-normal text-text/40">{t.perYear}</span></p>
            <p className="mono text-[9px] text-text/40 mt-0.5">{t.equivalentRole} {mv.remoteUplift}{t.upliftVsLocal}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-accent">+{mv.remoteUplift}%</div>
            <div className="mono text-[8px] text-text/30">{t.remoteUplift}</div>
          </div>
        </div>
        <div className="pt-3 border-t border-accent/10">
          <p className="mono text-[8px] text-text/30">
            {t.topPaying} <span className="text-accent font-bold">{gap.topPayingFlag} {gap.topPayingCountry} — {fmt(gap.topPayingSalary)}{t.remoteYr}</span>
          </p>
        </div>
      </div>

      {input.currentSalary && (
        <div className="border border-border p-4">
          <p className="mono text-[8px] text-text/40 mb-2">{t.percentileLabel}</p>
          <div className="relative h-2 bg-border rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${mv.percentile}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }} className="h-full bg-accent" />
          </div>
          <div className="flex justify-between mt-1">
            <span className="mono text-[7px] text-text/20">{t.bottom10}</span>
            <span className="mono text-[8px] text-accent font-bold">{t.topPct} {100 - mv.percentile}%</span>
            <span className="mono text-[7px] text-text/20">{t.top10}</span>
          </div>
        </div>
      )}
      <p className="mono text-[7px] text-text/20">{t.dataNote}</p>
    </div>
  );
}

// ─── Best Markets Panel ───────────────────────────────────────────────────────

function BestMarketsPanel({ input, lang }: { input: CandidateInput; lang: Lang }) {
  const t = T[lang];
  const markets = getBestMarkets(input, lang);
  const oppColor = {
    hot: 'text-orange-400 border-orange-400/30 bg-orange-400/5',
    strong: 'text-green-400 border-green-400/30 bg-green-400/5',
    saturated: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5',
  };

  return (
    <div className="space-y-3">
      <p className="mono text-[9px] text-text/30 mb-4">{t.marketsDesc} <span className="text-accent">{t.hot}</span> {t.equal}</p>
      {markets.map((m, i) => (
        <motion.div key={m.country} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.07 }} className="border border-border bg-surface p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{m.flag}</span>
              <div>
                <p className="font-bold text-sm text-text">{m.name}</p>
                <p className="mono text-[8px] text-accent font-bold">{fmt(m.avgRemote)}{t.avgRemoteLabel}</p>
              </div>
            </div>
            <span className={`mono text-[8px] font-bold border px-2 py-0.5 ${oppColor[m.opportunityKey]}`}>
              {m.opportunity}
            </span>
          </div>
          <p className="mono text-[9px] text-text/40 leading-relaxed mb-3">{m.verdict}</p>
          <div className="flex gap-4">
            <div>
              <div className={`mono text-[7px] font-bold ${m.demand === 'High' || m.demand === 'Alta' ? 'text-green-400' : m.demand === 'Low' || m.demand === 'Baja' || m.demand === 'Baixa' ? 'text-red-400' : 'text-yellow-400'}`}>{m.demand}</div>
              <div className="mono text-[6px] text-text/20">{t.demandLabel}</div>
            </div>
            <div>
              <div className={`mono text-[7px] font-bold ${m.competition === 'Low' || m.competition === 'Baja' || m.competition === 'Baixa' ? 'text-green-400' : m.competition === 'High' || m.competition === 'Alta' ? 'text-red-400' : 'text-yellow-400'}`}>{m.competition}</div>
              <div className="mono text-[6px] text-text/20">{t.competitionLabel}</div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Skills ROI Panel ─────────────────────────────────────────────────────────

function SkillsROIPanel({ input, lang }: { input: CandidateInput; lang: Lang }) {
  const t = T[lang];
  const skills = getSkillsROI(input, lang);
  const demandColor = { 'Very High': 'text-red-400', High: 'text-orange-400', Medium: 'text-yellow-400' };

  if (skills.length === 0) return (
    <div className="text-center py-12 border border-dashed border-border">
      <CheckCircle size={24} className="text-green-400 mx-auto mb-3" />
      <p className="mono text-[10px] text-text/40">{t.skillsEmpty}</p>
      <p className="mono text-[9px] text-text/20 mt-1">{t.skillsEmptySub}</p>
    </div>
  );

  return (
    <div className="space-y-3">
      <p className="mono text-[9px] text-text/30 mb-4">{t.skillsDesc}</p>
      {skills.map((s, i) => (
        <motion.div key={s.skill} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }} className="border border-border bg-surface p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-sm text-text">{s.skill}</p>
                <span className={`mono text-[7px] font-bold ${demandColor[s.demand]}`}>{s.demand}</span>
              </div>
              <span className="mono text-[8px] text-text/40 flex items-center gap-1">
                <Clock size={8} /> {s.timeToLearn}
              </span>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xl font-black text-accent">+{fmt(s.salaryBoost)}</div>
              <div className="mono text-[7px] text-text/30">{t.perYear}</div>
            </div>
          </div>
          <div className="mt-3 h-1 bg-border rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (s.salaryBoost / 25000) * 100)}%` }}
              transition={{ duration: 0.7, delay: i * 0.08 + 0.2 }}
              className="h-full bg-accent" />
          </div>
        </motion.div>
      ))}
      <div className="border border-border bg-bg p-4">
        <p className="mono text-[8px] text-text/40 mb-1">{t.totalUpside}</p>
        <p className="text-2xl font-black text-accent">+{fmt(skills.reduce((s, r) => s + r.salaryBoost, 0))}{t.perYear}</p>
        <p className="mono text-[8px] text-text/30 mt-1">{t.realisticNote(skills.length)}</p>
      </div>
    </div>
  );
}

// ─── Remote Readiness Panel ───────────────────────────────────────────────────

function RemoteReadinessPanel({ input, lang }: { input: CandidateInput; lang: Lang }) {
  const t = T[lang];
  const r = getRemoteReadiness(input, lang);
  const barColor = r.score >= 70 ? 'bg-green-400' : r.score >= 50 ? 'bg-yellow-400' : 'bg-red-400';
  const scoreColor = r.score >= 70 ? 'text-green-400' : r.score >= 50 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="space-y-4">
      <div className="border border-border bg-surface p-6 text-center">
        <p className="mono text-[8px] text-text/40 mb-3">{t.readinessScore}</p>
        <div className={`text-5xl font-black mb-1 ${scoreColor}`}>{r.score}</div>
        <div className="text-sm font-bold text-text mb-4">{r.label}</div>
        <div className="relative h-2 bg-border rounded-full overflow-hidden max-w-xs mx-auto">
          <motion.div initial={{ width: 0 }} animate={{ width: `${r.score}%` }}
            transition={{ duration: 1, ease: 'easeOut' }} className={`h-full ${barColor}`} />
        </div>
        <p className="mono text-[8px] text-text/30 mt-3">
          {r.ready ? t.readyDesc : t.notReadyDesc}
        </p>
      </div>

      {r.strengths.length > 0 && (
        <div>
          <p className="mono text-[8px] text-green-400 font-bold mb-2">{t.strengthsLabel}</p>
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

      {r.gaps.length > 0 && (
        <div>
          <p className="mono text-[8px] text-red-400 font-bold mb-2">{t.gapsLabel}</p>
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

      <div className="border border-accent/20 bg-accent/5 p-4">
        <p className="mono text-[8px] text-accent font-bold mb-1">{t.topActionLabel}</p>
        <p className="mono text-[9px] text-text/60">{r.topAction}</p>
      </div>

      {r.ready && (
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('open-linkedin-boost'))}
          className="w-full py-3 bg-[#0077B5] text-white font-bold mono text-[10px] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Linkedin size={14} /> {t.featuredBtn}
        </button>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const DEFAULT_INPUT: CandidateInput = {
  role: 'backend', country: 'BR', yearsExp: 4,
  englishLevel: 'conversational', currentSalary: undefined,
  skills: [], hasRemoteExp: false, hasPortfolio: false,
};

export default function CandidateIntel({ lang = 'EN' }: { lang?: Lang }) {
  const t = T[lang];
  const [input, setInput] = useState<CandidateInput>(DEFAULT_INPUT);
  const [computed, setComputed] = useState(false);
  const [activeTab, setActiveTab] = useState<IntelTab>('value');

  const set = <K extends keyof CandidateInput>(key: K, val: CandidateInput[K]) =>
    setInput(prev => ({ ...prev, [key]: val }));
  const toggleSkill = (skill: string) =>
    set('skills', input.skills.includes(skill) ? input.skills.filter(s => s !== skill) : [...input.skills, skill]);

  const TABS: { id: IntelTab; label: string; icon: React.ElementType }[] = [
    { id: 'value',     label: t.tabs.value,     icon: DollarSign },
    { id: 'markets',   label: t.tabs.markets,   icon: Map },
    { id: 'skills',    label: t.tabs.skills,    icon: Zap },
    { id: 'readiness', label: t.tabs.readiness, icon: Wifi },
  ];

  return (
    <div className="space-y-6">
      {/* Input form */}
      <div className="border border-border bg-surface">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Sparkles size={12} className="text-accent" />
          <span className="mono text-[9px] font-bold text-accent tracking-widest">{t.profileHeader}</span>
          {computed && (
            <button onClick={() => setComputed(false)}
              className="ml-auto mono text-[8px] text-text/30 hover:text-accent transition-colors flex items-center gap-1">
              <RefreshCw size={9} /> {t.editBtn}
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!computed ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={cls.label}>{t.roleLabel} *</label>
                  <select value={input.role} onChange={e => set('role', e.target.value as RoleKey)} className={cls.select}>
                    {ROLE_OPTIONS[lang].map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={cls.label}>{t.countryLabel} *</label>
                  <select value={input.country} onChange={e => set('country', e.target.value as CountryCode)} className={cls.select}>
                    {COUNTRY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.flag} {o.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={cls.label}>{t.yearsLabel} *</label>
                  <input type="number" min={0} max={30} value={input.yearsExp}
                    onChange={e => set('yearsExp', Number(e.target.value))} className={cls.select} />
                </div>
                <div>
                  <label className={cls.label}>{t.englishLabel} *</label>
                  <select value={input.englishLevel} onChange={e => set('englishLevel', e.target.value as EnglishLevel)} className={cls.select}>
                    {ENGLISH_OPTIONS[lang].map(o => <option key={o.value} value={o.value}>{o.label} — {o.desc}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={cls.label}>{t.salaryLabel}</label>
                <p className="mono text-[8px] text-text/20 mb-1.5">{t.salaryHint}</p>
                <input type="number" min={0} step={500} placeholder="e.g. 12000"
                  value={input.currentSalary ?? ''}
                  onChange={e => set('currentSalary', e.target.value ? Number(e.target.value) : undefined)}
                  className={cls.select} />
              </div>
              <div>
                <label className={cls.label}>{t.skillsLabel}</label>
                <div className="flex flex-wrap gap-1.5">
                  {SKILLS_LIST.map(s => (
                    <button key={s} type="button" onClick={() => toggleSkill(s)} className={cls.chip(input.skills.includes(s))}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => set('hasRemoteExp', !input.hasRemoteExp)}
                  className={cls.chip(input.hasRemoteExp) + ' w-full justify-center py-2.5'}>
                  {input.hasRemoteExp ? '✓' : '○'} {t.remoteBtn}
                </button>
                <button type="button" onClick={() => set('hasPortfolio', !input.hasPortfolio)}
                  className={cls.chip(input.hasPortfolio) + ' w-full justify-center py-2.5'}>
                  {input.hasPortfolio ? '✓' : '○'} {t.portfolioBtn}
                </button>
              </div>
              <button onClick={() => setComputed(true)}
                className="w-full py-3.5 bg-accent text-black font-black mono text-[11px] hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                <BarChart2 size={14} /> {t.calcBtn}
              </button>
              <p className="mono text-[7px] text-text/20 text-center">{t.dataNote}</p>
            </motion.div>
          ) : (
            <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="px-6 py-3 flex flex-wrap gap-4">
              {[
                { label: t.roleLabel, value: ROLE_OPTIONS[lang].find(r => r.value === input.role)?.label },
                { label: t.countryLabel, value: COUNTRY_OPTIONS.find(c => c.value === input.country)?.flag + ' ' + COUNTRY_OPTIONS.find(c => c.value === input.country)?.label.split(' /')[0] },
                { label: t.expLabel,   value: `${input.yearsExp}yr` },
                { label: t.englishLabel, value: ENGLISH_OPTIONS[lang].find(e => e.value === input.englishLevel)?.label },
                input.currentSalary ? { label: t.currentLabel, value: fmt(input.currentSalary) + '/yr' } : null,
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
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <div className="flex items-center gap-1 border-b border-border mb-6 overflow-x-auto">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-1.5 px-4 py-3 mono text-[9px] font-bold whitespace-nowrap border-b-2 transition-all ${
                    activeTab === id ? 'border-accent text-accent' : 'border-transparent text-text/40 hover:text-text'
                  }`}>
                  <Icon size={12} /> {label.toUpperCase()}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                {activeTab === 'value'     && <MarketValuePanel     input={input} lang={lang} />}
                {activeTab === 'markets'   && <BestMarketsPanel     input={input} lang={lang} />}
                {activeTab === 'skills'    && <SkillsROIPanel       input={input} lang={lang} />}
                {activeTab === 'readiness' && <RemoteReadinessPanel input={input} lang={lang} />}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 border border-accent/20 bg-accent/5 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="mono text-[9px] font-bold text-accent mb-1">{t.ctaTitle}</p>
                <p className="mono text-[8px] text-text/40">{t.ctaDesc}</p>
              </div>
              <a href="https://wprotalents.lat" target="_blank" rel="noopener noreferrer"
                className="mono text-[9px] font-bold bg-accent text-black px-5 py-2.5 hover:opacity-90 transition-opacity whitespace-nowrap flex items-center gap-2 shrink-0">
                {t.ctaBtn} <ChevronRight size={12} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
