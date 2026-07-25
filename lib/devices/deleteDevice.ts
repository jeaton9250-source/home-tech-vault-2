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

async function userCanDeleteDevice(
  admin: SupabaseClient,
  userId: string,
  device: DeviceRow,
  isPlatformAdmin: boolean
): Promise<boolean> {
  if (isPlatformAdmin) {
    return true;
  }

  // Always allow the row owner.
  if (device.user_id === userId) {
    return true;
  }

  if (device.household_id) {
    const membership =
      await loadHouseholdMembershipForUser(
        admin,
        userId,
        device.household_id
      );

    const role = membership.rawHouseholdRole;
    if (role === "owner" || role === "admin") {
      return true;
    }

    // Billing owners may exist only as households.owner_id (no members row).
    const { data: household } = await admin
      .from("households")
      .select("owner_id")
      .eq("id", device.household_id)
      .maybeSingle();

    return household?.owner_id === userId;
  }

  // Legacy personal-shaped row: allow household admins of the device owner's household.
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

  const role = membership.rawHouseholdRole;
  return role === "owner" || role === "admin";
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

  const { error } = await admin.storage
    .from(bucket)
    .remove(unique);

  if (error) {
    console.error(
      `Unable to remove ${bucket} objects during device delete:`,
      error.message
    );
  }
}

/**
 * Delete a device and related media/events using the service role after
 * verifying the caller owns the device or is a household admin.
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

  const { data: device, error: deviceError } =
    await admin
      .from("devices")
      .select("id, user_id, household_id, device_name")
      .eq("id", deviceId)
      .maybeSingle();

  if (deviceError) {
    throw deviceError;
  }

  if (!device) {
    throw new DeviceDeleteError(
      404,
      "Device not found."
    );
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

  const [
    imagesResult,
    documentsResult,
  ] = await Promise.all([
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

  // Clear dependents first in case FKs are RESTRICT / NO ACTION.
  const dependentTables = [
    "device_events",
    "device_images",
    "device_documents",
    "maintenance_tasks",
    "device_identity_confirmations",
  ] as const;

  for (const table of dependentTables) {
    const { error } = await admin
      .from(table)
      .delete()
      .eq("device_id", deviceRow.id);

    if (!error) {
      continue;
    }

    const message = error.message?.toLowerCase() ?? "";
    const missingTable =
      error.code === "42P01" ||
      error.code === "PGRST205" ||
      message.includes("does not exist") ||
      message.includes("could not find the table");

    if (missingTable) {
      continue;
    }

    console.error(
      `Unable to delete ${table} for device ${deviceRow.id}:`,
      error.message
    );

    if (
      table === "device_events" ||
      table === "device_images" ||
      table === "device_documents" ||
      table === "maintenance_tasks"
    ) {
      throw error;
    }
  }

  const { data: deleted, error: deleteError } =
    await admin
      .from("devices")
      .delete()
      .eq("id", deviceRow.id)
      .select("id")
      .maybeSingle();

  if (deleteError) {
    throw deleteError;
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
