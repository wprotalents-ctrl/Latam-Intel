// src/components/CandidateResources.tsx
// Free candidate resource hub — practical guides for LATAM job seekers
// targeting US/EU remote roles. Trilingual (EN/ES/PT).
//
// 4 cards: LinkedIn Optimizer · CV Optimization · AI for Employment · Top Courses
// Pattern matches ATSChecker / SalaryCalculator (mono, accent borders, low-density).

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Linkedin,
  FileText,
  Sparkles,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

type Lang = 'EN' | 'ES' | 'PT';

interface Props {
  lang?: Lang;
}

const T = {
  EN: {
    badge: 'CANDIDATE RESOURCES · FREE',
    title: 'Get Hired by US & EU Companies',
    subtitle: 'Practical playbooks used by 23K+ LATAM candidates in our network',
    expand: 'OPEN',
    collapse: 'CLOSE',
    // LinkedIn
    linkedinTitle: 'LinkedIn Profile Optimizer',
    linkedinDesc: 'The 7 changes that get your profile into the top 1% of recruiter searches',
    linkedinPoints: [
      'Headline = Role + Seniority + Stack. "Senior Backend Engineer | Python, AWS, LLM" beats "Software Engineer at X".',
      'About section: open with the outcome you deliver, not your story. "I help fintechs ship compliant backends 40% faster."',
      'Skills section: only list skills you can talk about for 5 minutes in an interview. Endorsements from strangers are noise.',
      'Experience: rewrite each bullet as [Action] + [Quantified result] + [Tech]. "Cut API latency from 800ms to 120ms with Redis caching."',
      'Open to Work badge: turn it on ONLY for recruiters. Use the private "recruiters only" mode to hide from your current employer.',
      'Featured section: pin 1-2 case studies, your GitHub, or a short Loom. Recruiters check this in 6 seconds.',
      'Engage weekly: 3 thoughtful comments on industry posts > 30 generic ones. The algorithm rewards dwell time, not volume.',
    ],
    // CV
    cvTitle: 'CV / Resume Optimization',
    cvDesc: 'The 1-page format that beats ATS filters and survives the 6-second recruiter scan',
    cvPoints: [
      'Use the JD\'s exact keywords. If they say "PostgreSQL" you say "PostgreSQL", not "Postgres". ATS is literal.',
      'One page if you have <8 years of experience. Two pages if you\'re senior or staff+.',
      'Lead each role with a one-line scope statement: "Lead backend for a 12-engineer team at a Series B fintech (US clients)".',
      'Every bullet = strong verb + quantified impact. "Architected, led, cut, grew, shipped" — not "responsible for, worked on".',
      'Drop the "References available upon request" line. They know. Save the space.',
      'Skip the photo, age, marital status, and nationality. US/EU employers expect this. Including it triggers bias filters.',
      'File name: Firstname-Lastname-Senior-Backend-Engineer-2026.pdf. Not "resume_final_v3.pdf".',
    ],
    // AI for employment
    aiTitle: 'How to Use AI for Your Job Search',
    aiDesc: 'The AI tools LATAM candidates are actually using to land $80K-$150K remote roles',
    aiPoints: [
      'Resume tailoring: paste the JD + your resume into Claude/GPT, ask "rewrite my bullets to mirror this JD\'s keywords". Always review for truth.',
      'Cover letters: use the AI to draft, then add 2-3 specific details only you would know. Hiring managers can smell a 100% AI letter.',
      'Mock interviews: have AI play the hiring manager. Practice explaining your last 3 projects in 90 seconds each. Record yourself.',
      'Salary research: ask AI to compare your role, country, and seniority against Levels.fyi data. Cross-check before you negotiate.',
      'Code prep: LeetCode + ChatGPT explanation > LeetCode alone. Always understand the WHY, not just the solution.',
      'Networking outreach: AI drafts a 3-sentence cold DM. Personalize line 1 with something specific from their recent post.',
      'Tool stack that works: Claude (reasoning) + Cursor (coding) + Perplexity (research) + Granola (meeting notes). $50/mo total.',
    ],
    // Courses
    coursesTitle: 'Best Courses to Advance Your Career',
    coursesDesc: 'Self-paced courses vetted by 23K+ LATAM engineers in the WPro network',
    courses: [
      { name: 'CS50 — Harvard (Free)', provider: 'edX', url: 'https://cs50.harvard.edu/x/', why: 'The gold-standard intro to CS. Worth it even for seniors — fills the gaps you skipped.' },
      { name: 'System Design Masterclass', provider: 'Educative', url: 'https://www.educative.io/courses/grokking-the-system-design-interview', why: 'The interview round that decides senior+ offers. Most candidates wing it; this teaches the framework.' },
      { name: 'Deep Learning Specialization', provider: 'Coursera · Andrew Ng', url: 'https://www.coursera.org/specializations/deep-learning', why: 'Still the best deep learning course online. The LLM-era engineers all started here.' },
      { name: 'AWS Solutions Architect', provider: 'A Cloud Guru', url: 'https://www.pluralsight.com/cloud-guru', why: 'AWS certs open doors to US remote roles. SAA-C03 is the one with the highest signal-to-effort ratio.' },
      { name: 'English for Tech Professionals', provider: 'FutureLearn · British Council', url: 'https://www.futurelearn.com/courses/english-for-science-technology-engineering-mathematics', why: 'The language gap is the #1 reason LATAM engineers get passed over. This course closes it.' },
      { name: 'Staff Engineer Path', provider: 'Tinloof · free articles', url: 'https://staffeng.com/', why: 'Not a course — but the best free roadmap to staff/principal. Read every article. Bookmark, re-read yearly.' },
    ],
  },
  ES: {
    badge: 'RECURSOS PARA CANDIDATOS · GRATIS',
    title: 'Consigue Empleo en Empresas de EE.UU. y UE',
    subtitle: 'Playbooks prácticos usados por 23K+ candidatos LATAM en nuestra red',
    expand: 'ABRIR',
    collapse: 'CERRAR',
    linkedinTitle: 'Optimizador de Perfil de LinkedIn',
    linkedinDesc: 'Los 7 cambios que ponen tu perfil en el top 1% de búsquedas de recruiters',
    linkedinPoints: [
      'Titular = Rol + Seniority + Stack. "Senior Backend Engineer | Python, AWS, LLM" supera a "Software Engineer en X".',
      'Sección "Acerca de": empieza con el resultado que entregas, no tu historia. "Ayudo a fintechs a lanzar backends compliance-ready 40% más rápido."',
      'Habilidades: solo lista las que puedas defender 5 minutos en entrevista. Endorsements de desconocidos son ruido.',
      'Experiencia: cada bullet como [Acción] + [Resultado cuantificado] + [Tech]. "Reduje latencia de API de 800ms a 120ms con Redis caching."',
      'Badge "Open to Work": préndelo SOLO para recruiters. Usa el modo privado "solo recruiters" para ocultarlo de tu empleador actual.',
      'Sección "Destacado": ancla 1-2 case studies, tu GitHub o un Loom corto. Los recruiters revisan esto en 6 segundos.',
      'Engage semanal: 3 comentarios pensados en posts de la industria > 30 genéricos. El algoritmo premia tiempo de lectura, no volumen.',
    ],
    cvTitle: 'Optimización de CV / Resume',
    cvDesc: 'El formato de 1 página que supera filtros ATS y sobrevive los 6 segundos de scan del recruiter',
    cvPoints: [
      'Usa las palabras exactas del JD. Si dicen "PostgreSQL" tú dices "PostgreSQL", no "Postgres". ATS es literal.',
      'Una página si tienes <8 años de experiencia. Dos si eres senior o staff+.',
      'Cada rol empieza con una línea de scope: "Lideré backend para equipo de 12 ingenieros en fintech Series B (clientes US)".',
      'Cada bullet = verbo fuerte + impacto cuantificado. "Arquitecturé, lideré, reduje, crecí, lancé" — no "responsable de, trabajé en".',
      'Borra la línea "References available upon request". Ya lo saben. Ahorra espacio.',
      'Sin foto, edad, estado civil ni nacionalidad. Los empleadores US/UE lo esperan. Incluirlos dispara filtros de sesgo.',
      'Nombre del archivo: Nombre-Apellido-Senior-Backend-Engineer-2026.pdf. No "resume_final_v3.pdf".',
    ],
    aiTitle: 'Cómo Usar IA en tu Búsqueda de Empleo',
    aiDesc: 'Las herramientas de IA que candidatos LATAM realmente usan para conseguir roles remotos de $80K-$150K',
    aiPoints: [
      'Tailoring de CV: pega el JD + tu resume en Claude/GPT, pide "reescribe mis bullets para reflejar las keywords de este JD". Siempre revisa la verdad.',
      'Cover letters: usa la IA para el borrador, luego añade 2-3 detalles específicos que solo tú sabrías. Los hiring managers detectan una carta 100% IA.',
      'Mock interviews: pídele a la IA que juegue el rol del hiring manager. Practica explicar tus últimos 3 proyectos en 90 segundos. Grábate.',
      'Salary research: pide a la IA comparar tu rol, país y seniority contra datos de Levels.fyi. Cross-check antes de negociar.',
      'Code prep: LeetCode + explicación de ChatGPT > LeetCode solo. Entiende el POR QUÉ, no solo la solución.',
      'Outreach de networking: la IA redacta un DM de 3 líneas. Personaliza la línea 1 con algo específico de su post reciente.',
      'Stack que funciona: Claude (razonamiento) + Cursor (coding) + Perplexity (research) + Granola (notas). $50/mes total.',
    ],
    coursesTitle: 'Mejores Cursos para Avanzar tu Carrera',
    coursesDesc: 'Cursos self-paced evaluados por 23K+ ingenieros LATAM en la red WPro',
    courses: [
      { name: 'CS50 — Harvard (Gratis)', provider: 'edX', url: 'https://cs50.harvard.edu/x/', why: 'El gold-standard intro a CS. Vale la pena incluso para seniors — llena los huecos que saltaste.' },
      { name: 'System Design Masterclass', provider: 'Educative', url: 'https://www.educative.io/courses/grokking-the-system-design-interview', why: 'La ronda de entrevista que decide ofertas senior+. La mayoría la improvisa; esto enseña el framework.' },
      { name: 'Deep Learning Specialization', provider: 'Coursera · Andrew Ng', url: 'https://www.coursera.org/specializations/deep-learning', why: 'Sigue siendo el mejor curso de deep learning online. Los ingenieros de la era LLM empezaron aquí.' },
      { name: 'AWS Solutions Architect', provider: 'A Cloud Guru', url: 'https://www.pluralsight.com/cloud-guru', why: 'Las certs AWS abren puertas a roles remotos US. SAA-C03 es la de mayor ratio señal/esfuerzo.' },
      { name: 'English for Tech Professionals', provider: 'FutureLearn · British Council', url: 'https://www.futurelearn.com/courses/english-for-science-technology-engineering-mathematics', why: 'La brecha de idioma es la razón #1 por la que ingenieros LATAM quedan fuera. Este curso la cierra.' },
      { name: 'Staff Engineer Path', provider: 'Tinloof · artículos gratis', url: 'https://staffeng.com/', why: 'No es un curso — pero el mejor roadmap gratis a staff/principal. Lee cada artículo. Relee anual.' },
    ],
  },
  PT: {
    badge: 'RECURSOS PARA CANDIDATOS · GRÁTIS',
    title: 'Consiga Emprego em Empresas dos EUA e UE',
    subtitle: 'Playbooks práticos usados por 23K+ candidatos LATAM na nossa rede',
    expand: 'ABRIR',
    collapse: 'FECHAR',
    linkedinTitle: 'Otimizador de Perfil do LinkedIn',
    linkedinDesc: 'As 7 mudanças que colocam seu perfil no top 1% das buscas de recrutadores',
    linkedinPoints: [
      'Headline = Função + Senioridade + Stack. "Senior Backend Engineer | Python, AWS, LLM" supera "Engenheiro de Software na X".',
      'Seção "Sobre": abra com o resultado que você entrega, não sua história. "Ajudo fintechs a lançar backends compliance-ready 40% mais rápido."',
      'Habilidades: liste só as que você consegue defender por 5 minutos em entrevista. Endorsements de estranhos são ruído.',
      'Experiência: cada bullet como [Ação] + [Resultado quantificado] + [Tech]. "Reduzi latência de API de 800ms para 120ms com Redis caching."',
      'Selo "Open to Work": ative APENAS para recrutadores. Use o modo privado "só recrutadores" para esconder do seu empregador atual.',
      'Seção "Em destaque": fixe 1-2 case studies, seu GitHub ou um Loom curto. Recrutadores checam isso em 6 segundos.',
      'Engajamento semanal: 3 comentários pensados em posts da indústria > 30 genéricos. O algoritmo premia tempo de leitura, não volume.',
    ],
    cvTitle: 'Otimização de CV / Currículo',
    cvDesc: 'O formato de 1 página que vence filtros ATS e sobrevive aos 6 segundos de scan do recrutador',
    cvPoints: [
      'Use as palavras exatas da vaga. Se dizem "PostgreSQL" você diz "PostgreSQL", não "Postgres". ATS é literal.',
      'Uma página se você tem <8 anos de experiência. Duas se é senior ou staff+.',
      'Cada função começa com uma linha de escopo: "Liderei backend para equipe de 12 engenheiros em fintech Series B (clientes US)".',
      'Cada bullet = verbo forte + impacto quantificado. "Arquitetei, liderei, reduzi, cresci, lancei" — não "responsável por, trabalhei em".',
      'Apague a linha "References available upon request". Eles já sabem. Economize espaço.',
      'Sem foto, idade, estado civil nem nacionalidade. Empregadores US/UE esperam isso. Incluir dispara filtros de viés.',
      'Nome do arquivo: Nome-Sobrenome-Senior-Backend-Engineer-2026.pdf. Não "curriculo_final_v3.pdf".',
    ],
    aiTitle: 'Como Usar IA na Busca por Emprego',
    aiDesc: 'As ferramentas de IA que candidatos LATAM realmente usam para conquistar vagas remotas de $80K-$150K',
    aiPoints: [
      'Tailoring de CV: cole a vaga + seu currículo no Claude/GPT, peça "reescreva meus bullets para refletir as keywords desta vaga". Sempre revise a verdade.',
      'Cover letters: use a IA para o rascunho, depois adicione 2-3 detalhes específicos que só você saberia. Hiring managers detectam uma carta 100% IA.',
      'Mock interviews: peça à IA para fazer o papel do hiring manager. Pratique explicar seus últimos 3 projetos em 90 segundos. Grave-se.',
      'Salary research: peça à IA comparar sua função, país e senioridade contra dados de Levels.fyi. Faça cross-check antes de negociar.',
      'Code prep: LeetCode + explicação de ChatGPT > LeetCode sozinho. Entenda o POR QUÊ, não só a solução.',
      'Outreach de networking: a IA redige um DM de 3 linhas. Personalize a linha 1 com algo específico do post recente da pessoa.',
      'Stack que funciona: Claude (raciocínio) + Cursor (coding) + Perplexity (pesquisa) + Granola (notas). $50/mês no total.',
    ],
    coursesTitle: 'Melhores Cursos para Avançar sua Carreira',
    coursesDesc: 'Cursos self-paced validados por 23K+ engenheiros LATAM na rede WPro',
    courses: [
      { name: 'CS50 — Harvard (Grátis)', provider: 'edX', url: 'https://cs50.harvard.edu/x/', why: 'O gold-standard introdutório de CS. Vale a pena até para seniors — preenche as lacunas que você pulou.' },
      { name: 'System Design Masterclass', provider: 'Educative', url: 'https://www.educative.io/courses/grokking-the-system-design-interview', why: 'A rodada de entrevista que decide ofertas senior+. A maioria improvisa; isso ensina o framework.' },
      { name: 'Deep Learning Specialization', provider: 'Coursera · Andrew Ng', url: 'https://www.coursera.org/specializations/deep-learning', why: 'Continua sendo o melhor curso de deep learning online. Os engenheiros da era LLM começaram aqui.' },
      { name: 'AWS Solutions Architect', provider: 'A Cloud Guru', url: 'https://www.pluralsight.com/cloud-guru', why: 'Certs AWS abrem portas para vagas remotas US. SAA-C03 é a de maior razão sinal/esforço.' },
      { name: 'English for Tech Professionals', provider: 'FutureLearn · British Council', url: 'https://www.futurelearn.com/courses/english-for-science-technology-engineering-mathematics', why: 'A lacuna de idioma é o motivo #1 pelo qual engenheiros LATAM são deixados de fora. Este curso fecha isso.' },
      { name: 'Staff Engineer Path', provider: 'Tinloof · artigos grátis', url: 'https://staffeng.com/', why: 'Não é um curso — mas o melhor roadmap grátis para staff/principal. Leia cada artigo. Releia anualmente.' },
    ],
  },
};

function Card({
  icon: Icon,
  title,
  desc,
  open,
  onToggle,
  children,
  lang,
}: {
  icon: typeof Linkedin;
  title: string;
  desc: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  lang: Lang;
}) {
  const tt = T[lang];
  return (
    <div className="border border-accent/20 bg-accent/5">
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-accent/10 transition-colors"
      >
        <Icon size={14} className="text-accent mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="mono text-[10px] font-bold text-text">{title}</p>
          <p className="mono text-[8px] text-text/50 mt-0.5 leading-relaxed">{desc}</p>
        </div>
        <span className="mono text-[8px] text-accent font-bold shrink-0 mt-0.5">
          {open ? tt.collapse : tt.expand} {open ? '↑' : '↓'}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-accent/10"
          >
            <div className="p-5 bg-bg">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CandidateResources({ lang = 'EN' }: Props) {
  const tt = T[lang];
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="border border-accent/20 bg-accent/5">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-accent/10">
        <GraduationCap size={12} className="text-accent" />
        <span className="mono text-[9px] font-bold text-accent tracking-widest">{tt.badge}</span>
        <div className="h-px flex-1 bg-accent/10" />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-black text-text mb-1">{tt.title}</h3>
        <p className="mono text-[9px] text-text/50 mb-4">{tt.subtitle}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* LinkedIn */}
          <Card
            icon={Linkedin}
            title={tt.linkedinTitle}
            desc={tt.linkedinDesc}
            open={openIdx === 0}
            onToggle={() => setOpenIdx(openIdx === 0 ? null : 0)}
            lang={lang}
          >
            <ul className="space-y-2">
              {tt.linkedinPoints.map((p, i) => (
                <li key={i} className="mono text-[9px] text-text/75 leading-relaxed flex gap-2">
                  <CheckCircle2 size={10} className="text-accent shrink-0 mt-0.5" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* CV */}
          <Card
            icon={FileText}
            title={tt.cvTitle}
            desc={tt.cvDesc}
            open={openIdx === 1}
            onToggle={() => setOpenIdx(openIdx === 1 ? null : 1)}
            lang={lang}
          >
            <ul className="space-y-2">
              {tt.cvPoints.map((p, i) => (
                <li key={i} className="mono text-[9px] text-text/75 leading-relaxed flex gap-2">
                  <CheckCircle2 size={10} className="text-accent shrink-0 mt-0.5" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* AI for employment */}
          <Card
            icon={Sparkles}
            title={tt.aiTitle}
            desc={tt.aiDesc}
            open={openIdx === 2}
            onToggle={() => setOpenIdx(openIdx === 2 ? null : 2)}
            lang={lang}
          >
            <ul className="space-y-2">
              {tt.aiPoints.map((p, i) => (
                <li key={i} className="mono text-[9px] text-text/75 leading-relaxed flex gap-2">
                  <CheckCircle2 size={10} className="text-accent shrink-0 mt-0.5" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Courses */}
          <Card
            icon={GraduationCap}
            title={tt.coursesTitle}
            desc={tt.coursesDesc}
            open={openIdx === 3}
            onToggle={() => setOpenIdx(openIdx === 3 ? null : 3)}
            lang={lang}
          >
            <div className="space-y-3">
              {tt.courses.map((c, i) => (
                <a
                  key={i}
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border border-border p-3 hover:border-accent/40 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="mono text-[10px] font-bold text-text group-hover:text-accent transition-colors">
                      {c.name}
                    </p>
                    <ExternalLink size={10} className="text-text/30 group-hover:text-accent shrink-0 mt-0.5" />
                  </div>
                  <p className="mono text-[7px] text-accent mb-1.5 uppercase tracking-wider">{c.provider}</p>
                  <p className="mono text-[9px] text-text/60 leading-relaxed">{c.why}</p>
                </a>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
