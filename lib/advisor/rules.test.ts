import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildAdvisorInsightPayload } from "@/lib/advisor/buildInsights";
import { buildDeterministicAdvisorSummary } from "@/lib/advisor/summaryDeterministic";
import type { HomeAdvisorContext } from "@/lib/advisor/types";

function buildContext(
  overrides: Partial<HomeAdvisorContext> = {}
): HomeAdvisorContext {
  return {
    userId: "user-1",
    householdId: "household-1",
    devices: [],
    documents: [],
    deviceIdsWithPhotos: new Set(),
    deviceIdsWithDocuments: new Set(),
    deviceIdsWithReceipts: new Set(),
    maintenanceTasks: [],
    subscriptions: [],
    pendingDiscoveries: [],
    connectors: [],
    networkConfigured: false,
    now: new Date("2026-07-26T12:00:00.000Z"),
    ...overrides,
  };
}

describe("home advisor rules", () => {
  it("flags devices offline for more than three days", () => {
    const { insights } = buildAdvisorInsightPayload(
      buildContext({
        devices: [
          {
            id: "printer-1",
            device_name: "Epson Printer",
            brand: "Epson",
            location: "Office",
            category: "Printer",
            serial_number: "EPS-001",
            purchase_date: "2022-01-01",
            purchase_price: 249,
            warranty_date: "2025-01-01",
            online: false,
            last_seen_at: "2026-07-22T12:00:00.000Z",
            network_updated_at: null,
            first_seen_at: null,
            created_at: null,
          },
        ],
      })
    );

    assert.ok(
      insights.some(
        (insight) =>
          insight.ruleId === "device_offline"
      )
    );
  });

  it("groups expiring warranties as attention insights", () => {
    const { insights } = buildAdvisorInsightPayload(
      buildContext({
        devices: [
          {
            id: "tv-1",
            device_name: "Living Room TV",
            brand: "Samsung",
            location: "Living Room",
            category: "TV",
            serial_number: "TV-1",
            purchase_date: "2024-01-01",
            purchase_price: 1200,
            warranty_date: "2026-08-10",
            online: true,
            last_seen_at: "2026-07-26T10:00:00.000Z",
            network_updated_at: null,
            first_seen_at: null,
            created_at: null,
          },
          {
            id: "tv-2",
            device_name: "Bedroom TV",
            brand: "LG",
            location: "Bedroom",
            category: "TV",
            serial_number: "TV-2",
            purchase_date: "2024-01-01",
            purchase_price: 900,
            warranty_date: "2026-08-12",
            online: true,
            last_seen_at: "2026-07-26T10:00:00.000Z",
            network_updated_at: null,
            first_seen_at: null,
            created_at: null,
          },
        ],
      })
    );

    assert.ok(
      insights.some(
        (insight) =>
          insight.ruleId ===
            "warranty_expiring" &&
          insight.group === "attention"
      )
    );
  });

  it("builds a deterministic summary from insight messages only", () => {
    const summary =
      buildDeterministicAdvisorSummary([
        {
          id: "1",
          group: "attention",
          ruleId: "warranty_expiring",
          title: "Warranties expiring soon",
          message:
            "2 warranties expire within 30 days.",
          priority: 80,
          actions: [],
        },
        {
          id: "2",
          group: "good",
          ruleId: "maintenance_clear",
          title: "Maintenance on track",
          message:
            "No maintenance is due this week.",
          priority: 20,
          actions: [],
        },
      ]);

    assert.match(summary, /2 warranties expire/i);
    assert.match(
      summary,
      /no maintenance is due this week/i
    );
  });

  it("limits insight count between three and eight when enough rules match", () => {
    const { insights } = buildAdvisorInsightPayload(
      buildContext({
        devices: [
          {
            id: "device-1",
            device_name: "Apple TV 4K",
            brand: "Apple",
            location: "",
            category: "Streaming",
            serial_number: null,
            purchase_date: null,
            purchase_price: 149,
            warranty_date: null,
            online: false,
            last_seen_at: "2026-07-20T12:00:00.000Z",
            network_updated_at: null,
            first_seen_at: null,
            created_at: null,
          },
          {
            id: "device-2",
            device_name: "Old Router",
            brand: "Netgear",
            location: "Office",
            category: "Network Equipment",
            serial_number: "RTR-1",
            purchase_date: "2018-05-01",
            purchase_price: 199,
            warranty_date: "2021-05-01",
            online: true,
            last_seen_at: "2026-07-26T10:00:00.000Z",
            network_updated_at: null,
            first_seen_at: null,
            created_at: null,
          },
        ],
        pendingDiscoveries: [
          {
            id: "disc-1",
            label: "Nest Thermostat",
            hostname: "nest.local",
            manufacturer: "Google",
            imported_device_id: null,
            ignored_at: null,
            first_seen_at: "2026-07-24T12:00:00.000Z",
            last_seen_at: "2026-07-26T10:00:00.000Z",
          },
        ],
      })
    );

    assert.ok(insights.length >= 3);
    assert.ok(insights.length <= 8);
  });
});
