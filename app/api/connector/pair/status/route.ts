import {
  CONNECTOR_INSTALLATION_COLUMNS,
  toConnectorInstallationSummary,
} from "@/lib/connector/installations";
import {
  connectorErrorResponse,
  connectorJsonResponse,
  connectorServerErrorResponse,
} from "@/lib/connector/responses";
import {
  householdAccessResponse,
  requireHouseholdMember,
} from "@/lib/connector/requireHouseholdAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

import type {
  ConnectorInstallationRow,
} from "@/lib/connector/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const householdId =
      url.searchParams.get("householdId");

    const memberContext =
      await requireHouseholdMember(
        householdId
      );

    const admin = createAdminClient();

    const { data, error } = await admin
      .from("connector_installations")
      .select(CONNECTOR_INSTALLATION_COLUMNS)
      .eq(
        "household_id",
        memberContext.householdId
      )
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    const connectors = (
      (data ?? []) as ConnectorInstallationRow[]
    ).map(toConnectorInstallationSummary);

    return connectorJsonResponse({
      connectors,
    });
  } catch (error) {
    const accessResponse =
      householdAccessResponse(error);

    if (accessResponse) {
      return connectorErrorResponse(
        accessResponse.message,
        accessResponse.status
      );
    }

    console.error(
      "Connector pair status error:",
      error instanceof Error
        ? error.message
        : error
    );

    return connectorServerErrorResponse();
  }
}
