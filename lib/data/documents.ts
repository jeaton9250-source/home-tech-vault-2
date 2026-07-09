import { supabase } from "@/lib/supabase";
import { demoDocuments } from "@/lib/demo/documents";
import type { User } from "@supabase/supabase-js";

export async function getDocuments(user: User | null) {
  if (!user) {
    return demoDocuments;
  }

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}