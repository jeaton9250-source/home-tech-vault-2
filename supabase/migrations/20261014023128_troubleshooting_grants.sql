begin;
-- Supabase default privileges can include TRUNCATE, which is not governed by RLS.
revoke all on public.troubleshooting_issues from authenticated;
grant select, insert, update, delete on public.troubleshooting_issues to authenticated;
commit;
