import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { popupDefaults, popupSettingsSchema } from "./schema";
export async function loadPopupSettings() {
  const {data,error}=await createAdminClient().from("popup_settings").select("content,updated_at").eq("id",1).maybeSingle();
  if(error)throw error;
  const parsed=popupSettingsSchema.safeParse(data?.content);
  return {settings:parsed.success ? parsed.data : popupDefaults,revision:data?.updated_at ?? "initial"};
}
