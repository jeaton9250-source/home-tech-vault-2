-- Tighten Support Center access: platform admins only (no customer self-read).

DROP POLICY IF EXISTS support_tickets_select_own_or_admin ON support_tickets;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'support_tickets'
      AND policyname = 'support_tickets_select_admin'
  ) THEN
    CREATE POLICY support_tickets_select_admin
      ON support_tickets
      FOR SELECT
      TO authenticated
      USING (public.is_platform_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'support_tickets'
      AND policyname = 'support_tickets_delete_admin'
  ) THEN
    CREATE POLICY support_tickets_delete_admin
      ON support_tickets
      FOR DELETE
      TO authenticated
      USING (public.is_platform_admin());
  END IF;
END $$;

REVOKE ALL ON TABLE support_tickets FROM anon;
REVOKE ALL ON TABLE support_ticket_notes FROM anon;
REVOKE ALL ON TABLE support_ticket_counters FROM anon;
