import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Linkedin, Send, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang?: string;
}

const T = {
  EN: {
    title: 'Get Featured on LinkedIn',
    subtitle: 'We\'ll post your profile to our 23K+ network of US & EU hiring managers. Free.',
    name: 'Full name',
    role: 'Your role / what you do',
    rolePh: 'e.g. Senior React Developer, ML Engineer, Data Scientist',
    skills: 'Top 3–5 skills',
    skillsPh: 'e.g. Python, PyTorch, AWS, React, TypeScript',
    experience: 'Years of experience',
    availability: 'Availability',
    availOpts: ['Open to offers', 'Available now', 'Freelance / contract', 'Part-time only'],
    contact: 'Your email or LinkedIn URL',
    contactPh: 'email@you.com or linkedin.com/in/yourname',
    salary: 'Salary expectation (optional)',
    salaryPh: 'e.g. $80k–$100k / year',
    submit: 'FEATURE ME →',
    sending: 'Sending...',
    successTitle: 'You\'re in the queue!',
    successDesc: 'We\'ll post to our LinkedIn within 48h. Keep an eye on your inbox for confirmation.',
    legal: 'By submitting you agree to WProTalents sharing your info with our hiring network.',
    preview: 'Preview your post',
  },
  ES: {
    title: 'Aparece en LinkedIn',
    subtitle: 'Publicaremos tu perfil a nuestra red de 23K+ gerentes de contratación en EE.UU. y Europa. Gratis.',
    name: 'Nombre completo',
    role: 'Tu rol / lo que haces',
    rolePh: 'ej. Desarrollador React Senior, ML Engineer, Data Scientist',
    skills: 'Top 3–5 habilidades',
    skillsPh: 'ej. Python, PyTorch, AWS, React, TypeScript',
    experience: 'Años de experiencia',
    availability: 'Disponibilidad',
    availOpts: ['Abierto a ofertas', 'Disponible ahora', 'Freelance / contrato', 'Solo medio tiempo'],
    contact: 'Tu email o URL de LinkedIn',
    contactPh: 'email@tu.com o linkedin.com/in/tunombre',
    salary: 'Expectativa salarial (opcional)',
    salaryPh: 'ej. $80k–$100k / año',
    submit: 'PUBLÍCAME →',
    sending: 'Enviando...',
    successTitle: '¡Estás en la cola!',
    successDesc: 'Publicaremos en nuestro LinkedIn en 48h. Revisa tu bandeja de entrada.',
    legal: 'Al enviar aceptas que WProTalents comparta tu info con nuestra red.',
    preview: 'Vista previa de tu post',
  },
  PT: {
    title: 'Seja Destaque no LinkedIn',
    subtitle: 'Publicaremos seu perfil para nossa rede de 23K+ gestores de contratação nos EUA e Europa. Grátis.',
    name: 'Nome completo',
    role: 'Seu cargo / o que você faz',
    rolePh: 'ex. Desenvolvedor React Sênior, ML Engineer, Cientista de Dados',
    skills: 'Top 3–5 habilidades',
    skillsPh: 'ex. Python, PyTorch, AWS, React, TypeScript',
    experience: 'Anos de experiência',
    availability: 'Disponibilidade',
    availOpts: ['Aberto a propostas', 'Disponível agora', 'Freelance / contrato', 'Apenas meio período'],
    contact: 'Seu email ou URL do LinkedIn',
    contactPh: 'email@voce.com ou linkedin.com/in/seunome',
    salary: 'Expectativa salarial (opcional)',
    salaryPh: 'ex. $80k–$100k / ano',
    submit: 'ME DESTAQUE →',
    sending: 'Enviando...',
    successTitle: 'Você está na fila!',
    successDesc: 'Publicaremos no nosso LinkedIn em 48h. Fique de olho na sua caixa de entrada.',
    legal: 'Ao enviar você concorda que WProTalents compartilhe suas informações com nossa rede.',
    preview: 'Pré-visualização do seu post',
  },
};

function buildPost(data: { name: string; role: string; skills: string; experience: string; availability: string; salary: string; contact: string }) {
  const avail = data.availability === 'Available now' || data.availability === 'Disponible ahora' || data.availability === 'Disponível agora'
    ? '🟢 Available now'
    : data.availability === 'Freelance / contract' || data.availability === 'Freelance / contrato'
    ? '🔄 Open to freelance/contract'
    : '👀 Open to new opportunities';

  return `🚀 ${data.name} — ${data.role}

${avail} | ${data.experience} years experience

Core skills: ${data.skills}${data.salary ? `\n💰 Expectation: ${data.salary}` : ''}

${data.contact}

If you're a US or EU company looking for exceptional LATAM tech talent — this is someone worth talking to.

We help US & EU firms hire senior tech talent from Latin America — faster, smarter, at 40–60% lower cost.

👉 Register at latam-intel.vercel.app to access our full candidate network.

#LATAMtech #remotework #hiring #techtalent #WProTalents`;
}

export default function LinkedInBoostModal({ isOpen, onClose, lang = 'EN' }: Props) {
  const t = T[lang as keyof typeof T] || T.EN;
  const [form, setForm] = useState({ name: '', role: '', skills: '', experience: '', availability: '', salary: '', contact: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [showPreview, setShowPreview] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const post = buildPost(form);
  const canPreview = form.name && form.role && form.skills && form.experience && form.availability && form.contact;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await fetch('/api/linkedin-boost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, generatedPost: post, lang }),
      });
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

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
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-[#0077B5]/10">
              <div className="flex items-center gap-2">
                <Linkedin size={16} className="text-[#0077B5]" />
                <span className="mono text-[10px] text-[#0077B5] font-bold tracking-widest">{t.title}</span>
              </div>
              <button onClick={onClose} className="text-text/30 hover:text-text"><X size={16} /></button>
            </div>

            <div className="p-6">
              {status === 'done' ? (
                <div className="text-center py-8">
                  <CheckCircle2 size={40} className="text-green-400 mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">{t.successTitle}</h3>
                  <p className="text-text/50 text-sm">{t.successDesc}</p>
                  <button onClick={onClose} className="mt-6 mono text-[9px] border border-border px-6 py-2 hover:border-accent hover:text-accent transition-colors">CLOSE</button>
                </div>
              ) : (
                <>
                  <p className="mono text-[9px] text-text/40 mb-5">{t.subtitle}</p>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Name + Role */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mono text-[8px] text-text/30 block mb-1">{t.name} *</label>
                        <input required value={form.name} onChange={e => set('name', e.target.value)}
                          className="w-full bg-bg border border-border px-3 py-2 mono text-[11px] focus:outline-none focus:border-accent/50 transition-colors" />
                      </div>
                      <div>
                        <label className="mono text-[8px] text-text/30 block mb-1">{t.experience} *</label>
                        <select required value={form.experience} onChange={e => set('experience', e.target.value)}
                          className="w-full bg-bg border border-border px-3 py-2 mono text-[11px] focus:outline-none focus:border-accent/50 transition-colors">
                          <option value="">—</option>
                          {['1–2', '3–5', '5–8', '8–12', '12+'].map(y => <option key={y}>{y}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="mono text-[8px] text-text/30 block mb-1">{t.role} *</label>
                      <input required placeholder={t.rolePh} value={form.role} onChange={e => set('role', e.target.value)}
                        className="w-full bg-bg border border-border px-3 py-2 mono text-[11px] focus:outline-none focus:border-accent/50 transition-colors" />
                    </div>

                    <div>
                      <label className="mono text-[8px] text-text/30 block mb-1">{t.skills} *</label>
                      <input required placeholder={t.skillsPh} value={form.skills} onChange={e => set('skills', e.target.value)}
                        className="w-full bg-bg border border-border px-3 py-2 mono text-[11px] focus:outline-none focus:border-accent/50 transition-colors" />
                    </div>

                    <div>
                      <label className="mono text-[8px] text-text/30 block mb-1">{t.availability} *</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {t.availOpts.map(opt => (
                          <button type="button" key={opt} onClick={() => set('availability', opt)}
                            className={`py-2 px-3 mono text-[8px] border text-left transition-all ${form.availability === opt ? 'bg-accent text-black border-accent font-bold' : 'border-border text-text/40 hover:border-text/30'}`}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mono text-[8px] text-text/30 block mb-1">{t.contact} *</label>
                      <input required placeholder={t.contactPh} value={form.contact} onChange={e => set('contact', e.target.value)}
                        className="w-full bg-bg border border-border px-3 py-2 mono text-[11px] focus:outline-none focus:border-accent/50 transition-colors" />
                    </div>

                    <div>
                      <label className="mono text-[8px] text-text/30 block mb-1">{t.salary}</label>
                      <input placeholder={t.salaryPh} value={form.salary} onChange={e => set('salary', e.target.value)}
                        className="w-full bg-bg border border-border px-3 py-2 mono text-[11px] focus:outline-none focus:border-accent/50 transition-colors" />
                    </div>

                    {/* Preview toggle */}
                    {canPreview && (
                      <div>
                        <button type="button" onClick={() => setShowPreview(v => !v)}
                          className="flex items-center gap-1.5 mono text-[8px] text-accent/60 hover:text-accent transition-colors">
                          <Sparkles size={10} /> {showPreview ? 'Hide' : t.preview}
                        </button>
                        {showPreview && (
                          <div className="mt-2 bg-bg border border-border p-3 mono text-[9px] text-text/50 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                            {post}
                          </div>
                        )}
                      </div>
                    )}

                    <button type="submit" disabled={status === 'loading' || !canPreview}
                      className="w-full flex items-center justify-center gap-2 bg-[#0077B5] text-white py-3 mono text-[10px] font-bold hover:opacity-90 transition-opacity disabled:opacity-40">
                      {status === 'loading' ? <><Loader2 size={12} className="animate-spin" />{t.sending}</> : <><Send size={11} />{t.submit}</>}
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
