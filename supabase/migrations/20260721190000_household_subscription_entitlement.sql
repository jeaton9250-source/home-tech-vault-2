-- Household subscription entitlement (review only — do not apply automatically)
--
-- Preferred model: subscriptions belong to households via household_id.
-- Compatibility: until backfilled, app resolves owner user_subscriptions as the
-- household entitlement source (see GET /api/household/access).

ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS household_id uuid
  REFERENCES public.households(id)
  ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS user_subscriptions_household_id_idx
  ON public.user_subscriptions(household_id)
  WHERE household_id IS NOT NULL;

-- Backfill household_id from household ownership where the subscription user
-- is the household billing owner.
UPDATE public.user_subscriptions us
SET household_id = h.id
FROM public.households h
WHERE us.household_id IS NULL
  AND us.user_id = h.owner_id;

COMMENT ON COLUMN public.user_subscriptions.household_id IS
  'Optional household entitlement key. When set, active members of this household inherit Pro/Family access.';
