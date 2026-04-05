import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  MapPin,
  Building2,
  ExternalLink,
  Briefcase,
  Globe,
  Filter,
  Loader2,
  AlertCircle,
  Users,
  Zap,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Clock
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

const REGIONS = ['All', 'LATAM', 'USA', 'Europe', 'Worldwide'];

const JOBS_TRANSLATIONS = {
  EN: {
    // Client section
    clientBadge: "FOR COMPANIES",
    clientHeadline: "Hire LATAM AI Talent — Faster.",
    clientSubheadline: "Access pre-vetted AI engineers, data scientists & ML practitioners from Latin America at 40–60% lower cost than US equivalents. Same quality. Better timezone overlap.",
    stat1Label: "Avg time-to-hire",
    stat1Value: "18 days",
    stat2Label: "Cost vs. US market",
    stat2Value: "−52%",
    stat3Label: "Senior AI roles filled",
    stat3Value: "340+",
    stat4Label: "Countries covered",
    stat4Value: "12",
    offer1: "Sourcing & shortlisting in 72h",
    offer2: "Pre-vetted technical skills",
    offer3: "Compliance & payroll handled",
    offer4: "Dedicated talent intelligence",
    ctaButton: "REQUEST TALENT →",
    ctaNote: "No commitment. Response in 24h.",
    // Candidate section
    candidateBadge: "FOR CANDIDATES",
    candidateHeadline: "AI Job Intelligence",
    candidateTagline: "Live feed of AI, engineering & data roles across LATAM, USA and Europe.",
    searchPlaceholder: "Search by title or company...",
    scanning: "Scanning AI global markets...",
    failed: "Intelligence Retrieval Failed",
    retry: "RETRY SCAN",
    viewJob: "APPLY",
    noJobs: "No matching AI opportunities found in current scan.",
    salary: "COMP",
    source: "VIA",
    liveRoles: "live roles",
    filtered: "filtered",
    justPosted: "RECENT",
  },
  ES: {
    clientBadge: "PARA EMPRESAS",
    clientHeadline: "Contrata Talento de IA LATAM — Rápido.",
    clientSubheadline: "Accede a ingenieros de IA, científicos de datos y especialistas en ML de América Latina a un costo 40–60% menor que equivalentes en EE. UU. Misma calidad. Mejor zona horaria.",
    stat1Label: "Tiempo promedio de contratación",
    stat1Value: "18 días",
    stat2Label: "Costo vs. mercado US",
    stat2Value: "−52%",
    stat3Label: "Roles senior de IA cubiertos",
    stat3Value: "340+",
    stat4Label: "Países cubiertos",
    stat4Value: "12",
    offer1: "Búsqueda y selección en 72h",
    offer2: "Habilidades técnicas pre-evaluadas",
    offer3: "Cumplimiento y nómina gestionados",
    offer4: "Inteligencia de talento dedicada",
    ctaButton: "SOLICITAR TALENTO →",
    ctaNote: "Sin compromiso. Respuesta en 24h.",
    candidateBadge: "PARA CANDIDATOS",
    candidateHeadline: "Inteligencia de Empleos IA",
    candidateTagline: "Feed en vivo de roles de IA, ingeniería y datos en LATAM, EE. UU. y Europa.",
    searchPlaceholder: "Buscar por título o empresa...",
    scanning: "Escaneando mercados globales de IA...",
    failed: "Fallo en la Recuperación de Inteligencia",
    retry: "REINTENTAR ESCANEO",
    viewJob: "APLICAR",
    noJobs: "No se encontraron oportunidades de IA en el escaneo actual.",
    salary: "COMP",
    source: "VÍA",
    liveRoles: "roles en vivo",
    filtered: "filtrados",
    justPosted: "RECIENTE",
  },
  PT: {
    clientBadge: "PARA EMPRESAS",
    clientHeadline: "Contrate Talentos de IA LATAM — Rápido.",
    clientSubheadline: "Acesse engenheiros de IA, cientistas de dados e especialistas em ML da América Latina com custo 40–60% menor que equivalentes nos EUA. Mesma qualidade. Fuso horário melhor.",
    stat1Label: "Tempo médio de contratação",
    stat1Value: "18 dias",
    stat2Label: "Custo vs. mercado EUA",
    stat2Value: "−52%",
    stat3Label: "Vagas sênior de IA preenchidas",
    stat3Value: "340+",
    stat4Label: "Países cobertos",
    stat4Value: "12",
    offer1: "Seleção e triagem em 72h",
    offer2: "Habilidades técnicas pré-avaliadas",
    offer3: "Conformidade e folha de pagamento geridas",
    offer4: "Inteligência de talentos dedicada",
    ctaButton: "SOLICITAR TALENTOS →",
    ctaNote: "Sem compromisso. Resposta em 24h.",
    candidateBadge: "PARA CANDIDATOS",
    candidateHeadline: "Inteligência de Vagas de IA",
    candidateTagline: "Feed ao vivo de vagas de IA, engenharia e dados no LATAM, EUA e Europa.",
    searchPlaceholder: "Pesquisar por título ou empresa...",
    scanning: "Escaneando mercados globais de IA...",
    failed: "Falha na Recuperação de Inteligência",
    retry: "REPETIR VARREDURA",
    viewJob: "CANDIDATAR",
    noJobs: "Nenhuma oportunidade de IA encontrada na varredura atual.",
    salary: "COMP",
    source: "VIA",
    liveRoles: "vagas ao vivo",
    filtered: "filtradas",
    justPosted: "RECENTE",
  }
};

function timeAgo(dateStr?: string): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const diffMs = Date.now() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1d ago';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return null;
}

const REGION_COLORS: Record<string, string> = {
  LATAM: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5',
  USA: 'text-blue-400 border-blue-400/30 bg-blue-400/5',
  Europe: 'text-violet-400 border-violet-400/30 bg-violet-400/5',
  Worldwide: 'text-accent border-accent/30 bg-accent/5',
};

export default function JobsPage({ lang = 'EN' }: { lang?: string }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');

  const t = JOBS_TRANSLATIONS[lang as keyof typeof JOBS_TRANSLATIONS] || JOBS_TRANSLATIONS.EN;

  useEffect(() => {
    fetchJobs();
  }, [lang]);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/jobs?lang=${lang}`);
      if (!response.ok) throw new Error('Failed to fetch jobs');
      const data = await response.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === 'All' || job.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  const regionCounts = REGIONS.reduce((acc, r) => {
    acc[r] = r === 'All' ? jobs.length : jobs.filter(j => j.region === r).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-bg">

      {/* ── CLIENT SECTION ──────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="p-6 md:p-12 max-w-7xl mx-auto">

          {/* Badge */}
          <div className="flex items-center gap-2 mb-8">
            <span className="mono text-[9px] bg-accent text-black px-2 py-1 font-bold tracking-widest">{t.clientBadge}</span>
            <div className="h-px flex-1 bg-accent/20" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: headline + offer list */}
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none mb-6">
                {t.clientHeadline}
              </h1>
              <p className="text-text/60 text-lg leading-relaxed mb-8 max-w-lg">
                {t.clientSubheadline}
              </p>

              <ul className="space-y-3 mb-8">
                {[t.offer1, t.offer2, t.offer3, t.offer4].map((offer, i) => (
                  <li key={i} className="flex items-center gap-3 text-text/80">
                    <CheckCircle2 size={16} className="text-accent shrink-0" />
                    <span className="text-sm">{offer}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-4">
                <a
                  href="mailto:juan@wprotalents.com?subject=LATAM AI Talent Request"
                  className="inline-flex items-center gap-2 bg-accent text-black px-8 py-4 font-black text-sm tracking-wider hover:opacity-90 transition-opacity"
                >
                  {t.ctaButton}
                </a>
                <span className="mono text-[9px] text-text/30">{t.ctaNote}</span>
              </div>
            </div>

            {/* Right: stats grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: t.stat1Label, value: t.stat1Value, icon: <Clock size={20} /> },
                { label: t.stat2Label, value: t.stat2Value, icon: <TrendingUp size={20} /> },
                { label: t.stat3Label, value: t.stat3Value, icon: <Briefcase size={20} /> },
                { label: t.stat4Label, value: t.stat4Value, icon: <Globe size={20} /> },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-surface border border-border p-6 relative overflow-hidden group hover:border-accent/30 transition-colors"
                >
                  <div className="text-accent/20 mb-3 group-hover:text-accent/40 transition-colors">{stat.icon}</div>
                  <div className="text-3xl font-black tracking-tighter text-accent mb-1">{stat.value}</div>
                  <div className="mono text-[9px] text-text/30 uppercase tracking-widest">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CANDIDATE SECTION ───────────────────────────────────── */}
      <section className="p-6 md:p-12 max-w-7xl mx-auto">

        {/* Badge */}
        <div className="flex items-center gap-2 mb-8">
          <span className="mono text-[9px] border border-text/20 text-text/50 px-2 py-1 tracking-widest">{t.candidateBadge}</span>
          <div className="h-px flex-1 bg-text/5" />
          {!loading && (
            <span className="mono text-[9px] text-text/20">
              <span className="text-accent">{filteredJobs.length}</span> {selectedRegion !== 'All' ? t.filtered : t.liveRoles}
            </span>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-black tracking-tighter uppercase mb-2">{t.candidateHeadline}</h2>
          <p className="text-text/40 mono text-[11px]">{t.candidateTagline}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text/30" size={16} />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface border border-border pl-11 pr-4 py-3 focus:outline-none focus:border-accent transition-colors mono text-[11px] text-text placeholder:text-text/20"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {REGIONS.map(region => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-4 py-3 mono text-[9px] border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  selectedRegion === region
                    ? 'bg-accent text-black border-accent font-bold'
                    : 'bg-surface text-text/40 border-border hover:border-text/20 hover:text-text/60'
                }`}
              >
                {region}
                {regionCounts[region] > 0 && (
                  <span className={`${selectedRegion === region ? 'text-black/60' : 'text-text/20'}`}>
                    {regionCounts[region]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Job Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="text-accent animate-spin" size={36} />
            <span className="mono text-accent/60 text-[11px] animate-pulse tracking-widest">{t.scanning}</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 bg-surface border border-red-500/20">
            <AlertCircle className="text-red-500" size={36} />
            <p className="text-red-500 font-bold uppercase tracking-tighter text-sm">{t.failed}</p>
            <p className="text-text/30 mono text-[10px]">{error}</p>
            <button
              onClick={fetchJobs}
              className="mt-2 px-6 py-2 border border-text/20 text-text/60 mono text-[10px] hover:border-accent hover:text-accent transition-colors"
            >
              {t.retry}
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredJobs.map((job, idx) => {
                  const ago = timeAgo(job.postedAt);
                  const regionStyle = REGION_COLORS[job.region] || 'text-text/40 border-text/10 bg-transparent';
                  return (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                      className="group bg-surface border border-border hover:border-accent/30 transition-all relative overflow-hidden flex flex-col"
                    >
                      {/* Top bar: region + time */}
                      <div className="flex items-center justify-between px-4 pt-3 pb-0">
                        <span className={`mono text-[8px] border px-1.5 py-0.5 ${regionStyle}`}>
                          {job.region}
                        </span>
                        {ago && (
                          <span className="mono text-[8px] text-text/20 flex items-center gap-1">
                            <Clock size={8} /> {ago}
                          </span>
                        )}
                      </div>

                      {/* Body */}
                      <div className="p-4 flex flex-col flex-1">
                        <div className="mono text-[9px] text-accent/70 mb-1.5 flex items-center gap-1.5 truncate">
                          <Building2 size={9} className="shrink-0" />
                          <span className="truncate">{job.company}</span>
                        </div>
                        <h3 className="text-sm font-bold leading-snug group-hover:text-accent transition-colors mb-3 line-clamp-2">
                          {job.title}
                        </h3>

                        <div className="flex items-center gap-1.5 text-text/40 text-xs mb-auto">
                          <MapPin size={10} className="text-accent/40 shrink-0" />
                          <span className="truncate mono text-[9px]">{job.location}</span>
                        </div>

                        {job.salary && (
                          <div className="mt-2 mono text-[9px] text-text/50">
                            {job.salary}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between px-4 py-3 border-t border-text/5">
                        <span className="mono text-[8px] text-text/15">{t.source}: {job.source}</span>
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 bg-text/10 hover:bg-accent text-text/60 hover:text-black px-3 py-1.5 mono text-[8px] font-bold transition-all"
                        >
                          {t.viewJob} <ExternalLink size={9} />
                        </a>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-24 border border-dashed border-border">
                <p className="mono text-text/20 text-[11px]">{t.noJobs}</p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
