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
  AlertCircle
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  salary: string;
  source: string;
  region: string;
}

const REGIONS = ['All', 'LATAM', 'USA', 'Europe', 'Worldwide'];

const JOBS_TRANSLATIONS = {
  EN: {
    title: "AI Job Intelligence",
    tagline: "Curated AI-specific opportunities across USA, EU, and LATAM. Direct signal on the workforce transformation.",
    searchPlaceholder: "Search by title or company...",
    scanning: "Scanning AI global markets...",
    failed: "Intelligence Retrieval Failed",
    retry: "RETRY SCAN",
    viewJob: "VIEW JOB",
    noJobs: "No matching AI opportunities found in current scan.",
    salary: "SALARY",
    source: "SOURCE"
  },
  ES: {
    title: "Inteligencia de Empleos IA",
    tagline: "Oportunidades específicas de IA curadas en EE. UU., UE y LATAM. Señal directa sobre la transformación de la fuerza laboral.",
    searchPlaceholder: "Buscar por título o empresa...",
    scanning: "Escaneando mercados globales de IA...",
    failed: "Fallo en la Recuperación de Inteligencia",
    retry: "REINTENTAR ESCANEO",
    viewJob: "VER EMPLEO",
    noJobs: "No se encontraron oportunidades de IA coincidentes en el escaneo actual.",
    salary: "SALARIO",
    source: "FUENTE"
  },
  PT: {
    title: "Inteligência de Empregos de IA",
    tagline: "Oportunidades específicas de IA selecionadas nos EUA, UE e LATAM. Sinal direto sobre a transformação da força de trabalho.",
    searchPlaceholder: "Pesquisar por título ou empresa...",
    scanning: "Escaneando mercados globais de IA...",
    failed: "Falha na Recuperação de Inteligência",
    retry: "REPETIR VARREDURA",
    viewJob: "VER VAGA",
    noJobs: "Nenhuma oportunidade de IA correspondente encontrada na varredura atual.",
    salary: "SALÁRIO",
    source: "FONTE"
  }
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
      setJobs(data);
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
    
    const matchesRegion = selectedRegion === 'All' || 
      job.region === selectedRegion ||
      job.location.toLowerCase().includes(selectedRegion.toLowerCase());

    return matchesSearch && matchesRegion;
  });

  return (
    <div className="min-h-screen bg-bg p-6 md:p-12">
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-accent flex items-center justify-center text-black">
            <Briefcase size={24} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">{t.title}</h1>
        </div>
        <p className="text-text/60 max-w-2xl text-lg">
          {t.tagline}
        </p>
      </header>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-12">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text/40" size={20} />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface border border-border pl-12 pr-4 py-4 focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
          <Filter size={18} className="text-accent shrink-0" />
          {REGIONS.map(region => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`px-6 py-4 mono text-[10px] border transition-all whitespace-nowrap ${
                selectedRegion === region 
                  ? 'bg-accent text-black border-accent font-bold' 
                  : 'bg-surface text-text/60 border-border hover:border-text/20'
              }`}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="text-accent animate-spin" size={48} />
          <span className="mono text-accent animate-pulse">{t.scanning}</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-surface border border-red-500/20 rounded-sm">
          <AlertCircle className="text-red-500" size={48} />
          <p className="text-red-500 font-bold uppercase tracking-tighter">{t.failed}</p>
          <p className="text-text/40 text-sm">{error}</p>
          <button 
            onClick={fetchJobs}
            className="mt-4 px-6 py-2 bg-text text-bg font-bold hover:opacity-90 transition-colors"
          >
            {t.retry}
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredJobs.map((job, idx) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group bg-surface border border-border p-6 hover:border-accent/40 transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                    <Globe size={48} />
                  </div>
                  
                  <div className="flex flex-col h-full">
                    <div className="mb-6">
                      <div className="mono text-accent mb-2 flex items-center gap-2">
                        <Building2 size={12} /> {job.company}
                      </div>
                      <h3 className="text-xl font-bold leading-tight group-hover:text-accent transition-colors">
                        {job.title}
                      </h3>
                    </div>

                    <div className="space-y-3 mb-8 flex-1">
                      <div className="flex items-center gap-2 text-sm text-text/60">
                        <MapPin size={14} className="text-accent" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-text/60">
                        <span className="mono text-[8px] border border-text/10 px-1 py-0.5">{t.salary}</span>
                        {job.salary}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-text/5">
                      <span className="mono text-[8px] text-text/20">{t.source}: {job.source}</span>
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-text text-bg px-4 py-2 text-xs font-bold hover:bg-accent hover:text-black transition-colors"
                      >
                        {t.viewJob} <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-24 border border-dashed border-border">
              <p className="mono text-text/20">{t.noJobs}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
