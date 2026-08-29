import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { isSafeUuid } from "@/lib/security/supabaseFilters";

export const CLIENT_VAULT_COOKIE =
  "htv_realtor_client_vault";

type StoredVault = {
  giftId: string;
  householdId: string;
};

export type ActiveClientVault = {
  giftId: string;
  householdId: string;
  label: string;
};

function parseVault(
  value: string | undefined
): StoredVault | null {
  if (!value) {
    return null;
  }

  const [giftId, householdId] =
    value.split(":");

  if (
    !giftId ||
    !householdId ||
    !isSafeUuid(giftId) ||
    !isSafeUuid(householdId)
  ) {
    return null;
  }

  return {
    giftId,
    householdId,
  };
}

export async function setClientVaultMode(
  giftId: string,
  householdId: string
) {
  const store = await cookies();

  store.set(
    CLIENT_VAULT_COOKIE,
    `${giftId}:${householdId}`,
    {
      httpOnly: true,
      sameSite: "lax",
      secure:
        process.env.NODE_ENV ===
        "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    }
  );
}

export async function clearClientVaultMode() {
  const store = await cookies();

  store.set(
    CLIENT_VAULT_COOKIE,
    "",
    {
      httpOnly: true,
      sameSite: "lax",
      secure:
        process.env.NODE_ENV ===
        "production",
      path: "/",
      expires: new Date(0),
    }
  );
}

export async function resolveActiveClientVault(
  admin: SupabaseClient,
  userId: string
): Promise<ActiveClientVault | null> {
  const store = await cookies();

  const stored = parseVault(
    store.get(
      CLIENT_VAULT_COOKIE
    )?.value
  );

  if (!stored) {
    return null;
  }

  const {
    data: gift,
    error: giftError,
  } = await admin
    .from("realtor_vault_gifts")
    .select(
      `
        id,
        household_id,
        realtor_user_id,
        property_address_line1,
        property_city,
        property_state,
        status
      `
    )
    .eq("id", stored.giftId)
    .eq(
      "realtor_user_id",
      userId
    )
    .eq(
      "household_id",
      stored.householdId
    )
    .neq("status", "claimed")
    .maybeSingle();

  if (giftError) {
    throw giftError;
  }

  if (
    !gift ||
    !gift.household_id
  ) {
    return null;
  }

  const {
    data: household,
    error: householdError,
  } = await admin
    .from("households")
    .select("id, owner_id")
    .eq(
      "id",
      gift.household_id
    )
    .eq(
      "owner_id",
      userId
    )
    .maybeSingle();

  if (householdError) {
    throw householdError;
  }

  if (!household) {
    return null;
  }

  const location = [
    gift.property_city,
    gift.property_state,
  ]
    .filter(Boolean)
    .join(", ");

  const address =
    gift.property_address_line1?.trim() ||
    "Client Home";

  return {
    giftId: gift.id,
    householdId:
      gift.household_id,
    label: location
      ? `${address} · ${location}`
      : address,
  };
}
