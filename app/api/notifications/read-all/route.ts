import { requireIosHouseholdContext } from "@/lib/ios-api/auth";
import { iosErrorResponse, iosInternalError, iosJson } from "@/lib/ios-api/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ReadAllBody = { household_id?: string };

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ReadAllBody;
    const context = await requireIosHouseholdContext(request, body.household_id, { requirePaid: true });
    const readAt = new Date().toISOString();

    const { data, error } = await context.admin
      .from("notifications")
      .update({ is_read: true, read_at: readAt })
      .eq("household_id", context.householdId)
      .eq("user_id", context.userId)
      .eq("is_read", false)
      .is("archived_at", null)
      .select("id");

    if (error) throw error;

    return iosJson({ updated_count: data?.length ?? 0, read_at: readAt });
  } catch (error) {
    return iosErrorResponse(error) ?? iosInternalError("mark all notifications read", error);
  }
}
