-- ==========================================================
-- HOME TECH VAULT
-- Remove leftover unique owner index
-- ==========================================================

drop index if exists public.households_owner_id_unique;

create index if not exists households_owner_id_idx
on public.households(owner_id);
