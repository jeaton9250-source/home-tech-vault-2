"use server";

import { createClient } from "@/lib/supabase/server";
import {
  applyHouseholdScope,
  fetchHouseholdIdForUser,
} from "@/lib/data/householdScope";
import {
  assertCanAddDevice,
  HouseholdQuotaError,
} from "@/lib/permissions/serverQuota";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getDefaultActivityTitle,
  recordActivity,
} from "@/lib/activity";
import { revalidatePath } from "next/cache";

export type AddDeviceInput = {
  deviceName: string;
  category: string;
  brand: string;
  modelNumber: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyDate: string;
  purchasePrice: string;
  location: string;
  notes: string;
};

export type AddDeviceResult =
  | {
      success: true;
      deviceId: string;
    }
  | {
      success: false;
      error: string;
      code?:
        | "UNAUTHENTICATED"
        | "VIEWER_READ_ONLY"
        | "HOUSEHOLD_DEVICE_LIMIT"
        | "FREE_DEVICE_LIMIT"
        | "DEVICE_LIMIT_REACHED"
        | "VALIDATION_ERROR"
        | "UNKNOWN";
    };

export async function addDevice(
  input: AddDeviceInput
): Promise<AddDeviceResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error: "You must be signed in to add a device.",
      code: "UNAUTHENTICATED",
    };
  }

  const admin = createAdminClient();

  try {
    await assertCanAddDevice(admin, user.id);
  } catch (error) {
    if (error instanceof HouseholdQuotaError) {
      if (error.code === "viewer_read_only") {
        return {
          success: false,
          error: error.message,
          code: "VIEWER_READ_ONLY",
        };
      }

      if (error.code === "household_device_limit") {
        return {
          success: false,
          error: error.message,
          code: "HOUSEHOLD_DEVICE_LIMIT",
        };
      }

      if (error.code === "free_device_limit") {
        return {
          success: false,
          error: error.message,
          code: "FREE_DEVICE_LIMIT",
        };
      }

      return {
        success: false,
        error: error.message,
        code: "UNKNOWN",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to add this device. Please try again.",
      code: "UNKNOWN",
    };
  }

  const trimmedName = input.deviceName.trim();

  if (!trimmedName) {
    return {
      success: false,
      error: "Enter a device name.",
      code: "VALIDATION_ERROR",
    };
  }

  const householdId =
    await fetchHouseholdIdForUser(
      user.id,
      supabase
    );

  const locationsResult =
    await applyHouseholdScope(
      supabase
        .from("devices")
        .select("location"),
      householdId,
      user.id
    );

  if (locationsResult.error) {
    console.error(
      "Error loading existing locations:",
      locationsResult.error
    );

    return {
      success: false,
      error:
        "Unable to add this device. Please try again.",
      code: "UNKNOWN",
    };
  }

  const existingLocations = new Set(
    (
      (locationsResult.data || []) as {
        location: string | null;
      }[]
    )
      .map((row) =>
        row.location?.trim().toLowerCase()
      )
      .filter(Boolean)
  );

  const trimmedLocation =
    input.location.trim();

  const { data: createdDevice, error } = await supabase
    .from("devices")
    .insert({
      user_id: user.id,
      household_id: householdId,
      device_name: trimmedName,
      category:
        input.category.trim() || null,
      brand:
        input.brand.trim() || null,
      model_number:
        input.modelNumber.trim() || null,
      serial_number:
        input.serialNumber.trim() || null,
      purchase_date:
        input.purchaseDate || null,
      warranty_date:
        input.warrantyDate || null,
      purchase_price:
        input.purchasePrice
          ? Number(input.purchasePrice)
          : null,
      location:
        trimmedLocation || null,
      notes:
        input.notes.trim() || null,
    })
    .select("id")
    .single();

  if (error) {
    if (
      error.message.includes(
        "DEVICE_LIMIT_REACHED"
      )
    ) {
      return {
        success: false,
        error: error.message,
        code: "DEVICE_LIMIT_REACHED",
      };
    }

    console.error("Error adding device:", error);

    return {
      success: false,
      error:
        "Unable to add this device. Please try again.",
      code: "UNKNOWN",
    };
  }

  if (createdDevice?.id) {
    await recordActivity({
      activityType: "device.added",
      title: getDefaultActivityTitle(
        "device.added",
        trimmedName
      ),
      description:
        "Device saved to your vault.",
      userId: user.id,
      householdId,
      deviceId: createdDevice.id,
    });

    if (input.warrantyDate) {
      await recordActivity({
        activityType: "warranty.added",
        title: getDefaultActivityTitle(
          "warranty.added",
          trimmedName
        ),
        description:
          "Warranty coverage recorded on the device.",
        userId: user.id,
        householdId,
        deviceId: createdDevice.id,
      });
    }

    if (
      trimmedLocation &&
      !existingLocations.has(
        trimmedLocation.toLowerCase()
      )
    ) {
      await recordActivity({
        activityType: "room.created",
        title: getDefaultActivityTitle(
          "room.created",
          trimmedLocation
        ),
        description:
          "A new room was created when this device was assigned a location.",
        userId: user.id,
        householdId,
        entityId: trimmedLocation,
      });
    }
  }

  revalidatePath("/devices");
  revalidatePath("/dashboard");

  return {
    success: true,
    deviceId: createdDevice.id,
  };
}
