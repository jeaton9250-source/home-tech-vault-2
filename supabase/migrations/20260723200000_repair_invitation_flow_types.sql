-- Repair migration: align invitation_type constraints and RLS with
-- create_account / join_household values used by the application.

UPDATE public.household_invitations
SET invitation_type = 'create_account'
WHERE invitation_type = 'new_account';

UPDATE public.household_invitations
SET invitation_type = 'join_household'
WHERE invitation_type = 'household_member';

UPDATE public.household_invitations
SET invitation_type = 'join_household'
WHERE invitation_type IS NULL
  AND household_id IS NOT NULL;

UPDATE public.household_invitations
SET invitation_type = 'create_account'
WHERE invitation_type IS NULL
  AND household_id IS NULL;

ALTER TABLE public.household_invitations
  ALTER COLUMN invitation_type SET DEFAULT 'join_household';

ALTER TABLE public.household_invitations
  DROP CONSTRAINT IF EXISTS household_invitations_invitation_type_check;

ALTER TABLE public.household_invitations
  ADD CONSTRAINT household_invitations_invitation_type_check
  CHECK (
    invitation_type IN (
      'create_account',
      'join_household'
    )
  );

ALTER TABLE public.household_invitations
  DROP CONSTRAINT IF EXISTS household_invitations_type_shape_check;

ALTER TABLE public.household_invitations
  ADD CONSTRAINT household_invitations_type_shape_check
  CHECK (
    (
      invitation_type = 'join_household'
      AND household_id IS NOT NULL
      AND role IS NOT NULL
      AND lower(role::text) IN ('admin', 'member', 'viewer')
    )
    OR (
      invitation_type = 'create_account'
      AND household_id IS NULL
      AND role IS NULL
    )
  );

COMMENT ON COLUMN public.household_invitations.invitation_type IS
  'Invitation purpose: create_account creates an independent vault; join_household joins an existing household.';

DROP POLICY IF EXISTS household_invitations_select ON public.household_invitations;
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

DROP POLICY IF EXISTS household_invitations_insert_admin ON public.household_invitations;
CREATE POLICY household_invitations_insert_admin
  ON public.household_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    invitation_type = 'join_household'
    AND household_id IS NOT NULL
    AND public.can_household_admin(household_id)
  );

DROP POLICY IF EXISTS household_invitations_update_admin ON public.household_invitations;
CREATE POLICY household_invitations_update_admin
  ON public.household_invitations
  FOR UPDATE
  TO authenticated
  USING (
    (
      invitation_type = 'join_household'
      AND household_id IS NOT NULL
      AND public.can_household_admin(household_id)
    )
    OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
  WITH CHECK (
    (
      invitation_type = 'join_household'
      AND household_id IS NOT NULL
      AND public.can_household_admin(household_id)
    )
    OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
