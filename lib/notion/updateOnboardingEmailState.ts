import "server-only";

import { Client } from "@notionhq/client";

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

    const page =
      existing.results[0];

    if (!page) {
      console.warn(
        `Notion email state skipped: no onboarding record for ${userId}.`
      );
      return false;
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
