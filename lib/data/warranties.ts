import type {
  User,
} from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";
import { demoDevices } from "@/lib/demoData";

export type WarrantyDevice = {
  id: string;
  user_id?: string | null;
  household_id?: string | null;
  device_name?: string | null;
  brand?: string | null;
  location?: string | null;
  warranty_date?: string | null;
  purchase_price?: number | null;
};

export async function getWarrantyDevices(
  user: User | null
): Promise<WarrantyDevice[]> {
  if (!user) {
    return demoDevices.map(
      (device) => ({
        id: device.id,
        device_name:
          device.device_name,
        brand: device.brand,
        location:
          device.location,
        warranty_date:
          device.warranty_date,
        purchase_price:
          device.purchase_price,
      })
    );
  }

  const {
    data: membership,
    error: membershipError,
  } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    throw membershipError;
  }

  const householdId =
    membership?.household_id || null;

  let query = supabase
    .from("devices")
    .select(
      `
        id,
        user_id,
        household_id,
        device_name,
        brand,
        location,
        warranty_date,
        purchase_price
      `
    );

  if (householdId) {
    query = query.eq(
      "household_id",
      householdId
    );
  } else {
    query = query.eq(
      "user_id",
      user.id
    );
  }

  const {
    data,
    error,
  } = await query;

  if (error) {
    throw error;
  }

  return (
    (data || []) as WarrantyDevice[]
  );
}