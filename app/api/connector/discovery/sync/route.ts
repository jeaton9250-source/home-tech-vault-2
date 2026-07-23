import {
  DiscoveryValidationError,
  parseDiscoverySyncPayload,
} from "@/lib/connector/discoveryValidation";
import { upsertDiscoveredDevices } from "@/lib/connector/discoveryUpsert";
import { syncDiscoveredDevicesWithMatching } from "@/lib/connector/discoverySync";
import {
  connectorErrorResponse,
  connectorJsonResponse,
  connectorServerErrorResponse,
} from "@/lib/connector/responses";
import {
  connectorSessionResponse,
  requireConnectorSession,
} from "@/lib/connector/requireConnectorSession";
import { createAdminClient } from "@/lib/supabase/admin";

import type { DiscoverySyncRequestBody } from "@/lib/connector/discoveryValidation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session =
      await requireConnectorSession(request);

    const body =
      (await request.json()) as DiscoverySyncRequestBody;

    const nowIso = new Date().toISOString();
    const payload = parseDiscoverySyncPayload(
      body,
      nowIso
    );

    const admin = createAdminClient();

    const runMatching =
      body.runMatching === true;

    const result = runMatching
      ? await syncDiscoveredDevicesWithMatching({
          admin,
          connectorId: session.connectorId,
          householdId: session.householdId,
          scannedAt: payload.scannedAt,
          devices: payload.devices,
        })
      : await upsertDiscoveredDevices({
          admin,
          connectorId: session.connectorId,
          householdId: session.householdId,
          scannedAt: payload.scannedAt,
          devices: payload.devices,
        });

    return connectorJsonResponse(result);
  } catch (error) {
    if (error instanceof DiscoveryValidationError) {
      return connectorErrorResponse(
        error.message,
        400
      );
    }

    const sessionResponse =
      connectorSessionResponse(error);

    if (sessionResponse) {
      return connectorErrorResponse(
        sessionResponse.message,
        sessionResponse.status
      );
    }

    console.error(
      "Connector discovery sync error:",
      error instanceof Error
        ? error.message
        : error
    );

    return connectorServerErrorResponse();
  }
}
