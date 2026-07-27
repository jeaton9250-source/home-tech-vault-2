import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  applyHouseholdScope,
  applyOwnerUserScope,
} from "@/lib/data/householdScope";
import { parseSearchQuery } from "@/lib/search/queryParser";
import {
  emptySearchResults,
  type SmartSearchItem,
  type SmartSearchResponse,
} from "@/lib/search/searchTypes";

type DeviceRow = {
  id: string;
  device_name: string | null;
  brand: string | null;
  model_number: string | null;
  serial_number: string | null;
  category: string | null;
  location: string | null;
  notes: string | null;
  warranty_date: string | null;
  purchase_date: string | null;
  online?: boolean | null;
  ip_address?: string | null;
  mac_address?: string | null;
  manufacturer?: string | null;
};

type MaintenanceRow = {
  id: string;
  device_id: string | null;
  title: string | null;
  due_date: string | null;
  completed: boolean;
};

type DocumentRow = {
  id: string;
  device_id: string | null;
  file_name: string | null;
  document_name: string | null;
  file_type: string | null;
};

type NetworkDiscoveryRow = {
  id: string;
  imported_device_id: string | null;
  friendly_name: string | null;
  hostname: string | null;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  ip_address: string | null;
  mac_address: string | null;
  likely_category: string | null;
  online: boolean;
  last_seen_at: string | null;
};

const DEFAULT_SUGGESTIONS = [
  "Show me every Apple device",
  "Which devices are in the living room?",
  "What warranties expire soon?",
  "Find the serial number for my Samsung TV",
  "Which devices are offline?",
  "Show devices that need maintenance",
  "Where is my router receipt?",
  "What technology is more than five years old?",
];

const GROUP_LIMIT = 24;

function normalize(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function hasDateInFuture(value: string | null | undefined): boolean {
  if (!value) {
    return false;
  }

  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.getTime() >= Date.now();
}

function expiresSoon(value: string | null | undefined, days = 90): boolean {
  if (!value) {
    return false;
  }

  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const diffMs = date.getTime() - Date.now();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return diffDays >= 0 && diffDays <= days;
}

function ageInYears(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const now = new Date();
  let years = now.getFullYear() - date.getFullYear();

  const nowMonth = now.getMonth();
  const dateMonth = date.getMonth();

  if (
    nowMonth < dateMonth ||
    (nowMonth === dateMonth && now.getDate() < date.getDate())
  ) {
    years -= 1;
  }

  return years;
}

function includesEveryTerm(haystack: string, terms: string[]): boolean {
  return terms.every((term) => haystack.includes(term));
}

function buildDeviceHaystack(device: DeviceRow): string {
  return normalize(
    [
      device.device_name,
      device.brand,
      device.model_number,
      device.serial_number,
      device.category,
      device.location,
      device.notes,
      device.ip_address,
      device.mac_address,
      device.manufacturer,
    ].join(" ")
  );
}

function formatWarrantyStatus(value: string | null): string {
  if (!value) {
    return "Missing warranty";
  }

  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "Warranty date invalid";
  }

  if (date.getTime() < Date.now()) {
    return `Warranty expired on ${value}`;
  }

  return `Protected until ${value}`;
}

function matchesLocationHint(location: string | null, locationHint: string | null): boolean {
  if (!locationHint) {
    return true;
  }

  return normalize(location).includes(locationHint);
}

function uniqueById(items: SmartSearchItem[]): SmartSearchItem[] {
  const seen = new Set<string>();
  const output: SmartSearchItem[] = [];

  for (const item of items) {
    if (seen.has(item.id)) {
      continue;
    }

    seen.add(item.id);
    output.push(item);
  }

  return output;
}

export async function runSmartSearch(options: {
  supabase: SupabaseClient;
  userId: string;
  householdId: string | null;
  householdOwnerId: string | null;
  query: string;
}): Promise<SmartSearchResponse> {
  const intent = parseSearchQuery(options.query);

  if (!intent.normalized) {
    return {
      success: true,
      query: options.query,
      intent,
      results: emptySearchResults(),
      total: 0,
      suggestions: DEFAULT_SUGGESTIONS,
    };
  }

  const [devicesResult, maintenanceResult, documentsResult, networkResult] =
    await Promise.all([
      applyHouseholdScope(
        options.supabase
          .from("devices")
          .select(
            "id, device_name, brand, model_number, serial_number, category, location, notes, warranty_date, purchase_date, online, ip_address, mac_address, manufacturer"
          )
          .order("device_name", { ascending: true }),
        options.householdId,
        options.userId
      ),

      applyHouseholdScope(
        options.supabase
          .from("maintenance_tasks")
          .select("id, device_id, title, due_date, completed")
          .order("due_date", { ascending: true, nullsFirst: false }),
        options.householdId,
        options.userId
      ),

      applyHouseholdScope(
        options.supabase
          .from("documents")
          .select("id, device_id, file_name, document_name, file_type")
          .order("created_at", { ascending: false }),
        options.householdId,
        options.userId
      ),

      applyOwnerUserScope(
        options.supabase
          .from("network_discoveries")
          .select(
            "id, imported_device_id, friendly_name, hostname, manufacturer, model, serial_number, ip_address, mac_address, likely_category, online, last_seen_at"
          )
          .order("last_seen_at", { ascending: false }),
        options.householdId,
        options.userId,
        options.householdOwnerId
      ),
    ]);

  if (devicesResult.error) {
    throw devicesResult.error;
  }

  if (maintenanceResult.error) {
    throw maintenanceResult.error;
  }

  if (documentsResult.error) {
    throw documentsResult.error;
  }

  if (networkResult.error) {
    throw networkResult.error;
  }

  const devices = (devicesResult.data ?? []) as DeviceRow[];
  const maintenance = (maintenanceResult.data ?? []) as MaintenanceRow[];
  const documents = (documentsResult.data ?? []) as DocumentRow[];
  const network = (networkResult.data ?? []) as NetworkDiscoveryRow[];

  const deviceNameById = new Map<string, string>();

  for (const device of devices) {
    deviceNameById.set(
      device.id,
      device.device_name?.trim() || "Unnamed device"
    );
  }

  const results = emptySearchResults();

  for (const device of devices) {
    const haystack = buildDeviceHaystack(device);

    const tokenMatch = includesEveryTerm(haystack, intent.tokens);
    const phraseMatch = includesEveryTerm(haystack, intent.phrases);
    const locationMatch = matchesLocationHint(device.location, intent.locationHint);

    const onlineMatch = intent.wantsOnline ? device.online === true : true;
    const offlineMatch = intent.wantsOffline ? device.online === false : true;

    const ageYears = ageInYears(device.purchase_date);
    const ageMatch =
      intent.olderThanYears !== null
        ? (ageYears ?? -1) >= intent.olderThanYears
        : true;

    if (tokenMatch && phraseMatch && locationMatch && onlineMatch && offlineMatch && ageMatch) {
      results.devices.push({
        id: `device-${device.id}`,
        group: "devices",
        title: device.device_name?.trim() || "Unnamed device",
        subtitle: [device.brand, device.model_number].filter(Boolean).join(" • ") || null,
        location: device.location,
        status:
          device.online === true
            ? "Online"
            : device.online === false
              ? "Offline"
              : "Status unknown",
        href: `/devices/${device.id}`,
        match: {
          field: intent.wantsSerialNumber ? "Serial Number" : "Device",
          value:
            device.serial_number?.trim() ||
            device.device_name?.trim() ||
            "Device",
        },
      });
    }

    const shouldEvaluateWarranty =
      intent.wantsWarrantySoon ||
      intent.tokens.includes("warranty") ||
      intent.tokens.includes("warranties") ||
      /warrant/.test(intent.normalized);

    if (!shouldEvaluateWarranty) {
      continue;
    }

    if (intent.wantsWarrantySoon && !expiresSoon(device.warranty_date)) {
      continue;
    }

    if (!intent.wantsWarrantySoon && !hasDateInFuture(device.warranty_date) && !device.warranty_date) {
      continue;
    }

    results.warranties.push({
      id: `warranty-${device.id}`,
      group: "warranties",
      title: device.device_name?.trim() || "Unnamed device",
      subtitle: device.brand,
      location: device.location,
      status: formatWarrantyStatus(device.warranty_date),
      href: `/devices/${device.id}`,
      match: {
        field: "Warranty",
        value: device.warranty_date || "Not added",
      },
    });
  }

  for (const task of maintenance) {
    const deviceName =
      task.device_id ? deviceNameById.get(task.device_id) : null;

    const haystack = normalize(
      [task.title, deviceName, task.due_date].join(" ")
    );

    const tokenMatch = includesEveryTerm(haystack, intent.tokens);
    const phraseMatch = includesEveryTerm(haystack, intent.phrases);

    const dueDate = task.due_date ? new Date(`${task.due_date}T12:00:00`) : null;

    const needsAttention =
      !task.completed &&
      (!dueDate || Number.isNaN(dueDate.getTime()) || dueDate.getTime() <= Date.now() + 1000 * 60 * 60 * 24 * 30);

    if (intent.wantsMaintenance && !needsAttention) {
      continue;
    }

    if (!tokenMatch || !phraseMatch) {
      if (!intent.wantsMaintenance) {
        continue;
      }
    }

    results.maintenance.push({
      id: `maintenance-${task.id}`,
      group: "maintenance",
      title: task.title?.trim() || "Maintenance task",
      subtitle: deviceName ? `Device: ${deviceName}` : null,
      status: task.completed
        ? "Completed"
        : task.due_date
          ? `Due ${task.due_date}`
          : "Due date missing",
      href: "/maintenance",
      match: {
        field: "Maintenance",
        value: task.title?.trim() || "Task",
      },
    });
  }

  for (const document of documents) {
    const deviceName =
      document.device_id ? deviceNameById.get(document.device_id) : null;

    const displayName =
      document.document_name?.trim() ||
      document.file_name?.trim() ||
      "Untitled document";

    const haystack = normalize(
      [
        displayName,
        document.file_name,
        document.file_type,
        deviceName,
      ].join(" ")
    );

    const tokenMatch = includesEveryTerm(haystack, intent.tokens);
    const phraseMatch = includesEveryTerm(haystack, intent.phrases);

    if (!tokenMatch || !phraseMatch) {
      if (!intent.wantsDocuments) {
        continue;
      }
    }

    results.documents.push({
      id: `document-${document.id}`,
      group: "documents",
      title: displayName,
      subtitle: deviceName ? `For ${deviceName}` : null,
      status: document.file_type || "Document",
      href: document.device_id ? `/devices/${document.device_id}` : "/documents",
      match: {
        field: "Document",
        value: displayName,
      },
    });
  }

  for (const discovery of network) {
    const haystack = normalize(
      [
        discovery.friendly_name,
        discovery.hostname,
        discovery.manufacturer,
        discovery.model,
        discovery.serial_number,
        discovery.ip_address,
        discovery.mac_address,
        discovery.likely_category,
      ].join(" ")
    );

    const tokenMatch = includesEveryTerm(haystack, intent.tokens);
    const phraseMatch = includesEveryTerm(haystack, intent.phrases);
    const onlineMatch = intent.wantsOnline ? discovery.online === true : true;
    const offlineMatch = intent.wantsOffline ? discovery.online === false : true;

    if (!tokenMatch || !phraseMatch || !onlineMatch || !offlineMatch) {
      continue;
    }

    results.network.push({
      id: `network-${discovery.id}`,
      group: "network",
      title:
        discovery.friendly_name?.trim() ||
        discovery.hostname?.trim() ||
        discovery.model?.trim() ||
        "Network device",
      subtitle: [discovery.manufacturer, discovery.model]
        .filter(Boolean)
        .join(" • ") || null,
      status: discovery.online
        ? "Online"
        : "Offline",
      href: "/network?tab=discovery",
      match: {
        field: "Network",
        value:
          discovery.mac_address?.trim() ||
          discovery.ip_address?.trim() ||
          "Network record",
      },
    });
  }

  results.devices = uniqueById(results.devices).slice(0, GROUP_LIMIT);
  results.warranties = uniqueById(results.warranties).slice(0, GROUP_LIMIT);
  results.maintenance = uniqueById(results.maintenance).slice(0, GROUP_LIMIT);
  results.documents = uniqueById(results.documents).slice(0, GROUP_LIMIT);
  results.network = uniqueById(results.network).slice(0, GROUP_LIMIT);

  const total =
    results.devices.length +
    results.warranties.length +
    results.maintenance.length +
    results.documents.length +
    results.network.length;

  return {
    success: true,
    query: options.query,
    intent,
    results,
    total,
    suggestions: DEFAULT_SUGGESTIONS,
  };
}
