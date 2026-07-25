-- Enable household-scoped RLS on core content tables.
-- Fixes missing relrowsecurity on devices/documents/households/etc.
-- Safe to re-run. Service-role (admin APIs, invite RPCs) bypasses RLS.
-- Keeps invitation UPDATE admin-only (no invitee rewrite).

-- =========================================================
-- Scoped-row helpers (match deferred household role RLS)
-- =========================================================
CREATE OR REPLACE FUNCTION public.can_access_scoped_row(
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
      AND public.can_household_read(p_household_id)
    );
$$;

CREATE OR REPLACE FUNCTION public.can_mutate_scoped_row(
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
      AND public.can_household_mutate(p_household_id)
      AND p_user_id = auth.uid()
    );
$$;

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
    );
$$;

-- =========================================================
-- Drop ALL existing policies on a table (unknown legacy names)
-- =========================================================
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

-- =========================================================
-- households
-- =========================================================
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
SELECT public._drop_all_policies('public', 'households');

CREATE POLICY households_select_member
  ON public.households
  FOR SELECT
  TO authenticated
  USING (
    public.is_household_member(id)
    OR owner_id = auth.uid()
  );

CREATE POLICY households_update_admin
  ON public.households
  FOR UPDATE
  TO authenticated
  USING (
    public.can_household_admin(id)
    OR owner_id = auth.uid()
  )
  WITH CHECK (
    public.can_household_admin(id)
    OR owner_id = auth.uid()
  );

CREATE POLICY households_insert_owner
  ON public.households
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY households_delete_owner
  ON public.households
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

REVOKE ALL ON TABLE public.households FROM anon;

-- =========================================================
-- household_members
-- =========================================================
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
SELECT public._drop_all_policies('public', 'household_members');

CREATE POLICY household_members_select
  ON public.household_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_household_member(household_id)
  );

CREATE POLICY household_members_insert_admin
  ON public.household_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      public.can_household_admin(household_id)
      AND user_id <> auth.uid()
    )
    OR (
      -- Owner may add themselves when creating a household (non–service-role paths)
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

CREATE POLICY household_members_update_admin
  ON public.household_members
  FOR UPDATE
  TO authenticated
  USING (
    public.can_household_admin(household_id)
    AND lower(role::text) <> 'owner'
  )
  WITH CHECK (
    public.can_household_admin(household_id)
    AND user_id <> auth.uid()
    AND lower(role::text) <> 'owner'
  );

CREATE POLICY household_members_delete_admin
  ON public.household_members
  FOR DELETE
  TO authenticated
  USING (
    (
      public.can_household_admin(household_id)
      AND lower(role::text) <> 'owner'
      AND user_id <> auth.uid()
    )
    OR (
      user_id = auth.uid()
      AND lower(role::text) <> 'owner'
    )
  );

REVOKE ALL ON TABLE public.household_members FROM anon;

-- =========================================================
-- household_invitations (UPDATE stays admin-only)
-- =========================================================
ALTER TABLE public.household_invitations ENABLE ROW LEVEL SECURITY;
SELECT public._drop_all_policies('public', 'household_invitations');

CREATE POLICY household_invitations_select
  ON public.household_invitations
  FOR SELECT
  TO authenticated
  USING (
    (
      household_id IS NOT NULL
      AND public.is_household_member(household_id)
    )
    OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

CREATE POLICY household_invitations_insert_admin
  ON public.household_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    invitation_type = 'join_household'
    AND household_id IS NOT NULL
    AND public.can_household_admin(household_id)
  );

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

CREATE POLICY household_invitations_delete_admin
  ON public.household_invitations
  FOR DELETE
  TO authenticated
  USING (
    invitation_type = 'join_household'
    AND household_id IS NOT NULL
    AND public.can_household_admin(household_id)
  );

REVOKE ALL ON TABLE public.household_invitations FROM anon;

-- =========================================================
-- Content tables
-- =========================================================
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
      RAISE NOTICE 'Skipping missing table public.%', tbl;
      CONTINUE;
    END IF;

    EXECUTE format(
      'ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',
      tbl
    );
    PERFORM public._drop_all_policies('public', tbl);

    EXECUTE format(
      'CREATE POLICY %I_select ON public.%I FOR SELECT TO authenticated USING (public.can_access_scoped_row(household_id, user_id))',
      tbl,
      tbl
    );
    EXECUTE format(
      'CREATE POLICY %I_insert ON public.%I FOR INSERT TO authenticated WITH CHECK (public.can_mutate_scoped_row(household_id, user_id))',
      tbl,
      tbl
    );
    EXECUTE format(
      'CREATE POLICY %I_update ON public.%I FOR UPDATE TO authenticated USING (public.can_mutate_scoped_row(household_id, user_id)) WITH CHECK (public.can_mutate_scoped_row(household_id, user_id))',
      tbl,
      tbl
    );
    EXECUTE format(
      'CREATE POLICY %I_delete ON public.%I FOR DELETE TO authenticated USING (public.can_delete_scoped_row(household_id, user_id))',
      tbl,
      tbl
    );
    EXECUTE format(
      'REVOKE ALL ON TABLE public.%I FROM anon',
      tbl
    );
  END LOOP;
END $$;

-- =========================================================
-- Storage: device-images / device-documents
-- Path: {user_id}/{device_id}/{filename}
-- =========================================================
CREATE OR REPLACE FUNCTION public.storage_device_image_household_id(storage_path text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT d.household_id
  FROM public.devices d
  WHERE d.id::text = split_part(storage_path, '/', 2)
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.can_read_device_image(storage_path text)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    split_part(storage_path, '/', 1) = auth.uid()::text
    OR (
      public.storage_device_image_household_id(storage_path) IS NOT NULL
      AND public.can_household_read(
        public.storage_device_image_household_id(storage_path)
      )
    );
$$;

CREATE OR REPLACE FUNCTION public.can_upload_device_image(storage_path text)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    split_part(storage_path, '/', 1) = auth.uid()::text
    AND (
      public.storage_device_image_household_id(storage_path) IS NULL
      OR public.can_household_mutate(
        public.storage_device_image_household_id(storage_path)
      )
    );
$$;

CREATE OR REPLACE FUNCTION public.can_delete_device_image(storage_path text)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    split_part(storage_path, '/', 1) = auth.uid()::text
    AND (
      public.storage_device_image_household_id(storage_path) IS NULL
      OR public.can_household_admin(
        public.storage_device_image_household_id(storage_path)
      )
    );
$$;

-- documents bucket: {user_id|household_id}/{device_id|unassigned}/{file}
CREATE OR REPLACE FUNCTION public.can_read_documents_object(storage_path text)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    split_part(storage_path, '/', 1) = auth.uid()::text
    OR (
      split_part(storage_path, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      AND public.can_household_read(split_part(storage_path, '/', 1)::uuid)
    );
$$;

CREATE OR REPLACE FUNCTION public.can_write_documents_object(storage_path text)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    split_part(storage_path, '/', 1) = auth.uid()::text
    OR (
      split_part(storage_path, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      AND public.can_household_mutate(split_part(storage_path, '/', 1)::uuid)
    );
$$;

DO $$
DECLARE
  r record;
BEGIN
  -- Drop prior storage policies for our buckets (keep unrelated buckets intact)
  FOR r IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND (
        policyname ILIKE '%device_images%'
        OR policyname ILIKE '%device-images%'
        OR policyname ILIKE '%device_documents%'
        OR policyname ILIKE '%device-documents%'
        OR policyname ILIKE '%documents_storage%'
        OR policyname ILIKE 'documents_%'
      )
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON storage.objects',
      r.policyname
    );
  END LOOP;
END $$;

CREATE POLICY device_images_storage_select
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'device-images'
    AND public.can_read_device_image(name)
  );

CREATE POLICY device_images_storage_insert
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'device-images'
    AND public.can_upload_device_image(name)
  );

CREATE POLICY device_images_storage_update
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'device-images'
    AND public.can_upload_device_image(name)
  )
  WITH CHECK (
    bucket_id = 'device-images'
    AND public.can_upload_device_image(name)
  );

CREATE POLICY device_images_storage_delete
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'device-images'
    AND public.can_delete_device_image(name)
  );

CREATE POLICY device_documents_storage_select
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'device-documents'
    AND public.can_read_device_image(name)
  );

CREATE POLICY device_documents_storage_insert
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'device-documents'
    AND public.can_upload_device_image(name)
  );

CREATE POLICY device_documents_storage_update
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'device-documents'
    AND public.can_upload_device_image(name)
  )
  WITH CHECK (
    bucket_id = 'device-documents'
    AND public.can_upload_device_image(name)
  );

CREATE POLICY device_documents_storage_delete
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'device-documents'
    AND public.can_delete_device_image(name)
  );

CREATE POLICY documents_storage_select
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND public.can_read_documents_object(name)
  );

CREATE POLICY documents_storage_insert
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND public.can_write_documents_object(name)
  );

CREATE POLICY documents_storage_update
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND public.can_write_documents_object(name)
  )
  WITH CHECK (
    bucket_id = 'documents'
    AND public.can_write_documents_object(name)
  );

CREATE POLICY documents_storage_delete
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND public.can_write_documents_object(name)
  );

-- Cleanup helper (not needed at runtime)
DROP FUNCTION IF EXISTS public._drop_all_policies(text, text);
