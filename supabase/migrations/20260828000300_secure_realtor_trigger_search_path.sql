-- ==========================================================
-- HOME TECH VAULT
-- Harden Realtor Trigger Function Search Path
-- ==========================================================

alter function public.set_realtor_transfer_updated_at()
set search_path = public, pg_temp;
