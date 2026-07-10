"use server";

import { createClient } from "@/lib/supabase/server";
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

  const name = String(formData.get("name") ?? "");
  const brand = String(formData.get("brand") ?? "");
  const model = String(formData.get("model") ?? "");
  const serialNumber = String(formData.get("serial_number") ?? "");
  const purchaseDate = String(formData.get("purchase_date") ?? "");
  const warrantyExpiration = String(
    formData.get("warranty_expiration") ?? ""
  );
  const notes = String(formData.get("notes") ?? "");

  const { error } = await supabase.from("devices").insert({
    user_id: user.id,
    device_name: name,
    brand,
    model,
    serial_number: serialNumber || null,
    purchase_date: purchaseDate || null,
    warranty_date: warrantyExpiration || null,
    category: "General",
    location: "Home",
    notes: notes || null,
  });

  if (error) {
    console.error("Error adding device:", error);
    throw new Error(error.message);
  }

  revalidatePath("/devices");
  revalidatePath("/dashboard");
}