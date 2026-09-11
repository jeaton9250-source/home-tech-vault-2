-- A document can belong to the household vault without being linked to a device.
-- The legacy default generated an unrelated UUID, which then failed the device FK.
alter table public.documents
  alter column device_id drop default,
  alter column device_id drop not null;

comment on column public.documents.device_id is
  'Optional device link. NULL stores the document at the whole-home level.';
