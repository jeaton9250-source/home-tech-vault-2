alter table public.devices
  add column if not exists room_id uuid null;

alter table public.devices
  drop constraint if exists devices_room_id_fkey;

alter table public.devices
  add constraint devices_room_id_fkey
  foreign key (room_id)
  references public.rooms(id)
  on delete set null;

create index if not exists idx_devices_room_id
  on public.devices(room_id);

create or replace function public.validate_and_sync_device_room()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_room public.rooms%rowtype;
begin
  if new.room_id is null then
    return new;
  end if;

  select * into v_room
  from public.rooms
  where id = new.room_id;

  if not found then
    raise exception 'Room % does not exist', new.room_id;
  end if;

  if new.household_id is not null then
    if v_room.household_id is distinct from new.household_id then
      raise exception 'Device room must belong to the same household';
    end if;
  else
    if v_room.household_id is not null or v_room.user_id is distinct from new.user_id then
      raise exception 'Personal device room must belong to the same user';
    end if;
  end if;

  new.location := v_room.name;
  return new;
end;
$$;

drop trigger if exists trg_validate_and_sync_device_room on public.devices;
create trigger trg_validate_and_sync_device_room
before insert or update of room_id, household_id, user_id
on public.devices
for each row
execute function public.validate_and_sync_device_room();

create or replace function public.sync_device_location_on_room_rename()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.name is distinct from old.name then
    update public.devices
    set location = new.name
    where room_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sync_device_location_on_room_rename on public.rooms;
create trigger trg_sync_device_location_on_room_rename
after update of name
on public.rooms
for each row
execute function public.sync_device_location_on_room_rename();

with candidate_matches as (
  select
    d.id as device_id,
    min(r.id::text)::uuid as room_id,
    count(*) as match_count
  from public.devices d
  join public.rooms r
    on lower(trim(r.name)) = lower(trim(d.location))
   and (
     (d.household_id is not null and r.household_id = d.household_id)
     or
     (d.household_id is null and r.household_id is null and r.user_id = d.user_id)
   )
  where nullif(trim(d.location), '') is not null
    and d.room_id is null
  group by d.id
)
update public.devices d
set room_id = c.room_id
from candidate_matches c
where d.id = c.device_id
  and c.match_count = 1;;
