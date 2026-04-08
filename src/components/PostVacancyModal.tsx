import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Briefcase, Send, CheckCircle2, Loader2, Building2, Clock, Zap, ChevronRight, Globe, MapPin } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang?: string;
}

const T = {
  EN: {
    title: 'Post a Vacancy',
    subtitle: 'Reach 23K+ vetted LATAM tech professionals. We match your role and send qualified profiles within 48h.',
    company: 'Company name',
    companyPh: 'e.g. Acme Corp',
    website: 'Company website',
    websitePh: 'https://acme.com',
    contact: 'Your work email',
    contactPh: 'hiring@acme.com',
    role: 'Role you\'re hiring for',
    rolePh: 'e.g. Senior React Developer, ML Engineer',
    skills: 'Required skills',
    skillsPh: 'e.g. Python, AWS, React, TypeScript',
    experience: 'Seniority level',
    expOpts: ['Junior (0–2 yrs)', 'Mid-level (3–5 yrs)', 'Senior (5–8 yrs)', 'Lead / Staff (8+ yrs)'],
    workType: 'Work arrangement',
    workOpts: ['Remote', 'Hybrid', 'On-site'],
    urgency: 'Hiring timeline',
    urgencyOpts: ['ASAP (< 2 weeks)', '1 month', '2–3 months', 'Flexible'],
    budget: 'Budget / salary range (optional)',
    budgetPh: 'e.g. $60k–$90k / year USD',
    jobUrl: 'Job post URL (optional)',
    jobUrlPh: 'https://jobs.acme.com/react-dev',
    description: 'Brief role description (optional)',
    descPh: 'Team context, tech stack, must-haves, etc.',
    submit: 'SEND VACANCY →',
    sending: 'Sending...',
    successTitle: 'Vacancy received!',
    successDesc: 'Here\'s what happens next:',
    successSteps: [
      'We cross-match against our 23K+ LATAM network',
      'You receive 3–5 qualified profiles within 48h',
      'You interview directly — no recruiter in the middle',
      'Full recruitment service available on request',
    ],
    legal: 'By submitting you agree to WProTalents contacting you about candidate matches.',
    fee: '✓ Free candidate matching — 3–5 profiles in 48h · Full search service on request',
    upgradeLabel: 'Need faster results?',
    upgradeLink: 'Talk to Juan directly →',
  },
  ES: {
    title: 'Publicar una Vacante',
    subtitle: 'Llega a 23K+ profesionales tech de LATAM. Hacemos match con tu rol y enviamos perfiles calificados en 48h.',
    company: 'Nombre de la empresa',
    companyPh: 'ej. Acme Corp',
    website: 'Sitio web',
    websitePh: 'https://acme.com',
    contact: 'Tu email de trabajo',
    contactPh: 'reclutamiento@acme.com',
    role: 'Rol que buscas',
    rolePh: 'ej. Desarrollador React Senior, ML Engineer',
    skills: 'Habilidades requeridas',
    skillsPh: 'ej. Python, AWS, React, TypeScript',
    experience: 'Nivel de seniority',
    expOpts: ['Junior (0–2 años)', 'Mid-level (3–5 años)', 'Senior (5–8 años)', 'Lead / Staff (8+ años)'],
    workType: 'Modalidad de trabajo',
    workOpts: ['Remoto', 'Híbrido', 'Presencial'],
    urgency: 'Urgencia de contratación',
    urgencyOpts: ['Urgente (< 2 semanas)', '1 mes', '2–3 meses', 'Flexible'],
    budget: 'Presupuesto / rango salarial (opcional)',
    budgetPh: 'ej. $60k–$90k / año USD',
    jobUrl: 'URL de la oferta (opcional)',
    jobUrlPh: 'https://jobs.acme.com/react-dev',
    description: 'Descripción breve del rol (opcional)',
    descPh: 'Contexto del equipo, stack tecnológico, requisitos, etc.',
    submit: 'ENVIAR VACANTE →',
    sending: 'Enviando...',
    successTitle: '¡Vacante recibida!',
    successDesc: 'Qué pasa ahora:',
    successSteps: [
      'Cruzamos tu rol con nuestra red de 23K+ en LATAM',
      'Recibes 3–5 perfiles calificados en 48h',
      'Entrevistas directamente — sin intermediarios',
      'Servicio de reclutamiento completo disponible a pedido',
    ],
    legal: 'Al enviar aceptas que WProTalents te contacte sobre candidatos.',
    fee: '✓ Matching gratuito — 3–5 perfiles en 48h · Servicio completo disponible a pedido',
    upgradeLabel: '¿Necesitas resultados más rápidos?',
    upgradeLink: 'Habla con Juan directamente →',
  },
  PT: {
    title: 'Publicar uma Vaga',
    subtitle: 'Alcance 23K+ profissionais tech do LATAM. Fazemos o match e enviamos perfis qualificados em 48h.',
    company: 'Nome da empresa',
    companyPh: 'ex. Acme Corp',
    website: 'Site da empresa',
    websitePh: 'https://acme.com',
    contact: 'Seu email de trabalho',
    contactPh: 'recrutamento@acme.com',
    role: 'Cargo que você busca',
    rolePh: 'ex. Desenvolvedor React Sênior, ML Engineer',
    skills: 'Habilidades necessárias',
    skillsPh: 'ex. Python, AWS, React, TypeScript',
    experience: 'Nível de senioridade',
    expOpts: ['Júnior (0–2 anos)', 'Pleno (3–5 anos)', 'Sênior (5–8 anos)', 'Lead / Staff (8+ anos)'],
    workType: 'Modalidade de trabalho',
    workOpts: ['Remoto', 'Híbrido', 'Presencial'],
    urgency: 'Prazo para contratação',
    urgencyOpts: ['Urgente (< 2 semanas)', '1 mês', '2–3 meses', 'Flexível'],
    budget: 'Orçamento / faixa salarial (opcional)',
    budgetPh: 'ex. $60k–$90k / ano USD',
    jobUrl: 'URL da vaga (opcional)',
    jobUrlPh: 'https://jobs.acme.com/react-dev',
    description: 'Breve descrição da vaga (opcional)',
    descPh: 'Contexto do time, stack, requisitos essenciais, etc.',
    submit: 'ENVIAR VAGA →',
    sending: 'Enviando...',
    successTitle: 'Vaga recebida!',
    successDesc: 'O que acontece agora:',
    successSteps: [
      'Cruzamos sua vaga com nossa rede de 23K+ no LATAM',
      'Você recebe 3–5 perfis qualificados em 48h',
      'Você entrevista diretamente — sem intermediários',
      'Serviço completo de recrutamento disponível sob demanda',
    ],
    legal: 'Ao enviar você concorda que WProTalents entre em contato sobre candidatos.',
    fee: '✓ Matching gratuito — 3–5 perfis em 48h · Serviço completo disponível sob demanda',
    upgradeLabel: 'Precisa de resultados mais rápidos?',
    upgradeLink: 'Fale com Juan diretamente →',
  },
};

export default function PostVacancyModal({ isOpen, onClose, lang = 'EN' }: Props) {
  const t = T[lang as keyof typeof T] || T.EN;
  const [form, setForm] = useState({
    company: '', website: '', contact: '', role: '', skills: '',
    experience: '', workType: '', urgency: '', budget: '', jobUrl: '', description: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const canSubmit = form.company && form.contact && form.role && form.skills && form.experience && form.workType;

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
                <div className="py-6">
                  <div className="flex items-center gap-3 mb-5">
                    <CheckCircle2 size={28} className="text-green-400 shrink-0" />
                    <h3 className="font-black text-lg tracking-tighter uppercase">{t.successTitle}</h3>
                  </div>
                  <p className="mono text-[9px] text-text/40 mb-4">{t.successDesc}</p>
                  <div className="space-y-2.5 mb-6">
                    {t.successSteps.map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="mono text-[8px] text-accent font-bold">{i + 1}</span>
                        </div>
                        <p className="text-sm text-text/70">{step}</p>
                      </div>
                    ))}
                  </div>
                  <div className="border border-accent/20 bg-accent/5 p-4 mb-4">
                    <p className="mono text-[8px] text-text/50 mb-2">{t.upgradeLabel}</p>
                    <a
                      href="mailto:info@wprotalents.lat"
                      className="mono text-[9px] text-accent font-bold flex items-center gap-1 hover:underline"
                    >
                      {t.upgradeLink} <ChevronRight size={10} />
                    </a>
                  </div>
                  <button onClick={onClose} className="w-full mono text-[9px] border border-border py-2 hover:border-accent hover:text-accent transition-colors">CLOSE</button>
                </div>
              ) : (
                <>
                  <p className="mono text-[9px] text-text/40 mb-4">{t.subtitle}</p>

                  <div className="mb-4 border border-accent/20 bg-accent/5 px-3 py-2">
                    <p className="mono text-[8px] text-accent/70 font-medium">{t.fee}</p>
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

                    {/* Work Type + Urgency */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mono text-[8px] text-text/30 block mb-1">{t.workType} *</label>
                        <div className="flex flex-col gap-1">
                          {t.workOpts.map(opt => (
                            <button type="button" key={opt} onClick={() => set('workType', opt)}
                              className={`py-1.5 px-3 mono text-[8px] border text-left transition-all flex items-center gap-1.5 ${form.workType === opt ? 'bg-accent text-black border-accent font-bold' : 'border-border text-text/40 hover:border-text/30'}`}>
                              {opt === 'Remote' || opt === 'Remoto' ? <Globe size={8} /> : <MapPin size={8} />}
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="mono text-[8px] text-text/30 block mb-1">{t.urgency}</label>
                        <div className="flex flex-col gap-1">
                          {t.urgencyOpts.map(opt => (
                            <button type="button" key={opt} onClick={() => set('urgency', opt)}
                              className={`py-1.5 px-3 mono text-[8px] border text-left transition-all flex items-center gap-1.5 ${form.urgency === opt ? 'bg-accent text-black border-accent font-bold' : 'border-border text-text/40 hover:border-text/30'}`}>
                              {(opt.includes('ASAP') || opt.includes('Urgente')) && <Zap size={8} />}
                              {(opt.includes('1 month') || opt.includes('1 mes') || opt.includes('1 mês')) && <Clock size={8} />}
                              <span className="truncate">{opt}</span>
                            </button>
                          ))}
                        </div>
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

                    {status === 'error' && (
                      <p className="mono text-[8px] text-red-400 text-center">Something went wrong. Email us at info@wprotalents.lat</p>
                    )}

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
