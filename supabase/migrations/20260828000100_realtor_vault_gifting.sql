-- ==========================================================
-- HOME TECH VAULT
-- Realtor Gift + Household Ownership Transfer
-- ==========================================================

create table if not exists public.realtor_partners (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null unique
    references auth.users(id)
    on delete cascade,

  brokerage_name text,
  license_state text,

  referral_code text not null unique,

  status text not null default 'active'
    check (
      status in (
        'active',
        'inactive',
        'suspended'
      )
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


create table if not exists public.realtor_vault_gifts (
  id uuid primary key default gen_random_uuid(),

  realtor_partner_id uuid not null
    references public.realtor_partners(id)
    on delete cascade,

  realtor_user_id uuid not null
    references auth.users(id)
    on delete cascade,

  household_id uuid
    references public.households(id)
    on delete set null,

  buyer_email text not null,
  buyer_first_name text,
  buyer_last_name text,

  property_address_line1 text not null,
  property_address_line2 text,
  property_city text not null,
  property_state text not null,
  property_postal_code text not null,

  gift_plan text not null default 'pro'
    check (
      gift_plan in (
        'free',
        'pro',
        'family'
      )
    ),

  gift_duration_months integer not null default 12
    check (
      gift_duration_months between 1 and 60
    ),

  gift_starts_at timestamptz,
  gift_expires_at timestamptz,

  status text not null default 'draft'
    check (
      status in (
        'draft',
        'awaiting_payment',
        'paid',
        'preparing',
        'transfer_sent',
        'claimed',
        'cancelled',
        'refunded'
      )
    ),

  stripe_checkout_session_id text,
  stripe_payment_intent_id text,

  claimed_by_user_id uuid
    references auth.users(id)
    on delete set null,

  claimed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


create table if not exists public.household_ownership_transfers (
  id uuid primary key default gen_random_uuid(),

  household_id uuid not null
    references public.households(id)
    on delete cascade,

  gift_id uuid
    references public.realtor_vault_gifts(id)
    on delete set null,

  from_user_id uuid not null
    references auth.users(id)
    on delete cascade,

  to_email text not null,

  accepted_by_user_id uuid
    references auth.users(id)
    on delete set null,

  token_hash text not null unique,

  status text not null default 'pending'
    check (
      status in (
        'pending',
        'accepted',
        'expired',
        'cancelled'
      )
    ),

  realtor_access_after_transfer text not null default 'remove'
    check (
      realtor_access_after_transfer in (
        'remove',
        'viewer'
      )
    ),

  expires_at timestamptz not null,
  accepted_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ==========================================================
-- INDEXES
-- ==========================================================

create index if not exists realtor_vault_gifts_realtor_idx
on public.realtor_vault_gifts(realtor_user_id);

create index if not exists realtor_vault_gifts_household_idx
on public.realtor_vault_gifts(household_id);

create index if not exists realtor_vault_gifts_buyer_email_idx
on public.realtor_vault_gifts(lower(buyer_email));

create index if not exists ownership_transfers_household_idx
on public.household_ownership_transfers(household_id);

create index if not exists ownership_transfers_email_idx
on public.household_ownership_transfers(lower(to_email));

create index if not exists ownership_transfers_pending_idx
on public.household_ownership_transfers(status, expires_at);


-- ==========================================================
-- UPDATED_AT
-- ==========================================================

create or replace function public.set_realtor_transfer_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


drop trigger if exists realtor_partners_updated_at
on public.realtor_partners;

create trigger realtor_partners_updated_at
before update on public.realtor_partners
for each row
execute function public.set_realtor_transfer_updated_at();


drop trigger if exists realtor_vault_gifts_updated_at
on public.realtor_vault_gifts;

create trigger realtor_vault_gifts_updated_at
before update on public.realtor_vault_gifts
for each row
execute function public.set_realtor_transfer_updated_at();


drop trigger if exists household_transfers_updated_at
on public.household_ownership_transfers;

create trigger household_transfers_updated_at
before update on public.household_ownership_transfers
for each row
execute function public.set_realtor_transfer_updated_at();


-- ==========================================================
-- ROW LEVEL SECURITY
-- ==========================================================

alter table public.realtor_partners
enable row level security;

alter table public.realtor_vault_gifts
enable row level security;

alter table public.household_ownership_transfers
enable row level security;


-- Realtor can read their own partner profile.
drop policy if exists
  "realtor read own partner profile"
on public.realtor_partners;

create policy
  "realtor read own partner profile"
on public.realtor_partners
for select
to authenticated
using (
  user_id = auth.uid()
);


-- Realtor can read gifts they created.
drop policy if exists
  "realtor read own gifts"
on public.realtor_vault_gifts;

create policy
  "realtor read own gifts"
on public.realtor_vault_gifts
for select
to authenticated
using (
  realtor_user_id = auth.uid()
  or claimed_by_user_id = auth.uid()
);


-- Current owner can see ownership transfers
-- initiated from their account.
drop policy if exists
  "transfer participants can read"
on public.household_ownership_transfers;

create policy
  "transfer participants can read"
on public.household_ownership_transfers
for select
to authenticated
using (
  from_user_id = auth.uid()
  or accepted_by_user_id = auth.uid()
);


-- Writes intentionally go through server-side admin routes.
