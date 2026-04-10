# WProTalents Intel — Master Build Plan
**Project:** https://latam-intel.vercel.app  
**GitHub:** https://github.com/wprotalents-ctrl/Latam-Intel  
**Owner:** Juan · WProTalents · wprotalents@gmail.com  
**Lead capture:** https://leads.wprotalents.lat/  
**Newsletter:** Beehiiv (API already wired in `/api/_lib/beehiiv.ts`)  
**Stack:** React 19 + Vite + TypeScript · Tailwind CSS · Firebase Auth/Firestore · Supabase · Vercel serverless · Framer Motion · Lucide icons

---

## 🎯 MISSION
Turn 23,000 LinkedIn connections into 1,000–2,000 paying subscribers at $29/mo.  
**Funnel:** LinkedIn post → latam-intel.vercel.app → free teaser → email capture (leads.wprotalents.lat) → nurture via Beehiiv → upgrade to $29/mo Executive Membership.

**Two user types:**
- `candidate` — LATAM tech professional seeking remote USD roles
- `company` — US/EU hiring manager seeking LATAM talent

---

## 📁 PROJECT STRUCTURE (key files only)

```
src/
  App.tsx                        # Main dashboard. Routes: / → App, /members → MembersPage
  pages/
    JobsPage.tsx                 # Candidate job portal (live feed + resources + teaser)
    MembersPage.tsx              # Premium members area ($29/mo paywall)
  components/
    CandidateIntel.tsx           # Full market value dashboard (premium)
    ClientJobPostForm.tsx        # Company: post a role form
    ClientInsightsCard.tsx       # Company: hiring plan + network reach display
    LinkedInBoostModal.tsx       # Candidate: LinkedIn post generator
    PostVacancyModal.tsx         # Company: vacancy intake modal
    AuthModal.tsx                # Firebase auth + role picker (candidate/company)
  lib/
    intelligence.ts              # Pure computation engine — salary/market data (NO API COST)
    hiringPlan.ts                # Company hiring plan generator (pure computation)
    networkReach.ts              # Network reach estimator (pure computation)
    supabase.ts                  # Supabase client
api/
  jobs.ts                        # Job aggregator — 5 sources (Remotive, Arbeitnow, RemoteOK, Jobicy, The Muse)
  subscribe-newsletter.ts        # POST email → Beehiiv + Supabase
  newsletter.ts                  # Generate + send newsletter via Gemini + Beehiiv
  market-intel.ts                # Market signals from free news APIs
  post-vacancy.ts                # Company vacancy intake
  linkedin-boost.ts              # LinkedIn post generation
  _lib/
    beehiiv.ts                   # Beehiiv API wrapper (subscriptions + posts)
    cors.ts                      # CORS handler
```

---

## ✅ WHAT IS ALREADY BUILT

### Authentication
- Firebase Auth (email/password) with role picker on first login
- `userRole: 'candidate' | 'company'` stored in Firestore `users/{uid}.role`
- Role gates the entire UI — company never sees job listings

### Candidate Portal (`/` → Jobs tab)
- Live job feed from 5 free APIs (~400–500 jobs, 30min cache)
- Region filters: All / LATAM / USA / Europe / Worldwide
- Quick filters: AI/ML, Software Engineer, Data, DevOps, Product, Design, Remote LATAM
- MarketValueTeaser: free calculator showing local + remote salary (leads to $29/mo)
- CandidateResourcesPanel: 7 sections with curated articles
- LinkedInBoost modal: generates featured profile post

### Premium Members (`/members`)
- Full CandidateIntel dashboard: Market Value, Skills ROI, Best Markets, Remote Readiness
- Newsletter archive (Supabase)
- Salary intelligence table
- Resources grid
- "Hire with WPro" tab for company users

### Company Client Portal (inside App.tsx Dashboard)
- Completely separate view from candidate dashboard
- ClientJobPostForm: role/seniority/country/salary/description/planType (free|promoted)
- ClientInsightsCard: hiring plan + network reach + promoted banner
- Company curated resources

### Intelligence Dashboard (candidate/analyst view)
- World map, radar widget
- Weekly LATAM signal (hardcoded, refreshed manually)
- FX rates widget
- Intelligence briefings feed (Firestore, can be Gemini-generated)
- Market intel from `/api/market-intel.ts`

### i18n
- Full EN/ES/PT across all components
- Lang persisted to `localStorage` key `wpro_lang`
- Toggle in header

### Monetization
- `$29/mo` paywall gates premium content
- Lemon Squeezy checkout (`/api/create-checkout-session.ts`)
- Crypto payments (`/api/create-crypto-charge.ts` — NOWPayments)
- Upgrade strip at bottom of candidate dashboard

---

## 🚧 WHAT NEEDS TO BE DONE (in priority order)

---

### TASK 1 — Add more job sources to `api/jobs.ts`
**Goal:** More volume, more LATAM-relevant jobs  
**Cost:** Zero — all free APIs, no keys needed  
**File:** `api/jobs.ts`

Add these functions alongside existing ones:

```typescript
// HiringCafe — tech-focused, free, no key
async function hiringcafe(): Promise<any[]> {
  try {
    const r = await timed("https://hiring.cafe/api/v1/jobs?limit=100");
    const data = await r.json();
    return (data.jobs || data || []).map((j: any) => ({
      id: `hiringcafe-${j.id || j._id}`,
      title: j.title || j.job_title,
      company: j.company || j.company_name,
      location: j.location || 'Remote',
      url: j.url || j.apply_url || `https://hiring.cafe/jobs/${j.id}`,
      salary: j.salary || j.compensation || null,
      tags: Array.isArray(j.tags) ? j.tags.join(', ') : (j.skills || ''),
      source: 'HiringCafe',
      region: region(j.location || ''),
      postedAt: j.created_at || j.date_posted || null,
    }));
  } catch { return []; }
}

// Findwork.dev — developer roles, free, no key
async function findwork(): Promise<any[]> {
  try {
    const r = await timed("https://findwork.dev/api/jobs/?remote=true&limit=100",
      { headers: { Authorization: `Token ${process.env.FINDWORK_API_KEY || ''}` } });
    const data = await r.json();
    return (data.results || []).map((j: any) => ({
      id: `findwork-${j.id}`,
      title: j.role,
      company: j.company_name,
      location: j.location || 'Remote',
      url: j.url,
      salary: null,
      tags: (j.keywords || []).join(', '),
      source: 'Findwork',
      region: region(j.location || ''),
      postedAt: j.date_posted || null,
    }));
  } catch { return []; }
}

// Adzuna — already have API keys (ADZUNA_APP_ID + ADZUNA_APP_KEY in Vercel env)
async function adzuna(): Promise<any[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return [];
  try {
    const countries = [
      { code: 'us', query: 'software engineer remote' },
      { code: 'gb', query: 'software engineer remote' },
      { code: 'br', query: 'desenvolvedor remote' }, // Brazil
    ];
    const results = await Promise.allSettled(
      countries.map(c =>
        timed(`https://api.adzuna.com/v1/api/jobs/${c.code}/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=50&what=${encodeURIComponent(c.query)}&content_type=application/json`)
          .then(r => r.json())
      )
    );
    const jobs: any[] = [];
    for (const r of results) {
      if (r.status === 'fulfilled') jobs.push(...(r.value?.results || []));
    }
    return jobs.map((j: any) => ({
      id: `adzuna-${j.id}`,
      title: j.title,
      company: j.company?.display_name || 'Unknown',
      location: j.location?.display_name || 'Remote',
      url: j.redirect_url,
      salary: j.salary_min ? `$${Math.round(j.salary_min/1000)}k–$${Math.round((j.salary_max||j.salary_min)/1000)}k` : null,
      tags: j.category?.label || '',
      source: 'Adzuna',
      region: region(j.location?.display_name || ''),
      postedAt: j.created || null,
    }));
  } catch { return []; }
}
```

Then add to the `Promise.allSettled` call at the bottom:
```typescript
const [r1, r2, r3, r4, r5, r6, r7, r8] = await Promise.allSettled([
  remotive(), arbeitnow(), remoteok(), jobicy(), themuse(),
  hiringcafe(), findwork(), adzuna()
]);
```

---

### TASK 2 — Rebuild candidate resources (`src/pages/JobsPage.tsx`)
**Goal:** 7 fresh sections, creative names, curated real links, zero Gaby attribution  
**Cost:** Zero — all static curated links, no API calls at render time  
**File:** `src/pages/JobsPage.tsx` → `PORTAL_SECTIONS` constant

**New section structure:**

```
SECTION 1: "Launch Protocol"    (tag: START HERE)
  Inspired by: job search strategy / north star / SSoT / tools / brag doc
  Sources: HBR, Notion, Jobscan, Glassdoor, LinkedIn Learning

SECTION 2: "Strike Package"     (tag: GET HIRED)
  Inspired by: resume keywords, ATS, cover letter, LinkedIn profile, tools
  Sources: Jobscan, resume.io, LinkedIn Talent Blog, HBR, Grammarly

SECTION 3: "Room Read"          (tag: INTERVIEW)
  Inspired by: prep for any interview, remote interview, tech interview, questions to ask
  Sources: techinterviewhandbook.org, Pramp, The Muse, Glassdoor, Toptal

SECTION 4: "Rate Card"          (tag: NEGOTIATE)
  Inspired by: salary expectation, multiple offers, benchmarks, scripts
  Sources: Levels.fyi, HBR, Glassdoor, remote.com, LinkedIn Salary

SECTION 5: "Zero-Commute Stack" (tag: REMOTE)
  Inspired by: remote tools, job boards, LinkedIn outreach, BLUF, wellbeing
  Sources: GitLab handbook, Remotive, LinkedIn, HBR, Notion

SECTION 6: "Compound Career"    (tag: LONG GAME)
  Inspired by: self-discovery, assessments, transitions, trust, first 90 days
  Sources: CliftonStrengths, 16personalities, HBR, LinkedIn Learning, Coursera

SECTION 7: "AI Leverage"        (tag: FUTURE-PROOF)
  Inspired by: AI skills, prompt engineering, system design, future of jobs
  Sources: DeepLearning.ai, Kaggle, GitHub (system-design-primer), WEF, Coursera
```

Each article entry format:
```typescript
{ 
  title: string,     // Creative, benefit-focused title (NOT a copy of Gaby's)
  desc: string,      // 1-sentence description of what reader gets
  url: string,       // Real, working URL to free resource
  tag: string,       // Category label shown on card
  wpro?: boolean     // true = WProTalents-owned resource (gold badge)
}
```

---

### TASK 3 — Email gate on MarketValueTeaser → leads.wprotalents.lat
**Goal:** Capture email at peak intent (after salary calculation)  
**Cost:** Zero — POST to leads.wprotalents.lat  
**File:** `src/pages/JobsPage.tsx` → `MarketValueTeaser` component

**Logic:**
1. User fills role + country + years → clicks Calculate
2. Local market mid shows immediately (hook — always visible)
3. Remote salary + uplift is BLURRED with email gate overlay
4. User enters email → POST to `https://leads.wprotalents.lat/` with `{ email, role, country, source: 'teaser' }`
5. Also POST to `/api/subscribe-newsletter` (Beehiiv) in parallel
6. On success: blur removed, full results visible + "Check your inbox" message

**Component state additions:**
```typescript
const [email, setEmail] = useState('');
const [captured, setCaptured] = useState(false);
const [capturing, setCapturing] = useState(false);

async function captureEmail() {
  setCapturing(true);
  try {
    await Promise.allSettled([
      fetch('https://leads.wprotalents.lat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, country, source: 'market_value_teaser' })
      }),
      fetch('/api/subscribe-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, subscriber_type: 'candidate', language: lang })
      })
    ]);
    setCaptured(true);
  } finally {
    setCapturing(false);
  }
}
```

**UI:** After local salary shows, the remote salary cell shows blurred `$••,•••` with an email input overlay. Simple, minimal, converts at the highest-intent moment.

---

### TASK 4 — WhatsApp CTA on promoted client plan
**Goal:** Convert "promoted" job post submissions into direct revenue conversations  
**Cost:** Zero — just a pre-filled wa.me link  
**File:** `src/components/ClientInsightsCard.tsx`

**Add below the promoted banner:**
```typescript
{planType === 'promoted' && (
  <a
    href={`https://wa.me/YOUR_WHATSAPP_NUMBER?text=${encodeURIComponent(
      `Hi Juan, I just posted a ${seniority}-level ${role} role via WProTalents Intel.\n\nHiring plan:\n- Best market: ${plan.bestCountry}\n- Timeline: ${plan.timeToHire} days\n- Salary: ${plan.salary > 0 ? '$'+plan.salary.toLocaleString() : 'TBD'}\n\nI'd like to activate the promoted search.`
    )}`}
    target="_blank"
    rel="noopener noreferrer"
    className="..."
  >
    <MessageCircle size={12} /> Activate Promoted Search on WhatsApp
  </a>
)}
```

Replace `YOUR_WHATSAPP_NUMBER` with Juan's WhatsApp number in international format (e.g., `5491112345678`).

---

## 🤖 MASTER AI PROMPT (paste into ANY AI)

```
# WProTalents Intel — AI Continuation Prompt

## Project context
You are continuing development on WProTalents Intel (https://latam-intel.vercel.app), 
a LATAM tech workforce intelligence platform and job portal owned by Juan (WProTalents).

GitHub: https://github.com/wprotalents-ctrl/Latam-Intel
GitHub token for push: Ask Juan for current token (expires)
Stack: React 19 + Vite + TypeScript, Tailwind CSS, Firebase Auth+Firestore, 
       Supabase (PostgreSQL), Vercel serverless (/api/), Framer Motion, Lucide icons
Deploy: Vercel — auto-deploys on push to main branch

## Key rules
- DO NOT modify existing APIs (Vercel /api/ functions) unless explicitly asked
- DO NOT install new npm packages unless essential — check if lucide-react, framer-motion already have what you need
- DO NOT rebuild pages — add small components and minimal integrations
- ALWAYS run `./node_modules/.bin/tsc --noEmit` before committing
- ALWAYS commit with `git add [specific files]` then push with the GitHub token
- ALL text must work in EN, ES, and PT — add to the T object in each file
- Styling: Tailwind utility classes only, monospace via `mono` class, accent color via `text-accent`/`bg-accent`

## Current state (as of April 2026)
- 5 job sources active in api/jobs.ts (Remotive, Arbeitnow, RemoteOK, Jobicy, The Muse)
- Adzuna keys exist in Vercel env (ADZUNA_APP_ID, ADZUNA_APP_KEY) but NOT wired to api/jobs.ts
- Beehiiv newsletter API wired in api/_lib/beehiiv.ts and api/subscribe-newsletter.ts
- Lead capture endpoint: https://leads.wprotalents.lat/ (POST JSON: { email, source, ... })
- User roles: 'candidate' sees job portal, 'company' sees client portal (completely separate views)
- Premium paywall at $29/mo via Lemon Squeezy (api/create-checkout-session.ts)
- Pure computation intelligence engine: src/lib/intelligence.ts (no API cost)
- i18n: EN/ES/PT via T objects in each component, lang from localStorage key 'wpro_lang'

## Monetization funnel
LinkedIn (23K connections) → latam-intel.vercel.app → MarketValueTeaser (free salary preview)
→ EMAIL GATE (POST to leads.wprotalents.lat + Beehiiv) → unlock remote salary
→ Nurture sequence → Upgrade to $29/mo Executive Membership → /members

## Pending tasks (do in this order)
1. api/jobs.ts: Add hiringcafe(), findwork(), adzuna() functions + include in Promise.allSettled
2. src/pages/JobsPage.tsx: Replace PORTAL_SECTIONS with 7 new sections (see section plan below)
3. src/pages/JobsPage.tsx: Add email gate to MarketValueTeaser (POST leads.wprotalents.lat)
4. src/components/ClientInsightsCard.tsx: Add WhatsApp CTA for promoted plan
5. After all changes: run tsc --noEmit, then git add + commit + push

## 7 candidate resource sections (PORTAL_SECTIONS in JobsPage.tsx)
Replace all current content. Structure: Record<SectionKey, PortalSection>
SectionKey type: 'launch' | 'strike' | 'roomread' | 'ratecard' | 'zerocommute' | 'compound' | 'aileverage'

SECTION 'launch' — label: "Launch Protocol", tag: "START HERE", Icon: Rocket, color: text-accent
Articles (5): job search strategy, tracking system, tools roundup, visual framework, brag doc
Sources: HBR, Notion templates, Jobscan, Glassdoor, LinkedIn Learning

SECTION 'strike' — label: "Strike Package", tag: "GET HIRED", Icon: FileText, color: text-emerald-400
Articles (6): ATS bypass, keyword strategy, LinkedIn magnetism, cover letter, resume tools, WPRO feature
Sources: Jobscan, LinkedIn Talent Blog, HBR, resume.io, Grammarly, WPro (#linkedin-boost)

SECTION 'roomread' — label: "Room Read", tag: "INTERVIEW", Icon: Mic2, color: text-blue-400
Articles (6): any interview method, remote interview setup, first interview guide, tech tools, research framework, questions to ask
Sources: techinterviewhandbook.org, Pramp, The Muse, Toptal, Glassdoor, Indeed

SECTION 'ratecard' — label: "Rate Card", tag: "NEGOTIATE", Icon: DollarSign, color: text-yellow-400
Articles (5): salary expectation script, comp data, LATAM USD gap, multiple offers decision, negotiation scripts
Sources: Levels.fyi, HBR, remote.com, Glassdoor, LinkedIn Salary Insights

SECTION 'zerocommute' — label: "Zero-Commute Stack", tag: "REMOTE", Icon: Globe, color: text-violet-400
Articles (5): remote work guide, best remote job boards, LinkedIn outreach templates, async communication, productivity+wellbeing
Sources: GitLab all-remote, Remotive, LinkedIn, HBR (BLUF article), Notion templates

SECTION 'compound' — label: "Compound Career", tag: "LONG GAME", Icon: Compass, color: text-pink-400
Articles (6): strengths assessment, personality test, transition framework, career pivot, trust at work, first 90 days
Sources: CliftonStrengths/Gallup, 16personalities, HBR (3 articles), LinkedIn Learning

SECTION 'aileverage' — label: "AI Leverage", tag: "FUTURE-PROOF", Icon: Zap, color: text-violet-400
Articles (6): AI skills ranking, prompt engineering course, system design primer, future of jobs, GitHub Copilot, free ML courses
Sources: Coursera, DeepLearning.ai, GitHub (donnemartin/system-design-primer), WEF, GitHub Copilot docs, Kaggle

## WhatsApp number for client CTA
Juan's WhatsApp: Ask Juan to confirm his WhatsApp in international format before implementing Task 4.
Pattern: https://wa.me/[NUMBER]?text=[URL_ENCODED_MESSAGE]

## Environment variables (already set in Vercel)
ADZUNA_APP_ID, ADZUNA_APP_KEY — for job search
BEEHIIV_API_KEY, BEEHIIV_PUBLICATION_ID — for newsletter
GEMINI_API_KEY — for briefing generation (use sparingly, ~$0.01/call)
FIREBASE_* — for auth/Firestore
SUPABASE_URL, SUPABASE_ANON_KEY — for members/subscribers

## Revenue target
23,000 LinkedIn connections × 3% CTR = ~690 visitors/post
Email capture at 15% = ~100 leads/post
Email → paid at 5% = ~5 subscribers/post
3 posts/week = ~60 new subscribers/month
Month 6 target: 360 subscribers × $29 = $10,440 MRR
```

---

## 📅 TODAY'S EXECUTION SEQUENCE

```
Step 1: Open api/jobs.ts → add hiringcafe(), findwork(), adzuna() → update Promise.allSettled
Step 2: Open src/pages/JobsPage.tsx:
        a) Change SectionKey type to new 7 keys
        b) Replace entire PORTAL_SECTIONS constant with new 7 sections
        c) Add email capture state + captureEmail() to MarketValueTeaser
        d) Add email gate UI after local salary shows (blur remote until captured)
Step 3: Open src/components/ClientInsightsCard.tsx → add WhatsApp CTA in promoted block
Step 4: Run: cd /path/to/latam-intel && ./node_modules/.bin/tsc --noEmit
Step 5: git add api/jobs.ts src/pages/JobsPage.tsx src/components/ClientInsightsCard.tsx
Step 6: git commit -m "Add job sources, rebuild candidate resources, add email gate + WhatsApp CTA"
Step 7: git remote set-url origin https://[GITHUB_TOKEN]@github.com/wprotalents-ctrl/Latam-Intel.git
Step 8: git push origin main
```
