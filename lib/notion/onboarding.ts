import "server-only";

import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

function getDataSourceId() {
  const id = process.env.NOTION_ONBOARDING_DATA_SOURCE_ID;

  if (!id) {
    throw new Error(
      "NOTION_ONBOARDING_DATA_SOURCE_ID is not configured."
    );
  }

  return id;
}

type CreateOnboardingCustomerInput = {
  userId: string;
  email: string;
  name?: string | null;
  plan?: string | null;
  source?: string | null;
  accountUrl?: string | null;
  signupDate?: string | null;
};

export async function createOnboardingCustomer({
  userId,
  email,
  name,
  plan,
  source,
  accountUrl,
  signupDate,
}: CreateOnboardingCustomerInput) {
  if (!process.env.NOTION_TOKEN) {
    throw new Error("NOTION_TOKEN is not configured.");
  }

  // Prevent duplicate onboarding records for the same HTV account.
  const existing = await notion.dataSources.query({
    data_source_id: getDataSourceId(),
    filter: {
      property: "Supabase User ID",
      rich_text: {
        equals: userId,
      },
    },
    page_size: 1,
  });

  if (existing.results.length > 0) {
    return existing.results[0];
  }

  const properties: Record<string, any> = {
    Customer: {
      title: [
        {
          text: {
            content: name?.trim() || email,
          },
        },
      ],
    },

    Email: {
      email,
    },

    Status: {
      select: {
        name: "New",
      },
    },

    "Supabase User ID": {
      rich_text: [
        {
          text: {
            content: userId,
          },
        },
      ],
    },

    "Signup Date": {
      date: {
        start: signupDate || new Date().toISOString(),
      },
    },

    "Last Synced": {
      date: {
        start: new Date().toISOString(),
      },
    },

    "Needs Human Help": {
      checkbox: false,
    },

    "Welcome Sent": {
      checkbox: false,
    },

    "Core Setup Sent": {
      checkbox: false,
    },

    "Activation Sent": {
      checkbox: false,
    },

    "Progress Sent": {
      checkbox: false,
    },

    "Reminder Sent": {
      checkbox: false,
    },

    "Completion Sent": {
      checkbox: false,
    },

    "Device Added": {
      checkbox: false,
    },

    "Document or Warranty Added": {
      checkbox: false,
    },

    "Maintenance Added": {
      checkbox: false,
    },
  };

  if (accountUrl) {
    properties["Account URL"] = {
      url: accountUrl,
    };
  }

  if (plan) {
    properties.Plan = {
      select: {
        name: plan,
      },
    };
  }

  if (source) {
    properties.Source = {
      select: {
        name: source,
      },
    };
  }

  return notion.pages.create({
    parent: {
      type: "data_source_id",
      data_source_id: getDataSourceId(),
    },

    properties,
  });
}
