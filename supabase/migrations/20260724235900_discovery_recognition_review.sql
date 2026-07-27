-- Discovery recognition review workflow (Phase 1)
-- Adds user-review state for suggested identification on discovered devices.

ALTER TABLE public.discovered_devices
  ADD COLUMN IF NOT EXISTS recognition_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (recognition_status IN ('pending', 'accepted', 'dismissed')),
  ADD COLUMN IF NOT EXISTS recognition_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS recognition_reviewed_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS recognition_accepted_name TEXT,
  ADD COLUMN IF NOT EXISTS recognition_accepted_manufacturer TEXT,
  ADD COLUMN IF NOT EXISTS recognition_accepted_model TEXT,
  ADD COLUMN IF NOT EXISTS recognition_accepted_category TEXT,
  ADD COLUMN IF NOT EXISTS recognition_accepted_device_type_key TEXT;

CREATE INDEX IF NOT EXISTS discovered_devices_household_recognition_status_idx
  ON public.discovered_devices (household_id, recognition_status);
