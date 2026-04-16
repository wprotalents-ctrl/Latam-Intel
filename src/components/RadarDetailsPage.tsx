import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Search, Filter, Loader2, AlertCircle, Eye,
  MessageSquare, Trash2, TrendingUp, CheckCircle2, Clock,
  ChevronLeft, ChevronRight, Star, Mail
} from 'lucide-react';
import MatchDetailsModal from './MatchDetailsModal';

interface Match {
  matchId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  matchScore: number;
  matchBreakdown: {
    skillsScore: number;
    experienceScore: number;
    locationScore: number;
    salaryScore: number;
  };
  reasoning: string[];
  status: 'new' | 'viewed' | 'contacted' | 'rejected' | 'hired';
  createdAt: any;
  candidateProfile?: any;
}

interface RadarDetailsPageProps {
  clientId: string;
  radarId: string;
  radarName: string;
  onBack: () => void;
}

export default function RadarDetailsPage({
  clientId,
  radarId,
  radarName,
  onBack,
}: RadarDetailsPageProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [scoreFilter, setScoreFilter] = useState<[number, number]>([0, 100]);
  const [sortBy, setSortBy] = useState<'score' | 'date'>('score');
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState({ total: 0, avgScore: 0, byStatus: {} as Record<string, number> });
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const MATCHES_PER_PAGE = 20;

  useEffect(() => {
    loadMatches();
  }, [clientId, radarId]);

  const loadMatches = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/cvradar/${radarId}?clientId=${clientId}`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setMatches(data.matches || []);
      setStats(data.stats);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMatch = (match: Match) => {
    setSelectedMatch(match);
    setModalOpen(true);
  };

  const handleStatusChange = (matchId: string, newStatus: string) => {
    setMatches(prev =>
      prev.map(m =>
        m.matchId === matchId ? { ...m, status: newStatus as any } : m
      )
    );
    setModalOpen(false);
  };

  // Filter matches
  const filtered = matches.filter((m) => {
    const matchesSearch = !search || m.candidateName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    const matchesScore = m.matchScore >= scoreFilter[0] && m.matchScore <= scoreFilter[1];
    return matchesSearch && matchesStatus && matchesScore;
  });

  // Sort matches
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'score') return b.matchScore - a.matchScore;
    return (b.createdAt?.toDate?.() || new Date(b.createdAt))?.getTime() - 
           (a.createdAt?.toDate?.() || new Date(a.createdAt))?.getTime();
  });

  // Paginate
  const totalPages = Math.ceil(sorted.length / MATCHES_PER_PAGE);
  const paged = sorted.slice((page - 1) * MATCHES_PER_PAGE, page * MATCHES_PER_PAGE);

  const formatDate = (ts: any) => {
    if (!ts) return '—';
    const date = ts.toDate?.() || new Date(ts);
    return date.toLocaleDateString();
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 75) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-accent/10 text-accent',
      viewed: 'bg-blue-500/10 text-blue-400',
      contacted: 'bg-purple-500/10 text-purple-400',
      rejected: 'bg-red-500/10 text-red-400',
      hired: 'bg-green-500/10 text-green-400',
    };
    return colors[status] || 'bg-surface text-text/60';
  };

  return (
    <>
      <section className="px-6 md:px-10 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-surface rounded transition-colors"
            title="Back"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="font-black text-xl uppercase tracking-tighter">{radarName}</h1>
            <p className="mono text-[8px] text-text/40">Showing all matches</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total Matches', value: stats.total, icon: Star },
            { label: 'Average Score', value: `${stats.avgScore}%`, icon: TrendingUp },
            { label: 'Viewed', value: stats.byStatus?.['viewed'] || 0, icon: Eye },
            { label: 'Hired', value: stats.byStatus?.['hired'] || 0, icon: CheckCircle2 },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="border border-border bg-surface/30 p-4 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={14} className="text-accent" />
                  <p className="mono text-[8px] text-text/40 uppercase tracking-widest">{stat.label}</p>
                </div>
                <p className="text-2xl font-black">{stat.value}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="space-y-4 mb-6">
          {/* Search & Sort */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text/20" />
              <input
                type="text"
                placeholder="Search candidate name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-surface border border-border pl-10 pr-4 py-2 mono text-[11px] focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-surface border border-border px-3 py-2 mono text-[11px] focus:outline-none focus:border-accent/50"
            >
              <option value="score">By Score</option>
              <option value="date">By Date</option>
            </select>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {['all', 'new', 'viewed', 'contacted', 'rejected', 'hired'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={`px-3 py-1.5 mono text-[8px] font-bold uppercase transition-colors rounded ${
                  statusFilter === status
                    ? 'bg-accent text-black'
                    : 'border border-border text-text/40 hover:text-text'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Score Filter */}
          <div className="space-y-2">
            <label className="mono text-[8px] text-text/40 uppercase tracking-widest">
              Score Range: {scoreFilter[0]} - {scoreFilter[1]}%
            </label>
            <div className="flex gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={scoreFilter[0]}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (val <= scoreFilter[1]) setScoreFilter([val, scoreFilter[1]]);
                  setPage(1);
                }}
                className="flex-1"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={scoreFilter[1]}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (val >= scoreFilter[0]) setScoreFilter([scoreFilter[0], val]);
                  setPage(1);
                }}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <Loader2 size={24} className="animate-spin text-accent" />
            <p className="mono text-[9px] text-text/20">Loading matches...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-16 border border-dashed border-red-500/20">
            <AlertCircle size={20} className="text-red-500/50" />
            <p className="mono text-[9px] text-red-400">Failed to load matches</p>
            <button
              onClick={loadMatches}
              className="mt-2 mono text-[8px] border border-border px-4 py-2 hover:border-accent hover:text-accent transition-colors"
            >
              Retry
            </button>
          </div>
        ) : paged.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <AlertCircle size={20} className="text-text/30" />
            <p className="mono text-[9px] text-text/40">
              {filtered.length === 0 ? 'No matches found' : 'No results for current filters'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Match Cards */}
            <div className="space-y-2">
              <AnimatePresence>
                {paged.map((match, idx) => (
                  <motion.div
                    key={match.matchId}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border border-border bg-surface/30 p-4 rounded hover:bg-surface/50 transition-colors cursor-pointer"
                    onClick={() => handleViewMatch(match)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-sm">{match.candidateName}</h3>
                          <span className={`px-2 py-0.5 rounded text-[7px] font-bold uppercase ${getStatusColor(match.status)}`}>
                            {match.status}
                          </span>
                        </div>
                        <p className="mono text-[8px] text-text/40">{formatDate(match.createdAt)}</p>
                      </div>

                      <div className="text-right">
                        <p className={`text-3xl font-black ${getScoreColor(match.matchScore)}`}>
                          {match.matchScore}%
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewMatch(match);
                          }}
                          className="p-2 hover:bg-accent/10 hover:text-accent transition-colors rounded"
                          title="View details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="p-2 hover:bg-blue-500/10 hover:text-blue-400 transition-colors rounded"
                          title="Add note"
                        >
                          <MessageSquare size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-border">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 hover:bg-surface rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = page <= 3 ? i + 1 : page > totalPages - 3 ? totalPages - 4 + i : page - 2 + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-2.5 py-1.5 mono text-[8px] font-bold rounded transition-colors ${
                          page === pageNum ? 'bg-accent text-black' : 'hover:bg-surface'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-2 hover:bg-surface rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={14} />
                </button>

                <span className="mono text-[8px] text-text/40 ml-2">
                  {(page - 1) * MATCHES_PER_PAGE + 1}–{Math.min(page * MATCHES_PER_PAGE, sorted.length)} of {sorted.length}
                </span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Match Details Modal */}
      <MatchDetailsModal
        match={selectedMatch}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedMatch(null);
        }}
        onStatusChange={handleStatusChange}
        clientId={clientId}
        radarId={radarId}
      />
    </>
  );
}
