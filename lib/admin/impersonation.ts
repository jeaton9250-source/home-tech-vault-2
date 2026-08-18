import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

import { cookies } from "next/headers";

import { createAdminClient } from "@/lib/supabase/admin";

export const IMPERSONATION_COOKIE =
  "htv_admin_impersonation";

export const IMPERSONATION_MAX_AGE_SECONDS =
  30 * 60;

export const IMPERSONATION_RATE_LIMIT_COUNT = 10;
export const IMPERSONATION_RATE_LIMIT_WINDOW_SECONDS =
  10 * 60;

type StoredAdminSession = {
  accessToken: string;
  refreshToken: string;
};

export type ServerImpersonationSession = {
  id: string;

  adminUserId: string;
  adminEmail: string | null;

  targetUserId: string;
  targetEmail: string | null;
  targetName: string | null;

  status:
    | "pending"
    | "active"
    | "ended"
    | "failed"
    | "revoked"
    | "expired";

  startedAt: string;
  expiresAt: string;

  adminAccessToken: string;
  adminRefreshToken: string;
};

function getEncryptionKey() {
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

export function createOpaqueImpersonationToken() {
  return randomBytes(32).toString("base64url");
}

export function hashImpersonationToken(
  token: string
) {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

export function encryptAdminSession(
  payload: StoredAdminSession
) {
  const key = getEncryptionKey();
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

  const authTag = cipher.getAuthTag();

  return [
    "v1",
    iv.toString("base64url"),
    authTag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

export function decryptAdminSession(
  encryptedValue: string
): StoredAdminSession | null {
  try {
    const [
      version,
      ivPart,
      authTagPart,
      ciphertextPart,
    ] = encryptedValue.split(".");

    if (
      version !== "v1" ||
      !ivPart ||
      !authTagPart ||
      !ciphertextPart
    ) {
      return null;
    }

    const decipher = createDecipheriv(
      "aes-256-gcm",
      getEncryptionKey(),
      Buffer.from(ivPart, "base64url")
    );

    decipher.setAuthTag(
      Buffer.from(
        authTagPart,
        "base64url"
      )
    );

    const plaintext = Buffer.concat([
      decipher.update(
        Buffer.from(
          ciphertextPart,
          "base64url"
        )
      ),
      decipher.final(),
    ]);

    const parsed = JSON.parse(
      plaintext.toString("utf8")
    ) as StoredAdminSession;

    if (
      !parsed.accessToken ||
      !parsed.refreshToken
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function setImpersonationCookie(
  opaqueToken: string
) {
  const cookieStore = await cookies();

  cookieStore.set(
    IMPERSONATION_COOKIE,
    opaqueToken,
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite: "strict",
      path: "/",
      maxAge:
        IMPERSONATION_MAX_AGE_SECONDS,
    }
  );
}

export async function clearImpersonationCookie() {
  const cookieStore = await cookies();

  cookieStore.set(
    IMPERSONATION_COOKIE,
    "",
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    }
  );
}

export async function getServerImpersonationSession():
  Promise<ServerImpersonationSession | null> {
  const cookieStore = await cookies();

  const opaqueToken =
    cookieStore.get(
      IMPERSONATION_COOKIE
    )?.value;

  if (!opaqueToken) {
    return null;
  }

  const admin = createAdminClient();

  const tokenHash =
    hashImpersonationToken(
      opaqueToken
    );

  const {
    data: row,
    error,
  } = await admin
    .from(
      "admin_impersonation_sessions"
    )
    .select(
      `
        id,
        admin_user_id,
        target_user_id,
        admin_email_snapshot,
        target_email_snapshot,
        target_name_snapshot,
        encrypted_admin_session,
        status,
        started_at,
        expires_at
      `
    )
    .eq("token_hash", tokenHash)
    .in("status", [
      "pending",
      "active",
    ])
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!row) {
    await clearImpersonationCookie();
    return null;
  }

  const expiresAtMs =
    new Date(
      row.expires_at
    ).getTime();

  if (
    !Number.isFinite(expiresAtMs) ||
    Date.now() >= expiresAtMs
  ) {
    await admin
      .from(
        "admin_impersonation_sessions"
      )
      .update({
        status: "expired",
        ended_at:
          new Date().toISOString(),
      })
      .eq("id", row.id)
      .in("status", [
        "pending",
        "active",
      ]);

    await clearImpersonationCookie();

    return null;
  }

  const decrypted =
    decryptAdminSession(
      row.encrypted_admin_session
    );

  if (!decrypted) {
    await admin
      .from(
        "admin_impersonation_sessions"
      )
      .update({
        status: "revoked",
        failure_reason:
          "Unable to decrypt administrator recovery session.",
        ended_at:
          new Date().toISOString(),
      })
      .eq("id", row.id);

    await clearImpersonationCookie();

    return null;
  }

  return {
    id: row.id,

    adminUserId:
      row.admin_user_id,
    adminEmail:
      row.admin_email_snapshot,

    targetUserId:
      row.target_user_id,
    targetEmail:
      row.target_email_snapshot,
    targetName:
      row.target_name_snapshot,

    status: row.status,

    startedAt:
      row.started_at,
    expiresAt:
      row.expires_at,

    adminAccessToken:
      decrypted.accessToken,
    adminRefreshToken:
      decrypted.refreshToken,
  };
}

export async function assertImpersonationRateLimit(
  adminUserId: string
) {
  const admin = createAdminClient();

  const cutoff =
    new Date(
      Date.now() -
        IMPERSONATION_RATE_LIMIT_WINDOW_SECONDS *
          1000
    ).toISOString();

  const {
    count,
    error,
  } = await admin
    .from(
      "admin_impersonation_sessions"
    )
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq(
      "admin_user_id",
      adminUserId
    )
    .gte(
      "created_at",
      cutoff
    );

  if (error) {
    throw error;
  }

  if (
    (count ?? 0) >=
    IMPERSONATION_RATE_LIMIT_COUNT
  ) {
    throw new Error(
      "IMPERSONATION_RATE_LIMITED"
    );
  }
}

export function assertSameOrigin(
  request: Request
) {
  const origin =
    request.headers.get("origin");

  const expectedOrigin =
    new URL(request.url).origin;

  if (
    !origin ||
    origin !== expectedOrigin
  ) {
    throw new Error(
      "INVALID_ORIGIN"
    );
  }
}
