"use server";

import { createClient } from "@/lib/supabase/server";
import {
  fetchHouseholdIdForUser,
  withHouseholdInsertFields,
} from "@/lib/data/householdScope";
import {
  assertCanAddDevice,
  HouseholdQuotaError,
} from "@/lib/permissions/serverQuota";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function addDevice(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be signed in to add a device.");
  }

  const admin = createAdminClient();

  try {
    await assertCanAddDevice(admin, user.id);
  } catch (error) {
    if (error instanceof HouseholdQuotaError) {
      throw new Error(error.message);
    }

    throw error;
  }

  const householdId =
    await fetchHouseholdIdForUser(
      user.id,
      supabase
    );

  const name = String(formData.get("name") ?? "");
  const brand = String(formData.get("brand") ?? "");
  const model = String(formData.get("model") ?? "");
  const serialNumber = String(formData.get("serial_number") ?? "");
  const purchaseDate = String(formData.get("purchase_date") ?? "");
  const warrantyExpiration = String(
    formData.get("warranty_expiration") ?? ""
  );
  const notes = String(formData.get("notes") ?? "");

  const { error } = await supabase
    .from("devices")
    .insert(
      withHouseholdInsertFields(
        {
          device_name: name,
          brand,
          model,
          serial_number: serialNumber || null,
          purchase_date: purchaseDate || null,
          warranty_date: warrantyExpiration || null,
          category: "General",
          location: "Home",
          notes: notes || null,
        },
        householdId,
        user.id
      )
    );

  if (error) {
    console.error("Error adding device:", error);
    throw new Error(
      "Unable to add this device. Please try again."
    );
  }

  revalidatePath("/devices");
  revalidatePath("/dashboard");
}
