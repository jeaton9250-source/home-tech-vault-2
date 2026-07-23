-- Home Tech Vault Connector Phase 1 — review queries (do not execute automatically)
--
-- Run manually after applying 20260721210000_connector_foundation.sql

-- ===========================================================================
-- 1. Pre-migration table-existence checks
-- ===========================================================================

SELECT
  to_regclass('public.connector_installations') AS connector_installations,
  to_regclass('public.connector_pairing_sessions') AS connector_pairing_sessions,
  to_regclass('public.discovered_devices') AS discovered_devices,
  to_regclass('public.device_monitor_events') AS device_monitor_events;

-- Expect all NULL before migration.

-- ===========================================================================
-- 2. Post-migration table checks
-- ===========================================================================

SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'connector_installations',
    'connector_pairing_sessions',
    'discovered_devices',
    'device_monitor_events'
  )
ORDER BY table_name, ordinal_position;

-- ===========================================================================
-- 3. Foreign-key validation
-- ===========================================================================

SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table,
  ccu.column_name AS foreign_column,
  rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.referential_constraints rc
  ON tc.constraint_name = rc.constraint_name
  AND tc.table_schema = rc.constraint_schema
JOIN information_schema.constraint_column_usage ccu
  ON rc.unique_constraint_name = ccu.constraint_name
  AND rc.unique_constraint_schema = ccu.constraint_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN (
    'connector_installations',
    'connector_pairing_sessions',
    'discovered_devices',
    'device_monitor_events'
  )
ORDER BY tc.table_name, kcu.column_name;

-- ===========================================================================
-- 4. Index validation
-- ===========================================================================

SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'connector_installations',
    'connector_pairing_sessions',
    'discovered_devices',
    'device_monitor_events'
  )
ORDER BY tablename, indexname;

-- ===========================================================================
-- 5. RLS enabled checks
-- ===========================================================================

SELECT
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN (
    'connector_installations',
    'connector_pairing_sessions',
    'discovered_devices',
    'device_monitor_events'
  )
ORDER BY c.relname;

-- Expect rls_enabled = true for all four tables.

-- ===========================================================================
-- 6. Policy listing
-- ===========================================================================

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'connector_installations',
    'connector_pairing_sessions',
    'discovered_devices',
    'device_monitor_events'
  )
ORDER BY tablename, policyname;

-- Expect no policies on connector_pairing_sessions (service-role only).

-- ===========================================================================
-- 7. Plaintext-token safety review queries
-- ===========================================================================

-- No column should store readable pairing codes or connector tokens.
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'connector_installations',
    'connector_pairing_sessions'
  )
  AND column_name ~* '(^code$|pairing_code|token$|connector_token|plaintext)';

-- Expect zero rows. Only code_hash and token_hash should exist.

SELECT
  COUNT(*) FILTER (WHERE code_hash IS NOT NULL AND length(code_hash) < 32) AS short_code_hashes,
  COUNT(*) FILTER (WHERE token_hash IS NOT NULL AND length(token_hash) < 32) AS short_token_hashes
FROM (
  SELECT code_hash, NULL::text AS token_hash
  FROM public.connector_pairing_sessions
  UNION ALL
  SELECT NULL::text, token_hash
  FROM public.connector_installations
) review;

-- Hashes should be 64-char hex (SHA-256) when populated.

-- ===========================================================================
-- 8. Rollback SQL
-- ===========================================================================

-- DROP POLICY IF EXISTS device_monitor_events_select_member ON public.device_monitor_events;
-- DROP POLICY IF EXISTS discovered_devices_delete_admin ON public.discovered_devices;
-- DROP POLICY IF EXISTS discovered_devices_update_admin ON public.discovered_devices;
-- DROP POLICY IF EXISTS discovered_devices_select_member ON public.discovered_devices;
-- DROP POLICY IF EXISTS connector_installations_update_admin ON public.connector_installations;
-- DROP POLICY IF EXISTS connector_installations_select_member ON public.connector_installations;
--
-- DROP TABLE IF EXISTS public.device_monitor_events;
-- DROP TABLE IF EXISTS public.discovered_devices;
-- DROP TABLE IF EXISTS public.connector_pairing_sessions;
-- DROP TABLE IF EXISTS public.connector_installations;
