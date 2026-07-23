-- Home Tech Vault Connector Phase 2B.1 — review queries (do not execute automatically)
--
-- Run manually after applying 20260722230000_connector_discovery_matching.sql

-- ===========================================================================
-- 1. New device columns
-- ===========================================================================

SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'devices'
  AND column_name IN (
    'hostname',
    'network_fingerprint',
    'first_seen_at',
    'connector_id'
  )
ORDER BY column_name;

-- ===========================================================================
-- 2. New discovered_devices columns
-- ===========================================================================

SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'discovered_devices'
  AND column_name IN (
    'model',
    'serial_number',
    'match_confirmed_at',
    'match_confirmed_by'
  )
ORDER BY column_name;

-- ===========================================================================
-- 3. Index validation
-- ===========================================================================

SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('devices', 'discovered_devices')
  AND indexname IN (
    'devices_household_mac_address_idx',
    'devices_household_network_fingerprint_idx',
    'discovered_devices_household_mac_address_idx',
    'discovered_devices_imported_device_id_idx'
  )
ORDER BY indexname;

-- ===========================================================================
-- 4. RLS policy: discovered_devices mutator update
-- ===========================================================================

SELECT
  pol.polname AS policy_name,
  pol.polcmd AS command,
  pg_get_expr(pol.polqual, pol.polrelid) AS using_expression,
  pg_get_expr(pol.polwithcheck, pol.polrelid) AS with_check_expression
FROM pg_policy pol
JOIN pg_class cls ON cls.oid = pol.polrelid
JOIN pg_namespace nsp ON nsp.oid = cls.relnamespace
WHERE nsp.nspname = 'public'
  AND cls.relname = 'discovered_devices'
  AND pol.polname = 'discovered_devices_update_mutator';

-- ===========================================================================
-- 5. Rollback helpers (manual only)
-- ===========================================================================

-- DROP POLICY IF EXISTS discovered_devices_update_mutator ON public.discovered_devices;
-- CREATE POLICY discovered_devices_update_admin
--   ON public.discovered_devices
--   FOR UPDATE
--   TO authenticated
--   USING (public.can_household_admin(household_id))
--   WITH CHECK (public.can_household_admin(household_id));
--
-- ALTER TABLE public.discovered_devices
--   DROP COLUMN IF EXISTS match_confirmed_by,
--   DROP COLUMN IF EXISTS match_confirmed_at,
--   DROP COLUMN IF EXISTS serial_number,
--   DROP COLUMN IF EXISTS model;
--
-- ALTER TABLE public.devices
--   DROP COLUMN IF EXISTS connector_id,
--   DROP COLUMN IF EXISTS first_seen_at,
--   DROP COLUMN IF EXISTS network_fingerprint,
--   DROP COLUMN IF EXISTS hostname;
