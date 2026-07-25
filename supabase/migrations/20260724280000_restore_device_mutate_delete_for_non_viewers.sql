-- Restore device mutate/delete behavior broken by household RLS hardening.
-- Paste in Supabase SQL Editor → Run.
--
-- Rules:
--   - Personal vault owners can edit/delete their devices
--   - Household owner / admin / member can edit/delete household devices
--   - Household viewers remain read-only
--   - Clients may only INSERT rows as themselves

CREATE OR REPLACE FUNCTION public.can_mutate_scoped_row(
  p_household_id uuid,
  p_user_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    -- Always allow acting on your own row when you may write the scope.
    (
      p_user_id = auth.uid()
      AND (
        p_household_id IS NULL
        OR public.can_household_mutate(p_household_id)
      )
    )
    -- Shared household inventory: members/admins/owners may mutate any row.
    OR (
      p_household_id IS NOT NULL
      AND public.can_household_mutate(p_household_id)
    );
$$;

CREATE OR REPLACE FUNCTION public.can_delete_scoped_row(
  p_household_id uuid,
  p_user_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    -- Own devices (personal or household-attributed to you)
    p_user_id = auth.uid()
    -- Shared household: members/admins/owners (not viewers)
    OR (
      p_household_id IS NOT NULL
      AND public.can_household_mutate(p_household_id)
    )
    -- Legacy personal-shaped rows belonging to a household owner
    OR (
      p_household_id IS NULL
      AND EXISTS (
        SELECT 1
        FROM public.households h
        WHERE h.owner_id = p_user_id
          AND public.can_household_mutate(h.id)
      )
    );
$$;

-- Inserts must still be attributed to the caller (prevent user_id spoofing).
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'devices',
    'documents',
    'device_documents',
    'device_images',
    'maintenance_tasks',
    'network_info',
    'subscriptions'
  ]
  LOOP
    IF to_regclass(format('public.%I', tbl)) IS NULL THEN
      CONTINUE;
    END IF;

    EXECUTE format(
      'DROP POLICY IF EXISTS %I_insert ON public.%I',
      tbl,
      tbl
    );
    EXECUTE format(
      $policy$
      CREATE POLICY %I_insert
        ON public.%I
        FOR INSERT
        TO authenticated
        WITH CHECK (
          user_id = auth.uid()
          AND (
            household_id IS NULL
            OR public.can_household_mutate(household_id)
          )
        )
      $policy$,
      tbl,
      tbl
    );

    EXECUTE format(
      'DROP POLICY IF EXISTS %I_update ON public.%I',
      tbl,
      tbl
    );
    EXECUTE format(
      $policy$
      CREATE POLICY %I_update
        ON public.%I
        FOR UPDATE
        TO authenticated
        USING (public.can_mutate_scoped_row(household_id, user_id))
        WITH CHECK (public.can_mutate_scoped_row(household_id, user_id))
      $policy$,
      tbl,
      tbl
    );

    EXECUTE format(
      'DROP POLICY IF EXISTS %I_delete ON public.%I',
      tbl,
      tbl
    );
    EXECUTE format(
      $policy$
      CREATE POLICY %I_delete
        ON public.%I
        FOR DELETE
        TO authenticated
        USING (public.can_delete_scoped_row(household_id, user_id))
      $policy$,
      tbl,
      tbl
    );
  END LOOP;
END $$;

-- Storage: household mutators (not only admins) can remove device media.
CREATE OR REPLACE FUNCTION public.can_delete_device_image(storage_path text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    split_part(storage_path, '/', 1) = auth.uid()::text
    OR EXISTS (
      SELECT 1
      FROM public.devices d
      WHERE d.id::text = split_part(storage_path, '/', 2)
        AND (
          d.user_id = auth.uid()
          OR (
            d.household_id IS NOT NULL
            AND public.can_household_mutate(d.household_id)
          )
        )
    );
$$;

-- Keep RPC in sync if present (optional; API no longer depends on it).
CREATE OR REPLACE FUNCTION public.delete_vault_device(p_device_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  d public.devices%ROWTYPE;
  allowed boolean := false;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'NOT_AUTHENTICATED' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO d FROM public.devices WHERE id = p_device_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'DEVICE_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  allowed :=
    d.user_id = auth.uid()
    OR coalesce(public.is_platform_admin(), false)
    OR (
      d.household_id IS NOT NULL
      AND public.can_household_mutate(d.household_id)
    )
    OR EXISTS (
      SELECT 1 FROM public.households h
      WHERE h.id = d.household_id
        AND h.owner_id = auth.uid()
    )
    OR (
      d.household_id IS NULL
      AND EXISTS (
        SELECT 1 FROM public.households h
        WHERE h.owner_id = d.user_id
          AND public.can_household_mutate(h.id)
      )
    );

  IF NOT allowed THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  BEGIN
    UPDATE public.documents SET device_id = NULL WHERE device_id = p_device_id;
  EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
  END;

  BEGIN
    UPDATE public.discovered_devices
    SET imported_device_id = NULL
    WHERE imported_device_id = p_device_id;
  EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
  END;

  BEGIN
    UPDATE public.device_monitor_events
    SET device_id = NULL
    WHERE device_id = p_device_id;
  EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
  END;

  DELETE FROM public.device_events WHERE device_id = p_device_id;
  DELETE FROM public.device_images WHERE device_id = p_device_id;
  DELETE FROM public.device_documents WHERE device_id = p_device_id;

  BEGIN
    DELETE FROM public.maintenance_tasks WHERE device_id = p_device_id;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  BEGIN
    DELETE FROM public.device_identity_confirmations WHERE device_id = p_device_id;
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  DELETE FROM public.devices WHERE id = p_device_id;

  RETURN jsonb_build_object(
    'ok', true,
    'id', p_device_id,
    'device_name', d.device_name
  );
END;
$$;

REVOKE ALL ON FUNCTION public.delete_vault_device(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_vault_device(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_vault_device(uuid) TO service_role;
