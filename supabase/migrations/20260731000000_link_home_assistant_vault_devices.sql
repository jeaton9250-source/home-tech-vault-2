-- Link existing Home Assistant entities to
-- their permanent HomeCore Devices records.

UPDATE public.home_assistant_entities AS entity
SET
  device_id =
    discovered.imported_device_id,
  updated_at = now()
FROM public.discovered_devices AS discovered
WHERE
  entity.discovered_device_id =
    discovered.id
  AND entity.household_id =
    discovered.household_id
  AND discovered.imported_device_id
    IS NOT NULL
  AND entity.device_id IS DISTINCT FROM
    discovered.imported_device_id;
