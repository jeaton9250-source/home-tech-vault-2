-- Home Tech Vault Connector Phase 1 (review only — do not apply automatically)
--
-- Tables: connector_installations, connector_pairing_sessions,
--         discovered_devices, device_monitor_events
--
-- Pairing and token writes are service-role only (Next.js API).
-- Authenticated clients may read household connector data where noted.

-- ---------------------------------------------------------------------------
-- connector_installations
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.connector_installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  created_by_user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  platform TEXT,
  app_version TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'revoked')),
  token_hash TEXT,
  last_seen_at TIMESTAMPTZ,
  last_scan_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS connector_installations_household_id_idx
  ON public.connector_installations (household_id);

CREATE INDEX IF NOT EXISTS connector_installations_status_idx
  ON public.connector_installations (household_id, status)
  WHERE revoked_at IS NULL;

-- ---------------------------------------------------------------------------
-- connector_pairing_sessions
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.connector_pairing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  created_by_user_id UUID NOT NULL REFERENCES auth.users(id),
  code_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  installation_id UUID REFERENCES public.connector_installations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS connector_pairing_sessions_household_id_idx
  ON public.connector_pairing_sessions (household_id);

CREATE INDEX IF NOT EXISTS connector_pairing_sessions_expires_at_idx
  ON public.connector_pairing_sessions (expires_at)
  WHERE consumed_at IS NULL;

CREATE INDEX IF NOT EXISTS connector_pairing_sessions_active_household_idx
  ON public.connector_pairing_sessions (household_id, expires_at)
  WHERE consumed_at IS NULL;

-- ---------------------------------------------------------------------------
-- discovered_devices (schema only — not used in Phase 1 UI)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.discovered_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  connector_id UUID NOT NULL REFERENCES public.connector_installations(id) ON DELETE CASCADE,
  local_fingerprint TEXT NOT NULL,
  hostname TEXT,
  manufacturer TEXT,
  ip_address INET,
  mac_address TEXT,
  device_type TEXT,
  online BOOLEAN NOT NULL DEFAULT true,
  discovery_sources TEXT[] NOT NULL DEFAULT '{}',
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  imported_device_id UUID REFERENCES public.devices(id) ON DELETE SET NULL,
  ignored_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (connector_id, local_fingerprint)
);

CREATE INDEX IF NOT EXISTS discovered_devices_household_id_idx
  ON public.discovered_devices (household_id);

CREATE INDEX IF NOT EXISTS discovered_devices_connector_id_idx
  ON public.discovered_devices (connector_id);

-- ---------------------------------------------------------------------------
-- device_monitor_events (schema only — not used in Phase 1 UI)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.device_monitor_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  connector_id UUID NOT NULL REFERENCES public.connector_installations(id) ON DELETE CASCADE,
  discovered_device_id UUID REFERENCES public.discovered_devices(id) ON DELETE CASCADE,
  device_id UUID REFERENCES public.devices(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  previous_state JSONB,
  new_state JSONB,
  observed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS device_monitor_events_household_id_idx
  ON public.device_monitor_events (household_id);

CREATE INDEX IF NOT EXISTS device_monitor_events_connector_id_idx
  ON public.device_monitor_events (connector_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.connector_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connector_pairing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovered_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_monitor_events ENABLE ROW LEVEL SECURITY;

-- connector_installations: household members may read; no client writes.

DROP POLICY IF EXISTS connector_installations_select_member ON public.connector_installations;
CREATE POLICY connector_installations_select_member
  ON public.connector_installations
  FOR SELECT
  TO authenticated
  USING (public.can_household_read(household_id));

DROP POLICY IF EXISTS connector_installations_update_admin ON public.connector_installations;
CREATE POLICY connector_installations_update_admin
  ON public.connector_installations
  FOR UPDATE
  TO authenticated
  USING (public.can_household_admin(household_id))
  WITH CHECK (public.can_household_admin(household_id));

-- connector_pairing_sessions: no authenticated access (service-role API only).

-- discovered_devices: household members may read; admin manages (future phases).

DROP POLICY IF EXISTS discovered_devices_select_member ON public.discovered_devices;
CREATE POLICY discovered_devices_select_member
  ON public.discovered_devices
  FOR SELECT
  TO authenticated
  USING (public.can_household_read(household_id));

DROP POLICY IF EXISTS discovered_devices_update_admin ON public.discovered_devices;
CREATE POLICY discovered_devices_update_admin
  ON public.discovered_devices
  FOR UPDATE
  TO authenticated
  USING (public.can_household_admin(household_id))
  WITH CHECK (public.can_household_admin(household_id));

DROP POLICY IF EXISTS discovered_devices_delete_admin ON public.discovered_devices;
CREATE POLICY discovered_devices_delete_admin
  ON public.discovered_devices
  FOR DELETE
  TO authenticated
  USING (public.can_household_admin(household_id));

-- device_monitor_events: household members may read only.

DROP POLICY IF EXISTS device_monitor_events_select_member ON public.device_monitor_events;
CREATE POLICY device_monitor_events_select_member
  ON public.device_monitor_events
  FOR SELECT
  TO authenticated
  USING (public.can_household_read(household_id));
