-- Ensure every Supabase Auth user has a matching public.profiles row.

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  resolved_first_name text;
  resolved_last_name text;
  resolved_full_name text;
  resolved_household_name text;
BEGIN
  resolved_first_name :=
    nullif(
      trim(new.raw_user_meta_data ->> 'first_name'),
      ''
    );

  resolved_last_name :=
    nullif(
      trim(new.raw_user_meta_data ->> 'last_name'),
      ''
    );

  resolved_full_name :=
    coalesce(
      nullif(
        trim(new.raw_user_meta_data ->> 'full_name'),
        ''
      ),
      nullif(
        trim(
          concat_ws(
            ' ',
            resolved_first_name,
            resolved_last_name
          )
        ),
        ''
      ),
      split_part(
        coalesce(new.email, ''),
        '@',
        1
      )
    );

  resolved_household_name :=
    nullif(
      trim(new.raw_user_meta_data ->> 'household_name'),
      ''
    );

  INSERT INTO public.profiles (
    id,
    full_name,
    household_name,
    account_status,
    created_at
  )
  VALUES (
    new.id,
    resolved_full_name,
    resolved_household_name,
    'active',
    coalesce(new.created_at, now())
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = coalesce(
      public.profiles.full_name,
      excluded.full_name
    ),
    household_name = coalesce(
      public.profiles.household_name,
      excluded.household_name
    );

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created
  ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

INSERT INTO public.profiles (
  id,
  full_name,
  household_name,
  account_status,
  created_at
)
SELECT
  au.id,
  coalesce(
    nullif(
      trim(au.raw_user_meta_data ->> 'full_name'),
      ''
    ),
    nullif(
      trim(
        concat_ws(
          ' ',
          nullif(
            trim(au.raw_user_meta_data ->> 'first_name'),
            ''
          ),
          nullif(
            trim(au.raw_user_meta_data ->> 'last_name'),
            ''
          )
        )
      ),
      ''
    ),
    split_part(
      coalesce(au.email, ''),
      '@',
      1
    )
  ),
  nullif(
    trim(au.raw_user_meta_data ->> 'household_name'),
    ''
  ),
  'active',
  coalesce(au.created_at, now())
FROM auth.users au
LEFT JOIN public.profiles p
  ON p.id = au.id
WHERE p.id IS NULL;

CREATE INDEX IF NOT EXISTS profiles_created_at_idx
  ON public.profiles (created_at DESC);

COMMENT ON FUNCTION public.handle_new_auth_user() IS
  'Creates or merges a public.profiles row whenever a Supabase Auth user is created.';
