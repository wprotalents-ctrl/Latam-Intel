import React, { useState } from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';

export interface ClientJobPostData {
  role: string;
  seniority: 'junior' | 'mid' | 'senior';
  country: string;
  salary: number | undefined;
  description: string;
}

interface Props {
  onSubmit: (data: ClientJobPostData) => void;
  loading?: boolean;
}

const ROLES = [
  'AI / ML Engineer', 'LLM Engineer', 'Data Scientist', 'Data Engineer',
  'Backend Engineer', 'Frontend Engineer', 'Full Stack Engineer',
  'DevOps / SRE', 'Product Manager', 'Engineering Manager',
];

const COUNTRIES = [
  'Any LATAM', 'Brazil', 'Mexico', 'Colombia', 'Argentina', 'Chile',
  'Peru', 'Uruguay', 'Ecuador', 'Remote (Worldwide)',
];

export default function ClientJobPostForm({ onSubmit, loading = false }: Props) {
  const [role, setRole] = useState('');
  const [seniority, setSeniority] = useState<'junior' | 'mid' | 'senior'>('mid');
  const [country, setCountry] = useState('');
  const [salary, setSalary] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) { setError('Please select a role.'); return; }
    if (!description.trim()) { setError('Please add a short description.'); return; }
    setError('');
    onSubmit({
      role,
      seniority,
      country,
      salary: salary ? Number(salary) : undefined,
      description: description.trim(),
    });
  }

  const sel = 'w-full bg-bg border border-border px-3 py-2.5 mono text-[11px] focus:outline-none focus:border-accent/50 transition-colors text-text';
  const inp = 'w-full bg-bg border border-border px-3 py-2.5 mono text-[11px] focus:outline-none focus:border-accent/50 transition-colors placeholder:text-text/20';
  const lbl = 'mono text-[9px] text-text/40 uppercase tracking-widest block mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Role + Seniority */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>Role *</label>
          <select value={role} onChange={e => setRole(e.target.value)} className={sel}>
            <option value="">Select role...</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className={lbl}>Seniority *</label>
          <div className="flex gap-px h-[38px]">
            {(['junior', 'mid', 'senior'] as const).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setSeniority(s)}
                className={`flex-1 mono text-[9px] font-bold uppercase tracking-widest border transition-colors ${
                  seniority === s
                    ? 'bg-accent text-black border-accent'
                    : 'bg-bg border-border text-text/40 hover:border-accent/30'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Country + Salary */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>Country (optional)</label>
          <select value={country} onChange={e => setCountry(e.target.value)} className={sel}>
            <option value="">Any / Open</option>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={lbl}>Target Salary USD/yr (optional)</label>
          <input
            type="number"
            value={salary}
            onChange={e => setSalary(e.target.value)}
            placeholder="e.g. 80000"
            className={inp}
            min={0}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className={lbl}>Brief Description *</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Key responsibilities, must-have skills, team context, timeline..."
          rows={4}
          className={`${inp} resize-none`}
        />
      </div>

      {error && (
        <p className="mono text-[9px] text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-accent text-black mono text-[10px] font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading
          ? <><Loader2 size={12} className="animate-spin" /> Generating plan...</>
          : <>Generate Hiring Plan <ChevronRight size={12} /></>}
      </button>
    </form>
  );
}
