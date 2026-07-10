import { getDevices } from "./devices";
import type { User } from "@supabase/supabase-js";

export async function getWarrantyDevices(user: User | null) {
  return await getDevices(user);
}