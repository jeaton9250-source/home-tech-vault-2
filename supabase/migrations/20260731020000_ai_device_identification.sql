-- Home Tech Vault
-- AI-assisted device identification foundation.
--
-- AI results are suggestions only. Accepted recognition
-- fields on discovered_devices remain authoritative.

CREATE TABLE IF NOT EXISTS public.ai_device_identification_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  household_id UUID NOT NULL
    REFERENCES public.households(id)
    ON DELETE CASCADE,

  connector_id UUID
    REFERENCES public.connector_installations(id)
    ON DELETE CASCADE,

  fingerprint_hash TEXT NOT NULL,
  observation_hash TEXT NOT NULL,

  model TEXT NOT NULL,

  suggested_name TEXT,
  suggested_manufacturer TEXT,
  suggested_model TEXT,
  suggested_category TEXT,
  suggested_device_type TEXT,

  confidence NUMERIC(4, 3) NOT NULL
    CHECK (
      confidence >= 0
      AND confidence <= 1
    ),

  reason TEXT NOT NULL,

  input_tokens INTEGER NOT NULL DEFAULT 0
    CHECK (input_tokens >= 0),

  output_tokens INTEGER NOT NULL DEFAULT 0
    CHECK (output_tokens >= 0),

  estimated_cost_micros BIGINT NOT NULL DEFAULT 0
    CHECK (estimated_cost_micros >= 0),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (
    household_id,
    fingerprint_hash,
    observation_hash
  )
);

CREATE INDEX IF NOT EXISTS
  ai_device_identification_cache_household_idx
ON public.ai_device_identification_cache (
  household_id,
  updated_at DESC
);

CREATE INDEX IF NOT EXISTS
  ai_device_identification_cache_fingerprint_idx
ON public.ai_device_identification_cache (
  fingerprint_hash
);


CREATE TABLE IF NOT EXISTS public.ai_usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  household_id UUID NOT NULL
    REFERENCES public.households(id)
    ON DELETE CASCADE,

  user_id UUID
    REFERENCES auth.users(id)
    ON DELETE SET NULL,

  connector_id UUID
    REFERENCES public.connector_installations(id)
    ON DELETE SET NULL,

  feature TEXT NOT NULL,
  model TEXT NOT NULL,

  input_tokens INTEGER NOT NULL DEFAULT 0
    CHECK (input_tokens >= 0),

  output_tokens INTEGER NOT NULL DEFAULT 0
    CHECK (output_tokens >= 0),

  estimated_cost_micros BIGINT NOT NULL DEFAULT 0
    CHECK (estimated_cost_micros >= 0),

  cache_hit BOOLEAN NOT NULL DEFAULT false,
  succeeded BOOLEAN NOT NULL DEFAULT true,
  error_code TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS
  ai_usage_events_household_created_idx
ON public.ai_usage_events (
  household_id,
  created_at DESC
);

CREATE INDEX IF NOT EXISTS
  ai_usage_events_feature_created_idx
ON public.ai_usage_events (
  feature,
  created_at DESC
);


ALTER TABLE
  public.ai_device_identification_cache
ENABLE ROW LEVEL SECURITY;

ALTER TABLE
  public.ai_usage_events
ENABLE ROW LEVEL SECURITY;


DROP POLICY IF EXISTS
  "Household members can view AI device identification cache"
ON public.ai_device_identification_cache;

CREATE POLICY
  "Household members can view AI device identification cache"
ON public.ai_device_identification_cache
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.household_members hm
    WHERE hm.household_id =
      ai_device_identification_cache.household_id
      AND hm.user_id = auth.uid()
  )
);


DROP POLICY IF EXISTS
  "Household members can view AI usage"
ON public.ai_usage_events;

CREATE POLICY
  "Household members can view AI usage"
ON public.ai_usage_events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.household_members hm
    WHERE hm.household_id =
      ai_usage_events.household_id
      AND hm.user_id = auth.uid()
  )
);


COMMENT ON TABLE
  public.ai_device_identification_cache
IS
  'Cached AI-generated device identification suggestions. User-accepted recognition remains authoritative.';

COMMENT ON TABLE
  public.ai_usage_events
IS
  'Per-household AI usage and estimated-cost records for limits and reporting.';
