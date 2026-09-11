import { NextResponse } from "next/server";

import { getDefaultActivityTitle } from "@/lib/activity";
import { fetchHouseholdIdForUser } from "@/lib/data/householdScope";
import {
  validateDeviceInput,
  type DeviceInputForValidation,
} from "@/lib/devices/deviceInputValidation";
import {
  assertCanAddDevice,
  HouseholdQuotaError,
} from "@/lib/permissions/serverQuota";
import { createAdminClient } from "@/lib/supabase/admin";
import { authenticateRequest } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeInput(value: unknown): DeviceInputForValidation {
  const input = value && typeof value === "object"
    ? value as Record<string, unknown>
    : {};

  return {
    deviceName: text(input.deviceName),
    category: text(input.category),
    brand: text(input.brand),
    manufacturer: text(input.manufacturer),
    modelNumber: text(input.modelNumber),
    serialNumber: text(input.serialNumber),
    purchaseDate: text(input.purchaseDate),
    warrantyDate: text(input.warrantyDate),
    purchasePrice: text(input.purchasePrice),
    location: text(input.location),
    notes: text(input.notes),
    productUpc: text(input.productUpc),
  };
}

export async function POST(request: Request) {
  const {
    client,
    user,
    error: userError,
  } = await authenticateRequest(request);

  if (userError || !user) {
    return NextResponse.json(
      { error: "Authentication required.", code: "UNAUTHENTICATED" },
      { status: 401 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "The device details could not be read.", code: "VALIDATION_ERROR" },
      { status: 400 },
    );
  }

  const validation = validateDeviceInput(normalizeInput(body));

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error, code: "VALIDATION_ERROR" },
      { status: 400 },
    );
  }

  try {
    const input = validation.data;
    const householdId = await fetchHouseholdIdForUser(user.id, client);

    await assertCanAddDevice(createAdminClient(), user.id, householdId);

    const shouldEnrich = Boolean(
      input.productUpc || ((input.brand || input.manufacturer) && input.modelNumber),
    );

    const { data: device, error: insertError } = await client
      .from("devices")
      .insert({
        user_id: user.id,
        household_id: householdId,
        device_name: input.deviceName,
        category: input.category || null,
        brand: input.brand || null,
        manufacturer: input.manufacturer || null,
        model_number: input.modelNumber || null,
        serial_number: input.serialNumber || null,
        purchase_date: input.purchaseDate,
        warranty_date: input.warrantyDate,
        purchase_price: input.purchasePrice,
        location: input.location || null,
        notes: input.notes || null,
        manual_status: shouldEnrich ? "pending" : null,
        manual_checked_at: null,
      })
      .select(
        "id, device_name, brand, category, location, model_number, purchase_price, warranty_date, online",
      )
      .single();

    if (insertError || !device) {
      throw insertError ?? new Error("The device was not returned after saving.");
    }

    await client.from("device_events").insert({
      device_id: device.id,
      user_id: user.id,
      event_type: "Added",
      title: getDefaultActivityTitle("device.added", input.deviceName),
      description: "Device saved to your vault from the Home Tech Vault app.",
      event_date: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        deviceId: device.id,
        householdId,
        device: {
          id: device.id,
          name: device.device_name || "Unnamed device",
          brand: device.brand || "Unknown brand",
          category: device.category || "Other",
          location: device.location || "Room not set",
          model: device.model_number || "Model not recorded",
          value: Number(device.purchase_price) || 0,
          warrantyDate: device.warranty_date,
          online: device.online,
        },
      },
      { status: 201, headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    if (error instanceof HouseholdQuotaError) {
      const code = error.code === "viewer_read_only"
        ? "VIEWER_READ_ONLY"
        : error.code === "household_device_limit"
          ? "HOUSEHOLD_DEVICE_LIMIT"
          : "FREE_DEVICE_LIMIT";

      return NextResponse.json(
        { error: error.message, code },
        { status: 403 },
      );
    }

    console.error(
      "[mobile-device-create] failed",
      error instanceof Error ? error.message : "unknown",
    );

    return NextResponse.json(
      { error: "We couldn't save this device. Please try again.", code: "UNKNOWN" },
      { status: 500 },
    );
  }
}
