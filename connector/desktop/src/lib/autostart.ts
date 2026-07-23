import {
  disable,
  enable,
  isEnabled,
} from "@tauri-apps/plugin-autostart";

export async function getAutostartEnabled() {
  return isEnabled();
}

export async function setAutostartEnabled(enabled: boolean) {
  if (enabled) {
    await enable();
    return;
  }

  await disable();
}
