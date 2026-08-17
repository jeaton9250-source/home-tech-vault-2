-- ============================================================
-- Home Tech Vault lifecycle emails
-- ============================================================

CREATE TABLE IF NOT EXISTS public.lifecycle_email_preferences (
  user_id UUID PRIMARY KEY
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  -- Product onboarding messages such as
  -- "add your first device".
  onboarding_enabled BOOLEAN NOT NULL DEFAULT TRUE,

  -- Reserved for future promotional/re-engagement messages.
  -- Keep disabled unless the user explicitly opts in.
  marketing_enabled BOOLEAN NOT NULL DEFAULT FALSE,

  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lifecycle_email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  recipient_email TEXT NOT NULL,

  email_type TEXT NOT NULL,

  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (
      status IN (
        'pending',
        'sent',
        'failed',
        'skipped'
      )
    ),

  provider TEXT NOT NULL DEFAULT 'resend',
  provider_message_id TEXT,

  error_message TEXT,

  idempotency_key TEXT NOT NULL,

  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS
  idx_lifecycle_email_log_idempotency
ON public.lifecycle_email_log(idempotency_key);

CREATE INDEX IF NOT EXISTS
  idx_lifecycle_email_log_user
ON public.lifecycle_email_log(
  user_id,
  created_at DESC
);

CREATE INDEX IF NOT EXISTS
  idx_lifecycle_email_log_type
ON public.lifecycle_email_log(
  email_type,
  status,
  created_at DESC
);

ALTER TABLE public.lifecycle_email_preferences
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.lifecycle_email_log
  ENABLE ROW LEVEL SECURITY;

-- The service-role client used by the cron route bypasses RLS.
-- Ordinary clients do not need direct table access.

REVOKE ALL
ON TABLE public.lifecycle_email_preferences
FROM anon;

REVOKE ALL
ON TABLE public.lifecycle_email_log
FROM anon;
