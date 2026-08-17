
alter table public.monthly_vault_report_log
add column if not exists report_key text;

update public.monthly_vault_report_log
set report_key = 'user:' || user_id::text
where report_key is null;

alter table public.monthly_vault_report_log
alter column report_key set not null;

create unique index if not exists
monthly_vault_report_log_report_key_month_idx
on public.monthly_vault_report_log(
  report_key,
  report_month
);
