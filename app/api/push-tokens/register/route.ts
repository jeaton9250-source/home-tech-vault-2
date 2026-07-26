import { createAdminClient } from "@/lib/supabase/admin";
import { requireIosUser } from "@/lib/ios-api/auth";
import { IosApiError, iosErrorResponse, iosInternalError, iosJson } from "@/lib/ios-api/errors";
import { hashPushToken, normalizeApnsToken } from "@/lib/push/tokenHashing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RegisterBody = {
  token?: string;
  installation_id?: string;
  platform?: string;
  environment?: string;
  bundle_id?: string;
};

function validateBody(body: RegisterBody) {
  const token = normalizeApnsToken(body.token ?? "");
  const installationId = body.installation_id?.trim() ?? "";
  const environment = body.environment?.trim() === "production" ? "production" : "sandbox";
  const platform = body.platform?.trim().toLowerCase() ?? "ios";
  const bundleId = body.bundle_id?.trim() ?? process.env.APNS_BUNDLE_ID?.trim() ?? null;

  if (!/^[a-f0-9]{32,512}$/.test(token)) {
    throw new IosApiError("VALIDATION_FAILED", "A valid APNs token is required.", 422);
  }
  if (!installationId || installationId.length > 120) {
    throw new IosApiError("VALIDATION_FAILED", "A valid installation_id is required.", 422);
  }
  if (platform !== "ios") {
    throw new IosApiError("VALIDATION_FAILED", "platform must be ios.", 422);
  }
  if (!bundleId || bundleId.length > 160) {
    throw new IosApiError("VALIDATION_FAILED", "A valid bundle_id is required.", 422);
  }

  return { token, installationId, environment, platform, bundleId };
}

export async function POST(request: Request) {
  try {
    const admin = createAdminClient();
    const user = await requireIosUser(request, admin);
    const parsed = validateBody((await request.json()) as RegisterBody);
    const tokenHash = hashPushToken(parsed.token);
    const nowIso = new Date().toISOString();

    const { data, error } = await admin
      .from("device_push_tokens")
      .upsert(
        {
          user_id: user.id,
          installation_id: parsed.installationId,
          token_hash: tokenHash,
          token_ciphertext: parsed.token,
          environment: parsed.environment,
          platform: parsed.platform,
          bundle_id: parsed.bundleId,
          active: true,
          last_seen_at: nowIso,
          updated_at: nowIso,
        },
        { onConflict: "user_id,installation_id" }
      )
      .select("id")
      .single();

    if (error) throw error;

    return iosJson({ registered: true, token_id: data.id });
  } catch (error) {
    return iosErrorResponse(error) ?? iosInternalError("register push token", error);
  }
}
