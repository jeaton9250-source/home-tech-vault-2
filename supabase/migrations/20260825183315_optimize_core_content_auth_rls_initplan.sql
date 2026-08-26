alter policy devices_insert
on public.devices
with check (
  user_id = (select auth.uid())
  and (household_id is null or can_household_mutate(household_id))
);

alter policy documents_insert
on public.documents
with check (
  user_id = (select auth.uid())
  and (household_id is null or can_household_mutate(household_id))
);

alter policy subscriptions_insert
on public.subscriptions
with check (
  user_id = (select auth.uid())
  and (household_id is null or can_household_mutate(household_id))
);

alter policy device_images_insert
on public.device_images
with check (
  user_id = (select auth.uid())
  and (household_id is null or can_household_mutate(household_id))
);
