import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Mail, CheckCircle2, Clock, Eye, MessageSquare, Trash2,
  TrendingUp, MapPin, Calendar, DollarSign
} from 'lucide-react';

interface MatchDetails {
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
  candidateProfile?: {
    currentRole?: string;
    location?: string;
    yearsExperience?: number;
    salaryExpectation?: number;
    skills?: Array<{ name: string; proficiency: string }>;
  };
  createdAt?: any;
}

interface MatchDetailsModalProps {
  match: MatchDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (matchId: string, newStatus: string) => void;
  clientId: string;
  radarId: string;
}

export default function MatchDetailsModal({
  match,
  isOpen,
  onClose,
  onStatusChange,
  clientId,
  radarId,
}: MatchDetailsModalProps) {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [notes, setNotes] = useState('');

  if (!match) return null;

  const getScoreColor = (score: number) => {
    if (score >= 85) return { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' };
    if (score >= 75) return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' };
    return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' };
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      new: { bg: 'bg-accent/10', text: 'text-accent' },
      viewed: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
      contacted: { bg: 'bg-purple-500/10', text: 'text-purple-400' },
      rejected: { bg: 'bg-red-500/10', text: 'text-red-400' },
      hired: { bg: 'bg-green-500/10', text: 'text-green-400' },
    };
    return colors[status] || { bg: 'bg-surface', text: 'text-text/60' };
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/cvradar/match/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          radarId,
          matchId: match.matchId,
          status: newStatus,
          clientNotes: notes,
        }),
      });

      if (res.ok) {
        onStatusChange(match.matchId, newStatus);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const scoreColors = getScoreColor(match.matchScore);
  const statusColors = getStatusColor(match.status);

  const breakdown = [
    { label: 'Skills', score: match.matchBreakdown.skillsScore, icon: '🎯' },
    { label: 'Experience', score: match.matchBreakdown.experienceScore, icon: '📈' },
    { label: 'Location', score: match.matchBreakdown.locationScore, icon: '📍' },
    { label: 'Salary', score: match.matchBreakdown.salaryScore, icon: '💰' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface border border-border rounded-lg shadow-2xl">
              {/* Header */}
              <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
                <h2 className="font-black text-lg uppercase tracking-tighter">Match Details</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-surface/50 rounded transition-colors"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Candidate Header */}
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="font-black text-2xl mb-1">{match.candidateName}</h3>
                      <p className="mono text-[9px] text-text/40 flex items-center gap-2">
                        <Mail size={12} />
                        {match.candidateEmail}
                      </p>
                    </div>
                    <span className={`px-3 py-1.5 rounded text-[8px] font-bold uppercase whitespace-nowrap ${statusColors.bg} ${statusColors.text}`}>
                      {match.status}
                    </span>
                  </div>
                </div>

                {/* Match Score Card */}
                <div className={`border ${scoreColors.border} ${scoreColors.bg} p-6 rounded-lg`}>
                  <p className="mono text-[8px] text-text/40 uppercase tracking-widest mb-3">Overall Match Score</p>
                  <div className="flex items-center justify-between">
                    <p className={`text-6xl font-black ${scoreColors.text}`}>{match.matchScore}%</p>
                    <div className="text-right">
                      <p className="mono text-[7px] text-text/40 uppercase mb-2">Likelihood of fit</p>
                      {match.matchScore >= 85 && <p className="text-sm font-bold text-green-400">Excellent Match</p>}
                      {match.matchScore >= 75 && match.matchScore < 85 && <p className="text-sm font-bold text-yellow-400">Strong Match</p>}
                      {match.matchScore < 75 && <p className="text-sm font-bold text-red-400">Moderate Match</p>}
                    </div>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div>
                  <p className="mono text-[8px] text-text/40 uppercase tracking-widest mb-3">Score Breakdown</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {breakdown.map((item, i) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="border border-border bg-surface/50 p-3 rounded text-center"
                      >
                        <p className="text-2xl mb-1">{item.icon}</p>
                        <p className="font-black text-lg mb-1">{item.score}%</p>
                        <p className="mono text-[7px] text-text/40">{item.label}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Match Reasoning */}
                {match.reasoning && match.reasoning.length > 0 && (
                  <div>
                    <p className="mono text-[8px] text-text/40 uppercase tracking-widest mb-3">Why This Match</p>
                    <div className="space-y-2">
                      {match.reasoning.map((reason, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex gap-3 p-3 border border-border/50 bg-surface/30 rounded text-sm"
                        >
                          <span className="text-accent font-bold mt-0.5">→</span>
                          <p>{reason}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Candidate Profile */}
                {match.candidateProfile && (
                  <div>
                    <p className="mono text-[8px] text-text/40 uppercase tracking-widest mb-3">Candidate Profile</p>
                    <div className="grid grid-cols-2 gap-3">
                      {match.candidateProfile.currentRole && (
                        <div className="border border-border bg-surface/30 p-3 rounded">
                          <p className="mono text-[7px] text-text/40 uppercase mb-1">Current Role</p>
                          <p className="font-bold text-sm">{match.candidateProfile.currentRole}</p>
                        </div>
                      )}
                      {match.candidateProfile.location && (
                        <div className="border border-border bg-surface/30 p-3 rounded">
                          <p className="mono text-[7px] text-text/40 uppercase mb-1 flex items-center gap-1">
                            <MapPin size={10} /> Location
                          </p>
                          <p className="font-bold text-sm">{match.candidateProfile.location}</p>
                        </div>
                      )}
                      {match.candidateProfile.yearsExperience !== undefined && (
                        <div className="border border-border bg-surface/30 p-3 rounded">
                          <p className="mono text-[7px] text-text/40 uppercase mb-1 flex items-center gap-1">
                            <Calendar size={10} /> Experience
                          </p>
                          <p className="font-bold text-sm">{match.candidateProfile.yearsExperience} years</p>
                        </div>
                      )}
                      {match.candidateProfile.salaryExpectation && (
                        <div className="border border-border bg-surface/30 p-3 rounded">
                          <p className="mono text-[7px] text-text/40 uppercase mb-1 flex items-center gap-1">
                            <DollarSign size={10} /> Salary Expectation
                          </p>
                          <p className="font-bold text-sm">${match.candidateProfile.salaryExpectation.toLocaleString()}</p>
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    {match.candidateProfile.skills && match.candidateProfile.skills.length > 0 && (
                      <div className="mt-3">
                        <p className="mono text-[7px] text-text/40 uppercase mb-2">Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {match.candidateProfile.skills.map((skill, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 bg-accent/10 text-accent mono text-[7px] font-bold rounded whitespace-nowrap"
                            >
                              {skill.name} <span className="text-text/50">({skill.proficiency})</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="mono text-[8px] text-text/40 uppercase tracking-widest block mb-2">
                    Internal Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this candidate..."
                    className="w-full bg-surface border border-border p-3 rounded text-sm focus:outline-none focus:border-accent/50 transition-colors"
                    rows={3}
                  />
                </div>

                {/* Actions */}
                <div className="space-y-3 border-t border-border pt-6">
                  <p className="mono text-[8px] text-text/40 uppercase tracking-widest">Update Status</p>

                  <div className="grid grid-cols-2 gap-2">
                    {['viewed', 'contacted', 'hired', 'rejected'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        disabled={updatingStatus || match.status === status}
                        className={`px-3 py-2 mono text-[8px] font-bold uppercase transition-colors rounded border ${
                          match.status === status
                            ? 'bg-accent text-black border-accent'
                            : 'border-border text-text/60 hover:text-text hover:border-accent/50'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {status === 'viewed' && <Eye size={12} className="inline mr-1" />}
                        {status === 'contacted' && <MessageSquare size={12} className="inline mr-1" />}
                        {status === 'hired' && <CheckCircle2 size={12} className="inline mr-1" />}
                        {status === 'rejected' && <Trash2 size={12} className="inline mr-1" />}
                        {status}
                      </button>
                    ))}
                  </div>

                  <a
                    href={`mailto:${match.candidateEmail}`}
                    className="w-full block text-center px-4 py-2 bg-accent text-black mono text-[8px] font-bold uppercase rounded hover:opacity-80 transition-opacity"
                  >
                    <Mail size={12} className="inline mr-2" />
                    Contact Candidate
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
