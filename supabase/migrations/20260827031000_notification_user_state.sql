create table if not exists public.notification_user_state (
  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  notification_id text not null,

  read_at timestamptz,
  dismissed_at timestamptz,

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now(),

  primary key (
    user_id,
    notification_id
  )
);

create index if not exists
notification_user_state_user_id_idx
on public.notification_user_state (
  user_id
);

alter table
  public.notification_user_state
enable row level security;

drop policy if exists
  notification_user_state_select
on public.notification_user_state;

create policy
  notification_user_state_select
on public.notification_user_state
for select
to authenticated
using (
  user_id = (select auth.uid())
);

drop policy if exists
  notification_user_state_insert
on public.notification_user_state;

create policy
  notification_user_state_insert
on public.notification_user_state
for insert
to authenticated
with check (
  user_id = (select auth.uid())
);

drop policy if exists
  notification_user_state_update
on public.notification_user_state;

create policy
  notification_user_state_update
on public.notification_user_state
for update
to authenticated
using (
  user_id = (select auth.uid())
)
with check (
  user_id = (select auth.uid())
);

drop policy if exists
  notification_user_state_delete
on public.notification_user_state;

create policy
  notification_user_state_delete
on public.notification_user_state
for delete
to authenticated
using (
  user_id = (select auth.uid())
);
