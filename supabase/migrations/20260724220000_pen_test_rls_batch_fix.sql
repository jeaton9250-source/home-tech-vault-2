-- =============================================================================
-- PASTE INTO: Supabase Dashboard → SQL Editor → New query → Run
-- =============================================================================
-- Pen-test batch fix (safe to re-run):
--   1) user_subscriptions — SELECT own only; no client writes
--   2) device_events — device-scoped RLS
--   3) network_scans / network_discoveries — owner + household RLS
--   4) contact_messages — own-only (if table exists)
--   5) profiles — block is_admin on INSERT (not just UPDATE)
--   6) household_invitations SELECT — admins + invitee email only
--      (stops viewers dumping invite tokens)
--
-- NOT fixable by SQL alone (need a small code deploy after this):
--   - connector pair/confirm race (app must check consume rowcount)
--   - in-memory pair rate limit
--   - Edge Function CORS *
--   - CSP unsafe-inline / unsafe-eval
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public._drop_all_policies(p_schema text, p_table text)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  r record;
BEGIN
  IF to_regclass(format('%I.%I', p_schema, p_table)) IS NULL THEN
    RETURN;
  END IF;

  FOR r IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = p_schema
      AND tablename = p_table
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      r.policyname,
      p_schema,
      p_table
    );
  END LOOP;
END;
$$;

-- True when auth.uid() can access the device row (personal or household).
CREATE OR REPLACE FUNCTION public.can_access_device(p_device_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.devices d
    WHERE d.id = p_device_id
      AND public.can_access_scoped_row(d.household_id, d.user_id)
  );
$$;

-- True when auth.uid() may mutate the device.
CREATE OR REPLACE FUNCTION public.can_mutate_device(p_device_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.devices d
    WHERE d.id = p_device_id
      AND public.can_mutate_scoped_row(d.household_id, d.user_id)
  );
$$;

-- Owner-scoped tables (network_scans, etc.): own rows OR household owner rows.
CREATE OR REPLACE FUNCTION public.can_access_owner_scoped_row(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p_user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.households h
      WHERE h.owner_id = p_user_id
        AND public.is_household_member(h.id)
    );
$$;

CREATE OR REPLACE FUNCTION public.can_mutate_owner_scoped_row(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p_user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.households h
      WHERE h.owner_id = p_user_id
        AND public.can_household_mutate(h.id)
    );
$$;

CREATE OR REPLACE FUNCTION public.can_admin_owner_scoped_row(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p_user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.households h
      WHERE h.owner_id = p_user_id
        AND public.can_household_admin(h.id)
    );
$$;

-- =============================================================================
-- 1) user_subscriptions — billing table (Critical)
-- Client may SELECT own row only. All writes stay service-role (Stripe/admin).
-- =============================================================================
DO $$
BEGIN
  IF to_regclass('public.user_subscriptions') IS NULL THEN
    RAISE NOTICE 'Skipping user_subscriptions (missing)';
    RETURN;
  END IF;

  ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
  PERFORM public._drop_all_policies('public', 'user_subscriptions');

  CREATE POLICY user_subscriptions_select_own
    ON public.user_subscriptions
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

  -- Explicitly no INSERT/UPDATE/DELETE policies for authenticated.
  REVOKE ALL ON TABLE public.user_subscriptions FROM anon;
  REVOKE INSERT, UPDATE, DELETE ON TABLE public.user_subscriptions FROM authenticated;
  GRANT SELECT ON TABLE public.user_subscriptions TO authenticated;
END $$;

-- =============================================================================
-- 2) device_events — timeline (Critical)
-- =============================================================================
DO $$
BEGIN
  IF to_regclass('public.device_events') IS NULL THEN
    RAISE NOTICE 'Skipping device_events (missing)';
    RETURN;
  END IF;

  ALTER TABLE public.device_events ENABLE ROW LEVEL SECURITY;
  PERFORM public._drop_all_policies('public', 'device_events');

  CREATE POLICY device_events_select
    ON public.device_events
    FOR SELECT
    TO authenticated
    USING (public.can_access_device(device_id));

  CREATE POLICY device_events_insert
    ON public.device_events
    FOR INSERT
    TO authenticated
    WITH CHECK (
      user_id = auth.uid()
      AND public.can_mutate_device(device_id)
    );

  CREATE POLICY device_events_update
    ON public.device_events
    FOR UPDATE
    TO authenticated
    USING (
      user_id = auth.uid()
      AND public.can_mutate_device(device_id)
    )
    WITH CHECK (
      user_id = auth.uid()
      AND public.can_mutate_device(device_id)
    );

  CREATE POLICY device_events_delete
    ON public.device_events
    FOR DELETE
    TO authenticated
    USING (
      user_id = auth.uid()
      OR public.can_access_device(device_id)
    );

  REVOKE ALL ON TABLE public.device_events FROM anon;
END $$;

-- =============================================================================
-- 3) network_scans / network_discoveries (Critical)
-- =============================================================================
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['network_scans', 'network_discoveries']
  LOOP
    IF to_regclass(format('public.%I', tbl)) IS NULL THEN
      RAISE NOTICE 'Skipping missing table public.%', tbl;
      CONTINUE;
    END IF;

    EXECUTE format(
      'ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',
      tbl
    );
    PERFORM public._drop_all_policies('public', tbl);

    EXECUTE format(
      'CREATE POLICY %I_select ON public.%I FOR SELECT TO authenticated USING (public.can_access_owner_scoped_row(user_id))',
      tbl,
      tbl
    );
    EXECUTE format(
      'CREATE POLICY %I_insert ON public.%I FOR INSERT TO authenticated WITH CHECK (public.can_mutate_owner_scoped_row(user_id))',
      tbl,
      tbl
    );
    EXECUTE format(
      'CREATE POLICY %I_update ON public.%I FOR UPDATE TO authenticated USING (public.can_mutate_owner_scoped_row(user_id)) WITH CHECK (public.can_mutate_owner_scoped_row(user_id))',
      tbl,
      tbl
    );
    EXECUTE format(
      'CREATE POLICY %I_delete ON public.%I FOR DELETE TO authenticated USING (public.can_admin_owner_scoped_row(user_id))',
      tbl,
      tbl
    );
    EXECUTE format(
      'REVOKE ALL ON TABLE public.%I FROM anon',
      tbl
    );
  END LOOP;
END $$;

-- =============================================================================
-- 4) contact_messages (if present)
-- =============================================================================
DO $$
BEGIN
  IF to_regclass('public.contact_messages') IS NULL THEN
    RAISE NOTICE 'Skipping contact_messages (missing)';
    RETURN;
  END IF;

  ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
  PERFORM public._drop_all_policies('public', 'contact_messages');

  CREATE POLICY contact_messages_select_own
    ON public.contact_messages
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

  CREATE POLICY contact_messages_insert_own
    ON public.contact_messages
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

  REVOKE ALL ON TABLE public.contact_messages FROM anon;
END $$;

-- =============================================================================
-- 5) profiles — block privileged columns on INSERT (High)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.protect_profile_privileged_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF coalesce(public.is_platform_admin(), false) THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    -- Never allow clients to self-grant platform admin on first insert.
    NEW.is_admin := false;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    NEW.is_admin := OLD.is_admin;
    NEW.account_status := OLD.account_status;
    NEW.deactivated_at := OLD.deactivated_at;
    NEW.deactivated_by := OLD.deactivated_by;
    NEW.deactivation_reason := OLD.deactivation_reason;
    NEW.deactivation_notes := OLD.deactivation_notes;
    NEW.reactivated_at := OLD.reactivated_at;
    NEW.reactivated_by := OLD.reactivated_by;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_protect_privileged_columns ON public.profiles;
CREATE TRIGGER profiles_protect_privileged_columns
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_privileged_columns();

-- =============================================================================
-- 6) household_invitations SELECT — stop member/viewer token dumps (Medium)
-- Admins manage invites; invitees may read their own email match (accept flow).
-- =============================================================================
DO $$
BEGIN
  IF to_regclass('public.household_invitations') IS NULL THEN
    RETURN;
  END IF;

  DROP POLICY IF EXISTS household_invitations_select
    ON public.household_invitations;

  CREATE POLICY household_invitations_select
    ON public.household_invitations
    FOR SELECT
    TO authenticated
    USING (
      (
        household_id IS NOT NULL
        AND public.can_household_admin(household_id)
      )
      OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    );
END $$;

-- =============================================================================
-- Verify
-- =============================================================================
SELECT relname AS table_name, relrowsecurity AS rls_enabled
FROM pg_class
WHERE relname IN (
  'user_subscriptions',
  'device_events',
  'network_scans',
  'network_discoveries',
  'contact_messages',
  'profiles',
  'devices',
  'documents',
  'household_invitations'
)
ORDER BY relname;

-- Cleanup helper
DROP FUNCTION IF EXISTS public._drop_all_policies(text, text);
