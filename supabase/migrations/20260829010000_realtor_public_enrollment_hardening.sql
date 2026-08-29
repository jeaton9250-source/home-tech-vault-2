-- ==========================================================
-- HOME TECH VAULT
-- Public Realtor Enrollment Hardening
--
-- Server-controlled evidence that an Auth user legitimately
-- entered through the public Realtor signup flow.
-- ==========================================================

create table if not exists public.realtor_enrollments (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null unique
    references auth.users(id)
    on delete cascade,

  email text not null,

  first_name text,
  last_name text,
  brokerage_name text,
  license_state text,

  status text not null default 'pending'
    check (
      status in (
        'pending',
        'completed',
        'cancelled'
      )
    ),

  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists
  realtor_enrollments_email_unique_idx
on public.realtor_enrollments(lower(email));

create index if not exists
  realtor_enrollments_status_idx
on public.realtor_enrollments(status);

alter table public.realtor_enrollments
enable row level security;

-- No browser-accessible policies.
-- All enrollment reads/writes go through server-side
-- service-role routes.

revoke all
on table public.realtor_enrollments
from anon, authenticated;

grant all
on table public.realtor_enrollments
to service_role;
