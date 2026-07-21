import {
  demoDocuments as sourceDocuments,
  demoDevices,
} from "@/lib/demoData";

export const demoDocuments = sourceDocuments.map(
  (document) => {
    const device = demoDevices.find(
      (item) => item.id === document.device_id
    );

    return {
      id: document.id,
      file_name: document.file_name,
      file_type: document.document_type,
      file_url: "#",
      device_id: document.device_id,
      device_name: device?.device_name ?? "Household",
      document_name: document.document_name,
      created_at: document.created_at,
    };
  }
);
