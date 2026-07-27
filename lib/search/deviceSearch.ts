import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { applyHouseholdScope } from "@/lib/data/householdScope";
import {
  runDeterministicSmartSearch,
  DEFAULT_SMART_SEARCH_SUGGESTIONS,
} from "@/lib/search/searchEngine";
import type { SmartSearchResponse } from "@/lib/search/searchTypes";

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

export async function runSmartSearch(options: {
  supabase: SupabaseClient;
  userId: string;
  householdId: string | null;
  householdOwnerId: string | null;
  query: string;
}): Promise<SmartSearchResponse> {
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

      applyHouseholdScope(
        options.supabase
          .from("discovered_devices")
          .select(
            "id, imported_device_id, friendly_name, hostname, manufacturer, model, serial_number, ip_address, mac_address, likely_category, online, last_seen_at"
          )
          .order("last_seen_at", { ascending: false }),
        options.householdId,
        options.userId
      ),
    ]);

  const unavailableCategories: string[] = [];

  if (devicesResult.error) {
    unavailableCategories.push("devices");
  }

  if (maintenanceResult.error) {
    unavailableCategories.push("maintenance");
  }

  if (documentsResult.error) {
    unavailableCategories.push("documents");
  }

  if (networkResult.error) {
    unavailableCategories.push("network");
  }

  const devices = devicesResult.error
    ? []
    : ((devicesResult.data ?? []) as DeviceRow[]);

  const maintenance = maintenanceResult.error
    ? []
    : ((maintenanceResult.data ?? []) as MaintenanceRow[]);

  const documents = documentsResult.error
    ? []
    : ((documentsResult.data ?? []) as DocumentRow[]);

  const network = networkResult.error
    ? []
    : ((networkResult.data ?? []) as NetworkDiscoveryRow[]);

  const response = runDeterministicSmartSearch({
    query: options.query,
    devices,
    maintenance,
    documents,
    network,
    suggestions: DEFAULT_SMART_SEARCH_SUGGESTIONS,
    unavailableCategories,
  });

  return response;
}