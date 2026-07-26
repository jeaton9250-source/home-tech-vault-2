-- Home Tech Vault iOS Smart Connector + Notifications compatibility backend
-- Review and apply manually. Preserves existing connector tables and data.

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN (
    'connector_offline',
    'connector_restored',
    'device_offline',
    'device_restored',
    'new_device_discovered',
    'pairing_completed',
    'connector_attention',
    'warranty_expiring',
    'maintenance_due',
    'maintenance_overdue'
  )),
  title text NOT NULL CHECK (char_length(title) <= 160),
  body text NOT NULL CHECK (char_length(body) <= 800),
  entity_type text,
  entity_id uuid,
  event_key text,
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS notifications_event_key_idx
  ON public.notifications (event_key)
  WHERE event_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS notifications_user_household_created_idx
  ON public.notifications (user_id, household_id, created_at DESC)
  WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS notifications_user_unread_idx
  ON public.notifications (user_id, household_id)
  WHERE is_read = false AND archived_at IS NULL;

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connector_offline boolean NOT NULL DEFAULT true,
  connector_restored boolean NOT NULL DEFAULT true,
  device_offline boolean NOT NULL DEFAULT true,
  device_restored boolean NOT NULL DEFAULT true,
  new_device_discovered boolean NOT NULL DEFAULT true,
  warranty_reminders boolean NOT NULL DEFAULT true,
  maintenance_reminders boolean NOT NULL DEFAULT true,
  push_enabled boolean NOT NULL DEFAULT false,
  in_app_enabled boolean NOT NULL DEFAULT true,
  quiet_hours_start time,
  quiet_hours_end time,
  timezone text NOT NULL DEFAULT 'America/New_York',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (household_id, user_id)
);

CREATE INDEX IF NOT EXISTS notification_preferences_user_idx
  ON public.notification_preferences (user_id, household_id);

CREATE TABLE IF NOT EXISTS public.device_push_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id uuid REFERENCES public.households(id) ON DELETE SET NULL,
  installation_id text NOT NULL,
  token_hash text NOT NULL,
  token_ciphertext text NOT NULL,
  environment text NOT NULL CHECK (environment IN ('sandbox', 'production')),
  platform text NOT NULL CHECK (platform IN ('ios')),
  bundle_id text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, installation_id),
  UNIQUE (token_hash)
);

CREATE INDEX IF NOT EXISTS device_push_tokens_user_active_idx
  ON public.device_push_tokens (user_id, active, updated_at DESC);

CREATE INDEX IF NOT EXISTS device_push_tokens_household_idx
  ON public.device_push_tokens (household_id)
  WHERE household_id IS NOT NULL;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_push_tokens ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF to_regclass('public.notifications') IS NOT NULL THEN
    DROP POLICY IF EXISTS notifications_select_own ON public.notifications;
    CREATE POLICY notifications_select_own
      ON public.notifications
      FOR SELECT
      TO authenticated
      USING (
        user_id = auth.uid()
        AND public.can_household_read(household_id)
      );

    DROP POLICY IF EXISTS notifications_update_read_own ON public.notifications;
    CREATE POLICY notifications_update_read_own
      ON public.notifications
      FOR UPDATE
      TO authenticated
      USING (
        user_id = auth.uid()
        AND public.can_household_read(household_id)
      )
      WITH CHECK (
        user_id = auth.uid()
        AND public.can_household_read(household_id)
      );

    REVOKE ALL ON TABLE public.notifications FROM anon;
    REVOKE INSERT, DELETE ON TABLE public.notifications FROM authenticated;
    GRANT SELECT, UPDATE ON TABLE public.notifications TO authenticated;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.notification_preferences') IS NOT NULL THEN
    DROP POLICY IF EXISTS notification_preferences_select_own ON public.notification_preferences;
    CREATE POLICY notification_preferences_select_own
      ON public.notification_preferences
      FOR SELECT
      TO authenticated
      USING (
        user_id = auth.uid()
        AND public.can_household_read(household_id)
      );

    DROP POLICY IF EXISTS notification_preferences_insert_own ON public.notification_preferences;
    CREATE POLICY notification_preferences_insert_own
      ON public.notification_preferences
      FOR INSERT
      TO authenticated
      WITH CHECK (
        user_id = auth.uid()
        AND public.can_household_read(household_id)
      );

    DROP POLICY IF EXISTS notification_preferences_update_own ON public.notification_preferences;
    CREATE POLICY notification_preferences_update_own
      ON public.notification_preferences
      FOR UPDATE
      TO authenticated
      USING (
        user_id = auth.uid()
        AND public.can_household_read(household_id)
      )
      WITH CHECK (
        user_id = auth.uid()
        AND public.can_household_read(household_id)
      );

    REVOKE ALL ON TABLE public.notification_preferences FROM anon;
    GRANT SELECT, INSERT, UPDATE ON TABLE public.notification_preferences TO authenticated;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.device_push_tokens') IS NOT NULL THEN
    DROP POLICY IF EXISTS device_push_tokens_select_own ON public.device_push_tokens;
    DROP POLICY IF EXISTS device_push_tokens_insert_own ON public.device_push_tokens;
    DROP POLICY IF EXISTS device_push_tokens_update_own ON public.device_push_tokens;

    REVOKE ALL ON TABLE public.device_push_tokens FROM anon, authenticated;
  END IF;
END $$;

notify pgrst, 'reload schema';
