import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export class DeviceDeleteError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function mapRpcError(message: string): DeviceDeleteError {
  const normalized = message.toUpperCase();

  if (normalized.includes("FORBIDDEN")) {
    return new DeviceDeleteError(
      403,
      "You do not have permission to delete this device."
    );
  }

  if (normalized.includes("NOT_AUTHENTICATED")) {
    return new DeviceDeleteError(
      401,
      "You must be signed in to delete a device."
    );
  }

  if (
    normalized.includes("DEVICE_NOT_FOUND") ||
    normalized.includes("P0002")
  ) {
    return new DeviceDeleteError(
      404,
      "Device not found."
    );
  }

  // Surface the real DB message so we can see FK / policy failures.
  return new DeviceDeleteError(
    500,
    message || "Unable to delete this device."
  );
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
 * Delete a device via SECURITY DEFINER RPC (clears FK dependents),
 * then best-effort storage cleanup with the service role.
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

  // Load storage paths before the row is removed.
  const admin = createAdminClient();

  const [
    imagesResult,
    documentsResult,
  ] = await Promise.all([
    admin
      .from("device_images")
      .select("image_url")
      .eq("device_id", deviceId),
    admin
      .from("device_documents")
      .select("file_path")
      .eq("device_id", deviceId),
  ]);

  const { data, error } = await supabase.rpc(
    "delete_vault_device",
    { p_device_id: deviceId }
  );

  if (error) {
    console.error(
      "delete_vault_device RPC error:",
      error.message,
      error.code,
      error.details
    );
    throw mapRpcError(error.message);
  }

  const payload = data as {
    ok?: boolean;
    id?: string;
    device_name?: string | null;
  } | null;

  if (!payload?.ok || !payload.id) {
    throw new DeviceDeleteError(
      500,
      "Device could not be deleted."
    );
  }

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

  return {
    id: payload.id,
    deviceName: payload.device_name ?? null,
  };
}
