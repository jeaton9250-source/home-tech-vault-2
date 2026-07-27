import type { SupabaseClient } from "@supabase/supabase-js";

import { RECEIPT_DOCUMENT_TYPES } from "@/lib/advisor/constants";
import type {
  HomeAdvisorConnector,
  HomeAdvisorContext,
  HomeAdvisorDevice,
  HomeAdvisorDocument,
  HomeAdvisorMaintenanceTask,
  HomeAdvisorSubscription,
} from "@/lib/advisor/types";
import {
  applyHouseholdScope,
  resolveHouseholdAccess,
} from "@/lib/data/householdScope";

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
  online: boolean | null;
  last_seen_at: string | null;
  network_updated_at: string | null;
  first_seen_at: string | null;
  created_at: string | null;
};

function normalizeDocumentType(
  value: string | null | undefined
): string {
  return (value ?? "").trim().toLowerCase();
}

function mapDevice(row: DeviceRow): HomeAdvisorDevice {
  return {
    id: row.id,
    device_name:
      row.device_name?.trim() || "Unnamed Device",
    brand: row.brand,
    location: row.location,
    category: row.category,
    serial_number: row.serial_number,
    purchase_date: row.purchase_date,
    purchase_price: row.purchase_price,
    warranty_date: row.warranty_date,
    online: row.online,
    last_seen_at: row.last_seen_at,
    network_updated_at: row.network_updated_at,
    first_seen_at: row.first_seen_at,
    created_at: row.created_at,
  };
}

export async function loadHomeAdvisorContext(
  client: SupabaseClient,
  userId: string,
  options?: {
    householdId?: string | null;
    householdOwnerId?: string | null;
    now?: Date;
  }
): Promise<HomeAdvisorContext> {
  let householdId = options?.householdId ?? null;

  if (options?.householdId === undefined) {
    const access = await resolveHouseholdAccess(
      userId,
      client
    );
    householdId = access.householdId;
  }

  const devicesResult = await applyHouseholdScope(
    client.from("devices").select(
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
      last_seen_at,
      network_updated_at,
      first_seen_at,
      created_at
    `
    ),
    householdId,
    userId
  );

  if (devicesResult.error) {
    throw devicesResult.error;
  }

  const deviceRows =
    (devicesResult.data ?? []) as DeviceRow[];
  const devices = deviceRows.map(mapDevice);
  const deviceIds = devices.map((device) => device.id);

  const [
    documentsResult,
    deviceDocumentsResult,
    imagesResult,
    maintenanceResult,
    subscriptionsResult,
    discoveriesResult,
    connectorsResult,
    networkCountResult,
  ] = await Promise.all([
    applyHouseholdScope(
      client
        .from("documents")
        .select("id, device_id, document_type"),
      householdId,
      userId
    ),

    deviceIds.length > 0
      ? client
          .from("device_documents")
          .select("device_id, document_type")
          .in("device_id", deviceIds)
      : Promise.resolve({
          data: [],
          error: null,
        }),

    deviceIds.length > 0
      ? client
          .from("device_images")
          .select("device_id")
          .in("device_id", deviceIds)
      : Promise.resolve({
          data: [],
          error: null,
        }),

    applyHouseholdScope(
      client
        .from("maintenance_tasks")
        .select(
          "id, device_id, title, due_date, completed"
        ),
      householdId,
      userId
    ),

    applyHouseholdScope(
      client
        .from("subscriptions")
        .select(
          "id, service_name, renewal_date, monthly_cost"
        ),
      householdId,
      userId
    ),

    householdId
      ? client
          .from("discovered_devices")
          .select(
            `
            id,
            hostname,
            manufacturer,
            friendly_name,
            identification_display_name,
            imported_device_id,
            ignored_at,
            first_seen_at,
            last_seen_at
          `
          )
          .eq("household_id", householdId)
          .is("imported_device_id", null)
          .is("ignored_at", null)
      : Promise.resolve({
          data: [],
          error: null,
        }),

    householdId
      ? client
          .from("connector_installations")
          .select(
            "id, status, last_seen_at, last_scan_at"
          )
          .eq("household_id", householdId)
          .neq("status", "revoked")
      : Promise.resolve({
          data: [],
          error: null,
        }),

    applyHouseholdScope(
      client
        .from("network_info")
        .select("id", {
          count: "exact",
          head: true,
        }),
      householdId,
      userId
    ),
  ]);

  const documents =
    (documentsResult.data ??
      []) as HomeAdvisorDocument[];

  const deviceDocumentRows =
    (deviceDocumentsResult.data ?? []) as Array<{
      device_id: string;
      document_type: string | null;
    }>;

  const deviceIdsWithPhotos = new Set(
    (
      (imagesResult.data ?? []) as Array<{
        device_id: string;
      }>
    ).map((image) => image.device_id)
  );

  const deviceIdsWithDocuments = new Set<string>();
  const deviceIdsWithReceipts = new Set<string>();

  for (const document of documents) {
    if (!document.device_id) {
      continue;
    }

    deviceIdsWithDocuments.add(document.device_id);

    if (
      RECEIPT_DOCUMENT_TYPES.has(
        normalizeDocumentType(
          document.document_type
        )
      )
    ) {
      deviceIdsWithReceipts.add(
        document.device_id
      );
    }
  }

  for (const document of deviceDocumentRows) {
    deviceIdsWithDocuments.add(document.device_id);

    if (
      RECEIPT_DOCUMENT_TYPES.has(
        normalizeDocumentType(
          document.document_type
        )
      )
    ) {
      deviceIdsWithReceipts.add(
        document.device_id
      );
    }
  }

  const maintenanceTasks =
    (maintenanceResult.data ??
      []) as HomeAdvisorMaintenanceTask[];

  const subscriptions =
    (subscriptionsResult.data ??
      []) as HomeAdvisorSubscription[];

  const pendingDiscoveries = (
    (discoveriesResult.data ?? []) as Array<{
      id: string;
      hostname: string | null;
      manufacturer: string | null;
      friendly_name: string | null;
      identification_display_name: string | null;
      imported_device_id: string | null;
      ignored_at: string | null;
      first_seen_at: string | null;
      last_seen_at: string | null;
    }>
  ).map((discovery) => ({
    id: discovery.id,
    label:
      discovery.identification_display_name?.trim() ||
      discovery.friendly_name?.trim() ||
      discovery.hostname?.trim() ||
      discovery.manufacturer?.trim() ||
      "Discovered device",
    hostname: discovery.hostname,
    manufacturer: discovery.manufacturer,
    imported_device_id:
      discovery.imported_device_id,
    ignored_at: discovery.ignored_at,
    first_seen_at: discovery.first_seen_at,
    last_seen_at: discovery.last_seen_at,
  }));

  const connectors =
    (connectorsResult.data ??
      []) as HomeAdvisorConnector[];

  const networkConfigured =
    !networkCountResult.error &&
    (networkCountResult.count ?? 0) > 0;

  return {
    userId,
    householdId,
    devices,
    documents,
    deviceIdsWithPhotos,
    deviceIdsWithDocuments,
    deviceIdsWithReceipts,
    maintenanceTasks,
    subscriptions,
    pendingDiscoveries,
    connectors,
    networkConfigured,
    now: options?.now ?? new Date(),
  };
}
