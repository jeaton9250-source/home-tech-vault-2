alter table public.devices
  add column if not exists manual_status text,
  add column if not exists manual_checked_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'devices_manual_status_check'
  ) then
    alter table public.devices
      add constraint devices_manual_status_check
      check (
        manual_status is null
        or manual_status in (
          'pending',
          'found',
          'not_found'
        )
      );
  end if;
end
$$;
