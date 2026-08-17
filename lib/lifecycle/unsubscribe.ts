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
      "Missing LIFECYCLE_EMAIL_SECRET."
    );
  }

  return secret;
}

function payload(
  userId: string,
  email: string
) {
  return `${userId}:${email.trim().toLowerCase()}`;
}

export function createUnsubscribeSignature(
  userId: string,
  email: string
) {
  return createHmac(
    "sha256",
    getSecret()
  )
    .update(payload(userId, email))
    .digest("hex");
}

export function verifyUnsubscribeSignature(
  userId: string,
  email: string,
  signature: string
) {
  const expected =
    createUnsubscribeSignature(
      userId,
      email
    );

  const left = Buffer.from(expected);
  const right = Buffer.from(signature);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

export function createUnsubscribeUrl(input: {
  appUrl: string;
  userId: string;
  email: string;
}) {
  const signature =
    createUnsubscribeSignature(
      input.userId,
      input.email
    );

  const url = new URL(
    "/api/email/unsubscribe",
    input.appUrl
  );

  url.searchParams.set(
    "uid",
    input.userId
  );

  url.searchParams.set(
    "email",
    input.email
  );

  url.searchParams.set(
    "sig",
    signature
  );

  return url.toString();
}
