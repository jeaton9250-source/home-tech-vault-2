-- Ensure Home Tech Vault private storage buckets exist.
-- RLS policies are managed separately.

INSERT INTO storage.buckets (
  id,
  name,
  public
)
VALUES
  (
    'device-images',
    'device-images',
    false
  ),
  (
    'device-documents',
    'device-documents',
    false
  )
ON CONFLICT (id)
DO UPDATE SET
  name = EXCLUDED.name,
  public = false;
