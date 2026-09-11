create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  room_type text,
  cover_image_path text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rooms_name_not_blank check (length(trim(name)) > 0),
  constraint rooms_scope_present check (household_id is not null or user_id is not null)
);

create unique index if not exists rooms_household_name_unique
  on public.rooms (household_id, lower(name))
  where household_id is not null;

create unique index if not exists rooms_personal_name_unique
  on public.rooms (user_id, lower(name))
  where household_id is null;

create index if not exists rooms_household_sort_idx
  on public.rooms (household_id, sort_order, created_at);

create index if not exists rooms_user_sort_idx
  on public.rooms (user_id, sort_order, created_at);

alter table public.rooms enable row level security;

drop policy if exists rooms_select on public.rooms;
create policy rooms_select
on public.rooms
for select
to authenticated
using (
  (household_id is not null and public.can_household_read(household_id))
  or
  (household_id is null and user_id = auth.uid())
);

drop policy if exists rooms_insert on public.rooms;
create policy rooms_insert
on public.rooms
for insert
to authenticated
with check (
  (household_id is not null and public.can_household_mutate(household_id))
  or
  (household_id is null and user_id = auth.uid())
);

drop policy if exists rooms_update on public.rooms;
create policy rooms_update
on public.rooms
for update
to authenticated
using (
  (household_id is not null and public.can_household_mutate(household_id))
  or
  (household_id is null and user_id = auth.uid())
)
with check (
  (household_id is not null and public.can_household_mutate(household_id))
  or
  (household_id is null and user_id = auth.uid())
);

drop policy if exists rooms_delete on public.rooms;
create policy rooms_delete
on public.rooms
for delete
to authenticated
using (
  (household_id is not null and public.can_household_mutate(household_id))
  or
  (household_id is null and user_id = auth.uid())
);

create or replace function public.set_rooms_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists rooms_set_updated_at on public.rooms;
create trigger rooms_set_updated_at
before update on public.rooms
for each row execute function public.set_rooms_updated_at();

with room_seed as (
  select distinct
    d.household_id,
    null::uuid as user_id,
    trim(d.location) as name
  from public.devices d
  where d.household_id is not null
    and nullif(trim(d.location), '') is not null
    and lower(trim(d.location)) not in ('network', 'unassigned')

  union

  select distinct
    null::uuid as household_id,
    d.user_id,
    trim(d.location) as name
  from public.devices d
  where d.household_id is null
    and d.user_id is not null
    and nullif(trim(d.location), '') is not null
    and lower(trim(d.location)) not in ('network', 'unassigned')
)
insert into public.rooms (household_id, user_id, name)
select household_id, user_id, name
from room_seed
on conflict do nothing;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'room-images',
  'room-images',
  false,
  12582912,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.can_read_room_image(storage_path text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  room_id_text text;
  target_room_id uuid;
begin
  room_id_text := split_part(storage_path, '/', 2);

  if room_id_text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    return false;
  end if;

  target_room_id := room_id_text::uuid;

  return exists (
    select 1
    from public.rooms r
    where r.id = target_room_id
      and (
        (r.household_id is not null and public.can_household_read(r.household_id))
        or
        (r.household_id is null and r.user_id = auth.uid())
      )
  );
end;
$$;

create or replace function public.can_mutate_room_image(storage_path text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  room_id_text text;
  target_room_id uuid;
begin
  room_id_text := split_part(storage_path, '/', 2);

  if room_id_text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    return false;
  end if;

  target_room_id := room_id_text::uuid;

  return exists (
    select 1
    from public.rooms r
    where r.id = target_room_id
      and (
        (r.household_id is not null and public.can_household_mutate(r.household_id))
        or
        (r.household_id is null and r.user_id = auth.uid())
      )
  );
end;
$$;

grant execute on function public.can_read_room_image(text) to authenticated;
grant execute on function public.can_mutate_room_image(text) to authenticated;

drop policy if exists room_images_select on storage.objects;
create policy room_images_select
on storage.objects
for select
to authenticated
using (
  bucket_id = 'room-images'
  and public.can_read_room_image(name)
);

drop policy if exists room_images_insert on storage.objects;
create policy room_images_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'room-images'
  and public.can_mutate_room_image(name)
);

drop policy if exists room_images_update on storage.objects;
create policy room_images_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'room-images'
  and public.can_mutate_room_image(name)
)
with check (
  bucket_id = 'room-images'
  and public.can_mutate_room_image(name)
);

drop policy if exists room_images_delete on storage.objects;
create policy room_images_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'room-images'
  and public.can_mutate_room_image(name)
);
;
