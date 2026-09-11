create table public.maintenance_push_deliveries (
  id uuid primary key default gen_random_uuid(),
  maintenance_task_id uuid not null references public.maintenance_tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  push_token_id uuid not null references public.device_push_tokens(id) on delete cascade,
  reminder_kind text not null check (reminder_kind in ('due_48h', 'due_24h', 'overdue')),
  due_date date not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'delivered', 'failed')),
  expo_ticket_id text,
  error_code text,
  sent_at timestamptz,
  receipt_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (maintenance_task_id, user_id, push_token_id, reminder_kind, due_date)
);

create index maintenance_push_deliveries_receipt_idx
  on public.maintenance_push_deliveries (status, sent_at)
  where status = 'accepted' and receipt_checked_at is null;

create index maintenance_push_deliveries_task_idx
  on public.maintenance_push_deliveries (maintenance_task_id);

alter table public.maintenance_push_deliveries enable row level security;

revoke all on public.maintenance_push_deliveries from anon, authenticated;

comment on table public.maintenance_push_deliveries is
  'Private server-side ledger for deduplicating maintenance push notifications and checking Expo receipts.';
