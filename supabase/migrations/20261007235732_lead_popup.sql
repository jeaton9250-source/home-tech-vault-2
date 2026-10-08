create table public.popup_settings(id integer primary key check(id=1),content jsonb not null,updated_by uuid references auth.users(id) on delete set null,updated_at timestamptz not null default now());
create table public.popup_submissions(
 id uuid primary key default gen_random_uuid(),campaign text not null,email text not null,name text not null default '',phone text not null default '',message text not null default '',
 marketing_consent boolean not null default false,consent_text text,settings_revision text not null,source_page text not null,created_at timestamptz not null default now(),unique(campaign,email)
);
create index popup_submissions_date on public.popup_submissions(created_at desc);
create table public.popup_rate_limits(key text not null,bucket timestamptz not null,attempts integer not null,primary key(key,bucket));
alter table public.popup_settings enable row level security;
alter table public.popup_submissions enable row level security;
alter table public.popup_rate_limits enable row level security;
revoke all on public.popup_settings,public.popup_submissions,public.popup_rate_limits from anon,authenticated;
grant select,insert,update,delete on public.popup_settings,public.popup_submissions,public.popup_rate_limits to service_role;
create function public.consume_popup_rate_limit(p_key text) returns boolean language plpgsql security invoker set search_path='' as $$
declare used integer; current_bucket timestamptz=date_trunc('hour',now());
begin
 delete from public.popup_rate_limits where bucket<now()-interval '1 day';
 insert into public.popup_rate_limits(key,bucket,attempts) values(p_key,current_bucket,1)
 on conflict(key,bucket) do update set attempts=public.popup_rate_limits.attempts+1 returning attempts into used;
 return used<=10;
end $$;
revoke all on function public.consume_popup_rate_limit(text) from public,anon,authenticated;
grant execute on function public.consume_popup_rate_limit(text) to service_role;
