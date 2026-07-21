import "server-only";

import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type PlatformAdminSession = {
  userId: string;
  email: string | null;
};

export class PlatformAdminAccessError extends Error {
  readonly code: "UNAUTHORIZED" | "FORBIDDEN";

  constructor(code: "UNAUTHORIZED" | "FORBIDDEN") {
    super(code);
    this.code = code;
  }
}

/**
 * Resolve platform-admin access from the authenticated Supabase session.
 * Source of truth: `profiles.is_admin` on the current user only.
 * Household roles and development-access overrides are intentionally ignored.
 */
export async function getPlatformAdminSession(): Promise<PlatformAdminSession | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (profile?.is_admin !== true) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email ?? null,
  };
}

export async function requirePlatformAdminSession(): Promise<PlatformAdminSession> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new PlatformAdminAccessError(
      "UNAUTHORIZED"
    );
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (profile?.is_admin !== true) {
    throw new PlatformAdminAccessError(
      "FORBIDDEN"
    );
  }

  return {
    userId: user.id,
    email: user.email ?? null,
  };
}

export async function requirePlatformAdminPage(): Promise<PlatformAdminSession> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    redirect("/login");
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (profile?.is_admin !== true) {
    notFound();
  }

  return {
    userId: user.id,
    email: user.email ?? null,
  };
}

export function platformAdminAccessResponse(
  error: unknown
) {
  if (
    error instanceof PlatformAdminAccessError
  ) {
    if (error.code === "UNAUTHORIZED") {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return Response.json(
      { error: "Not found" },
      { status: 404 }
    );
  }

  return null;
}
