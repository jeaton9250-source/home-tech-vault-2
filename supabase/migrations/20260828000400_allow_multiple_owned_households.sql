-- ==========================================================
-- HOME TECH VAULT
-- Allow one user to temporarily own multiple households.
--
-- Required for Realtor Closing Vaults:
-- a Realtor may prepare several client homes at once.
-- ==========================================================

alter table public.households
drop constraint if exists households_owner_id_unique;

create index if not exists households_owner_id_idx
on public.households(owner_id);
