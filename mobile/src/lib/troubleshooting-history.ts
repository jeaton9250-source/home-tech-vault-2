import { supabase } from "./supabase";
import type { SavedIssue } from "./troubleshooting-contract";
export async function listIssues(userId: string, deviceId?: string) {
  if (!supabase) throw new Error("Your vault connection is unavailable.");
  let query = supabase
    .from("troubleshooting_issues")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);
  if (deviceId) query = query.eq("device_id", deviceId);
  const { data, error } = await query;
  if (error)
    throw new Error("Issue history could not be loaded. Please try again.");
  return (data ?? []) as SavedIssue[];
}
export async function saveIssue(input: {
  id?: string;
  userId: string;
  deviceId: string | null;
  category: string;
  description: string;
  summary: string;
  resolved: boolean;
  resolution?: string;
}) {
  if (!supabase) throw new Error("Your vault connection is unavailable.");
  const row = {
    user_id: input.userId,
    device_id: input.deviceId,
    category: input.category,
    description: input.description.slice(0, 1200),
    ai_summary: input.summary.slice(0, 800),
    status: input.resolved ? "resolved" : "open",
    resolution: input.resolved
      ? input.resolution?.slice(0, 1200) ||
        "Homeowner marked this issue as fixed."
      : null,
    resolved_at: input.resolved ? new Date().toISOString() : null,
  };
  const query = input.id
    ? supabase
        .from("troubleshooting_issues")
        .update(row)
        .eq("id", input.id)
        .eq("user_id", input.userId)
    : supabase.from("troubleshooting_issues").insert(row);
  const { data, error } = await query.select("*").single();
  if (error)
    throw new Error("Your issue could not be saved. Please try again.");
  return data as SavedIssue;
}
export async function removeIssue(id: string, userId: string) {
  if (!supabase) throw new Error("Your vault connection is unavailable.");
  const { error } = await supabase
    .from("troubleshooting_issues")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error("Your issue could not be deleted.");
}
