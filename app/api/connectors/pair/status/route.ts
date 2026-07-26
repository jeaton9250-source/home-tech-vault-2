import { requireIosHouseholdContext } from "@/lib/ios-api/auth";
import { mapConnectorStatus } from "@/lib/ios-api/connectors";
import { IosApiError, iosErrorResponse, iosInternalError, iosJson } from "@/lib/ios-api/errors";

import type { ConnectorInstallationRow } from "@/lib/connector/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("session_id")?.trim();

    if (!sessionId) {
      throw new IosApiError("VALIDATION_FAILED", "session_id is required.", 422);
    }

    const admin = await import("@/lib/supabase/admin").then((module) => module.createAdminClient());
    const { data: session, error } = await admin
      .from("connector_pairing_sessions")
      .select("id, household_id, expires_at, consumed_at, installation_id")
      .eq("id", sessionId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!session) {
      throw new IosApiError("PAIRING_NOT_FOUND", "Pairing session was not found.", 404);
    }

    await requireIosHouseholdContext(request, session.household_id, { requirePaid: true });

    let status: "waiting" | "paired" | "expired" | "canceled" | "failed" = "waiting";
    if (session.installation_id) {
      status = "paired";
    } else if (session.consumed_at) {
      status = "canceled";
    } else if (new Date(session.expires_at).getTime() <= Date.now()) {
      status = "expired";
    }

    let connector: Record<string, unknown> | undefined;

    if (session.installation_id) {
      const { data: installation, error: installationError } = await admin
        .from("connector_installations")
        .select("id, household_id, created_by_user_id, name, platform, app_version, status, token_hash, last_seen_at, last_scan_at, revoked_at, created_at, updated_at")
        .eq("id", session.installation_id)
        .maybeSingle();

      if (installationError) {
        throw installationError;
      }

      if (installation) {
        const row = installation as ConnectorInstallationRow;
        connector = {
          id: row.id,
          name: row.name,
          platform: row.platform,
          status: mapConnectorStatus(row),
          paired_at: row.created_at,
        };
      }
    }

    return iosJson({
      pairing_session: {
        id: session.id,
        status,
        expires_at: session.expires_at,
        installation_id: session.installation_id,
      },
      ...(connector ? { connector } : {}),
    });
  } catch (error) {
    return iosErrorResponse(error) ?? iosInternalError("pair status", error);
  }
}
