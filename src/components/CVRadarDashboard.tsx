import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Search, Filter, TrendingUp, AlertCircle, 
  Loader2, Eye, Mail, CheckCircle2, Clock, Zap,
  ChevronRight, Trash2, Toggle2
} from 'lucide-react';

interface Radar {
  id: string;
  radarName: string;
  isActive: boolean;
  matchThreshold: number;
  newMatches: number;
  lastMatchedAt?: any;
  createdAt: any;
}

interface CVRadarDashboardProps {
  clientId: string;
  lang: 'en' | 'es' | 'pt';
  onCreateRadar: () => void;
  onViewRadar: (radarId: string) => void;
}

const T = {
  en: {
    title: 'CV Radar',
    subtitle: 'Automated candidate matching for your talent requirements',
    createButton: '+ New Radar',
    stats: {
      totalRadars: 'Total Radars',
      activeRadars: 'Active',
      totalMatches: 'Total Matches',
      thisMonth: 'This Month',
    },
    table: {
      name: 'Radar Name',
      status: 'Status',
      threshold: 'Match Threshold',
      matches: 'New Matches',
      lastMatch: 'Last Match',
      actions: 'Actions',
      active: 'Active',
      inactive: 'Inactive',
    },
    recentMatches: 'Recent Matches',
    noRadars: 'No radars yet. Create one to get started!',
    loading: 'Loading radars...',
    error: 'Failed to load radars',
    retry: 'Retry',
    view: 'View',
    delete: 'Delete',
    toggle: 'Toggle',
  },
  es: {
    title: 'CV Radar',
    subtitle: 'Búsqueda automatizada de candidatos para tus requisitos',
    createButton: '+ Nuevo Radar',
    stats: {
      totalRadars: 'Radares Totales',
      activeRadars: 'Activos',
      totalMatches: 'Coincidencias Totales',
      thisMonth: 'Este Mes',
    },
    table: {
      name: 'Nombre del Radar',
      status: 'Estado',
      threshold: 'Umbral de Coincidencia',
      matches: 'Nuevas Coincidencias',
      lastMatch: 'Última Coincidencia',
      actions: 'Acciones',
      active: 'Activo',
      inactive: 'Inactivo',
    },
    recentMatches: 'Coincidencias Recientes',
    noRadars: '¡Sin radares aún. Crea uno para comenzar!',
    loading: 'Cargando radares...',
    error: 'Error al cargar radares',
    retry: 'Reintentar',
    view: 'Ver',
    delete: 'Eliminar',
    toggle: 'Alternar',
  },
  pt: {
    title: 'CV Radar',
    subtitle: 'Busca automatizada de candidatos para seus requisitos de talento',
    createButton: '+ Novo Radar',
    stats: {
      totalRadars: 'Total de Radares',
      activeRadars: 'Ativos',
      totalMatches: 'Total de Correspondências',
      thisMonth: 'Este Mês',
    },
    table: {
      name: 'Nome do Radar',
      status: 'Status',
      threshold: 'Limite de Correspondência',
      matches: 'Novas Correspondências',
      lastMatch: 'Última Correspondência',
      actions: 'Ações',
      active: 'Ativo',
      inactive: 'Inativo',
    },
    recentMatches: 'Correspondências Recentes',
    noRadars: 'Sem radares ainda. Crie um para começar!',
    loading: 'Carregando radares...',
    error: 'Erro ao carregar radares',
    retry: 'Tentar Novamente',
    view: 'Ver',
    delete: 'Deletar',
    toggle: 'Alternar',
  },
};

export default function CVRadarDashboard({
  clientId,
  lang = 'en',
  onCreateRadar,
  onViewRadar,
}: CVRadarDashboardProps) {
  const t = T[lang];
  const [radars, setRadars] = useState<Radar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  // Fetch radars
  useEffect(() => {
    loadRadars();
  }, [clientId]);

  const loadRadars = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/cvradar/list?clientId=${clientId}`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setRadars(data.radars || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Filter radars
  const filtered = radars.filter((r) => {
    const matchesSearch = !search || r.radarName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = showInactive || r.isActive;
    return matchesSearch && matchesStatus;
  });

  const activeCount = radars.filter((r) => r.isActive).length;
  const totalMatches = radars.reduce((sum, r) => sum + r.newMatches, 0);

  const formatDate = (ts: any) => {
    if (!ts) return '—';
    const date = ts.toDate?.() || new Date(ts);
    return date.toLocaleDateString();
  };

  return (
    <section className="px-6 md:px-10 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Zap size={16} className="text-accent" />
          <span className="mono text-[9px] font-bold text-accent tracking-widest uppercase">CV Radar</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-2">{t.title}</h1>
        <p className="mono text-[9px] text-text/40">{t.subtitle}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: t.stats.totalRadars, value: radars.length, color: 'text-text/60' },
          { label: t.stats.activeRadars, value: activeCount, color: 'text-accent' },
          { label: t.stats.totalMatches, value: totalMatches, color: 'text-green-400' },
          { label: t.stats.thisMonth, value: '—', color: 'text-text/40' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="border border-border bg-surface/30 p-4 rounded-lg"
          >
            <p className="mono text-[8px] text-text/40 uppercase tracking-widest mb-2">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text/20" />
          <input
            type="text"
            placeholder="Search radars..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border pl-10 pr-4 py-2 mono text-[11px] focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>

        <button
          onClick={() => setShowInactive(!showInactive)}
          className={`px-3 py-2 mono text-[8px] font-bold uppercase transition-colors ${
            showInactive ? 'border border-accent bg-accent/10 text-accent' : 'border border-border text-text/40 hover:text-text'
          }`}
        >
          <Filter size={12} className="inline mr-1" />
          {showInactive ? 'All' : 'Active'}
        </button>

        <button
          onClick={onCreateRadar}
          className="px-4 py-2 bg-accent text-black mono text-[9px] font-bold uppercase hover:opacity-90 transition-opacity whitespace-nowrap flex items-center gap-2"
        >
          <Plus size={14} />
          {t.createButton}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Loader2 size={24} className="animate-spin text-accent" />
          <p className="mono text-[9px] text-text/20">{t.loading}</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-16 border border-dashed border-red-500/20">
          <AlertCircle size={20} className="text-red-500/50" />
          <p className="mono text-[9px] text-red-400">{t.error}</p>
          <button
            onClick={loadRadars}
            className="mt-2 mono text-[8px] border border-border px-4 py-2 hover:border-accent hover:text-accent transition-colors"
          >
            {t.retry}
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertCircle size={20} className="text-text/30" />
          <p className="mono text-[9px] text-text/40">{t.noRadars}</p>
        </div>
      ) : (
        <div className="border border-border bg-surface/30 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-4 md:grid-cols-6 gap-4 bg-bg px-4 py-3 border-b border-border">
            <div className="mono text-[8px] text-text/40 font-bold uppercase">{t.table.name}</div>
            <div className="hidden md:block mono text-[8px] text-text/40 font-bold uppercase">{t.table.threshold}</div>
            <div className="mono text-[8px] text-text/40 font-bold uppercase">{t.table.matches}</div>
            <div className="hidden md:block mono text-[8px] text-text/40 font-bold uppercase">{t.table.lastMatch}</div>
            <div className="mono text-[8px] text-text/40 font-bold uppercase">{t.table.status}</div>
            <div className="mono text-[8px] text-text/40 font-bold uppercase text-right">{t.table.actions}</div>
          </div>

          {/* Table Rows */}
          <AnimatePresence>
            {filtered.map((radar, idx) => (
              <motion.div
                key={radar.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: idx * 0.05 }}
                className="grid grid-cols-4 md:grid-cols-6 gap-4 px-4 py-3 border-b border-border/50 hover:bg-surface/50 transition-colors items-center"
              >
                <div className="mono text-[9px]">{radar.radarName}</div>
                <div className="hidden md:block mono text-[8px] text-text/60">{radar.matchThreshold}%</div>
                <div className="flex items-center gap-2">
                  <span className={`mono text-[10px] font-bold ${radar.newMatches > 0 ? 'text-accent' : 'text-text/40'}`}>
                    {radar.newMatches}
                  </span>
                  {radar.newMatches > 0 && <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />}
                </div>
                <div className="hidden md:block mono text-[8px] text-text/60">{formatDate(radar.lastMatchedAt)}</div>
                <div>
                  <span
                    className={`px-2 py-1 rounded text-[7px] font-bold uppercase ${
                      radar.isActive ? 'bg-accent/10 text-accent' : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {radar.isActive ? t.table.active : t.table.inactive}
                  </span>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onViewRadar(radar.id)}
                    className="p-1.5 hover:bg-accent/10 hover:text-accent transition-colors rounded"
                    title={t.table.view}
                  >
                    <Eye size={12} />
                  </button>
                  <button className="p-1.5 hover:bg-red-500/10 hover:text-red-400 transition-colors rounded" title={t.table.delete}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
