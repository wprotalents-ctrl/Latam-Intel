import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Menu, 
  X, 
  ChevronRight, 
  Mail, 
  Linkedin, 
  ArrowUpRight,
  Globe,
  Zap,
  TrendingUp,
  Users,
  Languages,
  Activity,
  Shield,
  Radio,
  Crosshair,
  Maximize2,
  Share2,
  MoreHorizontal,
  Eye,
  Clock,
  Moon,
  Settings,
  LayoutDashboard,
  Cpu,
  LogIn,
  User as UserIcon,
  LogOut,
  Lock,
  Briefcase,
  Brain,
  SearchCode,
  UserCheck,
  RefreshCw,
  Bitcoin,
  Newspaper,
  Sun,
  Copy
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { MOCK_BRIEFINGS, generateBriefing, saveBriefing, getRecentBriefings } from './services/intelService';
import { Language, Briefing, Category, IntelligenceBrief } from './types';
import { auth, onAuthStateChanged, User, signOut, db, handleFirestoreError, FirestoreOperation } from './firebase';
import { onSnapshot, doc, collection, query, orderBy, limit } from 'firebase/firestore';
import { AuthModal } from './components/AuthModal';
import { SubscriptionSection } from './components/SubscriptionSection';
import JobsPage from './pages/JobsPage';
import ClientJobPostForm, { type ClientJobPostData } from './components/ClientJobPostForm';
import ClientInsightsCard from './components/ClientInsightsCard';
import { generateHiringPlan, type HiringPlan } from './lib/hiringPlan';
import { estimateNetworkReach, type NetworkReach } from './lib/networkReach';

const TRANSLATIONS = {
  EN: {
    dashboard: "Dashboard",
    jobs: "Jobs",
    marketIntel: "Market Intel",
    tagline: "WProTalents: Strategic Talent Acquisition & AI Market Intelligence",
    signal: "WPro Signal",
    heroDesc: "Founder-led headhunting. We bypass the open market to connect US and EU firms with 23,000+ global professionals — with unmatched depth in LATAM.",
    viewIntel: "Access Talent Intelligence",
    backToFeed: "Back to Intelligence Feed",
    actionable: "Hiring Signal?",
    editorialVoice: "Founder's Voice",
    authorDesc: "Founder, WProTalents. 20yr Tech Recruitment Veteran.",
    theVeteran: "The Founder",
    authorBio: "20 years recruiting C-level talent globally. Founder of WProTalents. We hunt for high-stakes tech roles across USA, EU, and LATAM.",
    network: "WPro Network",
    directConn: "23,000+ Global Professionals",
    briefings: "Talent Briefings",
    intelReports: "Strategic Intelligence",
    joinNetwork: "Initiate Search",
    getSignal: "Get the AI talent signal every Thursday.",
    subscribe: "Subscribe to Market Alerts",
    marketPulse: "Talent Pulse",
    archive: "Intel Archive",
    subscribeBtn: "Subscribe",
    rights: "WProTalents © 2026 ALL RIGHTS RESERVED",
    terms: "Terms",
    privacy: "Privacy",
    contact: "Contact",
    briefingNum: "Intel Briefing",
    systemLog: "WPro Log",
    worldMap: "Global Talent Map",
    radar: "WPro Talent Radar",
    conflictMonitor: "Market Volatility",
    newsFeed: "Talent Market News",
    dailyBriefing: "Workforce Daily",
    analyst: "Headhunter",
    alerts: "Talent Alerts",
    reports: "Market Reports",
    decks: "Talent Decks",
    monitoredSituations: "Hiring Trends",
    localTriangulation: "Regional Talent Data",
    visualTelemetry: "Talent Telemetry",
    latAmSignal: "LATAM AI Talent",
    aiToolOfWeek: "Recruitment Tech",
    countryWatch: "Global Talent Watch",
    fiveLinks: "Five Insights Worth Your Time",
    fxRates: "MARKET RATES // LIVE",
    ago: "AGO",
    openReport: "OPEN INTEL REPORT",
    generatingSignal: "ANALYZING TALENT MARKET...",
    generateNewBriefing: "GENERATE INTEL BRIEFING",
    systemsNominal: "WPRO NOMINAL",
    total: "TALENT",
    queue: "SEARCHES",
    feeds: "INTEL FEEDS",
    night: "Night",
    customize: "Customize",
    rotation: "Rotation",
    resume: "Resume",
    pause: "Pause",
    muted: "Muted",
    unmuted: "Unmuted",
    sourceLink: "WProTalents ↗",
    edt: "EDT",
    data: "WPRO",
    beta: "WPRO INTEL BETA",
    scanning: "SCANNING TALENT...",
    aircraft: "TALENT",
    systemLogTitle: "WPRO LOG",
    logMsgs: [
      "WPro Talent Hub Established: SECTOR_7",
      "New AI Talent Detected: 35.41217, -50.55469",
      "Recruitment Feed Decrypted: CH_04",
      "Market Volatility Alert: Tech Sector",
      "Talent Data Ingestion Complete: GLOBAL_AI",
      "System Nominal: All Talent Nodes Active",
      "WPro Recruitment Tool Integrated: IP_88.1.2.3"
    ],
    sent: "TALENT",
    marketPulseItems: [
      { label: 'AI Talent USA', value: 'High', trend: '+15.2%', sentiment: '+2.5' },
      { label: 'Tech Talent EU', value: 'Steady', trend: '+2.1%', sentiment: '+0.5' },
      { label: 'AI Talent LATAM', value: 'Rising', trend: '+18.4%', sentiment: '+2.8' }
    ],
    aiToolScores: [
      { label: 'EFFICIENCY', score: 5 },
      { label: 'ACCURACY', score: 4 },
      { label: 'COST', score: 5 },
      { label: 'UX', score: 5 }
    ],
    // LatAm Signal Content
    signalTitle: "The LATAM AI Boom: Why São Paulo is the New Silicon Valley for AI Engineering",
    signalDesc1: "We are seeing a massive 40% increase in AI-specific job postings in Brazil and Mexico. The real signal is the shift from 'generic software engineering' to 'LLM fine-tuning and RAG architecture' expertise. Companies in the USA and EU are aggressively outsourcing their AI development to LATAM due to the high technical quality and cost-effectiveness. This is creating a 'talent vacuum' in local markets, driving up salaries for top-tier AI engineers by 50% in the last 12 months.",
    signalDesc2: "For the tech executive, this means the window for 'cheap' AI talent in LATAM is closing. You are no longer just competing with local startups; you are competing with Google, Meta, and OpenAI for the same engineering pool. If you haven't secured your AI leadership team in the region, you will be paying a 60% premium by 2027. Commodities like energy for data centers are also seeing price spikes in Chile and Uruguay as AI infrastructure expands.",
    signalSoWhat: "Lock in your AI engineering leads in Brazil and Mexico now. The wage inflation is real, and the talent is being snapped up by global giants. Also, monitor NVIDIA stock and energy commodity prices as they directly correlate with AI job growth in the region.",
    // AI Tool Content
    aiToolName: "WPro Intelligence",
    aiToolTitle: "AI-Powered Recruitment at Scale",
    aiToolDesc: "WProTalents uses AI-assisted sourcing combined with relationship-based recruiting. The speed of modern data mapping with the discretion of old-school headhunting.",
    aiToolWorkflowLabel: "RECRUITMENT WORKFLOW",
    aiToolWorkflow: "I integrated WPro's protocols into our C-level search process. It analyzed 23,000+ profiles to find the top 5 candidates for a Head of AI role in Mexico City. It didn't just look at keywords; it analyzed 'career trajectory' and 'AI project impact.' It saved our team 2 weeks of manual screening.",
    aiToolLimitation: "Limitation: Requires a deep understanding of the specific technical requirements to be truly effective.",
    aiToolVerdict: "Verdict for HR Executives: If you are hiring senior tech talent in LATAM, WPro's approach is mandatory to maintain quality and speed.",
    // Country Watch Content
    countryWatchItems: [
      { country: "USA", flag: "🇺🇸", text: "AI talent market cooling slightly in SF but exploding in Austin and Miami. Focus on 'Applied AI' roles rather than just research. Major stocks like NVDA and MSFT are the primary drivers of job sentiment." },
      { country: "EU", flag: "🇪🇺", text: "AI Act implementation is creating a surge in 'AI Compliance' and 'Ethics' roles. Germany and France are leading in industrial AI jobs. Watch energy prices as they impact data center expansion." },
      { country: "LATAM", flag: "🌎", text: "Brazil and Mexico are becoming the global back-office for AI development. Salaries are rising fast. Focus on building 'AI Centers of Excellence' to retain top talent." }
    ],
    // Five Links Content
    fiveLinksItems: [
      { title: "AI's Impact on the 2026 Job Market", source: "WEF", why: "A comprehensive look at which roles are being automated and where the new 'AI-Native' jobs are appearing.", url: "https://www.weforum.org/stories/2024/01/jobs-of-the-future-report-2025/" },
      { title: "Commodity Prices & AI Infrastructure", source: "IEA", why: "How the demand for copper and energy for AI data centers is impacting global markets and job creation in mining.", url: "https://www.iea.org/reports/electricity-2024" }
    ],
    // News Feed Content
    newsFeedItems: [
      { title: "WProTalents expands network to 25,000+ professionals", source: "WPRO_NEWS", time: "2h", url: "https://wprotalents.lat" },
      { title: "EU AI Act creates 50,000 new compliance roles across Europe", source: "BBC", time: "4h", url: "https://www.bbc.com/news/technology" },
      { title: "Brazil's AI talent pool grows by 30% in Q1 2026", source: "REUTERS", time: "6h", url: "https://www.reuters.com/technology/" },
      { title: "Oil prices dip, but energy demand for AI data centers remains high", source: "CNBC", time: "8h", url: "https://www.cnbc.com/energy/" },
      { title: "WProTalents maps top 100 AI engineers in Mexico City", source: "WPRO_INTEL", time: "10h", url: "https://wprotalents.lat" }
    ]

  },
  ES: {
    dashboard: "Panel",
    jobs: "Empleos",
    marketIntel: "Inteligencia de Mercado",
    tagline: "Inteligencia del Mercado Laboral de IA y Tendencias Globales",
    signal: "Señal de Empleos IA",
    heroDesc: "Directo. Nivel ejecutivo. 20 años reclutando talento C-level con enfoque en transformación de IA en EE. UU., UE y LATAM.",
    viewIntel: "Ver Inteligencia Laboral",
    backToFeed: "Volver al Feed de Inteligencia Laboral",
    actionable: "¿Impacto en Empleos?",
    editorialVoice: "Voz de Reclutamiento",
    authorDesc: "Veterano de 20 años en Reclutamiento Tech. Red de Talento IA.",
    theVeteran: "El Reclutador",
    authorBio: "20 años reclutando talento C-level globalmente. Red profunda en EE. UU., UE y LATAM. Experto en el impacto de la IA en la fuerza laboral y creación de nuevos empleos.",
    network: "Red de Talento",
    directConn: "Conexiones Directas de CTO/VP y Líderes de IA",
    briefings: "Informes Laborales",
    intelReports: "Inteligencia de Fuerza Laboral",
    joinNetwork: "Únete a la Red de Talento",
    getSignal: "Recibe la señal de empleos IA todos los jueves.",
    subscribe: "Suscríbete a Alertas de Empleo",
    marketPulse: "Pulso del Empleo",
    archive: "Archivo de Empleos",
    subscribeBtn: "Suscribirse",
    rights: "TODOS LOS DERECHOS RESERVADOS",
    terms: "Términos",
    privacy: "Privacidad",
    contact: "Contacto",
    briefingNum: "Informe Laboral",
    systemLog: "Log de Talento",
    worldMap: "Mapa Global de Empleos",
    radar: "Radar de Talento IA",
    conflictMonitor: "Volatilidad del Mercado",
    newsFeed: "Noticias del Mercado Laboral",
    dailyBriefing: "Diario de Fuerza Laboral",
    analyst: "Reclutador",
    alerts: "Alertas de Empleo",
    reports: "Informes de Mercado",
    decks: "Decks de Talento",
    monitoredSituations: "Tendencias de Empleo",
    localTriangulation: "Datos Laborales Regionales",
    visualTelemetry: "Telemetría de Talento",
    latAmSignal: "Empleos IA LATAM",
    aiToolOfWeek: "Herramienta de Reclutamiento IA",
    countryWatch: "Vigilancia Global de Empleos",
    fiveLinks: "Cinco Perspectivas Laborales que Valen tu Tiempo",
    fxRates: "TASAS DE MERCADO // EN VIVO",
    ago: "ATRÁS",
    openReport: "ABRIR INFORME LABORAL",
    generatingSignal: "ANALIZANDO MERCADO LABORAL...",
    generateNewBriefing: "GENERAR INFORME LABORAL",
    systemsNominal: "RECLUTAMIENTO NOMINAL",
    total: "CONTRATACIONES",
    queue: "VACANTES",
    feeds: "FUENTES DE TALENTO",
    night: "Noche",
    customize: "Personalizar",
    rotation: "Rotación",
    resume: "Reanudar",
    pause: "Pausa",
    muted: "Silenciado",
    unmuted: "Sonido",
    sourceLink: "Fuente de Empleo ↗",
    edt: "EDT",
    data: "TALENTO",
    beta: "JOBDECK BETA",
    scanning: "ESCANEANDO TALENTO...",
    aircraft: "TALENTO",
    systemLogTitle: "LOG DE TALENTO",
    logMsgs: [
      "Hub de Talento IA Establecido: SECTOR_7",
      "Nuevo Empleo IA Detectado: 35.41217, -50.55469",
      "Feed de Reclutamiento Decodificado: CH_04",
      "Alerta de Volatilidad de Mercado: Sector Tech",
      "Ingestión de Datos de Talento Completa: GLOBAL_AI",
      "Sistema Nominal: Todos los Nodos de Talento Activos",
      "Nueva Herramienta de Reclutamiento IA Integrada: IP_88.1.2.3"
    ],
    sent: "CONTRATADO",
    marketPulseItems: [
      { label: 'Empleos IA USA', value: 'Alto', trend: '+15.2%', sentiment: '+2.5' },
      { label: 'Empleos Tech UE', value: 'Estable', trend: '+2.1%', sentiment: '+0.5' },
      { label: 'Talento IA LATAM', value: 'Creciente', trend: '+18.4%', sentiment: '+2.8' }
    ],
    aiToolScores: [
      { label: 'EFICIENCIA', score: 5 },
      { label: 'PRECISIÓN', score: 4 },
      { label: 'COSTO', score: 5 },
      { label: 'UX', score: 5 }
    ],
    // LatAm Signal Content
    signalTitle: "El Boom de la IA en LATAM: Por qué São Paulo es el nuevo Silicon Valley para la Ingeniería de IA",
    signalDesc1: "Estamos viendo un aumento masivo del 40% en las ofertas de trabajo específicas de IA en Brasil y México. La verdadera señal es el cambio de 'ingeniería de software genérica' a experiencia en 'ajuste fino de LLM y arquitectura RAG'. Las empresas en EE. UU. y la UE están subcontratando agresivamente su desarrollo de IA a LATAM debido a la alta calidad técnica y la rentabilidad. Esto está creando un 'vacío de talento' en los mercados locales, elevando los salarios de los ingenieros de IA de primer nivel en un 50% en los últimos 12 meses.",
    signalDesc2: "Para el ejecutivo de tecnología, esto significa que la ventana para el talento de IA 'barato' en LATAM se está cerrando. Ya no solo compite con startups locales; compite con Google, Meta y OpenAI por el mismo pool de ingeniería. Si no ha asegurado su equipo de liderazgo de IA en la región, pagará una prima del 60% para 2027. Las materias primas como la energía para los centros de datos también están viendo picos de precios en Chile y Uruguay a medida que se expande la infraestructura de IA.",
    signalSoWhat: "Asegure a sus líderes de ingeniería de IA en Brasil y México ahora. La inflación salarial es real y el talento está siendo captado por gigantes globales. Además, monitoree las acciones de NVIDIA y los precios de las materias primas energéticas, ya que se correlacionan directamente con el crecimiento del empleo en IA en la región.",
    // AI Tool Content
    aiToolName: "HiredScore",
    aiToolTitle: "Reclutamiento Impulsado por IA a Escala",
    aiToolDesc: "HiredScore utiliza IA para emparejar candidatos con roles abiertos de manera ética y eficiente, reduciendo el sesgo y aumentando la productividad de los reclutadores en 3 veces. Es un cambio de juego para la contratación tecnológica de alto volumen.",
    aiToolWorkflowLabel: "FLUJO DE RECLUTAMIENTO",
    aiToolWorkflow: "Integramos HiredScore en nuestro proceso de búsqueda de nivel C. Analizó más de 10,000 perfiles para encontrar los 5 mejores candidatos para un puesto de Jefe de IA en la Ciudad de México. No solo buscó palabras clave; analizó la 'trayectoria profesional' y el 'impacto del proyecto de IA'. Ahorró a nuestro equipo 2 semanas de revisión manual.",
    aiToolLimitation: "Limitación: Requiere un gran conjunto de datos para ser verdaderamente efectivo; las startups más pequeñas pueden encontrar alta la carga de configuración inicial.",
    aiToolVerdict: "Veredicto para ejecutivos de RR. HH.: Si contrata a más de 50 personas al año, esta herramienta es obligatoria para mantener la calidad y la velocidad.",
    // Country Watch Content
    countryWatchItems: [
      { country: "USA", flag: "🇺🇸", text: "El mercado laboral de IA se está enfriando ligeramente en SF pero explotando en Austin y Miami. Enfoque en roles de 'IA Aplicada' en lugar de solo investigación. Las acciones principales como NVDA y MSFT son los principales impulsores del sentimiento laboral." },
      { country: "UE", flag: "🇪🇺", text: "La implementación de la Ley de IA está creando un aumento en los roles de 'Cumplimiento de IA' y 'Ética'. Alemania y Francia lideran en empleos de IA industrial. Observe los precios de la energía, ya que impactan la expansión de los centros de datos." },
      { country: "LATAM", flag: "🌎", text: "Brasil y México se están convirtiendo en la oficina administrativa global para el desarrollo de IA. Los salarios están subiendo rápido. Enfoque en construir 'Centros de Excelencia de IA' para retener el mejor talento." }
    ],
    // Five Links Content
    fiveLinksItems: [
      { title: "Impacto de la IA en el Mercado Laboral de 2026", source: "WEF", why: "Una mirada completa a qué roles se están automatizando y dónde están apareciendo los nuevos empleos 'Nativos de IA'.", url: "https://www.weforum.org/stories/2024/01/jobs-of-the-future-report-2025/" },
      { title: "Precios de Materias Primas e Infraestructura de IA", source: "IEA", why: "Cómo la demanda de cobre y energía para los centros de datos de IA está impactando los mercados globales y la creación de empleo en la minería.", url: "https://www.iea.org/reports/electricity-2024" }
    ],
    // News Feed Content
    newsFeedItems: [
      { title: "NVIDIA alcanza nuevo máximo mientras surge la demanda de empleos de IA en EE. UU.", source: "REUTERS", time: "2h", url: "https://www.reuters.com/technology/" },
      { title: "La Ley de IA de la UE crea 50,000 nuevos roles de cumplimiento en toda Europa", source: "BBC", time: "4h", url: "https://www.bbc.com/news/technology" },
      { title: "El pool de talento de IA de Brasil crece un 30% en el primer trimestre de 2026", source: "LATAM_TECH", time: "6h", url: "https://www.reuters.com/technology/" },
      { title: "Los precios del petróleo bajan, pero la demanda de energía para centros de datos de IA sigue siendo alta", source: "CNBC", time: "8h", url: "https://www.cnbc.com/energy/" },
      { title: "Nueva herramienta de reclutamiento IA 'HiredScore' recauda $100M en Serie C", source: "TECHCRUNCH", time: "10h", url: "https://techcrunch.com/category/artificial-intelligence/" }
    ]
  },
  PT: {
    dashboard: "Painel",
    jobs: "Empregos",
    marketIntel: "Inteligência de Mercado",
    tagline: "Inteligência do Mercado de Trabalho de IA e Tendências Globais",
    signal: "Sinal de Empregos de IA",
    heroDesc: "Direto. Nível executivo. 20 anos recrutando talentos C-level com foco em transformação de IA nos EUA, UE e LATAM.",
    viewIntel: "Ver Inteligência de Empregos",
    backToFeed: "Voltar ao Feed de Inteligência de Empregos",
    actionable: "Impacto nos Empregos?",
    editorialVoice: "Voz do Recrutamento",
    authorDesc: "Veterano de 20 anos em Recrutamento Tech. Rede de Talentos de IA.",
    theVeteran: "O Recrutador",
    authorBio: "20 anos recrutando talentos C-level globalmente. Rede profunda nos EUA, UE e LATAM. Especialista no impacto da IA na força de trabalho e na criação de novos empregos.",
    network: "Rede de Talentos",
    directConn: "Conexões Diretas com CTO/VP e Líderes de IA",
    briefings: "Briefings de Empregos",
    intelReports: "Inteligência da Força de Trabalho",
    joinNetwork: "Junte-se à Rede de Talentos",
    getSignal: "Receba o sinal de empregos de IA toda quinta-feira.",
    subscribe: "Inscreva-se em Alertas de Emprego",
    marketPulse: "Pulso do Emprego",
    archive: "Arquivo de Empregos",
    subscribeBtn: "Inscrever-se",
    rights: "TODOS OS DIREITOS RESERVADOS",
    terms: "Termos",
    privacy: "Privacidade",
    contact: "Contato",
    briefingNum: "Briefing de Emprego",
    systemLog: "Log de Talentos",
    worldMap: "Mapa Global de Empregos",
    radar: "Radar de Talentos de IA",
    conflictMonitor: "Volatilidade do Mercado",
    newsFeed: "Notícias do Mercado de Trabalho",
    dailyBriefing: "Diário da Força de Trabalho",
    analyst: "Recrutador",
    alerts: "Alertas de Emprego",
    reports: "Relatórios de Mercado",
    decks: "Decks de Talentos",
    monitoredSituations: "Tendências de Emprego",
    localTriangulation: "Dados Regionais de Emprego",
    visualTelemetry: "Telemetria de Talentos",
    latAmSignal: "Empregos de IA na LATAM",
    aiToolOfWeek: "Ferramenta de Recrutamento de IA",
    countryWatch: "Vigilância Global de Empregos",
    fiveLinks: "Cinco Insights de Empregos que Valem seu Tempo",
    fxRates: "TAXAS DE MERCADO // AO VIVO",
    ago: "ATRÁS",
    openReport: "ABRIR RELATÓRIO DE EMPREGO",
    generatingSignal: "ANALISANDO MERCADO DE TRABALHO...",
    generateNewBriefing: "GERAR BRIEFING DE EMPREGO",
    systemsNominal: "RECRUTAMENTO NOMINAL",
    total: "CONTRATAÇÕES",
    queue: "VAGAS",
    feeds: "FEEDS DE TALENTOS",
    night: "Noite",
    customize: "Personalizar",
    rotation: "Rotação",
    resume: "Retomar",
    pause: "Pausa",
    muted: "Mudo",
    unmuted: "Som",
    sourceLink: "Fonte do Emprego ↗",
    edt: "EDT",
    data: "TALENTOS",
    beta: "JOBDECK BETA",
    scanning: "ESCANEANDO TALENTOS...",
    aircraft: "TALENTOS",
    systemLogTitle: "LOG DE TALENTOS",
    logMsgs: [
      "Hub de Talentos de IA Estabelecido: SECTOR_7",
      "Novo Emprego de IA Detectado: 35.41217, -50.55469",
      "Feed de Recrutamento Decifrado: CH_04",
      "Alerta de Volatilidade do Mercado: Setor Tech",
      "Ingestão de Dados de Talentos Concluída: GLOBAL_AI",
      "Sistema Nominal: Todos os Nós de Talentos Ativos",
      "Nova Ferramenta de Recrutamento de IA Integrada: IP_88.1.2.3"
    ],
    sent: "CONTRATADO",
    marketPulseItems: [
      { label: 'Empregos IA EUA', value: 'Alto', trend: '+15.2%', sentiment: '+2.5' },
      { label: 'Empregos Tech UE', value: 'Estável', trend: '+2.1%', sentiment: '+0.5' },
      { label: 'Talento IA LATAM', value: 'Crescente', trend: '+18.4%', sentiment: '+2.8' }
    ],
    aiToolScores: [
      { label: 'EFICIÊNCIA', score: 5 },
      { label: 'PRECISÃO', score: 4 },
      { label: 'CUSTO', score: 5 },
      { label: 'UX', score: 5 }
    ],
    // LatAm Signal Content
    signalTitle: "O Boom da IA na LATAM: Por que São Paulo é o Novo Vale do Silício para Engenharia de IA",
    signalDesc1: "Estamos vendo um aumento massivo de 40% nas postagens de empregos específicos de IA no Brasil e no México. O sinal real é a mudança da 'engenharia de software genérica' para a expertise em 'ajuste fino de LLM e arquitetura RAG'. Empresas nos EUA e na UE estão terceirizando agressivamente seu desenvolvimento de IA para a LATAM devido à alta qualidade técnica e custo-benefício. Isso está criando um 'vácuo de talentos' nos mercados locais, elevando os salários dos engenheiros de IA de alto nível em 50% nos últimos 12 meses.",
    signalDesc2: "Para o executivo de tecnologia, isso significa que a janela para talentos de IA 'baratos' na LATAM está se fechando. Você não está mais apenas competindo com startups locais; você está competindo com Google, Meta e OpenAI pelo mesmo pool de engenharia. Se você ainda não garantiu sua equipe de liderança de IA na região, pagará um prêmio de 60% até 2027. Commodities como energia para data centers também estão vendo picos de preços no Chile e no Uruguai à medida que a infraestrutura de IA se expande.",
    signalSoWhat: "Garanta seus líderes de engenharia de IA no Brasil e no México agora. A inflação salarial é real e o talento está sendo abocanhado por gigantes globais. Além disso, monitore as ações da NVIDIA e os preços das commodities de energia, pois eles se correlacionam diretamente com o crescimento de empregos de IA na região.",
    // AI Tool Content
    aiToolName: "HiredScore",
    aiToolTitle: "Recrutamento Impulsionado por IA em Escala",
    aiToolDesc: "O HiredScore usa IA para combinar candidatos a vagas abertas de forma ética e eficiente, reduzindo o viés e aumentando a produtividade do recrutador em 3 vezes. É um divisor de águas para contratações de tecnologia em alto volume.",
    aiToolWorkflowLabel: "FLUXO DE TRABALHO DE RECRUTAMENTO",
    aiToolWorkflow: "Integrei o HiredScore ao nosso processo de busca de nível C. Ele analisou mais de 10.000 perfis para encontrar os 5 melhores candidatos para uma vaga de Head de IA na Cidade do México. Ele não apenas olhou para palavras-chave; ele analisou a 'trajetória de carreira' e o 'impacto do projeto de IA'. Economizou para nossa equipe 2 semanas de triagem manual.",
    aiToolLimitation: "Limitação: Requer um grande conjunto de dados para ser verdadeiramente eficaz; startups menores podem achar o custo inicial de configuração alto.",
    aiToolVerdict: "Veredito para Executivos de RH: Se você contrata mais de 50 pessoas por ano, esta ferramenta é obrigatória para manter a qualidade e a velocidade.",
    // Country Watch Content
    countryWatchItems: [
      { country: "EUA", flag: "🇺🇸", text: "O mercado de trabalho de IA está esfriando ligeiramente em SF, mas explodindo em Austin e Miami. Foco em funções de 'IA Aplicada' em vez de apenas pesquisa. Ações principais como NVDA e MSFT são os principais impulsionadores do sentimento de emprego." },
      { country: "UE", flag: "🇪🇺", text: "A implementação do AI Act está criando um aumento nas funções de 'Conformidade de IA' e 'Ética'. Alemanha e França lideram em empregos de IA industrial. Observe os preços da energia, pois eles impactam a expansão dos data centers." },
      { country: "LATAM", flag: "🌎", text: "Brasil e México estão se tornando o back-office global para o desenvolvimento de IA. Os salários estão subindo rápido. Foco na construção de 'Centros de Excelência de IA' para reter os melhores talentos." }
    ],
    // Five Links Content
    fiveLinksItems: [
      { title: "Impacto da IA no Mercado de Trabalho de 2026", source: "WEF", why: "Uma visão abrangente de quais funções estão sendo automatizadas e onde os novos empregos 'Nativos de IA' estão surgindo.", url: "https://www.weforum.org/stories/2024/01/jobs-of-the-future-report-2025/" },
      { title: "Preços de Commodities e Infraestrutura de IA", source: "IEA", why: "Como a demanda por cobre e energia para data centers de IA está impactando os mercados globais e a criação de empregos na mineração.", url: "https://www.iea.org/reports/electricity-2024" }
    ],
    // News Feed Content
    newsFeedItems: [
      { title: "NVIDIA atinge nova máxima com aumento da demanda por empregos de IA nos EUA", source: "REUTERS", time: "2h", url: "https://www.reuters.com/technology/" },
      { title: "AI Act da UE cria 50.000 novas funções de conformidade em toda a Europa", source: "BBC", time: "4h", url: "https://www.bbc.com/news/technology" },
      { title: "Pool de talentos de IA do Brasil cresce 30% no 1º trimestre de 2026", source: "LATAM_TECH", time: "6h", url: "https://www.reuters.com/technology/" },
      { title: "Preços do petróleo caem, mas demanda de energia para data centers de IA permanece alta", source: "CNBC", time: "8h", url: "https://www.cnbc.com/energy/" },
      { title: "Nova ferramenta de recrutamento de IA 'HiredScore' arrecada US$ 100 milhões na Série C", source: "TECHCRUNCH", time: "10h", url: "https://techcrunch.com/category/artificial-intelligence/" }
    ]
  }
};

const WorldMap = () => (
  <div className="relative w-full h-full bg-bg overflow-hidden group">
    <div className="scanline" />
    <div className="absolute inset-0 grid-bg opacity-10" />
    <svg viewBox="0 0 1000 500" className="w-full h-full opacity-40">
      {/* Latitude/Longitude lines */}
      {[...Array(10)].map((_, i) => (
        <line key={`lat-${i}`} x1="0" y1={i * 50} x2="1000" y2={i * 50} stroke="currentColor" strokeWidth="0.2" className="text-text opacity-10" />
      ))}
      {[...Array(20)].map((_, i) => (
        <line key={`lon-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="500" stroke="currentColor" strokeWidth="0.2" className="text-text opacity-10" />
      ))}
      
      <path 
        d="M150,150 L200,150 L250,200 L300,200 L350,250 L400,250 L450,300 L500,300 L550,250 L600,250 L650,200 L700,200 L750,150 L800,150 L850,200 L900,200" 
        fill="none" 
        stroke="var(--accent)" 
        strokeWidth="0.5" 
        className="opacity-40"
      />
      
      {/* Abstract landmasses */}
      <path d="M100,100 Q150,80 200,120 T300,100 T400,150 T350,250 T200,300 T100,200 Z" fill="currentColor" className="text-text opacity-5" />
      <path d="M500,200 Q550,180 600,220 T700,200 T800,250 T750,350 T600,400 T500,300 Z" fill="currentColor" className="text-text opacity-5" />
      
      {[...Array(60)].map((_, i) => (
        <circle 
          key={i}
          cx={Math.random() * 1000}
          cy={Math.random() * 500}
          r={Math.random() * 2 + 0.5}
          fill={Math.random() > 0.8 ? "var(--accent)" : "currentColor"}
          className="animate-pulse text-text"
          style={{ animationDelay: `${Math.random() * 5}s` }}
        />
      ))}
    </svg>
    <div className="absolute bottom-4 left-4 mono text-[7px] text-text/40 bg-surface/80 px-2 py-1 border border-text/10 backdrop-blur-sm">
      LAT: 35.41217 | LON: -50.55469 | ALT: 12,400M
    </div>
    <div className="absolute top-4 right-4 mono text-[7px] text-accent bg-surface/80 px-2 py-1 border border-accent/20 backdrop-blur-sm animate-pulse">
      LIVE FEED // SAT_04
    </div>
  </div>
);

const RadarWidget = ({ lang, count }: { lang: Language; count: number }) => {
  const t = TRANSLATIONS[lang];
  const [blips, setBlips] = useState<{ id: number; x: number; y: number; opacity: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlips(prev => {
        const newBlips = prev.map(b => ({ ...b, opacity: b.opacity - 0.1 })).filter(b => b.opacity > 0);
        if (Math.random() > 0.7) {
          newBlips.push({
            id: Date.now(),
            x: Math.random() * 100,
            y: Math.random() * 100,
            opacity: 1
          });
        }
        return newBlips;
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full aspect-square bg-surface/30 flex items-center justify-center border border-border overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        {[1, 2, 3, 4].map(i => (
          <div 
            key={i} 
            className="absolute border border-text/10 rounded-full" 
            style={{ width: `${i * 25}%`, height: `${i * 25}%` }} 
          />
        ))}
        <div className="absolute w-full h-px bg-text/10" />
        <div className="absolute h-full w-px bg-text/10" />
        <div className="absolute w-full h-full radar-sweep" />
        
        {blips.map(blip => (
          <motion.div
            key={blip.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1, opacity: blip.opacity }}
            className="absolute w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_5px_var(--accent)]"
            style={{ left: `${blip.x}%`, top: `${blip.y}%` }}
          />
        ))}
      </div>
      <div className="z-10 flex flex-col items-center bg-surface/40 p-2 backdrop-blur-sm border border-text/5">
        <div className="mono text-[8px] text-accent font-bold mb-1">{t.scanning}</div>
        <div className="mono text-[12px] font-black text-text">{count > 0 ? count : '—'} {t.aircraft}</div>
      </div>
    </div>
  );
};

const SystemLog = ({ lang }: { lang: Language }) => {
  const t = TRANSLATIONS[lang];
  const [logs, setLogs] = useState<{ id: number; time: string; msg: string; type: 'INFO' | 'WARN' | 'CRIT' }[]>([]);

  useEffect(() => {
    const messages = t.logMsgs;

    const interval = setInterval(() => {
      setLogs(prev => [
        { 
          id: Date.now(), 
          time: new Date().toLocaleTimeString([], { hour12: false }), 
          msg: messages[Math.floor(Math.random() * messages.length)],
          type: Math.random() > 0.8 ? 'WARN' : 'INFO'
        },
        ...prev.slice(0, 5)
      ]);
    }, 3000);
    return () => clearInterval(interval);
  }, [t.logMsgs]);

  return (
    <div className="bg-surface border border-border p-4 h-48 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="mono text-[9px] text-text/40 flex items-center gap-2">
          <Activity size={10} className="text-accent" /> {t.systemLogTitle}
        </div>
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto no-scrollbar font-mono text-[8px]">
        {logs.map(log => (
          <div key={log.id} className="flex gap-2">
            <span className="text-text/20">[{log.time}]</span>
            <span className={log.type === 'WARN' ? 'text-yellow-500' : 'text-accent'}>{log.type}</span>
            <span className="text-text/60">{log.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
};


interface MarketIntelData {
  news: any[];
  cryptoNews: any[];
  trends: { sectors: any[]; companies: any[] };
  volume: any[];
  brief: string;
}

export default function App() {
  const [selectedBriefing, setSelectedBriefing] = useState<Briefing | null>(null);
  const [selectedIntelBrief, setSelectedIntelBrief] = useState<IntelligenceBrief | null>(null);
  const [filter, setFilter] = useState('All');
  const [category, setCategory] = useState<Category>('Workforce Daily');
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('wpro_lang');
    return (saved === 'EN' || saved === 'ES' || saved === 'PT') ? saved as Language : 'EN';
  });
  const [viewMode, setViewMode] = useState<'Dashboard' | 'Jobs'>('Dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [widgets, setWidgets] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('wpro-widgets');
      return saved ? JSON.parse(saved) : { map: true, radar: true, pulse: true, log: true, fx: true };
    } catch { return { map: true, radar: true, pulse: true, log: true, fx: true }; }
  });
  const toggleWidget = (key: string) => {
    setWidgets(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('wpro-widgets', JSON.stringify(next));
      return next;
    });
  };
  const [user, setUser] = useState<User | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'free' | 'premium'>('free');
  const [userRole, setUserRole] = useState<'candidate' | 'company' | null>(null);
  // Client hiring intelligence
  const [clientHiringPlan, setClientHiringPlan] = useState<HiringPlan | null>(null);
  const [clientNetworkReach, setClientNetworkReach] = useState<NetworkReach | null>(null);
  const [clientFormData, setClientFormData] = useState<ClientJobPostData | null>(null);
  const [clientInsightsLoading, setClientInsightsLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [briefings, setBriefings] = useState<Briefing[]>(MOCK_BRIEFINGS);
  const [intelBriefs, setIntelBriefs] = useState<IntelligenceBrief[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  // Initialize theme from localStorage or default to 'dark'
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('wpro-theme') as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });
  const [marketIntelData, setMarketIntelData] = useState<MarketIntelData>({
    news: [],
    cryptoNews: [],
    trends: { sectors: [], companies: [] },
    volume: [],
    brief: ''
  });

  const isAdmin = user?.email === 'iafacilparareinventarte@gmail.com' && user?.emailVerified;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setSubscriptionStatus('free');
        setUserRole(null);
        setViewMode('Dashboard');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setSubscriptionStatus(data.subscriptionStatus || 'free');
        const role = data.role as 'candidate' | 'company' | undefined;
        setUserRole(role || null);
        if (role === 'candidate') setViewMode('Jobs');
        else setViewMode('Dashboard'); // company or unknown → always Dashboard, never Jobs
      }
    }, (error) => {
      handleFirestoreError(error, FirestoreOperation.GET, `users/${user.uid}`);
    });

    return () => unsubscribe();
  }, [user]);

  // Unified Theme Effect
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      document.body.classList.add('light');
      root.style.colorScheme = 'light';
    } else {
      root.classList.remove('light');
      document.body.classList.remove('light');
      root.style.colorScheme = 'dark';
    }
    localStorage.setItem('wpro-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!user) return;

    const fetchBriefings = async () => {
      const recent = await getRecentBriefings(20, subscriptionStatus === 'premium' || isAdmin);
      if (recent.length > 0) {
        setBriefings(recent);
      }
    };
    fetchBriefings();

    return () => {};
  }, [user, subscriptionStatus, isAdmin]);

  useEffect(() => {
    fetchMarketIntel();
  }, []);

  const fetchMarketIntel = async () => {
    try {
      const [newsRes, cryptoRes, trendsRes, volumeRes, briefRes] = await Promise.all([
        fetch('/api/market-intel/news'),
        fetch('/api/market-intel/crypto-news'),
        fetch('/api/market-intel/trends'),
        fetch('/api/market-intel/volume'),
        fetch('/api/market-intel/brief')
      ]);

      if (newsRes.ok && cryptoRes.ok && trendsRes.ok && volumeRes.ok && briefRes.ok) {
        const [news, cryptoNews, trends, volume, briefData] = await Promise.all([
          newsRes.json(),
          cryptoRes.json(),
          trendsRes.json(),
          volumeRes.json(),
          briefRes.json()
        ]);

        setMarketIntelData({
          news,
          cryptoNews,
          trends,
          volume: Array.isArray(volume[0]) ? volume[0] : volume,
          brief: briefData.brief
        });
      }
    } catch (error) {
      console.error("Failed to fetch market intel:", error);
    }
  };

  const handleSyncIntelligence = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/sync-intelligence', { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        alert(`Sync successful! New briefing ID: ${data.briefingId}`);
        // Re-fetch briefings
        const recent = await getRecentBriefings(20, subscriptionStatus === 'premium' || isAdmin);
        setBriefings(recent);
      } else {
        alert('Sync failed. Check server logs.');
      }
    } catch (error) {
      console.error("Sync error:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGenerateBriefing = async () => {
    setIsGenerating(true);
    try {
      const newBriefing = await generateBriefing(lang, category);
      await saveBriefing(newBriefing);
      setBriefings(prev => [newBriefing, ...prev]);
      setSelectedBriefing(newBriefing);
    } catch (error) {
      console.error("Failed to generate briefing:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterStatus('loading');
    try {
      const response = await fetch('/api/subscribe-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      if (response.ok) {
        setNewsletterStatus('success');
        setNewsletterEmail('');
      } else {
        setNewsletterStatus('error');
      }
    } catch (error) {
      setNewsletterStatus('error');
    }
  };

  const filteredBriefings = filter === 'All' 
    ? briefings 
    : briefings.filter(b => b.region === filter);

  const t = TRANSLATIONS[lang];

  return (
    <div className={`h-screen flex flex-col bg-bg text-text selection:bg-accent selection:text-black font-sans relative transition-colors duration-300 ${theme === 'light' ? 'light' : ''}`}>
      <div className="scanline pointer-events-none fixed inset-0 z-[200]" />
      {/* Top Bar / OSINT Header */}
      <header className="border-b border-border bg-surface flex items-center justify-between px-6 py-2">
        <div className="flex items-center gap-8">
          <a href="https://wprotalents.lat/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-accent flex items-center justify-center text-black font-black text-xl">W</div>
            <div className="flex flex-col text-left">
              <h1 className="text-sm font-black uppercase tracking-tighter leading-none">WProTalents Intel</h1>
              <span className="mono text-[8px] text-accent/60">WPRO INTEL BETA</span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-1">
            <button 
              onClick={() => setViewMode('Dashboard')}
              className={`px-4 py-2 mono text-[10px] transition-all flex items-center gap-2 ${viewMode === 'Dashboard' ? 'text-accent bg-text/5' : 'text-text/40 hover:text-text'}`}
            >
              <LayoutDashboard size={14} /> {t.dashboard}
            </button>
            {userRole === 'candidate' && (
              <button
                onClick={() => setViewMode('Jobs')}
                className={`px-4 py-2 mono text-[10px] transition-all flex items-center gap-2 ${viewMode === 'Jobs' ? 'text-accent bg-text/5' : 'text-text/40 hover:text-text'}`}
              >
                <Briefcase size={14} /> {t.jobs}
              </button>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-4 mono text-[10px]">
            <div className="flex items-center gap-2 text-text/40">
              <Clock size={12} />
              <span className="text-accent font-bold">{currentTime.toLocaleTimeString([], { hour12: false })}</span>
              <span className="opacity-50">{t.edt}</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2 text-text/40">
              <Activity size={12} />
              <span className="text-green-500 font-bold">WPRO</span>
            </div>
          </div>
          
          <div className="flex border border-border overflow-hidden rounded-sm">
            {(['EN', 'ES', 'PT'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => { setLang(l); localStorage.setItem('wpro_lang', l); }}
                className={`px-2 py-1 text-[9px] font-mono font-bold transition-colors ${lang === l ? 'bg-accent text-black' : 'bg-surface text-text/40 hover:bg-text/5'}`}
              >
                {l}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 border border-border hover:bg-text/5 rounded-sm text-text/40 hover:text-accent transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          
          <div className="flex items-center gap-4">
            {isAdmin && (
              <button 
                onClick={handleSyncIntelligence}
                disabled={isSyncing}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/30 text-accent mono text-[9px] font-bold hover:bg-accent/20 transition-all disabled:opacity-50"
              >
                <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                {isSyncing ? 'Syncing...' : 'Daily Sync'}
              </button>
            )}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="mono text-[9px] text-text font-bold">{user.displayName || 'User'}</span>
                  <button 
                    onClick={() => signOut(auth)}
                    className="mono text-[8px] text-text/40 hover:text-accent transition-colors flex items-center gap-1"
                  >
                    <LogOut size={10} /> Logout
                  </button>
                </div>
                <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={16} className="text-accent" />
                  )}
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2 bg-accent text-black mono text-[10px] font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <LogIn size={14} /> Login
              </button>
            )}
            
            <button className="p-2 border border-border hover:bg-text/5 rounded-sm">
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden grid-bg">
        <AnimatePresence mode="wait">
          {!user ? (
            /* ── PUBLIC TEASER ── */
            <motion.div
              key="teaser"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 overflow-y-auto"
            >
              <div className="flex flex-col items-center justify-center px-6 py-16 min-h-full max-w-4xl mx-auto w-full">
                {/* Hero */}
                <div className="text-center mb-16 w-full">
                  <div className="inline-flex items-center gap-2 px-3 py-1 border border-accent/30 bg-accent/5 mono text-[9px] text-accent mb-6">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    VIP INTEL — MEMBERS ONLY
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-6">
                    Talent Intelligence<br />
                    <span className="text-accent">For the Few</span>
                  </h1>
                  <p className="text-sm text-text/60 max-w-xl mx-auto leading-relaxed mb-8">
                    {t.heroDesc}
                  </p>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-accent text-black mono font-bold text-[11px] hover:opacity-90 transition-opacity"
                  >
                    <LogIn size={14} /> ACCESS VIP INTEL
                  </button>
                </div>

                {/* Blurred preview cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border w-full mb-px">
                  {/* Candidate teaser */}
                  <div className="bg-bg p-8 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-bg/70 backdrop-blur-[3px]">
                      <div className="text-center">
                        <Lock size={22} className="text-accent mx-auto mb-3" />
                        <div className="mono text-[9px] text-accent font-bold tracking-widest mb-3">CANDIDATE PORTAL</div>
                        <button
                          onClick={() => setIsAuthModalOpen(true)}
                          className="px-5 py-2 bg-accent text-black mono text-[9px] font-bold hover:opacity-90 transition-opacity"
                        >
                          LOGIN TO BROWSE JOBS
                        </button>
                      </div>
                    </div>
                    <div className="opacity-25 pointer-events-none select-none">
                      <div className="mono text-[9px] text-accent mb-4 flex items-center gap-2">
                        <Briefcase size={10} /> AI &amp; TECH JOBS // LATAM · USA · EU
                      </div>
                      <div className="space-y-3">
                        {['Senior AI Engineer — LATAM Remote', 'Head of Data Science — USA', 'ML Platform Lead — EU Remote', 'VP Engineering — Colombia'].map((j, i) => (
                          <div key={i} className="p-3 bg-surface border border-border">
                            <div className="text-sm font-bold">{j}</div>
                            <div className="mono text-[8px] text-text/40 mt-1">$90K–$140K · Remote · Full-time</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Company teaser */}
                  <div className="bg-bg p-8 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-bg/70 backdrop-blur-[3px]">
                      <div className="text-center">
                        <Lock size={22} className="text-accent mx-auto mb-3" />
                        <div className="mono text-[9px] text-accent font-bold tracking-widest mb-3">COMPANY INTEL</div>
                        <button
                          onClick={() => setIsAuthModalOpen(true)}
                          className="px-5 py-2 bg-accent text-black mono text-[9px] font-bold hover:opacity-90 transition-opacity"
                        >
                          LOGIN TO ACCESS INTEL
                        </button>
                      </div>
                    </div>
                    <div className="opacity-25 pointer-events-none select-none">
                      <div className="mono text-[9px] text-accent mb-4 flex items-center gap-2">
                        <Brain size={10} /> MARKET INTEL // EXCLUSIVE
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 bg-surface border border-border">
                          <div className="mono text-[8px] text-text/40 mb-1">AI HIRING SIGNAL</div>
                          <div className="text-sm font-bold">LATAM AI Engineers in high demand — salaries up 18% QoQ</div>
                        </div>
                        <div className="p-3 bg-surface border border-border">
                          <div className="mono text-[8px] text-text/40 mb-1">TOOL REVIEW</div>
                          <div className="text-sm font-bold">WPro Intelligence Suite: 4.8/5 · Deploy-ready</div>
                        </div>
                        <div className="p-3 bg-surface border border-border">
                          <div className="mono text-[8px] text-text/40 mb-1">GLOBAL TALENT WATCH</div>
                          <div className="text-sm font-bold">Colombia · Brazil · Argentina · Mexico</div>
                        </div>
                        <div className="p-3 bg-surface border border-border">
                          <div className="mono text-[8px] text-text/40 mb-1">FIVE INSIGHTS // CURATED</div>
                          <div className="text-sm font-bold">Weekly reading list for talent leaders</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats strip */}
                <div className="grid grid-cols-3 gap-px bg-border w-full">
                  {[
                    { value: '23K+', label: 'Global Professionals' },
                    { value: '150+', label: 'Intel Briefings' },
                    { value: '12', label: 'Countries Covered' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-bg p-6 text-center">
                      <div className="text-3xl font-black text-accent mb-1">{stat.value}</div>
                      <div className="mono text-[8px] text-text/40 uppercase tracking-widest">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : viewMode === 'Jobs' && userRole === 'candidate' ? (
            <motion.div
              key="jobs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 overflow-y-auto"
            >
              <JobsPage lang={lang} />
            </motion.div>
          ) : (
            <motion.div
              key={userRole === 'company' ? 'client-portal' : 'dashboard'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 overflow-y-auto"
            >
            {userRole === 'company' ? (
              /* ── Company Client Portal ───────────────────────────────── */
              <div className="max-w-3xl mx-auto px-6 py-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
                  <div className="w-10 h-10 bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <Briefcase size={16} className="text-accent" />
                  </div>
                  <div>
                    <h2 className="font-black text-lg uppercase tracking-tighter">Client Portal</h2>
                    <p className="mono text-[8px] text-text/40">Post roles · Get instant hiring intelligence · Featured on wprotalents.lat</p>
                  </div>
                </div>

                {/* Job Post Form */}
                <div className="border border-border bg-surface/30 p-6 mb-6">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="mono text-[9px] font-bold text-accent tracking-widest uppercase">Post a Role</span>
                    <div className="h-px flex-1 bg-border" />
                    <span className="mono text-[8px] text-text/30">Featured on wprotalents.lat</span>
                  </div>
                  <ClientJobPostForm
                    loading={clientInsightsLoading}
                    onSubmit={(data) => {
                      setClientInsightsLoading(true);
                      const roleKey = data.role
                        .toLowerCase()
                        .replace(/\s*\/\s*/g, '_')
                        .replace(/\s+/g, '_')
                        .replace(/[^a-z_]/g, '');
                      const plan = generateHiringPlan(data, {});
                      const reach = estimateNetworkReach({ role: roleKey, seniority: data.seniority });
                      setClientHiringPlan(plan);
                      setClientNetworkReach(reach);
                      setClientFormData(data);
                      setClientInsightsLoading(false);
                    }}
                  />
                  {clientHiringPlan && clientNetworkReach && clientFormData && (
                    <ClientInsightsCard
                      plan={clientHiringPlan}
                      reach={clientNetworkReach}
                      role={clientFormData.role}
                      seniority={clientFormData.seniority}
                      planType={clientFormData.planType}
                    />
                  )}
                </div>

                {/* Company Resources */}
                <div className="border border-border bg-surface/30 p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="mono text-[9px] font-bold text-accent tracking-widest uppercase">Resources for Hiring Managers</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { tag: 'TALENT STRATEGY', color: 'text-violet-400', title: 'How to Build a High-Performance Distributed Team in LATAM', desc: 'Hiring frameworks, onboarding, and culture for remote-first tech companies.', url: 'https://hbr.org/topic/subject/hiring', source: 'HBR' },
                      { tag: 'AI & HIRING', color: 'text-accent', title: 'How AI Is Transforming Talent Acquisition in 2026', desc: 'From sourcing automation to AI-assisted screening — what actually works.', url: 'https://www.linkedin.com/business/talent/blog', source: 'LinkedIn Talent' },
                      { tag: 'MARKET DATA', color: 'text-emerald-400', title: 'LATAM Salary Benchmarks for Tech Roles — 2026', desc: 'Up-to-date compensation data across Colombia, Brazil, Argentina, and Mexico.', url: 'https://www.levels.fyi/t/software-engineer/locations/latin-america', source: 'Levels.fyi' },
                      { tag: 'RETENTION', color: 'text-blue-400', title: 'Why Senior Engineers Leave — And How to Keep Them', desc: 'The real reasons your best people walk, and what actually retains top talent.', url: 'https://hbr.org/2023/06/why-your-best-employees-leave-and-how-to-keep-them', source: 'HBR' },
                    ].map((a, i) => (
                      <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                        className="group flex flex-col gap-1.5 p-4 bg-bg border border-border hover:border-accent/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className={`mono text-[7px] font-bold ${a.color}`}>{a.tag}</span>
                          <span className="mono text-[7px] text-text/20">{a.source}</span>
                        </div>
                        <h5 className="text-xs font-bold leading-snug group-hover:text-accent transition-colors">{a.title}</h5>
                        <p className="mono text-[9px] text-text/40 leading-snug line-clamp-2">{a.desc}</p>
                        <span className="mono text-[7px] text-accent/40 group-hover:text-accent transition-colors flex items-center gap-1 mt-auto">READ <ArrowUpRight size={8} /></span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* ── Intelligence Dashboard ──────────────────────────────── */
              <div className="grid grid-cols-12 gap-px bg-border min-h-full">
              {/* Dashboard Content (Grid of Widgets) */}
              <div className="col-span-12 lg:col-span-8 flex flex-col gap-px bg-border">
                {/* Top Row: Map and Radar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
                  {widgets.map !== false && (
                  <div className="md:col-span-2 bg-bg relative min-h-[400px]">
                    <div className="absolute top-4 left-4 z-20 flex items-center gap-2 mono text-[9px] bg-surface/80 p-2 border border-border">
                      <Globe size={10} className="text-accent" /> {t.worldMap}
                    </div>
                    <WorldMap />
                  </div>
                  )}
                  {widgets.radar !== false && (
                  <div className={`bg-bg relative p-4 flex flex-col ${widgets.map === false ? 'md:col-span-3' : ''}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="mono text-[9px] text-text/40 flex items-center gap-2">
                        <Activity size={10} className="text-accent" /> {t.radar}
                      </div>
                    </div>
                    <RadarWidget lang={lang} count={briefings.length} />
                    <div className="mt-4 space-y-2">
                      {[
                        { label: 'Executive / C-Level', color: 'bg-yellow-500', pct: 12 },
                        { label: 'Senior Individual Contributor', color: 'bg-green-500', pct: 38 },
                        { label: 'Mid-Level', color: 'bg-blue-400', pct: 35 },
                        { label: 'Emerging / Rising Talent', color: 'bg-accent', pct: 15 }
                      ].map(item => (
                        <div key={item.label} className="flex items-center justify-between mono text-[8px]">
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                            {item.label}
                          </div>
                          <span className="text-text/40">{item.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  )}
                </div>

                {/* Middle Row: Conflict Monitor and News */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
                  <div className="bg-bg p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <div className="mono text-[9px] text-accent flex items-center gap-2">
                        <Zap size={10} /> {t.latAmSignal} // FEATURED
                      </div>
                      <div className="mono text-[8px] text-text/20">WEEK 13 // 2026</div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-black uppercase tracking-tight mb-4 text-text">
                        {t.signalTitle}
                      </h4>
                      <p className="text-xs leading-relaxed text-text/70 mb-4">
                        {t.signalDesc1}
                      </p>
                      <p className="text-xs leading-relaxed text-text/70 mb-6">
                        {t.signalDesc2}
                      </p>
                      <div className="so-what !my-0 !py-3">
                        <span className="mono font-bold text-accent block mb-1 tracking-widest">{t.actionable.toUpperCase()}</span>
                        <p className="text-xs italic">
                          {t.signalSoWhat}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-bg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="mono text-[9px] text-text/40 flex items-center gap-2">
                        <Radio size={10} className="text-accent" /> {t.newsFeed}
                      </div>
                    </div>
                    <div className="space-y-6">
                      {t.newsFeedItems.map((news, i) => (
                        <a key={i} href={news.url} target="_blank" rel="noopener noreferrer" className="group block">
                          <h5 className="text-sm font-bold group-hover:text-accent transition-colors mb-1 flex items-start gap-1">
                            {news.title}
                            <ArrowUpRight size={11} className="shrink-0 mt-0.5 text-text/20 group-hover:text-accent transition-colors" />
                          </h5>
                          <div className="flex gap-3 mono text-[8px] text-text/40">
                            <span className="text-accent">{news.source}</span>
                            <span>{news.time} {t.ago}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Market Intel Integration: Brief and Job News */}
                {marketIntelData.brief && (
                  <div className="bg-bg p-6 border-b border-border">
                    <div className="flex items-center gap-2 mb-6">
                      <Zap size={10} className="text-accent" />
                      <div className="mono text-[9px] text-accent font-bold uppercase tracking-widest">AI Impact Brief</div>
                    </div>
                    <div className="bg-surface border border-accent/20 p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Zap size={48} className="text-accent" />
                      </div>
                      <p className="text-lg font-medium leading-relaxed text-text/90 italic">
                        "{marketIntelData.brief}"
                      </p>
                    </div>
                  </div>
                )}

                {marketIntelData.news.length > 0 && (
                  <div className="bg-bg p-6 border-b border-border">
                    <div className="flex items-center gap-2 mb-6">
                      <Newspaper size={10} className="text-accent" />
                      <div className="mono text-[9px] text-text/40 font-bold uppercase tracking-widest">Today's Job News</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {marketIntelData.news.slice(0, 4).map((item, i) => (
                        <a 
                          key={i} 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-4 bg-surface border border-border hover:border-accent/40 transition-all group"
                        >
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <span className="mono text-[8px] text-accent uppercase">{item.source}</span>
                            <span className="mono text-[8px] text-text/20">{new Date(item.publishedAt).toLocaleDateString()}</span>
                          </div>
                          <h5 className="text-sm font-bold group-hover:text-accent transition-colors line-clamp-2">{item.title}</h5>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Company Resources // Curated Articles */}
                <div className="bg-bg p-6 border-b border-border">
                  <div className="flex items-center gap-2 mb-5">
                    <Briefcase size={10} className="text-accent" />
                    <div className="mono text-[9px] text-accent font-bold uppercase tracking-widest">Company Resources // Curated for You</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { tag: 'TALENT STRATEGY', color: 'text-violet-400', title: 'How to Build a High-Performance Distributed Team in LATAM', desc: 'Hiring frameworks, onboarding, and culture for remote-first tech companies.', url: 'https://hbr.org/topic/subject/hiring', source: 'Harvard Business Review' },
                      { tag: 'AI & HIRING', color: 'text-accent', title: 'How AI Is Transforming Talent Acquisition in 2026', desc: 'From sourcing automation to AI-assisted screening — what actually works.', url: 'https://www.linkedin.com/business/talent/blog', source: 'LinkedIn Talent Blog' },
                      { tag: 'MARKET DATA', color: 'text-emerald-400', title: 'LATAM Salary Benchmarks for Tech Roles — 2026 Report', desc: 'Up-to-date compensation data across Colombia, Brazil, Argentina, and Mexico.', url: 'https://www.levels.fyi/t/software-engineer/locations/latin-america', source: 'Levels.fyi' },
                      { tag: 'RETENTION', color: 'text-blue-400', title: 'Why Senior Engineers Leave — And How to Keep Them', desc: 'The real reasons your best people walk, and what actually retains top talent.', url: 'https://hbr.org/2023/06/why-your-best-employees-leave-and-how-to-keep-them', source: 'HBR' },
                      { tag: 'JOB DESCRIPTIONS', color: 'text-yellow-400', title: 'How to Write Job Descriptions That Attract Senior Talent', desc: 'Most JDs repel the best candidates. Here\'s what top companies do differently.', url: 'https://www.linkedin.com/business/talent/blog/talent-acquisition/how-to-write-a-job-description', source: 'LinkedIn Talent' },
                      { tag: 'REMOTE TEAMS', color: 'text-violet-400', title: 'Managing Across Time Zones: A Playbook for LATAM Remote Teams', desc: 'Async communication, performance reviews, and trust-building across cultures.', url: 'https://www.mckinsey.com/capabilities/people-and-organizational-performance/our-insights', source: 'McKinsey' },
                    ].map((a, i) => (
                      <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                        className="group flex flex-col gap-1.5 p-4 bg-surface border border-border hover:border-accent/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className={`mono text-[7px] font-bold ${a.color}`}>{a.tag}</span>
                          <span className="mono text-[7px] text-text/20">{a.source}</span>
                        </div>
                        <h5 className="text-xs font-bold leading-snug group-hover:text-accent transition-colors">{a.title}</h5>
                        <p className="mono text-[9px] text-text/40 leading-snug line-clamp-2">{a.desc}</p>
                        <span className="mono text-[7px] text-accent/40 group-hover:text-accent transition-colors flex items-center gap-1 mt-auto">
                          READ <ArrowUpRight size={8} />
                        </span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Bottom Row: Intelligence Feed */}
                <div className="bg-bg p-6 flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="mono text-[9px] text-text/40 flex items-center gap-2">
                      <Activity size={10} className="text-accent" /> {t.dailyBriefing}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'Workforce Daily', icon: Cpu, label: 'Workforce' },
                        { id: 'TechJobs', icon: Briefcase, label: 'TechJobs' },
                        { id: 'AI Impact', icon: Brain, label: 'AI Impact' },
                        { id: 'Recruitment', icon: SearchCode, label: 'Recruitment' },
                        { id: 'HR', icon: UserCheck, label: 'HR' }
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setCategory(cat.id as Category)}
                          className={`px-3 py-1.5 mono text-[9px] font-bold border transition-all flex items-center gap-2 ${
                            category === cat.id 
                              ? 'bg-accent border-accent text-black' 
                              : 'bg-surface border-border text-text/40 hover:border-text/20'
                          }`}
                        >
                          <cat.icon size={12} /> {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                    <div className="space-y-4">
                      {/* Intelligence feed — Workforce Daily shows all, other tabs filter by category */}
                      {(category === 'Workforce Daily' ? filteredBriefings : filteredBriefings.filter(b => b.category === category)).map((briefing) => (
                        <article 
                          key={briefing.id}
                          onClick={() => {
                            if (briefing.isPremium && subscriptionStatus !== 'premium') {
                              document.getElementById('subscription-section')?.scrollIntoView({ behavior: 'smooth' });
                              return;
                            }
                            setSelectedBriefing(briefing);
                          }}
                          className={`p-6 bg-surface border border-border hover:border-accent/30 transition-all cursor-pointer group relative overflow-hidden ${
                            briefing.isPremium && subscriptionStatus !== 'premium' ? 'opacity-75' : ''
                          }`}
                        >
                          {briefing.isPremium && (
                          <div className="absolute top-0 right-0 px-3 py-1 bg-accent text-black mono text-[8px] font-bold uppercase tracking-widest">
                              Premium
                            </div>
                          )}
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <span className="px-2 py-0.5 bg-accent text-black text-[8px] font-mono font-bold">{briefing.region}</span>
                                <span className="mono text-[8px] text-text/40">ID: {briefing.id.padStart(4, '0')}</span>
                                <span className="mono text-[8px] text-text/40">{briefing.date}</span>
                                <span className="mono text-[8px] text-accent/60 uppercase tracking-widest">{briefing.category}</span>
                              </div>
                              <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-accent transition-colors flex items-center gap-2">
                                {briefing.content[lang].title}
                                {briefing.isPremium && subscriptionStatus !== 'premium' && <Lock size={14} className="text-accent" />}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2 mono text-[9px] font-bold text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                              {briefing.isPremium && subscriptionStatus !== 'premium' ? 'Upgrade to Unlock' : t.openReport} <ArrowUpRight size={14} />
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="col-span-12 lg:col-span-4 flex flex-col gap-px bg-border">
                {widgets.pulse !== false && <section className="p-8 bg-bg">
                  <div className="flex items-center justify-between mb-8">
                    <div className="mono text-[9px] text-text/40 flex items-center gap-2">
                      <TrendingUp size={10} className="text-accent" /> {t.marketPulse}
                    </div>
                    <span className={`mono text-[7px] px-1.5 py-0.5 border ${marketIntelData.news.length > 0 ? 'border-green-500/30 text-green-500' : 'border-text/10 text-text/20'}`}>
                      {marketIntelData.news.length > 0 ? '● LIVE' : '○ CACHED'}
                    </span>
                  </div>
                  <div className="space-y-6">
                    {marketIntelData.cryptoNews.length > 0 && (
                      <div className="p-4 bg-surface border border-border">
                        <div className="flex items-center gap-2 mb-4">
                          <Bitcoin size={12} className="text-accent" />
                          <span className="mono font-bold text-[10px] uppercase tracking-widest">Crypto & Web3 Pulse</span>
                        </div>
                        <div className="space-y-3">
                          {marketIntelData.cryptoNews.slice(0, 3).map((item, i) => (
                            <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="block group">
                              <h6 className="text-[10px] font-bold group-hover:text-accent transition-colors line-clamp-1">{item.title}</h6>
                              <span className="mono text-[7px] text-text/40 uppercase">{item.source}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {t.marketPulseItems.map((item, i) => (
                      <div key={item.label} className="flex justify-between items-center p-4 bg-surface border border-border">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-surface text-accent">
                            {i === 0 ? <TrendingUp size={12} /> : i === 1 ? <Users size={12} /> : <Globe size={12} />}
                          </div>
                          <div className="flex flex-col">
                            <span className="mono font-bold text-[10px]">{item.label}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] text-green-500 font-mono">{item.trend}</span>
                              <span className="text-[8px] text-text/40 font-mono">{t.sent}: {item.sentiment}</span>
                            </div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 bg-surface text-accent text-[8px] font-mono border border-accent/20">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </section>}

                {widgets.fx !== false && <section className="p-8 bg-bg">
                  <div className="mono text-[9px] text-text/40 mb-4 flex items-center gap-2">
                    <Activity size={10} className="text-accent" /> {t.fxRates}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { pair: 'COP/USD', rate: '4287', change: '-0.2%' },
                      { pair: 'BRL/USD', rate: '5.81', change: '+0.5%' },
                      { pair: 'ARS/USD', rate: '1042', change: '-1.1%' }
                    ].map(fx => (
                      <div key={fx.pair} className="bg-surface border border-border p-3 flex flex-col items-center">
                        <span className="mono text-[7px] text-text/40 mb-1">{fx.pair}</span>
                        <span className="text-sm font-black text-text">{fx.rate}</span>
                        <span className={`text-[7px] font-mono ${fx.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{fx.change}</span>
                      </div>
                    ))}
                  </div>
                </section>}

                {/* Market Intel Charts */}
                {marketIntelData.trends.sectors.length > 0 && (
                  <section className="p-8 bg-bg border-t border-border">
                    <div className="mono text-[9px] text-text/40 mb-6 flex items-center gap-2">
                      <TrendingUp size={10} className="text-accent" /> TOP HIRING SECTORS
                    </div>
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={marketIntelData.trends.sectors} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={80} 
                            stroke="var(--text)" 
                            fontSize={8}
                            tick={{ fill: 'var(--text)', opacity: 0.4 }}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', fontSize: '10px' }}
                            itemStyle={{ color: 'var(--accent)' }}
                          />
                          <Bar dataKey="count" fill="var(--accent)" radius={[0, 2, 2, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </section>
                )}

                {marketIntelData.volume.length > 0 && (
                  <section className="p-8 bg-bg border-t border-border">
                    <div className="mono text-[9px] text-text/40 mb-6 flex items-center gap-2">
                      <Globe size={10} className="text-accent" /> LATAM JOB VOLUME
                    </div>
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={marketIntelData.volume}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                          <XAxis 
                            dataKey="country" 
                            stroke="var(--text)" 
                            fontSize={8}
                            tick={{ fill: 'var(--text)', opacity: 0.4 }}
                          />
                          <YAxis 
                            stroke="var(--text)" 
                            fontSize={8}
                            tick={{ fill: 'var(--text)', opacity: 0.4 }}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', fontSize: '10px' }}
                            itemStyle={{ color: 'var(--accent)' }}
                          />
                          <Bar dataKey="count" fill="var(--accent)" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </section>
                )}

                {marketIntelData.trends.companies.length > 0 && (
                  <section className="p-8 bg-bg border-t border-border">
                    <div className="mono text-[9px] text-text/40 mb-6 flex items-center gap-2">
                      <Users size={10} className="text-accent" /> MOST ACTIVE COMPANIES
                    </div>
                    <div className="space-y-2">
                      {marketIntelData.trends.companies.slice(0, 5).map((company, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-surface border border-border">
                          <span className="font-bold text-[10px]">{company.name}</span>
                          <span className="mono text-[8px] text-accent">{company.count} roles</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <section className="p-8 bg-bg grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-surface border border-border p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="mono text-[9px] text-accent flex items-center gap-2">
                          <Cpu size={10} /> {t.aiToolOfWeek} // REVIEW
                        </div>
                        <div className="mono text-[8px] text-text/20">{t.aiToolName}</div>
                      </div>
                      
                      <h4 className="text-lg font-black uppercase tracking-tight mb-3">
                        {t.aiToolTitle}
                      </h4>
                      
                      <p className="text-xs text-text/70 leading-relaxed mb-4">
                        {t.aiToolDesc}
                      </p>
                      
                      <div className="bg-surface/40 p-3 border-l-2 border-accent mb-4">
                        <span className="mono text-[8px] text-accent block mb-1 uppercase">{t.aiToolWorkflowLabel}</span>
                        <p className="text-[11px] leading-snug">
                          {t.aiToolWorkflow}
                        </p>
                      </div>

                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {t.aiToolScores.map(s => (
                          <div key={s.label} className="flex flex-col items-center p-2 bg-text/5 border border-text/10">
                            <span className="mono text-[7px] text-text/40 mb-1">{s.label}</span>
                            <span className="text-xs font-bold text-accent">{s.score}/5</span>
                          </div>
                        ))}
                      </div>

                      <p className="text-[10px] text-text/40 italic mb-4">
                        {t.aiToolLimitation}
                      </p>

                      <p className="text-xs font-bold">
                        {t.aiToolVerdict}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-surface border border-border p-6 flex flex-col justify-between">
                      <div>
                        <div className="mono text-[9px] text-accent flex items-center gap-2 mb-6">
                          <Globe size={10} /> {t.countryWatch} // WEEKLY
                        </div>
                        <div className="space-y-6">
                          {t.countryWatchItems.map((item, i) => (
                            <div key={i} className={`border-l-2 ${i === 0 ? 'border-accent' : 'border-text/20'} pl-4`}>
                              <p className="text-xs leading-snug">
                                <span className="font-bold">{item.flag} {item.country}</span> — {item.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-surface border border-border p-4 flex flex-col justify-between">
                        <div className="mono text-[8px] text-text/40 uppercase tracking-widest mb-2">{t.network}</div>
                        <div className="text-2xl font-black tracking-tighter text-accent">23K+</div>
                      </div>
                      <div className="bg-surface border border-border p-4 flex flex-col justify-between">
                        <div className="mono text-[8px] text-text/40 uppercase tracking-widest mb-2">{t.briefings}</div>
                        <div className="text-2xl font-black tracking-tighter text-accent">150+</div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="p-8 bg-bg">
                  <div className="mono text-[9px] text-accent mb-6 flex items-center gap-2">
                    <Linkedin size={10} /> {t.fiveLinks} // CURATED
                  </div>
                  <div className="space-y-4">
                    {t.fiveLinksItems.map((link, i) => (
                      <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="group block border-b border-text/5 pb-4 last:border-0">
                        <div className="flex justify-between items-start mb-1">
                          <h5 className="text-sm font-bold group-hover:text-accent transition-colors">{link.title} — {link.source}</h5>
                          <ArrowUpRight size={14} className="shrink-0 text-text/20 group-hover:text-accent transition-colors" />
                        </div>
                        <p className="text-xs text-text/60 leading-snug">{link.why}</p>
                      </a>
                    ))}
                  </div>
                </section>

                <section className="p-8 bg-accent text-black flex-1">
                  <div className="mono text-black/60 mb-8 font-bold">{t.joinNetwork}</div>
                  <h4 className="text-3xl font-black uppercase tracking-tighter leading-none mb-8">
                    {t.getSignal.split(' ').slice(0, 3).join(' ')} <br />
                    {t.getSignal.split(' ').slice(3).join(' ')}
                  </h4>
                  <div className="space-y-4">
                    <button 
                      onClick={handleGenerateBriefing}
                      disabled={isGenerating}
                      className="w-full bg-bg text-accent py-6 mono font-bold hover:opacity-90 transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <>
                          <Activity size={16} className="animate-spin" />
                          {t.generatingSignal}
                        </>
                      ) : (
                        <>
                          <Zap size={16} />
                          {t.generateNewBriefing}
                        </>
                      )}
                    </button>
                    <div className="h-px bg-border w-full" />
                    <p className="mono text-[10px] text-black/60 leading-relaxed">
                      Select a category above to generate specific intelligence on Jobs, AI Impact, or HR.
                    </p>
                  </div>
                </section>
              </div>

              {/* Upgrade strip */}
              <div className="col-span-12">
                <div className="border-t border-border px-6 py-2 flex items-center justify-between gap-4 bg-surface/30">
                  <span className="mono text-[8px] text-text/25">
                    <span className="text-accent/70 font-bold">EXECUTIVE</span>
                    {' · '}Daily briefings · AI job impact reports · Salary data
                  </span>
                  <button
                    onClick={() => setShowUpgrade(v => !v)}
                    className="mono text-[8px] border border-accent/30 text-accent/70 px-3 py-1 hover:bg-accent hover:text-black hover:border-accent transition-all whitespace-nowrap shrink-0"
                  >
                    {showUpgrade ? 'CLOSE ✕' : 'UPGRADE $29 →'}
                  </button>
                </div>
                {showUpgrade && <SubscriptionSection />}
              </div>
              </div>{/* end grid cols-12 */}
            )}{/* end candidate branch */}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6">
              <div className="mono text-[9px] text-text/20">WProTalents // {t.rights}</div>
              <div className="flex items-center gap-2 mono text-[9px] text-green-500/60">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                {t.systemsNominal}
              </div>
            </div>
            <div className="flex gap-8 mono text-[9px] font-bold text-text/40">
              <a href="#" className="hover:text-accent transition-colors">{t.terms}</a>
              <a href="#" className="hover:text-accent transition-colors">{t.privacy}</a>
              <a href="#" className="hover:text-accent transition-colors">{t.contact}</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Briefing Detail Modal */}
      <AnimatePresence>
        {selectedBriefing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-bg/90 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-bg border border-accent/30 w-full max-w-5xl max-h-full overflow-y-auto relative"
            >
              <button 
                onClick={() => setSelectedBriefing(null)}
                className="absolute top-6 right-6 p-2 bg-accent text-black hover:opacity-80 transition-opacity z-10"
              >
                <X size={20} />
              </button>

              <div className="p-8 md:p-16">
                <header className="mb-16">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 bg-accent text-black text-[10px] font-mono font-bold">{selectedBriefing.region}</span>
                    <span className="mono text-[10px] text-text/40">{selectedBriefing.date}</span>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9] mb-8">
                    {selectedBriefing.content[lang].title}
                  </h2>
                  <div className="h-1 w-24 bg-accent"></div>
                </header>

                <div className="space-y-16">
                  {selectedBriefing.content[lang].sections.map((section, idx) => (
                    <section key={idx} className="border-t border-border pt-10">
                      <div className="mono text-accent mb-6 flex items-center gap-2">
                        <Crosshair size={12} /> SECTION 0{idx + 1} // {section.heading}
                      </div>
                      <div className="space-y-6 text-lg leading-snug font-medium text-text/80">
                        {section.paragraphs.map((p, pIdx) => (
                          <p key={pIdx}>{p}</p>
                        ))}
                      </div>
                      <div className="so-what mt-10">
                        <span className="mono font-bold text-accent block mb-2 underline decoration-accent/30 tracking-widest">{t.actionable}</span>
                        {section.soWhat}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Intelligence Brief Detail Modal */}
      <AnimatePresence>
        {selectedIntelBrief && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg/95 backdrop-blur-sm"
            onClick={() => setSelectedIntelBrief(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-surface border border-border w-full max-w-3xl max-h-[90vh] overflow-y-auto relative p-8 md:p-12 rounded-2xl shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedIntelBrief(null)}
                className="absolute top-6 right-6 p-2 hover:bg-bg rounded-full transition-colors text-text/40 hover:text-text"
              >
                <X size={24} />
              </button>

              <div className="flex items-center gap-4 mb-8">
                <span className="px-3 py-1 bg-accent text-black mono text-[10px] font-bold uppercase tracking-widest rounded-full">
                  {selectedIntelBrief.category}
                </span>
                <span className="px-3 py-1 bg-text text-bg mono text-[10px] font-bold uppercase tracking-widest rounded-full">
                  {selectedIntelBrief.country_code}
                </span>
                {selectedIntelBrief.is_hiring_signal && (
                  <span className="px-3 py-1 bg-green-500 text-black mono text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1">
                    <Zap size={10} /> Hiring Signal
                  </span>
                )}
              </div>

              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8 leading-none">
                {selectedIntelBrief.subject_line}
              </h2>

              <div className={`prose ${theme === 'dark' ? 'prose-invert' : ''} max-w-none`}>
                <div className="p-6 bg-bg border-l-4 border-accent mb-12">
                  <h4 className="mono text-[10px] text-accent uppercase tracking-widest mb-4">The Teaser</h4>
                  <p className="text-lg text-text/80 italic leading-relaxed">
                    {selectedIntelBrief.free_teaser}
                  </p>
                </div>

                <div className="space-y-8">
                  <h4 className="mono text-[10px] text-text/40 uppercase tracking-widest">The Deep Dive</h4>
                  {subscriptionStatus === 'premium' || isAdmin ? (
                    <div className="text-text/80 leading-relaxed whitespace-pre-wrap text-lg">
                      {selectedIntelBrief.paid_analysis}
                    </div>
                  ) : (
                    <div className="relative p-12 bg-bg border border-border rounded-2xl text-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg/80 pointer-events-none" />
                      <Lock className="mx-auto mb-6 text-accent" size={48} />
                      <h3 className="text-2xl font-bold mb-4">Executive Analysis Locked</h3>
                      <p className="text-text/40 mb-8 max-w-md mx-auto">
                        This deep-dive analysis is exclusive to WProTalents Executive members.
                      </p>
                      <button 
                        onClick={() => {
                          setSelectedIntelBrief(null);
                          document.getElementById('subscription-section')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-8 py-4 bg-accent text-black font-bold rounded-xl hover:opacity-90 transition-all"
                      >
                        Upgrade to Unlock
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-12 pt-12 border-t border-border">
                  <h4 className="mono text-[10px] text-text/40 uppercase tracking-widest mb-4">Internal Share Hook</h4>
                  <div className="p-4 bg-surface border border-border rounded-xl flex items-center justify-between gap-4 group">
                    <p className="text-sm text-text/60 italic">"{selectedIntelBrief.slack_hook}"</p>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(selectedIntelBrief.slack_hook);
                        alert('Copied to clipboard!');
                      }}
                      className="p-2 hover:bg-bg rounded-lg transition-colors text-accent flex items-center gap-2 mono text-[10px] font-bold"
                    >
                      <Copy size={14} /> Copy for Slack
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}

