# WProTalents Intel — Master Build Plan
**Project:** https://latam-intel.vercel.app  
**GitHub:** https://github.com/wprotalents-ctrl/Latam-Intel  
**Owner:** Juan · WProTalents · wprotalents@gmail.com  
**WhatsApp:** +573243132500  
**Lead capture:** https://leads.wprotalents.lat/ (POST JSON)  
**Stack:** React 19 + Vite + TypeScript · Tailwind CSS · Firebase Auth/Firestore · Supabase · Vercel serverless · Framer Motion · Lucide icons  
**Deploy:** Vercel — auto-deploys on push to `main`

---

## 🎯 MISSION
Convert 23,000 LinkedIn connections → 1,000–2,000 paying subscribers at $29/mo.

**Funnel:**
LinkedIn post → latam-intel.vercel.app → free salary teaser → **email gate** (leads.wprotalents.lat + Beehiiv) → nurture → upgrade $29/mo Executive Membership

**Two user types:**
- `candidate` — LATAM tech professional seeking remote USD roles
- `company` — US/EU hiring manager seeking LATAM talent (completely separate portal)

**Revenue math:**
23K connections × 3% CTR = 690 visitors/post × 15% email capture = 100 leads × 5% paid = 5 subscribers/post  
3 posts/week = ~60 new subscribers/month → Month 6: 360 × $29 = **$10,440 MRR**

---

## ✅ FULLY BUILT (as of April 2026)

### Authentication
- Firebase Auth (email/password + Google OAuth) with role picker on first login
- `userRole: 'candidate' | 'company'` stored in Firestore `users/{uid}.role`
- Role gates the entire UI — company users **never** see job listings

### Job Aggregator (`api/jobs.ts`)
**7 active sources** with 30-min in-memory cache:
1. Remotive — free, no key
2. Arbeitnow — free, no key
3. RemoteOK — free, no key
4. Jobicy — free, no key
5. The Muse — requires `THE_MUSE_API_KEY` (env)
6. Adzuna — requires `ADZUNA_APP_ID` + `ADZUNA_APP_KEY` (env, already set)
7. Findwork — requires `FINDWORK_API_KEY` (env)

### Candidate Portal (`/` → Jobs tab)
- Live job feed with region + quick filters
- **Email gate on MarketValueTeaser:** local salary shows free, remote (USD) blurred until email captured → POST to `leads.wprotalents.lat` + `/api/subscribe-newsletter` (Beehiiv) in parallel
- **CandidateResourcesPanel:** 7 sections with creative names and curated real articles:
  - `launch` — "Launch Protocol" (START HERE)
  - `strike` — "Strike Package" (GET HIRED)
  - `roomread` — "Room Read" (INTERVIEW)
  - `ratecard` — "Rate Card" (NEGOTIATE)
  - `zerocommute` — "Zero-Commute Stack" (REMOTE)
  - `compound` — "Compound Career" (LONG GAME)
  - `aileverage` — "AI Leverage" (FUTURE-PROOF)
- MarketValueTeaser: trilingual EN/ES/PT, role/country/years dropdowns, pure computation (zero API cost)
- LinkedInBoost modal: generates featured profile post

### Company Client Portal (`Dashboard` view for `company` role)
- Completely separate from candidate dashboard — no bleed
- `ClientJobPostForm`: role / seniority / country / salary / description / planType (free|promoted)
- `ClientInsightsCard`: hiring plan + network reach stats + promoted banner
- **WhatsApp CTA** for promoted plan: pre-filled `wa.me/573243132500` link with role/market/salary details
- Company curated resources (4 HBR/LinkedIn/Levels.fyi articles)

### Intelligence Dashboard (candidate/analyst view)
- World map widget, radar widget (shows briefing count)
- Weekly LATAM Signal article (editorial, updated manually)
- Real news feed (static, update in `TRANSLATIONS` object in App.tsx)
- AI Impact Brief + Today's Job News (from `/api/market-intel.ts` if available)
- Company resources curated articles (6 cards)
- **Newsletter subscribe strip** at bottom of main column (email → `/api/subscribe-newsletter`)
- **FX rates widget** (COP/USD, BRL/USD, ARS/USD — update static values periodically)
- Market Pulse sidebar (3 trend indicators + crypto news)
- Market intel charts from API (top hiring sectors, LATAM job volume, most active companies)
- AI Tool of Week card + Global Talent Watch (3 regions) in sidebar
- **Upgrade CTA** in sidebar: clean bullet list + $29/mo button → Lemon Squeezy

### Monetization
- `$29/mo` paywall gates `/members` premium content
- Lemon Squeezy checkout (`/api/create-checkout-session.ts`)
- NOWPayments crypto (`/api/create-crypto-charge.ts`)

### i18n
- Full EN/ES/PT across all components
- Lang persisted to `localStorage` key `wpro_lang`
- Toggle in header (EN/ES/PT buttons)

---

## 📁 KEY FILE MAP

```
src/
  App.tsx                  # Main shell. Routes by userRole + viewMode
  pages/
    JobsPage.tsx           # Candidate: job feed + MarketValueTeaser + 7-section resources
    MembersPage.tsx        # Premium members ($29/mo paywall)
  components/
    AuthModal.tsx          # Firebase auth + role picker (candidate/company)
    ClientInsightsCard.tsx # Company: hiring plan + reach + WhatsApp CTA
    ClientJobPostForm.tsx  # Company: post a role form
    CandidateIntel.tsx     # Premium: full market value dashboard
    LinkedInBoostModal.tsx # Candidate: LinkedIn post generator
    PostVacancyModal.tsx   # Company: vacancy intake modal
    SubscriptionSection.tsx# Upgrade / payment UI
  lib/
    intelligence.ts        # Pure computation engine — salary/market (ZERO API cost)
    hiringPlan.ts          # Company hiring plan (pure computation)
    networkReach.ts        # Network reach estimator (pure computation)
api/
  jobs.ts                  # Job aggregator — 7 sources, 30min cache
  subscribe-newsletter.ts  # POST email → Beehiiv + Supabase
  market-intel.ts          # Market signals from news APIs
  newsletter.ts            # Generate + send newsletter (Gemini + Beehiiv)
  linkedin-boost.ts        # LinkedIn post generation
  post-vacancy.ts          # Company vacancy intake
  create-checkout-session.ts  # Lemon Squeezy $29/mo checkout
  create-crypto-charge.ts     # NOWPayments crypto checkout
  _lib/
    beehiiv.ts             # Beehiiv API wrapper
    gemini.ts              # Gemini AI wrapper (use sparingly ~$0.01/call)
    supabase.ts            # Supabase client
    cors.ts                # CORS handler
    firebase.ts            # Firebase admin
```

---

## 🔑 ENVIRONMENT VARIABLES (set in Vercel dashboard)

| Variable | Used for | Required |
|---|---|---|
| `ADZUNA_APP_ID` + `ADZUNA_APP_KEY` | Job search (US/UK/BR) | Optional |
| `THE_MUSE_API_KEY` | Job search | Optional |
| `FINDWORK_API_KEY` | Job search | Optional |
| `BEEHIIV_API_KEY` + `BEEHIIV_PUB_ID` | Newsletter subscribe | ✅ Required |
| `GEMINI_API_KEY` | Briefing generation | Optional |
| `FIREBASE_SERVICE_ACCOUNT` | Firestore admin | ✅ Required |
| `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | Subscribers DB | ✅ Required |
| `NEWSDATA_API_KEY` | Market intel news | Optional |
| `LEMON_SQUEEZY_WEBHOOK_SECRET` | Subscription webhooks | ✅ Required |
| `NOWPAYMENTS_API_KEY` | Crypto payments | Optional |

---

## 🚧 NEXT PRIORITIES (low cost, high impact)

### PRIORITY 1 — Content: Update static editorial content
**Cost:** Zero API cost — just text edits  
**Files:** `src/App.tsx` → `TRANSLATIONS` object (EN/ES/PT)

Fields to update weekly:
- `signalTitle` / `signalDesc1` / `signalDesc2` / `signalSoWhat` — LATAM Signal article
- `newsFeedItems` — 5 news items with titles + real URLs
- `countryWatchItems` — USA / EU / LATAM market signals
- `aiToolName` / `aiToolTitle` / `aiToolDesc` / `aiToolWorkflow` — AI tool review
- `fiveLinksItems` — curated reading list (currently only 2 items in ES/PT, should be 5)
- FX rates widget (lines ~1420): update COP/USD, BRL/USD, ARS/USD values

### PRIORITY 2 — Fix: fiveLinksItems parity in ES and PT
**Cost:** Zero — just add 3 more items to ES and PT arrays  
**File:** `src/App.tsx` → `TRANSLATIONS.ES.fiveLinksItems` and `TRANSLATIONS.PT.fiveLinksItems`  
EN has 2 items, should have 5 (same URLs, translated titles/why)

### PRIORITY 3 — Growth: LinkedIn post templates
**Cost:** Zero new code — use existing `linkedin-boost.ts` endpoint  
**What:** Create 3 ready-to-post LinkedIn templates for Juan:
1. "LATAM AI salary is up 18% — here's the data" → link to salary teaser
2. "7 resources every LATAM dev needs to go remote" → link to Jobs tab
3. "We're looking for [role] in [market]" → link to company portal

### PRIORITY 4 — Conversion: A/B test email gate copy
**Cost:** Zero  
**File:** `src/pages/JobsPage.tsx` → `T` object → `teaserLockedLabel` and gate button text  
Currently: "Enter email to unlock" → test "See your remote salary in USD"

---

## 🤖 MASTER AI PROMPT (paste into Claude / ChatGPT / Gemini / DeepSeek)

```
# WProTalents Intel — AI Continuation Prompt

## What this is
You are continuing development on WProTalents Intel (https://latam-intel.vercel.app),
a LATAM tech workforce intelligence platform owned by Juan (WProTalents, +573243132500).
GitHub: https://github.com/wprotalents-ctrl/Latam-Intel
Stack: React 19 + Vite + TypeScript, Tailwind CSS, Firebase Auth+Firestore,
       Supabase, Vercel serverless /api/, Framer Motion, Lucide icons
Deploy: Vercel auto-deploys on push to main branch

## Ground rules (follow exactly)
- Run `npx tsc --noEmit` before every commit — zero TS errors
- `git add [specific files]` then commit with descriptive message then push
- All user-facing text must work in EN, ES, PT — add to the T object in each component
- Styling: Tailwind utility classes, `mono` class for monospace, `text-accent`/`bg-accent`
- No new npm packages unless essential
- No API calls at render time unless already done via existing /api/ endpoints

## Architecture (critical)
- `userRole: 'candidate' | 'company'` from Firestore drives entire UI split
- `candidate` → Jobs tab (JobsPage.tsx) + candidate dashboard
- `company` → Client portal (inside App.tsx, completely separate from candidate view)
- Company users NEVER see job listings — guard is `viewMode === 'Jobs' && userRole === 'candidate'`

## Active job sources (api/jobs.ts)
7 sources with 30-min in-memory cache:
Remotive, Arbeitnow, RemoteOK, Jobicy (all free/no key)
The Muse (THE_MUSE_API_KEY), Adzuna (ADZUNA_APP_ID + ADZUNA_APP_KEY), Findwork (FINDWORK_API_KEY)
All env vars already set in Vercel.

## Lead capture
Email gate on MarketValueTeaser in JobsPage.tsx:
- Local salary shows free
- Remote (USD) blurred until email captured
- On submit: POST to https://leads.wprotalents.lat/ + POST /api/subscribe-newsletter in parallel
- State: email, captured, capturing

## WhatsApp CTA
In ClientInsightsCard.tsx — shows for promoted plan only
wa.me/573243132500 with pre-filled message (role/market/salary/timeline)

## What still needs doing (do in this order)
1. Fix fiveLinksItems in ES and PT translations (src/App.tsx) — add 3 more items to match EN's 5
2. Update static editorial content weekly (signalTitle, newsFeedItems, countryWatchItems, aiToolName, FX rates)
3. Create LinkedIn post templates for Juan (content only, no code)
4. Any bug fixes or UX improvements as discovered

## File locations
- Main dashboard: src/App.tsx
- Job portal (candidates): src/pages/JobsPage.tsx
- Salary calculator: src/lib/intelligence.ts (pure computation, no API)
- Company form: src/components/ClientJobPostForm.tsx
- Company insights: src/components/ClientInsightsCard.tsx
- Newsletter API: api/subscribe-newsletter.ts → Beehiiv via api/_lib/beehiiv.ts

## Revenue funnel (keep this in mind for all decisions)
LinkedIn → latam-intel.vercel.app → MarketValueTeaser email gate → Beehiiv nurture → $29/mo upgrade
23K connections → 690 visitors → 100 leads → 5 subscribers per LinkedIn post
Target: 360 subscribers × $29 = $10,440 MRR by month 6
```

---

*Last updated: April 2026 — reflects actual production state*
