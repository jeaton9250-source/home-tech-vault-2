import "server-only";

import {
  createHash,
  randomBytes,
  timingSafeEqual,
} from "crypto";

/**
 * Create an opaque connector token for one-time display.
 * Never log or persist the returned value.
 */
export function generateConnectorToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashConnectorToken(
  token: string
): string {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

export function tokensMatch(
  providedToken: string,
  storedHash: string | null | undefined
): boolean {
  if (!storedHash) {
    return false;
  }

  const providedHash =
    hashConnectorToken(providedToken);

  const providedBuffer = Buffer.from(
    providedHash,
    "hex"
  );

  const storedBuffer = Buffer.from(
    storedHash,
    "hex"
  );

  if (
    providedBuffer.length !==
    storedBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(
    providedBuffer,
    storedBuffer
  );
}
