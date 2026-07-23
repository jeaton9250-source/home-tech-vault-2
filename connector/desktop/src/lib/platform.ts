export type ConnectorOsPlatform = "macos" | "windows" | "other";

export function detectConnectorOsPlatform(): ConnectorOsPlatform {
  if (typeof navigator === "undefined") {
    return "other";
  }

  const platform = navigator.platform.toLowerCase();
  const userAgent = navigator.userAgent.toLowerCase();

  if (platform.includes("mac") || userAgent.includes("mac os")) {
    return "macos";
  }

  if (platform.includes("win") || userAgent.includes("windows")) {
    return "windows";
  }

  return "other";
}

export function defaultConnectorDeviceLabel(
  platform: ConnectorOsPlatform = detectConnectorOsPlatform()
) {
  if (platform === "windows") {
    return "My PC";
  }

  if (platform === "macos") {
    return "My Mac";
  }

  return "My Device";
}

export function credentialStoreLabel(
  platform: ConnectorOsPlatform = detectConnectorOsPlatform()
) {
  if (platform === "windows") {
    return "Windows Credential Manager";
  }

  if (platform === "macos") {
    return "Keychain";
  }

  return "secure credential storage";
}

export function platformDisplayName(
  platform: ConnectorOsPlatform = detectConnectorOsPlatform()
) {
  if (platform === "windows") {
    return "Windows";
  }

  if (platform === "macos") {
    return "macOS";
  }

  return "this device";
}
