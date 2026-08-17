alter table public.devices
add column if not exists created_at timestamptz;

update public.devices
set created_at = now()
where created_at is null;

alter table public.devices
alter column created_at set default now();

alter table public.devices
alter column created_at set not null;

create index if not exists devices_created_at_idx
on public.devices(created_at);
