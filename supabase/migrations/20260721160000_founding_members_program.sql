-- Home Tech Vault Founding Members Program (first 50 users)

-- Extend platform admin audit event types
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

-- Extend email delivery event types
ALTER TABLE public.platform_email_deliveries
  DROP CONSTRAINT IF EXISTS platform_email_deliveries_event_type_check;

ALTER TABLE public.platform_email_deliveries
  ADD CONSTRAINT platform_email_deliveries_event_type_check
  CHECK (
    event_type IN (
      'grant_created',
      'grant_replaced',
      'grant_revoked',
      'grant_expiring_soon',
      'grant_expired',
      'founding_member_enrolled'
    )
  );

CREATE TABLE IF NOT EXISTS public.platform_program_settings (
  program_key TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT true,
  capacity INTEGER NOT NULL DEFAULT 50
    CHECK (capacity > 0 AND capacity <= 50),
  default_plan TEXT NOT NULL DEFAULT 'pro'
    CHECK (default_plan IN ('pro', 'family')),
  default_duration TEXT NOT NULL DEFAULT 'none',
  public_message TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

INSERT INTO public.platform_program_settings (
  program_key,
  enabled,
  capacity,
  default_plan,
  default_duration,
  public_message
)
VALUES (
  'founding_members',
  true,
  50,
  'pro',
  'none',
  'Become one of the first 50 Home Tech Vault Founding Members and receive complimentary Pro access while helping shape the future of the platform.'
)
ON CONFLICT (program_key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.platform_founding_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_grant_id UUID REFERENCES public.platform_plan_grants(id) ON DELETE SET NULL,
  member_number INTEGER NOT NULL UNIQUE
    CHECK (member_number >= 1 AND member_number <= 50),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'removed')),
  benefit_mode TEXT NOT NULL DEFAULT 'linked_grant'
    CHECK (
      benefit_mode IN (
        'linked_grant',
        'existing_grant',
        'paid_access',
        'inherited_family',
        'higher_grant'
      )
    ),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  enrolled_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  removed_at TIMESTAMPTZ,
  removed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  removal_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platform_founding_members_status
  ON public.platform_founding_members(status);

CREATE INDEX IF NOT EXISTS idx_platform_founding_members_enrolled_at
  ON public.platform_founding_members(enrolled_at DESC);

CREATE INDEX IF NOT EXISTS idx_platform_founding_members_member_number
  ON public.platform_founding_members(member_number);

CREATE OR REPLACE FUNCTION public.update_platform_founding_members_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS platform_founding_members_updated_at
  ON public.platform_founding_members;

CREATE TRIGGER platform_founding_members_updated_at
  BEFORE UPDATE ON public.platform_founding_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_platform_founding_members_updated_at();

CREATE OR REPLACE FUNCTION public.update_platform_program_settings_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS platform_program_settings_updated_at
  ON public.platform_program_settings;

CREATE TRIGGER platform_program_settings_updated_at
  BEFORE UPDATE ON public.platform_program_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_platform_program_settings_updated_at();

-- Concurrency-safe member number assignment and enrollment reservation.
CREATE OR REPLACE FUNCTION public.reserve_founding_member_slot(
  p_user_id UUID,
  p_enrolled_by UUID,
  p_benefit_mode TEXT DEFAULT 'linked_grant',
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  member_number INTEGER,
  capacity INTEGER,
  enrolled_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_settings RECORD;
  v_next_number INTEGER;
  v_enrolled_count INTEGER;
  v_existing UUID;
  v_new_id UUID;
BEGIN
  PERFORM pg_advisory_xact_lock(
    hashtext('founding_members_enroll')
  );

  SELECT *
  INTO v_settings
  FROM public.platform_program_settings
  WHERE program_key = 'founding_members'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'FOUNDING_PROGRAM_NOT_CONFIGURED';
  END IF;

  IF v_settings.enabled IS NOT TRUE THEN
    RAISE EXCEPTION 'FOUNDING_PROGRAM_PAUSED';
  END IF;

  SELECT pf.id
  INTO v_existing
  FROM public.platform_founding_members pf
  WHERE pf.user_id = p_user_id;

  IF v_existing IS NOT NULL THEN
    RAISE EXCEPTION 'FOUNDING_MEMBER_ALREADY_ENROLLED';
  END IF;

  SELECT COUNT(*)
  INTO v_enrolled_count
  FROM public.platform_founding_members;

  IF v_enrolled_count >= v_settings.capacity THEN
    RAISE EXCEPTION 'FOUNDING_PROGRAM_FULL';
  END IF;

  SELECT MIN(series.n)
  INTO v_next_number
  FROM generate_series(1, v_settings.capacity) AS series(n)
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.platform_founding_members pf
    WHERE pf.member_number = series.n
  );

  IF v_next_number IS NULL THEN
    RAISE EXCEPTION 'FOUNDING_PROGRAM_FULL';
  END IF;

  INSERT INTO public.platform_founding_members (
    user_id,
    member_number,
    status,
    benefit_mode,
    enrolled_by,
    notes
  )
  VALUES (
    p_user_id,
    v_next_number,
    'active',
    p_benefit_mode,
    p_enrolled_by,
    p_notes
  )
  RETURNING platform_founding_members.id
  INTO v_new_id;

  RETURN QUERY
  SELECT
    v_new_id,
    v_next_number,
    v_settings.capacity,
    v_enrolled_count + 1;
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_founding_member_slot(UUID, UUID, TEXT, TEXT)
  FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.reserve_founding_member_slot(UUID, UUID, TEXT, TEXT)
  TO service_role;

ALTER TABLE public.platform_program_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_founding_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS platform_program_settings_admin
  ON public.platform_program_settings;

CREATE POLICY platform_program_settings_admin
  ON public.platform_program_settings
  FOR ALL
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS platform_founding_members_admin
  ON public.platform_founding_members;

CREATE POLICY platform_founding_members_admin
  ON public.platform_founding_members
  FOR ALL
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS platform_founding_members_self_read
  ON public.platform_founding_members;

CREATE POLICY platform_founding_members_self_read
  ON public.platform_founding_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

COMMENT ON TABLE public.platform_founding_members IS
  'Founding Members program enrollment (max 50, member numbers never reused).';

COMMENT ON TABLE public.platform_program_settings IS
  'Platform program configuration keyed by program_key.';
