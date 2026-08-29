CREATE OR REPLACE FUNCTION public.remove_realtor_client_vault(
  p_gift_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_household_id uuid;
  v_status text;
  v_address text;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'NOT_AUTHENTICATED'
      USING ERRCODE = '42501';
  END IF;

  SELECT
    household_id,
    status,
    property_address_line1
  INTO
    v_household_id,
    v_status,
    v_address
  FROM public.realtor_vault_gifts
  WHERE id = p_gift_id
    AND realtor_user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'CLIENT_VAULT_NOT_FOUND'
      USING ERRCODE = 'P0002';
  END IF;

  IF v_status = 'claimed' THEN
    RAISE EXCEPTION 'CLIENT_VAULT_ALREADY_CLAIMED'
      USING ERRCODE = '42501';
  END IF;

  IF v_household_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM public.households
      WHERE id = v_household_id
        AND owner_id = v_user_id
    ) THEN
      RAISE EXCEPTION 'CLIENT_VAULT_NOT_OWNED'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  /*
   * Delete the Realtor gift first.
   *
   * This entire function executes transactionally. If an FK
   * or the later household deletion fails, PostgreSQL rolls
   * the whole operation back rather than leaving half a Vault.
   */
  DELETE FROM public.realtor_vault_gifts
  WHERE id = p_gift_id
    AND realtor_user_id = v_user_id;

  IF v_household_id IS NOT NULL THEN
    DELETE FROM public.households
    WHERE id = v_household_id
      AND owner_id = v_user_id;
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'giftId', p_gift_id,
    'householdId', v_household_id,
    'address', v_address
  );
END;
$$;

REVOKE ALL
ON FUNCTION public.remove_realtor_client_vault(uuid)
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.remove_realtor_client_vault(uuid)
TO authenticated;
