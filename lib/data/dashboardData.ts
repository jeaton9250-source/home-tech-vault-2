import type { User } from "@supabase/supabase-js";

import { applyHouseholdScope } from "@/lib/data/householdScope";
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
  vaultScore: VaultScoreResult;
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
        .select("device_id"),
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

  const deviceIdsWithMaintenance = new Set(
    (
      (maintenanceResult.data ?? []) as {
        device_id: string;
      }[]
    ).map(
      (maintenance) => maintenance.device_id
    )
  );

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
    documentCount: documentsCountResult.error
      ? 0
      : documentsCountResult.count || 0,
    roomCount: rooms.size,
    familyMemberCount: membersResult.error
      ? 1
      : membersResult.count || 1,
    protectedValue: deviceRows.reduce(
      (total, device) =>
        total +
        Number(device.purchase_price || 0),
      0
    ),
    vaultScore,
  };
}
