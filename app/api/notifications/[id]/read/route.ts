import { createAdminClient } from "@/lib/supabase/admin";
import { requireIosUser } from "@/lib/ios-api/auth";
import { IosApiError, iosErrorResponse, iosInternalError, iosJson } from "@/lib/ios-api/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ReadBody = { is_read?: boolean };

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const admin = createAdminClient();
    const user = await requireIosUser(request, admin);
    const body = (await request.json()) as ReadBody;
    const isRead = body.is_read !== false;
    const readAt = isRead ? new Date().toISOString() : null;

    const { data, error } = await admin
      .from("notifications")
      .update({ is_read: isRead, read_at: readAt })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id, is_read, read_at")
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new IosApiError("VALIDATION_FAILED", "Notification not found.", 404);

    return iosJson({ notification: data });
  } catch (error) {
    return iosErrorResponse(error) ?? iosInternalError("mark notification read", error);
  }
}
