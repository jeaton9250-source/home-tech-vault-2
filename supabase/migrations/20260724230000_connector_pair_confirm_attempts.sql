-- Paste in Supabase SQL Editor if not applying via CLI.
-- Service-role-only attempt log for connector pair/confirm rate limiting.

CREATE TABLE IF NOT EXISTS public.connector_pair_confirm_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_key_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS connector_pair_confirm_attempts_key_created_idx
  ON public.connector_pair_confirm_attempts (client_key_hash, created_at DESC);

ALTER TABLE public.connector_pair_confirm_attempts ENABLE ROW LEVEL SECURITY;

-- No authenticated policies — Next.js service role only.
REVOKE ALL ON TABLE public.connector_pair_confirm_attempts FROM anon, authenticated;
