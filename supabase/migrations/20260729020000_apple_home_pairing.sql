-- Apple Home Mac-first pairing sessions.
--
-- The Mac connector starts the session.
-- A signed-in household admin approves it from an Apple device.
-- Pairing codes are stored only as hashes.

CREATE TABLE IF NOT EXISTS public.apple_home_pairing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  household_id UUID NOT NULL
    REFERENCES public.households(id)
    ON DELETE CASCADE,

  connector_id UUID NOT NULL
    REFERENCES public.connector_installations(id)
    ON DELETE CASCADE,

  created_by_user_id UUID NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  approved_by_user_id UUID
    REFERENCES auth.users(id)
    ON DELETE SET NULL,

  code_hash TEXT NOT NULL UNIQUE,

  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (
      status IN (
        'pending',
        'approved',
        'expired',
        'cancelled'
      )
    ),

  expires_at TIMESTAMPTZ NOT NULL,
  approved_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS
  apple_home_pairing_sessions_household_idx
ON public.apple_home_pairing_sessions (
  household_id,
  created_at DESC
);

CREATE INDEX IF NOT EXISTS
  apple_home_pairing_sessions_connector_idx
ON public.apple_home_pairing_sessions (
  connector_id,
  created_at DESC
);

CREATE INDEX IF NOT EXISTS
  apple_home_pairing_sessions_active_idx
ON public.apple_home_pairing_sessions (
  connector_id,
  expires_at
)
WHERE status = 'pending';

ALTER TABLE
  public.apple_home_pairing_sessions
ENABLE ROW LEVEL SECURITY;

-- No direct authenticated-client access.
-- All reads and writes go through service-role API routes.

COMMENT ON TABLE
  public.apple_home_pairing_sessions
IS
  'Short-lived Mac-to-Apple-device pairing sessions for Apple Home authorization.';
