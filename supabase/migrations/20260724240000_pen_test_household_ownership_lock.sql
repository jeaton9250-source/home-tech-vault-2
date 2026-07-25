-- =============================================================================
-- PASTE INTO: Supabase Dashboard → SQL Editor → New query → Run
-- =============================================================================
-- Pen-test follow-up (safe to re-run):
--   1) Freeze households.owner_id for non–service-role updates
--   2) Block client INSERT of role = 'owner' for other users
--   3) Tighten device_events DELETE (owner or household admin only)
--   4) Require real device for storage uploads (no orphan paths)
--   5) Atomic pair-confirm rate-limit claim RPC
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1) Freeze households.owner_id
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_household_owner_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
    AND NEW.owner_id IS DISTINCT FROM OLD.owner_id
    AND current_setting('role', true) IS DISTINCT FROM 'service_role' THEN
    NEW.owner_id := OLD.owner_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS households_protect_owner_id ON public.households;
CREATE TRIGGER households_protect_owner_id
  BEFORE UPDATE ON public.households
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_household_owner_id();

-- ---------------------------------------------------------------------------
-- 2) household_members INSERT — never grant owner to someone else via client
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS household_members_insert_admin
  ON public.household_members;

CREATE POLICY household_members_insert_admin
  ON public.household_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      -- Admins may invite/add non-self members only as admin/member/viewer
      public.can_household_admin(household_id)
      AND user_id <> auth.uid()
      AND lower(role::text) IN ('admin', 'member', 'viewer')
    )
    OR (
      -- Billing owner may add their own owner membership row
      user_id = auth.uid()
      AND lower(role::text) = 'owner'
      AND EXISTS (
        SELECT 1
        FROM public.households h
        WHERE h.id = household_id
          AND h.owner_id = auth.uid()
      )
    )
  );

-- ---------------------------------------------------------------------------
-- 3) device_events DELETE — own events or household admin for that device
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.can_admin_device(p_device_id uuid)
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
      AND (
        (
          d.household_id IS NULL
          AND d.user_id = auth.uid()
        )
        OR (
          d.household_id IS NOT NULL
          AND public.can_household_admin(d.household_id)
        )
      )
  );
$$;

DROP POLICY IF EXISTS device_events_delete ON public.device_events;

CREATE POLICY device_events_delete
  ON public.device_events
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.can_admin_device(device_id)
  );

-- ---------------------------------------------------------------------------
-- 4) Storage upload — device path segment must resolve to a mutable device
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.can_upload_device_image(storage_path text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    split_part(storage_path, '/', 1) = auth.uid()::text
    AND EXISTS (
      SELECT 1
      FROM public.devices d
      WHERE d.id::text = split_part(storage_path, '/', 2)
        AND (
          (
            d.household_id IS NULL
            AND d.user_id = auth.uid()
          )
          OR (
            d.household_id IS NOT NULL
            AND public.can_household_mutate(d.household_id)
          )
        )
    );
$$;

-- ---------------------------------------------------------------------------
-- 5) Atomic pair-confirm rate limit (optional RPC for app)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.connector_pair_confirm_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_key_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS connector_pair_confirm_attempts_key_created_idx
  ON public.connector_pair_confirm_attempts (client_key_hash, created_at DESC);

ALTER TABLE public.connector_pair_confirm_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.connector_pair_confirm_attempts FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.claim_pair_confirm_attempt(
  p_client_key_hash text,
  p_window_seconds integer DEFAULT 900,
  p_max_attempts integer DEFAULT 20
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  attempt_count integer;
BEGIN
  IF p_client_key_hash IS NULL OR length(p_client_key_hash) < 16 THEN
    RETURN false;
  END IF;

  -- Serialize attempts per client hash inside this transaction.
  PERFORM pg_advisory_xact_lock(
    hashtext('pair_confirm:' || p_client_key_hash)
  );

  SELECT count(*)::integer
  INTO attempt_count
  FROM public.connector_pair_confirm_attempts
  WHERE client_key_hash = p_client_key_hash
    AND created_at >= (now() - make_interval(secs => p_window_seconds));

  IF attempt_count >= p_max_attempts THEN
    RETURN false;
  END IF;

  INSERT INTO public.connector_pair_confirm_attempts (client_key_hash)
  VALUES (p_client_key_hash);

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_pair_confirm_attempt(text, integer, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_pair_confirm_attempt(text, integer, integer)
  TO service_role;

-- ---------------------------------------------------------------------------
-- Verify
-- ---------------------------------------------------------------------------
SELECT tgname
FROM pg_trigger
WHERE tgrelid = 'public.households'::regclass
  AND tgname = 'households_protect_owner_id';

SELECT policyname, cmd
FROM pg_policies
WHERE tablename IN ('household_members', 'device_events')
ORDER BY tablename, policyname;
