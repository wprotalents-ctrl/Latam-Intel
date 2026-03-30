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
  Play,
  Pause,
  Volume2,
  VolumeX,
  Clock,
  Moon,
  Settings,
  LayoutDashboard,
  Tv,
  Cpu
} from 'lucide-react';
import { MOCK_BRIEFINGS, generateBriefing } from './services/intelService';
import { Language, Briefing } from './types';

const TRANSLATIONS = {
  EN: {
    dashboard: "Dashboard",
    cinema: "Cinema",
    tagline: "Intelligence for the LatAm Tech Executive",
    signal: "Signal Over Noise",
    heroDesc: "Direct. Executive-level. 20 years of recruiting C-level talent across Brazil, Mexico, and the Andean region.",
    viewIntel: "View Intelligence",
    backToFeed: "Back to Intelligence Feed",
    actionable: "So what?",
    editorialVoice: "Editorial Voice",
    authorDesc: "20yr LatAm Tech Veteran. CTO Network.",
    theVeteran: "The Veteran",
    authorBio: "20 years recruiting C-level talent across LatAm. Deep network across CO, BR, MX, AR, CL. Pattern recognition across hundreds of hiring cycles.",
    network: "Network",
    directConn: "Direct CTO/VP Connections",
    briefings: "Briefings",
    intelReports: "Intelligence Reports",
    joinNetwork: "Join the Network",
    getSignal: "Get the signal every Thursday.",
    subscribe: "Subscribe Now",
    marketPulse: "Market Pulse",
    archive: "Archive",
    subscribeBtn: "Subscribe",
    rights: "ALL RIGHTS RESERVED",
    terms: "Terms",
    privacy: "Privacy",
    contact: "Contact",
    briefingNum: "Briefing",
    systemLog: "System Log",
    worldMap: "World Map",
    radar: "Air Traffic Radar",
    conflictMonitor: "Conflict Monitor",
    newsFeed: "News Feed",
    dailyBriefing: "Daily Briefing",
    analyst: "Analyst",
    alerts: "Alerts",
    reports: "Reports",
    decks: "Decks",
    monitoredSituations: "Monitored Situations",
    localTriangulation: "Local Triangulation",
    visualTelemetry: "Visual Telemetry",
    latAmSignal: "LatAm Signal",
    aiToolOfWeek: "AI Tool of the Week",
    countryWatch: "Country Watch",
    fiveLinks: "Five Links Worth Your Time",
    fxRates: "FX RATES // LIVE",
    ago: "AGO",
    openReport: "OPEN REPORT",
    generatingSignal: "GENERATING SIGNAL...",
    generateNewBriefing: "GENERATE NEW BRIEFING",
    systemsNominal: "SYSTEMS NOMINAL",
    total: "TOTAL",
    queue: "QUEUE",
    feeds: "FEEDS",
    night: "Night",
    customize: "Customize",
    rotation: "Rotation",
    resume: "Resume",
    pause: "Pause",
    muted: "Muted",
    unmuted: "Unmuted",
    sourceLink: "Source ↗",
    edt: "EDT",
    data: "DATA",
    beta: "SITDECK BETA",
    scanning: "SCANNING...",
    aircraft: "AIRCRAFT",
    systemLogTitle: "SYSTEM LOG",
    logMsgs: [
      "Satellite Link Established: SECTOR_7",
      "New Signal Detected: 35.41217, -50.55469",
      "Encrypted Feed Decrypted: CH_04",
      "Conflict Monitor Alert: Sector 4",
      "Data Ingestion Complete: LATAM_NORTH",
      "System Nominal: All Nodes Active",
      "Unauthorized Access Attempt Blocked: IP_88.1.2.3"
    ],
    sent: "SENT",
    marketPulseItems: [
      { label: 'FinTech BR', value: 'High', trend: '+12.4%', sentiment: '+2.1' },
      { label: 'Nearshore MX', value: 'Peak', trend: '+8.1%', sentiment: '+1.9' },
      { label: 'SaaS CO', value: 'Rising', trend: '+4.2%', sentiment: '+0.8' }
    ],
    aiToolScores: [
      { label: 'SPEED', score: 5 },
      { label: 'SPANISH', score: 4 },
      { label: 'VALUE', score: 5 },
      { label: 'EXEC REL', score: 5 }
    ],
    // LatAm Signal Content
    signalTitle: "Lithium’s Value-Add Pivot: The Andean Manufacturing Play",
    signalDesc1: "The discovery of new lithium deposits in the Andean triangle is a distraction; the real signal is the aggressive shift in Chilean and Argentine regulatory frameworks toward mandatory local processing. We are seeing a 30% increase in 'local content' clauses in recent mining concessions. Governments are no longer content with extraction royalties; they are demanding battery component assembly as a condition for access.",
    signalDesc2: "For the LatAm executive, this is a supply chain and talent problem. The talent pool for specialized chemical and process engineering in the Andean region is currently at 95% utilization. If you are planning energy-intensive infrastructure—specifically data centers or localized hardware manufacturing—you are now competing with state-backed industrial projects for the same limited pool of technical talent.",
    signalSoWhat: "Audit your hardware supply chain for Andean lithium exposure and begin scouting technical talent in Salta and Antofagasta today to avoid the 40% wage premium coming when these processing plants go live in 2027.",
    // AI Tool Content
    aiToolName: "PERPLEXITY PRO",
    aiToolTitle: "Stopping the 'Google Search' Time Sink",
    aiToolDesc: "The problem isn't finding information; it's the 45 minutes spent filtering SEO-spam to find one credible regulatory update. Perplexity Pro solves this by providing cited, real-time answers from the live web.",
    aiToolWorkflowLabel: "MY WORKFLOW",
    aiToolWorkflow: "I tested this for 7 days for market intelligence. I prompted it to 'Monitor the Chilean Official Gazette (Diario Oficial) for any new decrees regarding lithium concession bidding windows,' specifically requesting sources in Spanish. It returned a 3-paragraph summary with direct links to the PDF decrees, saving me roughly 3 hours of manual searching.",
    aiToolLimitation: "Limitation: It occasionally hallucinates specific dates in complex legal text; always click the citation link for the final 'sign-off.'",
    aiToolVerdict: "Verdict for LatAm executives: A mandatory replacement for traditional search if you value your time more than $20/month.",
    // Country Watch Content
    countryWatchItems: [
      { country: "Brazil", flag: "🇧🇷", text: "FinTechs pivoting from growth to ARPU; marketing spend down 20%. Profitability is the new growth; audit unit economics before the next board meeting." },
      { country: "Mexico", flag: "🇲🇽", text: "Monterrey/Guadalajara engineering capacity hits 98%; salaries up 40%. Stop hunting for 'perfect' bilinguals; hire for technical excellence and build the communication layer internally." },
      { country: "Chile", flag: "🇨🇱", text: "New 30% 'local content' mandate for lithium processing confirmed. Expect a 40% wage premium for chemical engineers in Antofagasta. Audit energy storage supply chains now." }
    ],
    // Five Links Content
    fiveLinksItems: [
      { title: "Lithium Value-Add Pivot", source: "REUTERS", why: "Mandatory local processing in Chile/Argentina is the new supply chain bottleneck for hardware and data center projects." },
      { title: "The 'Rappi Mafia' Second Wave", source: "LATAM INTEL", why: "Medellín’s B2B SaaS density now rivals São Paulo; benchmark your regional expansion against these leaner 40% margin startups." }
    ],
    // News Feed Content
    newsFeedItems: [
      { title: "New lithium deposits discovered in Andean triangle", source: "REUTERS", time: "2h" },
      { title: "Satellite imagery confirms movement of heavy machinery near Sector 7", source: "INTEL_SAT", time: "4h" },
      { title: "Twenty-two migrants missing after boat sinks off Brazil coast", source: "BBC", time: "6h" },
      { title: "Morocco claims Western Sahara sovereignty at UN summit", source: "AL JAZEERA", time: "8h" },
      { title: "Houthi ballistic missile launch detected in Red Sea sector", source: "OSINT_TECH", time: "10h" }
    ],
    cinemaCards: [
      { type: 'SOCIAL', time: '2m ago', content: "@Osinttechnical: Notably, at least one officer from Air Command Center, Ukraine's most prolific user of the PATRIOT, is present.", author: '@osinttechnical', color: 'text-blue-500', dot: 'bg-blue-500' },
      { type: 'INTEL', time: '8m ago', content: "Satellite imagery confirms movement of heavy machinery near the border of Sector 7. High probability of infrastructure deployment.", author: 'GEO: 22.316°, 113.937°', color: 'text-accent', dot: 'bg-accent' },
      { type: 'SIGNAL', time: '15m ago', content: "Unusual frequency spike detected in the 450MHz band. Originating from maritime coordinates in the South Atlantic.", author: 'SIGINT-BETA', color: 'text-green-500', dot: 'bg-green-500' }
    ]
  },
  ES: {
    dashboard: "Panel",
    cinema: "Cine",
    tagline: "Inteligencia para el Ejecutivo Tech de LatAm",
    signal: "Señal sobre Ruido",
    heroDesc: "Directo. Nivel ejecutivo. 20 años reclutando talento C-level en Brasil, México y la región andina.",
    viewIntel: "Ver Inteligencia",
    backToFeed: "Volver al Feed de Inteligencia",
    actionable: "¿Y qué?",
    editorialVoice: "Voz Editorial",
    authorDesc: "Veterano de 20 años en Tech LatAm. Red de CTOs.",
    theVeteran: "El Veterano",
    authorBio: "20 años reclutando talento C-level en LatAm. Red profunda en CO, BR, MX, AR, CL. Reconocimiento de patrones en cientos de ciclos de contratación.",
    network: "Red",
    directConn: "Conexiones Directas de CTO/VP",
    briefings: "Informes",
    intelReports: "Informes de Inteligencia",
    joinNetwork: "Únete a la Red",
    getSignal: "Recibe la señal todos los jueves.",
    subscribe: "Suscríbete Ahora",
    marketPulse: "Pulso del Mercado",
    archive: "Archivo",
    subscribeBtn: "Suscribirse",
    rights: "TODOS LOS DERECHOS RESERVADOS",
    terms: "Términos",
    privacy: "Privacidad",
    contact: "Contacto",
    briefingNum: "Informe",
    systemLog: "Log del Sistema",
    worldMap: "Mapa Mundial",
    radar: "Radar de Tráfico Aéreo",
    conflictMonitor: "Monitor de Conflictos",
    newsFeed: "Feed de Noticias",
    dailyBriefing: "Informe Diario",
    analyst: "Analista",
    alerts: "Alertas",
    reports: "Informes",
    decks: "Decks",
    monitoredSituations: "Situaciones Monitoreadas",
    localTriangulation: "Triangulación Local",
    visualTelemetry: "Telemetría Visual",
    latAmSignal: "Señal LatAm",
    aiToolOfWeek: "Herramienta IA de la Semana",
    countryWatch: "Vigilancia de Países",
    fiveLinks: "Cinco Enlaces que Valen tu Tiempo",
    fxRates: "TASAS DE CAMBIO // EN VIVO",
    ago: "ATRÁS",
    openReport: "ABRIR INFORME",
    generatingSignal: "GENERANDO SEÑAL...",
    generateNewBriefing: "GENERAR NUEVO INFORME",
    systemsNominal: "SISTEMAS NOMINALES",
    total: "TOTAL",
    queue: "COLA",
    feeds: "FUENTES",
    night: "Noche",
    customize: "Personalizar",
    rotation: "Rotación",
    resume: "Reanudar",
    pause: "Pausa",
    muted: "Silenciado",
    unmuted: "Sonido",
    sourceLink: "Fuente ↗",
    edt: "EDT",
    data: "DATOS",
    beta: "SITDECK BETA",
    scanning: "ESCANEANDO...",
    aircraft: "AERONAVES",
    systemLogTitle: "LOG DEL SISTEMA",
    logMsgs: [
      "Enlace Satelital Establecido: SECTOR_7",
      "Nueva Señal Detectada: 35.41217, -50.55469",
      "Feed Encriptado Decodificado: CH_04",
      "Alerta del Monitor de Conflictos: Sector 4",
      "Ingestión de Datos Completa: LATAM_NORTH",
      "Sistema Nominal: Todos los Nodos Activos",
      "Intento de Acceso No Autorizado Bloqueado: IP_88.1.2.3"
    ],
    sent: "SENT",
    marketPulseItems: [
      { label: 'FinTech BR', value: 'Alto', trend: '+12.4%', sentiment: '+2.1' },
      { label: 'Nearshore MX', value: 'Pico', trend: '+8.1%', sentiment: '+1.9' },
      { label: 'SaaS CO', value: 'Creciente', trend: '+4.2%', sentiment: '+0.8' }
    ],
    aiToolScores: [
      { label: 'VELOCIDAD', score: 5 },
      { label: 'ESPAÑOL', score: 4 },
      { label: 'VALOR', score: 5 },
      { label: 'REL EJEC', score: 5 }
    ],
    // LatAm Signal Content
    signalTitle: "Pivote de Valor Agregado del Litio: La Jugada de Manufactura Andina",
    signalDesc1: "El descubrimiento de nuevos depósitos de litio en el triángulo andino es una distracción; la verdadera señal es el cambio agresivo en los marcos regulatorios de Chile y Argentina hacia el procesamiento local obligatorio. Estamos viendo un aumento del 30% en las cláusulas de 'contenido local' en las concesiones mineras recientes. Los gobiernos ya no se conforman con las regalías de extracción; están exigiendo el ensamblaje de componentes de baterías como condición para el acceso.",
    signalDesc2: "Para el ejecutivo de LatAm, esto es un problema de cadena de suministro y talento. El pool de talento para ingeniería química y de procesos especializada en la región andina está actualmente al 95% de utilización. Si está planeando infraestructura intensiva en energía, específicamente centros de datos o fabricación de hardware local, ahora compite con proyectos industriales respaldados por el estado por el mismo pool limitado de talento técnico.",
    signalSoWhat: "Audite su cadena de suministro de hardware para la exposición al litio andino y comience a buscar talento técnico en Salta y Antofagasta hoy mismo para evitar la prima salarial del 40% que vendrá cuando estas plantas de procesamiento entren en funcionamiento en 2027.",
    // AI Tool Content
    aiToolName: "PERPLEXITY PRO",
    aiToolTitle: "Deteniendo la Pérdida de Tiempo en 'Búsquedas de Google'",
    aiToolDesc: "El problema no es encontrar información; son los 45 minutos que se pasan filtrando el spam de SEO para encontrar una actualización regulatoria creíble. Perplexity Pro resuelve esto proporcionando respuestas citadas en tiempo real de la web en vivo.",
    aiToolWorkflowLabel: "MI FLUJO DE TRABAJO",
    aiToolWorkflow: "Probé esto durante 7 días para inteligencia de mercado. Le pedí: 'Monitorea el Diario Oficial de Chile para cualquier nuevo decreto sobre ventanas de licitación de concesiones de litio', solicitando específicamente fuentes en español. Devolvió un resumen de 3 párrafos con enlaces directos a los decretos en PDF, ahorrándome aproximadamente 3 horas de búsqueda manual.",
    aiToolLimitation: "Limitación: Ocasionalmente alucina fechas específicas en textos legales complejos; siempre haga clic en el enlace de la cita para la 'aprobación' final.",
    aiToolVerdict: "Veredicto para ejecutivos de LatAm: Un reemplazo obligatorio para la búsqueda tradicional si valora su tiempo más que $20 al mes.",
    // Country Watch Content
    countryWatchItems: [
      { country: "Brasil", flag: "🇧🇷", text: "FinTechs pivotando del crecimiento al ARPU; gasto en marketing bajó un 20%. La rentabilidad es el nuevo crecimiento; audite la economía unitaria antes de la próxima reunión de junta." },
      { country: "México", flag: "🇲🇽", text: "La capacidad de ingeniería en Monterrey/Guadalajara llega al 98%; salarios subieron un 40%. Deje de buscar bilingües 'perfectos'; contrate por excelencia técnica y construya la capa de comunicación internamente." },
      { country: "Chile", flag: "🇨🇱", text: "Confirmado nuevo mandato de 30% de 'contenido local' para el procesamiento de litio. Espere una prima salarial del 40% para ingenieros químicos en Antofagasta. Audite las cadenas de suministro de almacenamiento de energía ahora." }
    ],
    // Five Links Content
    fiveLinksItems: [
      { title: "Pivote de Valor Agregado del Litio", source: "REUTERS", why: "El procesamiento local obligatorio en Chile/Argentina es el nuevo cuello de botella de la cadena de suministro para proyectos de hardware y centros de datos." },
      { title: "La Segunda Ola de la 'Mafia Rappi'", source: "LATAM INTEL", why: "La densidad de SaaS B2B de Medellín ahora rivaliza con São Paulo; compare su expansión regional con estas startups más ágiles con márgenes del 40%." }
    ],
    // News Feed Content
    newsFeedItems: [
      { title: "Nuevos depósitos de litio descubiertos en el triángulo andino", source: "REUTERS", time: "2h" },
      { title: "Imágenes satelitales confirman movimiento de maquinaria pesada cerca del Sector 7", source: "INTEL_SAT", time: "4h" },
      { title: "Veintidós migrantes desaparecidos tras hundimiento de bote frente a costa de Brasil", source: "BBC", time: "6h" },
      { title: "Marruecos reclama soberanía del Sáhara Occidental en cumbre de la ONU", source: "AL JAZEERA", time: "8h" },
      { title: "Detectado lanzamiento de misil balístico Houthi en sector del Mar Rojo", source: "OSINT_TECH", time: "10h" }
    ],
    cinemaCards: [
      { type: 'SOCIAL', time: 'hace 2m', content: "@Osinttechnical: Notablemente, al menos un oficial del Centro de Comando Aéreo, el usuario más prolífico del PATRIOT en Ucrania, está presente.", author: '@osinttechnical', color: 'text-blue-500', dot: 'bg-blue-500' },
      { type: 'INTEL', time: 'hace 8m', content: "Imágenes satelitales confirman el movimiento de maquinaria pesada cerca de la frontera del Sector 7. Alta probabilidad de despliegue de infraestructura.", author: 'GEO: 22.316°, 113.937°', color: 'text-accent', dot: 'bg-accent' },
      { type: 'SIGNAL', time: 'hace 15m', content: "Detectado pico de frecuencia inusual en la banda de 450MHz. Originado en coordenadas marítimas en el Atlántico Sur.", author: 'SIGINT-BETA', color: 'text-green-500', dot: 'bg-green-500' }
    ]
  },
  PT: {
    dashboard: "Painel",
    cinema: "Cinema",
    tagline: "Inteligência para o Executivo de Tech da LatAm",
    signal: "Sinal sobre Ruído",
    heroDesc: "Direto. Nível executivo. 20 anos recrutando talentos C-level no Brasil, México e região andina.",
    viewIntel: "Ver Inteligência",
    backToFeed: "Voltar ao Feed de Inteligência",
    actionable: "E daí?",
    editorialVoice: "Voz Editorial",
    authorDesc: "Veterano de 20 anos em Tech na LatAm. Rede de CTOs.",
    theVeteran: "O Veterano",
    authorBio: "20 anos recrutando talentos C-level na LatAm. Rede profunda em CO, BR, MX, AR, CL. Reconhecimento de padrões em centenas de ciclos de contratação.",
    network: "Rede",
    directConn: "Conexões Directas de CTO/VP",
    briefings: "Relatórios",
    intelReports: "Relatórios de Inteligência",
    joinNetwork: "Junte-se à Rede",
    getSignal: "Receba o sinal toda quinta-feira.",
    subscribe: "Inscreva-se Agora",
    marketPulse: "Pulso do Mercado",
    archive: "Arquivo",
    subscribeBtn: "Inscrever-se",
    rights: "TODOS OS DIREITOS RESERVADOS",
    terms: "Termos",
    privacy: "Privacidade",
    contact: "Contato",
    briefingNum: "Relatório",
    systemLog: "Log do Sistema",
    worldMap: "Mapa Mundial",
    radar: "Radar de Tráfego Aéreo",
    conflictMonitor: "Monitor de Conflitos",
    newsFeed: "Feed de Notícias",
    dailyBriefing: "Relatório Diário",
    analyst: "Analista",
    alerts: "Alertas",
    reports: "Relatórios",
    decks: "Decks",
    monitoredSituations: "Situações Monitoradas",
    localTriangulation: "Triangulação Local",
    visualTelemetry: "Telemetria Visual",
    latAmSignal: "Sinal LatAm",
    aiToolOfWeek: "Ferramenta de IA da Semana",
    countryWatch: "Vigilância de Países",
    fiveLinks: "Cinco Links que Valem seu Tempo",
    fxRates: "TAXAS DE CÂMBIO // AO VIVO",
    ago: "ATRÁS",
    openReport: "ABRIR RELATÓRIO",
    generatingSignal: "GERANDO SINAL...",
    generateNewBriefing: "GERAR NOVO RELATÓRIO",
    systemsNominal: "SISTEMAS NOMINAIS",
    total: "TOTAL",
    queue: "FILA",
    feeds: "FONTES",
    night: "Noite",
    customize: "Personalizar",
    rotation: "Rotação",
    resume: "Retomar",
    pause: "Pausa",
    muted: "Mudo",
    unmuted: "Som",
    sourceLink: "Fonte ↗",
    edt: "EDT",
    data: "DADOS",
    beta: "SITDECK BETA",
    scanning: "ESCANEANDO...",
    aircraft: "AERONAVES",
    systemLogTitle: "LOG DO SISTEMA",
    logMsgs: [
      "Link de Satélite Estabelecido: SECTOR_7",
      "Novo Sinal Detectado: 35.41217, -50.55469",
      "Feed Criptografado Decifrado: CH_04",
      "Alerta do Monitor de Conflitos: Setor 4",
      "Ingestão de Dados Concluída: LATAM_NORTH",
      "Sistema Nominal: Todos os Nós Ativos",
      "Tentativa de Acesso Não Autorizado Bloqueada: IP_88.1.2.3"
    ],
    sent: "SENT",
    marketPulseItems: [
      { label: 'FinTech BR', value: 'Alto', trend: '+12.4%', sentiment: '+2.1' },
      { label: 'Nearshore MX', value: 'Pico', trend: '+8.1%', sentiment: '+1.9' },
      { label: 'SaaS CO', value: 'Crescente', trend: '+4.2%', sentiment: '+0.8' }
    ],
    aiToolScores: [
      { label: 'VELOCIDADE', score: 5 },
      { label: 'ESPANHOL', score: 4 },
      { label: 'VALOR', score: 5 },
      { label: 'REL EXEC', score: 5 }
    ],
    // LatAm Signal Content
    signalTitle: "Pivô de Valor Agregado do Lítio: A Jogada de Manufatura Andina",
    signalDesc1: "A descoberta de novos depósitos de lítio no triângulo andino é uma distração; o sinal real é a mudança agressiva nos marcos regulatórios chileno e argentino em direção ao processamento local obrigatório. Estamos vendo um aumento de 30% nas cláusulas de 'conteúdo local' em concessões de mineração recentes. Os governos não estão mais satisfeitos com os royalties de extração; eles estão exigindo a montagem de componentes de bateria como condição para o acesso.",
    signalDesc2: "Para o executivo da LatAm, este é um problema de cadeia de suprimentos e talentos. O pool de talentos para engenharia química e de processos especializada na região andina está atualmente com 95% de utilização. Se você está planejando infraestrutura intensiva em energia — especificamente data centers ou fabricação de hardware localizado — você está agora competindo com projetos industriais apoiados pelo estado pelo mesmo pool limitado de talentos técnicos.",
    signalSoWhat: "Audite sua cadeia de suprimentos de hardware para exposição ao lítio andino e comece a buscar talentos técnicos em Salta e Antofagasta hoje para evitar o prêmio salarial de 40% que virá quando essas plantas de processamento entrarem em operação em 2027.",
    // AI Tool Content
    aiToolName: "PERPLEXITY PRO",
    aiToolTitle: "Parando a Perda de Tempo com 'Buscas no Google'",
    aiToolDesc: "O problema não é encontrar informações; são os 45 minutos gastos filtrando spam de SEO para encontrar uma atualização regulatória confiável. O Perplexity Pro resolve isso fornecendo respostas citadas em tempo real da web ao vivo.",
    aiToolWorkflowLabel: "MEU FLUXO DE TRABALHO",
    aiToolWorkflow: "Testei isso por 7 dias para inteligência de mercado. Eu o instruí a 'Monitorar o Diário Oficial do Chile (Diario Oficial) para quaisquer novos decretos sobre janelas de licitação de concessão de lítio', solicitando especificamente fontes em espanhol. Ele retornou um resumo de 3 parágrafos com links diretos para os decretos em PDF, economizando cerca de 3 horas de pesquisa manual.",
    aiToolLimitation: "Limitação: Ocasionalmente alucina datas específicas em textos legais complexos; sempre clique no link da citação para a 'aprovação' final.",
    aiToolVerdict: "Veredicto para executivos da LatAm: Uma substituição obrigatória para a busca tradicional se você valoriza seu tempo mais do que US$ 20/mês.",
    // Country Watch Content
    countryWatchItems: [
      { country: "Brasil", flag: "🇧🇷", text: "FinTechs pivotando do crescimento para o ARPU; gastos com marketing caíram 20%. Rentabilidade é o novo crescimento; audite a economia unitária antes da próxima reunião do conselho." },
      { country: "México", flag: "🇲🇽", text: "A capacidade de engenharia em Monterrey/Guadalajara atinge 98%; salários subiram 40%. Pare de caçar bilingues 'perfeitos'; contrate por excelência técnica e construya a camada de comunicação internamente." },
      { country: "Chile", flag: "🇨🇱", text: "Confirmado novo mandato de 30% de 'conteúdo local' para o processamento de lítio. Espere um prêmio salarial de 40% para engenheiros químicos em Antofagasta. Audite as cadeias de suprimentos de armazenamento de energia agora." }
    ],
    // Five Links Content
    fiveLinksItems: [
      { title: "Pivô de Valor Agregado do Lítio", source: "REUTERS", why: "O processamento local obrigatório no Chile/Argentina é o novo gargalo da cadeia de suprimentos para projetos de hardware e data centers." },
      { title: "A Segunda Onda da 'Máfia Rappi'", source: "LATAM INTEL", why: "A densidade de SaaS B2B de Medellín agora rivaliza com São Paulo; compare sua expansão regional com essas startups mais enxutas com margem de 40%." }
    ],
    // News Feed Content
    newsFeedItems: [
      { title: "Novos depósitos de lítio descobertos no triângulo andino", source: "REUTERS", time: "2h" },
      { title: "Imagens de satélite confirmam movimento de maquinário pesado perto do Setor 7", source: "INTEL_SAT", time: "4h" },
      { title: "Vinte e dois migrantes desaparecidos após naufrágio de barco na costa do Brasil", source: "BBC", time: "6h" },
      { title: "Marrocos reivindica soberania do Saara Ocidental em cúpula da ONU", source: "AL JAZEERA", time: "8h" },
      { title: "Detectado lançamento de míssil balístico Houthi no setor do Mar Vermelho", source: "OSINT_TECH", time: "10h" }
    ],
    cinemaCards: [
      { type: 'SOCIAL', time: 'há 2m', content: "@Osinttechnical: Notavelmente, pelo menos um oficial do Centro de Comando Aéreo, o usuário mais prolífico do PATRIOT na Ucrânia, está presente.", author: '@osinttechnical', color: 'text-blue-500', dot: 'bg-blue-500' },
      { type: 'INTEL', time: 'há 8m', content: "Imagens de satélite confirmam o movimento de maquinário pesado perto da fronteira do Setor 7. Alta probabilidade de implantação de infraestrutura.", author: 'GEO: 22.316°, 113.937°', color: 'text-accent', dot: 'bg-accent' },
      { type: 'SIGNAL', time: 'há 15m', content: "Pico de frequência incomum detectado na banda de 450MHz. Originário de coordenadas marítimas no Atlântico Sul.", author: 'SIGINT-BETA', color: 'text-green-500', dot: 'bg-green-500' }
    ]
  }
};

const WorldMap = () => (
  <div className="relative w-full h-full bg-[#0a0a0a] overflow-hidden group">
    <div className="scanline" />
    <div className="absolute inset-0 grid-bg opacity-10" />
    <svg viewBox="0 0 1000 500" className="w-full h-full opacity-40">
      {/* Latitude/Longitude lines */}
      {[...Array(10)].map((_, i) => (
        <line key={`lat-${i}`} x1="0" y1={i * 50} x2="1000" y2={i * 50} stroke="white" strokeWidth="0.2" className="opacity-10" />
      ))}
      {[...Array(20)].map((_, i) => (
        <line key={`lon-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="500" stroke="white" strokeWidth="0.2" className="opacity-10" />
      ))}
      
      <path 
        d="M150,150 L200,150 L250,200 L300,200 L350,250 L400,250 L450,300 L500,300 L550,250 L600,250 L650,200 L700,200 L750,150 L800,150 L850,200 L900,200" 
        fill="none" 
        stroke="#ff6b00" 
        strokeWidth="0.5" 
        className="opacity-40"
      />
      
      {/* Abstract landmasses */}
      <path d="M100,100 Q150,80 200,120 T300,100 T400,150 T350,250 T200,300 T100,200 Z" fill="white" className="opacity-5" />
      <path d="M500,200 Q550,180 600,220 T700,200 T800,250 T750,350 T600,400 T500,300 Z" fill="white" className="opacity-5" />
      
      {[...Array(60)].map((_, i) => (
        <circle 
          key={i}
          cx={Math.random() * 1000}
          cy={Math.random() * 500}
          r={Math.random() * 2 + 0.5}
          fill={Math.random() > 0.8 ? "#ff6b00" : "white"}
          className="animate-pulse"
          style={{ animationDelay: `${Math.random() * 5}s` }}
        />
      ))}
    </svg>
    <div className="absolute bottom-4 left-4 mono text-[7px] text-white/40 bg-black/80 px-2 py-1 border border-white/10 backdrop-blur-sm">
      LAT: 35.41217 | LON: -50.55469 | ALT: 12,400M
    </div>
    <div className="absolute top-4 right-4 mono text-[7px] text-accent bg-black/80 px-2 py-1 border border-accent/20 backdrop-blur-sm animate-pulse">
      LIVE FEED // SAT_04
    </div>
  </div>
);

const RadarWidget = ({ lang }: { lang: Language }) => {
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
    <div className="relative w-full aspect-square bg-[#0a0a0a] flex items-center justify-center border border-white/5 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        {[1, 2, 3, 4].map(i => (
          <div 
            key={i} 
            className="absolute border border-white/10 rounded-full" 
            style={{ width: `${i * 25}%`, height: `${i * 25}%` }} 
          />
        ))}
        <div className="absolute w-full h-px bg-white/10" />
        <div className="absolute h-full w-px bg-white/10" />
        <div className="absolute w-full h-full radar-sweep" />
        
        {blips.map(blip => (
          <motion.div
            key={blip.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1, opacity: blip.opacity }}
            className="absolute w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_5px_#ff6b00]"
            style={{ left: `${blip.x}%`, top: `${blip.y}%` }}
          />
        ))}
      </div>
      <div className="z-10 flex flex-col items-center bg-black/40 p-2 backdrop-blur-sm border border-white/5">
        <div className="mono text-[8px] text-accent font-bold mb-1">{t.scanning}</div>
        <div className="mono text-[12px] font-black text-white">177 {t.aircraft}</div>
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
        <div className="mono text-[9px] text-white/40 flex items-center gap-2">
          <Activity size={10} className="text-accent" /> {t.systemLogTitle}
        </div>
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto no-scrollbar font-mono text-[8px]">
        {logs.map(log => (
          <div key={log.id} className="flex gap-2">
            <span className="text-white/20">[{log.time}]</span>
            <span className={log.type === 'WARN' ? 'text-yellow-500' : 'text-accent'}>{log.type}</span>
            <span className="text-white/60">{log.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CinemaGlobe = ({ lang }: { lang: Language }) => {
  const [activeCard, setActiveCard] = useState(0);
  const cards = TRANSLATIONS[lang].cinemaCards;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % cards.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [cards.length]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent pointer-events-none" />
      
      {/* Background technical elements */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <div className="w-[800px] h-[800px] border border-white/10 rounded-full animate-[spin_120s_linear_infinite]" />
        <div className="absolute w-[900px] h-[900px] border border-white/5 rounded-full animate-[spin_180s_linear_infinite_reverse]" />
      </div>

      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        className="relative w-[600px] h-[600px] rounded-full border border-accent/20 flex items-center justify-center"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent/10 to-transparent blur-3xl opacity-30" />
        <div className="w-[580px] h-[580px] rounded-full border border-accent/10 flex items-center justify-center">
          <div className="w-[500px] h-[500px] rounded-full bg-[#050505] border border-accent/30 shadow-[0_0_100px_rgba(255,107,0,0.1)] relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            
            {[...Array(80)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-accent rounded-full shadow-[0_0_8px_#ff6b00]"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.2, 1] }}
                transition={{ duration: 2 + Math.random() * 3, repeat: Infinity }}
              />
            ))}

            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
              {[...Array(15)].map((_, i) => (
                <motion.line
                  key={i}
                  x1={`${Math.random() * 100}%`}
                  y1={`${Math.random() * 100}%`}
                  x2={`${Math.random() * 100}%`}
                  y2={`${Math.random() * 100}%`}
                  stroke="#ff6b00"
                  strokeWidth="0.5"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.5 }}
                  transition={{ duration: 5, repeat: Infinity, repeatType: "reverse", delay: Math.random() * 5 }}
                />
              ))}
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Dynamic Intel Cards */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeCard}
            initial={{ x: activeCard % 2 === 0 ? -100 : 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: activeCard % 2 === 0 ? 100 : -100, opacity: 0 }}
            className={`absolute ${activeCard % 2 === 0 ? 'top-20 left-20' : 'bottom-40 right-20'} w-80 p-6 bg-surface/80 backdrop-blur-md border border-accent/30 rounded-sm pointer-events-auto shadow-2xl`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 ${cards[activeCard].dot} rounded-full animate-pulse`} />
                <span className={`mono text-[9px] ${cards[activeCard].color} font-bold`}>{cards[activeCard].type}</span>
              </div>
              <span className="mono text-[8px] text-white/40">{cards[activeCard].time}</span>
            </div>
            <p className="text-sm font-bold leading-tight mb-4">
              {cards[activeCard].content}
            </p>
            <div className="flex items-center justify-between mono text-[8px] text-white/40 border-t border-white/10 pt-4">
              <span>{cards[activeCard].author}</span>
              <span className="text-accent">{TRANSLATIONS[lang].sourceLink}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default function App() {
  const [selectedBriefing, setSelectedBriefing] = useState<Briefing | null>(null);
  const [filter, setFilter] = useState('All');
  const [lang, setLang] = useState<Language>('EN');
  const [viewMode, setViewMode] = useState<'Dashboard' | 'Cinema'>('Dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateBriefing = async () => {
    setIsGenerating(true);
    try {
      const newBriefing = await generateBriefing(lang);
      setSelectedBriefing(newBriefing);
    } catch (error) {
      console.error("Failed to generate briefing:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredBriefings = filter === 'All' 
    ? MOCK_BRIEFINGS 
    : MOCK_BRIEFINGS.filter(b => b.region === filter);

  const t = TRANSLATIONS[lang];

  return (
    <div className="min-h-screen flex flex-col bg-bg text-[#e0e0e0] selection:bg-accent selection:text-black font-sans relative">
      <div className="scanline pointer-events-none fixed inset-0 z-[200]" />
      {/* Top Bar / OSINT Header */}
      <header className="border-b border-border bg-surface flex items-center justify-between px-6 py-2">
        <div className="flex items-center gap-8">
          <button onClick={() => setSelectedBriefing(null)} className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-accent flex items-center justify-center text-black font-black text-xl">L</div>
            <div className="flex flex-col text-left">
              <h1 className="text-sm font-black uppercase tracking-tighter leading-none">LatAm Intel</h1>
              <span className="mono text-[8px] text-accent/60">{t.beta}</span>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            <button 
              onClick={() => setViewMode('Dashboard')}
              className={`px-4 py-2 mono text-[10px] transition-all flex items-center gap-2 ${viewMode === 'Dashboard' ? 'text-accent bg-white/5' : 'text-white/40 hover:text-white'}`}
            >
              <LayoutDashboard size={14} /> {t.dashboard}
            </button>
            <button 
              onClick={() => setViewMode('Cinema')}
              className={`px-4 py-2 mono text-[10px] transition-all flex items-center gap-2 ${viewMode === 'Cinema' ? 'text-accent bg-white/5' : 'text-white/40 hover:text-white'}`}
            >
              <Tv size={14} /> {t.cinema}
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-4 mono text-[10px]">
            <div className="flex items-center gap-2 text-white/40">
              <Clock size={12} />
              <span className="text-accent font-bold">{currentTime.toLocaleTimeString([], { hour12: false })}</span>
              <span className="opacity-50">{t.edt}</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2 text-white/40">
              <Activity size={12} />
              <span className="text-green-500 font-bold">{t.data}</span>
            </div>
          </div>
          
          <div className="flex border border-border overflow-hidden rounded-sm">
            {(['EN', 'ES', 'PT'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-1 text-[9px] font-mono font-bold transition-colors ${lang === l ? 'bg-accent text-black' : 'bg-surface text-white/40 hover:bg-white/5'}`}
              >
                {l}
              </button>
            ))}
          </div>
          
          <button className="p-2 border border-border hover:bg-white/5 rounded-sm">
            <Menu size={18} />
          </button>
        </div>
      </header>

      {/* Control Bar (Cinema Style) */}
      <div className="border-b border-border bg-surface/50 backdrop-blur-md flex items-center px-6 py-2 gap-6 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 mono text-[9px] text-white/40 hover:text-white transition-colors">
            <Activity size={12} /> {t.rotation}
          </button>
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center gap-2 mono text-[9px] text-white/40 hover:text-white transition-colors"
          >
            {isPaused ? <Play size={12} /> : <Pause size={12} />} {isPaused ? t.resume : t.pause}
          </button>
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="flex items-center gap-2 mono text-[9px] text-white/40 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />} {isMuted ? t.muted : t.unmuted}
          </button>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex-1 flex items-center gap-4 min-w-[200px]">
          <span className="mono text-[8px] text-white/20">00:00</span>
          <div className="flex-1 h-1 bg-white/5 rounded-full relative overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-accent/20 w-1/3" />
            <div className="absolute top-0 bottom-0 left-1/3 w-0.5 bg-accent shadow-[0_0_5px_#ff6b00]" />
          </div>
          <span className="mono text-[8px] text-white/20">23:59</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 mono text-[9px] text-white/40 hover:text-white transition-colors">
            <Moon size={12} /> {t.night}
          </button>
          <button className="flex items-center gap-2 mono text-[9px] text-white/40 hover:text-white transition-colors">
            <Settings size={12} /> {t.customize}
          </button>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="mono text-[9px] text-white/20">{t.total} <span className="text-white">60</span></div>
          <div className="mono text-[9px] text-white/20">{t.queue} <span className="text-white">0</span></div>
          <div className="mono text-[9px] text-white/20">{t.feeds} <span className="text-white">0</span></div>
        </div>
      </div>

      <main className="flex-1 relative overflow-hidden grid-bg">
        <AnimatePresence mode="wait">
          {viewMode === 'Cinema' ? (
            <motion.div 
              key="cinema"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <CinemaGlobe lang={lang} />
              
              {/* Right Sidebar Overlays */}
              <div className="absolute top-6 right-6 w-96 flex flex-col gap-6 pointer-events-none">
                <div className="bg-surface/80 backdrop-blur-md border border-border p-4 pointer-events-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div className="mono text-[9px] text-white/40 flex items-center gap-2">
                      <Shield size={10} className="text-accent" /> {t.monitoredSituations}
                    </div>
                    <span className="mono text-[9px] bg-white/10 px-1.5 py-0.5 rounded-sm">23</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-accent w-2/3" />
                  </div>
                </div>

                <div className="bg-surface/80 backdrop-blur-md border border-border p-4 pointer-events-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div className="mono text-[9px] text-white/40 flex items-center gap-2">
                      <Globe size={10} className="text-accent" /> {t.localTriangulation}
                    </div>
                    <Maximize2 size={12} className="text-white/20" />
                  </div>
                  <div className="aspect-video bg-black relative overflow-hidden border border-white/5">
                    <img 
                      src="https://picsum.photos/seed/map/400/225" 
                      alt="Local Map" 
                      className="w-full h-full object-cover grayscale opacity-40"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 border-2 border-accent rounded-full animate-ping opacity-20" />
                      <div className="w-4 h-4 bg-accent rounded-full shadow-[0_0_10px_#ff6b00]" />
                    </div>
                    <div className="absolute bottom-2 left-2 mono text-[7px] text-white/40">Carto Dark</div>
                  </div>
                </div>

                <div className="bg-surface/80 backdrop-blur-md border border-border p-4 pointer-events-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div className="mono text-[9px] text-white/40 flex items-center gap-2">
                      <Radio size={10} className="text-accent" /> {t.visualTelemetry}
                    </div>
                    <Maximize2 size={12} className="text-white/20" />
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="aspect-video bg-black relative overflow-hidden border border-white/5">
                      <img 
                        src="https://picsum.photos/seed/sat/400/225" 
                        alt="Satellite" 
                        className="w-full h-full object-cover grayscale contrast-150"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/60 px-1.5 py-0.5 mono text-[7px]">ESRI Satellite</div>
                    </div>
                    <div className="aspect-video bg-black relative overflow-hidden border border-white/5">
                      <img 
                        src="https://picsum.photos/seed/cam/400/225" 
                        alt="Camera" 
                        className="w-full h-full object-cover grayscale"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/60 px-1.5 py-0.5 mono text-[7px]">Sha Lo Wan</div>
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                        <span className="mono text-[7px] text-red-500">LIVE</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 grid grid-cols-12 gap-px bg-border overflow-y-auto"
            >
              {/* Dashboard Content (Grid of Widgets) */}
              <div className="col-span-12 lg:col-span-8 flex flex-col gap-px bg-border">
                {/* Top Row: Map and Radar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
                  <div className="md:col-span-2 bg-bg relative min-h-[400px]">
                    <div className="absolute top-4 left-4 z-20 flex items-center gap-2 mono text-[9px] bg-black/80 p-2 border border-white/10">
                      <Globe size={10} className="text-accent" /> {t.worldMap}
                    </div>
                    <WorldMap />
                  </div>
                  <div className="bg-bg relative p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="mono text-[9px] text-white/40 flex items-center gap-2">
                        <Activity size={10} className="text-accent" /> {t.radar}
                      </div>
                    </div>
                    <RadarWidget lang={lang} />
                    <div className="mt-4 space-y-2">
                      {[
                        { label: 'Commercial', color: 'bg-green-500' },
                        { label: 'Military', color: 'bg-red-500' },
                        { label: 'Helicopter', color: 'bg-blue-500' },
                        { label: 'VIP', color: 'bg-yellow-500' }
                      ].map(item => (
                        <div key={item.label} className="flex items-center justify-between mono text-[8px]">
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                            {item.label}
                          </div>
                          <span className="text-white/40">{Math.floor(Math.random() * 50)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Middle Row: Conflict Monitor and News */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
                  <div className="bg-bg p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <div className="mono text-[9px] text-accent flex items-center gap-2">
                        <Zap size={10} /> {t.latAmSignal} // FEATURED
                      </div>
                      <div className="mono text-[8px] text-white/20">WEEK 13 // 2026</div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-black uppercase tracking-tight mb-4 text-white">
                        {t.signalTitle}
                      </h4>
                      <p className="text-xs leading-relaxed text-white/70 mb-4">
                        {t.signalDesc1}
                      </p>
                      <p className="text-xs leading-relaxed text-white/70 mb-6">
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
                      <div className="mono text-[9px] text-white/40 flex items-center gap-2">
                        <Radio size={10} className="text-accent" /> {t.newsFeed}
                      </div>
                    </div>
                    <div className="space-y-6">
                      {t.newsFeedItems.map((news, i) => (
                        <div key={i} className="group cursor-pointer">
                          <h5 className="text-sm font-bold group-hover:text-accent transition-colors mb-1">{news.title}</h5>
                          <div className="flex gap-3 mono text-[8px] text-white/40">
                            <span className="text-accent">{news.source}</span>
                            <span>{news.time} {t.ago}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Intelligence Feed */}
                <div className="bg-bg p-6">
                  <div className="flex items-center justify-between mb-8">
                    <div className="mono text-[9px] text-white/40 flex items-center gap-2">
                      <Activity size={10} className="text-accent" /> {t.dailyBriefing}
                    </div>
                    <div className="mono text-[9px] text-white/40">{currentTime.toDateString()}</div>
                  </div>
                  
                  <div className="space-y-4">
                    {filteredBriefings.map((briefing) => (
                      <article 
                        key={briefing.id}
                        onClick={() => setSelectedBriefing(briefing)}
                        className="p-6 bg-surface border border-border hover:border-accent/30 transition-all cursor-pointer group"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="px-2 py-0.5 bg-accent text-black text-[8px] font-mono font-bold">{briefing.region}</span>
                              <span className="mono text-[8px] text-white/40">ID: {briefing.id.padStart(4, '0')}</span>
                              <span className="mono text-[8px] text-white/40">{briefing.date}</span>
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-accent transition-colors">
                              {briefing.content[lang].title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 mono text-[9px] font-bold text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                            {t.openReport} <ArrowUpRight size={14} />
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="col-span-12 lg:col-span-4 flex flex-col gap-px bg-border">
                <section className="p-8 bg-bg">
                  <div className="flex items-center justify-between mb-8">
                    <div className="mono text-[9px] text-white/40 flex items-center gap-2">
                      <TrendingUp size={10} className="text-accent" /> {t.marketPulse}
                    </div>
                  </div>
                  <div className="space-y-6">
                    {t.marketPulseItems.map((item, i) => (
                      <div key={item.label} className="flex justify-between items-center p-4 bg-surface border border-border">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-black text-accent">
                            {i === 0 ? <TrendingUp size={12} /> : i === 1 ? <Users size={12} /> : <Globe size={12} />}
                          </div>
                          <div className="flex flex-col">
                            <span className="mono font-bold text-[10px]">{item.label}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] text-green-500 font-mono">{item.trend}</span>
                              <span className="text-[8px] text-white/40 font-mono">{t.sent}: {item.sentiment}</span>
                            </div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 bg-black text-accent text-[8px] font-mono border border-accent/20">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="p-8 bg-bg">
                  <div className="mono text-[9px] text-white/40 mb-4 flex items-center gap-2">
                    <Activity size={10} className="text-accent" /> {t.fxRates}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { pair: 'COP/USD', rate: '4287', change: '-0.2%' },
                      { pair: 'BRL/USD', rate: '5.81', change: '+0.5%' },
                      { pair: 'ARS/USD', rate: '1042', change: '-1.1%' }
                    ].map(fx => (
                      <div key={fx.pair} className="bg-surface border border-border p-3 flex flex-col items-center">
                        <span className="mono text-[7px] text-white/40 mb-1">{fx.pair}</span>
                        <span className="text-sm font-black text-white">{fx.rate}</span>
                        <span className={`text-[7px] font-mono ${fx.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{fx.change}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="p-8 bg-bg grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-surface border border-border p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="mono text-[9px] text-accent flex items-center gap-2">
                          <Cpu size={10} /> {t.aiToolOfWeek} // REVIEW
                        </div>
                        <div className="mono text-[8px] text-white/20">{t.aiToolName}</div>
                      </div>
                      
                      <h4 className="text-lg font-black uppercase tracking-tight mb-3">
                        {t.aiToolTitle}
                      </h4>
                      
                      <p className="text-xs text-white/70 leading-relaxed mb-4">
                        {t.aiToolDesc}
                      </p>
                      
                      <div className="bg-black/40 p-3 border-l-2 border-accent mb-4">
                        <span className="mono text-[8px] text-accent block mb-1 uppercase">{t.aiToolWorkflowLabel}</span>
                        <p className="text-[11px] leading-snug">
                          {t.aiToolWorkflow}
                        </p>
                      </div>

                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {t.aiToolScores.map(s => (
                          <div key={s.label} className="flex flex-col items-center p-2 bg-white/5 border border-white/10">
                            <span className="mono text-[7px] text-white/40 mb-1">{s.label}</span>
                            <span className="text-xs font-bold text-accent">{s.score}/5</span>
                          </div>
                        ))}
                      </div>

                      <p className="text-[10px] text-white/40 italic mb-4">
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
                            <div key={i} className={`border-l-2 ${i === 0 ? 'border-accent' : 'border-white/20'} pl-4`}>
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
                        <div className="mono text-[8px] text-white/40 uppercase tracking-widest mb-2">{t.network}</div>
                        <div className="text-2xl font-black tracking-tighter text-accent">23K+</div>
                      </div>
                      <div className="bg-surface border border-border p-4 flex flex-col justify-between">
                        <div className="mono text-[8px] text-white/40 uppercase tracking-widest mb-2">{t.briefings}</div>
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
                      <div key={i} className="group cursor-pointer border-b border-white/5 pb-4 last:border-0">
                        <div className="flex justify-between items-start mb-1">
                          <h5 className="text-sm font-bold group-hover:text-accent transition-colors">{link.title} — {link.source}</h5>
                          <ArrowUpRight size={14} className="text-white/20 group-hover:text-accent transition-colors" />
                        </div>
                        <p className="text-xs text-white/60 leading-snug">{link.why}</p>
                      </div>
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
                      className="w-full bg-black text-accent py-6 mono font-bold hover:opacity-90 transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
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
                    <div className="h-px bg-black/10 w-full" />
                    <input 
                      type="email" 
                      placeholder="EMAIL@DOMAIN.COM" 
                      className="w-full bg-black/10 border-b-2 border-black/20 py-4 mono text-[10px] font-bold text-black focus:border-black focus:ring-0 placeholder:text-black/40"
                    />
                    <button className="w-full border-2 border-black text-black py-4 mono font-bold hover:bg-black hover:text-accent transition-all">
                      {t.subscribeBtn}
                    </button>
                  </div>
                </section>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* OSINT Footer / Status Bar */}
      <footer className="border-t border-border bg-surface px-6 py-2 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-6">
          <div className="mono text-[9px] text-white/20">© 2026 LATAM INTEL // {t.rights}</div>
          <div className="flex items-center gap-2 mono text-[9px] text-green-500/60">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            {t.systemsNominal}
          </div>
        </div>
        <div className="flex gap-8 mono text-[9px] font-bold text-white/40">
          <a href="#" className="hover:text-accent transition-colors">{t.terms}</a>
          <a href="#" className="hover:text-accent transition-colors">{t.privacy}</a>
          <a href="#" className="hover:text-accent transition-colors">{t.contact}</a>
        </div>
      </footer>

      {/* Briefing Detail Modal */}
      <AnimatePresence>
        {selectedBriefing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-sm"
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
                    <span className="mono text-[10px] text-white/40">{selectedBriefing.date}</span>
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
                      <div className="space-y-6 text-lg leading-snug font-medium text-white/80">
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
    </div>
  );
}

