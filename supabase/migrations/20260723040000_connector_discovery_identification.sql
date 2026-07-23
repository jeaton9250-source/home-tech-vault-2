-- Connector discovery identification metadata (review only — do not apply automatically)

ALTER TABLE public.discovered_devices
  ADD COLUMN IF NOT EXISTS friendly_name TEXT,
  ADD COLUMN IF NOT EXISTS mdns_services TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS ssdp_device_type TEXT,
  ADD COLUMN IF NOT EXISTS ssdp_description_url TEXT,
  ADD COLUMN IF NOT EXISTS likely_category TEXT,
  ADD COLUMN IF NOT EXISTS likely_brand TEXT,
  ADD COLUMN IF NOT EXISTS identification_confidence TEXT
    CHECK (
      identification_confidence IS NULL OR
      identification_confidence IN ('exact', 'high', 'medium', 'low', 'unknown')
    ),
  ADD COLUMN IF NOT EXISTS identification_reasons TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS identification_display_name TEXT;

CREATE INDEX IF NOT EXISTS discovered_devices_household_identification_idx
  ON public.discovered_devices (household_id, identification_confidence)
  WHERE identification_confidence IN ('unknown', 'medium');
