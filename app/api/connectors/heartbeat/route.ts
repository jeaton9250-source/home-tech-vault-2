import {
  HeartbeatValidationError,
  parseHeartbeatPayload,
} from "@/lib/connector/heartbeatValidation";
import { checkConnectorHeartbeatRateLimit } from "@/lib/connector/heartbeatRateLimit";
import { connectorSessionResponse, requireConnectorSession } from "@/lib/connector/requireConnectorSession";
import { createAdminClient } from "@/lib/supabase/admin";
import { iosError, iosInternalError, iosJson } from "@/lib/ios-api/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IosHeartbeatBody = {
  app_version?: string;
  platform?: string;
  hostname?: string;
  health?: {
    warnings?: string[];
  };
};

export async function POST(request: Request) {
  try {
    const session = await requireConnectorSession(request);

    if (!checkConnectorHeartbeatRateLimit(session.connectorId)) {
      return iosError("BACKEND_UNAVAILABLE", "Too many heartbeat requests.", 429);
    }

    const body = (await request.json()) as IosHeartbeatBody;
    const payload = parseHeartbeatPayload({
      appVersion: body.app_version,
      platform: body.platform,
      deviceName: body.hostname ?? session.installation.name,
    });
    const nowIso = new Date().toISOString();
    const admin = createAdminClient();

    const { error } = await admin
      .from("connector_installations")
      .update({
        last_seen_at: nowIso,
        app_version: payload.appVersion,
        platform: payload.platform,
        updated_at: nowIso,
      })
      .eq("id", session.connectorId)
      .eq("status", "active")
      .is("revoked_at", null);

    if (error) {
      throw error;
    }

    return iosJson({
      ok: true,
      connector: {
        id: session.connectorId,
        status: "online",
        server_received_at: nowIso,
      },
      commands: [],
    });
  } catch (error) {
    if (error instanceof HeartbeatValidationError) {
      return iosError("VALIDATION_FAILED", error.message, 422);
    }

    const sessionResponse = connectorSessionResponse(error);
    if (sessionResponse) {
      return iosError("CONNECTOR_REVOKED", "Connector authorization is no longer valid.", 410);
    }

    return iosInternalError("connector heartbeat", error);
  }
}
