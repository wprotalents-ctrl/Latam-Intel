# Latam-Intel + WProTalents — Session Handoff (2026-08-04)

## What got done in the last session (2026-07-14)

### WProTalents — DONE
- **`intel.wprotalents.lat` is live and pointing to the Latam-Intel portal** ✅
- "Intelligence" button on `wprotalents.lat` now links to `intel.wprotalents.lat` ✅
- Old `leads.wprotalents.lat` CNAME deleted from Namecheap ✅
- WProTalents repo: `wprotalents-ctrl/WProTalents` — `master` branch
- Last 3 commits on master:
  - `84c06ae` deploy: sync Intelligence links to intel.wprotalents.lat
  - `eab7dfb` chore: trigger deploy from wprotalents-ctrl account
  - `0d670fa` fix: Intelligence links → intel.wprotalents.lat
- Vercel project: `w-pro-talents` under `juans-projects-cfd3d759`
- The "blocked deployment" issue was caused by Vercel Hobby not allowing `karibbeanluxuryoperators-art` GitHub account to deploy. **Fix:** user generated a `wprotalents-ctrl` PAT (rotated, see Vercel team secrets) and we pushed with that. User then merged the PR and Vercel deployed.
- ⚠️ `package-lock.json` in WProTalents still has an uncommitted change — check before next push

### Latam-Intel — REPO STATE
- Repo: `wprotalents-ctrl/Latam-Intel` — current branch: `restore-working`
- Last commit on `restore-working`: `f223bf7 consolidate: merge 4 cvradar API files into 1 route`
- `main` is one commit behind (still has pre-redesign state)
- Working tree: clean except for `package-lock.json` (modified, +21/-90)
- `intelligence.ts` was NOT modified in last session (last write 2026-07-13 4:24 PM)
  - The salary fix we discussed is **NOT YET APPLIED** — needs to be done today
- `api/` files: 8 top-level + 2 folders (members, webhooks) = 11 serverless functions (under 12 limit)

---

## Today's work items (priority order)

### 1. URGENT — Salary Calculator (NOT YET FIXED)
- File: `src/lib/intelligence.ts`
- 3 changes needed:
  - **a)** `getSeniority` thresholds (around line 211):
    - FROM: `if (yearsExp <= 5) return 'mid'; if (yearsExp <= 8) return 'senior';`
    - TO:   `if (yearsExp <= 4) return 'mid'; if (yearsExp <= 7) return 'senior';`
    - Effect: 5yr experience now maps to "senior" (×1.55) instead of "mid" (×1.00)
  - **b)** `REMOTE_MULT` (around line 95):
    - FROM: `BR: 2.80, MX: 2.60, CO: 3.00, AR: 3.50, CL: 2.40,`
    - TO:   `BR: 3.00, MX: 3.20, CO: 3.40, AR: 3.72, CL: 3.00,`
  - **c)** `BASE_SALARY` (around line 76) — Juan provided corrected remote-USD numbers:
    ```
    Role         BR      MX      CO      AR      CL
    ai_ml        18000   16000   14000   12000   18000
    llm          21000   19000   17000   15000   21000
    data         15000   13500   12000   10500   15000
    backend      14000   12500   11000   9500    14000
    frontend     12500   11000   9500    8000    12500
    fullstack    14000   12500   11000   9500    14000
    devops       16000   14500   13000   11500   16000
    product      14500   13000   11500   10000   14500
    data_eng     16000   14500   13000   11500   16000
    eng_manager  26000   23000   20000   17000   26000
    ```
  - **d)** `intelligence.ts` is also calling `getSeniority` in 4 other places (lines 261, 279, 311, 386) — those automatically benefit from the threshold fix.

- ⚠️ LONG-TERM: Juan wants this data updated by the webapp (e.g. monthly cron pulling real mandates), not hand-coded. For now we hardcode the corrected values.

### 2. URGENT — Dashboard grey void on left side
- Symptom: massive flat grey rectangle on left ~65% of screen on Dashboard view
- Root cause (last session): Dashboard used `absolute inset-0` + `grid-cols-12` with `gap-px bg-border` hack. In certain viewport conditions the left column collapsed to zero height, exposing the `#2a2a2a` border color as a flat grey void.
- The previous session claimed to have fixed this by switching to `flex flex-col lg:flex-row` and removing all `bg-border gap-px` patterns — **BUT the fix is not committed**. The deployed version still has the bug.
- Action: re-apply the layout fix, commit, push.

### 3. NEEDS REPRO — Job Portal "0 roles" / "No jobs loaded"
- File: `api/jobs.ts` — fetches from 6 sources (Remotive, Arbeitnow, Jobicy, RemoteOK, Adzuna, Findwork, The Muse)
- 4 free sources: no key needed
- Adzuna (BR/MX only), Findwork, The Muse: require API keys, silently return `[]` if missing
- Most likely cause: env vars not scoped to **Production** in Vercel
- **Action items for Juan** (manual, can't be done by code):
  1. Confirm production domain is `latam-intel.vercel.app` (not the preview URL)
  2. Vercel → Settings → Environment Variables — confirm these are checked for Production:
     - `GEMINI_API_KEY`
     - `NEWSDATA_API_KEY`
     - `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`
     - `FINDWORK_API_KEY`
     - `THE_MUSE_API_KEY`
     - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
  3. Redeploy after any env var changes (Vercel doesn't retroactively apply new vars to existing builds)
- Adzuna only covers BR and MX — if filter is set to CO/AR/CL/PE and other 2 sources come back empty, "0 roles" is the correct outcome, not a bug. UI should show a clearer empty state.

### 4. NEEDS REPRO — "Market Intelligence", "Post a Role", "WPro CV Radar" tabs don't exist in candidate portal
- These tabs are NOT in the candidate-facing App.tsx. Candidate portal has only **Dashboard** + **Jobs** views.
- These features exist in the **client portal** (MembersPage) which is auth-gated via Supabase.
- Possible bug: navigation/links in the candidate portal point to these tabs but they don't exist → clicks do nothing or go to 404
- Action: search App.tsx for these strings and confirm what the user actually clicks on

### 5. NEEDS REPRO — AI Impact Brief / Today's Job News empty
- `/api/market-intel/brief` (needs `GEMINI_API_KEY` + Supabase)
- `/api/market-intel/news` (needs `NEWSDATA_API_KEY`)
- Almost certainly the same env var scoping issue as #3

---

## GitHub accounts & Vercel access

- **Vercel account:** `wprotalents@gmail.com` (under `juans-projects-cfd3d759`)
- **Vercel projects:**
  - `w-pro-talents` — WProTalents main site (master branch)
  - `latam-intel` / `latam-intel-yhg3` — Latam-Intel (currently watching restore-working? verify)
- **GitHub accounts:**
  - `wprotalents-ctrl` — owns both repos, has Vercel access (use this for push)
  - `karibbeanluxuryoperators-art` — does NOT have Vercel access, pushes get blocked
- **Active tokens** (NEVER commit PATs to the repo — store in Vercel team secrets / password manager only):
  - `wprotalents-ctrl` PAT: stored in Vercel team secrets, rotated as needed
  - `karibbeanluxuryoperators-art` PAT: stored in Vercel team secrets, rotated as needed

---

## Critical files to know

- `src/lib/intelligence.ts` — salary calc + market intelligence
- `src/App.tsx` — main candidate portal entry, contains Dashboard + Jobs views
- `src/components/SalaryCalculator.tsx` (or similar) — the UI for the salary calc
- `api/jobs.ts` — job board aggregator
- `api/market-intel.ts` — AI brief + news endpoints
- `api/cvradar.ts` — consolidated into single route (was 4 files before)
- `api/post-vacancy.ts` — Post a Role endpoint (used by client portal, not candidate)
- `vercel.json` — Vercel config (likely has function limits set)
- `tsconfig.json` — excludes `functions/` (firebase-functions not installed in main project)

## Known issues / debt
- 19 pre-existing tsc errors in unrelated files (EntityEditor, ExperienceWizard, etc.) — not blocking
- 32 npm vulnerabilities in dependencies — not blocking, address post-launch
- Salary data is hand-coded in `intelligence.ts` — long-term, this should be a DB table updated monthly from real mandate data
- ADZUNA only covers BR/MX — UI needs clearer "no local listings" empty state
- Vercel Hobby plan: max 12 serverless functions — already at 11, no room for new endpoints
