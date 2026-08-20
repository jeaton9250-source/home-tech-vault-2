-- Enforce the same restrictions at the Storage layer
-- that the Home Tech Vault document UI enforces.
--
-- This prevents a normal direct Storage upload from
-- bypassing the 15 MB bucket limit or allowed MIME list.

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'documents',
  'documents',
  false,
  15728640,
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
    'text/plain'
  ]::text[]
)
ON CONFLICT (id)
DO UPDATE SET
  name = EXCLUDED.name,
  public = false,
  file_size_limit =
    EXCLUDED.file_size_limit,
  allowed_mime_types =
    EXCLUDED.allowed_mime_types;
