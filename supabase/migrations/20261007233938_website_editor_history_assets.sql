create table public.website_drafts (
  key text primary key check (key = 'homepage'), content jsonb not null,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);
create table public.website_versions (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('homepage','article')),
  key text not null, content jsonb not null,
  action text not null check (action in ('published','draft','baseline')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index website_versions_lookup on public.website_versions(kind,key,id desc);
create table public.website_assets (
  id uuid primary key default gen_random_uuid(), path text unique not null,
  url text not null, filename text not null,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.website_drafts enable row level security;
alter table public.website_versions enable row level security;
alter table public.website_assets enable row level security;
revoke all on public.website_drafts,public.website_versions,public.website_assets from anon,authenticated;
grant select,insert,update,delete on public.website_drafts,public.website_assets to service_role;
grant select,insert on public.website_versions to service_role;
grant usage,select on sequence public.website_versions_id_seq to service_role;
create function public.record_website_version() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if tg_table_name = 'website_articles' then
    insert into public.website_versions(kind,key,content,action,created_by)
    values ('article',new.slug,jsonb_build_object('slug',new.slug,'title',new.title,'description',new.description,'body',new.body,'published',new.published),case when new.published then 'published' else 'draft' end,new.updated_by);
  else
    insert into public.website_versions(kind,key,content,action,created_by)
    values ('homepage',new.key,new.content,case when tg_table_name = 'website_drafts' then 'draft' else 'published' end,new.updated_by);
  end if;
  if tg_table_name = 'website_content' then
    delete from public.website_drafts where key = new.key;
  end if;
  return new;
end $$;
revoke all on function public.record_website_version() from public,anon,authenticated;
grant execute on function public.record_website_version() to service_role;
create trigger website_content_version after insert or update on public.website_content for each row execute function public.record_website_version();
create trigger website_draft_version after insert or update on public.website_drafts for each row execute function public.record_website_version();
create trigger website_article_version after insert or update on public.website_articles for each row execute function public.record_website_version();
insert into public.website_versions(kind,key,content,action,created_by)
select 'homepage',key,content,'baseline',updated_by from public.website_content;
insert into public.website_versions(kind,key,content,action,created_by)
select 'article',slug,jsonb_build_object('slug',slug,'title',title,'description',description,'body',body,'published',published),'baseline',updated_by from public.website_articles;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('website-assets','website-assets',true,3145728,array['image/jpeg','image/png','image/webp']);
-- Restrictive policy also blocks any pre-existing broad client storage policy.
create policy website_assets_server_writes_only on storage.objects as restrictive for all to anon,authenticated
using (bucket_id <> 'website-assets') with check (bucket_id <> 'website-assets');
