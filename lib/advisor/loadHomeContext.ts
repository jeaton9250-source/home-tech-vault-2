import type { SupabaseClient } from "@supabase/supabase-js";

import { RECEIPT_DOCUMENT_TYPES } from "@/lib/advisor/constants";
import {
  isMissingSchemaColumnError,
  logAdvisorStage,
  toAdvisorDbError,
} from "@/lib/advisor/logging";
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
  online?: boolean | null;
  last_seen_at?: string | null;
  network_updated_at?: string | null;
  first_seen_at?: string | null;
  created_at?: string | null;
};

type QueryResult<T> = {
  data: T;
  error: ReturnType<typeof toAdvisorDbError> | null;
};

const DEVICE_SELECT_FULL = `
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
`;

const DEVICE_SELECT_WITH_ONLINE = `
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
  created_at
`;

const DEVICE_SELECT_CORE = `
  id,
  device_name,
  brand,
  location,
  category,
  serial_number,
  purchase_date,
  purchase_price,
  warranty_date,
  created_at
`;

const DISCOVERY_SELECT_FULL = `
  id,
  hostname,
  manufacturer,
  friendly_name,
  identification_display_name,
  imported_device_id,
  ignored_at,
  first_seen_at,
  last_seen_at
`;

const DISCOVERY_SELECT_CORE = `
  id,
  hostname,
  manufacturer,
  imported_device_id,
  ignored_at,
  first_seen_at,
  last_seen_at
`;

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
    online: row.online ?? null,
    last_seen_at: row.last_seen_at ?? null,
    network_updated_at:
      row.network_updated_at ?? null,
    first_seen_at: row.first_seen_at ?? null,
    created_at: row.created_at ?? null,
  };
}

async function loadDevicesForAdvisor(
  client: SupabaseClient,
  householdId: string | null,
  userId: string
): Promise<QueryResult<HomeAdvisorDevice[]>> {
  const selects = [
    {
      name: "devices.full",
      columns: DEVICE_SELECT_FULL,
    },
    {
      name: "devices.with_online",
      columns: DEVICE_SELECT_WITH_ONLINE,
    },
    {
      name: "devices.core",
      columns: DEVICE_SELECT_CORE,
    },
  ];

  for (const select of selects) {
    logAdvisorStage("context.query.start", "context", {
      query: select.name,
    });

    const result = await applyHouseholdScope(
      client
        .from("devices")
        .select(select.columns),
      householdId,
      userId
    );

    if (!result.error) {
      logAdvisorStage(
        "context.query.success",
        "context",
        { query: select.name }
      );

      return {
        data: (
          (result.data ?? []) as DeviceRow[]
        ).map(mapDevice),
        error: null,
      };
    }

    const dbError = toAdvisorDbError(
      result.error
    );

    logAdvisorStage("context.query.error", "context", {
      query: select.name,
      error: dbError,
    });

    if (
      !isMissingSchemaColumnError(dbError)
    ) {
      return {
        data: [],
        error: dbError,
      };
    }
  }

  return {
    data: [],
    error: {
      code: "ADVISOR_DEVICES_UNAVAILABLE",
      message:
        "Unable to load device records for Home Advisor.",
    },
  };
}

async function runOptionalScopedQuery<T>(
  queryName: string,
  runner: () => Promise<{
    data: T | null;
    error: unknown;
  }>
): Promise<QueryResult<T>> {
  logAdvisorStage("context.query.start", "context", {
    query: queryName,
  });

  try {
    const result = await runner();

    if (result.error) {
      const dbError = toAdvisorDbError(
        result.error
      );

      logAdvisorStage("context.query.error", "context", {
        query: queryName,
        error: dbError,
      });

      return {
        data: [] as T,
        error: dbError,
      };
    }

    logAdvisorStage(
      "context.query.success",
      "context",
      { query: queryName }
    );

    return {
      data: (result.data ?? []) as T,
      error: null,
    };
  } catch (error) {
    const dbError = toAdvisorDbError(error);

    logAdvisorStage("context.query.error", "context", {
      query: queryName,
      error: dbError,
    });

    return {
      data: [] as T,
      error: dbError,
    };
  }
}

async function loadPendingDiscoveries(
  client: SupabaseClient,
  householdId: string | null
): Promise<
  QueryResult<
    HomeAdvisorContext["pendingDiscoveries"]
  >
> {
  if (!householdId) {
    return { data: [], error: null };
  }

  const selects = [
    {
      name: "discovered_devices.full",
      columns: DISCOVERY_SELECT_FULL,
    },
    {
      name: "discovered_devices.core",
      columns: DISCOVERY_SELECT_CORE,
    },
  ];

  for (const select of selects) {
    logAdvisorStage("context.query.start", "context", {
      query: select.name,
    });

    const result = await client
      .from("discovered_devices")
      .select(select.columns)
      .eq("household_id", householdId)
      .is("imported_device_id", null)
      .is("ignored_at", null);

    if (!result.error) {
      logAdvisorStage(
        "context.query.success",
        "context",
        { query: select.name }
      );

      type DiscoveryRow = {
        id: string;
        hostname: string | null;
        manufacturer: string | null;
        friendly_name?: string | null;
        identification_display_name?: string | null;
        imported_device_id: string | null;
        ignored_at: string | null;
        first_seen_at: string | null;
        last_seen_at: string | null;
      };

      return {
        data: (
          (result.data ?? []) as unknown as DiscoveryRow[]
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
        })),
        error: null,
      };
    }

    const dbError = toAdvisorDbError(
      result.error
    );

    logAdvisorStage("context.query.error", "context", {
      query: select.name,
      error: dbError,
    });

    if (
      !isMissingSchemaColumnError(dbError)
    ) {
      return { data: [], error: dbError };
    }
  }

  return { data: [], error: null };
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
    logAdvisorStage(
      "context.scope.resolve.start",
      "scope"
    );

    const access = await resolveHouseholdAccess(
      userId,
      client
    );
    householdId = access.householdId;

    logAdvisorStage(
      "context.scope.resolve.success",
      "scope"
    );
  }

  const devicesResult =
    await loadDevicesForAdvisor(
      client,
      householdId,
      userId
    );

  if (
    devicesResult.error &&
    devicesResult.data.length === 0
  ) {
    const failure = new Error(
      devicesResult.error.message ??
        "Unable to load device records for Home Advisor."
    ) as Error & { code?: string | null };

    failure.code = devicesResult.error.code ?? null;

    throw failure;
  }

  const devices = devicesResult.data;
  const deviceIds = devices.map(
    (device) => device.id
  );

  const [
    documentsSettled,
    deviceDocumentsSettled,
    imagesSettled,
    maintenanceSettled,
    subscriptionsSettled,
    discoveriesSettled,
    connectorsSettled,
    networkSettled,
  ] = await Promise.allSettled([
    runOptionalScopedQuery<
      Array<{
        id: string;
        device_id: string | null;
        file_type: string | null;
      }>
    >("documents", async () =>
      applyHouseholdScope(
        client
          .from("documents")
          .select(
            "id, device_id, file_type"
          ),
        householdId,
        userId
      )
    ),

    deviceIds.length > 0
      ? runOptionalScopedQuery<
          Array<{
            device_id: string;
            document_type: string | null;
          }>
        >("device_documents", async () =>
          client
            .from("device_documents")
            .select(
              "device_id, document_type"
            )
            .in("device_id", deviceIds)
        )
      : Promise.resolve<
          QueryResult<
            Array<{
              device_id: string;
              document_type: string | null;
            }>
          >
        >({
          data: [],
          error: null,
        }),

    deviceIds.length > 0
      ? runOptionalScopedQuery<
          Array<{ device_id: string }>
        >("device_images", async () =>
          client
            .from("device_images")
            .select("device_id")
            .in("device_id", deviceIds)
        )
      : Promise.resolve<
          QueryResult<
            Array<{ device_id: string }>
          >
        >({
          data: [],
          error: null,
        }),

    runOptionalScopedQuery<
      HomeAdvisorMaintenanceTask[]
    >("maintenance_tasks", async () =>
      applyHouseholdScope(
        client
          .from("maintenance_tasks")
          .select(
            "id, device_id, title, due_date, completed"
          ),
        householdId,
        userId
      )
    ),

    runOptionalScopedQuery<
      HomeAdvisorSubscription[]
    >("subscriptions", async () =>
      applyHouseholdScope(
        client
          .from("subscriptions")
          .select(
            "id, service_name, renewal_date, monthly_cost"
          ),
        householdId,
        userId
      )
    ),

    loadPendingDiscoveries(
      client,
      householdId
    ),

    householdId
      ? runOptionalScopedQuery<
          HomeAdvisorConnector[]
        >(
          "connector_installations",
          async () =>
            client
              .from(
                "connector_installations"
              )
              .select(
                "id, status, last_seen_at, last_scan_at"
              )
              .eq(
                "household_id",
                householdId
              )
              .neq("status", "revoked")
        )
      : Promise.resolve<
          QueryResult<
            HomeAdvisorConnector[]
          >
        >({
          data: [],
          error: null,
        }),

    runOptionalScopedQuery<{ id: string }[]>(
      "network_info.count",
      async () => {
        const result =
          await applyHouseholdScope(
            client
              .from("network_info")
              .select("id"),
            householdId,
            userId
          );

        return {
          data: (result.data ??
            []) as Array<{ id: string }>,
          error: result.error,
        };
      }
    ),
  ]);

  function unwrap<T>(
    settled: PromiseSettledResult<
      QueryResult<T>
    >,
    fallback: T
  ): T {
    if (settled.status === "rejected") {
      logAdvisorStage(
        "context.query.error",
        "context",
        {
          query: "optional.query",
          error: toAdvisorDbError(
            settled.reason
          ),
        }
      );
      return fallback;
    }

    return settled.value.data;
  }

  const rawDocuments = unwrap(
    documentsSettled,
    []
  );

  const documents: HomeAdvisorDocument[] =
    rawDocuments.map((document) => ({
      id: document.id,
      device_id: document.device_id,
      document_type: document.file_type,
    }));

  const deviceDocumentRows = unwrap(
    deviceDocumentsSettled,
    []
  );

  const deviceIdsWithPhotos = new Set(
    unwrap(imagesSettled, []).map(
      (image) => image.device_id
    )
  );

  const deviceIdsWithDocuments = new Set<string>();
  const deviceIdsWithReceipts = new Set<string>();

  for (const document of documents) {
    if (!document.device_id) {
      continue;
    }

    deviceIdsWithDocuments.add(
      document.device_id
    );

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
    deviceIdsWithDocuments.add(
      document.device_id
    );

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

  const maintenanceTasks = unwrap(
    maintenanceSettled,
    []
  );

  const subscriptions = unwrap(
    subscriptionsSettled,
    []
  );

  const pendingDiscoveries = unwrap(
    discoveriesSettled,
    []
  );

  const connectors = unwrap(
    connectorsSettled,
    []
  );

  const networkRows = unwrap(
    networkSettled,
    []
  );

  logAdvisorStage(
    "context.load.complete",
    "context",
    {
      query: "summary",
    }
  );

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
    networkConfigured: networkRows.length > 0,
    now: options?.now ?? new Date(),
  };
}
