import {
  createHash,
  randomBytes,
} from "node:crypto";

import { createAdminClient } from "@/lib/supabase/admin";

const TRANSFER_LIFETIME_DAYS = 14;

export function createOwnershipTransferToken() {
  return randomBytes(32).toString("base64url");
}

export function hashOwnershipTransferToken(
  token: string
) {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

export function normalizeTransferEmail(
  email: string
) {
  return email.trim().toLowerCase();
}

export function ownershipTransferExpiresAt() {
  const value = new Date();

  value.setDate(
    value.getDate() +
      TRANSFER_LIFETIME_DAYS
  );

  return value;
}

export async function loadOwnershipTransferByToken(
  token: string
) {
  const admin =
    createAdminClient();

  const tokenHash =
    hashOwnershipTransferToken(token);

  const {
    data,
    error,
  } = await admin
    .from("household_ownership_transfers")
    .select(
      `
        id,
        household_id,
        gift_id,
        from_user_id,
        to_email,
        status,
        realtor_access_after_transfer,
        expires_at,
        accepted_at,
        created_at,
        realtor_vault_gifts (
          id,
          buyer_email,
          buyer_first_name,
          buyer_last_name,
          property_address_line1,
          property_address_line2,
          property_city,
          property_state,
          property_postal_code,
          gift_plan,
          gift_duration_months,
          gift_expires_at,
          status
        )
      `
    )
    .eq(
      "token_hash",
      tokenHash
    )
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function acceptOwnershipTransfer(
  input: {
    token: string;
    userId: string;
    email: string;
  }
) {
  const admin =
    createAdminClient();

  const {
    data,
    error,
  } = await admin.rpc(
    "accept_realtor_household_transfer",
    {
      p_token_hash:
        hashOwnershipTransferToken(
          input.token
        ),
      p_accepting_user_id:
        input.userId,
      p_accepting_email:
        normalizeTransferEmail(
          input.email
        ),
    }
  );

  if (error) {
    throw error;
  }

  const result =
    Array.isArray(data)
      ? data[0]
      : data;

  if (!result) {
    throw new Error(
      "Ownership transfer completed without a result."
    );
  }

  return result;
}
