-- =============================================================================
-- PASTE INTO: Supabase Dashboard → SQL Editor → Run
-- =============================================================================
-- Fix: household admins can delete devices (and related storage/media) that
-- other members uploaded. Prior can_delete_device_image required path prefix
-- auth.uid(), so deleteDevice() failed on storage.remove before the row delete.
-- =============================================================================

-- Storage: owner path OR household admin for that device
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
        AND d.household_id IS NOT NULL
        AND public.can_household_admin(d.household_id)
    );
$$;

-- Ensure can_admin_device exists (from prior migration)
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

-- device_images / device_documents: allow household admin via device, not only row user_id
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['device_images', 'device_documents']
  LOOP
    IF to_regclass(format('public.%I', tbl)) IS NULL THEN
      CONTINUE;
    END IF;

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
        USING (
          public.can_delete_scoped_row(household_id, user_id)
          OR public.can_admin_device(device_id)
        )
      $policy$,
      tbl,
      tbl
    );
  END LOOP;
END $$;

-- devices: also allow admin delete when household_id was never backfilled
-- (personal-shaped row belonging to a household owner)
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
    (p_household_id IS NULL AND p_user_id = auth.uid())
    OR (
      p_household_id IS NOT NULL
      AND public.can_household_admin(p_household_id)
    )
    OR (
      -- Device/content still keyed only by user_id, but that user owns a
      -- household this caller administers.
      p_household_id IS NULL
      AND EXISTS (
        SELECT 1
        FROM public.households h
        WHERE h.owner_id = p_user_id
          AND public.can_household_admin(h.id)
      )
    );
$$;
