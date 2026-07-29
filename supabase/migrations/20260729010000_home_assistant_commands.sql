create table if not exists public.home_assistant_commands (
  id uuid primary key default gen_random_uuid(),

  household_id uuid not null
    references public.households(id)
    on delete cascade,

  connector_id uuid not null
    references public.connector_installations(id)
    on delete cascade,

  entity_id uuid not null
    references public.home_assistant_entities(id)
    on delete cascade,

  requested_by uuid not null
    references auth.users(id)
    on delete cascade,

  home_assistant_entity_id text not null,

  domain text not null,
  service text not null,

  status text not null default 'pending'
    check (
      status in (
        'pending',
        'claimed',
        'succeeded',
        'failed',
        'expired',
        'cancelled'
      )
    ),

  service_data jsonb not null default '{}'::jsonb,

  claimed_at timestamptz,
  completed_at timestamptz,
  expires_at timestamptz not null
    default (now() + interval '2 minutes'),

  error_message text,
  result jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint home_assistant_commands_safe_domain
    check (
      domain in (
        'light',
        'switch'
      )
    ),

  constraint home_assistant_commands_safe_service
    check (
      service in (
        'turn_on',
        'turn_off'
      )
    ),

  constraint home_assistant_commands_entity_id_length
    check (
      char_length(home_assistant_entity_id)
      between 3 and 255
    ),

  constraint home_assistant_commands_service_data_object
    check (
      jsonb_typeof(service_data) = 'object'
    )
);

create index if not exists
  home_assistant_commands_household_created_idx
on public.home_assistant_commands (
  household_id,
  created_at desc
);

create index if not exists
  home_assistant_commands_connector_pending_idx
on public.home_assistant_commands (
  connector_id,
  status,
  created_at asc
);

create index if not exists
  home_assistant_commands_entity_created_idx
on public.home_assistant_commands (
  entity_id,
  created_at desc
);

alter table public.home_assistant_commands
  enable row level security;

drop policy if exists
  "Household members can view Home Assistant commands"
on public.home_assistant_commands;

create policy
  "Household members can view Home Assistant commands"
on public.home_assistant_commands
for select
using (
  public.can_household_read(household_id)
);

comment on table public.home_assistant_commands is
  'Short-lived Home Assistant commands created by the website and executed locally by an authenticated Home Tech Vault Connector.';

comment on column public.home_assistant_commands.service_data is
  'Validated low-risk Home Assistant service data. Arbitrary browser payloads must not be stored without server-side validation.';

comment on column public.home_assistant_commands.expires_at is
  'Commands expire quickly so stale controls are never executed later.';
