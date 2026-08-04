# LATAM INTEL — AI Workforce Intelligence

Live at [intel.wprotalents.lat](https://intel.wprotalents.lat)

Real-time LATAM tech workforce intelligence for hiring managers, recruiters, and candidates. Built by [WProTalents](https://wprotalents.lat) — 20 years recruiting C-level and tech talent across Latin America.

## What it does

- **Market Intelligence Dashboard** — AI-powered briefings on LATAM tech workforce trends
- **Job Board** — Aggregated tech jobs across LATAM, US, and Europe with smart filters
- **Salary Intel** — Benchmarks for 40+ roles across 5 LATAM countries (Executive only)
- **Market Value Calculator** — Enter your profile, see your real market salary
- **Newsletter** — Weekly "Workforce Daily" brief via Beehiiv (AI-generated, tri-lingual)
- **Payment** — $29/mo Executive access via Lemon Squeezy (card) or Coinbase Commerce (crypto)

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19 + Vite + TypeScript, Tailwind CSS, Framer Motion |
| Hosting | Vercel (serverless API routes) |
| Database | Firebase Firestore (read cache) + Supabase (subscribers, payments) |
| AI | Gemini 3.1 Pro (briefings, market intel) |
| Newsletter | Beehiiv API |
| Payments | Lemon Squeezy (card) + Coinbase Commerce (crypto) |
| News | Newsdata.io + News API |

## Quick start

```bash
npm install
cp .env.example .env.local  # fill in your keys
npm run dev                 # http://localhost:5173
```

### Type check before every commit

```bash
npx tsc --noEmit   # must pass clean (0 errors)
```

### Build

```bash
npx vite build    # outputs to dist/
```

## Project structure

```
api/                    # Vercel serverless API routes
  _lib/                 # Shared helpers (beehiiv, cors, firebase, supabase, news)
  members/verify.ts     # Premium verification endpoint
  webhooks/             # Lemon Squeezy + Coinbase webhooks
  newsletter/           # Automated weekly generate + send
  create-checkout-session.ts  # Lemon Squeezy checkout
  create-crypto-charge.ts     # Coinbase Commerce charge
src/
  App.tsx              # Main dashboard (EN/ES/PT i18n)
  pages/
    JobsPage.tsx       # Job board + market value calculator
    MembersPage.tsx    # Premium hub (salary, resources, hiring tools)
    PrivacyPage.tsx    # Privacy policy
  components/          # React components
  lib/                 # Client-side logic (intelligence, hiring plan, etc.)
  hooks/               # Custom React hooks
vercel.json            # Build config + cron jobs + rewrites
```

## Deployment

See [DEPLOY.md](DEPLOY.md) for the full step-by-step guide.

## License

Proprietary — WProTalents
