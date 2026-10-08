import "server-only";
import { Client, isFullPage } from "@notionhq/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/marketing/site";
import { createOnboardingCustomer } from "./onboarding";
import { loadOnboardingSnapshot } from "./onboardingSnapshot";
import { sendOnboardingMilestoneEmail, type AutomaticOnboardingMilestone } from "@/lib/lifecycle/sendOnboardingMilestoneEmail";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

export async function syncNotionOnboardingProgress(userId: string) {
  let pageId: string | undefined;
  try {
    if (!userId) return { ok: false, skipped: true };
    if (!process.env.NOTION_TOKEN || !process.env.NOTION_ONBOARDING_DATA_SOURCE_ID) {
      throw new Error("Notion onboarding configuration is missing.");
    }
    const { data, error } = await createAdminClient().auth.admin.getUserById(userId);
    if (error || !data.user) throw new Error("Unable to load onboarding account.");
    const snapshot = await loadOnboardingSnapshot(data.user);
    if (!snapshot) return { ok: true, skipped: true };

    // Missing rows from mobile/OAuth signup are created when progress arrives.
    const page = await createOnboardingCustomer({
      userId, email: snapshot.user.email!, name: snapshot.name, plan: snapshot.plan,
      source: snapshot.source, accountUrl: `${getSiteUrl()}/dashboard`, signupDate: snapshot.user.created_at,
    });
    pageId = page.id;
    if (!isFullPage(page)) throw new Error("Notion returned an incomplete onboarding record.");
    const properties = page.properties;
    const checked = (name: string) => properties[name]?.type === "checkbox" && properties[name].checkbox;
    const emailState = Object.fromEntries(Object.entries(snapshot.emailState).map(([name, sent]) => [name, { checkbox: sent || checked(name) }]));
    await notion.pages.update({ page_id: pageId, properties: {
      Customer: { title: [{ text: { content: snapshot.name } }] },
      Email: { email: snapshot.user.email! },
      Status: { select: { name: snapshot.status } },
      Plan: { select: { name: snapshot.plan } }, Source: { select: { name: snapshot.source } },
      "Account URL": { url: `${getSiteUrl()}/dashboard` },
      "Signup Date": { date: { start: snapshot.user.created_at } },
      "Device Added": { checkbox: snapshot.signals.device },
      "Document or Warranty Added": { checkbox: snapshot.signals.paperwork },
      "Maintenance Added": { checkbox: snapshot.signals.maintenance },
      "Needs Human Help": { checkbox: snapshot.signals.needsHelp },
      "Last Progress": { date: { start: snapshot.lastProgress } },
      "Last Synced": { date: { start: new Date().toISOString() } },
      ...emailState,
    } });

    let milestone: AutomaticOnboardingMilestone | null = null;
    let sentProperty = "";
    if (snapshot.status === "Complete" && !(snapshot.emailState["Completion Sent"] || checked("Completion Sent"))) {
      milestone = "activated"; sentProperty = "Completion Sent";
    } else if (snapshot.status === "Core Setup" && !(snapshot.emailState["Core Setup Sent"] || checked("Core Setup Sent"))) {
      milestone = "core_setup"; sentProperty = "Core Setup Sent";
    } else if (snapshot.status === "Started" && !(snapshot.emailState["Progress Sent"] || checked("Progress Sent"))) {
      milestone = "first_device"; sentProperty = "Progress Sent";
    }
    let deliveryConfirmed = false;
    if (milestone) {
      const result = await sendOnboardingMilestoneEmail(userId, milestone);
      if (!result.ok) throw new Error("Customer email pending: approved onboarding delivery failed.");
      if (result.sent || ("skipped" in result && result.skipped === "already_sent")) {
        deliveryConfirmed = true;
        await notion.pages.update({ page_id: pageId, properties: {
          [sentProperty]: { checkbox: true },
          ...(milestone === "activated" ? { "Activation Sent": { checkbox: true } } : {}),
        } });
      }
    }
    // A sync without delivery cannot clear an existing delivery failure.
    if (deliveryConfirmed) await notion.pages.update({ page_id: pageId, properties: { "Automation Error": { rich_text: [] } } });
    return { ok: true, skipped: false };
  } catch (error) {
    // Hourly reconciliation retries failures; customer actions never fail for Notion.
    console.error("Notion onboarding progress sync failed", { userId, error });
    if (pageId) {
      await notion.pages.update({ page_id: pageId, properties: {
        "Automation Error": { rich_text: [{ text: { content: "Onboarding sync or delivery failed; retry pending. Check application logs." } }] },
      } }).catch(() => undefined);
    }
    return { ok: false, skipped: false };
  }
}
