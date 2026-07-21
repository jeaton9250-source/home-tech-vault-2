-- Platform-admin account deactivation and deletion job tracking.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'active'
    CHECK (account_status IN ('active', 'deactivated')),
  ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deactivated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS deactivation_reason TEXT,
  ADD COLUMN IF NOT EXISTS deactivation_notes TEXT,
  ADD COLUMN IF NOT EXISTS reactivated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reactivated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_account_status
  ON public.profiles(account_status);

CREATE TABLE IF NOT EXISTS public.admin_account_deletion_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_email_snapshot TEXT NOT NULL,
  requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  reason TEXT NOT NULL,
  notes TEXT,
  transfer_owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  delete_household_data BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (
      status IN (
        'pending',
        'validating',
        'blocked',
        'processing',
        'completed',
        'failed'
      )
    ),
  current_step TEXT,
  safe_error_code TEXT,
  safe_error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_account_deletion_jobs_target
  ON public.admin_account_deletion_jobs(target_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_account_deletion_jobs_status
  ON public.admin_account_deletion_jobs(status, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_account_deletion_jobs_one_active
  ON public.admin_account_deletion_jobs(target_user_id)
  WHERE status IN ('pending', 'validating', 'processing');

CREATE TABLE IF NOT EXISTS public.platform_admin_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL
    CHECK (
      event_type IN (
        'account_deactivated',
        'account_reactivated',
        'deletion_requested',
        'deletion_blocked',
        'deletion_started',
        'deletion_completed',
        'deletion_failed',
        'household_ownership_transferred'
      )
    ),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_user_id UUID,
  target_email_snapshot TEXT,
  reason TEXT,
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platform_admin_audit_events_created
  ON public.platform_admin_audit_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_platform_admin_audit_events_target
  ON public.platform_admin_audit_events(target_user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.update_admin_account_deletion_jobs_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS admin_account_deletion_jobs_updated_at
  ON public.admin_account_deletion_jobs;

CREATE TRIGGER admin_account_deletion_jobs_updated_at
  BEFORE UPDATE ON public.admin_account_deletion_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_admin_account_deletion_jobs_updated_at();

ALTER TABLE public.admin_account_deletion_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_admin_audit_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_account_deletion_jobs_platform_admin
  ON public.admin_account_deletion_jobs;

CREATE POLICY admin_account_deletion_jobs_platform_admin
  ON public.admin_account_deletion_jobs
  FOR ALL
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS platform_admin_audit_events_platform_admin
  ON public.platform_admin_audit_events;

CREATE POLICY platform_admin_audit_events_platform_admin
  ON public.platform_admin_audit_events
  FOR ALL
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

COMMENT ON COLUMN public.profiles.account_status IS
  'active or deactivated. Deactivated users cannot sign in.';
