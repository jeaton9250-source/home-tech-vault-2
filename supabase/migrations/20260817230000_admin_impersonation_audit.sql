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
      'founding_program_full',
      'impersonation_started',
      'impersonation_ended'
    )
  );
