import {
  generatePairingCode,
  getPairingExpiresAt,
  hashPairingCode,
} from "@/lib/connector/pairing";
import { requireIosHouseholdContext } from "@/lib/ios-api/auth";
import { connectorCodeHint } from "@/lib/ios-api/connectors";
import { iosErrorResponse, iosInternalError, iosJson } from "@/lib/ios-api/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type InitRequestBody = {
  household_id?: string;
  platform?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as InitRequestBody;
    const context = await requireIosHouseholdContext(request, body.household_id, {
      requirePaid: true,
      requireAdmin: true,
    });

    const nowIso = new Date().toISOString();
    const { error: invalidateError } = await context.admin
      .from("connector_pairing_sessions")
      .update({ consumed_at: nowIso })
      .eq("household_id", context.householdId)
      .is("consumed_at", null);

    if (invalidateError) {
      throw invalidateError;
    }

    const { readable, normalized } = generatePairingCode();
    const expiresAt = getPairingExpiresAt();

    const { data: session, error } = await context.admin
      .from("connector_pairing_sessions")
      .insert({
        household_id: context.householdId,
        created_by_user_id: context.userId,
        code_hash: hashPairingCode(normalized),
        expires_at: expiresAt.toISOString(),
      })
      .select("id, expires_at")
      .single();

    if (error) {
      throw error;
    }

    return iosJson(
      {
        pairing_session: {
          id: session.id,
          code: readable,
          code_hint: connectorCodeHint(readable),
          status: "waiting",
          expires_at: session.expires_at,
          poll_after_seconds: 3,
        },
        download: {
          macos_url:
            process.env.NEXT_PUBLIC_CONNECTOR_MACOS_DOWNLOAD_URL?.trim() ||
            "https://hometechvault.com/downloads/mac",
          windows_url: null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return iosErrorResponse(error) ?? iosInternalError("pair init", error);
  }
}
