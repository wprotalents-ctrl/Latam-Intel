import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, MapPin, Building2, ExternalLink, Briefcase,
  Loader2, AlertCircle, Clock, TrendingUp,
  TrendingDown, ChevronRight, Radio, Users, Globe, RefreshCw, Linkedin,
  Zap, BookOpen, DollarSign, Compass, Award, Target, Rocket, ArrowUpRight,
  FileText, Mic2, Star, Lightbulb, Bookmark, BookmarkCheck, Copy, Check,
  Newspaper, Mail, Lock, BarChart2
} from 'lucide-react';
import { computeMarketValue } from '../lib/intelligence';
import type { RoleKey, CountryCode, EnglishLevel } from '../lib/intelligence';
import LinkedInBoostModal from '../components/LinkedInBoostModal';
import PostVacancyModal from '../components/PostVacancyModal';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  salary: string | null;
  tags: string;
  source: string;
  region: string;
  postedAt?: string;
}

const REGIONS = ['All', 'LATAM', 'USA', 'Europe', 'Worldwide'];

const QUICK_FILTERS = ['AI / ML', 'Software Engineer', 'Data', 'DevOps', 'Product', 'Design', 'Remote LATAM'];

const MATCH_ROLE_TYPES = ['Software Engineer', 'Data', 'DevOps', 'Design', 'Product', 'Marketing', 'AI / ML'];
const MATCH_SENIORITIES = ['Junior', 'Mid', 'Senior', 'Lead'];
const MATCH_REGIONS = ['Worldwide', 'LATAM', 'USA', 'Europe'];

interface MatchPrefs { roleType: string; seniority: string; region: string; }
const MATCH_KEY = 'wpro_match_prefs';

const T = {
  EN: {
    clientBadge: 'MARKET INTEL · FOR COMPANIES',
    noNews: 'Loading latest AI workforce news...',
    read: 'READ',
    candidateBadge: 'JOB PORTAL · FOR CANDIDATES',
    candidateDesc: 'Live remote roles across LATAM, USA & Europe — updated every 30 min.',
    search: 'Search jobs, companies, skills...',
    apply: 'APPLY',
    via: 'via',
    loading: 'Aggregating jobs from multiple sources...',
    error: 'Could not load jobs',
    retry: 'RETRY',
    noJobs: 'No jobs match your search.',
    roles: 'roles',
    loadMore: 'LOAD MORE',
    matchTitle: 'Quick Match',
    matchRoleType: 'Role type',
    matchSeniority: 'Seniority',
    matchRegion: 'Region',
    matchTopPicks: 'Top picks for you',
    matchBadge: 'MATCH',
    matchEmpty: 'Set your preferences above to see personalized picks.',
    matchCollapse: 'Hide picks',
    matchExpand: 'Show picks',
    // MarketValueTeaser
    teaserBadge: 'MARKET VALUE CALCULATOR · FREE PREVIEW',
    teaserFullDash: 'Full dashboard → Executive Members',
    teaserRole: 'ROLE',
    teaserCountry: 'COUNTRY',
    teaserYearsExp: 'YEARS EXP',
    teaserCalculate: 'CALCULATE →',
    teaserLocalMid: 'LOCAL MARKET MID',
    teaserRemote: 'REMOTE (USD)',
    teaserUplift: 'uplift · /year',
    teaserPerYear: '/year',
    teaserLockedLabel: 'Full dashboard · Executive Members',
    teaserUnlock: 'Join Beta — Free Access',
    teaserLockedSections: ['Salary by English Level', 'Best Markets for You', 'Skills ROI'],
  },
  ES: {
    clientBadge: 'INTELIGENCIA DE MERCADO · PARA EMPRESAS',
    noNews: 'Cargando noticias de empleo IA...',
    read: 'LEER',
    candidateBadge: 'PORTAL DE EMPLEO · PARA CANDIDATOS',
    candidateDesc: 'Roles remotos en LATAM, EE.UU. y Europa — actualizado cada 30 min.',
    search: 'Buscar empleos, empresas, habilidades...',
    apply: 'APLICAR',
    via: 'vía',
    loading: 'Agregando empleos de múltiples fuentes...',
    error: 'No se pudieron cargar los empleos',
    retry: 'REINTENTAR',
    noJobs: 'Sin resultados.',
    roles: 'roles',
    loadMore: 'CARGAR MÁS',
    matchTitle: 'Búsqueda Rápida',
    matchRoleType: 'Tipo de rol',
    matchSeniority: 'Nivel',
    matchRegion: 'Región',
    matchTopPicks: 'Seleccionados para ti',
    matchBadge: 'MATCH',
    matchEmpty: 'Configura tus preferencias arriba para ver picks personalizados.',
    matchCollapse: 'Ocultar picks',
    matchExpand: 'Mostrar picks',
    // MarketValueTeaser
    teaserBadge: 'CALCULADORA DE VALOR DE MERCADO · VISTA PREVIA',
    teaserFullDash: 'Dashboard completo → Miembros Ejecutivos',
    teaserRole: 'ROL',
    teaserCountry: 'PAÍS',
    teaserYearsExp: 'AÑOS DE EXP',
    teaserCalculate: 'CALCULAR →',
    teaserLocalMid: 'VALOR DE MERCADO LOCAL',
    teaserRemote: 'REMOTO (USD)',
    teaserUplift: 'uplift · /año',
    teaserPerYear: '/año',
    teaserLockedLabel: 'Dashboard completo · Miembros Ejecutivos',
    teaserUnlock: 'Unirse al Beta — Gratis',
    teaserLockedSections: ['Salario por Nivel de Inglés', 'Mejores Mercados para Ti', 'ROI de Habilidades'],
  },
  PT: {
    clientBadge: 'INTELIGÊNCIA DE MERCADO · PARA EMPRESAS',
    noNews: 'Carregando notícias de emprego em IA...',
    read: 'LER',
    candidateBadge: 'PORTAL DE VAGAS · PARA CANDIDATOS',
    candidateDesc: 'Vagas remotas no LATAM, EUA e Europa — atualizado a cada 30 min.',
    search: 'Buscar vagas, empresas, habilidades...',
    apply: 'CANDIDATAR',
    via: 'via',
    loading: 'Agregando vagas de múltiplas fontes...',
    error: 'Não foi possível carregar as vagas',
    retry: 'TENTAR NOVAMENTE',
    noJobs: 'Nenhuma vaga encontrada.',
    roles: 'vagas',
    loadMore: 'CARREGAR MAIS',
    matchTitle: 'Busca Rápida',
    matchRoleType: 'Tipo de cargo',
    matchSeniority: 'Nível',
    matchRegion: 'Região',
    matchTopPicks: 'Selecionados para você',
    matchBadge: 'MATCH',
    matchEmpty: 'Configure suas preferências acima para ver sugestões personalizadas.',
    matchCollapse: 'Ocultar sugestões',
    matchExpand: 'Mostrar sugestões',
    // MarketValueTeaser
    teaserBadge: 'CALCULADORA DE VALOR DE MERCADO · PRÉVIA GRATUITA',
    teaserFullDash: 'Dashboard completo → Membros Executivos',
    teaserRole: 'FUNÇÃO',
    teaserCountry: 'PAÍS',
    teaserYearsExp: 'ANOS DE EXP',
    teaserCalculate: 'CALCULAR →',
    teaserLocalMid: 'VALOR DE MERCADO LOCAL',
    teaserRemote: 'REMOTO (USD)',
    teaserUplift: 'uplift · /ano',
    teaserPerYear: '/ano',
    teaserLockedLabel: 'Dashboard completo · Membros Executivos',
    teaserUnlock: 'Entrar no Beta — Grátis',
    teaserLockedSections: ['Salário por Nível de Inglês', 'Melhores Mercados para Você', 'ROI de Habilidades'],
  },
};

const REGION_STYLE: Record<string, string> = {
  LATAM: 'text-emerald-400 border-emerald-500/30',
  USA: 'text-blue-400 border-blue-500/30',
  Europe: 'text-violet-400 border-violet-500/30',
  Worldwide: 'text-accent border-accent/30',
};

function timeAgo(d?: string) {
  if (!d) return null;
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (isNaN(diff)) return null;
  if (diff === 0) return 'Today';
  if (diff === 1) return '1d';
  if (diff < 7) return `${diff}d`;
  if (diff < 31) return `${Math.floor(diff / 7)}w`;
  return null;
}

// ── Candidate Portal ──────────────────────────────────────────────────────────

type SectionKey = 'launch' | 'strike' | 'roomread' | 'ratecard' | 'zerocommute' | 'compound' | 'aileverage';

interface PortalArticle {
  title: string;
  desc: string;
  url: string;
  tag: string;
  wpro?: boolean;
}

interface PortalSection {
  label: string;
  tag: string;
  Icon: React.ElementType;
  color: string;
  accent: string;
  desc: string;
  articles: PortalArticle[];
}

function getPortalSections(lang: string): Record<SectionKey, PortalSection> {
  const isES = lang === 'ES';
  const isPT = lang === 'PT';
  return {
    launch: {
      label: isPT ? 'Protocolo de Lançamento' : isES ? 'Protocolo de Lanzamiento' : 'Launch Protocol',
      tag: isPT ? 'COMECE AQUI' : isES ? 'EMPIEZA AQUÍ' : 'START HERE',
      Icon: Rocket, color: 'text-accent', accent: 'bg-accent text-black',
      desc: isPT ? 'Construa sua estratégia antes de enviar uma única candidatura.' : isES ? 'Construye tu estrategia antes de enviar una sola solicitud.' : 'Build your strategy before you send a single application.',
      articles: isPT ? [
        { title: 'Identifique sua Estrela Guia na Busca de Emprego', desc: 'Clarifique o que você realmente busca — função, remuneração, cultura — antes de gastar uma única hora se candidatando.', url: 'https://hbr.org/2021/01/figuring-out-your-career-goals', tag: 'ESTRATÉGIA' },
        { title: 'Monte seu Centro de Comando para Busca de Emprego', desc: 'Rastreie cada candidatura, follow-up e contato em um sistema organizado para que nada seja perdido.', url: 'https://www.notion.com/templates/job-search-tracker', tag: 'ORGANIZAÇÃO' },
        { title: 'LATAM para o Mundo: Seu Roteiro Remoto em USD', desc: 'Os passos exatos que profissionais LATAM usam para passar de salário local para remuneração remota em USD/EUR.', url: 'https://remote.com/blog/employer-of-record-latin-america', tag: 'LATAM' },
        { title: 'Assine o Workforce Daily — Grátis', desc: 'Sinais semanais de contratação em IA, movimentos salariais na LATAM e inteligência de mercado na sua caixa de entrada.', url: 'https://wprotalents.lat', tag: 'WPRO INTEL', wpro: true },
        { title: 'Brag Doc: Registre Suas Conquistas Continuamente', desc: 'O único hábito que torna cada atualização de currículo, avaliação de desempenho e negociação salarial dramaticamente mais fácil.', url: 'https://hbr.org/2022/01/how-to-build-a-brag-document', tag: 'INTEL DE CARREIRA' },
      ] : isES ? [
        { title: 'Identifica tu Estrella del Norte en la Búsqueda de Empleo', desc: 'Aclara lo que realmente buscas — rol, compensación, cultura — antes de pasar una sola hora aplicando.', url: 'https://hbr.org/2021/01/figuring-out-your-career-goals', tag: 'ESTRATEGIA' },
        { title: 'Construye tu Centro de Comando de Búsqueda de Empleo', desc: 'Rastrea cada solicitud, seguimiento y contacto en un sistema organizado para que nada se pierda.', url: 'https://www.notion.com/templates/job-search-tracker', tag: 'ORGANIZACIÓN' },
        { title: 'LATAM al Mundo: Tu Hoja de Ruta Remota en USD', desc: 'Los pasos exactos que siguen los profesionales de LATAM para pasar del salario local a la compensación remota en USD/EUR.', url: 'https://remote.com/blog/employer-of-record-latin-america', tag: 'LATAM' },
        { title: 'Suscríbete a Workforce Daily — Gratis', desc: 'Señales semanales de contratación en IA, movimientos salariales en LATAM e inteligencia de mercado en tu bandeja.', url: 'https://wprotalents.lat', tag: 'WPRO INTEL', wpro: true },
        { title: 'Brag Doc: Registra tus Logros Continuamente', desc: 'El único hábito que hace que cada actualización de currículum, revisión de desempeño y negociación salarial sea mucho más fácil.', url: 'https://hbr.org/2022/01/how-to-build-a-brag-document', tag: 'INTEL DE CARRERA' },
      ] : [
        { title: 'Identify Your Job Search North Star', desc: "Clarify what you're actually looking for — role, comp, culture — before spending a single hour applying.", url: 'https://hbr.org/2021/01/figuring-out-your-career-goals', tag: 'STRATEGY' },
        { title: 'Build Your Job Search Command Center', desc: "Track every application, follow-up, and contact in one organised system so nothing falls through the cracks.", url: 'https://www.notion.com/templates/job-search-tracker', tag: 'ORGANISATION' },
        { title: 'LATAM to Global: Your USD Remote Roadmap', desc: 'The exact steps LATAM professionals take to transition from local pay to USD/EUR remote compensation.', url: 'https://remote.com/blog/employer-of-record-latin-america', tag: 'LATAM' },
        { title: 'Subscribe to Workforce Daily — Free', desc: 'Weekly AI hiring signals, LATAM salary moves, and market intel delivered to your inbox. Curated by WProTalents.', url: 'https://wprotalents.lat', tag: 'WPRO INTEL', wpro: true },
        { title: 'Brag Doc: Track Your Wins Continuously', desc: 'The single habit that makes every resume update, performance review, and salary negotiation dramatically easier.', url: 'https://hbr.org/2022/01/how-to-build-a-brag-document', tag: 'CAREER INTEL' },
      ],
    },
    strike: {
      label: isPT ? 'Pacote de Ataque' : isES ? 'Paquete de Ataque' : 'Strike Package',
      tag: isPT ? 'SEJA CONTRATADO' : isES ? 'CONSIGUE EL EMPLEO' : 'GET HIRED',
      Icon: FileText, color: 'text-emerald-400', accent: 'bg-emerald-500 text-black',
      desc: isPT ? 'Destaque-se de centenas de candidatos com uma candidatura afiada e otimizada para ATS.' : isES ? 'Destácate de cientos de solicitantes con una solicitud clara y optimizada para ATS.' : 'Stand out from hundreds of applicants with a sharp, ATS-optimised application.',
      articles: isPT ? [
        { title: 'Blindagem Anti-ATS: O Checklist de 10 Passos', desc: 'Mais de 75% dos currículos nunca chegam a um humano. Use esses passos para passar pelo filtro primeiro.', url: 'https://www.jobscan.co/blog/beat-applicant-tracking-system/', tag: 'ATS' },
        { title: 'Palavras-Chave que Fazem seu Currículo Passar', desc: 'Como identificar as palavras-chave certas para cada vaga e incorporá-las naturalmente no seu currículo.', url: 'https://www.linkedin.com/pulse/how-use-keywords-your-resume-get-noticed-recruiters-linkedin-news/', tag: 'PALAVRAS-CHAVE' },
        { title: 'A Fórmula de Perfil LinkedIn que Atrai Recrutadores', desc: 'Otimize cada seção — título, sobre, experiência — para aparecer em buscas de recrutadores passivamente.', url: 'https://www.linkedin.com/business/talent/blog/talent-acquisition/linkedin-profile-tips-for-job-seekers', tag: 'LINKEDIN' },
        { title: 'Como Escrever uma Carta de Apresentação que Seja Lida', desc: 'Quando escrever, o que incluir e a estrutura que faz os gestores pararem de rolar a tela.', url: 'https://hbr.org/2014/02/how-to-write-a-cover-letter', tag: 'ESCRITA' },
        { title: 'Coloque seu Perfil na Frente de 23K+ Gestores', desc: 'WProTalents apresenta candidatos LATAM verificados à nossa rede de empresas dos EUA e Europa — grátis, em 48h.', url: '#linkedin-boost', tag: 'WPRO EXCLUSIVO', wpro: true },
        { title: 'Ferramentas Gratuitas de Revisão de Currículo', desc: 'As melhores ferramentas gratuitas para verificar conformidade com ATS, gramática e impacto antes de se candidatar.', url: 'https://resume.io', tag: 'FERRAMENTAS' },
      ] : isES ? [
        { title: 'Blindaje Anti-ATS: El Checklist de 10 Pasos', desc: 'Más del 75% de los currículums nunca llegan a un humano. Usa estos pasos para pasar el filtro primero.', url: 'https://www.jobscan.co/blog/beat-applicant-tracking-system/', tag: 'ATS' },
        { title: 'Palabras Clave que Hacen Pasar tu Currículum', desc: 'Cómo identificar las palabras clave correctas para cada rol e integrarlas de forma natural en tu currículum.', url: 'https://www.linkedin.com/pulse/how-use-keywords-your-resume-get-noticed-recruiters-linkedin-news/', tag: 'PALABRAS CLAVE' },
        { title: 'La Fórmula de Perfil LinkedIn que Atrae Inbound', desc: 'Optimiza cada sección — titular, sobre, experiencia — para aparecer en búsquedas de reclutadores pasivamente.', url: 'https://www.linkedin.com/business/talent/blog/talent-acquisition/linkedin-profile-tips-for-job-seekers', tag: 'LINKEDIN' },
        { title: 'Cómo Escribir una Carta de Presentación que se Lea', desc: 'Cuándo escribirla, qué incluir y la estructura que hace que los responsables paren de hacer scroll.', url: 'https://hbr.org/2014/02/how-to-write-a-cover-letter', tag: 'REDACCIÓN' },
        { title: 'Pon tu Perfil Frente a 23K+ Gerentes de Contratación', desc: 'WProTalents presenta candidatos LATAM verificados a nuestra red de empresas de EE.UU. y Europa — gratis, en 48h.', url: '#linkedin-boost', tag: 'WPRO EXCLUSIVO', wpro: true },
        { title: 'Herramientas Gratuitas de Revisión de CV', desc: 'Las mejores herramientas gratuitas para revisar tu CV: ATS, gramática e impacto antes de aplicar.', url: 'https://resume.io', tag: 'HERRAMIENTAS' },
      ] : [
        { title: 'ATS-Proof Your Resume: The 10-Step Checklist', desc: "Over 75% of resumes never reach a human. Use these steps to get through the filter first.", url: 'https://www.jobscan.co/blog/beat-applicant-tracking-system/', tag: 'ATS' },
        { title: 'Resume Keywords That Get You Past the Filter', desc: 'How to identify the right keywords for each role and embed them naturally in your resume.', url: 'https://www.linkedin.com/pulse/how-use-keywords-your-resume-get-noticed-recruiters-linkedin-news/', tag: 'KEYWORDS' },
        { title: 'The LinkedIn Profile Formula That Attracts Inbound', desc: "Optimise every section — headline, about, experience — to appear in recruiter searches passively.", url: 'https://www.linkedin.com/business/talent/blog/talent-acquisition/linkedin-profile-tips-for-job-seekers', tag: 'LINKEDIN' },
        { title: 'How to Write a Cover Letter That Gets Read', desc: 'When to write one, what to include, and the structure that makes hiring managers stop scrolling.', url: 'https://hbr.org/2014/02/how-to-write-a-cover-letter', tag: 'WRITING' },
        { title: 'Get Your Profile in Front of 23K+ Hiring Managers', desc: 'WProTalents features vetted LATAM candidates to our network of US & EU companies — free, within 48h.', url: '#linkedin-boost', tag: 'WPRO EXCLUSIVE', wpro: true },
        { title: 'Free Resume Review Tools Ranked by Recruiters', desc: 'The best free tools to check your resume for ATS compliance, grammar, and impact before you apply.', url: 'https://resume.io', tag: 'TOOLS' },
      ],
    },
    roomread: {
      label: isPT ? 'Leitura da Sala' : isES ? 'Lectura de Sala' : 'Room Read',
      tag: isPT ? 'ENTREVISTA' : isES ? 'ENTREVISTA' : 'INTERVIEW',
      Icon: Mic2, color: 'text-blue-400', accent: 'bg-blue-500 text-white',
      desc: isPT ? 'Entre em cada entrevista preparado, confiante e estratégico.' : isES ? 'Entra a cada entrevista preparado, con confianza y estrategia.' : 'Walk into every interview prepared, confident, and strategic.',
      articles: isPT ? [
        { title: 'Como Pesquisar Qualquer Empresa Antes de uma Entrevista', desc: 'O framework de pesquisa de 30 minutos que faz você parecer um insider — e conquista a oferta.', url: 'https://hbr.org/2019/10/how-to-prepare-for-any-type-of-job-interview', tag: 'PESQUISA' },
        { title: 'O Método STAR: Domine Perguntas Comportamentais', desc: 'Situação, Tarefa, Ação, Resultado — o único framework que funciona para toda pergunta comportamental.', url: 'https://www.themuse.com/advice/star-interview-method', tag: 'FRAMEWORK' },
        { title: 'Maestria em Entrevistas Remotas', desc: 'Ângulos de câmera, iluminação, templates de follow-up async e as nuances de painéis remotos.', url: 'https://www.toptal.com/remote/how-to-ace-a-remote-job-interview', tag: 'REMOTO' },
        { title: 'Tech Interview Handbook (Grátis, Open Source)', desc: 'O guia mais completo e gratuito para prep de algoritmos, design de sistemas e questões comportamentais.', url: 'https://www.techinterviewhandbook.org/', tag: 'TECH' },
        { title: '30 Perguntas para Fazer no Final de Qualquer Entrevista', desc: 'As perguntas que sinalizam curiosidade intelectual, preparação e interesse genuíno.', url: 'https://www.glassdoor.com/blog/good-questions-to-ask-in-an-interview/', tag: 'TÁTICAS' },
        { title: 'Pramp: Prática Gratuita de Entrevistas Simuladas', desc: 'Pratique entrevistas técnicas e comportamentais reais com pares. Grátis, ao vivo e com feedback honesto.', url: 'https://www.pramp.com/', tag: 'PRÁTICA' },
      ] : isES ? [
        { title: 'Cómo Investigar Cualquier Empresa Antes de una Entrevista', desc: 'El framework de investigación de 30 minutos que te hace sonar como un insider — y te gana la oferta.', url: 'https://hbr.org/2019/10/how-to-prepare-for-any-type-of-job-interview', tag: 'INVESTIGACIÓN' },
        { title: 'El Método STAR: Domina las Preguntas de Comportamiento', desc: 'Situación, Tarea, Acción, Resultado — el único framework que funciona para toda pregunta conductual.', url: 'https://www.themuse.com/advice/star-interview-method', tag: 'FRAMEWORK' },
        { title: 'Maestría en Entrevistas Remotas', desc: 'Ángulos de cámara, iluminación, plantillas de follow-up async y los matices de paneles remotos.', url: 'https://www.toptal.com/remote/how-to-ace-a-remote-job-interview', tag: 'REMOTO' },
        { title: 'Tech Interview Handbook (Gratis, Open Source)', desc: 'La guía gratuita más completa para algoritmos, diseño de sistemas y prep conductual para roles tech.', url: 'https://www.techinterviewhandbook.org/', tag: 'TECH' },
        { title: '30 Preguntas para Hacer al Final de Cualquier Entrevista', desc: 'Las preguntas que señalan curiosidad intelectual, preparación e interés genuino.', url: 'https://www.glassdoor.com/blog/good-questions-to-ask-in-an-interview/', tag: 'TÁCTICAS' },
        { title: 'Pramp: Práctica Gratuita de Entrevistas Simuladas', desc: 'Practica entrevistas técnicas y de comportamiento reales con pares. Gratis, en vivo y feedback brutal.', url: 'https://www.pramp.com/', tag: 'PRÁCTICA' },
      ] : [
        { title: 'How to Research Any Company Before an Interview', desc: "The 30-minute research framework that makes you sound like an insider — and earns the offer.", url: 'https://hbr.org/2019/10/how-to-prepare-for-any-type-of-job-interview', tag: 'RESEARCH' },
        { title: 'The STAR Method: Master Behavioural Questions', desc: 'Situation, Task, Action, Result — the one framework that works for every behavioural interview question.', url: 'https://www.themuse.com/advice/star-interview-method', tag: 'FRAMEWORK' },
        { title: 'Remote Interview Mastery: Setup, Presence & Follow-Up', desc: 'Camera angles, lighting, async follow-up templates, and the nuances of remote-first hiring panels.', url: 'https://www.toptal.com/remote/how-to-ace-a-remote-job-interview', tag: 'REMOTE' },
        { title: 'Tech Interview Handbook (Free, Open Source)', desc: 'The most comprehensive free guide to algorithms, system design, and behavioural prep for tech roles.', url: 'https://www.techinterviewhandbook.org/', tag: 'TECH' },
        { title: '30 Questions to Ask at the End of Any Interview', desc: 'The questions that signal intellectual curiosity, preparation, and genuine interest — sorted by interview type.', url: 'https://www.glassdoor.com/blog/good-questions-to-ask-in-an-interview/', tag: 'TACTICS' },
        { title: 'Pramp: Free Mock Interview Practice', desc: 'Practice real technical and behavioural interviews with peers. Free, live, and brutally honest feedback.', url: 'https://www.pramp.com/', tag: 'PRACTICE' },
      ],
    },
    ratecard: {
      label: isPT ? 'Tabela de Preços' : isES ? 'Tarjeta de Tarifas' : 'Rate Card',
      tag: isPT ? 'NEGOCIE' : isES ? 'NEGOCIA' : 'NEGOTIATE',
      Icon: DollarSign, color: 'text-yellow-400', accent: 'bg-yellow-500 text-black',
      desc: isPT ? 'Nunca deixe dinheiro na mesa. Conheça seu valor, domine a conversa.' : isES ? 'Nunca dejes dinero sobre la mesa. Conoce tu valor, controla la conversación.' : 'Never leave money on the table. Know your worth, own the conversation.',
      articles: isPT ? [
        { title: '15 Regras para Negociar uma Oferta de Emprego (HBR)', desc: 'O manual definitivo do Harvard Business Review para negociação salarial — usado por profissionais no mundo todo.', url: 'https://hbr.org/2014/06/15-rules-for-negotiating-a-job-offer', tag: 'NEGOCIAÇÃO' },
        { title: 'Dados Reais de Remuneração para Cargos Tech & IA', desc: 'Dados verificados de salário, equity e comp total para centenas de cargos em empresas tech globais.', url: 'https://www.levels.fyi/', tag: 'DADOS' },
        { title: 'Salário LATAM em USD: O Quadro Completo', desc: 'Remuneração remota em USD vs. salários locais — a lacuna real, como empresas a calculam e como fechá-la.', url: 'https://remote.com/blog/employer-of-record-latin-america', tag: 'LATAM' },
        { title: 'Como Escolher Entre Múltiplas Ofertas de Emprego', desc: 'Um framework de decisão estruturado para quando você tem opções e precisa escolher sabiamente.', url: 'https://www.glassdoor.com/blog/evaluate-job-offer/', tag: 'DECISÃO' },
        { title: 'Scripts de Negociação Salarial que Funcionam', desc: 'Scripts de email e ligação para contra-oferecer, pedir mais e não piscar primeiro.', url: 'https://www.glassdoor.com/blog/guide/salary-negotiation-scripts/', tag: 'SCRIPTS' },
      ] : isES ? [
        { title: '15 Reglas para Negociar una Oferta de Empleo (HBR)', desc: 'El manual definitivo de Harvard Business Review para negociación salarial — usado por profesionales en todo el mundo.', url: 'https://hbr.org/2014/06/15-rules-for-negotiating-a-job-offer', tag: 'NEGOCIACIÓN' },
        { title: 'Datos Reales de Compensación para Roles Tech & IA', desc: 'Datos verificados de salario, equity y comp total para cientos de roles en empresas tech globales.', url: 'https://www.levels.fyi/', tag: 'DATOS' },
        { title: 'Salario LATAM en USD: El Cuadro Completo', desc: 'Pago remoto en USD vs. salarios locales — la brecha real, cómo la calculan las empresas y cómo cerrarla.', url: 'https://remote.com/blog/employer-of-record-latin-america', tag: 'LATAM' },
        { title: 'Cómo Elegir Entre Múltiples Ofertas de Empleo', desc: 'Un framework de decisión estructurado para cuando tienes opciones y necesitas elegir sabiamente.', url: 'https://www.glassdoor.com/blog/evaluate-job-offer/', tag: 'DECISIÓN' },
        { title: 'Scripts de Negociación Salarial que Funcionan', desc: 'Scripts de email y llamada para contraoferta, pedir más y no parpadear primero.', url: 'https://www.glassdoor.com/blog/guide/salary-negotiation-scripts/', tag: 'SCRIPTS' },
      ] : [
        { title: '15 Rules for Negotiating a Job Offer (HBR)', desc: 'The definitive Harvard Business Review playbook for salary negotiation — used by professionals worldwide.', url: 'https://hbr.org/2014/06/15-rules-for-negotiating-a-job-offer', tag: 'NEGOTIATION' },
        { title: 'Real Compensation Data for Tech & AI Roles', desc: 'Verified salary, equity, and total comp data for hundreds of roles across global tech companies.', url: 'https://www.levels.fyi/', tag: 'DATA' },
        { title: 'LATAM Salary in USD: The Full Picture', desc: 'USD remote pay vs local rates — the real gap, how companies calculate it, and how to close it.', url: 'https://remote.com/blog/employer-of-record-latin-america', tag: 'LATAM' },
        { title: 'How to Choose Between Multiple Job Offers', desc: "A structured decision framework for when you're lucky enough to have options and need to choose wisely.", url: 'https://www.glassdoor.com/blog/evaluate-job-offer/', tag: 'DECISION' },
        { title: 'Salary Negotiation Scripts That Actually Work', desc: "Word-for-word email and call scripts for countering an offer, asking for more, and not blinking first.", url: 'https://www.glassdoor.com/blog/guide/salary-negotiation-scripts/', tag: 'SCRIPTS' },
      ],
    },
    zerocommute: {
      label: isPT ? 'Stack Zero-Commute' : isES ? 'Stack Cero-Viaje' : 'Zero-Commute Stack',
      tag: isPT ? 'REMOTO' : isES ? 'REMOTO' : 'REMOTE',
      Icon: Globe, color: 'text-violet-400', accent: 'bg-violet-500 text-white',
      desc: isPT ? 'Vença no trabalho remoto — de conquistar seu primeiro cargo a prosperar a longo prazo.' : isES ? 'Gana en el trabajo remoto — desde conseguir tu primer rol hasta prosperar a largo plazo.' : 'Win at remote — from landing your first role to thriving long-term.',
      articles: isPT ? [
        { title: 'Guia All-Remote do GitLab (O Melhor da Categoria)', desc: 'O guia de trabalho remoto mais detalhado e testado da internet — criado por uma empresa remota de 2.000 pessoas.', url: 'https://about.gitlab.com/company/culture/all-remote/guide/', tag: 'GUIA' },
        { title: 'Melhores Job Boards para Vagas Remotas na LATAM 2026', desc: 'As principais plataformas onde empresas dos EUA e Europa buscam ativamente talentos remotos da LATAM.', url: 'https://remotive.com', tag: 'JOB BOARDS' },
        { title: 'Como Abordar Recrutadores no LinkedIn via Cold Message', desc: 'Frameworks e templates de mensagem para contatar recrutadores dos EUA/Europa sem ser ignorado.', url: 'https://www.linkedin.com/pulse/how-message-recruiter-linkedin-get-response-job-search-guide/', tag: 'NETWORKING' },
        { title: 'Precisão Militar: Escreva Emails que Geram Respostas', desc: 'O método BLUF para comunicação escrita async — usado pelas melhores equipes remotas.', url: 'https://hbr.org/2016/11/how-to-write-email-with-military-precision', tag: 'COMUNICAÇÃO' },
        { title: 'Kit de Ferramentas para Trabalho Remoto: Produtividade & Bem-Estar', desc: 'Estrutura, ferramentas e rotinas para trabalho remoto integral sustentável — sem esgotamento.', url: 'https://www.notion.com/templates/remote-work-toolkit', tag: 'BEM-ESTAR' },
      ] : isES ? [
        { title: 'Guía All-Remote de GitLab (La Mejor de su Clase)', desc: 'La guía de trabajo remoto más detallada y probada de internet — construida por una empresa remota de 2.000 personas.', url: 'https://about.gitlab.com/company/culture/all-remote/guide/', tag: 'GUÍA' },
        { title: 'Mejores Job Boards para Roles Remotos en LATAM 2026', desc: 'Las principales plataformas donde empresas de EE.UU. y Europa buscan activamente talento remoto LATAM.', url: 'https://remotive.com', tag: 'JOB BOARDS' },
        { title: 'Cómo Contactar Reclutadores en LinkedIn en Frío', desc: 'Frameworks y plantillas de mensajes para contactar reclutadores de EE.UU./Europa sin ser ignorado.', url: 'https://www.linkedin.com/pulse/how-message-recruiter-linkedin-get-response-job-search-guide/', tag: 'NETWORKING' },
        { title: 'Precisión Militar: Escribe Emails que Obtienen Respuestas', desc: 'El método BLUF para comunicación escrita async — usado por los mejores equipos remotos.', url: 'https://hbr.org/2016/11/how-to-write-email-with-military-precision', tag: 'COMUNICACIÓN' },
        { title: 'Kit de Herramientas para Trabajo Remoto: Productividad & Bienestar', desc: 'Estructura, herramientas y rutinas para trabajo remoto sostenible a tiempo completo.', url: 'https://www.notion.com/templates/remote-work-toolkit', tag: 'BIENESTAR' },
      ] : [
        { title: "GitLab's All-Remote Work Guide (Best in Class)", desc: "The most detailed, battle-tested remote work guide on the internet — built by a 2,000-person remote company.", url: 'https://about.gitlab.com/company/culture/all-remote/guide/', tag: 'GUIDE' },
        { title: 'Best Job Boards for Remote LATAM Roles in 2026', desc: 'The top platforms where US and EU companies actively search for LATAM remote talent — ranked by quality.', url: 'https://remotive.com', tag: 'JOB BOARDS' },
        { title: 'How to Cold Message Recruiters on LinkedIn', desc: 'Message frameworks and templates for reaching out to US/EU recruiters and hiring managers without being ignored.', url: 'https://www.linkedin.com/pulse/how-message-recruiter-linkedin-get-response-job-search-guide/', tag: 'NETWORKING' },
        { title: 'Military Precision: Write Emails That Get Responses', desc: 'The BLUF (Bottom Line Up Front) method for async written communication — used by top remote teams.', url: 'https://hbr.org/2016/11/how-to-write-email-with-military-precision', tag: 'COMMUNICATION' },
        { title: 'Remote Work Toolkit: Productivity & Wellbeing', desc: 'Structure, tools, and routines for sustainable full-time remote work — without burning out or disappearing.', url: 'https://www.notion.com/templates/remote-work-toolkit', tag: 'WELLBEING' },
      ],
    },
    compound: {
      label: isPT ? 'Carreira Composta' : isES ? 'Carrera Compuesta' : 'Compound Career',
      tag: isPT ? 'LONGO PRAZO' : isES ? 'JUEGO LARGO' : 'LONG GAME',
      Icon: Compass, color: 'text-pink-400', accent: 'bg-pink-500 text-white',
      desc: isPT ? 'Pense além do próximo emprego. Construa a carreira que você realmente deseja.' : isES ? 'Piensa más allá del próximo trabajo. Construye la carrera que realmente quieres.' : 'Think beyond the next job. Build the career you actually want.',
      articles: isPT ? [
        { title: 'CliftonStrengths: Descubra no que Você é Melhor', desc: 'Uma das avaliações de fortalezas mais usadas. Entenda seus talentos naturais antes do seu próximo movimento.', url: 'https://www.gallup.com/cliftonstrengths/en/strengthsquest.aspx', tag: 'AUTODESCOBERTA' },
        { title: '16 Personalidades — Avaliação de Carreira Grátis', desc: 'Uma das avaliações de personalidade gratuitas mais usadas. Ótima para entender seu estilo de trabalho e fit.', url: 'https://www.16personalities.com/', tag: 'AVALIAÇÃO' },
        { title: 'Como Fazer uma Transição de Carreira sem Começar do Zero', desc: 'O framework da HBR para fazer uma transição que aproveita a experiência existente.', url: 'https://hbr.org/2021/07/how-to-make-a-career-pivot', tag: 'TRANSIÇÃO' },
        { title: 'Construa Credibilidade Rápido nos Primeiros 90 Dias', desc: 'O que fazer — e evitar — nos seus primeiros 3 meses para estabelecer confiança e definir o tom.', url: 'https://hbr.org/2018/01/how-to-build-trust-in-the-first-90-days-of-a-new-job', tag: 'CULTURA' },
        { title: 'Upskilling em IA para Resiliência de Longo Prazo', desc: 'As habilidades que separam candidatos que prosperam na era da IA dos que ficam para trás.', url: 'https://www.coursera.org/articles/ai-skills', tag: 'FUTURO' },
        { title: 'WPro Workforce Daily — Intel de Mercado LATAM', desc: 'Sinais semanais de contratação, tendências salariais e dados de força de trabalho com IA.', url: 'https://wprotalents.lat', tag: 'WPRO INTEL', wpro: true },
      ] : isES ? [
        { title: 'CliftonStrengths: Descubre en qué Eres Mejor', desc: 'Una de las evaluaciones de fortalezas más usadas. Comprende tus talentos naturales antes de tu próximo movimiento.', url: 'https://www.gallup.com/cliftonstrengths/en/strengthsquest.aspx', tag: 'AUTODESCUBRIMIENTO' },
        { title: '16 Personalidades — Evaluación de Carrera Gratis', desc: 'Una de las evaluaciones de personalidad gratuitas más usadas. Ideal para entender tu estilo de trabajo y fit.', url: 'https://www.16personalities.com/', tag: 'EVALUACIÓN' },
        { title: 'Cómo Hacer una Transición de Carrera sin Empezar desde Cero', desc: 'El framework de HBR para hacer una transición que aprovecha la experiencia existente.', url: 'https://hbr.org/2021/07/how-to-make-a-career-pivot', tag: 'TRANSICIÓN' },
        { title: 'Construye Credibilidad Rápido en los Primeros 90 Días', desc: 'Qué hacer — y evitar — en tus primeros 3 meses para establecer confianza y marcar el tono.', url: 'https://hbr.org/2018/01/how-to-build-trust-in-the-first-90-days-of-a-new-job', tag: 'CULTURA' },
        { title: 'Upskilling en IA para Resiliencia a Largo Plazo', desc: 'Las habilidades que separan a los candidatos que prosperan en la era de la IA de los que se quedan atrás.', url: 'https://www.coursera.org/articles/ai-skills', tag: 'FUTURO' },
        { title: 'WPro Workforce Daily — Intel de Mercado LATAM', desc: 'Señales semanales de contratación, tendencias salariales y datos de fuerza laboral con IA.', url: 'https://wprotalents.lat', tag: 'WPRO INTEL', wpro: true },
      ] : [
        { title: "CliftonStrengths: Discover What You're Best At", desc: "One of the most widely-used strengths assessments. Understand your natural talents before your next move.", url: 'https://www.gallup.com/cliftonstrengths/en/strengthsquest.aspx', tag: 'SELF-DISCOVERY' },
        { title: '16 Personalities — Free Career Planning Assessment', desc: 'One of the most-used free personality assessments. Great for understanding your working style and fit.', url: 'https://www.16personalities.com/', tag: 'ASSESSMENT' },
        { title: 'How to Pivot Careers Without Starting From Zero', desc: 'The HBR framework for making a career transition that builds on existing experience rather than erasing it.', url: 'https://hbr.org/2021/07/how-to-make-a-career-pivot', tag: 'TRANSITION' },
        { title: 'Build Credibility Fast in the First 90 Days', desc: "What to do — and avoid — in your first 3 months to establish trust and set the tone for your tenure.", url: 'https://hbr.org/2018/01/how-to-build-trust-in-the-first-90-days-of-a-new-job', tag: 'CULTURE' },
        { title: 'AI Upskilling for Long-Term Career Resilience', desc: 'The skills that separate candidates who thrive in the AI era from those who get left behind. Plan accordingly.', url: 'https://www.coursera.org/articles/ai-skills', tag: 'FUTURE-PROOF' },
        { title: 'WPro Workforce Daily — LATAM Market Intel', desc: 'Subscribe for weekly hiring signals, salary trends, and AI workforce data. Built for LATAM professionals.', url: 'https://wprotalents.lat', tag: 'WPRO INTEL', wpro: true },
      ],
    },
    aileverage: {
      label: isPT ? 'Alavancagem de IA' : isES ? 'Palanca de IA' : 'AI Leverage',
      tag: isPT ? 'À PROVA DO FUTURO' : isES ? 'A PRUEBA DEL FUTURO' : 'FUTURE-PROOF',
      Icon: Zap, color: 'text-violet-400', accent: 'bg-violet-500 text-white',
      desc: isPT ? 'As habilidades que separam os contratados dos ignorados em 2026.' : isES ? 'Las habilidades que separan a los contratados de los ignorados en 2026.' : 'The skills that separate the hired from the overlooked in 2026.',
      articles: isPT ? [
        { title: 'Top Habilidades em IA & ML para Profissionais Tech em 2026', desc: 'Prompt engineering, RAG, fine-tuning e sistemas agênticos — agora obrigatórios para cargos sênior globalmente.', url: 'https://www.coursera.org/articles/ai-skills', tag: 'HABILIDADES' },
        { title: 'Prompt Engineering para Devs (Curso Grátis)', desc: "O curso de 1 hora de Andrew Ng sobre prompts eficazes para GPT-4, Claude e Gemini. Muda carreiras.", url: 'https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/', tag: 'CURSO GRÁTIS' },
        { title: 'System Design Primer (Guia GitHub Mais Estrelado)', desc: 'O guia open-source de design de sistemas para entrevistas sênior nas maiores empresas do mundo.', url: 'https://github.com/donnemartin/system-design-primer', tag: 'ENTREVISTAS' },
        { title: 'Relatório WEF sobre o Futuro dos Empregos 2025', desc: 'Quais cargos estão crescendo, quais estão declinando e as habilidades que definirão contratações em 2025–2030.', url: 'https://www.weforum.org/publications/the-future-of-jobs-report-2025/', tag: 'DADOS DE MERCADO' },
        { title: 'GitHub Copilot: Guia de Codificação com IA', desc: 'Como usar pair-programming com IA de forma eficaz, melhorar seu output e colocar no CV com convicção.', url: 'https://docs.github.com/en/copilot', tag: 'FERRAMENTAS' },
        { title: 'Kaggle: Cursos Gratuitos de Machine Learning', desc: 'Cursos práticos de ML do iniciante ao avançado — com certificados, datasets e comunidade global.', url: 'https://www.kaggle.com/learn', tag: 'CURSO GRÁTIS' },
      ] : isES ? [
        { title: 'Top Habilidades en IA & ML para Profesionales Tech en 2026', desc: 'Prompt engineering, RAG, fine-tuning y sistemas agénticos — ahora requisitos básicos para roles sénior globalmente.', url: 'https://www.coursera.org/articles/ai-skills', tag: 'HABILIDADES' },
        { title: 'Prompt Engineering para Devs (Curso Gratis)', desc: "El curso de 1 hora de Andrew Ng sobre prompts efectivos para GPT-4, Claude y Gemini. Cambia carreras.", url: 'https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/', tag: 'CURSO GRATIS' },
        { title: 'System Design Primer (Guía GitHub Más Estrellada)', desc: 'La guía open-source de diseño de sistemas para entrevistas sénior en las mayores empresas del mundo.', url: 'https://github.com/donnemartin/system-design-primer', tag: 'ENTREVISTAS' },
        { title: 'Informe WEF sobre el Futuro del Trabajo 2025', desc: 'Qué roles crecen, cuáles declinan y las habilidades que definirán la contratación en 2025–2030.', url: 'https://www.weforum.org/publications/the-future-of-jobs-report-2025/', tag: 'DATOS DE MERCADO' },
        { title: 'GitHub Copilot: Guía de Codificación con IA', desc: 'Cómo usar pair-programming con IA de forma efectiva, mejorar tu output y ponerlo en el CV con convicción.', url: 'https://docs.github.com/en/copilot', tag: 'HERRAMIENTAS' },
        { title: 'Kaggle: Cursos Gratuitos de Machine Learning', desc: 'Cursos prácticos de ML desde principiante hasta avanzado — con certificados, datasets y comunidad global.', url: 'https://www.kaggle.com/learn', tag: 'CURSO GRATIS' },
      ] : [
        { title: 'Top AI & ML Skills Every Tech Pro Needs in 2026', desc: 'Prompt engineering, RAG, fine-tuning, and agentic systems — now table stakes for senior roles globally.', url: 'https://www.coursera.org/articles/ai-skills', tag: 'SKILLS' },
        { title: 'Prompt Engineering for Developers (Free Course)', desc: "Andrew Ng's 1-hour course on writing effective prompts for GPT-4, Claude, and Gemini. Career-changing.", url: 'https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/', tag: 'FREE COURSE' },
        { title: 'System Design Primer (Most-Starred GitHub Guide)', desc: 'The go-to open-source system design guide for senior engineering interviews at top companies worldwide.', url: 'https://github.com/donnemartin/system-design-primer', tag: 'INTERVIEWS' },
        { title: 'WEF Future of Jobs Report 2025', desc: 'Which roles are growing, which are declining, and the exact skills that will define hiring in 2025–2030.', url: 'https://www.weforum.org/publications/the-future-of-jobs-report-2025/', tag: 'MARKET DATA' },
        { title: 'GitHub Copilot: AI-Assisted Coding Guide', desc: 'How to use AI pair-programming tools effectively, improve your output, and put it convincingly on your CV.', url: 'https://docs.github.com/en/copilot', tag: 'TOOLS' },
        { title: 'Kaggle: Free Machine Learning Courses', desc: 'Hands-on ML courses from beginner to advanced — with certificates, datasets, and a global community.', url: 'https://www.kaggle.com/learn', tag: 'FREE COURSE' },
      ],
    },
  };
}
const SECTION_ORDER: SectionKey[] = ['launch', 'strike', 'roomread', 'ratecard', 'zerocommute', 'compound', 'aileverage'];

// ── Market Value Teaser (free users) ─────────────────────────────────────────
function MarketValueTeaser({ lang = 'EN', isLoggedIn = false }: { lang?: string; isLoggedIn?: boolean }) {
  const tt = T[lang as keyof typeof T] || T.EN;
  const [role, setRole] = useState<RoleKey>('backend');
  const [country, setCountry] = useState<CountryCode>('BR');
  const [yearsExp, setYearsExp] = useState(4);
  const [shown, setShown] = useState(false);
  // Email gate — auto-unlock for logged-in users
  const [email, setEmail] = useState('');
  const [captured, setCaptured] = useState(() => isLoggedIn);
  const [capturing, setCapturing] = useState(false);
  // If user logs in while component is mounted, unlock immediately
  React.useEffect(() => { if (isLoggedIn) setCaptured(true); }, [isLoggedIn]);

  const ROLE_OPTS: Record<string, { value: RoleKey; label: string }[]> = {
    EN: [
      { value: 'ai_ml', label: 'AI / ML Engineer' }, { value: 'llm', label: 'LLM Engineer' },
      { value: 'data', label: 'Data Scientist' }, { value: 'backend', label: 'Backend Engineer' },
      { value: 'frontend', label: 'Frontend Engineer' }, { value: 'fullstack', label: 'Full Stack' },
      { value: 'devops', label: 'DevOps / SRE' }, { value: 'product', label: 'Product Manager' },
      { value: 'data_eng', label: 'Data Engineer' }, { value: 'eng_manager', label: 'Eng. Manager' },
    ],
    ES: [
      { value: 'ai_ml', label: 'Ing. IA / ML' }, { value: 'llm', label: 'Ing. LLM' },
      { value: 'data', label: 'Científico de Datos' }, { value: 'backend', label: 'Ing. Backend' },
      { value: 'frontend', label: 'Ing. Frontend' }, { value: 'fullstack', label: 'Full Stack' },
      { value: 'devops', label: 'DevOps / SRE' }, { value: 'product', label: 'Product Manager' },
      { value: 'data_eng', label: 'Ing. de Datos' }, { value: 'eng_manager', label: 'Gerente de Ing.' },
    ],
    PT: [
      { value: 'ai_ml', label: 'Eng. IA / ML' }, { value: 'llm', label: 'Eng. LLM' },
      { value: 'data', label: 'Cientista de Dados' }, { value: 'backend', label: 'Eng. Backend' },
      { value: 'frontend', label: 'Eng. Frontend' }, { value: 'fullstack', label: 'Full Stack' },
      { value: 'devops', label: 'DevOps / SRE' }, { value: 'product', label: 'Product Manager' },
      { value: 'data_eng', label: 'Eng. de Dados' }, { value: 'eng_manager', label: 'Gerente de Eng.' },
    ],
  };
  const roleOpts = ROLE_OPTS[lang] || ROLE_OPTS.EN;

  const COUNTRY_OPTS: { value: CountryCode; flag: string; label: string }[] = [
    { value: 'BR', flag: '🇧🇷', label: 'Brasil / Brazil' }, { value: 'MX', flag: '🇲🇽', label: 'México / Mexico' },
    { value: 'CO', flag: '🇨🇴', label: 'Colombia' }, { value: 'AR', flag: '🇦🇷', label: 'Argentina' },
    { value: 'CL', flag: '🇨🇱', label: 'Chile' },
  ];

  const preview = computeMarketValue({
    role, country, yearsExp,
    englishLevel: 'conversational' as EnglishLevel,
    skills: [], hasRemoteExp: false, hasPortfolio: false,
  }, lang as 'EN' | 'ES' | 'PT');

  const fmt = (n: number) => '$' + n.toLocaleString();

  async function captureEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email || capturing) return;
    setCapturing(true);
    try {
      await Promise.allSettled([
        fetch('https://leads.wprotalents.lat/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, role, country, yearsExp, source: 'market-value-teaser' }),
        }),
        fetch('/api/subscribe-newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }),
      ]);
    } finally {
      setCaptured(true);
      setCapturing(false);
    }
  }

  return (
    <div className="border-b border-border bg-surface/30">
      <div className="px-6 md:px-10 py-6 max-w-7xl mx-auto">
        <div className="border border-accent/20 bg-accent/5">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-accent/10">
            <BarChart2 size={12} className="text-accent" />
            <span className="mono text-[9px] font-bold text-accent tracking-widest">{tt.teaserBadge}</span>
            <div className="h-px flex-1 bg-accent/10" />
            <span className="mono text-[7px] text-text/30">{tt.teaserFullDash}</span>
          </div>

          <div className="p-5">
            {/* Quick inputs */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div>
                <label className="mono text-[7px] text-text/30 block mb-1">{tt.teaserRole}</label>
                <select value={role} onChange={e => { setRole(e.target.value as RoleKey); setShown(false); }}
                  className="w-full bg-bg border border-border px-2 py-2 mono text-[10px] focus:outline-none focus:border-accent/50 transition-colors">
                  {roleOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mono text-[7px] text-text/30 block mb-1">{tt.teaserCountry}</label>
                <select value={country} onChange={e => { setCountry(e.target.value as CountryCode); setShown(false); }}
                  className="w-full bg-bg border border-border px-2 py-2 mono text-[10px] focus:outline-none focus:border-accent/50 transition-colors">
                  {COUNTRY_OPTS.map(o => <option key={o.value} value={o.value}>{o.flag} {o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mono text-[7px] text-text/30 block mb-1">{tt.teaserYearsExp}</label>
                <input type="number" min={0} max={30} value={yearsExp}
                  onChange={e => { setYearsExp(Number(e.target.value)); setShown(false); }}
                  className="w-full bg-bg border border-border px-2 py-2 mono text-[10px] focus:outline-none focus:border-accent/50 transition-colors" />
              </div>
            </div>

            <button
              onClick={() => setShown(true)}
              className="w-full py-2.5 bg-accent text-black mono text-[9px] font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mb-4"
            >
              <BarChart2 size={11} /> {tt.teaserCalculate}
            </button>

            <AnimatePresence>
              {shown && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {/* Market mid — local free, remote gated */}
                  <div className="grid grid-cols-2 gap-px bg-border">
                    <div className="bg-bg p-4 text-center">
                      <p className="mono text-[7px] text-text/30 mb-1">{tt.teaserLocalMid}</p>
                      <p className="text-xl font-black text-text">{fmt(preview.marketMid)}</p>
                      <p className="mono text-[7px] text-text/20 mt-0.5">{preview.seniorityLabel} · {tt.teaserPerYear}</p>
                    </div>
                    {captured ? (
                      <div className="bg-accent/5 p-4 text-center">
                        <p className="mono text-[7px] text-accent mb-1">{tt.teaserRemote}</p>
                        <p className="text-xl font-black text-accent">{fmt(preview.remoteMid)}</p>
                        <p className="mono text-[7px] text-text/20 mt-0.5">+{preview.remoteUplift}% {tt.teaserUplift}</p>
                      </div>
                    ) : (
                      <div className="bg-accent/5 p-4 flex flex-col items-center justify-center gap-2 relative">
                        {/* Blurred remote value behind the gate */}
                        <p className="mono text-[7px] text-accent mb-0.5">{tt.teaserRemote}</p>
                        <p className="text-xl font-black text-accent opacity-20 blur-[5px] select-none">{fmt(preview.remoteMid)}</p>
                        <form onSubmit={captureEmail} className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-3">
                          <Mail size={11} className="text-accent" />
                          <p className="mono text-[7px] text-text/50 text-center leading-tight">Enter email to unlock</p>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full bg-bg border border-accent/40 px-2 py-1 mono text-[9px] focus:outline-none focus:border-accent text-center placeholder:text-text/20"
                          />
                          <button
                            type="submit"
                            disabled={capturing}
                            className="w-full py-1 bg-accent text-black mono text-[8px] font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-1 disabled:opacity-50"
                          >
                            {capturing ? <Loader2 size={9} className="animate-spin" /> : <><ChevronRight size={9} /> {lang === 'PT' ? 'VER SALÁRIO' : lang === 'ES' ? 'VER SALARIO' : 'SEE REMOTE'}</>}
                          </button>
                        </form>
                      </div>
                    )}
                  </div>

                  {/* Locked sections */}
                  <div className="relative">
                    <div className="grid grid-cols-3 gap-px bg-border opacity-30 blur-[2px] pointer-events-none select-none">
                      {tt.teaserLockedSections.map((label: string) => (
                        <div key={label} className="bg-surface p-4 text-center">
                          <p className="mono text-[7px] text-text/30 mb-1">{label.toUpperCase()}</p>
                          <p className="text-lg font-black text-text">$••,•••</p>
                        </div>
                      ))}
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <Lock size={16} className="text-accent" />
                      <p className="mono text-[8px] font-bold text-text">{tt.teaserLockedLabel}</p>
                      <a
                        href="/members"
                        className="mono text-[8px] bg-accent text-black px-4 py-1.5 font-bold hover:opacity-90 transition-opacity flex items-center gap-1"
                      >
                        {tt.teaserUnlock} <ChevronRight size={9} />
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Teleport: LATAM City Quality-of-Life Widget ─────────────────────────────
interface CityScore { name: string; flag: string; slug: string; overall: number; tech: number; cost: number; safety: number; }

const LATAM_CITIES = [
  { name: 'Medellín',    flag: '🇨🇴', slug: 'medellin'      },
  { name: 'Bogotá',      flag: '🇨🇴', slug: 'bogota'        },
  { name: 'São Paulo',   flag: '🇧🇷', slug: 'sao-paulo'     },
  { name: 'Buenos Aires',flag: '🇦🇷', slug: 'buenos-aires'  },
  { name: 'Mexico City', flag: '🇲🇽', slug: 'mexico-city'   },
  { name: 'Lima',        flag: '🇵🇪', slug: 'lima'          },
  { name: 'Santiago',    flag: '🇨🇱', slug: 'santiago'      },
  { name: 'Montevideo',  flag: '🇺🇾', slug: 'montevideo'    },
];

function LatamCitiesWidget({ lang = 'EN' }: { lang?: string }) {
  const [cities, setCities] = React.useState<CityScore[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  const labels: Record<string, { title: string; tech: string; cost: string; safety: string; overall: string }> = {
    EN: { title: 'LATAM TECH HUBS · QUALITY OF LIFE', tech: 'Tech', cost: 'Affordability', safety: 'Safety', overall: 'Score' },
    ES: { title: 'HUBS TECH LATAM · CALIDAD DE VIDA',  tech: 'Tech', cost: 'Costo', safety: 'Seguridad', overall: 'Score' },
    PT: { title: 'HUBS TECH LATAM · QUALIDADE DE VIDA', tech: 'Tech', cost: 'Custo', safety: 'Segurança', overall: 'Score' },
  };
  const lb = labels[lang] || labels.EN;

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const results = await Promise.allSettled(
          LATAM_CITIES.map(c =>
            fetch(`https://api.teleport.org/api/urban_areas/slug:${c.slug}/scores/`)
              .then(r => r.ok ? r.json() : null)
              .then(d => {
                if (!d) return null;
                const cats = d.categories || [];
                const get = (name: string) => {
                  const cat = cats.find((x: any) => x.name.toLowerCase().includes(name));
                  return cat ? Math.round(cat.score_out_of_10 * 10) : 0;
                };
                return {
                  name: c.name, flag: c.flag, slug: c.slug,
                  overall: Math.round((d.teleport_city_score || 0)),
                  tech: get('startup'),
                  cost: get('cost'),
                  safety: get('safety'),
                } as CityScore;
              })
          )
        );
        if (cancelled) return;
        const built = results
          .filter(r => r.status === 'fulfilled' && r.value)
          .map(r => (r as PromiseFulfilledResult<CityScore | null>).value!)
          .sort((a, b) => b.overall - a.overall);
        setCities(built);
      } catch { setError(true); }
      finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (error || (!loading && cities.length === 0)) return null;

  return (
    <section className="border-b border-border bg-bg px-6 md:px-10 py-8 max-w-7xl mx-auto w-full">
      <div className="mono text-[9px] text-text/40 mb-4 flex items-center gap-2">
        <Globe size={10} className="text-accent" /> {lb.title}
      </div>
      {loading ? (
        <div className="flex gap-2">{[...Array(4)].map((_, i) => <div key={i} className="h-24 flex-1 bg-surface border border-border animate-pulse" />)}</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {cities.slice(0, 8).map(city => (
            <div key={city.slug} className="bg-surface border border-border p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[8px] font-bold text-text/80">{city.flag} {city.name}</span>
                <span className="mono text-[8px] font-black text-accent">{city.overall}<span className="text-text/30">/100</span></span>
              </div>
              <div className="space-y-1">
                {[
                  { label: lb.tech, val: city.tech },
                  { label: lb.cost, val: city.cost },
                  { label: lb.safety, val: city.safety },
                ].map(row => (
                  <div key={row.label} className="flex items-center gap-1">
                    <span className="mono text-[7px] text-text/30 w-16 shrink-0">{row.label}</span>
                    <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-accent/60 rounded-full" style={{ width: `${row.val}%` }} />
                    </div>
                    <span className="mono text-[7px] text-text/50 w-5 text-right">{row.val}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function CandidateResourcesPanel({ onLinkedInBoost, lang = 'EN' }: { onLinkedInBoost: () => void; lang?: string }) {
  const [activeSection, setActiveSection] = useState<SectionKey>('launch');
  const portalSections = getPortalSections(lang);
  const section = portalSections[activeSection];
  const isES = lang === 'ES';
  const isPT = lang === 'PT';

  return (
    <section className="border-b border-border bg-surface/20">
      <div className="px-6 md:px-10 pt-8 pb-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <Radio size={10} className="text-accent animate-pulse" />
          <span className="mono text-[9px] text-accent tracking-widest font-bold">
            {isPT ? 'INTELIGÊNCIA PARA CANDIDATOS // PORTAL WPRO' : isES ? 'INTELIGENCIA PARA CANDIDATOS // PORTAL WPRO' : 'CANDIDATE INTELLIGENCE // WPRO CAREER PORTAL'}
          </span>
          <div className="h-px flex-1 bg-border" />
          <a
            href="https://wprotalents.lat"
            target="_blank"
            rel="noopener noreferrer"
            className="mono text-[8px] text-text/30 hover:text-accent transition-colors flex items-center gap-1"
          >
            wprotalents.lat <ArrowUpRight size={8} />
          </a>
        </div>

        {/* Stats + Join CTA strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-border mb-6">
          {[
            { icon: <Users size={10} />, value: '23K+', label: isPT ? 'Rede' : isES ? 'Red' : 'Network' },
            { icon: <Award size={10} />, value: '500+', label: isPT ? 'Colocados' : isES ? 'Colocados' : 'Placed' },
            { icon: <Globe size={10} />, value: '12', label: isPT ? 'Países' : isES ? 'Países' : 'Countries' },
            { icon: <Star size={10} />, value: '20yr', label: isPT ? 'Experiência' : isES ? 'Experiencia' : 'Experience' },
          ].map((s, i) => (
            <div key={i} className="bg-bg px-4 py-3 flex items-center gap-3">
              <span className="text-accent">{s.icon}</span>
              <span className="text-lg font-black text-accent">{s.value}</span>
              <span className="mono text-[8px] text-text/30 uppercase tracking-widest">{s.label}</span>
            </div>
          ))}
          {/* Get featured CTA as 5th stat */}
          <button
            onClick={onLinkedInBoost}
            className="bg-accent/10 border-l border-accent/20 px-4 py-3 flex items-center gap-2 hover:bg-accent/20 transition-colors group col-span-2 sm:col-span-1"
          >
            <Linkedin size={12} className="text-[#0077B5] shrink-0" />
            <div className="text-left">
              <div className="mono text-[8px] font-bold text-accent group-hover:text-accent">{isPT ? 'SER DESTAQUE' : isES ? 'DESTACARSE' : 'GET FEATURED'}</div>
              <div className="mono text-[7px] text-text/30">{isPT ? 'Grátis · 48h' : isES ? 'Gratis · 48h' : 'Free · 48h'}</div>
            </div>
            <ArrowUpRight size={9} className="text-accent ml-auto" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar mb-6 pb-1">
          {SECTION_ORDER.map(key => {
            const s = portalSections[key];
            const isActive = activeSection === key;
            return (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`flex items-center gap-2 px-3 py-2 mono text-[8px] font-bold border whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? `${s.accent} border-transparent`
                    : 'bg-bg border-border text-text/30 hover:text-text/60 hover:border-text/20'
                }`}
              >
                <s.Icon size={10} />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Section content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* Section header */}
            <div className="flex items-center gap-3 mb-4">
              <span className={`mono text-[8px] font-bold ${section.color}`}>{section.tag}</span>
              <span className="mono text-[9px] text-text/30">{section.desc}</span>
            </div>

            {/* Articles grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {section.articles.map((a, i) => (
                <motion.a
                  key={i}
                  href={a.url === '#linkedin-boost' ? undefined : a.url}
                  onClick={a.url === '#linkedin-boost' ? (e) => { e.preventDefault(); onLinkedInBoost(); } : undefined}
                  target={a.url === '#linkedin-boost' ? undefined : '_blank'}
                  rel={a.url === '#linkedin-boost' ? undefined : 'noopener noreferrer'}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`group border bg-bg hover:border-accent/30 p-4 flex flex-col gap-2 transition-colors cursor-pointer ${
                    a.wpro ? 'border-accent/20 bg-accent/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`mono text-[7px] font-bold ${a.wpro ? 'text-accent' : section.color}`}>{a.tag}</span>
                    {a.wpro && (
                      <span className="mono text-[6px] bg-accent text-black px-1.5 py-0.5 font-black">WPRO</span>
                    )}
                  </div>
                  <p className="text-xs font-bold leading-snug group-hover:text-accent transition-colors flex-1">
                    {a.title}
                  </p>
                  <p className="mono text-[9px] text-text/40 leading-snug line-clamp-2">
                    {a.desc}
                  </p>
                  <span className="mono text-[7px] text-text/20 group-hover:text-accent transition-colors flex items-center gap-1 mt-1">
                    {a.url === '#linkedin-boost' ? 'SUBMIT' : 'READ'} <ArrowUpRight size={8} />
                  </span>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Career signal strip */}
        <div className="mt-6 border border-border bg-bg p-4">
          <div className="mono text-[8px] text-accent font-bold mb-3 flex items-center gap-2">
            <Lightbulb size={9} /> {isPT ? 'SINAL DE CARREIRA // INTEL SEMANAL WPRO' : isES ? 'SEÑAL DE CARRERA // INTEL SEMANAL WPRO' : 'CAREER SIGNAL // WPRO WEEKLY INTEL'}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(isPT ? [
              { icon: <TrendingUp size={11} className="text-accent shrink-0 mt-0.5" />, tip: 'Adicione IA / ML ao seu LinkedIn — buscas por "prompt engineering" cresceram 400% YoY entre recrutadores dos EUA e Europa.' },
              { icon: <Globe size={11} className="text-emerald-400 shrink-0 mt-0.5" />, tip: 'Vagas remotas em USD/EUR pagam 3–5× os salários locais para engenheiros sênior da LATAM. Priorize empresas globais.' },
              { icon: <Target size={11} className="text-blue-400 shrink-0 mt-0.5" />, tip: 'Recrutadores gastam ~7 segundos em um currículo. Comece com impacto mensurável, não funções. Números > tudo.' },
              { icon: <TrendingDown size={11} className="text-red-400 shrink-0 mt-0.5" />, tip: 'Cargos mais em risco com IA: QA manual, entrada de dados, redação básica e frontend júnior (WEF 2026).' },
            ] : isES ? [
              { icon: <TrendingUp size={11} className="text-accent shrink-0 mt-0.5" />, tip: 'Agrega IA / ML a tu LinkedIn — las búsquedas de "prompt engineering" subieron 400% YoY entre reclutadores de EE.UU. y Europa.' },
              { icon: <Globe size={11} className="text-emerald-400 shrink-0 mt-0.5" />, tip: 'Los roles remotos en USD/EUR pagan 3–5× los salarios locales para ingenieros sénior de LATAM. Prioriza empresas globales.' },
              { icon: <Target size={11} className="text-blue-400 shrink-0 mt-0.5" />, tip: 'Los reclutadores dedican ~7 segundos a un currículum. Empieza con impacto medible, no funciones. Números > todo.' },
              { icon: <TrendingDown size={11} className="text-red-400 shrink-0 mt-0.5" />, tip: 'Roles más en riesgo por IA: QA manual, entrada de datos, redacción básica y frontend junior (WEF 2026).' },
            ] : [
              { icon: <TrendingUp size={11} className="text-accent shrink-0 mt-0.5" />, tip: 'Add AI / ML to your LinkedIn — searches for "prompt engineering" are up 400% YoY among US & EU recruiters.' },
              { icon: <Globe size={11} className="text-emerald-400 shrink-0 mt-0.5" />, tip: 'USD/EUR remote roles pay 3–5× local rates for senior LATAM engineers. Prioritise global-first companies.' },
              { icon: <Target size={11} className="text-blue-400 shrink-0 mt-0.5" />, tip: 'Recruiters spend ~7 seconds on a resume. Lead with measurable impact, not duties. Numbers > everything.' },
              { icon: <TrendingDown size={11} className="text-red-400 shrink-0 mt-0.5" />, tip: 'Roles most at risk from AI: manual QA, data entry, basic content writing, and junior frontend (2026 WEF).' },
            ]).map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                {tip.icon}
                <p className="mono text-[9px] text-text/50 leading-relaxed">{tip.tip}</p>
              </div>
            ))}
          </div>

          {/* Newsletter CTA */}
          <div className="mt-4 pt-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Newspaper size={11} className="text-accent" />
              <p className="mono text-[9px] text-text/50">
                {isPT ? <><span>Receba essa intel semanalmente — </span><span className="text-accent font-bold">Workforce Daily</span><span> by WProTalents. Grátis.</span></> : isES ? <><span>Recibe esta intel semanalmente — </span><span className="text-accent font-bold">Workforce Daily</span><span> by WProTalents. Gratis.</span></> : <>Get this intel weekly — <span className="text-accent font-bold">Workforce Daily</span> by WProTalents. Free.</>}
              </p>
            </div>
            <a
              href="https://wprotalents.lat"
              className="mono text-[8px] font-bold border border-accent text-accent px-4 py-1.5 hover:bg-accent hover:text-black transition-colors whitespace-nowrap flex items-center gap-1.5"
            >
              <Mail size={9} /> {isPT ? 'ASSINAR GRÁTIS →' : isES ? 'SUSCRIBIRSE GRATIS →' : 'SUBSCRIBE FREE →'}
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}

// ── Job portal ────────────────────────────────────────────────────────────────
function JobPortal({ lang, t, onPostVacancy }: { lang: string; t: typeof T.EN; onPostVacancy: () => void }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('All');
  const [page, setPage] = useState(1);
  const PAGE = 30;
  const [showLinkedIn, setShowLinkedIn] = useState(false);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [matchPrefs, setMatchPrefs] = useState<MatchPrefs>(() => {
    try { return JSON.parse(localStorage.getItem(MATCH_KEY) || '{}'); } catch { return {}; }
  });
  const [matchOpen, setMatchOpen] = useState(true);

  const saveMatchPrefs = (prefs: MatchPrefs) => {
    setMatchPrefs(prefs);
    localStorage.setItem(MATCH_KEY, JSON.stringify(prefs));
  };

  const normalizeRegion = (loc: string) => {
    const l = loc.toLowerCase();
    if (['brazil','mexico','colombia','argentina','chile','peru','latam'].some(x => l.includes(x))) return 'LATAM';
    if (['us','usa','united states','new york','california','texas','miami'].some(x => l.includes(x))) return 'USA';
    if (['uk','germany','france','spain','netherlands','europe'].some(x => l.includes(x))) return 'Europe';
    return 'Worldwide';
  };

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const results = await Promise.allSettled([
        // Remotive
        fetch('https://remotive.com/api/remote-jobs?limit=50').then(r => r.json()).then(d =>
          (d.jobs || []).map((j: any) => ({ id: `remotive-${j.id}`, title: j.title, company: j.company_name,
            location: j.candidate_required_location || 'Remote', url: j.url, salary: j.salary || null,
            tags: j.category, source: 'Remotive', region: normalizeRegion(j.candidate_required_location || 'Remote'),
            postedAt: j.publication_date }))),
        // Arbeitnow
        fetch('https://www.arbeitnow.com/api/job-board-api').then(r => r.json()).then(d =>
          (d.data || []).map((j: any) => ({ id: `arbeitnow-${j.slug}`, title: j.title, company: j.company_name,
            location: j.location || 'Remote', url: j.url, salary: null, tags: (j.tags || []).join(', '),
            source: 'Arbeitnow', region: normalizeRegion(j.location || 'Remote'), postedAt: j.created_at }))),
        // Jobicy
        fetch('https://jobicy.com/api/v2/remote-jobs?count=50').then(r => r.json()).then(d =>
          (d.jobs || []).map((j: any) => ({ id: `jobicy-${j.id}`, title: j.jobTitle, company: j.companyName,
            location: 'Remote', url: j.url, salary: j.salary ? `${j.salaryCurrency} ${j.salaryMin}–${j.salaryMax}` : null,
            tags: (j.tags || []).join(', '), source: 'Jobicy', region: 'Worldwide', postedAt: j.publishedDate }))),
        // GraphQL Jobs — remote tech roles, free, no auth
        fetch('https://api.graphql.jobs/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: `{ jobs(input:{types:[FULL_TIME],remotes:[{type:FULLY_REMOTE}]}) { id title applyUrl commitment { title } company { name } cities { name country { name isoCode } } tags { name } createdAt } }` }),
        }).then(r => r.json()).then(d =>
          ((d.data?.jobs) || []).map((j: any) => {
            const country = j.cities?.[0]?.country?.isoCode || 'WW';
            const loc = j.cities?.[0] ? `${j.cities[0].name}, ${j.cities[0].country?.name || ''}` : 'Remote';
            const latamCodes = ['BR','MX','CO','AR','CL','PE','VE','EC','UY','PY','BO'];
            const region = latamCodes.includes(country) ? 'LATAM' : ['US','CA'].includes(country) ? 'USA' : ['GB','DE','FR','ES','NL','PT','IT','SE','PL'].includes(country) ? 'Europe' : 'Worldwide';
            return { id: `gqljobs-${j.id}`, title: j.title, company: j.company?.name || '', location: loc,
              url: j.applyUrl || '', salary: null, tags: (j.tags || []).map((t: any) => t.name).join(', '),
              source: 'GraphQL.jobs', region, postedAt: j.createdAt };
          })),
      ]);
      const all: any[] = [];
      results.forEach(r => { if (r.status === 'fulfilled') all.push(...r.value); });
      const unique = Array.from(new Map(all.map(j => [j.id, j])).values());
      unique.sort((a, b) => (b.postedAt || '').localeCompare(a.postedAt || ''));
      setJobs(unique);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [lang]);
  useEffect(() => { setPage(1); }, [search, region]);

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const regionCounts = REGIONS.reduce((a, r) => {
    a[r] = r === 'All' ? jobs.length : jobs.filter(j => j.region === r).length;
    return a;
  }, {} as Record<string, number>);

  const filtered = jobs.filter(j => {
    const hay = `${j.title} ${j.company} ${j.tags} ${j.location}`.toLowerCase();
    const matchSearch = !search || search.toLowerCase().split(' ').every(w => hay.includes(w));
    const matchRegion = region === 'All' || j.region === region;
    return matchSearch && matchRegion;
  });

  const shown = filtered.slice(0, page * PAGE);
  const hasMore = shown.length < filtered.length;

  // ── Smart match scoring ───────────────────────────────────────────────────
  const hasPrefs = matchPrefs.roleType || matchPrefs.seniority || matchPrefs.region;
  const topMatches = hasPrefs ? (() => {
    const roleKw: Record<string, string[]> = {
      'Software Engineer': ['engineer', 'developer', 'software', 'backend', 'frontend', 'fullstack', 'full stack', 'full-stack'],
      'Data':              ['data', 'analyst', 'scientist', 'analytics', 'bi ', 'business intelligence'],
      'DevOps':            ['devops', 'sre', 'infrastructure', 'cloud', 'aws', 'platform', 'reliability'],
      'Design':            ['design', 'ux', 'ui ', 'product design', 'figma'],
      'Product':           ['product manager', 'product owner', 'pm ', 'p.m.'],
      'Marketing':         ['marketing', 'growth', 'content', 'seo', 'paid'],
      'AI / ML':           ['ai ', 'ml ', 'machine learning', 'llm', 'deep learning', 'nlp', 'pytorch', 'tensorflow'],
    };
    const seniorKw: Record<string, string[]> = {
      'Junior':  ['junior', 'jr.', 'jr ', 'entry', 'associate', 'graduate'],
      'Mid':     ['mid', 'intermediate', 'ii ', 'level 2', 'iii '],
      'Senior':  ['senior', 'sr.', 'sr ', 'staff', 'principal'],
      'Lead':    ['lead', 'manager', 'head of', 'director', 'vp '],
    };
    return jobs
      .map(j => {
        const hay = `${j.title} ${j.tags} ${j.location}`.toLowerCase();
        let score = 0;
        if (matchPrefs.roleType) {
          const kws = roleKw[matchPrefs.roleType] ?? [];
          if (kws.some(k => hay.includes(k))) score += 3;
        }
        if (matchPrefs.seniority) {
          const kws = seniorKw[matchPrefs.seniority] ?? [];
          if (kws.some(k => hay.includes(k))) score += 2;
        }
        if (matchPrefs.region && matchPrefs.region !== 'Worldwide') {
          if (j.region === matchPrefs.region) score += 2;
        } else if (matchPrefs.region === 'Worldwide') {
          score += 1;
        }
        return { job: j, score };
      })
      .filter(x => x.score >= 3)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(x => x.job);
  })() : [];

  return (
    <section className="px-6 md:px-10 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Briefcase size={10} className="text-text/30" />
        <span className="mono text-[9px] text-text/40 tracking-widest font-bold">{t.candidateBadge}</span>
        <div className="h-px flex-1 bg-border" />
        {!loading && (
          <span className="mono text-[8px] text-text/20">
            <span className="text-accent font-bold">{filtered.length}</span> {t.roles}
            {jobs.length > 0 && <span className="text-text/10 ml-1">of {jobs.length} total</span>}
          </span>
        )}
        <button onClick={load} className="text-text/20 hover:text-accent transition-colors ml-1" title="Refresh">
          <RefreshCw size={11} />
        </button>
      </div>

      <p className="mono text-[9px] text-text/25 mb-4">{t.candidateDesc}</p>

      {/* LinkedIn Boost CTA — enhanced */}
      <div className="mb-5 border border-[#0077B5]/30 bg-[#0077B5]/5">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 bg-[#0077B5]/10 flex items-center justify-center shrink-0">
            <Linkedin size={16} className="text-[#0077B5]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="mono text-[9px] font-bold text-text/70">
              Get featured to <span className="text-[#0077B5]">23K+ US & EU hiring managers</span>
            </p>
            <p className="mono text-[8px] text-text/30 mt-0.5">WProTalents posts your profile on LinkedIn · Free · Within 48h · No recruiter fees</p>
          </div>
          <button
            onClick={() => setShowLinkedIn(true)}
            className="mono text-[8px] font-bold bg-[#0077B5] text-white px-4 py-2 hover:opacity-90 transition-opacity whitespace-nowrap flex items-center gap-1.5"
          >
            GET FEATURED <ArrowUpRight size={9} />
          </button>
        </div>
      </div>

      {/* ── Quick Match bar ─────────────────────────────────────── */}
      <div className="border border-border bg-surface/30 p-3 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={10} className="text-accent" />
          <span className="mono text-[9px] font-bold text-accent tracking-widest uppercase">{t.matchTitle}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {/* Role Type */}
          <div>
            <label className="mono text-[7px] text-text/30 uppercase tracking-widest block mb-1">{t.matchRoleType}</label>
            <select
              value={matchPrefs.roleType || ''}
              onChange={e => saveMatchPrefs({ ...matchPrefs, roleType: e.target.value })}
              className="w-full bg-bg border border-border px-2 py-1.5 mono text-[10px] focus:outline-none focus:border-accent/40 transition-colors text-text"
            >
              <option value="">Any</option>
              {MATCH_ROLE_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {/* Seniority */}
          <div>
            <label className="mono text-[7px] text-text/30 uppercase tracking-widest block mb-1">{t.matchSeniority}</label>
            <select
              value={matchPrefs.seniority || ''}
              onChange={e => saveMatchPrefs({ ...matchPrefs, seniority: e.target.value })}
              className="w-full bg-bg border border-border px-2 py-1.5 mono text-[10px] focus:outline-none focus:border-accent/40 transition-colors text-text"
            >
              <option value="">Any</option>
              {MATCH_SENIORITIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {/* Region */}
          <div>
            <label className="mono text-[7px] text-text/30 uppercase tracking-widest block mb-1">{t.matchRegion}</label>
            <select
              value={matchPrefs.region || ''}
              onChange={e => saveMatchPrefs({ ...matchPrefs, region: e.target.value })}
              className="w-full bg-bg border border-border px-2 py-1.5 mono text-[10px] focus:outline-none focus:border-accent/40 transition-colors text-text"
            >
              <option value="">Any</option>
              {MATCH_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Top 10 matches ───────────────────────────────────────── */}
      {hasPrefs && topMatches.length >= 3 && (
        <div className="border border-accent/20 bg-accent/5 mb-5">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-accent/10">
            <Star size={10} className="text-accent" />
            <span className="mono text-[9px] font-bold text-accent tracking-widest uppercase flex-1">{t.matchTopPicks}</span>
            <button onClick={() => setMatchOpen(v => !v)} className="mono text-[8px] text-text/30 hover:text-accent transition-colors">
              {matchOpen ? t.matchCollapse : t.matchExpand}
            </button>
          </div>
          {matchOpen && (
            <div className="divide-y divide-accent/10">
              {topMatches.map(job => (
                <a key={job.id} href={job.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-start gap-3 px-4 py-3 hover:bg-accent/5 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="mono text-[7px] font-bold text-accent bg-accent/10 px-1.5 py-0.5">{t.matchBadge}</span>
                      <h4 className="mono text-[10px] font-bold text-text group-hover:text-accent transition-colors truncate">{job.title}</h4>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="mono text-[8px] text-text/40">{job.company}</span>
                      {job.location && <span className="mono text-[8px] text-text/30">· {job.location}</span>}
                      {job.salary && <span className="mono text-[8px] text-green-400/70">· {job.salary}</span>}
                    </div>
                  </div>
                  <ExternalLink size={10} className="text-text/20 group-hover:text-accent shrink-0 mt-1 transition-colors" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
      {hasPrefs && topMatches.length < 3 && !loading && (
        <p className="mono text-[8px] text-text/30 mb-4">{t.matchEmpty}</p>
      )}

      {/* Quick filters */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {QUICK_FILTERS.map(qf => (
          <button
            key={qf}
            onClick={() => setSearch(s => s === qf ? '' : qf)}
            className={`mono text-[8px] px-2.5 py-1 border transition-all ${
              search === qf
                ? 'bg-accent text-black border-accent font-bold'
                : 'border-border text-text/30 hover:border-text/30 hover:text-text/60'
            }`}
          >
            {qf}
          </button>
        ))}
        {search && !QUICK_FILTERS.includes(search) && (
          <button onClick={() => setSearch('')} className="mono text-[8px] px-2.5 py-1 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all">
            ✕ clear
          </button>
        )}
        {saved.size > 0 && (
          <span className="mono text-[8px] px-2.5 py-1 border border-accent/20 text-accent/60">
            <BookmarkCheck size={9} className="inline mr-1" />{saved.size} saved
          </span>
        )}
      </div>

      {/* Search + region row */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <div className="relative flex-1">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-text/20" />
          <input
            type="text"
            placeholder={t.search}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface border border-border pl-9 pr-4 py-2.5 mono text-[11px] text-text placeholder:text-text/20 focus:outline-none focus:border-accent/40 transition-colors"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {REGIONS.map(r => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`px-3 py-2.5 mono text-[8px] border whitespace-nowrap transition-all flex items-center gap-1 ${
                region === r
                  ? 'bg-accent text-black border-accent font-bold'
                  : 'bg-surface text-text/30 border-border hover:text-text/60 hover:border-text/20'
              }`}
            >
              {r}
              <span className={region === r ? 'text-black/50' : 'text-text/15'}>
                {regionCounts[r] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <Loader2 size={24} className="animate-spin text-accent" />
          <p className="mono text-[9px] text-text/20">{t.loading}</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-16 border border-dashed border-red-500/20">
          <AlertCircle size={20} className="text-red-500/50" />
          <p className="mono text-[9px] text-red-400">{t.error}</p>
          <button onClick={load} className="mono text-[8px] border border-border px-4 py-2 hover:border-accent hover:text-accent transition-colors">
            {t.retry}
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            <AnimatePresence mode="popLayout">
              {shown.map((job, idx) => {
                const ago = timeAgo(job.postedAt);
                const rs = REGION_STYLE[job.region] || 'text-text/30 border-text/10';
                const isSaved = saved.has(job.id);
                return (
                  <motion.a
                    key={job.id}
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.015, 0.3) }}
                    className="group border border-border bg-surface hover:border-accent/40 hover:bg-surface/80 transition-colors flex flex-col cursor-pointer relative"
                  >
                    {/* Save button */}
                    <button
                      onClick={(e) => toggleSave(job.id, e)}
                      className={`absolute top-3 right-3 z-10 transition-colors ${isSaved ? 'text-accent' : 'text-text/10 group-hover:text-text/30 hover:!text-accent'}`}
                      title={isSaved ? 'Saved' : 'Save job'}
                    >
                      {isSaved ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
                    </button>

                    <div className="p-4 flex flex-col flex-1 gap-2">
                      <div className="flex items-center justify-between pr-5">
                        <span className={`mono text-[7px] border px-1.5 py-0.5 ${rs}`}>{job.region}</span>
                        {ago && <span className="mono text-[7px] text-text/15 flex items-center gap-0.5"><Clock size={7} />{ago}</span>}
                      </div>
                      <div className="mono text-[8px] text-accent/60 truncate flex items-center gap-1 pr-5">
                        <Building2 size={8} className="shrink-0" />{job.company}
                      </div>
                      <h3 className="text-xs font-bold leading-snug line-clamp-2 group-hover:text-accent transition-colors flex-1 pr-5">
                        {job.title}
                      </h3>
                      <div className="mono text-[8px] text-text/25 flex items-center gap-1 truncate">
                        <MapPin size={8} className="shrink-0" />{job.location}
                      </div>
                      {job.salary && <div className="mono text-[8px] text-accent/70 font-bold">{job.salary}</div>}
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5 border-t border-text/5">
                      <span className="mono text-[7px] text-text/10">{t.via} {job.source}</span>
                      <span className="mono text-[8px] font-bold flex items-center gap-1 text-text/30 group-hover:text-accent transition-colors">
                        {t.apply} <ExternalLink size={8} />
                      </span>
                    </div>
                  </motion.a>
                );
              })}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && !loading && (
            <div className="text-center py-16 border border-dashed border-border">
              <p className="mono text-[10px] text-text/20">{t.noJobs}</p>
            </div>
          )}

          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setPage(p => p + 1)}
                className="mono text-[9px] border border-border px-8 py-3 text-text/30 hover:border-accent hover:text-accent transition-colors"
              >
                {t.loadMore} · {filtered.length - shown.length} remaining
              </button>
            </div>
          )}

          {/* Bottom CTA after jobs */}
          {!loading && !error && filtered.length > 0 && (
            <div className="mt-8 border border-accent/10 bg-accent/5 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="mono text-[9px] font-bold text-accent mb-1">WANT COMPANIES TO FIND YOU FIRST?</p>
                <p className="mono text-[8px] text-text/40">WProTalents features vetted LATAM candidates to US & EU hiring managers. Free.</p>
              </div>
              <button
                onClick={() => setShowLinkedIn(true)}
                className="mono text-[8px] font-bold bg-accent text-black px-5 py-2.5 hover:opacity-90 transition-opacity whitespace-nowrap flex items-center gap-2"
              >
                <Linkedin size={11} /> GET FEATURED →
              </button>
            </div>
          )}
        </>
      )}
      <LinkedInBoostModal isOpen={showLinkedIn} onClose={() => setShowLinkedIn(false)} lang={lang} />
    </section>
  );
}

export default function JobsPage({ lang = 'EN', isLoggedIn = false }: { lang?: string; isLoggedIn?: boolean }) {
  const t = T[lang as keyof typeof T] || T.EN;
  const [showVacancy, setShowVacancy] = useState(false);
  const [showLinkedIn, setShowLinkedIn] = useState(false);
  return (
    <div className="min-h-screen bg-bg">
      <MarketValueTeaser lang={lang} isLoggedIn={isLoggedIn} />
      <LatamCitiesWidget lang={lang} />
      <CandidateResourcesPanel onLinkedInBoost={() => setShowLinkedIn(true)} lang={lang} />
      <JobPortal lang={lang} t={t} onPostVacancy={() => setShowVacancy(true)} />
      <PostVacancyModal isOpen={showVacancy} onClose={() => setShowVacancy(false)} lang={lang} />
      <LinkedInBoostModal isOpen={showLinkedIn} onClose={() => setShowLinkedIn(false)} lang={lang} />
    </div>
  );
}
