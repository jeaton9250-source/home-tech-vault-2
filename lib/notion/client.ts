import "server-only";

import { Client } from "@notionhq/client";

const notionToken = process.env.NOTION_TOKEN;
const onboardingDatabaseId =
  process.env.NOTION_ONBOARDING_DATABASE_ID;

if (!notionToken) {
  throw new Error("Missing NOTION_TOKEN environment variable");
}

if (!onboardingDatabaseId) {
  throw new Error(
    "Missing NOTION_ONBOARDING_DATABASE_ID environment variable"
  );
}

export const notion = new Client({
  auth: notionToken,
});

export const NOTION_ONBOARDING_DATABASE_ID =
  onboardingDatabaseId;
