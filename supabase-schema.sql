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
  unsubscribed_at  timestamptz
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
