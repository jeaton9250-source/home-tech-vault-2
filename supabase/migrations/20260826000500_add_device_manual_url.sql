alter table public.devices
add column if not exists manual_url text;

comment on column public.devices.manual_url is
'Verified official manufacturer web-based user guide URL used when no downloadable manual PDF is available.';
