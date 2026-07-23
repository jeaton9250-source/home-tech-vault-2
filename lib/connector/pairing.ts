import "server-only";

import {
  createHash,
  randomInt,
} from "crypto";

import type { ConnectorPairingSessionRow } from "@/lib/connector/types";

export const PAIRING_CODE_TTL_MS = 10 * 60 * 1000;

const PAIRING_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ";

function getPairingPepper(): string {
  return (
    process.env.CONNECTOR_PAIRING_PEPPER?.trim() ??
    ""
  );
}

/**
 * Normalize a user-entered pairing code for hashing and lookup.
 * Strips separators and uppercases letters.
 */
export function normalizePairingCode(
  value: string
): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "");
}

/**
 * Format normalized code as ABCD-1234 for display.
 */
export function formatPairingCode(
  normalized: string
): string {
  const compact = normalizePairingCode(
    normalized
  );

  if (compact.length !== 8) {
    return compact;
  }

  return (
    compact.slice(0, 4) +
    "-" +
    compact.slice(4)
  );
}

function randomLetters(count: number): string {
  let result = "";

  for (let index = 0; index < count; index += 1) {
    result +=
      PAIRING_ALPHABET[
        randomInt(PAIRING_ALPHABET.length)
      ];
  }

  return result;
}

function randomDigits(count: number): string {
  let result = "";

  for (let index = 0; index < count; index += 1) {
    result += String(randomInt(10));
  }

  return result;
}

/**
 * Generate a human-readable pairing code (ABCD-1234).
 * Never log or persist the returned value.
 */
export function generatePairingCode(): {
  readable: string;
  normalized: string;
} {
  const normalized =
    randomLetters(4) + randomDigits(4);

  return {
    normalized,
    readable: formatPairingCode(normalized),
  };
}

export function hashPairingCode(
  normalizedCode: string
): string {
  const pepper = getPairingPepper();

  return createHash("sha256")
    .update(`${pepper}:${normalizedCode}`)
    .digest("hex");
}

export function getPairingExpiresAt(
  now = Date.now()
): Date {
  return new Date(now + PAIRING_CODE_TTL_MS);
}

export function isPairingSessionUsable(
  session: Pick<
    ConnectorPairingSessionRow,
    "expires_at" | "consumed_at"
  >,
  now = Date.now()
): boolean {
  if (session.consumed_at) {
    return false;
  }

  const expiresAt = new Date(
    session.expires_at
  ).getTime();

  return (
    Number.isFinite(expiresAt) &&
    expiresAt > now
  );
}

export function assertPairingSessionUsable(
  session: Pick<
    ConnectorPairingSessionRow,
    "expires_at" | "consumed_at"
  >
): void {
  if (session.consumed_at) {
    throw new PairingValidationError(
      "CONSUMED",
      "This pairing code has already been used."
    );
  }

  if (!isPairingSessionUsable(session)) {
    throw new PairingValidationError(
      "EXPIRED",
      "This pairing code has expired."
    );
  }
}

export class PairingValidationError extends Error {
  readonly code: "INVALID" | "EXPIRED" | "CONSUMED";

  constructor(
    code: "INVALID" | "EXPIRED" | "CONSUMED",
    message: string
  ) {
    super(message);
    this.code = code;
  }
}

export function pairingValidationResponse(
  error: unknown
) {
  if (error instanceof PairingValidationError) {
    if (error.code === "INVALID") {
      return {
        status: 400,
        message: error.message,
      };
    }

    return {
      status: 410,
      message: error.message,
    };
  }

  return null;
}
