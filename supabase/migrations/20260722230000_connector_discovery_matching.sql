-- Home Tech Vault Connector Phase 2B.1 — discovery matching and network enrichment
-- (review only — do not apply automatically)

-- ---------------------------------------------------------------------------
-- devices: network enrichment fields
-- ---------------------------------------------------------------------------

ALTER TABLE public.devices
  ADD COLUMN IF NOT EXISTS hostname TEXT,
  ADD COLUMN IF NOT EXISTS network_fingerprint TEXT,
  ADD COLUMN IF NOT EXISTS first_seen_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS connector_id UUID
    REFERENCES public.connector_installations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS devices_household_mac_address_idx
  ON public.devices (household_id, mac_address)
  WHERE mac_address IS NOT NULL;

CREATE INDEX IF NOT EXISTS devices_household_network_fingerprint_idx
  ON public.devices (household_id, network_fingerprint)
  WHERE network_fingerprint IS NOT NULL;

-- ---------------------------------------------------------------------------
-- discovered_devices: match metadata and discovery detail
-- ---------------------------------------------------------------------------

ALTER TABLE public.discovered_devices
  ADD COLUMN IF NOT EXISTS model TEXT,
  ADD COLUMN IF NOT EXISTS serial_number TEXT,
  ADD COLUMN IF NOT EXISTS match_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS match_confirmed_by UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS discovered_devices_household_mac_address_idx
  ON public.discovered_devices (household_id, mac_address)
  WHERE mac_address IS NOT NULL;

CREATE INDEX IF NOT EXISTS discovered_devices_imported_device_id_idx
  ON public.discovered_devices (imported_device_id)
  WHERE imported_device_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Row Level Security: members may confirm matches (not viewers)
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS discovered_devices_update_admin ON public.discovered_devices;

DROP POLICY IF EXISTS discovered_devices_update_mutator ON public.discovered_devices;
CREATE POLICY discovered_devices_update_mutator
  ON public.discovered_devices
  FOR UPDATE
  TO authenticated
  USING (public.can_household_mutate(household_id))
  WITH CHECK (public.can_household_mutate(household_id));
