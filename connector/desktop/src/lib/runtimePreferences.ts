import { invoke } from "@tauri-apps/api/core";

export async function setConnectorRuntimePreferences(input: {
  minimizeToTray: boolean;
  monitoringPaused: boolean;
}) {
  await invoke("set_connector_runtime_preferences", {
    minimizeToTray: input.minimizeToTray,
    monitoringPaused: input.monitoringPaused,
  });
}

export async function quitConnectorApp() {
  await invoke("quit_connector_app");
}

export async function hideConnectorWindow() {
  await invoke("hide_connector_window");
}

export async function showConnectorWindow() {
  await invoke("show_connector_window");
}

export async function getNativeConnectorPlatform() {
  return invoke<string>("get_connector_platform");
}
