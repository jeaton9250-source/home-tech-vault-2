import { invoke } from "@tauri-apps/api/core";

import type { ConnectorMetadata } from "./types";

export async function saveConnectorToken(
  token: string
) {
  await invoke("save_connector_token", {
    token,
  });
}

export async function loadConnectorToken() {
  return invoke<string | null>(
    "load_connector_token"
  );
}

export async function deleteConnectorToken() {
  await invoke("delete_connector_token");
}

export async function saveConnectorMetadata(
  metadata: ConnectorMetadata
) {
  await invoke("save_connector_metadata", {
    metadataJson: JSON.stringify(metadata),
  });
}

export async function loadConnectorMetadata() {
  const raw = await invoke<string | null>(
    "load_connector_metadata"
  );

  if (!raw) {
    return null;
  }

  return JSON.parse(raw) as ConnectorMetadata;
}

export async function deleteConnectorMetadata() {
  await invoke("delete_connector_metadata");
}

export async function getDeviceName() {
  const name = await invoke<string>(
    "get_device_name"
  );

  return name.trim() || "My Mac";
}

export async function disconnectLocally() {
  await deleteConnectorToken();
  await deleteConnectorMetadata();
}
