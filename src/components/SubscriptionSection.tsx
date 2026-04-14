/// <reference types="vite/client" />
import React from 'react';
import { Check, Zap, Globe, Shield, Coins, Users, Lock } from 'lucide-react';

// ─── Beta Member Section ──────────────────────────────────────────────────────
// Replaces the old Stripe/payment subscription section during the beta period.
// Any logged-in user is a founding beta member — no payment required yet.

const PERKS = [
  { icon: Globe,  label: 'LATAM Salary Benchmarks',    desc: '40+ roles · 5 countries · live data' },
  { icon: Zap,    label: 'US Hiring Signal',            desc: 'BLS-powered market heat indicator' },
  { icon: Coins,  label: 'Remote Salary Calculator',   desc: 'What US companies pay vs what you charge' },
  { icon: Users,  label: '23,000+ Professional Network', desc: 'Founder-built over 20 years' },
  { icon: Shield, label: 'AI Job Market Briefings',     desc: 'Weekly signal — no fluff' },
  { icon: Lock,   label: 'Founding Member Rate',        desc: 'Lock your price before public launch' },
];

const FOUNDING_TERMS = {
  EN: {
    badge: 'FOUNDING MEMBER ACCESS',
    headline: 'You\'re in the Beta.',
    sub: 'All features are free during the beta period. When we go public, Founding Members lock in the lowest rate — forever.',
    perks: 'What\'s included:',
    cta: 'OPEN MEMBERS AREA →',
    counter: 'Beta spots are limited.',
    note: 'No credit card. No commitment. When pricing launches, you\'ll be notified first and get priority access at the Founding Member rate.',
  },
  ES: {
    badge: 'ACCESO FOUNDING MEMBER',
    headline: 'Estás dentro del Beta.',
    sub: 'Todas las funciones son gratis durante el período beta. Al lanzar públicamente, los Founding Members bloquean la tarifa más baja — para siempre.',
    perks: 'Qué incluye:',
    cta: 'ABRIR ÁREA DE MIEMBROS →',
    counter: 'Plazas beta limitadas.',
    note: 'Sin tarjeta. Sin compromiso. Cuando lancemos precios, serás el primero en saberlo con tarifa Founding Member.',
  },
  PT: {
    badge: 'ACESSO FOUNDING MEMBER',
    headline: 'Você está no Beta.',
    sub: 'Todas as funcionalidades são gratuitas durante o período beta. No lançamento público, os Founding Members travam a menor taxa — para sempre.',
    perks: 'O que está incluído:',
    cta: 'ABRIR ÁREA DE MEMBROS →',
    counter: 'Vagas beta limitadas.',
    note: 'Sem cartão. Sem compromisso. Quando os preços forem lançados, você será notificado primeiro com a taxa Founding Member.',
  },
};

export const SubscriptionSection: React.FC<{ lang?: string }> = ({ lang = 'EN' }) => {
  const t = FOUNDING_TERMS[lang as keyof typeof FOUNDING_TERMS] || FOUNDING_TERMS.EN;

  return (
    <div className="py-16 bg-bg border-t border-border">
      <div className="max-w-4xl mx-auto px-6">

        {/* Badge + headline */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-accent/30 bg-accent/5 mono text-[9px] text-accent mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            {t.badge}
          </div>
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-text mb-3">
            {t.headline}
          </h2>
          <p className="text-text/50 max-w-xl mx-auto text-sm leading-relaxed">
            {t.sub}
          </p>
        </div>

        {/* Perks grid */}
        <div className="mb-10">
          <p className="mono text-[9px] text-text/30 uppercase tracking-widest mb-5 text-center">{t.perks}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {PERKS.map((perk, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-surface border border-border">
                <div className="w-6 h-6 bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={10} className="text-accent" />
                </div>
                <div>
                  <div className="mono text-[10px] font-bold text-text mb-0.5">{perk.label}</div>
                  <div className="mono text-[8px] text-text/40">{perk.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={() => window.location.href = '/members'}
            className="inline-flex items-center gap-3 px-10 py-4 bg-accent text-black mono font-bold text-[11px] tracking-widest hover:opacity-90 transition-opacity mb-4"
          >
            <Zap size={14} /> {t.cta}
          </button>
          <p className="mono text-[8px] text-accent/60 mb-2">{t.counter}</p>
          <p className="mono text-[8px] text-text/25 max-w-md mx-auto leading-relaxed">{t.note}</p>
        </div>

      </div>
    </div>
  );
};
