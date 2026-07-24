/**
 * Map Device Intelligence v3 categories onto existing UI category labels.
 */

import type { DeviceCategory as LegacyCategory } from "@/lib/connector/deviceSignatures";
import type { DeviceCategory } from "@/lib/device-intelligence/types";

const CATEGORY_TO_LEGACY: Record<DeviceCategory, LegacyCategory> = {
  computer: "Computer",
  phone: "Phone / Tablet",
  tablet: "Phone / Tablet",
  television: "Smart TV",
  streaming_device: "Streaming Device",
  speaker: "Smart Speaker",
  voice_assistant: "Smart Speaker",
  camera: "Camera",
  doorbell: "Doorbell",
  thermostat: "Thermostat",
  lighting: "Lighting Hub",
  smart_plug: "Smart Plug",
  smart_switch: "Smart Plug",
  hub: "Home Automation Hub",
  router: "Router / Mesh System",
  mesh_node: "Router / Mesh System",
  network_switch: "Networking Device",
  printer: "Printer",
  nas: "NAS",
  game_console: "Game Console",
  robot_vacuum: "Robot Vacuum",
  air_purifier: "Appliance",
  appliance: "Appliance",
  security_system: "Camera",
  sensor: "Smart Home Device",
  other: "Smart Home Device",
  unknown: "Unknown",
};

export function toLegacyCategory(
  category: DeviceCategory | null | undefined
): LegacyCategory | null {
  if (!category) {
    return null;
  }

  return CATEGORY_TO_LEGACY[category] ?? "Unknown";
}
