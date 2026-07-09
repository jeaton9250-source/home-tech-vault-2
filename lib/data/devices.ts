import { supabase } from "@/lib/supabase";
import { demoDevices } from "@/lib/demo/devices";
import type { User } from "@supabase/supabase-js";

export async function getDevices(user: User | null) {
  if (!user) {
    return demoDevices;
  }

  const { data, error } = await supabase
    .from("devices")
    .select("*")
    .eq("user_id", user.id)
    .order("device_name");

  if (error) {
    throw error;
  }

  return data ?? [];
}