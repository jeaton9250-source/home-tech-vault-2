-- Platform email delivery log for transactional notifications (plan grants, etc.)

CREATE TABLE IF NOT EXISTS platform_email_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL
    CHECK (
      event_type IN (
        'grant_created',
        'grant_replaced',
        'grant_revoked',
        'grant_expiring_soon',
        'grant_expired'
      )
    ),
  recipient_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  related_grant_id UUID REFERENCES platform_plan_grants(id) ON DELETE SET NULL,
  provider TEXT NOT NULL DEFAULT 'resend',
  provider_message_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (
      status IN (
        'pending',
        'sent',
        'failed',
        'skipped'
      )
    ),
  error_code TEXT,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  idempotency_key TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_platform_email_deliveries_idempotency
  ON platform_email_deliveries(idempotency_key);

CREATE INDEX IF NOT EXISTS idx_platform_email_deliveries_grant_id
  ON platform_email_deliveries(related_grant_id, attempted_at DESC);

CREATE INDEX IF NOT EXISTS idx_platform_email_deliveries_recipient
  ON platform_email_deliveries(recipient_user_id, attempted_at DESC);

ALTER TABLE platform_email_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY platform_email_deliveries_select_admin
  ON platform_email_deliveries
  FOR SELECT
  TO authenticated
  USING (public.is_platform_admin());

REVOKE ALL ON TABLE platform_email_deliveries FROM anon;
