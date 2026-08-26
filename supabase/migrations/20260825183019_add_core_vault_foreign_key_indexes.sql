CREATE INDEX IF NOT EXISTS device_documents_device_id_idx
  ON public.device_documents (device_id);

CREATE INDEX IF NOT EXISTS device_documents_household_id_idx
  ON public.device_documents (household_id);

CREATE INDEX IF NOT EXISTS device_documents_user_id_idx
  ON public.device_documents (user_id);

CREATE INDEX IF NOT EXISTS device_events_device_id_idx
  ON public.device_events (device_id);

CREATE INDEX IF NOT EXISTS device_events_user_id_idx
  ON public.device_events (user_id);

CREATE INDEX IF NOT EXISTS maintenance_tasks_household_id_idx
  ON public.maintenance_tasks (household_id);

CREATE INDEX IF NOT EXISTS network_info_household_id_idx
  ON public.network_info (household_id);
