-- ============================================================
-- LATAM INTEL — Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────
-- USERS
-- Synced from Firebase Auth on payment webhook
-- ─────────────────────────────────────────────
create table if not exists public.users (
  id                   text primary key,          -- Firebase UID
  email                text unique not null,
  display_name         text,
  photo_url            text,
  subscription_status  text not null default 'free'
                         check (subscription_status in ('free', 'premium')),
  payment_method       text check (payment_method in ('card', 'crypto')),
  stripe_customer_id   text,
  subscriber_type      text check (subscriber_type in (
                         'reader', 'candidate', 'hiring_manager', 'company'
                       )),
  beehiiv_subscriber_id text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- RLS
alter table public.users enable row level security;

create policy "Users can read own row"
  on public.users for select
  using (auth.uid()::text = id);

create policy "Service role can do anything"
  on public.users for all
  using (auth.role() = 'service_role');


-- ─────────────────────────────────────────────
-- NEWSLETTER ISSUES
-- Stores weekly Workforce Daily issues
-- ─────────────────────────────────────────────
create table if not exists public.newsletter_issues (
  id                text primary key,            -- e.g. "workforce-daily-2026-w14"
  week_label        text not null,               -- "Week 14 · Apr 2026"
  subject_line      text not null,
  preview_text      text,
  category          text not null check (category in (
                      'Workforce Daily', 'TechJobs', 'AI Impact', 'Recruitment', 'HR'
                    )),
  country_codes     text[],                      -- ['BR','MX','CO']
  is_hiring_signal  boolean default false,
  target_persona    text check (target_persona in ('Hiring Manager','Candidate','Analyst')),

  -- Free tier content (shown to everyone)
  free_teaser       text not null,
  slack_hook        text,

  -- Premium content (gated behind $29/mo)
  paid_analysis     jsonb,                       -- full article with sections

  -- Beehiiv integration
  beehiiv_post_id   text,
  beehiiv_web_url   text,

  published_at      timestamptz default now(),
  created_at        timestamptz not null default now()
);

-- Anyone can read free teasers; paid_analysis is filtered in the app
alter table public.newsletter_issues enable row level security;

create policy "Public can read issues"
  on public.newsletter_issues for select
  using (true);

create policy "Service role can write"
  on public.newsletter_issues for all
  using (auth.role() = 'service_role');


-- ─────────────────────────────────────────────
-- LEADS
-- Subscribers who flagged "I'm hiring" or "I'm a company"
-- These are WProTalents sales leads
-- ─────────────────────────────────────────────
create table if not exists public.leads (
  id               uuid primary key default gen_random_uuid(),
  email            text not null,
  subscriber_type  text,                         -- from the subscribe form dropdown
  company          text,
  message          text,
  source           text default 'newsletter',    -- 'newsletter' | 'linkedin' | 'direct'
  status           text not null default 'new'
                     check (status in ('new','contacted','qualified','converted')),
  assigned_to      text,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger leads_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

alter table public.leads enable row level security;

create policy "Service role full access to leads"
  on public.leads for all
  using (auth.role() = 'service_role');


-- ─────────────────────────────────────────────
-- SUBSCRIBERS
-- Newsletter subscriber list with segmentation
-- ─────────────────────────────────────────────
create table if not exists public.subscribers (
  id               uuid primary key default gen_random_uuid(),
  email            text unique not null,
  subscriber_type  text check (subscriber_type in (
                     'reader', 'candidate', 'hiring_manager', 'company'
                   )),
  is_premium       boolean default false,
  language         text default 'EN' check (language in ('EN', 'ES', 'PT')),
  country          text,
  beehiiv_id       text,
  utm_source       text,
  utm_medium       text,
  subscribed_at    timestamptz not null default now(),
  unsubscribed_at  timestamptz,
  premium_until    timestamptz,
  updated_at       timestamptz default now()
);

alter table public.subscribers enable row level security;

create policy "Service role full access"
  on public.subscribers for all
  using (auth.role() = 'service_role');


-- ─────────────────────────────────────────────
-- MEMBER RESOURCES
-- Premium resources available in /members
-- ─────────────────────────────────────────────
create table if not exists public.member_resources (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  category     text not null check (category in (
                 'Salary Data', 'AI Tools', 'Playbooks', 'Templates', 'Reports'
               )),
  file_url     text,
  external_url text,
  is_active    boolean default true,
  sort_order   int default 0,
  created_at   timestamptz not null default now()
);

alter table public.member_resources enable row level security;

-- Only premium users can read resources (checked in the app via Firebase)
create policy "Public read for resources"
  on public.member_resources for select
  using (true);

create policy "Service role write"
  on public.member_resources for all
  using (auth.role() = 'service_role');


-- ─────────────────────────────────────────────
-- SEED: Initial member resources
-- ─────────────────────────────────────────────
insert into public.member_resources (title, description, category, external_url, sort_order) values
  ('LATAM AI Salary Benchmark 2026', 'Salaries for 40+ AI/tech roles across BR, MX, CO, AR, CL — from IC to VP level.', 'Salary Data', null, 1),
  ('AI Recruiter Toolkit', 'Prompts, workflows, and scorecards for sourcing AI talent at scale.', 'AI Tools', null, 2),
  ('LATAM Tech Talent Playbook', 'How to build, retain, and scale an AI team in Latin America.', 'Playbooks', null, 3),
  ('Offer Letter Templates (EN/ES/PT)', 'Legal-reviewed templates for remote hires across LATAM jurisdictions.', 'Templates', null, 4),
  ('Q1 2026 AI Jobs Impact Report', 'Which LATAM sectors gained and lost the most jobs due to automation in Q1.', 'Reports', null, 5)
on conflict do nothing;

-- ============================================================
-- SALARY BENCHMARKS (monthly auto-refresh source of truth)
-- Updated by: api/cron/refresh-salary-data.ts (Vercel cron, 1st of month)
-- Read by:    src/lib/intelligence.ts at module load
-- Fallback:   const BASE_SALARY / REMOTE_MULT in intelligence.ts if table empty
-- ============================================================
create table if not exists public.salary_benchmarks (
  id              uuid primary key default gen_random_uuid(),
  role            text not null check (role in (
                    'ai_ml','llm','data','backend','frontend','fullstack',
                    'devops','product','data_eng','eng_manager'
                  )),
  country         text not null check (country in ('BR','MX','CO','AR','CL')),
  base_salary     integer not null,         -- local market mid-level (3-5yr) USD/yr
  remote_mult     numeric(4,2) not null,    -- uplift multiplier for remote-USD rates
  source          text,                     -- 'WProTalents mandates', 'Glassdoor LATAM', etc.
  effective_from  date not null default current_date,
  created_at      timestamptz not null default now(),
  unique (role, country, effective_from)
);
create index if not exists salary_benchmarks_lookup_idx
  on public.salary_benchmarks (role, country, effective_from desc);

alter table public.salary_benchmarks enable row level security;
-- Public read: salary data is meant to be visible to anyone
drop policy if exists salary_benchmarks_read on public.salary_benchmarks;
create policy salary_benchmarks_read on public.salary_benchmarks
  for select using (true);
-- Service role bypasses RLS for the cron writer, so no insert policy needed

-- Seed with current values (so first deploy works without waiting for cron)
-- Calibration: Juan's audit 2026-08-04 — LATAM local mid anchors from Mismo/Howdy/
-- Levels.fyi/Nexton/Terminal. Country ordering matches the live override logic
-- in src/lib/intelligence.ts. To re-seed from scratch: TRUNCATE first, then re-run.
insert into public.salary_benchmarks (role, country, base_salary, remote_mult, source, effective_from) values
  ('ai_ml',       'BR', 65000, 1.70, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('ai_ml',       'MX', 65000, 1.70, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('ai_ml',       'CO', 55000, 1.70, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('ai_ml',       'AR', 70000, 1.50, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('ai_ml',       'CL', 70000, 1.50, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('llm',         'BR', 70000, 1.70, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('llm',         'MX', 70000, 1.70, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('llm',         'CO', 60000, 1.70, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('llm',         'AR', 75000, 1.50, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('llm',         'CL', 75000, 1.50, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('data',        'BR', 55000, 1.70, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('data',        'MX', 55000, 1.70, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('data',        'CO', 50000, 1.70, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('data',        'AR', 60000, 1.50, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('data',        'CL', 60000, 1.50, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('backend',     'BR', 45000, 1.70, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('backend',     'MX', 46000, 1.70, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('backend',     'CO', 42000, 1.70, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('backend',     'AR', 48000, 1.50, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('backend',     'CL', 51000, 1.50, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('frontend',    'BR', 45000, 1.70, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('frontend',    'MX', 46000, 1.70, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('frontend',    'CO', 42000, 1.70, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('frontend',    'AR', 48000, 1.50, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('frontend',    'CL', 51000, 1.50, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('fullstack',   'BR', 45000, 1.70, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('fullstack',   'MX', 46000, 1.70, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('fullstack',   'CO', 42000, 1.70, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('fullstack',   'AR', 48000, 1.50, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('fullstack',   'CL', 51000, 1.50, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('devops',      'BR', 55000, 1.70, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('devops',      'MX', 55000, 1.70, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('devops',      'CO', 50000, 1.70, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('devops',      'AR', 60000, 1.50, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('devops',      'CL', 60000, 1.50, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('product',     'BR', 45000, 1.70, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('product',     'MX', 46000, 1.70, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('product',     'CO', 42000, 1.70, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('product',     'AR', 48000, 1.50, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('product',     'CL', 51000, 1.50, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('data_eng',    'BR', 55000, 1.70, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('data_eng',    'MX', 55000, 1.70, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('data_eng',    'CO', 50000, 1.70, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('data_eng',    'AR', 60000, 1.50, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('data_eng',    'CL', 60000, 1.50, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('eng_manager', 'BR', 58000, 1.70, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('eng_manager', 'MX', 58000, 1.70, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('eng_manager', 'CO', 54000, 1.70, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('eng_manager', 'AR', 62000, 1.50, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date),
  ('eng_manager', 'CL', 65000, 1.50, 'WProTalents mandates + Mismo/Howdy/Levels LATAM, 2026-08-04', current_date)
on conflict (role, country, effective_from) do nothing;

-- ============================================================
-- SALARY BENCHMARKS PROPOSED (admin staging area)
-- Admin writes proposed new values here. The monthly cron
-- (api/cron-refresh-salary.ts) promotes approved=true rows
-- into the live salary_benchmarks table.
-- ============================================================
create table if not exists public.salary_benchmarks_proposed (
  id           uuid primary key default gen_random_uuid(),
  role         text not null check (role in (
                 'ai_ml','llm','data','backend','frontend','fullstack',
                 'devops','product','data_eng','eng_manager'
               )),
  country      text not null check (country in ('BR','MX','CO','AR','CL')),
  base_salary  integer not null,
  remote_mult  numeric(4,2) not null,
  source       text,
  approved     boolean not null default false,
  proposed_by  text,                       -- admin email / identifier
  created_at   timestamptz not null default now()
);
create index if not exists salary_benchmarks_proposed_lookup_idx
  on public.salary_benchmarks_proposed (role, country, approved, created_at desc);

alter table public.salary_benchmarks_proposed enable row level security;
-- Only service role (cron + admin) can read/write; no anon access
drop policy if exists salary_benchmarks_proposed_no_anon on public.salary_benchmarks_proposed;
create policy salary_benchmarks_proposed_no_anon on public.salary_benchmarks_proposed
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
