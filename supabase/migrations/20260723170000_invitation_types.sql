-- Support platform-admin invitations for independent new accounts
-- while preserving household-member invitations.

ALTER TABLE public.household_invitations
  ADD COLUMN IF NOT EXISTS invitation_type TEXT;

UPDATE public.household_invitations
SET invitation_type = 'household_member'
WHERE invitation_type IS NULL;

ALTER TABLE public.household_invitations
  ALTER COLUMN invitation_type SET DEFAULT 'household_member';

ALTER TABLE public.household_invitations
  ALTER COLUMN invitation_type SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'household_invitations_invitation_type_check'
  ) THEN
    ALTER TABLE public.household_invitations
      ADD CONSTRAINT household_invitations_invitation_type_check
      CHECK (
        invitation_type IN (
          'new_account',
          'household_member'
        )
      );
  END IF;
END $$;

-- Allow null household/role for new-account invitations.
ALTER TABLE public.household_invitations
  ALTER COLUMN household_id DROP NOT NULL;

ALTER TABLE public.household_invitations
  ALTER COLUMN role DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'household_invitations_type_shape_check'
  ) THEN
    ALTER TABLE public.household_invitations
      ADD CONSTRAINT household_invitations_type_shape_check
      CHECK (
        (
          invitation_type = 'household_member'
          AND household_id IS NOT NULL
          AND role IS NOT NULL
          AND lower(role::text) IN ('admin', 'member', 'viewer')
        )
        OR (
          invitation_type = 'new_account'
          AND household_id IS NULL
          AND role IS NULL
        )
      );
  END IF;
END $$;

COMMENT ON COLUMN public.household_invitations.invitation_type IS
  'Invitation purpose: new_account creates an independent vault; household_member joins an existing household.';

-- Pending new-account invites are readable by the invited email.
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

-- Household admins can only insert household-member invitations for households they administer.
DROP POLICY IF EXISTS household_invitations_insert_admin ON public.household_invitations;
CREATE POLICY household_invitations_insert_admin
  ON public.household_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    invitation_type = 'household_member'
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
      invitation_type = 'household_member'
      AND household_id IS NOT NULL
      AND public.can_household_admin(household_id)
    )
    OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
  WITH CHECK (
    (
      invitation_type = 'household_member'
      AND household_id IS NOT NULL
      AND public.can_household_admin(household_id)
    )
    OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
