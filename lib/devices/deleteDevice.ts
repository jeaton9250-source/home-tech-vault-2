import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { loadHouseholdMembershipForUser } from "@/lib/permissions/householdMembership";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export class DeviceDeleteError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type DeviceRow = {
  id: string;
  user_id: string;
  household_id: string | null;
  device_name: string | null;
};

/**
 * Match product rules: personal vault + household owner/admin/member can delete.
 * Viewers cannot. Platform admins can.
 */
async function userCanDeleteDevice(
  admin: SupabaseClient,
  userId: string,
  device: DeviceRow,
  isPlatformAdmin: boolean
): Promise<boolean> {
  if (isPlatformAdmin) {
    return true;
  }

  // Device owner can always remove their own device.
  if (device.user_id === userId) {
    return true;
  }

  const householdId = device.household_id;

  if (householdId) {
    const { data: household } = await admin
      .from("households")
      .select("owner_id")
      .eq("id", householdId)
      .maybeSingle();

    if (household?.owner_id === userId) {
      return true;
    }

    const membership = await loadHouseholdMembershipForUser(
      admin,
      userId,
      householdId
    );

    const role = membership.normalizedRole;
    // owner/admin normalize to "admin"; members may delete; viewers may not.
    return role === "admin" || role === "member";
  }

  // Legacy personal-shaped rows: household admins/members of the owner's household.
  const { data: ownedHousehold } = await admin
    .from("households")
    .select("id")
    .eq("owner_id", device.user_id)
    .maybeSingle();

  if (!ownedHousehold?.id) {
    return false;
  }

  const membership = await loadHouseholdMembershipForUser(
    admin,
    userId,
    ownedHousehold.id
  );
  const role = membership.normalizedRole;
  return role === "admin" || role === "member";
}

async function removeStoragePaths(
  admin: SupabaseClient,
  bucket: "device-images" | "device-documents",
  paths: string[]
) {
  const unique = [
    ...new Set(
      paths.filter(
        (path) =>
          typeof path === "string" &&
          path.trim().length > 0 &&
          !path.startsWith("http")
      )
    ),
  ];

  if (unique.length === 0) {
    return;
  }

  const { error } = await admin.storage.from(bucket).remove(unique);

  if (error) {
    console.error(
      `Unable to remove ${bucket} objects during device delete:`,
      error.message
    );
  }
}

async function deleteByDeviceId(
  admin: SupabaseClient,
  table: string,
  deviceId: string
) {
  const { error } = await admin
    .from(table)
    .delete()
    .eq("device_id", deviceId);

  if (!error) {
    return;
  }

  const message = error.message?.toLowerCase() ?? "";
  const missing =
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    message.includes("does not exist") ||
    message.includes("could not find the table");

  if (missing) {
    return;
  }

  throw error;
}

async function nullDeviceIdReferences(
  admin: SupabaseClient,
  table: string,
  column: string,
  deviceId: string
) {
  const { error } = await admin
    .from(table)
    .update({ [column]: null })
    .eq(column, deviceId);

  if (!error) {
    return;
  }

  const message = error.message?.toLowerCase() ?? "";
  const missing =
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    message.includes("does not exist") ||
    message.includes("could not find");

  if (missing) {
    return;
  }

  // Column may not exist on older schemas — ignore.
  if (
    message.includes("column") ||
    error.code === "PGRST204"
  ) {
    return;
  }

  throw error;
}

/**
 * Delete a device with service-role cascade after authz.
 * Does not depend on optional SQL RPCs.
 */
export async function deleteDeviceForViewer(
  deviceId: string
): Promise<{ id: string; deviceName: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new DeviceDeleteError(
      401,
      "You must be signed in to delete a device."
    );
  }

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  const isPlatformAdmin = profile?.is_admin === true;

  const { data: device, error: deviceError } = await admin
    .from("devices")
    .select("id, user_id, household_id, device_name")
    .eq("id", deviceId)
    .maybeSingle();

  if (deviceError) {
    throw deviceError;
  }

  if (!device) {
    throw new DeviceDeleteError(404, "Device not found.");
  }

  const deviceRow = device as DeviceRow;

  const allowed = await userCanDeleteDevice(
    admin,
    user.id,
    deviceRow,
    isPlatformAdmin
  );

  if (!allowed) {
    throw new DeviceDeleteError(
      403,
      "You do not have permission to delete this device."
    );
  }

  const [imagesResult, documentsResult] = await Promise.all([
    admin
      .from("device_images")
      .select("image_url")
      .eq("device_id", deviceRow.id),
    admin
      .from("device_documents")
      .select("file_path")
      .eq("device_id", deviceRow.id),
  ]);

  await removeStoragePaths(
    admin,
    "device-images",
    ((imagesResult.data ?? []) as { image_url: string }[]).map(
      (row) => row.image_url
    )
  );

  await removeStoragePaths(
    admin,
    "device-documents",
    ((documentsResult.data ?? []) as { file_path: string }[]).map(
      (row) => row.file_path
    )
  );

  // Detach optional FKs that may block DELETE.
  await nullDeviceIdReferences(
    admin,
    "documents",
    "device_id",
    deviceRow.id
  );
  await nullDeviceIdReferences(
    admin,
    "discovered_devices",
    "imported_device_id",
    deviceRow.id
  );
  await nullDeviceIdReferences(
    admin,
    "device_monitor_events",
    "device_id",
    deviceRow.id
  );

  for (const table of [
    "device_events",
    "device_images",
    "device_documents",
    "maintenance_tasks",
    "device_identity_confirmations",
  ]) {
    await deleteByDeviceId(admin, table, deviceRow.id);
  }

  const { data: deleted, error: deleteError } = await admin
    .from("devices")
    .delete()
    .eq("id", deviceRow.id)
    .select("id")
    .maybeSingle();

  if (deleteError) {
    throw new DeviceDeleteError(
      500,
      deleteError.message || "Unable to delete this device."
    );
  }

  if (!deleted) {
    throw new DeviceDeleteError(
      500,
      "Device could not be deleted."
    );
  }

  return {
    id: deviceRow.id,
    deviceName: deviceRow.device_name,
  };
}
