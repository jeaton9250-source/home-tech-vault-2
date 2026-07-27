import type { User } from "@supabase/supabase-js";

import type { DashboardOverviewStats } from "@/lib/dashboard/types";
import { applyHouseholdScope } from "@/lib/data/householdScope";
import {
  calculateHomeHealth,
  type HomeHealthInput,
  type HomeHealthMaintenanceTask,
  type HomeHealthResult,
} from "@/lib/home-health";
import { getWarrantyStatus } from "@/lib/home-health/warranty";
import {
  calculateVaultScore,
  type VaultDevice,
  type VaultScoreResult,
} from "@/lib/calculateVaultScore";
import { supabase } from "@/lib/supabase";

type DeviceRow = {
  id: string;
  device_name: string | null;
  brand: string | null;
  location: string | null;
  category: string | null;
  serial_number: string | null;
  purchase_date: string | null;
  purchase_price: number | null;
  warranty_date: string | null;
  online?: boolean | null;
  notes?: string | null;
};

export type DashboardMetrics = {
  firstName: string;
  householdName: string;
  deviceCount: number;
  documentCount: number;
  roomCount: number;
  familyMemberCount: number;
  protectedValue: number;
  networkConfigured: boolean;
  vaultScore: VaultScoreResult;
  homeHealth: HomeHealthResult;
  overviewStats: DashboardOverviewStats;
};

const defaultVaultScore: VaultScoreResult = {
  total: 0,
  protection: 0,
  organization: 0,
  documentation: 0,
  maintenance: 0,
  label: "Get Started",
  recommendations: [],
};

function getRecentActivityCutoff() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  return cutoff.toISOString();
}

export async function loadDashboardMetrics(
  user: User,
  householdId: string | null | undefined
): Promise<DashboardMetrics> {
  const [profileResult, devicesResult] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, household_name")
        .eq("id", user.id)
        .maybeSingle(),

      applyHouseholdScope(
        supabase.from("devices").select(
          `
          id,
          device_name,
          brand,
          location,
          category,
          serial_number,
          purchase_date,
          purchase_price,
          warranty_date,
          online,
          notes
        `
        ),
        householdId,
        user.id
      ),
    ]);

  if (devicesResult.error) {
    throw devicesResult.error;
  }

  const profile = profileResult.data;

  const displayName =
    profile?.full_name?.trim() ||
    user.email?.split("@")[0] ||
    "Homeowner";

  const firstName =
    displayName.split(" ")[0];

  const householdName =
    profile?.household_name?.trim() ||
    `${firstName}'s Home Tech Vault`;

  const deviceRows =
    (devicesResult.data ?? []) as DeviceRow[];

  const deviceIds = deviceRows.map(
    (device) => device.id
  );

  const [
    documentsCountResult,
    deviceDocumentsResult,
    maintenanceResult,
    imagesResult,
    membersResult,
    networkCountResult,
    subscriptionsCountResult,
    recentActivityResult,
  ] = await Promise.all([
    applyHouseholdScope(
      supabase
        .from("documents")
        .select("id", {
          count: "exact",
          head: true,
        }),
      householdId,
      user.id
    ),

    deviceIds.length > 0
      ? supabase
          .from("device_documents")
          .select("device_id")
          .in("device_id", deviceIds)
      : Promise.resolve({
          data: [],
          error: null,
        }),

    applyHouseholdScope(
      supabase
        .from("maintenance_tasks")
        .select(
          "id, device_id, title, due_date, completed"
        ),
      householdId,
      user.id
    ),

    deviceIds.length > 0
      ? supabase
          .from("device_images")
          .select("device_id")
          .in("device_id", deviceIds)
      : Promise.resolve({
          data: [],
          error: null,
        }),

    householdId
      ? supabase
          .from("household_members")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("household_id", householdId)
      : Promise.resolve({
          count: 1,
          error: null,
        }),

    applyHouseholdScope(
      supabase
        .from("network_info")
        .select("id", {
          count: "exact",
          head: true,
        }),
      householdId,
      user.id
    ),

    applyHouseholdScope(
      supabase
        .from("subscriptions")
        .select("id", {
          count: "exact",
          head: true,
        }),
      householdId,
      user.id
    ),

    deviceIds.length > 0
      ? supabase
          .from("device_events")
          .select("id", {
            count: "exact",
            head: true,
          })
          .in("device_id", deviceIds)
          .gte(
            "event_date",
            getRecentActivityCutoff()
          )
      : Promise.resolve({
          count: 0,
          error: null,
        }),
  ]);

  const rooms = new Set(
    deviceRows
      .map((device) =>
        device.location?.trim()
      )
      .filter(Boolean)
  );

  const vaultDevices: VaultDevice[] =
    deviceRows.map((device) => ({
      id: device.id,
      device_name: device.device_name || "",
      brand: device.brand || "",
      category: device.category || "",
      serial_number:
        device.serial_number || "",
      purchase_date:
        device.purchase_date || "",
      warranty_date:
        device.warranty_date || "",
      purchase_price:
        device.purchase_price || 0,
      location: device.location || "",
      notes: device.notes || "",
    }));

  const deviceIdsWithPhotos = new Set(
    (
      (imagesResult.data ?? []) as {
        device_id: string;
      }[]
    ).map((image) => image.device_id)
  );

  const deviceIdsWithDocuments = new Set(
    (
      (deviceDocumentsResult.data ??
        []) as { device_id: string }[]
    ).map((document) => document.device_id)
  );

  const maintenanceTasks =
    (maintenanceResult.data ??
      []) as HomeHealthMaintenanceTask[];

  const deviceIdsWithMaintenance = new Set(
    maintenanceTasks
      .map((task) => task.device_id)
      .filter(
        (deviceId): deviceId is string =>
          Boolean(deviceId)
      )
  );

  const documentCount =
    documentsCountResult.error
      ? 0
      : documentsCountResult.count || 0;

  const networkConfigured =
    networkCountResult.error
      ? false
      : (networkCountResult.count ?? 0) > 0;

  const subscriptionCount =
    subscriptionsCountResult.error
      ? 0
      : subscriptionsCountResult.count || 0;

  const hasRecentActivity =
    !recentActivityResult.error &&
    (recentActivityResult.count ?? 0) > 0;

  const familyMemberCount =
    membersResult.error
      ? 1
      : membersResult.count || 1;

  const onlineDeviceCount =
    deviceRows.filter(
      (device) => device.online === true
    ).length;

  const offlineDeviceCount =
    deviceRows.filter(
      (device) => device.online === false
    ).length;

  const activeWarrantyCount =
    deviceRows.filter((device) => {
      const status = getWarrantyStatus(
        device.warranty_date
      );

      return (
        status === "active" ||
        status === "expiring"
      );
    }).length;

  const overviewStats: DashboardOverviewStats =
    {
      deviceCount: deviceRows.length,
      onlineDeviceCount,
      offlineDeviceCount,
      documentCount,
      activeWarrantyCount,
      familyMemberCount,
    };

  const homeHealthInput: HomeHealthInput = {
    devices: deviceRows.map((device) => ({
      id: device.id,
      device_name:
        device.device_name?.trim() ||
        "Unnamed Device",
      warranty_date: device.warranty_date,
      serial_number: device.serial_number,
      purchase_date: device.purchase_date,
    })),
    documentCount,
    subscriptionCount,
    networkConfigured,
    deviceIdsWithDocuments,
    deviceIdsWithPhotos,
    deviceIdsWithMaintenance,
    maintenanceTasks,
    hasRecentActivity,
    householdName,
    familyMemberCount,
    profileHouseholdName:
      profile?.household_name ?? null,
  };

  const vaultScore =
    deviceRows.length === 0
      ? defaultVaultScore
      : calculateVaultScore({
          devices: vaultDevices,
          deviceIdsWithPhotos,
          deviceIdsWithDocuments,
          deviceIdsWithMaintenance,
        });

  return {
    firstName,
    householdName,
    deviceCount: deviceRows.length,
    documentCount,
    roomCount: rooms.size,
    familyMemberCount,
    protectedValue: deviceRows.reduce(
      (total, device) =>
        total +
        Number(device.purchase_price || 0),
      0
    ),
    networkConfigured,
    vaultScore,
    homeHealth:
      calculateHomeHealth(homeHealthInput),
    overviewStats,
  };
}
