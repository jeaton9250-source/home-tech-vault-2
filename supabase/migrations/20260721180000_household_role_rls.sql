-- Household role-based RLS (review only — do not apply automatically)
--
-- Normalizes stored roles (owner/admin/member/viewer) into mutation tiers:
--   viewer: read only
--   member: read + insert/update
--   admin:  read + insert/update + delete + membership management
--
-- Platform admin (`profiles.is_admin`) is intentionally NOT used here.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.normalize_household_role(role text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN lower(trim(role)) IN ('owner', 'admin', 'household_admin') THEN 'admin'
    WHEN lower(trim(role)) = 'member' THEN 'member'
    WHEN lower(trim(role)) = 'viewer' THEN 'viewer'
    ELSE NULL
  END;
$$;

CREATE OR REPLACE FUNCTION public.current_household_role(p_household_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.normalize_household_role(hm.role)
  FROM public.household_members hm
  WHERE hm.household_id = p_household_id
    AND hm.user_id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_household_member(p_household_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.household_members hm
    WHERE hm.household_id = p_household_id
      AND hm.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.can_household_read(p_household_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT public.is_household_member(p_household_id);
$$;

CREATE OR REPLACE FUNCTION public.can_household_mutate(p_household_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT public.current_household_role(p_household_id) IN ('member', 'admin');
$$;

CREATE OR REPLACE FUNCTION public.can_household_admin(p_household_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT public.current_household_role(p_household_id) = 'admin';
$$;

CREATE OR REPLACE FUNCTION public.can_access_scoped_row(
  p_household_id uuid,
  p_user_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
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
AS $$
  SELECT
    (p_household_id IS NULL AND p_user_id = auth.uid())
    OR (
      p_household_id IS NOT NULL
      AND public.can_household_admin(p_household_id)
    );
$$;

-- ---------------------------------------------------------------------------
-- households
-- ---------------------------------------------------------------------------

ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS households_select_member ON public.households;
CREATE POLICY households_select_member
  ON public.households
  FOR SELECT
  TO authenticated
  USING (
    public.is_household_member(id)
    OR owner_id = auth.uid()
  );

DROP POLICY IF EXISTS households_update_admin ON public.households;
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

DROP POLICY IF EXISTS households_insert_owner ON public.households;
CREATE POLICY households_insert_owner
  ON public.households
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS households_delete_owner ON public.households;
CREATE POLICY households_delete_owner
  ON public.households
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- household_members
-- ---------------------------------------------------------------------------

ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS household_members_select ON public.household_members;
CREATE POLICY household_members_select
  ON public.household_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_household_member(household_id)
  );

DROP POLICY IF EXISTS household_members_insert_admin ON public.household_members;
CREATE POLICY household_members_insert_admin
  ON public.household_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.can_household_admin(household_id)
    AND user_id <> auth.uid()
  );

DROP POLICY IF EXISTS household_members_update_admin ON public.household_members;
CREATE POLICY household_members_update_admin
  ON public.household_members
  FOR UPDATE
  TO authenticated
  USING (
    public.can_household_admin(household_id)
    AND lower(role) <> 'owner'
  )
  WITH CHECK (
    public.can_household_admin(household_id)
    AND user_id <> auth.uid()
    AND lower(role) <> 'owner'
  );

DROP POLICY IF EXISTS household_members_delete_admin ON public.household_members;
CREATE POLICY household_members_delete_admin
  ON public.household_members
  FOR DELETE
  TO authenticated
  USING (
    public.can_household_admin(household_id)
    AND lower(role) <> 'owner'
    AND user_id <> auth.uid()
  );

-- ---------------------------------------------------------------------------
-- household_invitations
-- ---------------------------------------------------------------------------

ALTER TABLE public.household_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS household_invitations_select ON public.household_invitations;
CREATE POLICY household_invitations_select
  ON public.household_invitations
  FOR SELECT
  TO authenticated
  USING (
    public.is_household_member(household_id)
    OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

DROP POLICY IF EXISTS household_invitations_insert_admin ON public.household_invitations;
CREATE POLICY household_invitations_insert_admin
  ON public.household_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (public.can_household_admin(household_id));

DROP POLICY IF EXISTS household_invitations_update_admin ON public.household_invitations;
CREATE POLICY household_invitations_update_admin
  ON public.household_invitations
  FOR UPDATE
  TO authenticated
  USING (public.can_household_admin(household_id))
  WITH CHECK (public.can_household_admin(household_id));

DROP POLICY IF EXISTS household_invitations_delete_admin ON public.household_invitations;
CREATE POLICY household_invitations_delete_admin
  ON public.household_invitations
  FOR DELETE
  TO authenticated
  USING (public.can_household_admin(household_id));

-- ---------------------------------------------------------------------------
-- Shared scoped content tables (household_id + user_id)
-- Applies to: devices, documents, device_documents, device_images,
--             maintenance_tasks, network_info, subscriptions
-- ---------------------------------------------------------------------------

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
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);

    EXECUTE format('DROP POLICY IF EXISTS %I_select ON public.%I', tbl, tbl);
    EXECUTE format(
      'CREATE POLICY %I_select ON public.%I FOR SELECT TO authenticated USING (public.can_access_scoped_row(household_id, user_id))',
      tbl,
      tbl
    );

    EXECUTE format('DROP POLICY IF EXISTS %I_insert ON public.%I', tbl, tbl);
    EXECUTE format(
      'CREATE POLICY %I_insert ON public.%I FOR INSERT TO authenticated WITH CHECK (public.can_mutate_scoped_row(household_id, user_id))',
      tbl,
      tbl
    );

    EXECUTE format('DROP POLICY IF EXISTS %I_update ON public.%I', tbl, tbl);
    EXECUTE format(
      'CREATE POLICY %I_update ON public.%I FOR UPDATE TO authenticated USING (public.can_mutate_scoped_row(household_id, user_id)) WITH CHECK (public.can_mutate_scoped_row(household_id, user_id))',
      tbl,
      tbl
    );

    EXECUTE format('DROP POLICY IF EXISTS %I_delete ON public.%I', tbl, tbl);
    EXECUTE format(
      'CREATE POLICY %I_delete ON public.%I FOR DELETE TO authenticated USING (public.can_delete_scoped_row(household_id, user_id))',
      tbl,
      tbl
    );
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- Storage: device-images bucket
-- Path convention: {user_id}/{device_id}/{filename}
-- ---------------------------------------------------------------------------

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

DROP POLICY IF EXISTS device_images_storage_select ON storage.objects;
CREATE POLICY device_images_storage_select
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'device-images'
    AND public.can_read_device_image(name)
  );

DROP POLICY IF EXISTS device_images_storage_insert ON storage.objects;
CREATE POLICY device_images_storage_insert
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'device-images'
    AND public.can_upload_device_image(name)
  );

DROP POLICY IF EXISTS device_images_storage_update ON storage.objects;
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

DROP POLICY IF EXISTS device_images_storage_delete ON storage.objects;
CREATE POLICY device_images_storage_delete
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'device-images'
    AND public.can_delete_device_image(name)
  );
