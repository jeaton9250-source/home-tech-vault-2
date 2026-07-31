import "server-only";

import {
  getAdminDeviceOnlineStatus,
  getWarrantyStatus,
  type AdminDeviceOnlineStatus,
} from "@/lib/admin/devices/status";
import {
  buildPaginationMeta,
  parsePagination,
  type PaginationInput,
} from "@/lib/admin/pagination";
import type {
  AdminDeviceDetail,
  AdminDeviceListSummary,
  AdminDeviceSortOption,
  AdminDeviceSummary,
  AdminDeviceWarrantyStatus,
} from "@/lib/admin/types";
import { createAdminClient } from "@/lib/supabase/admin";

type DeviceRow = {
  id: string;
  device_name: string | null;
  brand: string | null;
  model_number: string | null;
  serial_number: string | null;
  category: string | null;
  household_id: string | null;
  online: boolean | null;
  last_seen_at: string | null;
  first_seen_at: string | null;
  network_updated_at: string | null;
  warranty_date: string | null;
  purchase_date: string | null;
  purchase_price: number | null;
  location: string | null;
  ip_address: string | null;
  mac_address: string | null;
  manufacturer: string | null;
  discovery_source: string | null;
  households:
    | {
        id: string;
        name: string;
        owner_id: string;
      }
    | {
        id: string;
        name: string;
        owner_id: string;
      }[]
    | null;
};

export type LoadAdminDevicesOptions = {
  pagination?: PaginationInput;
  q?: string;
  online?: AdminDeviceOnlineStatus | "";
  category?: string;
  warranty?: AdminDeviceWarrantyStatus | "";
  householdId?: string;
  createdFrom?: string;
  createdTo?: string;
  sort?: AdminDeviceSortOption | "";
};

const DEVICE_SELECT = `
  id,
  device_name,
  brand,
  model_number,
  serial_number,
  category,
  household_id,
  online,
  last_seen_at,
  first_seen_at,
  network_updated_at,
  warranty_date,
  purchase_date,
  purchase_price,
  location,
  ip_address,
  mac_address,
  manufacturer,
  discovery_source,
  households (
    id,
    name,
    owner_id
  )
`;

async function getAuthMap(
  admin: ReturnType<typeof createAdminClient>,
  userIds: string[]
) {
  const uniqueIds = [
    ...new Set(userIds.filter(Boolean)),
  ];

  const entries = await Promise.all(
    uniqueIds.map(async (id) => {
      const { data } =
        await admin.auth.admin.getUserById(id);

      return [
        id,
        {
          email: data.user?.email ?? null,
        },
      ] as const;
    })
  );

  return new Map(entries);
}

async function resolveOwnerIdsByEmail(
  admin: ReturnType<typeof createAdminClient>,
  term: string
): Promise<string[]> {
  const normalized = term.trim().toLowerCase();

  if (!normalized) {
    return [];
  }

  const ownerIds = new Set<string>();
  let page = 1;

  while (page <= 5) {
    const { data, error } =
      await admin.auth.admin.listUsers({
        page,
        perPage: 1000,
      });

    if (error) {
      throw error;
    }

    for (const user of data.users) {
      if (
        user.email
          ?.toLowerCase()
          .includes(normalized)
      ) {
        ownerIds.add(user.id);
      }
    }

    if (data.users.length < 1000) {
      break;
    }

    page += 1;
  }

  return [...ownerIds];
}

async function resolveSearchHouseholdIds(
  admin: ReturnType<typeof createAdminClient>,
  term: string
): Promise<string[]> {
  const trimmed = term.trim();

  if (!trimmed) {
    return [];
  }

  const householdIds = new Set<string>();
  const searchTerm = `%${trimmed}%`;

  const { data: householdsByName } = await admin
    .from("households")
    .select("id")
    .or(
      `name.ilike.${searchTerm},id.eq.${trimmed}`
    );

  householdsByName?.forEach((row) => {
    householdIds.add(row.id);
  });

  const { data: profiles } = await admin
    .from("profiles")
    .select("id")
    .ilike("full_name", searchTerm);

  const profileIds =
    profiles?.map((profile) => profile.id) ??
    [];

  if (profileIds.length > 0) {
    const { data: ownedHouseholds } = await admin
      .from("households")
      .select("id")
      .in("owner_id", profileIds);

    ownedHouseholds?.forEach((row) => {
      householdIds.add(row.id);
    });
  }

  const ownerIds =
    await resolveOwnerIdsByEmail(
      admin,
      trimmed
    );

  if (ownerIds.length > 0) {
    const { data: emailHouseholds } = await admin
      .from("households")
      .select("id")
      .in("owner_id", ownerIds);

    emailHouseholds?.forEach((row) => {
      householdIds.add(row.id);
    });
  }

  return [...householdIds];
}

function normalizeHousehold(
  value: DeviceRow["households"]
) {
  if (!value) {
    return null;
  }

  return Array.isArray(value)
    ? value[0] ?? null
    : value;
}

function applyWarrantyFilter<T extends {
  is: (column: string, value: null) => T;
  not: (column: string, operator: string, value: null) => T;
  lt: (column: string, value: string) => T;
  gte: (column: string, value: string) => T;
  lte: (column: string, value: string) => T;
  gt: (column: string, value: string) => T;
}>(
  query: T,
  warranty: AdminDeviceWarrantyStatus
) {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const expiringUntil = new Date(now);
  expiringUntil.setDate(
    expiringUntil.getDate() + 90
  );
  const expiringUntilDate = expiringUntil
    .toISOString()
    .slice(0, 10);

  switch (warranty) {
    case "missing":
      return query.is("warranty_date", null);
    case "expired":
      return query
        .not("warranty_date", "is", null)
        .lt("warranty_date", today);
    case "expiring":
      return query
        .gte("warranty_date", today)
        .lte(
          "warranty_date",
          expiringUntilDate
        );
    case "active":
      return query.gt(
        "warranty_date",
        expiringUntilDate
      );
    default:
      return query;
  }
}

function applySort<T extends {
  order: (
    column: string,
    options?: {
      ascending?: boolean;
      nullsFirst?: boolean;
      referencedTable?: string;
    }
  ) => T;
}>(
  query: T,
  sort: AdminDeviceSortOption
) {
  switch (sort) {
    case "oldest":
      return query.order("first_seen_at", {
        ascending: true,
      });
    case "name":
      return query.order("device_name", {
        ascending: true,
        nullsFirst: false,
      });
    case "household":
      return query.order("name", {
        ascending: true,
        referencedTable: "households",
      });
    case "last_seen":
      return query.order("last_seen_at", {
        ascending: false,
        nullsFirst: false,
      });
    case "warranty":
      return query.order("warranty_date", {
        ascending: true,
        nullsFirst: false,
      });
    case "newest":
    default:
      return query.order("first_seen_at", {
        ascending: false,
      });
  }
}

function buildFilteredQuery(
  admin: ReturnType<typeof createAdminClient>,
  options: LoadAdminDevicesOptions,
  searchHouseholdIds: string[] | null
) {
  let query = admin
    .from("devices")
    .select(DEVICE_SELECT, {
      count: "exact",
    });

  if (options.householdId?.trim()) {
    query = query.eq(
      "household_id",
      options.householdId.trim()
    );
  }

  if (options.category?.trim()) {
    query = query.eq(
      "category",
      options.category.trim()
    );
  }

  if (options.createdFrom?.trim()) {
    query = query.gte(
      "first_seen_at",
      `${options.createdFrom.trim()}T00:00:00.000Z`
    );
  }

  if (options.createdTo?.trim()) {
    query = query.lte(
      "first_seen_at",
      `${options.createdTo.trim()}T23:59:59.999Z`
    );
  }

  if (options.warranty) {
    query = applyWarrantyFilter(
      query,
      options.warranty
    );
  }

  const trimmedQuery = options.q?.trim();

  if (trimmedQuery) {
    const deviceTerm = `%${trimmedQuery}%`;
    const deviceFilters = [
      `device_name.ilike.${deviceTerm}`,
      `brand.ilike.${deviceTerm}`,
      `model_number.ilike.${deviceTerm}`,
      `serial_number.ilike.${deviceTerm}`,
      `id.eq.${trimmedQuery}`,
    ];

    if (
      searchHouseholdIds &&
      searchHouseholdIds.length > 0
    ) {
      deviceFilters.push(
        `household_id.in.(${searchHouseholdIds.join(",")})`
      );
    }

    query = query.or(deviceFilters.join(","));
  } else if (
    searchHouseholdIds &&
    searchHouseholdIds.length === 0
  ) {
    query = query.eq(
      "household_id",
      "00000000-0000-0000-0000-000000000000"
    );
  }

  return applySort(
    query,
    options.sort?.trim()
      ? (options.sort as AdminDeviceSortOption)
      : "newest"
  );
}

async function loadDocumentCounts(
  admin: ReturnType<typeof createAdminClient>,
  deviceIds: string[]
) {
  if (deviceIds.length === 0) {
    return new Map<string, number>();
  }

  const { data, error } = await admin
    .from("device_documents")
    .select("device_id")
    .in("device_id", deviceIds);

  if (error) {
    throw error;
  }

  const counts = new Map<string, number>();

  for (const row of data ?? []) {
    counts.set(
      row.device_id,
      (counts.get(row.device_id) ?? 0) + 1
    );
  }

  return counts;
}

async function loadPrimaryPhotoUrls(
  admin: ReturnType<typeof createAdminClient>,
  deviceIds: string[]
) {
  if (deviceIds.length === 0) {
    return new Map<string, string>();
  }

  const { data, error } = await admin
    .from("device_images")
    .select("device_id, image_url, created_at")
    .in("device_id", deviceIds)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(
      "Unable to load admin device images:",
      error
    );
    return new Map<string, string>();
  }

  const pathByDevice = new Map<string, string>();

  for (const row of data ?? []) {
    if (
      !row.device_id ||
      !row.image_url ||
      pathByDevice.has(row.device_id)
    ) {
      continue;
    }

    pathByDevice.set(row.device_id, row.image_url);
  }

  const entries = await Promise.all(
    [...pathByDevice.entries()].map(
      async ([deviceId, imagePath]) => {
        if (
          imagePath.startsWith("http://") ||
          imagePath.startsWith("https://") ||
          imagePath.startsWith("/")
        ) {
          return [deviceId, imagePath] as const;
        }

        const { data: signed, error: signedError } =
          await admin.storage
            .from("device-images")
            .createSignedUrl(imagePath, 3600);

        if (signedError || !signed?.signedUrl) {
          return [deviceId, null] as const;
        }

        return [deviceId, signed.signedUrl] as const;
      }
    )
  );

  return new Map(
    entries.filter(
      (entry): entry is readonly [string, string] =>
        Boolean(entry[1])
    )
  );
}

async function mapDeviceRows(
  admin: ReturnType<typeof createAdminClient>,
  rows: DeviceRow[]
): Promise<AdminDeviceSummary[]> {
  const ownerIds = rows
    .map((row) =>
      normalizeHousehold(row.households)?.owner_id
    )
    .filter(Boolean) as string[];

  const [authMap, documentCounts, photoUrls] =
    await Promise.all([
      getAuthMap(admin, ownerIds),
      loadDocumentCounts(
        admin,
        rows.map((row) => row.id)
      ),
      loadPrimaryPhotoUrls(
        admin,
        rows.map((row) => row.id)
      ),
    ]);

  const { data: ownerProfiles } =
    ownerIds.length > 0
      ? await admin
          .from("profiles")
          .select("id, full_name")
          .in("id", ownerIds)
      : { data: [] as Array<{
          id: string;
          full_name: string | null;
        }> };

  const ownerNameMap = new Map(
    (ownerProfiles ?? []).map((profile) => [
      profile.id,
      profile.full_name,
    ])
  );

  return rows.map((row) => {
    const household =
      normalizeHousehold(row.households);
    const warrantyStatus = getWarrantyStatus(
      row.warranty_date
    );

    return {
      id: row.id,
      deviceName: row.device_name,
      brand: row.brand,
      modelNumber: row.model_number,
      serialNumber: row.serial_number,
      category: row.category,
      photoUrl: photoUrls.get(row.id) ?? null,
      householdId: row.household_id,
      householdName: household?.name ?? null,
      householdOwnerId:
        household?.owner_id ?? null,
      householdOwnerName:
        household?.owner_id
          ? ownerNameMap
              .get(household.owner_id)
              ?.trim() || null
          : null,
      householdOwnerEmail:
        household?.owner_id
          ? authMap.get(household.owner_id)
              ?.email ?? null
          : null,
      onlineStatus: getAdminDeviceOnlineStatus({
        online: row.online,
        lastSeenAt: row.last_seen_at,
        firstSeenAt: row.first_seen_at,
        networkUpdatedAt:
          row.network_updated_at,
      }),
      lastSeenAt: row.last_seen_at,
      warrantyDate: row.warranty_date,
      warrantyStatus,
      documentCount:
        documentCounts.get(row.id) ?? 0,
      createdAt: row.first_seen_at,
    };
  });
}

function buildSummary(
  devices: Array<{
    onlineStatus: AdminDeviceOnlineStatus;
    warrantyStatus: AdminDeviceWarrantyStatus;
  }>,
  scope: AdminDeviceListSummary["scope"]
): AdminDeviceListSummary {
  return {
    totalDevices: devices.length,
    online: devices.filter(
      (device) =>
        device.onlineStatus === "online"
    ).length,
    offline: devices.filter(
      (device) =>
        device.onlineStatus === "offline"
    ).length,
    unknown: devices.filter(
      (device) =>
        device.onlineStatus === "unknown"
    ).length,
    expiringWarranties: devices.filter(
      (device) =>
        device.warrantyStatus === "expiring"
    ).length,
    scope,
  };
}

function hasActiveFilters(
  options: LoadAdminDevicesOptions
) {
  return Boolean(
    options.q?.trim() ||
      options.online ||
      options.category?.trim() ||
      options.warranty ||
      options.householdId?.trim() ||
      options.createdFrom?.trim() ||
      options.createdTo?.trim()
  );
}

async function loadPresenceRows(
  admin: ReturnType<typeof createAdminClient>,
  options: LoadAdminDevicesOptions,
  searchHouseholdIds: string[] | null
) {
  let query = admin
    .from("devices")
    .select(
      "id, online, last_seen_at, first_seen_at, network_updated_at, warranty_date"
    );

  if (options.householdId?.trim()) {
    query = query.eq(
      "household_id",
      options.householdId.trim()
    );
  }

  if (options.category?.trim()) {
    query = query.eq(
      "category",
      options.category.trim()
    );
  }

  if (options.createdFrom?.trim()) {
    query = query.gte(
      "first_seen_at",
      `${options.createdFrom.trim()}T00:00:00.000Z`
    );
  }

  if (options.createdTo?.trim()) {
    query = query.lte(
      "first_seen_at",
      `${options.createdTo.trim()}T23:59:59.999Z`
    );
  }

  if (options.warranty) {
    query = applyWarrantyFilter(
      query,
      options.warranty
    );
  }

  const trimmedQuery = options.q?.trim();

  if (trimmedQuery) {
    const deviceTerm = `%${trimmedQuery}%`;
    const deviceFilters = [
      `device_name.ilike.${deviceTerm}`,
      `brand.ilike.${deviceTerm}`,
      `model_number.ilike.${deviceTerm}`,
      `serial_number.ilike.${deviceTerm}`,
      `id.eq.${trimmedQuery}`,
    ];

    if (
      searchHouseholdIds &&
      searchHouseholdIds.length > 0
    ) {
      deviceFilters.push(
        `household_id.in.(${searchHouseholdIds.join(",")})`
      );
    }

    query = query.or(deviceFilters.join(","));
  } else if (
    searchHouseholdIds &&
    searchHouseholdIds.length === 0
  ) {
    return [];
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    onlineStatus: getAdminDeviceOnlineStatus({
      online: row.online as boolean | null,
      lastSeenAt:
        row.last_seen_at as string | null,
      firstSeenAt:
        row.first_seen_at as string | null,
      networkUpdatedAt:
        row.network_updated_at as string | null,
    }),
    warrantyStatus: getWarrantyStatus(
      row.warranty_date as string | null
    ),
  }));
}

function sortDeviceRows(
  rows: DeviceRow[],
  sort: AdminDeviceSortOption
) {
  const sorted = [...rows];

  sorted.sort((left, right) => {
    switch (sort) {
      case "oldest":
        return (
          new Date(left.first_seen_at ?? 0).getTime() -
          new Date(right.first_seen_at ?? 0).getTime()
        );
      case "name":
        return (
          left.device_name ?? ""
        ).localeCompare(
          right.device_name ?? ""
        );
      case "household":
        return (
          normalizeHousehold(left.households)
            ?.name ?? ""
        ).localeCompare(
          normalizeHousehold(right.households)
            ?.name ?? ""
        );
      case "last_seen":
        return (
          new Date(
            right.last_seen_at ?? 0
          ).getTime() -
          new Date(
            left.last_seen_at ?? 0
          ).getTime()
        );
      case "warranty":
        return (
          new Date(
            left.warranty_date ?? "9999-12-31"
          ).getTime() -
          new Date(
            right.warranty_date ?? "9999-12-31"
          ).getTime()
        );
      case "newest":
      default:
        return (
          new Date(right.first_seen_at ?? 0).getTime() -
          new Date(left.first_seen_at ?? 0).getTime()
        );
    }
  });

  return sorted;
}

export async function loadAdminDevices(
  options: LoadAdminDevicesOptions
) {
  const admin = createAdminClient();
  const pagination = parsePagination(
    options.pagination ?? {},
    25
  );

  const searchHouseholdIds = options.q?.trim()
    ? await resolveSearchHouseholdIds(
        admin,
        options.q
      )
    : null;

  const filtersActive = hasActiveFilters(options);
  const onlineFilter = options.online?.trim()
    ? (options.online as AdminDeviceOnlineStatus)
    : null;
  const sortOption = options.sort?.trim()
    ? (options.sort as AdminDeviceSortOption)
    : "newest";

  if (onlineFilter) {
    const presenceRows =
      await loadPresenceRows(
        admin,
        options,
        searchHouseholdIds
      );

    const filteredPresence = presenceRows.filter(
      (row) =>
        row.onlineStatus === onlineFilter
    );

    const summary = buildSummary(
      filteredPresence,
      filtersActive ? "filtered" : "platform"
    );

    if (filteredPresence.length === 0) {
      return {
        devices: [] as AdminDeviceSummary[],
        summary,
        pagination: buildPaginationMeta(
          0,
          pagination
        ),
      };
    }

    const { data, error } = await admin
      .from("devices")
      .select(DEVICE_SELECT)
      .in(
        "id",
        filteredPresence.map((row) => row.id)
      );

    if (error) {
      throw error;
    }

    const orderedRows = sortDeviceRows(
      (data ?? []) as DeviceRow[],
      sortOption
    );

    const pageRows = orderedRows.slice(
      pagination.from,
      pagination.to + 1
    );

    const devices = await mapDeviceRows(
      admin,
      pageRows
    );

    return {
      devices,
      summary,
      pagination: buildPaginationMeta(
        orderedRows.length,
        pagination
      ),
    };
  }

  const query = buildFilteredQuery(
    admin,
    options,
    searchHouseholdIds
  );

  const [
    pageResult,
    presenceRows,
  ] = await Promise.all([
    query.range(
      pagination.from,
      pagination.to
    ),
    loadPresenceRows(
      admin,
      options,
      searchHouseholdIds
    ),
  ]);

  if (pageResult.error) {
    throw pageResult.error;
  }

  const summary = buildSummary(
    presenceRows,
    filtersActive ? "filtered" : "platform"
  );

  const devices = await mapDeviceRows(
    admin,
    (pageResult.data ??
      []) as DeviceRow[]
  );

  return {
    devices,
    summary,
    pagination: buildPaginationMeta(
      pageResult.count ?? 0,
      pagination
    ),
  };
}

export async function loadAdminDeviceDetail(
  deviceId: string
): Promise<AdminDeviceDetail | null> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("devices")
    .select(DEVICE_SELECT)
    .eq("id", deviceId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const [summaries, photoCount, maintenanceCount] =
    await Promise.all([
      mapDeviceRows(admin, [
        data as DeviceRow,
      ]),
      admin
        .from("device_images")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("device_id", deviceId),
      admin
        .from("maintenance_tasks")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("device_id", deviceId),
    ]);

  const summary = summaries[0];

  if (!summary) {
    return null;
  }

  const row = data as DeviceRow;

  return {
    ...summary,
    purchaseDate: row.purchase_date,
    purchasePrice: row.purchase_price,
    location: row.location,
    ipAddress: row.ip_address,
    macAddress: row.mac_address,
    manufacturer: row.manufacturer,
    discoverySource: row.discovery_source,
    firstSeenAt: row.first_seen_at,
    networkUpdatedAt: row.network_updated_at,
    photoCount: photoCount.count ?? 0,
    maintenanceCount:
      maintenanceCount.count ?? 0,
  };
}

export async function loadAdminDeviceCategories() {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("devices")
    .select("category")
    .not("category", "is", null)
    .order("category", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  const categories = new Set<string>();

  for (const row of data ?? []) {
    const category = row.category?.trim();

    if (category) {
      categories.add(category);
    }
  }

  return [...categories];
}

export async function loadAdminDeviceHouseholdOptions() {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("households")
    .select("id, name")
    .order("name", {
      ascending: true,
    })
    .limit(200);

  if (error) {
    throw error;
  }

  return (data ?? []).map((household) => ({
    value: household.id,
    label: household.name,
  }));
}
