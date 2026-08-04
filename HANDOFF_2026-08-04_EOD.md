# WProTalents + Latam-Intel — End of Day Handoff

**Session date:** 2026-08-04
**Author:** Mavis (CTO co-founder mode)
**For:** Juan + future Mavis session tomorrow

---

## TL;DR — What's Live Right Now

| Product | URL | State |
|---|---|---|
| **WProTalents** (premium headhunting) | https://wprotalents.lat | ✅ live, editorial orange, "Intelligence" button → Latam-Intel |
| **Latam-Intel** (job intelligence SaaS) | https://latam-intel-yhg3-pt288891k-juans-projects-cfd3d759.vercel.app/ | ✅ live, dashboard, salary calc fixed, candidate tools added |
| **Latam-Intel** (custom domain) | https://intel.wprotalents.lat | ✅ DNS CNAME set, points to latam-intel-yhg3 |
| **Latam-Intel** (old static landing) | https://latam-intel.vercel.app | ⚠️ old Vercel deployment — to delete, KEEP source file |

---

## Today's Commits (in order pushed)

### Latam-Intel (`wprotalents-ctrl/Latam-Intel`, `main` branch)
- `76eb887` **fix(salary): recalibrate to Juan's verified LATAM bands (Mismo/Howdy/Levels)** ← the big one today
- `c21aebd` **feat: add ATS Resume Checker + Candidate Resources hub to candidate portal**
- `a88bba0` feat: portal-specific content for candidate vs company (employment vs hiring)
- `b75c0ae` feat: salary calculator now on both candidate Dashboard and company portal
- `d0e57df` feat: wire up company portal with Market Intel / Post a Role / CV Radar tabs
- `de55819` fix: restore candidate/company portal toggle
- `75967c0` merge: bring restore-working fixes to main
- `3c5a827` fix: runtime crash 'userRole is not defined' on live site
- `70381ce` fix: jobs API + market-intel API + intelService env var handling
- `a8fe61e` fix: salary calc (mathematically verified) + monthly cron refresh + dashboard layout

### WProTalents (`wprotalents-ctrl/WProTalents`, `master` branch)
- `b8310a3` fix: Intelligence links → Latam-Intel preview URL (no login, free portal)

---

## Salary Calc Fix — The Big Change (commit 76eb887)

**The bug:** The old BASE_SALARY had mid anchors like Brazil backend = $14K, which after senior mult 1.55x → $21,700 → rounded to $21,500. Way under your verified junior floor of $25K.

**The fix:** Rebuilt the whole `BASE_SALARY` table against your Mismo/Howdy/Levels.fyi/Nexton/Terminal audit data. The new mid-anchors now land inside your verified bands for every (role, country) combo.

### New BASE_SALARY table (USD/yr, local mid-level 3-6y)

| Country | backend/fullstack/frontend/product | devops/data/data_eng | ai_ml | llm | eng_manager |
|---|---|---|---|---|---|
| BR | $45K | $55K | $65K | $70K | $58K |
| MX | $46K | $55K | $65K | $70K | $58K |
| CO | $42K | $50K | $55K | $60K | $54K |
| AR | $48K | $60K | $70K | $75K | $62K |
| CL | $51K | $60K | $70K | $75K | $65K |

### Multipliers (file: `src/lib/intelligence.ts`)
```ts
const SENIORITY_MULT = { junior: 0.59, mid: 1.00, senior: 1.55, staff: 2.17 };
const REMOTE_MULT    = { BR: 1.70, MX: 1.70, CO: 1.70, AR: 1.50, CL: 1.50 };
const RANGE_SPREAD   = 0.20;  // tightened from 0.30
```

### getSeniority (now matches your bands)
```ts
function getSeniority(yearsExp: number): SeniorityKey {
  if (yearsExp <= 3) return 'junior';   // 1-3y → Junior
  if (yearsExp <= 6) return 'mid';      // 4-6y → Mid
  if (yearsExp <= 10) return 'senior';  // 7-10y → Senior
  return 'staff';                       // 10+y → Staff/Lead
}
```

### Math examples (verified against your bands)
| Scenario | Old | New | Your verified band |
|---|---|---|---|
| BR backend mid (4y) local | $14,000 | **$45,000** | $38-53K ✓ |
| BR backend senior (7y) local | $21,700 | **$70,000** | $55-75K ✓ |
| BR backend senior (7y) remote | $65,100 | **$119,000** | typical $90-130K ✓ |
| BR AI/ML senior local | $27,900 | **$101,000** | $45-90K+ ✓ |
| CO backend senior local | $17,050 | **$65,000** | $50-65K ✓ |
| CL backend senior local | $21,700 | **$79,000** | $60-85K ✓ |
| AR backend senior local | $14,725 | **$74,500** | $60-80K ✓ |

### Supabase seed rows
`supabase-schema.sql` lines 229-281 were rewritten with the new calibration. To force-refresh the live `salary_benchmarks` table (currently empty in Supabase, so the const fallback is what users see right now):

```sql
-- Run in Supabase SQL Editor to replace the seed data
TRUNCATE public.salary_benchmarks;
-- Then re-run the insert block from supabase-schema.sql (lines 229-281)
```

Or just wait — the next monthly cron on the 1st will use the same values from the file.

---

## Candidate Portal — New Free Tools (commit c21aebd)

### ATS Resume Checker (`src/components/ATSChecker.tsx`)
- Paste JD + resume → get 0-100 ATS score, matched/missing keywords, recommendations
- **Local-only processing** (nothing leaves the browser — privacy guarantee)
- Trilingual (EN/ES/PT), trilingual UI labels

### Candidate Resources Hub (`src/components/CandidateResources.tsx`)
- 4 expandable cards, trilingual:
  1. **LinkedIn Profile Optimizer** — 7 changes to get into top 1% of recruiter searches
  2. **CV Optimization** — the 1-page format that beats ATS and survives 6-second scans
  3. **How to Use AI for Your Job Search** — Claude/GPT/Cursor/Perplexity stack used by $80-150K candidates
  4. **Best Courses to Advance Your Career** — CS50, System Design, AWS SAA, DL Specialization, English for Tech, Staff Engineer — all with direct links

### Where they render
- Candidate dashboard: Salary Calculator → ATS Checker → Candidate Resources
- Company portal: 3 tabs (Market Intel / Post a Role / CV Radar) with Salary Calculator at top of Salary Benchmarks view

---

## Pending / TODO for Tomorrow

### High priority
1. **Delete old `latam-intel.vercel.app` deployment** in Vercel — it's the static landing from before. The KEEP the file at `C:\Users\juanc\Downloads\Latam-Intel-extracted\Latam-Intel-restore-working\index.html` (33KB) — that's the design for the post-login marketing landing.
2. **Verify salary calc in production** — Vercel auto-deploys `76eb887` in ~2 min. Reload preview URL, try Brazil + Backend + 7 years → should show $70K local / $119K remote.
3. **Update salary_benchmarks table in Supabase** — re-run the seed block (see SQL snippet above) so future deploys use the verified values from the DB, not just the const fallback.

### Medium priority
4. **Rotate leaked credentials** (security hygiene):
   - GitHub PAT (leaked in earlier chat, see past session memory) — rotate at https://github.com/settings/tokens
   - Supabase service_role + publishable keys — leaked. Rotate at Supabase → Settings → API → Roll keys
5. **Add Firebase Auth to Post a Role + CV Radar** (post-login feature). Saved roadmap in memory — needs users (Firebase UID), clients (company accounts), radars (clientId-scoped), job_posts (clientId-scoped).
6. **Address 51 GitHub Dependabot vulnerabilities** (1 critical, 21 high, 23 moderate, 6 low) — `npm audit fix` in both repos.

### Low priority
7. **`package-lock.json` modified but uncommitted in WProTalents** — check + commit before next push
8. **Font/contrast audit** (55% text is 10-12px) — deferred until post-funding
9. **Supabase Pro ($25/mo) vs Resend (free, custom SMTP)** for email rate limit — only blocks partner testing, not the Latam-Intel beta

---

## Critical Files Map

| File | What it does | LOC |
|---|---|---|
| `src/lib/intelligence.ts` | Salary calc engine (BASE_SALARY, SENIORITY_MULT, REMOTE_MULT, getSeniority) | ~430 |
| `src/components/SalaryCalculator.tsx` | Salary UI (used on both portals, `emailGate` prop controls lead capture) | ~280 |
| `src/components/ATSChecker.tsx` | New ATS Resume Checker (local-only) | 363 |
| `src/components/CandidateResources.tsx` | New Candidate Resources hub (4 expandable cards) | 482 |
| `src/components/CompanyIntelPanel.tsx` | Company Market Intel tab | — |
| `src/components/ClientJobPostForm.tsx` | Company Post a Role tab | — |
| `src/components/CVRadarDashboard.tsx` | CV Radar "Coming Soon" placeholder | — |
| `src/App.tsx` | Main app shell, 1570 lines, portal toggle + nav | 1570 |
| `api/cron-refresh-salary.ts` | Monthly cron — promotes proposed → live salary_benchmarks | 134 |
| `api/jobs.ts` | 6 job board scrapers, returns `{ jobs, health, cached }` | — |
| `api/market-intel.ts` | Market intel API, graceful empty responses | — |
| `supabase-schema.sql` | All tables + RLS + salary seed rows | ~330 |
| `vercel.json` | Build + cron schedule (`0 8 1 * *`) | — |

---

## Key State (don't forget)

### Active GitHub PAT (for pushing)
- (Active PAT stored in Vercel team secrets, see past session memory) — needs rotation
- Push workflow: `git remote set-url origin https://x-access-token:<PAT>@github.com/...` then `git push -u origin <branch>` (bare token in URL returns 404)
- Bare token in URL returns 404 "Repository not found" — always use `x-access-token:` prefix

### Vercel team
- `juans-projects-cfd3d759`
- Latam-Intel: `latam-intel-yhg3` project
- WProTalents: `w-pro-talents` project

### Vercel env vars (set in both Production + Preview)
- `GEMINI_API_KEY` — Maria AI
- `NEWSDATA_API_KEY` — news widget
- 4 Supabase keys: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET` — for the monthly salary refresh endpoint

### Supabase project
- URL: `https://qxvvpedapgfchnnixyhj.supabase.co`
- Status: running (was paused, restarted earlier this session)

### DNS
- `intel.wprotalents.lat` CNAME → `latam-intel.vercel.app.` (Vercel handles the redirect to the new deployment)
- Old `leads.wprotalents.lat` CNAME — deleted

---

## Memory Patterns Saved (cross-session reference)

- **PATTERN**: `tMap` multi-lang keys must have ALL 3 langs with same shape (8186847 + fee93d4 saga)
- **PATTERN**: raw `fetch('/api/...')` in partner context MUST use `authedFetchJSON` helper
- **PATTERN**: e2e test with curl before declaring done
- **PATTERN**: Express routes with static segment MUST be registered BEFORE dynamic `/:id` route
- **PATTERN**: distinguish "no data" from "failed to load" in fetch error handling
- **PATTERN**: Salary data calibration source = Mismo + Howdy + Levels.fyi LATAM + Nexton + Terminal (NOT just Glassdoor)

---

## Demo URLs for the Scott Meeting (Aug 17 10:30am COT)

1. **Public site**: https://latam-intel-yhg3-pt288891k-juans-projects-cfd3d759.vercel.app/
2. **Candidate portal** (default): https://latam-intel-yhg3-pt288891k-juans-projects-cfd3d759.vercel.app/
3. **Company portal**: click "For Companies" toggle in nav, OR go to `?portal=company`
4. **WProTalents**: https://wprotalents.lat (click "Intelligence" in nav → jumps to Latam-Intel)

---

## Open Async Ops

None. No CI, no cron pending, no human-reply waiting. Vercel auto-deployed the latest push.

---

## Scripts Created This Session

- `scripts/check-salary.cjs` — diagnostic to query Supabase `salary_benchmarks` and `salary_benchmarks_proposed` tables. Can be deleted after tomorrow's verification, or kept as a debug tool.

---

**End of handoff. Tomorrow: re-verify salary in production, truncate + re-seed Supabase, delete old Vercel deployment, rotate credentials.**
