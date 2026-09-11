alter table public.documents
  add column if not exists document_name text,
  add column if not exists document_type text;

update public.documents
set
  document_name = coalesce(nullif(btrim(document_name), ''), file_name),
  document_type = coalesce(nullif(btrim(document_type), ''), file_type, 'Other')
where document_name is null
   or btrim(document_name) = ''
   or document_type is null
   or btrim(document_type) = '';

comment on column public.documents.document_name is
  'Homeowner-facing document title shared by web and mobile clients.';

comment on column public.documents.document_type is
  'Homeowner-facing category such as Receipt, Manual, or Warranty.';
