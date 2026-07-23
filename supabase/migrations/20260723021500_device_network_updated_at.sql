-- Track last successful vault-device network enrichment from connector scans.

ALTER TABLE public.devices
  ADD COLUMN IF NOT EXISTS network_updated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS devices_household_network_updated_at_idx
  ON public.devices (household_id, network_updated_at DESC NULLS LAST)
  WHERE network_updated_at IS NOT NULL;
