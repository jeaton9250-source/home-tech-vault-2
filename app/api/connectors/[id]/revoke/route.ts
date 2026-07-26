import { requireIosHouseholdContext } from "@/lib/ios-api/auth";
import { IosApiError, iosErrorResponse, iosInternalError, iosJson } from "@/lib/ios-api/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RevokeBody = {
  household_id?: string;
};

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as RevokeBody;
    const access = await requireIosHouseholdContext(request, body.household_id, {
      requirePaid: true,
      requireAdmin: true,
    });

    const { data: connector, error: lookupError } = await access.admin
      .from("connector_installations")
      .select("id, household_id, status")
      .eq("id", id)
      .maybeSingle();

    if (lookupError) {
      throw lookupError;
    }

    if (!connector || connector.household_id !== access.householdId) {
      throw new IosApiError("CONNECTOR_NOT_FOUND", "Connector not found.", 404);
    }

    const nowIso = new Date().toISOString();

    if (connector.status !== "revoked") {
      const { error } = await access.admin
        .from("connector_installations")
        .update({
          status: "revoked",
          revoked_at: nowIso,
          token_hash: null,
          updated_at: nowIso,
        })
        .eq("id", id)
        .eq("household_id", access.householdId);

      if (error) {
        throw error;
      }
    }

    return iosJson({
      connector: {
        id,
        status: "revoked",
        revoked_at: connector.status === "revoked" ? nowIso : nowIso,
      },
    });
  } catch (error) {
    return iosErrorResponse(error) ?? iosInternalError("revoke connector", error);
  }
}
