-- Paste in Supabase SQL Editor, then retry device delete.
-- Atomic device delete that clears dependents and allows:
--   - device owner (user_id = auth.uid())
--   - household owner/admin
--   - platform admin

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
    RAISE EXCEPTION 'NOT_AUTHENTICATED'
      USING ERRCODE = '42501';
  END IF;

  SELECT *
  INTO d
  FROM public.devices
  WHERE id = p_device_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'DEVICE_NOT_FOUND'
      USING ERRCODE = 'P0002';
  END IF;

  allowed :=
    d.user_id = auth.uid()
    OR coalesce(public.is_platform_admin(), false)
    OR (
      d.household_id IS NOT NULL
      AND public.can_household_admin(d.household_id)
    )
    OR (
      d.household_id IS NULL
      AND EXISTS (
        SELECT 1
        FROM public.households h
        WHERE h.owner_id = d.user_id
          AND public.can_household_admin(h.id)
      )
    )
    OR EXISTS (
      SELECT 1
      FROM public.households h
      WHERE h.id = d.household_id
        AND h.owner_id = auth.uid()
    );

  IF NOT allowed THEN
    RAISE EXCEPTION 'FORBIDDEN'
      USING ERRCODE = '42501';
  END IF;

  -- Detach optional FKs that may be ON DELETE RESTRICT / NO ACTION.
  BEGIN
    UPDATE public.documents
    SET device_id = NULL
    WHERE device_id = p_device_id;
  EXCEPTION
    WHEN undefined_table THEN NULL;
    WHEN undefined_column THEN NULL;
  END;

  BEGIN
    UPDATE public.discovered_devices
    SET imported_device_id = NULL
    WHERE imported_device_id = p_device_id;
  EXCEPTION
    WHEN undefined_table THEN NULL;
    WHEN undefined_column THEN NULL;
  END;

  BEGIN
    UPDATE public.device_monitor_events
    SET device_id = NULL
    WHERE device_id = p_device_id;
  EXCEPTION
    WHEN undefined_table THEN NULL;
    WHEN undefined_column THEN NULL;
  END;

  DELETE FROM public.device_events
  WHERE device_id = p_device_id;

  DELETE FROM public.device_images
  WHERE device_id = p_device_id;

  DELETE FROM public.device_documents
  WHERE device_id = p_device_id;

  BEGIN
    DELETE FROM public.maintenance_tasks
    WHERE device_id = p_device_id;
  EXCEPTION
    WHEN undefined_table THEN NULL;
  END;

  BEGIN
    DELETE FROM public.device_identity_confirmations
    WHERE device_id = p_device_id;
  EXCEPTION
    WHEN undefined_table THEN NULL;
  END;

  DELETE FROM public.devices
  WHERE id = p_device_id;

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

-- Keep policy helper aligned: owners can always delete their own rows.
CREATE OR REPLACE FUNCTION public.can_delete_scoped_row(
  p_household_id uuid,
  p_user_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    p_user_id = auth.uid()
    OR (
      p_household_id IS NOT NULL
      AND public.can_household_admin(p_household_id)
    )
    OR (
      p_household_id IS NULL
      AND EXISTS (
        SELECT 1
        FROM public.households h
        WHERE h.owner_id = p_user_id
          AND public.can_household_admin(h.id)
      )
    );
$$;
