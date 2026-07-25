-- Allow device/content row owners to DELETE their own rows even when
-- household_id is set. Household admins can still delete any household row.
-- (Previous policy required can_household_admin for all household-scoped rows,
-- which blocked owners when membership helpers did not resolve as expected.)

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
