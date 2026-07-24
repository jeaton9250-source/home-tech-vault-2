-- Repair migration for databases that failed on household_invitations_type_shape_check
-- because role uses the household_role enum (lower(role) requires an explicit cast).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'household_invitations_type_shape_check'
  ) THEN
    ALTER TABLE public.household_invitations
      DROP CONSTRAINT household_invitations_type_shape_check;
  END IF;
END $$;

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

-- RLS policies from 20260723170000 (safe to re-run if earlier steps succeeded).
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
