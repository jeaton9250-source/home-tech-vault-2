-- Optional invitee name fields for admin and family invitation flows.
-- household_invitations already exists; do not recreate the membership table.

ALTER TABLE public.household_invitations
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT;

COMMENT ON COLUMN public.household_invitations.first_name IS
  'Optional first name supplied when an administrator invites the user.';

COMMENT ON COLUMN public.household_invitations.last_name IS
  'Optional last name supplied when an administrator invites the user.';
