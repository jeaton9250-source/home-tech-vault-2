
import "server-only";

import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

function getSecret() {
  const secret =
    process.env.LIFECYCLE_EMAIL_SECRET?.trim();

  if (!secret) {
    throw new Error(
      "LIFECYCLE_EMAIL_SECRET is required."
    );
  }

  return secret;
}

function payload(
  userId: string,
  email: string
) {
  return [
    "monthly",
    userId,
    email.trim().toLowerCase(),
  ].join(":");
}

export function createMonthlyUnsubscribeSignature(
  userId: string,
  email: string
) {
  return createHmac(
    "sha256",
    getSecret()
  )
    .update(
      payload(userId, email)
    )
    .digest("hex");
}

export function verifyMonthlyUnsubscribeSignature(
  userId: string,
  email: string,
  signature: string
) {
  const expected =
    createMonthlyUnsubscribeSignature(
      userId,
      email
    );

  const a = Buffer.from(
    expected,
    "utf8"
  );

  const b = Buffer.from(
    signature,
    "utf8"
  );

  return (
    a.length === b.length &&
    timingSafeEqual(a, b)
  );
}

export function createMonthlyUnsubscribeUrl(input: {
  appUrl: string;
  userId: string;
  email: string;
}) {
  const sig =
    createMonthlyUnsubscribeSignature(
      input.userId,
      input.email
    );

  const params =
    new URLSearchParams({
      uid: input.userId,
      email: input.email,
      sig,
    });

  return (
    `${input.appUrl}` +
    `/api/email/monthly-unsubscribe?` +
    params.toString()
  );
}
