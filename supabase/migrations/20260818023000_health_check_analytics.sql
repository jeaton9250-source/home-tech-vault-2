-- Home Tech Vault
-- Anonymous Home Tech Health Check analytics.
--
-- This table is server-write only.
-- Public browser clients must use the controlled Next.js API route.

create table if not exists public.health_check_completions (
  id uuid primary key default gen_random_uuid(),

  attempt_id uuid not null unique,

  score integer not null
    check (score between 0 and 100),

  source text,
  campaign text,
  referrer_host text,

  completed_at timestamptz not null default now()
);

create index if not exists
  health_check_completions_completed_at_idx
on public.health_check_completions (
  completed_at desc
);

create index if not exists
  health_check_completions_source_idx
on public.health_check_completions (
  source,
  completed_at desc
);

alter table public.health_check_completions
  enable row level security;

-- Intentionally create no public policies.
-- anon/authenticated browser clients receive no direct table access.
-- The service-role server client bypasses RLS.

comment on table public.health_check_completions is
  'Server-recorded anonymous completion analytics for the public Home Tech Health Check.';

comment on column public.health_check_completions.attempt_id is
  'Browser-generated UUID used to make completion reporting idempotent without identifying the visitor.';
