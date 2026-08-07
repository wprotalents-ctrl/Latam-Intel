-- ============================================================
-- Talent Pool submissions from the LinkedIn Boost modal
-- (Get Featured → Join WPro Talent Pool)
-- Run this in your Supabase SQL editor
-- ============================================================

create table if not exists public.talent_pool (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  role                text not null,
  location            text,
  skills              text not null,
  experience          text not null,
  availability        text not null,
  salary              text,
  contact             text not null,
  generated_post      text,
  lang                text default 'EN',
  status              text not null default 'new'
                        check (status in ('new','contacted','qualified','archived')),
  created_at          timestamptz not null default now()
);

-- Indexes for the two queries you'll actually run
create index if not exists idx_talent_pool_status_created
  on public.talent_pool (status, created_at desc);

create index if not exists idx_talent_pool_role
  on public.talent_pool (role);

-- RLS: anon blocked, service role bypasses (admin-only reads)
alter table public.talent_pool enable row level security;

-- No policies = no anon access. Service role (server) can read/write freely.
-- If you want admin UI access later, add a policy like:
--   create policy "admins can read talent_pool" on public.talent_pool
--     for select to authenticated
--     using (exists (select 1 from public.users where id = auth.uid() and subscription_status = 'premium'));
