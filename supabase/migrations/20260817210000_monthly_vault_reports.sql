
alter table public.lifecycle_email_preferences
add column if not exists monthly_report_enabled boolean
not null default true;

create table if not exists public.monthly_vault_report_log (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  recipient_email text not null,

  report_month text not null,

  vault_score integer,
  vault_status text,

  device_count integer not null default 0,
  document_count integer not null default 0,

  status text not null default 'pending'
    check (
      status in (
        'pending',
        'sent',
        'failed',
        'skipped'
      )
    ),

  provider text not null default 'resend',
  provider_message_id text,
  error_message text,

  attempted_at timestamptz,
  sent_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(user_id, report_month)
);

create index if not exists
monthly_vault_report_log_user_idx
on public.monthly_vault_report_log(user_id);

create index if not exists
monthly_vault_report_log_month_idx
on public.monthly_vault_report_log(report_month);

alter table public.monthly_vault_report_log
enable row level security;

revoke all
on public.monthly_vault_report_log
from anon;

revoke all
on public.monthly_vault_report_log
from authenticated;
