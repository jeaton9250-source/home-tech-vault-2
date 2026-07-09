import { supabase } from "@/lib/supabase";
import { demoSubscriptions } from "@/lib/demo/subscriptions";
import type { User } from "@supabase/supabase-js";

export async function getSubscriptions(user: User | null) {
  if (!user) {
    return demoSubscriptions;
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("service_name");

  if (error) {
    throw error;
  }

  return data ?? [];
}