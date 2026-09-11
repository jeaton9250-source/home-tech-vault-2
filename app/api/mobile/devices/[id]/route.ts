import { NextResponse } from "next/server";

import { getDefaultActivityTitle } from "@/lib/activity";
import {
  applyHouseholdMutationScope,
  fetchHouseholdIdForUser,
} from "@/lib/data/householdScope";
import {
  validateDeviceInput,
  type DeviceInputForValidation,
} from "@/lib/devices/deviceInputValidation";
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

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { client, user, error: userError } = await authenticateRequest(request);

  if (userError || !user) {
    return NextResponse.json(
      { error: "Authentication required.", code: "UNAUTHENTICATED" },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json(
      { error: "That device could not be found.", code: "NOT_FOUND" },
      { status: 404 },
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
    const query = client
      .from("devices")
      .update({
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
      })
      .eq("id", id);
    const { data: device, error: updateError } = await applyHouseholdMutationScope(
      query,
      householdId,
      user.id,
    )
      .select("id, device_name, brand, manufacturer, category, location, model_number, serial_number, purchase_date, purchase_price, warranty_date, online, notes")
      .maybeSingle();

    if (updateError) throw updateError;
    if (!device) {
      return NextResponse.json(
        { error: "That device could not be found.", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    await client.from("device_events").insert({
      device_id: device.id,
      user_id: user.id,
      event_type: "Updated",
      title: getDefaultActivityTitle("device.edited", input.deviceName),
      description: "Device details updated from the Home Tech Vault app.",
      event_date: new Date().toISOString(),
    });

    return NextResponse.json({
      householdId,
      device: {
        id: device.id,
        name: device.device_name || "Unnamed device",
        brand: device.brand || "Unknown brand",
        category: device.category || "Other",
        location: device.location || "Room not set",
        model: device.model_number || "Model not recorded",
        manufacturer: device.manufacturer || device.brand || "Unknown manufacturer",
        serialNumber: device.serial_number,
        purchaseDate: device.purchase_date,
        value: Number(device.purchase_price) || 0,
        warrantyDate: device.warranty_date,
        online: device.online,
        notes: device.notes || "",
      },
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error(
      "[mobile-device-update] failed",
      error instanceof Error ? error.message : "unknown",
    );
    return NextResponse.json(
      { error: "We couldn't update this device. Please try again.", code: "UNKNOWN" },
      { status: 500 },
    );
  }
}
