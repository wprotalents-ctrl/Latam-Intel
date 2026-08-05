# Latam-Intel — External AI Review Brief

**Product:** Latam-Intel — a free job-intelligence portal for LATAM tech professionals and the US/EU companies that hire them. Currently in public beta, no login required.

**Why this doc exists:** We want an outside perspective on (1) what data/features would actually be useful to candidates and hiring managers that we don't have yet, and (2) what's currently built that could be improved or extended. The reviewer should be able to give actionable product feedback without needing to clone the repo or run the app.

**Audience for review:** A senior product person or domain expert in HR tech / job boards / market data SaaS. They should read this doc and the linked code, then come back with prioritized recommendations.

**Reviewer constraints:** No proprietary data, no PII, no production secrets needed. The product is publicly accessible.

---

## 1. Product context

### What is it?

A SaaS dashboard that gives LATAM tech talent and the companies that hire them **real-time market intelligence**:
- Live salary benchmarks (local pay + remote-USD premium) for 10 roles × 5 countries
- Curated LATAM job board (6 sources)
- AI-generated weekly market briefings ("Maria")
- Country/region talent watch + recruitment tech reviews
- For candidates: free ATS resume checker, salary calculator, career resources
- For companies: salary planning, "Post a Role" form, CV Radar (TBD)

### Where it fits in the market

- **Direct competitors:** Levels.fyi (global, generic), Glassdoor (job listings, salary, but no LATAM depth), LinkedIn Salary (paywalled, incomplete LATAM data), Pave/OptionImpact (comp planning, enterprise-only)
- **Adjacent:** Built In (city-specific, no LATAM), Honeypot (Europe only), Terminal/Howdy/Mismo (LATAM-focused, but talent marketplace — different angle)
- **Our wedge:** Founder-led, LATAM-native, free beta to build network effect, then convert companies to paid comp planning / radar / role distribution

### Business model (V1 free, V2 paid)

- **Free forever (candidates):** salary calc, ATS checker, market intel, jobs board, career resources
- **Beta free (companies):** everything except radar
- **Paid tiers (planned, not built):**
  - Starter $49/mo: salary calc + 5 radars/mo + job post distribution
  - Pro $199/mo: unlimited radars + candidate database + comp planning
  - Enterprise: API access, custom benchmarks, ATS integration

### Brand & UX

- Same orange (#ff6b00) as sister product WProTalents (`wprotalents.lat`)
- Design: dark mode + monospaced type + accent borders, "telemetry dashboard" aesthetic
- Trilingual (EN/ES/PT)
- Two portals via toggle: candidate (default) / company

---

## 2. Tech stack (current)

| Layer | Tech | Notes |
|---|---|---|
| Frontend | React 19 + Vite 6 + TypeScript 5.8 | SPA, no SSR |
| Styling | Tailwind 4 + custom design system in `src/index.css` | Dark mode primary, low-density mono |
| Animation | motion (Framer Motion v12) | Page transitions, micro-interactions |
| Charts | recharts | Bar charts in salary/market widgets |
| Icons | lucide-react | — |
| Backend | Vercel serverless functions (`/api/*.ts`) | 12 functions max (Hobby plan) |
| Database | Supabase Postgres | `salary_benchmarks`, `salary_benchmarks_proposed`, `members`, `submissions` tables |
| AI | Google Gemini (`@google/genai`) | "Maria" market briefings |
| News | NewsData.io | News feed widget |
| Email | Resend (planned) + Beehiiv (newsletter) | Members list, transactional |
| Payments | Stripe (planned, not built) | Future paid tiers |
| Hosting | Vercel | Custom domain `intel.wprotalents.lat` |
| Auth | None currently | Free portal, no login. Firebase config exists but unused. Auth planned for V2 paid features. |
| Cron | Vercel cron `0 8 1 * *` | Monthly salary data refresh |

**Vercel Hobby limits to know about:**
- 12 serverless functions (we use 12: cron-refresh-salary, cvradar, jobs, market-intel, members, payments, submissions, webhooks, newsletter/generate, newsletter/send, plus the auto-generated `/api/cvradar/[...path]` = NO, this is 1. Actually 11 + 1 shared, ~12.)
- 100 GB bandwidth/mo
- No preview deploys on private repos

---

## 3. Live URLs (for the reviewer to click around)

- **Public site (current main branch):** https://latam-intel-yhg3-pt288891k-juans-projects-cfd3d759.vercel.app/
- **WProTalents (sister site):** https://wprotalents.lat (click "Intelligence" in nav → jumps to Latam-Intel)
- **Custom domain (DNS configured):** https://intel.wprotalents.lat
- **GitHub:** https://github.com/wprotalents-ctrl/Latam-Intel (main branch)

The reviewer can use the preview URL (gated by Vercel SSO, Juan can grant access) or the public custom domain.

---

## 4. Code map (what to read in what order)

If the reviewer wants to understand the system end-to-end, read in this order:

### 4.1 Start here — the app shell
- **`src/main.tsx`** (50 lines) — entry point, mounts `<App />` in `#root`
- **`src/App.tsx`** (1570 lines) — the whole UI: state, routing, portal toggle, nav, all section rendering. Big file but linear.
- **`src/index.css`** — design tokens (CSS variables), component utilities (`.mono`, `.grid-bg`, accent borders)

### 4.2 Then the data layer
- **`src/lib/intelligence.ts`** (35KB) — salary calc engine. **This is the core IP.**
  - `BASE_SALARY` table — local mid-anchors by (role × country), calibrated to Juan's verified LATAM bands (Mismo/Howdy/Levels.fyi/Nexton/Terminal audit, 2026-08-04)
  - `SENIORITY_MULT`, `REMOTE_MULT`, `ENGLISH_MULT` — multipliers
  - `getSeniority(yearsExp)` — junior ≤3 / mid ≤6 / senior ≤10 / staff 10+
  - `computeMarketValue()` — the actual salary math
  - `computeSalaryGap()` — local vs remote
  - `getBestMarkets()` — opportunity ranking by country
  - `getSkillsROI()` — boost per skill
  - `getRemoteReadiness()` — score 0-100
  - `applyLiveOverrides()` — pulls from `salary_benchmarks` Supabase table at module load, non-blocking
- **`src/lib/matchingEngine.ts`** (11KB) — candidate ↔ role ↔ company matching for CV Radar
- **`src/lib/hiringPlan.ts`** (1KB) — budget calculator (headcount × loaded cost)
- **`src/lib/networkReach.ts`** (1.5KB) — addressable market estimate
- **`src/lib/supabase.ts`** — typed Supabase client

### 4.3 The big components
- **`src/components/SalaryCalculator.tsx`** (14KB) — the salary calc UI. Has an `emailGate` prop so it works differently on candidate portal (lead capture) vs company portal (direct view, no gate).
- **`src/components/ATSChecker.tsx`** (16KB) — NEW 2026-08-04. Local-only JD + resume matcher. Returns 0-100 score + matched/missing keywords + recommendations. Privacy-first: nothing leaves the browser.
- **`src/components/CandidateResources.tsx`** (21KB) — NEW 2026-08-04. 4 expandable cards: LinkedIn optimizer, CV tips, AI-for-employment, top courses. Trilingual.
- **`src/components/CompanyIntelPanel.tsx`** (15KB) — company "Market Intelligence" tab
- **`src/components/ClientJobPostForm.tsx`** (8KB) — company "Post a Role" form
- **`src/components/CVRadarDashboard.tsx`** (12KB) — CV Radar "Coming Soon" placeholder (needs auth in V2)
- **`src/components/CandidateIntel.tsx`** (37KB) — candidate dashboard widgets
- **`src/components/RadarDetailsPage.tsx`** (15KB) — radar detail view
- **`src/components/MatchDetailsModal.tsx`** (15KB) — match explanation modal
- **`src/components/LinkedInBoostModal.tsx`** (17KB) — LinkedIn optimization
- **`src/components/PostVacancyModal.tsx`** (17KB) — vacancy posting
- **`src/components/CVRadarForm.tsx`** (16KB) — radar creation form
- **`src/components/SubscriptionSection.tsx`** (5KB) — beta access CTA
- **`src/components/ErrorBoundary.tsx`** (2.5KB) — crash recovery

### 4.4 The pages
- **`src/pages/JobsPage.tsx`** (81KB) — full job board page (largest file, consider splitting)
- **`src/pages/MembersPage.tsx`** (43KB) — premium members / paywall placeholder
- **`src/pages/PrivacyPage.tsx`** (13KB) — privacy policy

### 4.5 The API serverless functions (`/api/*.ts`)
- **`api/jobs.ts`** (12KB) — 6-source job aggregator (Adzuna, LinkedIn, Bumeran, RemoteOK, WeWorkRemotely, Arbeitnow). Returns `{ jobs, health, cached }` with per-source health tracking.
- **`api/market-intel.ts`** (5KB) — fetches news + generates AI brief via Gemini. Graceful empty responses.
- **`api/cvradar.ts`** (5.5KB) — CV Radar match scoring (needs auth, currently stub)
- **`api/cron-refresh-salary.ts`** (5KB) — monthly: promotes `salary_benchmarks_proposed` (admin) → `salary_benchmarks` (live)
- **`api/members.ts`** (4KB) — member signup (captures email for the salary calc gate)
- **`api/submissions.ts`** (10KB) — generic form submissions handler
- **`api/payments.ts`** (4KB) — Stripe webhook stubs (V2)
- **`api/webhooks.ts`** (6KB) — generic webhook receiver
- **`api/newsletter/generate.ts`** (4KB) — AI newsletter generation
- **`api/newsletter/send.ts`** (3KB) — newsletter send via Beehiiv

### 4.6 The shared API libs (`api/_lib/`)
- **`gemini.ts`** — Gemini client + prompt helpers
- **`news.ts`** — NewsData.io client
- **`supabase.ts`** — Supabase admin client
- **`firebase.ts`** — Firebase admin (unused currently)
- **`cors.ts`** — CORS middleware
- **`beehiiv.ts`** — Beehiiv newsletter client

### 4.7 The database schema
- **`supabase-schema.sql`** (~330 lines) — every table + RLS + the salary seed block
  - `salary_benchmarks` (50 rows) — live source for the calc override
  - `salary_benchmarks_proposed` — admin staging area for monthly updates
  - `members` — captured emails
  - `submissions` — generic form data

### 4.8 Config
- **`vercel.json`** — build + cron schedule (`0 8 1 * *`)
- **`vite.config.ts`** — `fileURLToPath(import.meta.url)` for cross-platform
- **`tsconfig.json`** — excludes `functions/`
- **`firebase-applet-config.json`** + **`firestore.rules`** + **`firestore-schema.ts`** — Firebase remnants from an earlier design (not currently used in production)

---

## 5. What's actually working vs what's stubbed

### ✅ Working in production (live today)

| Feature | Where | Notes |
|---|---|---|
| Salary calculator (both portals) | `src/components/SalaryCalculator.tsx` | Math verified to Juan's audit |
| ATS Resume Checker (candidate) | `src/components/ATSChecker.tsx` | Local-only, no server roundtrip |
| Candidate Resources hub | `src/components/CandidateResources.tsx` | 4 expandable cards, trilingual |
| Job board (6 sources) | `api/jobs.ts` + `src/pages/JobsPage.tsx` | With per-source health tracking |
| Market Intel widget (AI brief) | `api/market-intel.ts` | Graceful empty if Gemini fails |
| News feed | `api/_lib/news.ts` | NewsData.io |
| Member email capture | `api/members.ts` | Hooked to salary calc gate |
| Portal toggle (candidate/company) | `src/App.tsx` line ~890 | localStorage persistence |
| Trilingual UI (EN/ES/PT) | scattered | Inconsistent — some components translate, some don't |
| FX rates ticker | `src/hooks/useFxRates.ts` | Free exchangerate.host |
| Monthly salary cron | `vercel.json` + `api/cron-refresh-salary.ts` | Scheduled, but not yet triggered |
| WProTalents ↔ Latam-Intel link | `wprotalents-ctrl/WProTalents` `b8310a3` | Intelligence button → Latam-Intel |

### ⚠️ Built but not active (stubs / placeholders)

| Feature | State | Why |
|---|---|---|
| CV Radar | "Coming Soon" placeholder | Needs auth (Firebase magic-link), clientId scoping, billing |
| Stripe payments | Stub webhook handler | No product to sell yet (free beta) |
| Login / user accounts | Removed from nav | Free beta, no auth needed |
| LinkedIn Boost modal | UI built but unused | Awaiting productization |
| PostVacancyModal | UI built but unused | Replaced by inline ClientJobPostForm |
| Newsletter generate/send | Built, not wired | Beehiiv integration pending |
| MembersPage | Built, paywalled | No real paid tier yet |
| RadarDetailsPage | Built, gated | Needs auth |
| MatchDetailsModal | Built, not triggered | CV Radar pre-req |

### ❌ Known gaps / TODOs

- No actual auth → no user-specific data (radars, applications, saved jobs)
- No real-time data feed for the 6 job sources — they cache 1 hour, may return stale
- Salary data is hand-curated monthly by admin, not auto-scraped
- No Stripe, no actual paid product
- No email transactional (Resend keys not set yet — only Resend npm dep installed)
- ATS checker doesn't have a "save my score" feature (privacy-first was intentional)
- No PDF export of salary reports (would be a strong lead magnet for companies)
- No notifications (browser push, email) when new jobs match a saved search
- No candidate-side job application tracking
- No company-side applicant tracking beyond the CV Radar "matches" view
- No SEO meta tags, no OG image, no sitemap (Vercel Hobby limits indexing)
- Lighthouse perf score not measured
- 51 Dependabot vulnerabilities (1 critical, 21 high) — `npm audit fix` pending
- Font sizes are 10-12px in 55% of text (low contrast) — deferred to post-funding

---

## 6. Specific questions for the reviewer

We have hypotheses. We want a second opinion on these before investing in them.

### 6.1 For candidates
1. **What data/features would make LATAM candidates actually return to this site weekly?** (vs bookmarking Levels.fyi / LinkedIn / Glassdoor)
2. **What free tools have the highest viral coefficient?** (e.g. ATS scorecard, salary comparison, "share my salary" image card)
3. **What signals from a candidate's profile (skills, years, location) would let us recommend specific jobs or companies to apply to?**
4. **Should we build a "Remote Job Readiness Score"?** (we have the lib stub `getRemoteReadiness()` but no UI)
5. **What's the right balance between "free intelligence" and "job board listings"?** Are we competing with LinkedIn or complementing it?

### 6.2 For companies (the paid side)
1. **What would a Head of Talent pay $49-199/mo for that they can't get from LinkedIn Recruiter?**
2. **Is "Post a Role" + distribution to 23K+ network the wedge, or is the comp benchmarking more valuable?**
3. **How valuable is the CV Radar (auto-match candidates to JDs) vs just a job board?**
4. **Should we charge per role posted (like LinkedIn) or per radar / per seat (like Greenhouse)?**
5. **What's the missing data layer that LATAM-focused companies want?** (e.g. equity benchmarks, retention risk, competitor comp, immigration/visa costs)

### 6.3 The product itself
1. **Is the dashboard layout scannable or overwhelming?** (lots of widgets, low-density type)
2. **The market intel feed reads like a Bloomberg terminal. Is that the right vibe for the audience?**
3. **What's missing from the candidate ↔ company funnel?** (right now candidates can see salaries, companies can see intel, but there's no real bridge)
4. **Is the "two portals via toggle" the right UX, or should we have separate subdomains?**
5. **Should we build a public API for the salary data?** (could be a moat + distribution channel)
6. **What's the right name for the product's signature insight?** (right now it's "Signal" / "Briefing" / "Watch" — three names for similar things)

### 6.4 GTM
1. **How do we get the first 1,000 candidates? First 100 companies?**
2. **Is the WProTalents hand-hunting brand an asset (cross-promotion) or a liability (too narrow)?**
3. **Should we be in Spanish/Portuguese markets or US/EU markets first?** (Latam-Intel's first market is LATAM candidates targeting US/EU jobs, but the company side is US/EU buyers)

---

## 7. Design system reference

For consistency when suggesting new features:

- **Accent color:** `#ff6b00` (orange) — same as WProTalents
- **Background:** pure black + surface grays
- **Text:** white + muted grays (40%, 60%, 80% opacity)
- **Type:** monospace primary for labels (`.mono` class), sans-serif for prose
- **Sizes:** 7-9px labels, 10-11px body, 14-18px section heads, 24-40px numbers
- **Borders:** 1px accent/20 opacity as standard card chrome
- **Layout:** 12-col grid with `gap-px bg-border` for the "telemetry" feel
- **Language:** EN primary, ES + PT secondary, swap via globe icon in nav
- **Theme:** dark-only currently, no light mode

---

## 8. Data sources we already use (or plan to)

- **Salary:** Mismo, Howdy, Levels.fyi LATAM, Nexton, Terminal, Glassdoor LATAM, LinkedIn Salary, Stack Overflow survey — currently hand-curated monthly
- **Jobs:** Adzuna, LinkedIn, Bumeran, RemoteOK, WeWorkRemotely, Arbeitnow — all free APIs (rate-limited)
- **News:** NewsData.io (free tier)
- **AI:** Gemini (`gemini-2.5-flash` for briefs)
- **FX:** exchangerate.host (free)
- **Future candidates:**
  - Levels.fyi scraper (Apify $5/mo)
  - Bumeran Scraper (Apify $5/mo)
  - OpenWeb Ninja Job Salary API (RapidAPI, 50 req/mo free)
  - ai-jobs.net GitHub dataset (refreshed weekly, free)

---

## 9. Constraints the reviewer should know

- **No auth today** → no user-level data, can't personalize
- **Vercel Hobby = 12 serverless functions** → server-side logic is at the limit
- **Free tier third-party APIs** → we can be rate-limited or downgraded
- **Manual salary data updates** → can lag market by 1-30 days
- **Founder-only product team** → no designer, no PM, no dedicated engineer. Reviewer feedback should be "what to build next" prioritized for a 1-2 person team.
- **Two sister products under WProTalents brand** → recommendations should consider that we can cross-pollinate from wprotalents.lat recruitment traffic (premium headhunting, editorial)
- **English-first company, Spanish/Portuguese product** → most context is in English, copy is trilingual

---

## 10. What we want from the reviewer

A 1-2 page response that prioritizes:

1. **Top 3 features/data we should add next** (with reasoning)
2. **Top 2 things we have today that aren't pulling weight** (with reasoning — to deprecate or pivot)
3. **Top 1 blind spot** — what we're missing entirely
4. **GTM recommendation** — how to get the first paying customer
5. **Any red flags** about the current product or architecture

Format: bullet points, ranked, with specific actionable ideas. No need to be exhaustive — we want a clear "do this next" answer.

Optional: a separate list of "nice to have later" ideas (no need to rank).

---

## Appendix: Quick links to the most important files

- Salary engine: `src/lib/intelligence.ts`
- Salary UI: `src/components/SalaryCalculator.tsx`
- Main app shell: `src/App.tsx`
- Job aggregator: `api/jobs.ts`
- Market intel: `api/market-intel.ts`
- DB schema + salary seed: `supabase-schema.sql`
- Monthly cron: `api/cron-refresh-salary.ts`
- Handoff doc: `HANDOFF_2026-08-04_EOD.md`

---

**End of brief. Thank you for the review.**
