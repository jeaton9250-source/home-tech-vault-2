-- Rename invitation types to explicit create_account / join_household values.

UPDATE public.household_invitations
SET invitation_type = 'create_account'
WHERE invitation_type = 'new_account';

UPDATE public.household_invitations
SET invitation_type = 'join_household'
WHERE invitation_type = 'household_member';

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
