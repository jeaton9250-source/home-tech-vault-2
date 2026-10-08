import "server-only";
import type { User } from "@supabase/supabase-js";
import { Client, isFullPage } from "@notionhq/client";
import { getEmailFromAddress, getEmailReplyToAddress, getResendClient } from "@/lib/email/resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadOnboardingSnapshot } from "@/lib/notion/onboardingSnapshot";

// Fail closed for onboarding: never substitute a personal or unverified sender.
export async function onboardingDeliveryAllowed(user: User, kind: "welcome" | "first_device" | "core_setup" | "activated" | "onboarding_complete" | "reminder") {
  const snapshot = await loadOnboardingSnapshot(user);
  if (!snapshot || !user.email_confirmed_at) return false;
  if (kind === "first_device" && !snapshot.signals.device) return false;
  if (kind === "core_setup" && !(snapshot.signals.device && snapshot.signals.paperwork)) return false;
  if ((kind === "activated" || kind === "onboarding_complete") && snapshot.status !== "Complete") return false;
  if (kind === "reminder" && (snapshot.status === "Complete" || snapshot.emailState["Reminder Sent"] || Date.now() - Date.parse(snapshot.lastProgress) < 72 * 3600000)) return false;
  if ((kind === "activated" || kind === "onboarding_complete") && snapshot.emailState["Completion Sent"]) return false;
  if (!process.env.NOTION_TOKEN || !process.env.NOTION_ONBOARDING_DATA_SOURCE_ID) throw new Error("Onboarding email blocked: Notion delivery ledger is unavailable.");
  const ledger = await new Client({ auth: process.env.NOTION_TOKEN }).dataSources.query({
    data_source_id: process.env.NOTION_ONBOARDING_DATA_SOURCE_ID,
    filter: { property: "Supabase User ID", rich_text: { equals: user.id } }, page_size: 1,
  });
  const page = ledger.results[0];
  const sentProperty = { welcome: "Welcome Sent", first_device: "Progress Sent", core_setup: "Core Setup Sent", activated: "Completion Sent", onboarding_complete: "Completion Sent", reminder: "Reminder Sent" }[kind];
  if (page && isFullPage(page)) {
    const property = page.properties[sentProperty];
    if (property?.type === "checkbox" && property.checkbox) return false;
  }
  const { data, error } = await createAdminClient().from("lifecycle_email_preferences").select("onboarding_enabled").eq("user_id", user.id).maybeSingle();
  if (error) throw error;
  if (data?.onboarding_enabled === false) return false;
  if (getEmailFromAddress() !== "Home Tech Vault <hello@updates.hometechvault.com>" || getEmailReplyToAddress() !== "support@hometechvault.com") {
    throw new Error("Onboarding email blocked: sender does not match the approved business identity.");
  }
  const resend = getResendClient();
  if (!resend) throw new Error("Onboarding email blocked: Resend is unavailable.");
  const domains = await resend.domains.list();
  if (domains.error || !domains.data?.data.some(domain => domain.name === "updates.hometechvault.com" && domain.status === "verified")) {
    throw new Error("Onboarding email blocked: approved sending domain could not be verified.");
  }
  return true;
}
