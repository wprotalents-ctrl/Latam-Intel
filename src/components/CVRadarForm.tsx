import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Plus, Trash2, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SkillInput {
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  isRequired: boolean;
  yearsRequired?: number;
}

interface FormData {
  radarName: string;
  roleTitle: string;
  seniorityLevel: 'junior' | 'mid' | 'senior' | 'lead';
  targetLocations: string[];
  requiredSkills: SkillInput[];
  minYearsExperience: number;
  maxYearsExperience?: number;
  minSalary: number;
  maxSalary: number;
  notificationEmail: string;
  matchThreshold: number;
}

interface CVRadarFormProps {
  clientId: string;
  onSuccess: (radarId: string) => void;
  onCancel: () => void;
}

const ROLES = [
  'Full Stack Engineer', 'Backend Engineer', 'Frontend Engineer', 'DevOps / SRE',
  'Data Engineer', 'Data Scientist', 'AI / ML Engineer', 'Product Manager',
  'Engineering Manager', 'Design', 'Sales', 'Marketing',
];

const LOCATIONS = [
  'Mexico', 'Brazil', 'Colombia', 'Argentina', 'Chile', 'Peru', 'Uruguay',
  'Ecuador', 'Costa Rica', 'USA', 'Canada', 'Europe', 'Worldwide',
];

export default function CVRadarForm({ clientId, onSuccess, onCancel }: CVRadarFormProps) {
  const [form, setForm] = useState<FormData>({
    radarName: '',
    roleTitle: '',
    seniorityLevel: 'mid',
    targetLocations: [],
    requiredSkills: [],
    minYearsExperience: 2,
    minSalary: 50000,
    maxSalary: 150000,
    notificationEmail: '',
    matchThreshold: 75,
  });

  const [newLocation, setNewLocation] = useState('');
  const [newSkill, setNewSkill] = useState<SkillInput>({ name: '', proficiency: 'advanced', isRequired: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleAddLocation = () => {
    if (newLocation && !form.targetLocations.includes(newLocation)) {
      setForm((prev) => ({
        ...prev,
        targetLocations: [...prev.targetLocations, newLocation],
      }));
      setNewLocation('');
    }
  };

  const handleRemoveLocation = (loc: string) => {
    setForm((prev) => ({
      ...prev,
      targetLocations: prev.targetLocations.filter((l) => l !== loc),
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.name && !form.requiredSkills.some((s) => s.name.toLowerCase() === newSkill.name.toLowerCase())) {
      setForm((prev) => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, newSkill],
      }));
      setNewSkill({ name: '', proficiency: 'advanced', isRequired: true });
    }
  };

  const handleRemoveSkill = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.radarName || !form.roleTitle || !form.notificationEmail) {
      setError('Please fill in all required fields');
      return;
    }

    if (form.targetLocations.length === 0) {
      setError('Please select at least one location');
      return;
    }

    setSaving(true);
    try {
      // Convert skills array to object format for API
      const requiredSkillsObj = form.requiredSkills.reduce(
        (acc, skill) => {
          acc[skill.name] = {
            proficiency: skill.proficiency,
            isRequired: skill.isRequired,
            yearsRequired: skill.yearsRequired,
          };
          return acc;
        },
        {} as Record<string, any>
      );

      const res = await fetch('/api/cvradar/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          radarName: form.radarName,
          criteria: {
            roleTitle: form.roleTitle,
            seniorityLevel: form.seniorityLevel,
            targetLocations: form.targetLocations,
            requiredSkills: requiredSkillsObj,
            minYearsExperience: form.minYearsExperience,
            maxYearsExperience: form.maxYearsExperience,
            salaryRange: {
              min: form.minSalary,
              max: form.maxSalary,
              currency: 'USD',
            },
          },
          notificationEmail: form.notificationEmail,
          matchThreshold: form.matchThreshold,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create radar');
      }

      const data = await res.json();
      setSuccess(true);
      setTimeout(() => onSuccess(data.radarId), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create radar');
    } finally {
      setSaving(false);
    }
  };

  const inp = 'w-full bg-bg border border-border px-3 py-2 mono text-[11px] focus:outline-none focus:border-accent/50 transition-colors';
  const lbl = 'mono text-[9px] text-text/40 uppercase tracking-widest block mb-1.5';
  const sel = 'w-full bg-bg border border-border px-3 py-2 mono text-[11px] focus:outline-none focus:border-accent/50 transition-colors';

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      >
        <div className="bg-bg border border-border p-8 rounded-lg text-center max-w-sm">
          <CheckCircle2 size={48} className="mx-auto text-accent mb-4" />
          <h3 className="font-black text-lg mb-2">Radar Created!</h3>
          <p className="mono text-[9px] text-text/60">{form.radarName} is now active</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-bg border border-border rounded-lg max-w-2xl w-full my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-surface/30 px-6 py-4 border-b border-border">
          <h2 className="font-black text-lg">Create CV Radar</h2>
          <button onClick={onCancel} className="p-1 hover:bg-surface rounded">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {error && (
            <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded">
              <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
              <p className="mono text-[9px] text-red-400">{error}</p>
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-3">
            <div>
              <label className={lbl}>Radar Name *</label>
              <input
                type="text"
                placeholder="e.g., Senior Full Stack - Mexico"
                value={form.radarName}
                onChange={(e) => setForm((p) => ({ ...p, radarName: e.target.value }))}
                className={inp}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Role *</label>
                <select
                  value={form.roleTitle}
                  onChange={(e) => setForm((p) => ({ ...p, roleTitle: e.target.value }))}
                  className={sel}
                >
                  <option value="">Select role</option>
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={lbl}>Seniority</label>
                <select
                  value={form.seniorityLevel}
                  onChange={(e) => setForm((p) => ({ ...p, seniorityLevel: e.target.value as any }))}
                  className={sel}
                >
                  {['junior', 'mid', 'senior', 'lead'].map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Locations */}
          <div>
            <label className={lbl}>Target Locations *</label>
            <div className="flex gap-2 mb-2">
              <select
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className={`flex-1 ${sel}`}
              >
                <option value="">Select location</option>
                {LOCATIONS.filter((l) => !form.targetLocations.includes(l)).map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddLocation}
                className="px-3 py-2 bg-accent text-black mono text-[9px] font-bold hover:opacity-90 transition-opacity"
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.targetLocations.map((loc) => (
                <motion.div
                  key={loc}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="px-2.5 py-1 bg-accent/10 border border-accent/20 rounded flex items-center gap-2"
                >
                  <span className="mono text-[8px]">{loc}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveLocation(loc)}
                    className="hover:text-accent transition-colors"
                  >
                    <X size={12} />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Experience & Salary */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Min Years Experience</label>
              <input
                type="number"
                min="0"
                value={form.minYearsExperience}
                onChange={(e) => setForm((p) => ({ ...p, minYearsExperience: parseInt(e.target.value) || 0 }))}
                className={inp}
              />
            </div>
            <div>
              <label className={lbl}>Max Years (Optional)</label>
              <input
                type="number"
                min="0"
                value={form.maxYearsExperience || ''}
                onChange={(e) => setForm((p) => ({ ...p, maxYearsExperience: e.target.value ? parseInt(e.target.value) : undefined }))}
                className={inp}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Min Salary (USD)</label>
              <input
                type="number"
                min="0"
                step="10000"
                value={form.minSalary}
                onChange={(e) => setForm((p) => ({ ...p, minSalary: parseInt(e.target.value) || 0 }))}
                className={inp}
              />
            </div>
            <div>
              <label className={lbl}>Max Salary (USD)</label>
              <input
                type="number"
                min="0"
                step="10000"
                value={form.maxSalary}
                onChange={(e) => setForm((p) => ({ ...p, maxSalary: parseInt(e.target.value) || 0 }))}
                className={inp}
              />
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className={lbl}>Required Skills</label>
            <div className="space-y-2 mb-3">
              {form.requiredSkills.map((skill, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 p-2 bg-surface rounded border border-border/50"
                >
                  <div className="flex-1">
                    <p className="mono text-[9px] font-bold">{skill.name}</p>
                    <p className="mono text-[8px] text-text/40">{skill.proficiency}</p>
                  </div>
                  <button type="button" onClick={() => handleRemoveSkill(idx)} className="p-1 hover:text-red-400 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 mb-2">
              <input
                type="text"
                placeholder="Skill name"
                value={newSkill.name}
                onChange={(e) => setNewSkill((p) => ({ ...p, name: e.target.value }))}
                className={inp}
              />
              <select
                value={newSkill.proficiency}
                onChange={(e) => setNewSkill((p) => ({ ...p, proficiency: e.target.value as any }))}
                className={sel}
              >
                {['beginner', 'intermediate', 'advanced', 'expert'].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <button type="button" onClick={handleAddSkill} className="px-3 py-2 bg-accent text-black mono text-[9px] font-bold hover:opacity-90">
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Notification */}
          <div>
            <label className={lbl}>Notification Email *</label>
            <input
              type="email"
              placeholder="hiring@company.com"
              value={form.notificationEmail}
              onChange={(e) => setForm((p) => ({ ...p, notificationEmail: e.target.value }))}
              className={inp}
            />
          </div>

          <div>
            <label className={lbl}>Match Threshold: {form.matchThreshold}%</label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={form.matchThreshold}
              onChange={(e) => setForm((p) => ({ ...p, matchThreshold: parseInt(e.target.value) }))}
              className="w-full"
            />
            <p className="mono text-[8px] text-text/40 mt-1">Only notify on matches scoring {form.matchThreshold}% or higher</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="flex-1 px-4 py-2 border border-border mono text-[9px] font-bold hover:border-text/40 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-accent text-black mono text-[9px] font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : null}
              {saving ? 'Creating...' : 'Create Radar'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
