-- Device Intelligence v3 (Phase 3A)
-- Additive only. Does not rewrite confirmed identities.
-- Run via Supabase CLI or SQL editor after review.

-- Enrich discovered_devices with intelligence metadata
ALTER TABLE public.discovered_devices
  ADD COLUMN IF NOT EXISTS is_private_mac boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mac_vendor text,
  ADD COLUMN IF NOT EXISTS mac_vendor_source text,
  ADD COLUMN IF NOT EXISTS normalized_hostname text,
  ADD COLUMN IF NOT EXISTS suggested_manufacturer text,
  ADD COLUMN IF NOT EXISTS suggested_family text,
  ADD COLUMN IF NOT EXISTS suggested_category text,
  ADD COLUMN IF NOT EXISTS confidence_score integer,
  ADD COLUMN IF NOT EXISTS identification_source text,
  ADD COLUMN IF NOT EXISTS intelligence_result jsonb,
  ADD COLUMN IF NOT EXISTS analyzed_at timestamptz,
  ADD COLUMN IF NOT EXISTS rule_set_version text,
  ADD COLUMN IF NOT EXISTS catalog_version text,
  ADD COLUMN IF NOT EXISTS vendor_dataset_version text;

COMMENT ON COLUMN public.discovered_devices.is_private_mac IS
  'True when MAC is locally administered / randomized; OUI vendor is unreliable.';
COMMENT ON COLUMN public.discovered_devices.intelligence_result IS
  'Device Intelligence v3 ranked candidates and evidence (no raw fingerprint hashes exposed to UI).';
COMMENT ON COLUMN public.discovered_devices.rule_set_version IS
  'Ruleset version used for the last analysis pass.';

-- Household-scoped identity confirmations (do not share across households)
CREATE TABLE IF NOT EXISTS public.device_identity_confirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  device_id uuid NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  discovered_device_id uuid REFERENCES public.discovered_devices(id) ON DELETE SET NULL,
  stable_fingerprint_hash text,
  normalized_mac text,
  ssdp_usn_hash text,
  mdns_identity_hash text,
  confirmed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  confirmed_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS device_identity_confirmations_household_idx
  ON public.device_identity_confirmations (household_id)
  WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS device_identity_confirmations_fingerprint_idx
  ON public.device_identity_confirmations (household_id, stable_fingerprint_hash)
  WHERE revoked_at IS NULL AND stable_fingerprint_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS device_identity_confirmations_mac_idx
  ON public.device_identity_confirmations (household_id, normalized_mac)
  WHERE revoked_at IS NULL AND normalized_mac IS NOT NULL;

ALTER TABLE public.device_identity_confirmations ENABLE ROW LEVEL SECURITY;

-- Platform / household members: read confirmations for own household only
DROP POLICY IF EXISTS device_identity_confirmations_select_household
  ON public.device_identity_confirmations;
CREATE POLICY device_identity_confirmations_select_household
  ON public.device_identity_confirmations
  FOR SELECT
  USING (
    household_id IN (
      SELECT hm.household_id
      FROM public.household_members hm
      WHERE hm.user_id = auth.uid()
    )
  );

-- Household admins/owners can insert confirmations
DROP POLICY IF EXISTS device_identity_confirmations_insert_household
  ON public.device_identity_confirmations;
CREATE POLICY device_identity_confirmations_insert_household
  ON public.device_identity_confirmations
  FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT hm.household_id
      FROM public.household_members hm
      WHERE hm.user_id = auth.uid()
        AND hm.role IN ('owner', 'admin')
    )
  );

-- Household admins/owners can revoke (soft) confirmations
DROP POLICY IF EXISTS device_identity_confirmations_update_household
  ON public.device_identity_confirmations;
CREATE POLICY device_identity_confirmations_update_household
  ON public.device_identity_confirmations
  FOR UPDATE
  USING (
    household_id IN (
      SELECT hm.household_id
      FROM public.household_members hm
      WHERE hm.user_id = auth.uid()
        AND hm.role IN ('owner', 'admin')
    )
  );
