import { createAdminClient } from "@/lib/supabase/admin";
import { requireIosUser } from "@/lib/ios-api/auth";
import { IosApiError, iosErrorResponse, iosInternalError, iosJson } from "@/lib/ios-api/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DeactivateBody = { installation_id?: string };

export async function POST(request: Request) {
  try {
    const admin = createAdminClient();
    const user = await requireIosUser(request, admin);
    const body = (await request.json()) as DeactivateBody;
    const installationId = body.installation_id?.trim();

    if (!installationId) {
      throw new IosApiError("VALIDATION_FAILED", "installation_id is required.", 422);
    }

    const { error } = await admin
      .from("device_push_tokens")
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("installation_id", installationId);

    if (error) throw error;

    return iosJson({ deactivated: true });
  } catch (error) {
    return iosErrorResponse(error) ?? iosInternalError("deactivate push token", error);
  }
}
