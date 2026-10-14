begin;
create table public.troubleshooting_issues (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  device_id uuid references public.devices(id) on delete set null,
  category text not null default 'Other' check (length(category) <= 80),
  description text not null check (length(description) between 1 and 1200),
  ai_summary text not null default '' check (length(ai_summary) <= 800),
  status text not null default 'open' check (status in ('open','resolved')),
  resolution text check (length(resolution) <= 1200),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  check ((status = 'open' and resolved_at is null) or (status = 'resolved' and resolved_at is not null))
);
create index troubleshooting_issues_user_created_idx on public.troubleshooting_issues(user_id, created_at desc);
create index troubleshooting_issues_device_idx on public.troubleshooting_issues(device_id);
alter table public.troubleshooting_issues enable row level security;
revoke all on public.troubleshooting_issues from anon, public;
grant select,insert,update,delete on public.troubleshooting_issues to authenticated;
create policy issues_select on public.troubleshooting_issues for select to authenticated using ((select auth.uid()) = user_id);
create policy issues_insert on public.troubleshooting_issues for insert to authenticated with check (
  (select auth.uid()) = user_id and (device_id is null or exists (
    select 1 from public.devices d where d.id = device_id and d.user_id = (select auth.uid())
  ))
);
create policy issues_update on public.troubleshooting_issues for update to authenticated using ((select auth.uid()) = user_id) with check (
  (select auth.uid()) = user_id and (device_id is null or exists (
    select 1 from public.devices d where d.id = device_id and d.user_id = (select auth.uid())
  ))
);
create policy issues_delete on public.troubleshooting_issues for delete to authenticated using ((select auth.uid()) = user_id);
comment on table public.troubleshooting_issues is 'Private user-owned issues. Photos and full chat transcripts are not retained.';
commit;
