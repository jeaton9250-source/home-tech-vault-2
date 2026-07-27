import { buildDemoDiscoveredDevices } from "@/lib/demo/demoConnectorExperience";
import { morganDocuments } from "@/lib/demo/morganDocuments";
import { morganDevices } from "@/lib/demo/morganDevices";
import { morganMaintenance } from "@/lib/demo/morganMaintenance";
import { cleanDiscoveredHostname } from "@/lib/connector/deviceIdentification";
import {
  runDeterministicSmartSearch,
  type SmartSearchDataSet,
} from "@/lib/search/searchEngine";

function buildDemoNetworkRecords(): SmartSearchDataSet["network"] {
  return buildDemoDiscoveredDevices().map((device) => ({
    id: device.id,
    friendly_name:
      device.friendlyName ??
      device.identificationDisplayName ??
      cleanDiscoveredHostname(device.hostname) ??
      device.model ??
      "Demo device",
    hostname: device.hostname,
    manufacturer: device.manufacturer ?? device.likelyBrand ?? null,
    model: device.model ?? null,
    serial_number: device.serialNumber ?? null,
    ip_address: device.ipAddress ?? null,
    mac_address: device.macAddress ?? null,
    likely_category: device.likelyCategory ?? null,
    online: device.online,
    imported_device_id: device.importedDeviceId ?? null,
    last_seen_at: device.lastSeenAt ?? null,
  }));
}

export function buildDemoSmartSearchResponse(query: string) {
  const dataset: SmartSearchDataSet = {
    devices: morganDevices,
    maintenance: morganMaintenance.map((task) => ({
      id: task.id,
      device_id: task.device_id,
      title: task.title,
      due_date: task.due_date,
      completed: task.completed ?? false,
    })),
    documents: morganDocuments.map((document) => ({
      id: document.id,
      device_id: document.device_id,
      file_name: document.file_name,
      document_name: document.document_name,
      file_type: document.document_type ?? null,
    })),
    network: buildDemoNetworkRecords(),
  };

  return runDeterministicSmartSearch({
    query,
    devices: dataset.devices,
    maintenance: dataset.maintenance,
    documents: dataset.documents,
    network: dataset.network,
  });
}