-- Household permission helper functions (review only — do not apply automatically)
--
-- Prerequisite for Connector Phase 1 RLS and other household-scoped policies.
-- Creates shared SQL helpers only — does NOT enable RLS or modify table policies.
--
-- Role tiers (normalized):
--   admin  → owner, admin (including households.owner_id without a membership row)
--   member → member
--   viewer → viewer
--
-- Platform admin (`profiles.is_admin`) is intentionally NOT used here.
--
-- Production-safe: do NOT DROP helpers — existing devices/documents RLS policies
-- depend on them. Parameter names match the legacy deployment (requested_household_id).

-- ---------------------------------------------------------------------------
-- normalize_household_role
-- Maps stored membership roles to mutation-capability tiers.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.normalize_household_role(role text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN lower(trim(role)) IN (
      'owner',
      'household_owner',
      'admin',
      'household_admin'
    ) THEN 'admin'
    WHEN lower(trim(role)) = 'member' THEN 'member'
    WHEN lower(trim(role)) = 'viewer' THEN 'viewer'
    ELSE NULL
  END;
$$;

COMMENT ON FUNCTION public.normalize_household_role(text) IS
  'Maps household_members.role values to tiers: admin (owner/admin), member, viewer.';

-- Wrapper for schemas where household_members.role uses the household_role enum.
CREATE OR REPLACE FUNCTION public.normalize_household_role(role public.household_role)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT public.normalize_household_role(role::text);
$$;

COMMENT ON FUNCTION public.normalize_household_role(public.household_role) IS
  'Enum overload; delegates to normalize_household_role(text).';

-- ---------------------------------------------------------------------------
-- is_household_member
-- True when auth.uid() belongs to the household via membership or ownership.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_household_member(requested_household_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    EXISTS (
      SELECT 1
      FROM public.household_members hm
      WHERE hm.household_id = requested_household_id
        AND hm.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.households h
      WHERE h.id = requested_household_id
        AND h.owner_id = auth.uid()
    );
$$;

COMMENT ON FUNCTION public.is_household_member(uuid) IS
  'True if the current user is in household_members or is households.owner_id.';

-- ---------------------------------------------------------------------------
-- current_household_role
-- Returns normalized tier for the current user in a household, or NULL.
-- Billing owners without a membership row resolve to admin tier.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.current_household_role(requested_household_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT public.normalize_household_role(hm.role::text)
      FROM public.household_members hm
      WHERE hm.household_id = requested_household_id
        AND hm.user_id = auth.uid()
      ORDER BY hm.joined_at DESC NULLS LAST
      LIMIT 1
    ),
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM public.households h
        WHERE h.id = requested_household_id
          AND h.owner_id = auth.uid()
      ) THEN 'admin'
      ELSE NULL
    END
  );
$$;

COMMENT ON FUNCTION public.current_household_role(uuid) IS
  'Normalized role tier for auth.uid() in a household; owner_id-only owners resolve to admin.';

-- ---------------------------------------------------------------------------
-- can_household_read
-- All household members (owner, admin, member, viewer) may read.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.can_household_read(requested_household_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT public.is_household_member(requested_household_id);
$$;

COMMENT ON FUNCTION public.can_household_read(uuid) IS
  'True for owner, admin, member, viewer, and billing owners; false for non-members.';

-- ---------------------------------------------------------------------------
-- can_household_mutate
-- Owner, admin, and member may mutate; viewer and non-members may not.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.can_household_mutate(requested_household_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT public.current_household_role(requested_household_id) IN ('member', 'admin');
$$;

COMMENT ON FUNCTION public.can_household_mutate(uuid) IS
  'True for owner/admin/member tiers; false for viewer and non-members.';

-- ---------------------------------------------------------------------------
-- can_household_admin
-- Owner and admin may perform household administration; not platform admin.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.can_household_admin(requested_household_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT public.current_household_role(requested_household_id) = 'admin';
$$;

COMMENT ON FUNCTION public.can_household_admin(uuid) IS
  'True for owner and admin tiers only; false for member, viewer, and non-members.';
