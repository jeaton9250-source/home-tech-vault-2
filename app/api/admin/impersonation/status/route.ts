import { NextResponse } from "next/server";

import {
  clearImpersonationCookie,
  getServerImpersonationSession,
} from "@/lib/admin/impersonation";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  createClient,
} from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function privateJson(
  body: unknown,
  init: ResponseInit = {}
) {
  const headers = new Headers(init.headers);

  headers.set(
    "Cache-Control",
    "private, no-store, max-age=0"
  );

  headers.set("Pragma", "no-cache");

  return NextResponse.json(body, {
    ...init,
    headers,
  });
}


export async function GET() {
  try {
    const recovery =
      await getServerImpersonationSession();

    if (!recovery) {
      return privateJson({
        active: false,
      });
    }

    const supabase =
      await createClient();

    const {
      data: { user },
    } =
      await supabase.auth.getUser();

    if (
      !user ||
      user.id !==
        recovery.targetUserId
    ) {
      const admin =
        createAdminClient();

      await admin
        .from(
          "admin_impersonation_sessions"
        )
        .update({
          status: "revoked",
          failure_reason:
            "Authenticated session no longer matched impersonation target.",
          ended_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          recovery.id
        )
        .in("status", [
          "pending",
          "active",
        ]);

      await clearImpersonationCookie();

      return privateJson({
        active: false,
      });
    }

    /*
     * Recover from an unlikely crash after
     * Supabase auth switched but before the
     * start route promoted pending -> active.
     */
    if (
      recovery.status ===
      "pending"
    ) {
      const admin =
        createAdminClient();

      await admin
        .from(
          "admin_impersonation_sessions"
        )
        .update({
          status: "active",
        })
        .eq(
          "id",
          recovery.id
        )
        .eq(
          "status",
          "pending"
        );
    }

    return privateJson({
      active: true,
      label:
        recovery.targetName?.trim() ||
        recovery.targetEmail ||
        "this user",

expiresAt:
        new Date(
          recovery.expiresAt
        ).getTime(),
    });
  } catch (error) {
    console.error(
      "Unable to read impersonation state:",
      error
    );

    return privateJson({
      active: false,
    });
  }
}
