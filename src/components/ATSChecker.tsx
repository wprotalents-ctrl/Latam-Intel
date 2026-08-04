// src/components/ATSChecker.tsx
// Free ATS Resume Checker for candidates — scores a resume against a job
// description, returns matched keywords, missing keywords, and recommendations.
//
// Why this matters: 75%+ of resumes are filtered out by ATS before a human
// ever sees them. This tool helps LATAM candidates beat that filter by
// matching their resume language to the JD's keywords.

import { useState, useMemo } from 'react';
import { FileText, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  lang?: 'EN' | 'ES' | 'PT';
}

const T = {
  EN: {
    title: 'ATS Resume Checker',
    subtitle: 'Score your resume against any job description — beat the 75% ATS rejection rate',
    jdLabel: 'Paste the job description',
    jdPlaceholder: 'Paste the full job description here (requirements, responsibilities, qualifications)...',
    resumeLabel: 'Paste your resume (plain text)',
    resumePlaceholder: 'Paste your resume content here. We extract keywords and skills, then match them to the JD. We do not store your resume.',
    analyze: 'ANALYZE',
    analyzing: 'Analyzing...',
    score: 'ATS Score',
    matched: 'Matched keywords',
    missing: 'Missing keywords',
    recommendations: 'Recommendations',
    yourResume: 'Your Resume',
    reset: 'RESET',
    privacy: 'Your resume and JD are processed locally in your browser. Nothing is sent to any server.',
  },
  ES: {
    title: 'Verificador de CV ATS',
    subtitle: 'Puntúa tu CV contra cualquier descripción de trabajo — supera el 75% de rechazo ATS',
    jdLabel: 'Pega la descripción del trabajo',
    jdPlaceholder: 'Pega aquí la descripción completa del trabajo (requisitos, responsabilidades, calificaciones)...',
    resumeLabel: 'Pega tu CV (texto plano)',
    resumePlaceholder: 'Pega el contenido de tu CV aquí. Extraemos palabras clave y habilidades, luego las comparamos con la JD. No almacenamos tu CV.',
    analyze: 'ANALIZAR',
    analyzing: 'Analizando...',
    score: 'Puntaje ATS',
    matched: 'Palabras clave encontradas',
    missing: 'Palabras clave faltantes',
    recommendations: 'Recomendaciones',
    yourResume: 'Tu CV',
    reset: 'REINICIAR',
    privacy: 'Tu CV y JD se procesan localmente en tu navegador. Nada se envía a ningún servidor.',
  },
  PT: {
    title: 'Verificador de CV ATS',
    subtitle: 'Pontue seu currículo contra qualquer vaga — passe pelo filtro de 75% de rejeição do ATS',
    jdLabel: 'Cole a descrição da vaga',
    jdPlaceholder: 'Cole aqui a descrição completa da vaga (requisitos, responsabilidades, qualificações)...',
    resumeLabel: 'Cole seu currículo (texto simples)',
    resumePlaceholder: 'Cole o conteúdo do seu currículo aqui. Extraímos palavras-chave e habilidades, depois comparamos com a vaga. Não armazenamos seu currículo.',
    analyze: 'ANALISAR',
    analyzing: 'Analisando...',
    score: 'Pontuação ATS',
    matched: 'Palavras-chave encontradas',
    missing: 'Palavras-chave faltando',
    recommendations: 'Recomendações',
    yourResume: 'Seu Currículo',
    reset: 'REINICIAR',
    privacy: 'Seu currículo e vaga são processados localmente no seu navegador. Nada é enviado a nenhum servidor.',
  },
};

// Tech keyword dictionary (expanded from common JD language)
const TECH_KEYWORDS = [
  // Languages & frameworks
  'javascript', 'typescript', 'python', 'java', 'kotlin', 'swift', 'go', 'rust', 'ruby', 'php',
  'c++', 'c#', 'scala', 'elixir', 'haskell', 'clojure', 'dart', 'r ',
  'react', 'vue', 'svelte', 'angular', 'next.js', 'nuxt', 'sveltekit', 'remix',
  'node.js', 'express', 'nestjs', 'fastify', 'django', 'flask', 'fastapi', 'spring', 'spring boot', 'rails',
  'react native', 'flutter', 'ionic', 'xamarin', 'swiftui', 'jetpack compose',
  // Cloud & infra
  'aws', 'azure', 'gcp', 'google cloud', 'kubernetes', 'k8s', 'docker', 'terraform', 'pulumi', 'ansible',
  'cloudformation', 'helm', 'argocd', 'jenkins', 'github actions', 'gitlab ci', 'circleci',
  // Data & AI
  'sql', 'nosql', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'kafka', 'rabbitmq',
  'snowflake', 'databricks', 'spark', 'hadoop', 'airflow', 'dbt', 'looker', 'tableau',
  'machine learning', 'deep learning', 'nlp', 'computer vision', 'tensorflow', 'pytorch', 'jax',
  'llm', 'rag', 'vector database', 'pinecone', 'weaviate', 'embeddings', 'transformers',
  'mlops', 'feature store', 'model deployment', 'a/b testing',
  // Practices
  'microservices', 'monolith', 'event-driven', 'cqrs', 'ddd', 'tdd', 'bdd', 'ci/cd', 'devops', 'sre',
  'observability', 'monitoring', 'logging', 'tracing', 'distributed systems',
  'agile', 'scrum', 'kanban', 'saas', 'b2b', 'b2c', 'api', 'rest', 'graphql', 'grpc', 'kafka', 'websockets',
  // Soft skills
  'leadership', 'mentoring', 'cross-functional', 'stakeholder management', 'communication',
  'remote', 'distributed', 'async', 'agile', 'startup', 'scale', 'high-traffic',
];

// Common stop words to exclude from keyword matching
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might',
  'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
  'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few',
  'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
  'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now',
]);

function tokenize(text: string): Set<string> {
  // Lowercase, split on non-alphanumeric, filter stop words and short tokens
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s+#.-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 1 && !STOP_WORDS.has(w))
  );
}

function extractKeywords(text: string): string[] {
  const tokens = tokenize(text);
  // Prefer known tech keywords first (high-signal), then extract other meaningful words
  const known = TECH_KEYWORDS.filter(kw => tokens.has(kw) || text.toLowerCase().includes(kw));
  const other: string[] = [];
  for (const t of tokens) {
    if (t.length >= 3 && !known.includes(t) && !/^\d+$/.test(t)) {
      other.push(t);
    }
  }
  // Return known first (deduplicated), then top other tokens by frequency
  const freq = new Map<string, number>();
  for (const t of other) freq.set(t, (freq.get(t) || 0) + 1);
  const sortedOther = [...freq.entries()].sort((a, b) => b[1] - a[1]).map(([w]) => w).slice(0, 30);
  return [...new Set([...known, ...sortedOther])];
}

function generateRecommendations(
  score: number,
  matched: string[],
  missing: string[],
  hasNumbers: boolean,
  hasYears: boolean,
  hasSkillsSection: boolean,
  resumeText: string,
  jdText: string,
): string[] {
  const recs: string[] = [];
  if (score < 50) {
    recs.push('Your resume is missing most of the JD\'s key terms. Re-read the JD and mirror its language in your bullet points.');
  } else if (score < 75) {
    recs.push('Decent match. Adding the missing keywords below (where truthful) would push you into strong-match territory.');
  } else {
    recs.push('Strong match. Your resume is well-aligned with this JD.');
  }
  if (missing.length > 0) {
    const top5 = missing.slice(0, 5);
    recs.push(`Add these keywords (only if truthful): ${top5.join(', ')}.`);
  }
  if (!hasNumbers) {
    recs.push('Add quantified impact: "reduced load time by 40%", "managed 3-person team", "$2M revenue". Numbers beat adjectives every time.');
  }
  if (!hasYears) {
    recs.push('Include years of experience for each role. "Senior Engineer (5 years)" beats "Senior Engineer".');
  }
  if (!hasSkillsSection) {
    recs.push('Add a dedicated "Skills" or "Tech Stack" section near the top — ATS scans for this.');
  }
  if (resumeText.length < 800) {
    recs.push('Resume is short (' + resumeText.length + ' chars). Most senior roles want 1,500-3,000 chars of detail.');
  }
  if (resumeText.length > 5000) {
    recs.push('Resume is long (' + resumeText.length + ' chars). Recruiters spend ~7 seconds — trim to one page for junior, two for senior.');
  }
  if (jdText.length < 200) {
    recs.push('Paste the full job description (requirements + responsibilities + qualifications) for a more accurate match.');
  }
  return recs;
}

export default function ATSChecker({ lang = 'EN' }: Props) {
  const tt = T[lang];
  const [jd, setJd] = useState('');
  const [resume, setResume] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<null | {
    score: number;
    matched: string[];
    missing: string[];
    recommendations: string[];
  }>(null);

  const canAnalyze = useMemo(() => jd.trim().length > 50 && resume.trim().length > 50, [jd, resume]);

  async function analyze() {
    if (!canAnalyze || analyzing) return;
    setAnalyzing(true);
    setResult(null);

    // Simulate processing time for UX (real analysis is synchronous)
    await new Promise(r => setTimeout(r, 600));

    const jdKeywords = extractKeywords(jd);
    const resumeKeywords = extractKeywords(resume);
    const resumeKeywordsSet = new Set(resumeKeywords.map(k => k.toLowerCase()));
    const resumeText = resume.toLowerCase();
    const matched: string[] = [];
    const missing: string[] = [];
    for (const kw of jdKeywords) {
      if (resumeText.includes(kw.toLowerCase()) || resumeKeywordsSet.has(kw.toLowerCase())) {
        matched.push(kw);
      } else {
        missing.push(kw);
      }
    }
    // Score: weighted — known tech keywords count more, generic words count less
    const knownMatched = matched.filter(m => TECH_KEYWORDS.includes(m));
    const otherMatched = matched.filter(m => !TECH_KEYWORDS.includes(m));
    const total = matched.length;
    const score = total > 0
      ? Math.min(100, Math.round((knownMatched.length * 5 + otherMatched.length * 1) / Math.max(1, jdKeywords.length) * 20))
      : 0;

    const hasNumbers = /\d+%|\$\d+|\d+ (years|months|people|engineers|users|customers|projects)/.test(resume);
    const hasYears = /\b\d{1,2}\+?\s*(years?|yrs?)\b/i.test(resume);
    const hasSkillsSection = /skills|technologies|tech stack|stack:/i.test(resume);

    setResult({
      score,
      matched,
      missing: missing.slice(0, 15),
      recommendations: generateRecommendations(score, matched, missing, hasNumbers, hasYears, hasSkillsSection, resume, jd),
    });
    setAnalyzing(false);
  }

  function reset() {
    setJd('');
    setResume('');
    setResult(null);
  }

  const scoreColor = !result ? 'text-text/40' :
    result.score >= 75 ? 'text-emerald-400' :
    result.score >= 50 ? 'text-yellow-400' :
    'text-red-400';

  return (
    <div className="border border-accent/20 bg-accent/5">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-accent/10">
        <FileText size={12} className="text-accent" />
        <span className="mono text-[9px] font-bold text-accent tracking-widest">{tt.title}</span>
        <div className="h-px flex-1 bg-accent/10" />
        <span className="mono text-[7px] text-text/30">{tt.subtitle}</span>
      </div>

      <div className="p-5 space-y-4">
        {/* JD input */}
        <div>
          <label className="mono text-[7px] text-text/30 block mb-1">{tt.jdLabel}</label>
          <textarea
            value={jd}
            onChange={e => { setJd(e.target.value); setResult(null); }}
            placeholder={tt.jdPlaceholder}
            rows={4}
            className="w-full bg-bg border border-border px-3 py-2 mono text-[10px] focus:outline-none focus:border-accent/50 transition-colors resize-none placeholder:text-text/20"
          />
        </div>

        {/* Resume input */}
        <div>
          <label className="mono text-[7px] text-text/30 block mb-1">{tt.resumeLabel}</label>
          <textarea
            value={resume}
            onChange={e => { setResume(e.target.value); setResult(null); }}
            placeholder={tt.resumePlaceholder}
            rows={6}
            className="w-full bg-bg border border-border px-3 py-2 mono text-[10px] focus:outline-none focus:border-accent/50 transition-colors resize-none placeholder:text-text/20"
          />
        </div>

        {/* Privacy notice */}
        <p className="mono text-[7px] text-text/30 italic flex items-center gap-1">
          <AlertCircle size={8} /> {tt.privacy}
        </p>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={analyze}
            disabled={!canAnalyze || analyzing}
            className="flex-1 py-2.5 bg-accent text-black mono text-[9px] font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {analyzing ? <><Loader2 size={11} className="animate-spin" /> {tt.analyzing}</> : <>{tt.analyze} →</>}
          </button>
          <button
            onClick={reset}
            className="px-4 py-2.5 bg-surface text-text-muted mono text-[9px] font-bold hover:text-text border border-border transition-colors"
          >
            {tt.reset}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-3 pt-2">
            {/* Score */}
            <div className="bg-bg border border-border p-4 text-center">
              <p className="mono text-[7px] text-text/30 mb-1">{tt.score}</p>
              <p className={`text-4xl font-black ${scoreColor}`}>{result.score}<span className="text-lg text-text/40">/100</span></p>
              <div className="h-1.5 bg-border mt-3 overflow-hidden">
                <div
                  className={`h-full transition-all ${result.score >= 75 ? 'bg-emerald-400' : result.score >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                  style={{ width: `${result.score}%` }}
                />
              </div>
            </div>

            {/* Matched + missing keywords side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="bg-bg border border-border p-3">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={11} className="text-emerald-400" />
                  <span className="mono text-[8px] font-bold text-emerald-400">{tt.matched} ({result.matched.length})</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {result.matched.slice(0, 30).map(k => (
                    <span key={k} className="mono text-[8px] px-1.5 py-0.5 bg-emerald-400/10 text-emerald-300 border border-emerald-400/20">
                      {k}
                    </span>
                  ))}
                  {result.matched.length === 0 && <span className="mono text-[8px] text-text/30">— none —</span>}
                </div>
              </div>
              <div className="bg-bg border border-border p-3">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle size={11} className="text-red-400" />
                  <span className="mono text-[8px] font-bold text-red-400">{tt.missing} ({result.missing.length})</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {result.missing.slice(0, 30).map(k => (
                    <span key={k} className="mono text-[8px] px-1.5 py-0.5 bg-red-400/10 text-red-300 border border-red-400/20">
                      {k}
                    </span>
                  ))}
                  {result.missing.length === 0 && <span className="mono text-[8px] text-text/30">— perfect —</span>}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-bg border border-border p-3">
              <div className="mono text-[8px] font-bold text-accent mb-2">{tt.recommendations}</div>
              <ul className="space-y-1.5">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="mono text-[9px] text-text/70 leading-relaxed flex gap-2">
                    <span className="text-accent shrink-0">→</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
