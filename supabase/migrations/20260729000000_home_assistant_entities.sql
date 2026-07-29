-- Home Tech Vault
-- Home Assistant entity state foundation
--
-- Stores sanitized Home Assistant entity state received from a paired
-- desktop connector.
--
-- Home Assistant access tokens must never be stored in this table,
-- Supabase, browser storage, logs, or API responses.

CREATE TABLE IF NOT EXISTS public.home_assistant_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  household_id UUID NOT NULL
    REFERENCES public.households(id)
    ON DELETE CASCADE,

  connector_id UUID NOT NULL
    REFERENCES public.connector_installations(id)
    ON DELETE CASCADE,

  discovered_device_id UUID
    REFERENCES public.discovered_devices(id)
    ON DELETE SET NULL,

  device_id UUID
    REFERENCES public.devices(id)
    ON DELETE SET NULL,

  local_fingerprint TEXT,

  entity_id TEXT NOT NULL,
  domain TEXT NOT NULL,
  object_id TEXT NOT NULL,

  friendly_name TEXT,
  current_state TEXT NOT NULL DEFAULT 'unknown',

  available BOOLEAN NOT NULL DEFAULT false,

  device_class TEXT,
  unit_of_measurement TEXT,

  supported_features BIGINT,

  attributes JSONB NOT NULL DEFAULT '{}'::jsonb,

  home_assistant_last_changed_at TIMESTAMPTZ,
  home_assistant_last_updated_at TIMESTAMPTZ,

  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT home_assistant_entities_entity_id_not_blank
    CHECK (length(trim(entity_id)) > 0),

  CONSTRAINT home_assistant_entities_domain_not_blank
    CHECK (length(trim(domain)) > 0),

  CONSTRAINT home_assistant_entities_object_id_not_blank
    CHECK (length(trim(object_id)) > 0),

  CONSTRAINT home_assistant_entities_unique_connector_entity
    UNIQUE (connector_id, entity_id)
);

CREATE INDEX IF NOT EXISTS home_assistant_entities_household_id_idx
  ON public.home_assistant_entities (household_id);

CREATE INDEX IF NOT EXISTS home_assistant_entities_connector_id_idx
  ON public.home_assistant_entities (connector_id);

CREATE INDEX IF NOT EXISTS home_assistant_entities_discovered_device_id_idx
  ON public.home_assistant_entities (discovered_device_id)
  WHERE discovered_device_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS home_assistant_entities_device_id_idx
  ON public.home_assistant_entities (device_id)
  WHERE device_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS home_assistant_entities_domain_idx
  ON public.home_assistant_entities (household_id, domain);

CREATE INDEX IF NOT EXISTS home_assistant_entities_available_idx
  ON public.home_assistant_entities (household_id, available);

CREATE INDEX IF NOT EXISTS home_assistant_entities_last_synced_at_idx
  ON public.home_assistant_entities (connector_id, last_synced_at DESC);

ALTER TABLE public.home_assistant_entities
  ENABLE ROW LEVEL SECURITY;

-- Household members can read synchronized entity state.
-- Viewers remain read-only because there are no authenticated write policies.

DROP POLICY IF EXISTS home_assistant_entities_select_member
  ON public.home_assistant_entities;

CREATE POLICY home_assistant_entities_select_member
  ON public.home_assistant_entities
  FOR SELECT
  TO authenticated
  USING (
    public.can_household_read(household_id)
  );

-- Connector writes will be performed by authenticated server API routes
-- using the service-role client. Do not add direct browser INSERT, UPDATE,
-- or DELETE policies.

COMMENT ON TABLE public.home_assistant_entities IS
  'Sanitized Home Assistant entity states synchronized by paired desktop connectors. Never stores Home Assistant access tokens.';

COMMENT ON COLUMN public.home_assistant_entities.entity_id IS
  'Unique Home Assistant entity identifier such as light.living_room_lamp.';

COMMENT ON COLUMN public.home_assistant_entities.local_fingerprint IS
  'Provisional grouped-device fingerprint from the desktop connector. This should later be supplemented by Home Assistant device-registry identifiers.';

COMMENT ON COLUMN public.home_assistant_entities.attributes IS
  'Sanitized Home Assistant state attributes. Must never include credentials or authorization data.';

COMMENT ON COLUMN public.home_assistant_entities.supported_features IS
  'Home Assistant supported_features bitmask when supplied by the entity.';
