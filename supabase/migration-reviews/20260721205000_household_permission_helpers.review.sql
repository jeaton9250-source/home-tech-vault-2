-- Household permission helpers — review queries (do not execute automatically)
--
-- Run manually before and after applying:
--   supabase/migrations/20260721205000_household_permission_helpers.sql

-- ===========================================================================
-- 1. Pre-checks for required tables and columns
-- ===========================================================================

SELECT
  to_regclass('public.households') AS households,
  to_regclass('public.household_members') AS household_members;

SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
    (table_name = 'households' AND column_name IN ('id', 'owner_id'))
    OR (
      table_name = 'household_members'
      AND column_name IN (
        'id',
        'household_id',
        'user_id',
        'role',
        'joined_at'
      )
    )
  )
ORDER BY table_name, ordinal_position;

-- Expect households.id, households.owner_id, household_members core columns.

-- Optional: flag households whose owner lacks a membership row.
SELECT
  h.id AS household_id,
  h.owner_id,
  hm.user_id AS member_user_id,
  hm.role AS member_role
FROM public.households h
LEFT JOIN public.household_members hm
  ON hm.household_id = h.id
  AND hm.user_id = h.owner_id
WHERE hm.id IS NULL
ORDER BY h.created_at DESC NULLS LAST
LIMIT 50;

-- If functions already exist, inspect parameter names before applying helpers.
-- Do NOT DROP helpers when devices/documents policies depend on them.

SELECT
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS arguments,
  pg_get_function_arguments(p.oid) AS parameters
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
    'normalize_household_role',
    'is_household_member',
    'current_household_role',
    'can_household_read',
    'can_household_mutate',
    'can_household_admin'
  )
ORDER BY p.proname;

-- If DROP FUNCTION fails with "other objects depend on it", do NOT use CASCADE.
-- Apply 20260721205000_household_permission_helpers.sql as-is; it uses $1
-- positional arguments so CREATE OR REPLACE works with legacy parameter names.

-- ===========================================================================
-- 2. Function existence checks (pre-apply — expect NULL)
-- ===========================================================================

SELECT
  to_regprocedure('public.normalize_household_role(text)') AS normalize_household_role,
  to_regprocedure('public.is_household_member(uuid)') AS is_household_member,
  to_regprocedure('public.current_household_role(uuid)') AS current_household_role,
  to_regprocedure('public.can_household_read(uuid)') AS can_household_read,
  to_regprocedure('public.can_household_mutate(uuid)') AS can_household_mutate,
  to_regprocedure('public.can_household_admin(uuid)') AS can_household_admin;

-- ===========================================================================
-- 3. Role matrix tests (post-apply, run as authenticated test users)
-- ===========================================================================
--
-- Replace placeholders before running:
--   :household_id  → target household UUID
--   :owner_id       → households.owner_id
--   :admin_id       → member with role admin
--   :member_id      → member with role member
--   :viewer_id      → member with role viewer
--   :outsider_id    → non-member user
--
-- Example using jwt.claims simulation is not available in plain SQL;
-- run these from the Supabase SQL editor while impersonating each user,
-- or from integration tests that set auth.uid() via request.jwt.claim.sub.

-- Expected matrix:
-- | Role     | can_household_read | can_household_mutate | can_household_admin |
-- |----------|--------------------|----------------------|---------------------|
-- | owner    | true               | true                 | true                |
-- | admin    | true               | true                 | true                |
-- | member   | true               | true                 | false               |
-- | viewer   | true               | false                | false               |
-- | outsider | false              | false                | false               |

-- ===========================================================================
-- 4. Queries for owner/admin/member/viewer behavior (post-apply)
-- ===========================================================================

-- Inspect stored roles vs normalized tiers for one household.
SELECT
  hm.user_id,
  hm.role AS stored_role,
  public.normalize_household_role(hm.role) AS normalized_tier
FROM public.household_members hm
WHERE hm.household_id = :household_id
ORDER BY hm.joined_at;

-- Owner-only path (no membership row): should still resolve admin tier
-- when executed as households.owner_id via RLS-safe helper calls in app/tests.

-- ===========================================================================
-- 5. Post-apply verification
-- ===========================================================================

SELECT
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS arguments,
  p.prosecdef AS security_definer,
  p.provolatile AS volatility,
  d.description
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
LEFT JOIN pg_description d
  ON d.objoid = p.oid
  AND d.classoid = 'pg_proc'::regclass
WHERE n.nspname = 'public'
  AND p.proname IN (
    'normalize_household_role',
    'is_household_member',
    'current_household_role',
    'can_household_read',
    'can_household_mutate',
    'can_household_admin'
  )
ORDER BY p.proname;

-- normalize_household_role: security_definer = false, volatility = i (immutable)
-- is_household_member, current_household_role: security_definer = true
-- can_household_*: security_definer = false, volatility = s (stable)

-- Expect enum type on household_members.role in production.
SELECT
  t.typname AS enum_name,
  e.enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum e ON e.enumtypid = t.oid
JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
  AND t.typname = 'household_role'
ORDER BY e.enumsortorder;

-- Expect both overloads after apply:
SELECT
  to_regprocedure('public.normalize_household_role(text)') AS normalize_text,
  to_regprocedure('public.normalize_household_role(public.household_role)') AS normalize_enum;

-- Unit-style checks for normalize_household_role (no auth context required).
SELECT
  public.normalize_household_role('owner') AS owner_tier,
  public.normalize_household_role('admin') AS admin_tier,
  public.normalize_household_role('household_admin') AS household_admin_tier,
  public.normalize_household_role('member') AS member_tier,
  public.normalize_household_role('viewer') AS viewer_tier,
  public.normalize_household_role('unknown') AS unknown_tier;

-- Expect: admin, admin, admin, member, viewer, NULL

-- ===========================================================================
-- 6. Rollback SQL
-- ===========================================================================

-- DROP FUNCTION IF EXISTS public.can_household_admin(uuid);
-- DROP FUNCTION IF EXISTS public.can_household_mutate(uuid);
-- DROP FUNCTION IF EXISTS public.can_household_read(uuid);
-- DROP FUNCTION IF EXISTS public.current_household_role(uuid);
-- DROP FUNCTION IF EXISTS public.is_household_member(uuid);
-- DROP FUNCTION IF EXISTS public.normalize_household_role(public.household_role);
-- DROP FUNCTION IF EXISTS public.normalize_household_role(text);

-- ===========================================================================
-- 7. Connector prerequisite verification
-- ===========================================================================

SELECT
  to_regprocedure('public.can_household_read(uuid)') AS can_household_read,
  to_regprocedure('public.can_household_admin(uuid)') AS can_household_admin;

-- Expect non-NULL oids after prerequisite migration is applied.
