import "server-only";

import {
  createHash,
  randomInt,
} from "node:crypto";

const PAIRING_CODE_LENGTH = 8;
const PAIRING_LIFETIME_MS =
  10 * 60 * 1000;

export type AppleHomePairingStatus =
  | "pending"
  | "approved"
  | "expired"
  | "cancelled";

export function normalizeAppleHomePairingCode(
  value: string
): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export function hashAppleHomePairingCode(
  value: string
): string {
  const normalized =
    normalizeAppleHomePairingCode(value);

  return createHash("sha256")
    .update(normalized)
    .digest("hex");
}

export function generateAppleHomePairingCode() {
  /*
   * Avoid ambiguous characters:
   * I, O, 0, and 1 are excluded.
   */
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let normalized = "";

  for (
    let index = 0;
    index < PAIRING_CODE_LENGTH;
    index += 1
  ) {
    normalized +=
      alphabet[
        randomInt(0, alphabet.length)
      ];
  }

  return {
    normalized,
    readable: `${normalized.slice(
      0,
      4
    )}-${normalized.slice(4)}`,
  };
}

export function getAppleHomePairingExpiration() {
  return new Date(
    Date.now() + PAIRING_LIFETIME_MS
  );
}

export function resolveAppleHomePairingStatus(
  status: AppleHomePairingStatus,
  expiresAt: string
): AppleHomePairingStatus {
  if (
    status === "pending" &&
    new Date(expiresAt).getTime() <=
      Date.now()
  ) {
    return "expired";
  }

  return status;
}
