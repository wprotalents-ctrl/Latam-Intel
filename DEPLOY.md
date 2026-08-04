# LATAM INTEL — Deploy Guide
### From zero to live on intel.wprotalents.lat (100% free stack)

---

## PART 1 — Push code to GitHub

### Step 1 — Clone and verify

```bash
git clone https://github.com/wprotalents-ctrl/Latam-Intel
cd Latam-Intel
npm install
npx tsc --noEmit   # must pass clean (0 errors)
npx vite build    # must succeed
```

### Step 2 — Push to GitHub

```bash
git add -A
git commit -m "feat: LATAM Intel v2 — Lemon Squeezy + Coinbase payments"
git push
```

---

## PART 2 — Connect to Vercel

### Step 3 — Import on Vercel

1. Go to **vercel.com** → **Add New Project**
2. Select **Import Git Repository** → find `Latam-Intel` → **Import**
3. Vercel auto-detects Vite — leave build settings as-is
4. **Don't click Deploy yet** — add env vars first

### Step 4 — Environment Variables

| Variable | Where to get it |
|---|---|
| `GEMINI_API_KEY` | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) — free |
| `VITE_GEMINI_API_KEY` | Same key as above |
| `SUPABASE_URL` | Supabase project → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page, service role key |
| `VITE_SUPABASE_URL` | Same URL |
| `VITE_SUPABASE_ANON_KEY` | Same page, anon public key |
| `BEEHIIV_API_KEY` | app.beehiiv.com → Settings → API |
| `BEEHIIV_PUB_ID` | Same page — starts with `pub_` |
| `RESEND_API_KEY` | resend.com → API Keys → Create |
| `NEWSDATA_API_KEY` | newsdata.io → Dashboard (free signup) |
| `COINBASE_COMMERCE_API_KEY` | commerce.coinbase.com → Settings → API |
| `COINBASE_COMMERCE_WEBHOOK_SECRET` | Coinbase Commerce → Webhook settings |
| `LEMON_SQUEEZY_WEBHOOK_SECRET` | Lemon Squeezy → Settings → Webhooks |
| `LEMON_SQUEEZY_API_KEY` | Lemon Squeezy → Settings → API |
| `CRON_SECRET` | Generate: `openssl rand -hex 32` |
| `APP_URL` | `https://latam-intel.vercel.app` (or your custom domain) |

### Step 5 — Click Deploy

Vercel builds and deploys. You get a URL like `latam-intel.vercel.app`.

---

## PART 3 — Connect intel.wprotalents.lat

### Step 6 — Add domain in Vercel

1. Vercel → **Settings** → **Domains** → type `intel.wprotalents.lat` → **Add**
2. Vercel shows a CNAME record

### Step 7 — DNS record in Namecheap

1. **Namecheap** → Manage `wprotalents.lat` → **Advanced DNS**
2. **Add New Record:**
   - **Type:** CNAME Record
   - **Host:** `intel`
   - **Value:** `cname.vercel-dns.com`
   - **TTL:** Automatic
3. Save. Wait 5–10 min for SSL. Live at `intel.wprotalents.lat`.

---

## PART 4 — Set up payments ($29/mo card + $29 crypto)

### Card payments — Lemon Squeezy

The checkout URL is hardcoded in `api/create-checkout-session.ts` pointing to your
Lemon Squeezy product. No additional client-side keys needed.

1. Go to **lemonsqueezy.com** → your store → **Settings** → **API**
2. Copy the API key → add as `LEMON_SQUEEZY_API_KEY` in Vercel env vars
3. Go to **Settings** → **Webhooks** → **Create Webhook**
4. **URL:** `https://intel.wprotalents.lat/api/webhooks/lemon-squeezy`
5. **Events:** `subscription_created`, `subscription_updated`, `subscription_cancelled`
6. Copy the signing secret → add as `LEMON_SQUEEZY_WEBHOOK_SECRET` in Vercel
7. Redeploy

### Crypto payments — Coinbase Commerce

1. Go to **commerce.coinbase.com** → **Settings** → **API Key** → Create
2. Copy the API key → add as `COINBASE_COMMERCE_API_KEY` in Vercel
3. Go to **Settings** → **Webhook Subscriptions** → Create
4. **URL:** `https://intel.wprotalents.lat/api/crypto-webhook`
5. **Events:** `charge:confirmed`
6. Copy the shared secret → add as `COINBASE_COMMERCE_WEBHOOK_SECRET` in Vercel
7. Redeploy

---

## PART 5 — Set up the database

### Step 8 — Run the Supabase schema

1. **supabase.com** → your project → **SQL Editor**
2. Open `supabase-schema.sql` → paste → **Run**
3. All tables created with RLS policies

---

## PART 6 — Automate the newsletter (Monday 12:00 UTC)

Vercel Cron Jobs are configured in `vercel.json`:

1. **12:00 UTC Monday** — `POST /api/newsletter/generate` — Gemini writes the issue
2. **13:00 UTC Monday** — `POST /api/newsletter/send` — Pushes to Beehiiv

Manual trigger (for testing):
```bash
curl -X POST https://intel.wprotalents.lat/api/newsletter/generate \
  -H "x-cron-secret: YOUR_CRON_SECRET"

curl -X POST https://intel.wprotalents.lat/api/newsletter/send \
  -H "x-cron-secret: YOUR_CRON_SECRET"
```

---

## Pre-launch checklist

- [ ] `intel.wprotalents.lat` loads the dashboard
- [ ] `/members` shows the paywall (free state)
- [ ] Language toggle (EN/ES/PT) works
- [ ] Newsletter subscribe form works (check Beehiiv dashboard)
- [ ] Lemon Squeezy card payment redirects to checkout
- [ ] Coinbase Commerce crypto payment creates a charge
- [ ] After payment, `/members?email=...` verifies and unlocks content
- [ ] Run newsletter generate once manually to confirm AI works
- [ ] `npx tsc --noEmit` passes clean before every commit

---

## Free stack summary

| Service | Cost | Notes |
|---|---|---|
| Vercel | $0 | 100GB bandwidth/mo |
| Supabase | $0 | 500MB database |
| Firebase Firestore | $0 | 1GB storage, 50K reads/day |
| Gemini API | $0 | 1M tokens/day |
| Beehiiv | $0 | 2,500 subscribers |
| Resend | $0 | 3,000 emails/mo |
| Lemon Squeezy | $0 | 5% + 50¢ per transaction |
| Coinbase Commerce | $0 | 1% per transaction |
| Newsdata.io | $0 | 200 req/day (we use ~6/day) |

**Revenue: $29/mo per subscriber. After Lemon Squeezy fees: ~$27.05.**
