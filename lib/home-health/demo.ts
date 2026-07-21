import {
  demoDashboard,
  demoDevices,
  demoDocuments,
  demoMaintenance,
  demoSubscriptions,
} from "@/lib/demoData";
import {
  calculateHomeHealth,
  type HomeHealthResult,
} from "@/lib/home-health";

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
          Boolean(
            device.photo_url?.trim()
          ) ||
          Boolean(
            device.demo_image?.trim()
          )
      )
      .map((device) => device.id)
  );

  const deviceIdsWithMaintenance = new Set(
    demoMaintenance.map(
      (task) => task.device_id
    )
  );

  return calculateHomeHealth({
    devices: demoDevices.map((device) => ({
      id: device.id,
      device_name: device.device_name,
      warranty_date: device.warranty_date,
      serial_number: device.serial_number,
      purchase_date: device.purchase_date,
    })),
    documentCount: demoDocuments.length,
    subscriptionCount: demoSubscriptions.length,
    networkConfigured: true,
    deviceIdsWithDocuments,
    deviceIdsWithPhotos,
    deviceIdsWithMaintenance,
    maintenanceTasks: demoMaintenance.map(
      (task) => ({
        id: task.id,
        device_id: task.device_id,
        title: task.title,
        due_date: task.due_date,
        completed: false,
      })
    ),
    hasRecentActivity: true,
    householdName: demoDashboard.householdName,
    familyMemberCount: 3,
    profileHouseholdName:
      demoDashboard.householdName,
  });
}
