-- Deletion job processor reliability: leases, stale detection, cancel support

ALTER TABLE public.admin_account_deletion_jobs
  DROP CONSTRAINT IF EXISTS admin_account_deletion_jobs_status_check;

ALTER TABLE public.admin_account_deletion_jobs
  ADD CONSTRAINT admin_account_deletion_jobs_status_check
  CHECK (
    status IN (
      'pending',
      'validating',
      'blocked',
      'processing',
      'completed',
      'failed',
      'canceled'
    )
  );

ALTER TABLE public.admin_account_deletion_jobs
  ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS canceled_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS processor_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS processor_lease_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS processor_actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS last_heartbeat_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_admin_account_deletion_jobs_updated_at
  ON public.admin_account_deletion_jobs(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_account_deletion_jobs_lease
  ON public.admin_account_deletion_jobs(processor_lease_expires_at)
  WHERE status = 'processing';

ALTER TABLE public.platform_admin_audit_events
  DROP CONSTRAINT IF EXISTS platform_admin_audit_events_event_type_check;

ALTER TABLE public.platform_admin_audit_events
  ADD CONSTRAINT platform_admin_audit_events_event_type_check
  CHECK (
    event_type IN (
      'account_deactivated',
      'account_reactivated',
      'deletion_requested',
      'deletion_blocked',
      'deletion_started',
      'deletion_completed',
      'deletion_failed',
      'deletion_canceled',
      'deletion_retried',
      'household_ownership_transferred',
      'founding_program_enabled',
      'founding_program_paused',
      'founding_program_capacity_changed',
      'founding_member_enrolled',
      'founding_member_removed',
      'founding_member_grant_revoked',
      'founding_program_full'
    )
  );

-- Atomically claim a deletion job for processing.
CREATE OR REPLACE FUNCTION public.claim_deletion_job(
  p_job_id UUID,
  p_actor_id UUID,
  p_lease_seconds INTEGER DEFAULT 300
)
RETURNS TABLE (
  claimed BOOLEAN,
  job_id UUID,
  target_user_id UUID,
  status TEXT,
  current_step TEXT,
  retry_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now TIMESTAMPTZ := now();
  v_lease_until TIMESTAMPTZ := now() + make_interval(secs => p_lease_seconds);
  v_row public.admin_account_deletion_jobs%ROWTYPE;
BEGIN
  SELECT *
  INTO v_row
  FROM public.admin_account_deletion_jobs
  WHERE id = p_job_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY
    SELECT false, NULL::UUID, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::INTEGER;
    RETURN;
  END IF;

  IF v_row.status IN ('completed', 'canceled', 'blocked') THEN
    RETURN QUERY
    SELECT
      false,
      v_row.id,
      v_row.target_user_id,
      v_row.status,
      v_row.current_step,
      v_row.retry_count;
    RETURN;
  END IF;

  IF
    v_row.status = 'processing'
    AND v_row.processor_lease_expires_at IS NOT NULL
    AND v_row.processor_lease_expires_at > v_now
  THEN
    RETURN QUERY
    SELECT
      false,
      v_row.id,
      v_row.target_user_id,
      v_row.status,
      v_row.current_step,
      v_row.retry_count;
    RETURN;
  END IF;

  UPDATE public.admin_account_deletion_jobs
  SET
    status = 'processing',
    current_step = COALESCE(v_row.current_step, 'queued'),
    started_at = COALESCE(v_row.started_at, v_now),
    failed_at = NULL,
    safe_error_code = NULL,
    safe_error_message = NULL,
    processor_started_at = v_now,
    processor_lease_expires_at = v_lease_until,
    processor_actor_id = p_actor_id,
    last_heartbeat_at = v_now,
    retry_count = CASE
      WHEN v_row.status = 'failed' THEN v_row.retry_count + 1
      ELSE v_row.retry_count
    END
  WHERE id = p_job_id
  RETURNING *
  INTO v_row;

  RETURN QUERY
  SELECT
    true,
    v_row.id,
    v_row.target_user_id,
    v_row.status,
    v_row.current_step,
    v_row.retry_count;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_deletion_job(UUID, UUID, INTEGER)
  FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.claim_deletion_job(UUID, UUID, INTEGER)
  TO service_role;

COMMENT ON COLUMN public.admin_account_deletion_jobs.processor_lease_expires_at IS
  'Exclusive processor lease expiry. Expired leases may be reclaimed safely.';
