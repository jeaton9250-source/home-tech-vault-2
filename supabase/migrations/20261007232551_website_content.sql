create table public.website_content (
  key text primary key check (key = 'homepage'),
  content jsonb not null,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);
create table public.website_articles (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  description text not null,
  body text not null,
  published boolean not null default false,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);
alter table public.website_content enable row level security;
alter table public.website_articles enable row level security;
revoke all on public.website_content, public.website_articles from anon, authenticated;
grant select, insert, update, delete on public.website_content, public.website_articles to service_role;
-- These tables are accessed only by server-side code. Every write requires
-- a verified platform-admin session and same-origin request.
