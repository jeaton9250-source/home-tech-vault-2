alter policy device_documents_insert
on public.device_documents
with check (
  user_id = (select auth.uid())
  and (
    household_id is null
    or can_household_mutate(household_id)
  )
);

alter policy maintenance_tasks_insert
on public.maintenance_tasks
with check (
  user_id = (select auth.uid())
  and (
    household_id is null
    or can_household_mutate(household_id)
  )
);

alter policy network_info_insert
on public.network_info
with check (
  user_id = (select auth.uid())
  and (
    household_id is null
    or can_household_mutate(household_id)
  )
);

alter policy device_events_delete
on public.device_events
using (
  user_id = (select auth.uid())
  or can_admin_device(device_id)
);

alter policy device_events_insert
on public.device_events
with check (
  user_id = (select auth.uid())
  and can_mutate_device(device_id)
);

alter policy device_events_update
on public.device_events
using (
  user_id = (select auth.uid())
  and can_mutate_device(device_id)
)
with check (
  user_id = (select auth.uid())
  and can_mutate_device(device_id)
);
