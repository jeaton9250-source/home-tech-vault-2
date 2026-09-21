import "server-only";

import { Client } from "@notionhq/client";

import {
  applyHouseholdScope,
  fetchHouseholdIdForUser,
} from "@/lib/data/householdScope";
import { createAdminClient } from "@/lib/supabase/admin";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const STATUS_RANK = {
  New: 0,
  Started: 1,
  "Core Setup": 2,
  Activated: 3,
  Complete: 4,
  "Needs Attention": 5,
} as const;

type OnboardingStatus = keyof typeof STATUS_RANK;

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

function getCurrentStatus(
  page: any
): OnboardingStatus {
  const property = page.properties?.Status;

  const name =
    property?.select?.name ??
    property?.status?.name ??
    "New";

  if (name in STATUS_RANK) {
    return name as OnboardingStatus;
  }

  return "New";
}

function getForwardStatus(
  current: OnboardingStatus,
  calculated: OnboardingStatus
): OnboardingStatus {
  // Needs Attention is an intentional exception state.
  // Do not automatically overwrite it.
  if (current === "Needs Attention") {
    return current;
  }

  return STATUS_RANK[calculated] >
    STATUS_RANK[current]
    ? calculated
    : current;
}

export async function syncNotionOnboardingProgress(
  userId: string
) {
  try {
    if (!process.env.NOTION_TOKEN) {
      console.warn(
        "Notion onboarding sync skipped: NOTION_TOKEN is not configured."
      );
      return;
    }

    if (!userId) {
      return;
    }

    const admin = createAdminClient();

    const {
      data: { user },
      error: userError,
    } =
      await admin.auth.admin.getUserById(
        userId
      );

    if (userError || !user) {
      console.error(
        "Notion onboarding sync could not load user:",
        userError
      );
      return;
    }

    const householdId =
      await fetchHouseholdIdForUser(
        userId,
        admin
      );

    const [
      deviceResult,
      documentResult,
      deviceDocumentResult,
      maintenanceResult,
    ] = await Promise.all([
      applyHouseholdScope(
        admin
          .from("devices")
          .select("id", {
            count: "exact",
            head: true,
          }),
        householdId,
        userId
      ),

      applyHouseholdScope(
        admin
          .from("documents")
          .select("id", {
            count: "exact",
            head: true,
          }),
        householdId,
        userId
      ),

      applyHouseholdScope(
        admin
          .from("device_documents")
          .select("id", {
            count: "exact",
            head: true,
          }),
        householdId,
        userId
      ),

      applyHouseholdScope(
        admin
          .from("maintenance_tasks")
          .select("id", {
            count: "exact",
            head: true,
          }),
        householdId,
        userId
      ),
    ]);

    const queryErrors = [
      deviceResult.error,
      documentResult.error,
      deviceDocumentResult.error,
      maintenanceResult.error,
    ].filter(Boolean);

    if (queryErrors.length > 0) {
      console.error(
        "Notion onboarding sync could not calculate HTV progress:",
        queryErrors
      );
      return;
    }

    const deviceAdded =
      (deviceResult.count ?? 0) > 0;

    const documentOrWarrantyAdded =
      (documentResult.count ?? 0) > 0 ||
      (deviceDocumentResult.count ?? 0) > 0;

    const maintenanceAdded =
      (maintenanceResult.count ?? 0) > 0;

    let calculatedStatus: OnboardingStatus =
      "New";

    if (deviceAdded) {
      calculatedStatus = "Started";
    }

    if (
      deviceAdded &&
      documentOrWarrantyAdded
    ) {
      calculatedStatus = "Core Setup";
    }

    if (
      deviceAdded &&
      documentOrWarrantyAdded &&
      maintenanceAdded
    ) {
      calculatedStatus = "Activated";
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

    const page = existing.results[0];

    if (!page) {
      console.warn(
        `Notion onboarding sync skipped: no onboarding record for ${userId}.`
      );
      return;
    }

    const currentStatus =
      getCurrentStatus(page);

    const pageProperties =
      (page as any).properties ?? {};

    const hadDeviceAdded =
      pageProperties["Device Added"]?.checkbox === true;

    const hadDocumentOrWarrantyAdded =
      pageProperties["Document or Warranty Added"]?.checkbox === true;

    const hadMaintenanceAdded =
      pageProperties["Maintenance Added"]?.checkbox === true;

    const permanentDeviceAdded =
      hadDeviceAdded || deviceAdded;

    const permanentDocumentOrWarrantyAdded =
      hadDocumentOrWarrantyAdded ||
      documentOrWarrantyAdded;

    const permanentMaintenanceAdded =
      hadMaintenanceAdded ||
      maintenanceAdded;

    const nextStatus =
      getForwardStatus(
        currentStatus,
        calculatedStatus
      );

    const now =
      new Date().toISOString();

    const progressed =
      nextStatus !== currentStatus ||
      (!hadDeviceAdded &&
        permanentDeviceAdded) ||
      (!hadDocumentOrWarrantyAdded &&
        permanentDocumentOrWarrantyAdded) ||
      (!hadMaintenanceAdded &&
        permanentMaintenanceAdded);

    const properties: Record<
      string,
      any
    > = {
      Status: {
        select: {
          name: nextStatus,
        },
      },

      "Device Added": {
        checkbox: permanentDeviceAdded,
      },

      "Document or Warranty Added": {
        checkbox:
          permanentDocumentOrWarrantyAdded,
      },

      "Maintenance Added": {
        checkbox:
          permanentMaintenanceAdded,
      },

      "Last Synced": {
        date: {
          start: now,
        },
      },
    };

    if (progressed) {
      properties["Last Progress"] = {
        date: {
          start: now,
        },
      };
    }

    await notion.pages.update({
      page_id: page.id,
      properties,
    });

    console.log(
      `Notion onboarding synced for ${user.email ?? userId}: ${currentStatus} → ${nextStatus}`
    );
  } catch (error) {
    // Notion must never be able to break an HTV customer action.
    console.error(
      "Notion onboarding progress sync failed:",
      error
    );
  }
}
