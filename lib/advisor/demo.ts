import { buildAdvisorInsightPayload } from "@/lib/advisor/buildInsights";
import { buildDeterministicAdvisorSummary } from "@/lib/advisor/summaryDeterministic";
import type {
  HomeAdvisorContext,
  HomeAdvisorResult,
} from "@/lib/advisor/types";
import {
  buildDemoDiscoveredDevices,
  demoDevices,
  demoDocuments,
  demoMaintenance,
  demoSubscriptions,
} from "@/lib/demoData";
import { DEMO_CONNECTOR_ID } from "@/lib/demo/demoDeviceNetworkProfiles";
import { demoTimestampDaysAgo } from "@/lib/demo/demoNetworkTime";

function buildDemoAdvisorContext(
  now = new Date("2026-07-26T12:00:00.000Z")
): HomeAdvisorContext {
  const deviceIdsWithPhotos = new Set(
    demoDevices
      .filter(
        (device) =>
          Boolean(device.photo_url?.trim()) ||
          Boolean(device.demo_image?.trim())
      )
      .map((device) => device.id)
  );

  const deviceIdsWithDocuments = new Set<string>();
  const deviceIdsWithReceipts = new Set<string>();

  for (const document of demoDocuments) {
    if (!document.device_id) {
      continue;
    }

    deviceIdsWithDocuments.add(document.device_id);

    if (
      document.document_type
        ?.trim()
        .toLowerCase() === "receipt"
    ) {
      deviceIdsWithReceipts.add(
        document.device_id
      );
    }
  }

  const pendingDiscoveries =
    buildDemoDiscoveredDevices()
      .filter(
        (discovery) =>
          !discovery.importedDeviceId &&
          !discovery.ignoredAt
      )
      .slice(0, 2)
      .map((discovery) => ({
        id: discovery.id,
        label:
          discovery.identificationDisplayName ||
          discovery.hostname ||
          discovery.manufacturer ||
          "Discovered device",
        hostname: discovery.hostname,
        manufacturer: discovery.manufacturer,
        imported_device_id: null,
        ignored_at: null,
        first_seen_at: discovery.firstSeenAt,
        last_seen_at: discovery.lastSeenAt,
      }));

  return {
    userId: "demo-user",
    householdId: "demo-household",
    devices: demoDevices.map((device) => ({
      id: device.id,
      device_name: device.device_name,
      brand: device.brand,
      location: device.location,
      category: device.category,
      serial_number: device.serial_number,
      purchase_date: device.purchase_date,
      purchase_price: device.purchase_price,
      warranty_date: device.warranty_date,
      online: device.online ?? null,
      last_seen_at:
        device.id === "demo-canon-printer"
          ? demoTimestampDaysAgo(4)
          : device.last_seen_at || null,
      network_updated_at:
        device.network_updated_at || null,
      first_seen_at: device.first_seen_at || null,
      created_at: null,
    })),
    documents: demoDocuments.map((document) => ({
      id: document.id,
      device_id: document.device_id || null,
      document_type: document.document_type,
    })),
    deviceIdsWithPhotos,
    deviceIdsWithDocuments,
    deviceIdsWithReceipts,
    maintenanceTasks: demoMaintenance.map(
      (task) => ({
        id: task.id,
        device_id: task.device_id,
        title: task.title,
        due_date: task.due_date,
        completed: false,
      })
    ),
    subscriptions: demoSubscriptions.map(
      (subscription) => ({
        id: subscription.id,
        service_name: subscription.service_name,
        renewal_date: subscription.renewal_date,
        monthly_cost: subscription.monthly_cost,
      })
    ),
    pendingDiscoveries,
    connectors: [
      {
        id: DEMO_CONNECTOR_ID,
        status: "active",
        last_seen_at: demoTimestampDaysAgo(21),
        last_scan_at: demoTimestampDaysAgo(0),
      },
    ],
    networkConfigured: true,
    now,
  };
}

export function buildDemoHomeAdvisorResult(
  options?: {
    dismissedIds?: Set<string>;
  }
): HomeAdvisorResult {
  const context = buildDemoAdvisorContext();
  const { insights, grouped } =
    buildAdvisorInsightPayload(context, {
      dismissedIds: options?.dismissedIds,
    });

  return {
    summary:
      buildDeterministicAdvisorSummary(
        insights
      ),
    summarySource: "deterministic",
    insights,
    grouped,
    generatedAt: context.now.toISOString(),
    insightCount: insights.length,
  };
}

export async function buildDemoHomeAdvisorResultAsync(
  options?: {
    dismissedIds?: Set<string>;
  }
): Promise<HomeAdvisorResult> {
  return buildDemoHomeAdvisorResult(options);
}

export async function getDemoHomeAdvisorResult(
  options?: {
    dismissedIds?: Set<string>;
  }
): Promise<HomeAdvisorResult> {
  return buildDemoHomeAdvisorResult(options);
}
