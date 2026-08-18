CREATE TABLE IF NOT EXISTS public.admin_impersonation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  token_hash text NOT NULL UNIQUE,

  admin_user_id uuid NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  target_user_id uuid NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  admin_email_snapshot text,
  target_email_snapshot text,
  target_name_snapshot text,

  encrypted_admin_session text NOT NULL,

  status text NOT NULL DEFAULT 'pending'
    CHECK (
      status IN (
        'pending',
        'active',
        'ended',
        'failed',
        'revoked',
        'expired'
      )
    ),

  failure_reason text,

  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  ended_at timestamptz
);

CREATE INDEX IF NOT EXISTS
  idx_admin_impersonation_sessions_admin_created
ON public.admin_impersonation_sessions (
  admin_user_id,
  created_at DESC
);

CREATE INDEX IF NOT EXISTS
  idx_admin_impersonation_sessions_target
ON public.admin_impersonation_sessions (
  target_user_id,
  created_at DESC
);

CREATE INDEX IF NOT EXISTS
  idx_admin_impersonation_sessions_expiry
ON public.admin_impersonation_sessions (
  expires_at
)
WHERE status IN ('pending', 'active');

ALTER TABLE
  public.admin_impersonation_sessions
ENABLE ROW LEVEL SECURITY;

REVOKE ALL
ON TABLE public.admin_impersonation_sessions
FROM anon;

REVOKE ALL
ON TABLE public.admin_impersonation_sessions
FROM authenticated;

COMMENT ON TABLE public.admin_impersonation_sessions IS
  'Server-side recovery state for short-lived platform-admin impersonation sessions. Browser receives only an opaque random token.';
