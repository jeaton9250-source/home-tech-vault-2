import type {
  User,
} from "@supabase/supabase-js";

import {
  fetchHouseholdIdForUser,
  resolveHouseholdScope,
} from "@/lib/data/householdScope";
import { supabase } from "@/lib/supabase";
import { demoDevices } from "@/lib/demoData";

export type WarrantyDevice = {
  id: string;
  user_id?: string | null;
  household_id?: string | null;
  device_name?: string | null;
  brand?: string | null;
  model?: string | null;
  location?: string | null;
  warranty_date?: string | null;
  purchase_date?: string | null;
  purchase_price?: number | null;
};

export async function getWarrantyDevices(
  user: User | null,
  householdId?: string | null
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
        purchase_date:
          device.purchase_date,
        purchase_price:
          device.purchase_price,
      })
    );
  }

  const resolvedHouseholdId =
    householdId ??
    (await fetchHouseholdIdForUser(
      user.id
    ));

  const scope = resolveHouseholdScope(
    resolvedHouseholdId,
    user.id
  );

  const {
    data,
    error,
  } = await supabase
    .from("devices")
    .select(
      `
        id,
        user_id,
        household_id,
        device_name,
        brand,
        model,
        location,
        warranty_date,
        purchase_date,
        purchase_price
      `
    )
    .eq(scope.column, scope.value)
    .order("device_name", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return (
    (data || []) as WarrantyDevice[]
  );
}
