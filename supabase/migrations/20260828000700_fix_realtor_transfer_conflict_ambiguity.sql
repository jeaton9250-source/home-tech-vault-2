create or replace function public.accept_realtor_household_transfer(
  p_token_hash text,
  p_accepting_user_id uuid,
  p_accepting_email text
)
returns table(
  household_id uuid,
  gift_id uuid,
  previous_owner_id uuid,
  new_owner_id uuid,
  gift_plan text,
  gift_expires_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  v_transfer public.household_ownership_transfers%rowtype;
  v_gift public.realtor_vault_gifts%rowtype;
  v_current_owner uuid;
  v_email text;
begin
  v_email :=
    lower(
      trim(
        p_accepting_email
      )
    );

  if p_accepting_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if v_email = '' then
    raise exception 'EMAIL_REQUIRED';
  end if;

  select t.*
  into v_transfer
  from public.household_ownership_transfers as t
  where t.token_hash = p_token_hash
  for update;

  if not found then
    raise exception 'TRANSFER_NOT_FOUND';
  end if;

  if v_transfer.status <> 'pending' then
    raise exception 'TRANSFER_NOT_PENDING';
  end if;

  if v_transfer.expires_at <= now() then
    update public.household_ownership_transfers as t
    set
      status = 'expired',
      updated_at = now()
    where t.id = v_transfer.id;

    raise exception 'TRANSFER_EXPIRED';
  end if;

  if lower(trim(v_transfer.to_email)) <> v_email then
    raise exception 'TRANSFER_EMAIL_MISMATCH';
  end if;

  select h.owner_id
  into v_current_owner
  from public.households as h
  where h.id = v_transfer.household_id
  for update;

  if not found then
    raise exception 'HOUSEHOLD_NOT_FOUND';
  end if;

  if v_current_owner <> v_transfer.from_user_id then
    raise exception 'OWNER_CHANGED';
  end if;

  if p_accepting_user_id = v_transfer.from_user_id then
    raise exception 'CANNOT_TRANSFER_TO_SELF';
  end if;

  update public.households as h
  set
    owner_id = p_accepting_user_id,
    updated_at = now()
  where h.id = v_transfer.household_id;

  insert into public.household_members as hm (
    household_id,
    user_id,
    role,
    invited_by,
    joined_at,
    updated_at
  )
  values (
    v_transfer.household_id,
    p_accepting_user_id,
    'owner',
    v_transfer.from_user_id,
    now(),
    now()
  )
  on conflict on constraint household_members_household_id_user_id_key
  do update set
    role = 'owner',
    updated_at = now();

  if
    v_transfer.realtor_access_after_transfer = 'viewer'
  then
    update public.household_members as hm
    set
      role = 'viewer',
      updated_at = now()
    where
      hm.household_id = v_transfer.household_id
      and hm.user_id = v_transfer.from_user_id;
  else
    delete from public.household_members as hm
    where
      hm.household_id = v_transfer.household_id
      and hm.user_id = v_transfer.from_user_id;
  end if;

  update public.household_ownership_transfers as t
  set
    accepted_by_user_id = p_accepting_user_id,
    accepted_at = now(),
    status = 'accepted',
    updated_at = now()
  where t.id = v_transfer.id;

  if v_transfer.gift_id is not null then
    select g.*
    into v_gift
    from public.realtor_vault_gifts as g
    where g.id = v_transfer.gift_id
    for update;

    if found then
      update public.realtor_vault_gifts as g
      set
        claimed_by_user_id = p_accepting_user_id,
        claimed_at = now(),
        status = 'claimed',
        updated_at = now()
      where g.id = v_gift.id;

      if
        v_gift.gift_plan in (
          'pro',
          'family'
        )
        and v_gift.gift_expires_at is not null
        and v_gift.gift_expires_at > now()
      then
        insert into public.platform_plan_grants (
          user_id,
          plan,
          status,
          starts_at,
          expires_at,
          reason,
          notes,
          granted_by,
          created_at,
          updated_at
        )
        values (
          p_accepting_user_id,
          v_gift.gift_plan,
          'active',
          now(),
          v_gift.gift_expires_at,
          'realtor_closing_gift',
          'Home Tech Vault closing gift transferred with household ownership.',
          v_transfer.from_user_id,
          now(),
          now()
        );
      end if;
    end if;
  end if;

  return query
  select
    v_transfer.household_id,
    v_transfer.gift_id,
    v_transfer.from_user_id,
    p_accepting_user_id,
    v_gift.gift_plan,
    v_gift.gift_expires_at;
end;
$function$;

revoke all
on function public.accept_realtor_household_transfer(
  text,
  uuid,
  text
)
from public;

revoke all
on function public.accept_realtor_household_transfer(
  text,
  uuid,
  text
)
from anon;

revoke all
on function public.accept_realtor_household_transfer(
  text,
  uuid,
  text
)
from authenticated;

grant execute
on function public.accept_realtor_household_transfer(
  text,
  uuid,
  text
)
to service_role;
