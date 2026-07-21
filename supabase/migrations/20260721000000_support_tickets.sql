-- Home Tech Vault Support Center 1.0
-- support_tickets: customer support workflow
-- Inserts are service-role only (Next.js API). Clients never insert directly.

CREATE TABLE IF NOT EXISTS support_ticket_counters (
  year INT PRIMARY KEY,
  last_value INT NOT NULL DEFAULT 0
);

CREATE OR REPLACE FUNCTION public.generate_support_ticket_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  current_year INT := EXTRACT(YEAR FROM now())::INT;
  next_value INT;
BEGIN
  LOOP
    UPDATE support_ticket_counters
    SET last_value = last_value + 1
    WHERE year = current_year
    RETURNING last_value INTO next_value;

    IF FOUND THEN
      EXIT;
    END IF;

    BEGIN
      INSERT INTO support_ticket_counters (year, last_value)
      VALUES (current_year, 1);
      next_value := 1;
      EXIT;
    EXCEPTION
      WHEN unique_violation THEN
        NULL;
    END;
  END LOOP;

  RETURN 'HTV-' || current_year::TEXT || '-' || LPAD(next_value::TEXT, 6, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT is_admin
      FROM profiles
      WHERE id = auth.uid()
    ),
    false
  );
$$;

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  household_id UUID REFERENCES households(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (
      status IN (
        'new',
        'open',
        'waiting_on_customer',
        'in_progress',
        'resolved',
        'closed'
      )
    ),
  priority TEXT NOT NULL DEFAULT 'normal'
    CHECK (
      priority IN ('low', 'normal', 'high', 'urgent')
    ),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  effective_plan TEXT,
  household_role TEXT,
  source_page TEXT,
  admin_viewed_at TIMESTAMPTZ,
  idempotency_key TEXT UNIQUE,
  submitter_ip_hash TEXT,
  email_delivery_status JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id
  ON support_tickets(user_id);

CREATE INDEX IF NOT EXISTS idx_support_tickets_household_id
  ON support_tickets(household_id);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status
  ON support_tickets(status);

CREATE INDEX IF NOT EXISTS idx_support_tickets_priority
  ON support_tickets(priority);

CREATE INDEX IF NOT EXISTS idx_support_tickets_category
  ON support_tickets(category);

CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at
  ON support_tickets(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_support_tickets_email_created
  ON support_tickets(email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_support_tickets_submitter_ip_created
  ON support_tickets(submitter_ip_hash, created_at DESC)
  WHERE submitter_ip_hash IS NOT NULL;

CREATE TABLE IF NOT EXISTS support_ticket_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_ticket_notes_ticket_id
  ON support_ticket_notes(ticket_id, created_at ASC);

CREATE OR REPLACE FUNCTION public.update_support_tickets_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();

  IF NEW.status IN ('resolved', 'closed')
    AND OLD.status NOT IN ('resolved', 'closed') THEN
    NEW.resolved_at = COALESCE(NEW.resolved_at, now());
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS support_tickets_updated_at ON support_tickets;

CREATE TRIGGER support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_support_tickets_updated_at();

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_notes ENABLE ROW LEVEL SECURITY;

-- No INSERT/DELETE policies: tickets are created via service role API only.

CREATE POLICY support_tickets_select_admin
  ON support_tickets
  FOR SELECT
  TO authenticated
  USING (public.is_platform_admin());

CREATE POLICY support_tickets_update_admin
  ON support_tickets
  FOR UPDATE
  TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

CREATE POLICY support_tickets_delete_admin
  ON support_tickets
  FOR DELETE
  TO authenticated
  USING (public.is_platform_admin());

CREATE POLICY support_ticket_notes_select_admin
  ON support_ticket_notes
  FOR SELECT
  TO authenticated
  USING (public.is_platform_admin());

CREATE POLICY support_ticket_notes_insert_admin
  ON support_ticket_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_platform_admin()
    AND author_id = auth.uid()
  );

GRANT EXECUTE ON FUNCTION public.generate_support_ticket_number() TO service_role;
GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO authenticated;

REVOKE ALL ON TABLE support_tickets FROM anon;
REVOKE ALL ON TABLE support_ticket_notes FROM anon;
REVOKE ALL ON TABLE support_ticket_counters FROM anon;
