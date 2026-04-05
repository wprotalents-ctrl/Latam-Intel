import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Briefcase, Send, CheckCircle2, Loader2, Building2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang?: string;
}

const T = {
  EN: {
    title: 'Post a Vacancy',
    subtitle: 'Submit your open role and we\'ll match you with candidates from our 23K+ LATAM tech network. Free matching — recruit directly or upgrade for full service.',
    company: 'Company name',
    companyPh: 'e.g. Acme Corp',
    website: 'Company website',
    websitePh: 'https://acme.com',
    contact: 'Your company email',
    contactPh: 'hiring@acme.com',
    role: 'Role you\'re hiring for',
    rolePh: 'e.g. Senior React Developer, ML Engineer',
    skills: 'Required skills',
    skillsPh: 'e.g. Python, AWS, React, TypeScript',
    experience: 'Seniority level',
    expOpts: ['Junior (0–2 yrs)', 'Mid-level (3–5 yrs)', 'Senior (5–8 yrs)', 'Lead / Staff (8+ yrs)'],
    budget: 'Budget / salary range (optional)',
    budgetPh: 'e.g. $60k–$90k / year',
    jobUrl: 'Job post URL (optional)',
    jobUrlPh: 'https://jobs.acme.com/react-dev',
    description: 'Brief role description (optional)',
    descPh: 'What this person will be doing, team context, etc.',
    submit: 'SEND VACANCY →',
    sending: 'Sending...',
    successTitle: 'Vacancy received!',
    successDesc: 'We\'ll match your role against our 23K+ candidate network and send you qualified profiles within 48h. Check your inbox.',
    legal: 'By submitting you agree to WProTalents contacting you about candidate matches.',
    fee: '💡 Free candidate matching. Full recruitment service available on request.',
  },
  ES: {
    title: 'Publicar una Vacante',
    subtitle: 'Envía tu rol abierto y te conectaremos con candidatos de nuestra red de 23K+ en LATAM tech. Matching gratuito — recluta directo o contrata nuestro servicio completo.',
    company: 'Nombre de la empresa',
    companyPh: 'ej. Acme Corp',
    website: 'Sitio web de la empresa',
    websitePh: 'https://acme.com',
    contact: 'Tu email corporativo',
    contactPh: 'reclutamiento@acme.com',
    role: 'Rol que buscas',
    rolePh: 'ej. Desarrollador React Senior, ML Engineer',
    skills: 'Habilidades requeridas',
    skillsPh: 'ej. Python, AWS, React, TypeScript',
    experience: 'Nivel de seniority',
    expOpts: ['Junior (0–2 años)', 'Mid-level (3–5 años)', 'Senior (5–8 años)', 'Lead / Staff (8+ años)'],
    budget: 'Presupuesto / rango salarial (opcional)',
    budgetPh: 'ej. $60k–$90k / año',
    jobUrl: 'URL de la oferta (opcional)',
    jobUrlPh: 'https://jobs.acme.com/react-dev',
    description: 'Descripción breve del rol (opcional)',
    descPh: 'Qué hará esta persona, contexto del equipo, etc.',
    submit: 'ENVIAR VACANTE →',
    sending: 'Enviando...',
    successTitle: '¡Vacante recibida!',
    successDesc: 'Haremos match con nuestra red de 23K+ candidatos y te enviaremos perfiles en 48h. Revisa tu bandeja.',
    legal: 'Al enviar aceptas que WProTalents te contacte sobre candidatos.',
    fee: '💡 Matching gratuito. Servicio de reclutamiento completo disponible a pedido.',
  },
  PT: {
    title: 'Publicar uma Vaga',
    subtitle: 'Envie sua vaga e vamos conectá-la com candidatos da nossa rede de 23K+ em tech LATAM. Matching grátis — recrute diretamente ou contrate nosso serviço completo.',
    company: 'Nome da empresa',
    companyPh: 'ex. Acme Corp',
    website: 'Site da empresa',
    websitePh: 'https://acme.com',
    contact: 'Seu email corporativo',
    contactPh: 'recrutamento@acme.com',
    role: 'Cargo que você busca',
    rolePh: 'ex. Desenvolvedor React Sênior, ML Engineer',
    skills: 'Habilidades necessárias',
    skillsPh: 'ex. Python, AWS, React, TypeScript',
    experience: 'Nível de senioridade',
    expOpts: ['Júnior (0–2 anos)', 'Pleno (3–5 anos)', 'Sênior (5–8 anos)', 'Lead / Staff (8+ anos)'],
    budget: 'Orçamento / faixa salarial (opcional)',
    budgetPh: 'ex. $60k–$90k / ano',
    jobUrl: 'URL da vaga (opcional)',
    jobUrlPh: 'https://jobs.acme.com/react-dev',
    description: 'Breve descrição da vaga (opcional)',
    descPh: 'O que essa pessoa fará, contexto da equipe, etc.',
    submit: 'ENVIAR VAGA →',
    sending: 'Enviando...',
    successTitle: 'Vaga recebida!',
    successDesc: 'Vamos cruzar sua vaga com nossa rede de 23K+ candidatos e enviar perfis em 48h. Verifique seu email.',
    legal: 'Ao enviar você concorda que WProTalents entre em contato sobre candidatos.',
    fee: '💡 Matching gratuito. Serviço completo de recrutamento disponível sob demanda.',
  },
};

export default function PostVacancyModal({ isOpen, onClose, lang = 'EN' }: Props) {
  const t = T[lang as keyof typeof T] || T.EN;
  const [form, setForm] = useState({
    company: '', website: '', contact: '', role: '', skills: '',
    experience: '', budget: '', jobUrl: '', description: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const canSubmit = form.company && form.contact && form.role && form.skills && form.experience;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await fetch('/api/post-vacancy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, lang }),
      });
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  const inputCls = "w-full bg-bg border border-border px-3 py-2 mono text-[11px] focus:outline-none focus:border-accent/50 transition-colors";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg/90 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="w-full max-w-lg bg-surface border border-border shadow-2xl my-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-accent/5">
              <div className="flex items-center gap-2">
                <Building2 size={14} className="text-accent" />
                <span className="mono text-[10px] text-accent font-bold tracking-widest">{t.title}</span>
              </div>
              <button onClick={onClose} className="text-text/30 hover:text-text"><X size={16} /></button>
            </div>

            <div className="p-6">
              {status === 'done' ? (
                <div className="text-center py-8">
                  <CheckCircle2 size={40} className="text-green-400 mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">{t.successTitle}</h3>
                  <p className="text-text/50 text-sm max-w-xs mx-auto">{t.successDesc}</p>
                  <button onClick={onClose} className="mt-6 mono text-[9px] border border-border px-6 py-2 hover:border-accent hover:text-accent transition-colors">CLOSE</button>
                </div>
              ) : (
                <>
                  <p className="mono text-[9px] text-text/40 mb-5">{t.subtitle}</p>

                  <div className="mb-4 border border-accent/20 bg-accent/5 px-3 py-2">
                    <p className="mono text-[8px] text-accent/60">{t.fee}</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Company + Website */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mono text-[8px] text-text/30 block mb-1">{t.company} *</label>
                        <input required placeholder={t.companyPh} value={form.company} onChange={e => set('company', e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className="mono text-[8px] text-text/30 block mb-1">{t.website}</label>
                        <input placeholder={t.websitePh} value={form.website} onChange={e => set('website', e.target.value)} className={inputCls} />
                      </div>
                    </div>

                    {/* Contact email */}
                    <div>
                      <label className="mono text-[8px] text-text/30 block mb-1">{t.contact} *</label>
                      <input required type="email" placeholder={t.contactPh} value={form.contact} onChange={e => set('contact', e.target.value)} className={inputCls} />
                    </div>

                    {/* Role */}
                    <div>
                      <label className="mono text-[8px] text-text/30 block mb-1">{t.role} *</label>
                      <input required placeholder={t.rolePh} value={form.role} onChange={e => set('role', e.target.value)} className={inputCls} />
                    </div>

                    {/* Skills */}
                    <div>
                      <label className="mono text-[8px] text-text/30 block mb-1">{t.skills} *</label>
                      <input required placeholder={t.skillsPh} value={form.skills} onChange={e => set('skills', e.target.value)} className={inputCls} />
                    </div>

                    {/* Seniority */}
                    <div>
                      <label className="mono text-[8px] text-text/30 block mb-1">{t.experience} *</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {t.expOpts.map(opt => (
                          <button type="button" key={opt} onClick={() => set('experience', opt)}
                            className={`py-2 px-3 mono text-[8px] border text-left transition-all ${form.experience === opt ? 'bg-accent text-black border-accent font-bold' : 'border-border text-text/40 hover:border-text/30'}`}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Budget + Job URL */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mono text-[8px] text-text/30 block mb-1">{t.budget}</label>
                        <input placeholder={t.budgetPh} value={form.budget} onChange={e => set('budget', e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className="mono text-[8px] text-text/30 block mb-1">{t.jobUrl}</label>
                        <input placeholder={t.jobUrlPh} value={form.jobUrl} onChange={e => set('jobUrl', e.target.value)} className={inputCls} />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="mono text-[8px] text-text/30 block mb-1">{t.description}</label>
                      <textarea
                        placeholder={t.descPh}
                        value={form.description}
                        onChange={e => set('description', e.target.value)}
                        rows={3}
                        className={`${inputCls} resize-none`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={status === 'loading' || !canSubmit}
                      className="w-full flex items-center justify-center gap-2 bg-accent text-black py-3 mono text-[10px] font-bold hover:opacity-90 transition-opacity disabled:opacity-40"
                    >
                      {status === 'loading'
                        ? <><Loader2 size={12} className="animate-spin" />{t.sending}</>
                        : <><Send size={11} />{t.submit}</>
                      }
                    </button>

                    <p className="mono text-[7px] text-text/15 text-center">{t.legal}</p>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
