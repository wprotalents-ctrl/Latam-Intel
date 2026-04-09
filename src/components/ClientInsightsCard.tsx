import React from 'react';
import { MapPin, DollarSign, Clock, Users, Eye, Target, Zap } from 'lucide-react';
import type { HiringPlan } from '../lib/hiringPlan';
import type { NetworkReach } from '../lib/networkReach';

interface Props {
  plan: HiringPlan;
  reach: NetworkReach;
  role: string;
  seniority: string;
  planType: 'free' | 'promoted';
}

function StatCell({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className={`p-4 ${accent ? 'bg-accent/5' : 'bg-bg'}`}>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon size={10} className={accent ? 'text-accent' : 'text-text/30'} />
        <span className="mono text-[8px] text-text/30 uppercase tracking-widest">{label}</span>
      </div>
      <p className={`text-lg font-black ${accent ? 'text-accent' : 'text-text'}`}>{value}</p>
    </div>
  );
}

export default function ClientInsightsCard({ plan, reach, role, seniority, planType }: Props) {
  const fmt = (n: number) => n.toLocaleString();

  return (
    <div className="border border-accent/20 bg-surface/50 mt-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-accent/10">
        <Target size={11} className="text-accent" />
        <span className="mono text-[9px] font-bold text-accent tracking-widest uppercase">
          Hiring Intelligence — {role} · {seniority}
        </span>
      </div>

      {/* Promoted banner */}
      {planType === 'promoted' && (
        <div className="flex items-center gap-2 px-5 py-3 bg-accent/10 border-b border-accent/20">
          <Zap size={11} className="text-accent shrink-0" />
          <p className="mono text-[9px] font-bold text-accent">
            This job will be promoted to our full 23,000+ professional network via active outreach.
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="px-5 py-4 border-b border-border">
        <p className="text-sm text-text/60 leading-relaxed">{plan.summary}</p>
      </div>

      {/* Hiring Plan */}
      <div className="px-5 pt-4 pb-2">
        <p className="mono text-[8px] text-text/30 uppercase tracking-widest mb-2">Hiring Plan</p>
        <div className="grid grid-cols-3 gap-px bg-border">
          <StatCell icon={MapPin}     label="Best Market"   value={plan.bestCountry} />
          <StatCell icon={DollarSign} label="Est. Salary"   value={plan.salary > 0 ? `$${fmt(plan.salary)}` : 'TBD'} accent />
          <StatCell icon={Clock}      label="Time to Hire"  value={`${plan.timeToHire} days`} />
        </div>
      </div>

      {/* Network Reach */}
      <div className="px-5 pt-4 pb-2">
        <p className="mono text-[8px] text-text/30 uppercase tracking-widest mb-2">Network Reach</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border">
          <StatCell icon={Users} label="1st Degree"       value={fmt(reach.firstDegree)} />
          <StatCell icon={Users} label="2nd Degree"       value={fmt(reach.secondDegree)} />
          <StatCell icon={Users} label="3rd Degree"       value={fmt(reach.thirdDegree)} />
          <StatCell icon={Eye}   label="Est. Impressions" value={fmt(reach.impressions)} accent />
        </div>
      </div>

      {/* Applicant range */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between border border-border bg-bg px-4 py-3">
          <div className="flex items-center gap-2">
            <Target size={12} className="text-accent" />
            <span className="mono text-[9px] text-text/50 uppercase tracking-widest">
              Projected Qualified Applicants
            </span>
          </div>
          <span className="mono text-base font-black text-accent">
            {reach.applicantsLow}–{reach.applicantsHigh}
          </span>
        </div>
        <p className="mono text-[8px] text-text/20 mt-2 text-right">
          Based on WProTalents network · {(23000).toLocaleString()} vetted professionals
        </p>
      </div>
    </div>
  );
}
