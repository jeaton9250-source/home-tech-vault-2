CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'ios_app'
    CHECK (source IN ('ios_app', 'android_app', 'web', 'support')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'canceled')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  scheduled_for TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  completed_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS account_deletion_requests_one_open_per_user
  ON public.account_deletion_requests(user_id)
  WHERE user_id IS NOT NULL AND status IN ('pending', 'processing');

CREATE INDEX IF NOT EXISTS account_deletion_requests_due
  ON public.account_deletion_requests(scheduled_for)
  WHERE status = 'pending';

ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.account_deletion_requests FROM anon, authenticated;

COMMENT ON TABLE public.account_deletion_requests IS
  'Tracks user-initiated account erasure requests. The account is deactivated immediately and permanent erasure is scheduled within seven days.';
