# LATAM INTEL — Deploy Guide
### From zero to live on intel.wprotalents.lat (100% free)

---

## PART 1 — Push all the new code to GitHub

### Step 1 — Copy the new files into your local Latam-Intel folder

Open **File Explorer** and go to your local `Latam-Intel` folder (wherever you cloned the repo).

Copy these files from your "Latam Intellingece Dashboard" folder into it:

```
Latam-Intel/
├── api/                        ← NEW — copy this entire folder
│   ├── _lib/
│   │   ├── firebase.ts
│   │   ├── supabase.ts
│   │   ├── gemini.ts
│   │   ├── cors.ts
│   │   ├── news.ts
│   │   └── beehiiv.ts
│   ├── jobs.ts
│   ├── ping.ts
│   ├── subscribe-newsletter.ts
│   ├── create-checkout-session.ts
│   ├── create-crypto-charge.ts
│   ├── members/verify.ts
│   ├── market-intel/news.ts
│   ├── market-intel/brief.ts
│   ├── market-intel/trends.ts
│   ├── market-intel/volume.ts
│   ├── market-intel/sync.ts
│   ├── newsletter/generate.ts
│   ├── newsletter/send.ts
│   └── webhooks/
│       ├── stripe.ts
│       └── coinbase.ts
├── src/
│   ├── lib/supabase.ts         ← NEW
│   ├── pages/MembersPage.tsx   ← NEW
│   └── main.tsx                ← REPLACE existing
├── vercel.json                 ← NEW
├── package.json                ← REPLACE existing
├── supabase-schema.sql         ← NEW (run in Supabase, don't push)
└── .env.example                ← REPLACE existing
```

### Step 2 — Open a terminal in your Latam-Intel folder

On Windows: hold **Shift**, right-click in the folder → "Open PowerShell window here"

### Step 3 — Push to GitHub

```bash
git add -A
git commit -m "feat: Vercel API routes, Members page, newsletter automation"
git push
```

Done. Your code is now on GitHub.

---

## PART 2 — Connect to Vercel (your existing account)

### Step 4 — Import the Latam-Intel repo on Vercel

1. Go to **vercel.com** → click **Add New Project**
2. Select **Import Git Repository**
3. Find `Latam-Intel` in the list → click **Import**
4. Vercel auto-detects Vite — leave all build settings as-is
5. **Don't click Deploy yet** — you need env vars first (next step)

### Step 5 — Add environment variables in Vercel

In the "Environment Variables" section before deploying, add these one by one.
Get the values from the services listed below.

| Variable | Where to get it |
|---|---|
| `GEMINI_API_KEY` | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) — free |
| `VITE_GEMINI_API_KEY` | Same key as above |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Same page, the `pk_live_` key |
| `STRIPE_WEBHOOK_SECRET` | Add after Step 8 below |
| `VITE_STRIPE_PRO_PRICE_ID` | After creating product in Step 7 |
| `SUPABASE_URL` | Supabase project → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page |
| `VITE_SUPABASE_URL` | Same URL |
| `VITE_SUPABASE_ANON_KEY` | Same page, the `anon public` key |
| `BEEHIIV_API_KEY` | app.beehiiv.com → Settings → API |
| `BEEHIIV_PUB_ID` | Same page — starts with `pub_` |
| `RESEND_API_KEY` | resend.com → API Keys → Create |
| `NEWSDATA_API_KEY` | newsdata.io → Dashboard (free signup) |
| `COINBASE_COMMERCE_API_KEY` | commerce.coinbase.com → Settings → API |
| `CRON_SECRET` | Make up any random string, e.g. `latamintel2026abc` |

### Step 6 — Click Deploy

Vercel builds and deploys. You get a URL like `latam-intel.vercel.app`.
The site is live. Now let's connect your real domain.

---

## PART 3 — Connect intel.wprotalents.lat

### Step 7 — Add the domain in Vercel

1. Go to your project on Vercel → **Settings** → **Domains**
2. Type `intel.wprotalents.lat` → click **Add**
3. Vercel shows you a CNAME record to add

### Step 8 — Add DNS record in Namecheap

1. Log in to **Namecheap** → click **Manage** on `wprotalents.lat`
2. Go to **Advanced DNS** tab
3. Click **Add New Record**
4. Fill in:
   - **Type:** CNAME Record
   - **Host:** `intel`
   - **Value:** `cname.vercel-dns.com`
   - **TTL:** Automatic
5. Click the ✓ checkmark to save

Wait 5–10 minutes. Vercel auto-provisions SSL. Your site is live at `intel.wprotalents.lat`.

---

## PART 4 — Set up Stripe to take $29/mo payments

### Step 9 — Create your product in Stripe

1. Go to **stripe.com** → **Products** → **Add Product**
2. Fill in:
   - **Name:** LATAM INTEL Executive
   - **Description:** Full Workforce Daily, salary data, AI tools, WPro resources
   - **Pricing:** Recurring, $29.00 / month
3. Click **Save Product**
4. Copy the **Price ID** (starts with `price_`)
5. Go back to Vercel → Settings → Environment Variables → add `VITE_STRIPE_PRO_PRICE_ID` = that price ID
6. Redeploy (Vercel → Deployments → click the 3 dots → Redeploy)

### Step 10 — Set up Stripe Webhook

1. Stripe Dashboard → **Developers** → **Webhooks** → **Add Endpoint**
2. **Endpoint URL:** `https://intel.wprotalents.lat/api/webhooks/stripe`
3. **Events to listen for:** select these two:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
4. Click **Add Endpoint**
5. Click **Reveal** under "Signing secret" → copy the `whsec_...` value
6. Go to Vercel → add env var `STRIPE_WEBHOOK_SECRET` = that value
7. Redeploy

---

## PART 5 — Set up the database

### Step 11 — Run the Supabase schema

1. Go to **supabase.com** → your project → **SQL Editor**
2. Open `supabase-schema.sql` (in your folder)
3. Paste the entire contents → click **Run**
4. Done — all tables created with security rules

---

## PART 6 — Automate the newsletter (Monday 8am)

### Step 12 — Set up Vercel Cron Jobs (free)

Add this to your `vercel.json` (already included):

The cron runs two endpoints every Monday at 8am:
1. `POST /api/newsletter/generate` — Gemini writes the issue from real news
2. `POST /api/newsletter/send` — Pushes it to Beehiiv, everyone gets the teaser

To trigger manually at any time (for testing):
```bash
curl -X POST https://intel.wprotalents.lat/api/newsletter/generate \
  -H "x-cron-secret: YOUR_CRON_SECRET"

curl -X POST https://intel.wprotalents.lat/api/newsletter/send \
  -H "x-cron-secret: YOUR_CRON_SECRET"
```

---

## PART 7 — Add the dashboard link to wprotalents.lat

### Step 13 — Link from your main site

In your WProTalents site code, add this button wherever makes sense
(hero section, nav, footer):

```html
<!-- HTML version -->
<a href="https://intel.wprotalents.lat">
  LATAM AI Intelligence Dashboard →
</a>

<!-- React version -->
<a
  href="https://intel.wprotalents.lat"
  target="_blank"
  rel="noopener noreferrer"
  className="your-button-class"
>
  AI Job Market Intelligence →
</a>
```

Push that change → Vercel redeploys `wprotalents.lat` automatically.

---

## Quick checklist before sharing the link

- [ ] `intel.wprotalents.lat` loads the dashboard
- [ ] `/members` shows the paywall (not logged in)
- [ ] Google Sign-In works
- [ ] Newsletter subscribe form works (check Beehiiv dashboard)
- [ ] Stripe test payment works (use card `4242 4242 4242 4242`, any future date, any CVC)
- [ ] After payment, `/members` shows full content
- [ ] Run newsletter generate once manually to confirm AI works

---

## Your free stack summary

| Service | Cost | Limit before paying |
|---|---|---|
| Vercel | $0 | 100GB bandwidth/mo |
| Supabase | $0 | 500MB database |
| Firebase | $0 | 1GB storage, 50K reads/day |
| Gemini API | $0 | 1M tokens/day |
| Beehiiv | $0 | 2,500 subscribers |
| Resend | $0 | 3,000 emails/mo |
| Stripe | $0 | 2.9% + 30¢ per transaction only |
| Newsdata.io | $0 | 200 req/day (we use ~6/day) |

**First dollar comes in when someone pays $29. You keep $27.89 after Stripe fees.**
