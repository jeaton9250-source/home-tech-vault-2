import "server-only";

import { Client } from "@notionhq/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/marketing/site";
import { createOnboardingCustomer } from "./onboarding";
import { loadOnboardingSnapshot } from "./onboardingSnapshot";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export type OnboardingEmailProperty =
  | "Welcome Sent"
  | "Progress Sent"
  | "Core Setup Sent"
  | "Activation Sent"
  | "Reminder Sent"
  | "Completion Sent";

function getDataSourceId() {
  const id =
    process.env.NOTION_ONBOARDING_DATA_SOURCE_ID;

  if (!id) {
    throw new Error(
      "NOTION_ONBOARDING_DATA_SOURCE_ID is not configured."
    );
  }

  return id;
}

export async function updateOnboardingEmailState(
  userId: string,
  property: OnboardingEmailProperty,
  sent: boolean = true
) {
  try {
    if (
      !process.env.NOTION_TOKEN ||
      !userId
    ) {
      return false;
    }

    const existing =
      await notion.dataSources.query({
        data_source_id:
          getDataSourceId(),
        filter: {
          property: "Supabase User ID",
          rich_text: {
            equals: userId,
          },
        },
        page_size: 1,
      });

    let page =
      existing.results[0];

    if (!page) {
      const { data, error } = await createAdminClient().auth.admin.getUserById(userId);
      if (error || !data.user) return false;
      const snapshot = await loadOnboardingSnapshot(data.user);
      if (!snapshot) return false;
      page = await createOnboardingCustomer({ userId, email: data.user.email!, name: snapshot.name,
        plan: snapshot.plan, source: snapshot.source, signupDate: data.user.created_at,
        accountUrl: `${getSiteUrl()}/dashboard` });
    }

    await notion.pages.update({
      page_id: page.id,
      properties: {
        [property]: {
          checkbox: sent,
        },
        "Last Synced": {
          date: {
            start:
              new Date().toISOString(),
          },
        },
      },
    });

    return true;
  } catch (error) {
    // Notion tracking must never break customer email delivery.
    console.error(
      "Unable to update Notion onboarding email state:",
      {
        userId,
        property,
        error,
      }
    );

    return false;
  }
}
