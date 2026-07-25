-- Production security hardening (invitation privilege escalation, profiles, confirmations)
-- Review before applying. Non-destructive.

-- =========================================================
-- 1. CRITICAL: Invitees must not UPDATE invitation rows
-- Accept only via SECURITY DEFINER RPCs / admin policies.
-- =========================================================
DROP POLICY IF EXISTS household_invitations_update_admin
  ON public.household_invitations;

CREATE POLICY household_invitations_update_admin
  ON public.household_invitations
  FOR UPDATE
  TO authenticated
  USING (
    invitation_type = 'join_household'
    AND household_id IS NOT NULL
    AND public.can_household_admin(household_id)
  )
  WITH CHECK (
    invitation_type = 'join_household'
    AND household_id IS NOT NULL
    AND public.can_household_admin(household_id)
  );

-- =========================================================
-- 2. HIGH: Protect privileged profile columns from client escalation
-- =========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own_or_admin ON public.profiles;
CREATE POLICY profiles_select_own_or_admin
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR public.is_platform_admin()
  );

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE OR REPLACE FUNCTION public.protect_profile_privileged_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
    AND NOT coalesce(public.is_platform_admin(), false) THEN
    -- Never allow clients to self-grant platform admin.
    NEW.is_admin := OLD.is_admin;

    -- Preserve account lifecycle fields when present.
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

DROP TRIGGER IF EXISTS profiles_protect_privileged_columns
  ON public.profiles;
CREATE TRIGGER profiles_protect_privileged_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_privileged_columns();

REVOKE ALL ON TABLE public.profiles FROM anon;

-- =========================================================
-- 3. Prevent client mutation of connector token_hash
-- =========================================================
CREATE OR REPLACE FUNCTION public.protect_connector_installation_secrets()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
    AND current_setting('role', true) IS DISTINCT FROM 'service_role' THEN
    NEW.token_hash := OLD.token_hash;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS connector_installations_protect_secrets
  ON public.connector_installations;
CREATE TRIGGER connector_installations_protect_secrets
  BEFORE UPDATE ON public.connector_installations
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_connector_installation_secrets();

-- =========================================================
-- 4. Device identity confirmations (create if missing, then harden RLS)
-- Table may not exist yet if Device Intelligence Phase 3A was not applied.
-- =========================================================
CREATE TABLE IF NOT EXISTS public.device_identity_confirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  device_id uuid NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  discovered_device_id uuid REFERENCES public.discovered_devices(id) ON DELETE SET NULL,
  stable_fingerprint_hash text,
  normalized_mac text,
  ssdp_usn_hash text,
  mdns_identity_hash text,
  confirmed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  confirmed_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS device_identity_confirmations_household_idx
  ON public.device_identity_confirmations (household_id)
  WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS device_identity_confirmations_fingerprint_idx
  ON public.device_identity_confirmations (household_id, stable_fingerprint_hash)
  WHERE revoked_at IS NULL AND stable_fingerprint_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS device_identity_confirmations_mac_idx
  ON public.device_identity_confirmations (household_id, normalized_mac)
  WHERE revoked_at IS NULL AND normalized_mac IS NOT NULL;

ALTER TABLE public.device_identity_confirmations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS device_identity_confirmations_select_household
  ON public.device_identity_confirmations;
DROP POLICY IF EXISTS device_identity_confirmations_insert_household
  ON public.device_identity_confirmations;
DROP POLICY IF EXISTS device_identity_confirmations_update_household
  ON public.device_identity_confirmations;

CREATE POLICY device_identity_confirmations_select_household
  ON public.device_identity_confirmations
  FOR SELECT
  TO authenticated
  USING (public.can_household_read(household_id));

CREATE POLICY device_identity_confirmations_insert_household
  ON public.device_identity_confirmations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.can_household_admin(household_id)
    AND EXISTS (
      SELECT 1
      FROM public.devices d
      WHERE d.id = device_id
        AND d.household_id = household_id
    )
  );

CREATE POLICY device_identity_confirmations_update_household
  ON public.device_identity_confirmations
  FOR UPDATE
  TO authenticated
  USING (public.can_household_admin(household_id))
  WITH CHECK (public.can_household_admin(household_id));

-- =========================================================
-- 5. Lock support ticket counters to service role
-- =========================================================
ALTER TABLE IF EXISTS public.support_ticket_counters
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.support_ticket_counters
  FROM anon, authenticated;
