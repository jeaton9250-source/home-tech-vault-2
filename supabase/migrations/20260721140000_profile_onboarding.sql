-- Onboarding progress persisted on profiles (one row per user).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS onboarding_step TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_skipped_at TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.onboarding_step IS
  'Current onboarding step: welcome, home, device, document, network, complete';

COMMENT ON COLUMN public.profiles.onboarding_completed_at IS
  'When the user finished onboarding. NULL means not completed.';

COMMENT ON COLUMN public.profiles.onboarding_skipped_at IS
  'When the user chose Skip for now. Cleared on manual restart.';
