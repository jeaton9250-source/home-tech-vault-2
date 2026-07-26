import { DEFAULT_NOTIFICATION_PREFERENCES, parseNotificationPreferences } from "@/lib/notifications/preferences";
import { requireIosHouseholdContext } from "@/lib/ios-api/auth";
import { IosApiError, iosErrorResponse, iosInternalError, iosJson } from "@/lib/ios-api/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PreferenceBody = {
  household_id?: string;
  connector_offline?: boolean;
  connector_restored?: boolean;
  device_offline?: boolean;
  device_restored?: boolean;
  new_device_discovered?: boolean;
  warranty_reminders?: boolean;
  maintenance_reminders?: boolean;
  push_enabled?: boolean;
  in_app_enabled?: boolean;
  quiet_hours_start?: string | null;
  quiet_hours_end?: string | null;
  timezone?: string | null;
};

function preferenceResponse(row: Record<string, unknown>) {
  return {
    household_id: row.household_id,
    connector_offline: row.connector_offline,
    connector_restored: row.connector_restored,
    device_offline: row.device_offline,
    device_restored: row.device_restored,
    new_device_discovered: row.new_device_discovered,
    warranty_reminders: row.warranty_reminders,
    maintenance_reminders: row.maintenance_reminders,
    push_enabled: row.push_enabled,
    in_app_enabled: row.in_app_enabled,
    quiet_hours_start: row.quiet_hours_start,
    quiet_hours_end: row.quiet_hours_end,
    timezone: row.timezone,
    ...(row.updated_at ? { updated_at: row.updated_at } : {}),
  };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const context = await requireIosHouseholdContext(
      request,
      url.searchParams.get("household_id"),
      { requirePaid: true }
    );

    const { data, error } = await context.admin
      .from("notification_preferences")
      .select("*")
      .eq("household_id", context.householdId)
      .eq("user_id", context.userId)
      .maybeSingle();

    if (error) throw error;

    const row = data ?? {
      household_id: context.householdId,
      ...DEFAULT_NOTIFICATION_PREFERENCES,
    };

    return iosJson({ preferences: preferenceResponse(row) });
  } catch (error) {
    return iosErrorResponse(error) ?? iosInternalError("get notification preferences", error);
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as PreferenceBody;
    const context = await requireIosHouseholdContext(request, body.household_id, {
      requirePaid: true,
    });

    let preferences: ReturnType<typeof parseNotificationPreferences>;
    try {
      preferences = parseNotificationPreferences(body);
    } catch (error) {
      throw new IosApiError(
        "VALIDATION_FAILED",
        error instanceof Error ? error.message : "Invalid notification preferences.",
        422
      );
    }

    const nowIso = new Date().toISOString();
    const { data, error } = await context.admin
      .from("notification_preferences")
      .upsert(
        {
          household_id: context.householdId,
          user_id: context.userId,
          ...preferences,
          updated_at: nowIso,
        },
        { onConflict: "household_id,user_id" }
      )
      .select("*")
      .single();

    if (error) throw error;

    return iosJson({ preferences: preferenceResponse(data) });
  } catch (error) {
    return iosErrorResponse(error) ?? iosInternalError("update notification preferences", error);
  }
}
