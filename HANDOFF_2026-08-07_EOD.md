# Latam-Intel — Handoff 2026-08-07 (EOD)

**Session date:** Fri Aug 07 2026 (10:00 - 14:35 COL)
**Author:** Mavis
**Goal:** Resolve Vercel env-var bug + clean up UI + fix talent pool + ship Phase 1.1

---

## TL;DR

✅ **Vercel env-var bug solved** — fresh project `latam-intel-v2`, all 6 env vars inject
✅ **Custom domain `intel.wprotalents.lat` migrated** to v2
✅ **Jobs / Privacy pages wired** — were orphaned state, now render properly
✅ **Mobile menu** — hamburger now opens a real drawer
✅ **Phase 1.1 font sizing** — body text 14px baseline, mono labels stay 10px
✅ **WorldMap + RadarWidget removed** — pure decoration with fake data
✅ **Post a Role accepts any role** — new "Other (specify)" option
✅ **Talent pool → Supabase** — new `talent_pool` table, API writes to it

⚠️ **1 action for you:** run the Supabase migration to create the `talent_pool` table (1 min SQL Editor task).

---

## Today's commits (10)

1. `30bc2d6` — Phase 1.1 font sizing (body text 14px baseline)
2. `9162aec` — Wired Jobs + Privacy pages (orphaned state bug)
3. `bc9414c` — Mobile menu drawer + Post a Role "Other" option
4. `a54ba10` — Removed WorldMap + RadarWidget (fake data, -139 lines)
5. `3906bf0` — Fixed JobsPage tab overflow (flex-wrap instead of horizontal scroll)
6. `7dcac64` — Quick Match: Clear button, how-it-works hint, per-job score badge
7. `81e3b76` — Talent pool: response check + mailto fallback
8. `6c44a3f` — Talent pool: Supabase integration + migration SQL
9. `f446b6c` — Talent pool: separate try/catch for init vs insert
10. `fbeec66` (yesterday) — Vercel env-var fix handoff doc (carried over)

Plus the env-var fix: `2sK2mrPcdtWyvAgqhgnYAMHHF25F` deploy at noon today with all 6 env vars injecting.

---

## Action items for you

### 1. Run the Supabase migration (5 min)
- Open https://supabase.com/dashboard → your project → SQL Editor
- Paste the contents of `db/migrations/2026-08-07_talent_pool.sql`
- Click "Run"
- After the table exists, all "Get Featured" submissions will save to Supabase

### 2. Optional cleanup
- Delete the old `latam-intel-yhg3` project from Vercel dashboard (deprecated, no domains)
- Delete the OG `latam-intel` project from Vercel dashboard (just the `latam-intel.vercel.app` alias, no custom domain)
- Re-seed Supabase `salary_benchmarks` table (currently empty, const fallback in use)

---

## What's still known-degraded

- **AI Brief endpoint** returns 429 from Gemini free-tier quota. Resets tomorrow at midnight PT. Or enable billing at https://aistudio.google.com/apikey
- **Email notifications** for talent pool submissions don't work (no Resend API key set). Add `RESEND_API_KEY` to Vercel env vars if you want emails.

---

## Memory notes saved

Added to agent memory:
- **Vercel env-var injection bug RESOLVED via fresh project (2026-08-07)** — root cause, fix, lessons learned
- **SSO protection can mask diagnostics** — `ssoProtection: all_except_custom_domains` makes preview URLs return login HTML instead of API responses. Always test on custom domain.

---

## Tomorrow's quick wins (low effort, high value)

1. **Run the Supabase migration** → talent pool starts working end-to-end
2. **Add Resend API key** to Vercel env vars → email notifications for submissions work
3. **Delete old Vercel projects** (yhg3 + OG) → clean dashboard
4. **Optional: enable Gemini billing** → brief endpoint works for demos

---

## Next session priorities (medium-term)

1. **Phase 1.2: Dark mode toggle** (currently light/dark depends on system)
2. **Phase 1.3: SEO meta tags per route** (currently only on `/`)
3. **Sept+ CV Radar no-auth MVP** (1-2 days, in roadmap)
4. **Sept+ Post a Role form** (1 day, in roadmap)
5. **Admin UI to browse talent_pool** (small, after Supabase is live)

---

## Files to re-read tomorrow

- `C:\Users\juanc\.minimax\sessions\mvs_a617516ad1764d609dae71b4aa0ae6c3\workspace\Latam-Intel\HANDOFF_2026-08-07_EOD.md` (this file)
- `C:\Users\juanc\.minimax\sessions\mvs_a617516ad1764d609dae71b4aa0ae6c3\workspace\Latam-Intel\db\migrations\2026-08-07_talent_pool.sql` (the migration to run)
- `C:\Users\juanc\.minimax\sessions\mvs_a617516ad1764d609dae71b4aa0ae6c3\workspace\Latam-Intel\api\submissions.ts` (talent pool endpoint)
- `C:\Users\juanc\.minimax\sessions\mvs_a617516ad1764d609dae71b4aa0ae6c3\workspace\Latam-Intel\src\components\LinkedInBoostModal.tsx` (modal UI)

---

## Critical context (durable)

### Vercel project structure (current)
- **Active:** `latam-intel-v2` (project ID `prj_8Lde6uWqoLLeYaxlvSaGfhJUYYrw`)
  - Production URL: `https://latam-intel-v2.vercel.app` (use for testing, bypasses SSO)
  - Custom domain: `https://intel.wprotalents.lat` (production)
  - All 6 env vars injecting (`allKeysCount: 54`, was 48 in broken yhg3)
- **Deprecated:** `latam-intel-yhg3` (keep as dormant fallback, delete in a few days)
- **OG static landing:** `latam-intel` (just the `latam-intel.vercel.app` alias, no custom domain, can be deleted)

### Gemini free-tier quota
- ~1,500 req/day for `gemini-2.0-flash-lite`
- Hit limit: 0 mid-day Aug 6
- Resets at midnight Pacific Time daily
- Fix: enable billing at https://aistudio.google.com/apikey OR switch model

### Salary math duplication
- `src/lib/intelligence.ts` — canonical
- `src/lib/shareSalaryCard.ts` — share card + OG
- `api/og/salary.ts` — OG image
- `api/report/salary.ts` — PDF
- All 4 must stay in sync

### Vercel CLI token
- Last token: stored in session memory (never in handoff docs — push protection)
- 24h, Full Account scope
- Use for: `vercel --token <T> <command>` or `$env:VERCEL_TOKEN = "<T>"`
- Generate new at https://vercel.com/account/tokens

### GitHub PAT
- Stored in `C:\Users\juanc\.netrc` (last 4 chars `...2pZ4`)
- Used in remote URL: `https://x-access-token:<token>@github.com/wprotalents-ctrl/Latam-Intel.git`
- Recommend rotating soon (it's been in my memory for weeks)
- Use `git remote set-url origin https://x-access-token:<token>@github.com/wprotalents-ctrl/Latam-Intel.git` then `git push`
- Recommend rotating soon (it's been in my memory for weeks)

---

**End of handoff. Great day, Juan. See you tomorrow. 🚀**
