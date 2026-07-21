-- Platform admin plan grants (complimentary Pro/Family access without Stripe changes)

CREATE TABLE IF NOT EXISTS platform_plan_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('pro', 'family')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'revoked', 'expired')),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  reason TEXT NOT NULL,
  notes TEXT,
  granted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  revocation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platform_plan_grants_user_id
  ON platform_plan_grants(user_id);

CREATE INDEX IF NOT EXISTS idx_platform_plan_grants_status
  ON platform_plan_grants(status);

CREATE INDEX IF NOT EXISTS idx_platform_plan_grants_user_active
  ON platform_plan_grants(user_id, status)
  WHERE status = 'active';

CREATE UNIQUE INDEX IF NOT EXISTS idx_platform_plan_grants_one_active_per_user
  ON platform_plan_grants(user_id)
  WHERE status = 'active';

CREATE TABLE IF NOT EXISTS platform_plan_grant_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id UUID REFERENCES platform_plan_grants(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL
    CHECK (
      event_type IN (
        'created',
        'replaced',
        'revoked',
        'expired'
      )
    ),
  plan TEXT NOT NULL CHECK (plan IN ('pro', 'family')),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT,
  expires_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platform_plan_grant_events_user_id
  ON platform_plan_grant_events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_platform_plan_grant_events_grant_id
  ON platform_plan_grant_events(grant_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.update_platform_plan_grants_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS platform_plan_grants_updated_at ON platform_plan_grants;

CREATE TRIGGER platform_plan_grants_updated_at
  BEFORE UPDATE ON platform_plan_grants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_platform_plan_grants_updated_at();

ALTER TABLE platform_plan_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_plan_grant_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY platform_plan_grants_select_admin_or_self
  ON platform_plan_grants
  FOR SELECT
  TO authenticated
  USING (
    public.is_platform_admin()
    OR user_id = auth.uid()
  );

CREATE POLICY platform_plan_grants_insert_admin
  ON platform_plan_grants
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_platform_admin());

CREATE POLICY platform_plan_grants_update_admin
  ON platform_plan_grants
  FOR UPDATE
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

CREATE POLICY platform_plan_grant_events_select_admin_or_self
  ON platform_plan_grant_events
  FOR SELECT
  TO authenticated
  USING (
    public.is_platform_admin()
    OR user_id = auth.uid()
  );

CREATE POLICY platform_plan_grant_events_insert_admin
  ON platform_plan_grant_events
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_platform_admin());

REVOKE ALL ON TABLE platform_plan_grants FROM anon;
REVOKE ALL ON TABLE platform_plan_grant_events FROM anon;
