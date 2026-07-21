import {
  demoDashboard,
  demoDevices,
  demoDocuments,
  demoMaintenance,
  demoSubscriptions,
} from "@/lib/demoData";
import { MORGAN_HOUSEHOLD } from "@/lib/demo/morganHousehold";
import {
  calculateHomeHealth,
  type HomeHealthResult,
} from "@/lib/home-health";
import type { HomeHealthHighlight } from "@/lib/home-health/types";

const demoHighlights: HomeHealthHighlight[] = [
  {
    id: "demo-highlight-tv-warranty",
    tone: "warning",
    message:
      "Samsung Frame TV warranty expires in 28 days.",
  },
  {
    id: "demo-highlight-router-firmware",
    tone: "warning",
    message:
      "UniFi Dream Router firmware update available.",
  },
  {
    id: "demo-highlight-receipt",
    tone: "positive",
    message:
      "Last receipt uploaded yesterday.",
  },
  {
    id: "demo-highlight-maintenance",
    tone: "warning",
    message:
      "Two maintenance reminders this month.",
  },
  {
    id: "demo-highlight-software",
    tone: "warning",
    message:
      "One software update available.",
  },
];

export function buildDemoHomeHealth(): HomeHealthResult {
  const deviceIdsWithDocuments = new Set(
    demoDocuments
      .map((document) => document.device_id)
      .filter(Boolean)
  );

  const deviceIdsWithPhotos = new Set(
    demoDevices
      .filter(
        (device) =>
          Boolean(device.photo_url?.trim()) ||
          Boolean(device.demo_image?.trim())
      )
      .map((device) => device.id)
  );

  const deviceIdsWithMaintenance = new Set(
    demoMaintenance
      .map((task) => task.device_id)
      .filter(Boolean)
  );

  const base = calculateHomeHealth({
    devices: demoDevices.map((device) => ({
      id: device.id,
      device_name: device.device_name,
      warranty_date: device.warranty_date || null,
      serial_number: device.serial_number,
      purchase_date: device.purchase_date,
    })),
    documentCount: demoDocuments.length,
    subscriptionCount: demoSubscriptions.length,
    networkConfigured: true,
    deviceIdsWithDocuments,
    deviceIdsWithPhotos,
    deviceIdsWithMaintenance,
    maintenanceTasks: demoMaintenance.map((task) => ({
      id: task.id,
      device_id: task.device_id,
      title: task.title,
      due_date: task.due_date,
      completed: false,
    })),
    hasRecentActivity: true,
    householdName: MORGAN_HOUSEHOLD.name,
    familyMemberCount: 4,
    profileHouseholdName: demoDashboard.householdName,
  });

  return {
    ...base,
    isEmpty: false,
    score: 92,
    status: "Excellent",
    statusMessage:
      "Everything is running smoothly today.",
    highlights: demoHighlights,
    vaultCompleteness: 92,
    recommendation: base.recommendation
      ? {
          ...base.recommendation,
          title: "Review Samsung Frame TV warranty",
          description:
            "Extended coverage expires in 28 days. Upload renewal details or set a reminder.",
          href: "/warranties",
        }
      : null,
  };
}
