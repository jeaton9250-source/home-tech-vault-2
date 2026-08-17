import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

import { cookies } from "next/headers";

export const IMPERSONATION_COOKIE =
  "htv_admin_impersonation";

export const IMPERSONATION_MAX_AGE_SECONDS = 30 * 60;

export type ImpersonationRecovery = {
  adminUserId: string;
  adminEmail: string | null;
  adminAccessToken: string;
  adminRefreshToken: string;

  targetUserId: string;
  targetEmail: string | null;
  targetName: string | null;

  issuedAt: number;
  expiresAt: number;
};

function getSecret() {
  const secret =
    process.env.ADMIN_IMPERSONATION_SECRET?.trim();

  if (!secret) {
    throw new Error(
      "Missing ADMIN_IMPERSONATION_SECRET environment variable."
    );
  }

  return createHash("sha256")
    .update(secret)
    .digest();
}

export function encryptImpersonationRecovery(
  payload: ImpersonationRecovery
) {
  const key = getSecret();
  const iv = randomBytes(12);

  const cipher = createCipheriv(
    "aes-256-gcm",
    key,
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(
      JSON.stringify(payload),
      "utf8"
    ),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return [
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

export function decryptImpersonationRecovery(
  value: string
): ImpersonationRecovery | null {
  try {
    const [ivPart, tagPart, dataPart] =
      value.split(".");

    if (!ivPart || !tagPart || !dataPart) {
      return null;
    }

    const key = getSecret();

    const decipher = createDecipheriv(
      "aes-256-gcm",
      key,
      Buffer.from(ivPart, "base64url")
    );

    decipher.setAuthTag(
      Buffer.from(tagPart, "base64url")
    );

    const decrypted = Buffer.concat([
      decipher.update(
        Buffer.from(dataPart, "base64url")
      ),
      decipher.final(),
    ]);

    const payload = JSON.parse(
      decrypted.toString("utf8")
    ) as ImpersonationRecovery;

    if (
      !payload.adminUserId ||
      !payload.adminAccessToken ||
      !payload.adminRefreshToken ||
      !payload.targetUserId ||
      !payload.expiresAt
    ) {
      return null;
    }

    if (Date.now() >= payload.expiresAt) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function getImpersonationRecovery() {
  const cookieStore = await cookies();

  const value = cookieStore.get(
    IMPERSONATION_COOKIE
  )?.value;

  if (!value) {
    return null;
  }

  return decryptImpersonationRecovery(value);
}

export async function setImpersonationRecovery(
  payload: ImpersonationRecovery
) {
  const cookieStore = await cookies();

  cookieStore.set(
    IMPERSONATION_COOKIE,
    encryptImpersonationRecovery(payload),
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge:
        IMPERSONATION_MAX_AGE_SECONDS,
    }
  );
}

export async function clearImpersonationRecovery() {
  const cookieStore = await cookies();

  cookieStore.set(
    IMPERSONATION_COOKIE,
    "",
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    }
  );
}

export function assertSameOrigin(
  request: Request
) {
  const origin =
    request.headers.get("origin");

  const expectedOrigin =
    new URL(request.url).origin;

  if (!origin || origin !== expectedOrigin) {
    throw new Error("INVALID_ORIGIN");
  }
}
