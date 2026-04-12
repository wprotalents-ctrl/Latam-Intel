import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Linkedin, Send, CheckCircle2, Loader2, Sparkles, Copy, Check, ChevronRight, MapPin, Users } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang?: string;
}

const T = {
  EN: {
    title: 'Join WPro Talent Pool',
    framing: 'We add you to our active talent database. When a matching role comes in from a US or EU company, we reach out directly.',
    name: 'Full name',
    role: 'Your role / what you do',
    rolePh: 'e.g. Senior React Developer, ML Engineer, Data Scientist',
    location: 'Your location',
    locationPh: 'e.g. São Paulo, BR · Buenos Aires, AR · Remote',
    skills: 'Top 3–5 skills',
    skillsPh: 'e.g. Python, PyTorch, AWS, React, TypeScript',
    experience: 'Years of experience',
    availability: 'Availability',
    availOpts: ['Open to offers', 'Available now', 'Freelance / contract', 'Part-time only'],
    contact: 'Your email or LinkedIn URL',
    contactPh: 'email@you.com or linkedin.com/in/yourname',
    salary: 'Salary expectation (optional)',
    salaryPh: 'e.g. $80k–$100k / year USD',
    submit: 'JOIN THE POOL →',
    sending: 'Sending...',
    successTitle: "You're in the pool!",
    successSteps: [
      "You're in our active WPro talent database",
      'We reach out directly when a matching US/EU role comes in',
      'Hiring managers contact you — no middleman fees',
      'No fees — ever. WPro earns from the company side.',
    ],
    ctaLabel: 'Want to see open roles now?',
    ctaLink: 'Browse open roles →',
    legal: 'By submitting you agree to WProTalents sharing your info with our hiring network.',
    preview: 'Preview your LinkedIn post',
    copy: 'Copy post',
    copyShare: 'Copy & Share on LinkedIn',
    copied: 'Copied!',
  },
  ES: {
    title: 'Únete al WPro Talent Pool',
    framing: 'Te agregamos a nuestra base de datos activa. Cuando llega una oferta que coincide, te contactamos directamente.',
    name: 'Nombre completo',
    role: 'Tu rol / lo que haces',
    rolePh: 'ej. Desarrollador React Senior, ML Engineer, Data Scientist',
    location: 'Tu ubicación',
    locationPh: 'ej. Ciudad de México · Buenos Aires, AR · Remoto',
    skills: 'Top 3–5 habilidades',
    skillsPh: 'ej. Python, PyTorch, AWS, React, TypeScript',
    experience: 'Años de experiencia',
    availability: 'Disponibilidad',
    availOpts: ['Abierto a ofertas', 'Disponible ahora', 'Freelance / contrato', 'Solo medio tiempo'],
    contact: 'Tu email o URL de LinkedIn',
    contactPh: 'email@tu.com o linkedin.com/in/tunombre',
    salary: 'Expectativa salarial (opcional)',
    salaryPh: 'ej. $80k–$100k / año USD',
    submit: 'UNIRME AL POOL →',
    sending: 'Enviando...',
    successTitle: '¡Estás en el pool!',
    successSteps: [
      'Estás en nuestra base de datos activa de WPro',
      'Te contactamos directamente cuando llega una oferta que coincide',
      'Los hiring managers te contactan — sin intermediarios',
      'Sin comisiones — WPro cobra del lado de la empresa.',
    ],
    ctaLabel: '¿Quieres ver roles disponibles ahora?',
    ctaLink: 'Ver roles disponibles →',
    legal: 'Al enviar aceptas que WProTalents comparta tu info con nuestra red.',
    preview: 'Vista previa de tu post de LinkedIn',
    copy: 'Copiar post',
    copyShare: 'Copiar y compartir en LinkedIn',
    copied: '¡Copiado!',
  },
  PT: {
    title: 'Entre no WPro Talent Pool',
    framing: 'Adicionamos você ao nosso banco de talentos. Quando surge uma vaga compatível, entramos em contato diretamente.',
    name: 'Nome completo',
    role: 'Seu cargo / o que você faz',
    rolePh: 'ex. Desenvolvedor React Sênior, ML Engineer, Cientista de Dados',
    location: 'Sua localização',
    locationPh: 'ex. São Paulo, SP · Rio de Janeiro · Remoto',
    skills: 'Top 3–5 habilidades',
    skillsPh: 'ex. Python, PyTorch, AWS, React, TypeScript',
    experience: 'Anos de experiência',
    availability: 'Disponibilidade',
    availOpts: ['Aberto a propostas', 'Disponível agora', 'Freelance / contrato', 'Apenas meio período'],
    contact: 'Seu email ou URL do LinkedIn',
    contactPh: 'email@voce.com ou linkedin.com/in/seunome',
    salary: 'Expectativa salarial (opcional)',
    salaryPh: 'ex. $80k–$100k / ano USD',
    submit: 'ENTRAR NO POOL →',
    sending: 'Enviando...',
    successTitle: 'Você está no pool!',
    successSteps: [
      'Você está no banco de talentos ativo do WPro',
      'Entramos em contato diretamente quando surge uma vaga compatível',
      'Gestores de contratação entram em contato — sem intermediários',
      'Sem taxas — WPro cobra do lado da empresa.',
    ],
    ctaLabel: 'Quer ver vagas abertas agora?',
    ctaLink: 'Ver vagas disponíveis →',
    legal: 'Ao enviar você concorda que WProTalents compartilhe suas informações com nossa rede.',
    preview: 'Pré-visualização do seu post no LinkedIn',
    copy: 'Copiar post',
    copyShare: 'Copiar e compartilhar no LinkedIn',
    copied: 'Copiado!',
  },
};

function buildPost(data: { name: string; role: string; location: string; skills: string; experience: string; availability: string; salary: string; contact: string }) {
  const avail = data.availability === 'Available now' || data.availability === 'Disponible ahora' || data.availability === 'Disponível agora'
    ? '🟢 Available now'
    : data.availability === 'Freelance / contract' || data.availability === 'Freelance / contrato'
    ? '🔄 Open to freelance/contract'
    : '👀 Open to new opportunities';

  const flag = data.location?.includes('BR') || data.location?.includes('São Paulo') || data.location?.includes('Rio')
    ? '🇧🇷'
    : data.location?.includes('MX') || data.location?.includes('México')
    ? '🇲🇽'
    : data.location?.includes('CO') || data.location?.includes('Bogotá')
    ? '🇨🇴'
    : data.location?.includes('AR') || data.location?.includes('Buenos Aires')
    ? '🇦🇷'
    : '🌎';

  return `🚀 ${data.name} — ${data.role}${data.location ? ` · ${data.location}` : ''}

${avail} | ${data.experience} years experience

Core skills: ${data.skills}${data.salary ? `\n💰 Expectation: ${data.salary}` : ''}

${data.contact}

${flag} LATAM tech professional open to US/EU remote opportunities — let's connect.

#LATAMtech #remotework #techtalent #opentowork`;
}

export default function LinkedInBoostModal({ isOpen, onClose, lang = 'EN' }: Props) {
  const t = T[lang as keyof typeof T] || T.EN;
  const [form, setForm] = useState({ name: '', role: '', location: '', skills: '', experience: '', availability: '', salary: '', contact: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const post = buildPost(form);
  const canSubmit = form.name && form.role && form.skills && form.experience && form.availability && form.contact;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(post);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

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

  const inputCls = "w-full bg-bg border border-border px-3 py-2 mono text-[11px] focus:outline-none focus:border-[#0077B5]/50 transition-colors";

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
                <Users size={16} className="text-[#0077B5]" />
                <span className="mono text-[10px] text-[#0077B5] font-bold tracking-widest">{t.title}</span>
              </div>
              <button onClick={onClose} className="text-text/30 hover:text-text"><X size={16} /></button>
            </div>

            <div className="p-6">
              {status === 'done' ? (
                <div className="py-4">
                  <div className="flex items-center gap-3 mb-5">
                    <CheckCircle2 size={28} className="text-green-400 shrink-0" />
                    <h3 className="font-black text-lg tracking-tighter uppercase">{t.successTitle}</h3>
                  </div>
                  <div className="space-y-2.5 mb-6">
                    {t.successSteps.map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-[#0077B5]/10 border border-[#0077B5]/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="mono text-[8px] text-[#0077B5] font-bold">{i + 1}</span>
                        </div>
                        <p className="text-sm text-text/70">{step}</p>
                      </div>
                    ))}
                  </div>
                  <div className="border border-accent/20 bg-accent/5 p-4 mb-4">
                    <p className="mono text-[8px] text-text/50 mb-2">{t.ctaLabel}</p>
                    <button
                      onClick={onClose}
                      className="mono text-[9px] text-accent font-bold flex items-center gap-1 hover:underline"
                    >
                      {t.ctaLink} <ChevronRight size={10} />
                    </button>
                  </div>
                  <button onClick={onClose} className="w-full mono text-[9px] border border-border py-2 hover:border-[#0077B5] hover:text-[#0077B5] transition-colors">CLOSE</button>
                </div>
              ) : (
                <>
                  {/* Framing text */}
                  <div className="flex items-start gap-2 bg-[#0077B5]/5 border border-[#0077B5]/20 p-3 mb-5">
                    <Linkedin size={12} className="text-[#0077B5] shrink-0 mt-0.5" />
                    <p className="mono text-[9px] text-text/60 leading-relaxed">{t.framing}</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Name + Experience */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mono text-[8px] text-text/30 block mb-1">{t.name} *</label>
                        <input required value={form.name} onChange={e => set('name', e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className="mono text-[8px] text-text/30 block mb-1">{t.experience} *</label>
                        <select required value={form.experience} onChange={e => set('experience', e.target.value)}
                          className={inputCls}>
                          <option value="">—</option>
                          {['1–2', '3–5', '5–8', '8–12', '12+'].map(y => <option key={y}>{y}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Role */}
                    <div>
                      <label className="mono text-[8px] text-text/30 block mb-1">{t.role} *</label>
                      <input required placeholder={t.rolePh} value={form.role} onChange={e => set('role', e.target.value)} className={inputCls} />
                    </div>

                    {/* Location */}
                    <div>
                      <label className="mono text-[8px] text-text/30 block mb-1 flex items-center gap-1">
                        <MapPin size={8} /> {t.location}
                      </label>
                      <input placeholder={t.locationPh} value={form.location} onChange={e => set('location', e.target.value)} className={inputCls} />
                    </div>

                    {/* Skills */}
                    <div>
                      <label className="mono text-[8px] text-text/30 block mb-1">{t.skills} *</label>
                      <input required placeholder={t.skillsPh} value={form.skills} onChange={e => set('skills', e.target.value)} className={inputCls} />
                    </div>

                    {/* Availability */}
                    <div>
                      <label className="mono text-[8px] text-text/30 block mb-1">{t.availability} *</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {t.availOpts.map(opt => (
                          <button type="button" key={opt} onClick={() => set('availability', opt)}
                            className={`py-2 px-3 mono text-[8px] border text-left transition-all ${form.availability === opt ? 'bg-[#0077B5] text-white border-[#0077B5] font-bold' : 'border-border text-text/40 hover:border-text/30'}`}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Contact */}
                    <div>
                      <label className="mono text-[8px] text-text/30 block mb-1">{t.contact} *</label>
                      <input required placeholder={t.contactPh} value={form.contact} onChange={e => set('contact', e.target.value)} className={inputCls} />
                    </div>

                    {/* Salary */}
                    <div>
                      <label className="mono text-[8px] text-text/30 block mb-1">{t.salary}</label>
                      <input placeholder={t.salaryPh} value={form.salary} onChange={e => set('salary', e.target.value)} className={inputCls} />
                    </div>

                    {/* Preview toggle — clean candidate-only post */}
                    {canSubmit && (
                      <div>
                        <div className="flex items-center justify-between">
                          <button type="button" onClick={() => setShowPreview(v => !v)}
                            className="flex items-center gap-1.5 mono text-[8px] text-[#0077B5]/70 hover:text-[#0077B5] transition-colors">
                            <Sparkles size={10} /> {showPreview ? 'Hide' : t.preview}
                          </button>
                          {showPreview && (
                            <button type="button" onClick={handleCopy}
                              className="flex items-center gap-1 mono text-[8px] text-text/50 hover:text-[#0077B5] border border-border hover:border-[#0077B5] px-2 py-1 transition-colors">
                              {copied ? <><Check size={9} className="text-green-400" />{t.copied}</> : <><Copy size={9} />{t.copyShare}</>}
                            </button>
                          )}
                        </div>
                        {showPreview && (
                          <div className="mt-2 bg-bg border border-[#0077B5]/20 p-3 mono text-[9px] text-text/50 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                            {post}
                          </div>
                        )}
                      </div>
                    )}

                    <button type="submit" disabled={status === 'loading' || !canSubmit}
                      className="w-full flex items-center justify-center gap-2 bg-[#0077B5] text-white py-3 mono text-[10px] font-bold hover:opacity-90 transition-opacity disabled:opacity-40">
                      {status === 'loading' ? <><Loader2 size={12} className="animate-spin" />{t.sending}</> : <><Send size={11} />{t.submit}</>}
                    </button>

                    {status === 'error' && (
                      <p className="mono text-[8px] text-red-400 text-center">Something went wrong. Try again.</p>
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
