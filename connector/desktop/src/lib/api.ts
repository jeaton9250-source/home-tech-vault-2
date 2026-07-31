import { invoke } from "@tauri-apps/api/core";

import { getApiBaseUrl } from "./config";
import { logConnectorEvent } from "./logger";

import type {
  AppleHomePairingInitResponse,
  AppleHomePairingStatusResponse,
  DiscoverySyncResponse,
  HeartbeatResponse,
  HomeAssistantCommandClaimResponse,
  HomeAssistantCommandCompletionResponse,
  HomeAssistantEntitySyncResponse,
  HomeAssistantServiceResponse,
  PairConfirmResponse,
} from "./types";
import { ConnectorApiError } from "./types";

type NativeCommandError = {
  kind?: string;
  message?: string;
  status?: number;
  reason?: string;
  diagnostics?: Record<string, unknown>;
};

function parseNativeError(error: unknown): {
  kind: ConnectorApiError["kind"];
  message: string;
  status?: number;
  reason?: string;
  diagnostics?: Record<string, unknown>;
} {
  console.info("[htv-connector] native_invoke_error", {
    errorType: typeof error,
    hasKind:
      typeof error === "object" &&
      error !== null &&
      "kind" in error,
  });

  if (
    typeof error === "object" &&
    error !== null &&
    "kind" in error &&
    "message" in error
  ) {
    const native = error as NativeCommandError;
    const kind = native.kind as ConnectorApiError["kind"];

    return {
      kind:
        kind ??
        "server",
      message:
        native.message ??
        "Home Tech Vault returned an unexpected response.",
      status: native.status,
      reason: native.reason,
      diagnostics: native.diagnostics,
    };
  }

  if (typeof error === "string") {
    try {
      return parseNativeError(
        JSON.parse(error)
      );
    } catch {
      return {
        kind: "server",
        message: error,
      };
    }
  }

  return {
    kind: "server",
    message:
      "Home Tech Vault returned an unexpected response.",
  };
}

function logNativeFailure(
  context: "pairing" | "heartbeat",
  apiUrl: string,
  parsed: {
    kind: ConnectorApiError["kind"];
    message: string;
    status?: number;
    reason?: string;
    diagnostics?: Record<string, unknown>;
  }
) {
  console.info(
    `[htv-connector] ${context}_request_failed`,
    {
      apiUrl,
      errorType: parsed.kind,
      errorMessage: parsed.message,
      httpStatus:
        parsed.status ?? null,
      reason: parsed.reason ?? null,
      connectorId:
        parsed.diagnostics?.connectorId ??
        null,
      tokenHashPrefix:
        parsed.diagnostics?.tokenHashPrefix ??
        null,
      installationStatus:
        parsed.diagnostics?.installationStatus ??
        null,
      revokedAtPresent:
        parsed.diagnostics?.revokedAtPresent ??
        null,
    }
  );
}

export async function confirmPairing(options: {
  code: string;
  connectorName: string;
  appVersion: string;
}) {
  const baseUrl = getApiBaseUrl();

  const apiUrl = `${baseUrl}/api/connector/pair/confirm`;

  logConnectorEvent("pairing_started", {
    apiUrl,
  });

  try {
    const result =
      await invoke<PairConfirmResponse>(
        "pair_connector",
        {
          apiBaseUrl: baseUrl,
          code: options.code,
          connectorName:
            options.connectorName,
          appVersion:
            options.appVersion,
        }
      );

    logConnectorEvent("pairing_succeeded", {
      connectorId: result.connectorId,
    });

    return result;
  } catch (error) {
    const parsed =
      parseNativeError(error);

    logNativeFailure(
      "pairing",
      apiUrl,
      parsed
    );

    logConnectorEvent("network_request_failed");

    throw new ConnectorApiError(
      parsed.kind,
      parsed.message,
      {
        status: parsed.status,
        reason: parsed.reason,
        diagnostics: parsed.diagnostics,
      }
    );
  }
}

export async function sendHeartbeat(options: {
  token: string;
  appVersion: string;
  deviceName: string;
}) {
  const baseUrl = getApiBaseUrl();

  const apiUrl = `${baseUrl}/api/connector/heartbeat`;

  try {
    const result =
      await invoke<HeartbeatResponse>(
        "send_connector_heartbeat",
        {
          apiBaseUrl: baseUrl,
          connectorToken:
            options.token,
          appVersion:
            options.appVersion,
          deviceName:
            options.deviceName,
        }
      );

    logConnectorEvent("heartbeat_succeeded", {
      connectorId: result.connectorId,
    });

    return result;
  } catch (error) {
    const parsed =
      parseNativeError(error);

    logNativeFailure(
      "heartbeat",
      apiUrl,
      parsed
    );

    if (parsed.kind === "unauthorized") {
      logConnectorEvent("connector_revoked");
    } else {
      logConnectorEvent("network_request_failed");
    }

    throw new ConnectorApiError(
      parsed.kind,
      parsed.message,
      {
        status: parsed.status,
        reason: parsed.reason,
        diagnostics: parsed.diagnostics,
      }
    );
  }
}

type SyncDevicePayload = {
  localFingerprint: string;
  ipAddress: string | null;
  macAddress: string | null;
  hostname: string | null;
  manufacturer: string | null;
  model?: string | null;
  friendlyName?: string | null;
  deviceType: string | null;
  discoverySource: string;
  discoverySources?: string[];
  mdnsServices?: string[];
  ssdpDeviceType?: string | null;
  ssdpDescriptionUrl?: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
  online: boolean;
};

export async function syncDiscoveryResults(options: {
  token: string;
  scannedAt: string;
  devices: SyncDevicePayload[];
  runMatching?: boolean;
}) {
  const baseUrl = getApiBaseUrl();
  const apiUrl = `${baseUrl}/api/connector/discovery/sync`;

  try {
    const result =
      await invoke<DiscoverySyncResponse>(
        "sync_discovery_results",
        {
          apiBaseUrl: baseUrl,
          connectorToken: options.token,
          scannedAt: options.scannedAt,
          devices: options.devices,
          runMatching:
            options.runMatching ?? false,
        }
      );

    logConnectorEvent("discovery_sync_succeeded", {
      received: result.received,
      upserted: result.upserted,
    });

    return result;
  } catch (error) {
    const parsed =
      parseNativeError(error);

    logNativeFailure(
      "heartbeat",
      apiUrl,
      parsed
    );

    throw new ConnectorApiError(
      parsed.kind,
      parsed.message,
      {
        status: parsed.status,
        reason: parsed.reason,
        diagnostics: parsed.diagnostics,
      }
    );
  }
}

export type HomeAssistantEntitySyncPayload = {
  localFingerprint: string | null;
  entityId: string;
  domain: string;
  objectId: string;
  friendlyName: string | null;
  currentState: string;
  available: boolean;
  deviceClass: string | null;
  unitOfMeasurement: string | null;
  supportedFeatures: number | null;
  attributes: Record<string, unknown>;
  lastChangedAt: string | null;
  lastUpdatedAt: string | null;
};

export async function syncHomeAssistantEntities(
  options: {
    token: string;
    syncedAt: string;
    entities:
      HomeAssistantEntitySyncPayload[];
  }
) {
  const baseUrl = getApiBaseUrl();

  const apiUrl =
    `${baseUrl}/api/connector/home-assistant/entities/sync`;

  try {
    const result =
      await invoke<HomeAssistantEntitySyncResponse>(
        "sync_home_assistant_entities",
        {
          apiBaseUrl: baseUrl,
          connectorToken:
            options.token,
          syncedAt:
            options.syncedAt,
          entities:
            options.entities,
        }
      );

    logConnectorEvent(
      "home_assistant_entity_sync_succeeded",
      {
        received: result.received,
        upserted: result.upserted,
      }
    );

    return result;
  } catch (error) {
    const parsed =
      parseNativeError(error);

    logNativeFailure(
      "heartbeat",
      apiUrl,
      parsed
    );

    logConnectorEvent(
      "network_request_failed"
    );

    throw new ConnectorApiError(
      parsed.kind,
      parsed.message,
      {
        status: parsed.status,
        reason: parsed.reason,
        diagnostics:
          parsed.diagnostics,
      }
    );
  }
}

export async function claimHomeAssistantCommand(
  options: {
    token: string;
  }
) {
  const baseUrl = getApiBaseUrl();

  try {
    return await invoke<HomeAssistantCommandClaimResponse>(
      "claim_home_assistant_command",
      {
        apiBaseUrl: baseUrl,
        connectorToken: options.token,
      }
    );
  } catch (error) {
    const parsed =
      parseNativeError(error);

    throw new ConnectorApiError(
      parsed.kind,
      parsed.message,
      {
        status: parsed.status,
        reason: parsed.reason,
        diagnostics:
          parsed.diagnostics,
      }
    );
  }
}

export async function completeHomeAssistantCommand(
  options: {
    token: string;
    commandId: string;
    succeeded: boolean;
    errorMessage?: string | null;
    result?: Record<string, unknown>;
  }
) {
  const baseUrl = getApiBaseUrl();

  try {
    return await invoke<HomeAssistantCommandCompletionResponse>(
      "complete_home_assistant_command",
      {
        apiBaseUrl: baseUrl,
        connectorToken: options.token,
        commandId: options.commandId,
        succeeded: options.succeeded,
        errorMessage:
          options.errorMessage ?? null,
        result:
          options.result ?? {},
      }
    );
  } catch (error) {
    const parsed =
      parseNativeError(error);

    throw new ConnectorApiError(
      parsed.kind,
      parsed.message,
      {
        status: parsed.status,
        reason: parsed.reason,
        diagnostics:
          parsed.diagnostics,
      }
    );
  }
}

export async function executeHomeAssistantService(
  options: {
    baseUrl: string;
    entityId: string;
    domain: "light" | "switch";
    service: "turn_on" | "turn_off";
  }
) {
  return invoke<HomeAssistantServiceResponse>(
    "execute_home_assistant_service",
    {
      baseUrl: options.baseUrl,
      entityId: options.entityId,
      domain: options.domain,
      service: options.service,
    }
  );
}



export async function createAppleHomePairingSession(
  options: {
    token: string;
  }
) {
  const baseUrl =
    getApiBaseUrl();

  try {
    return await invoke<AppleHomePairingInitResponse>(
      "create_apple_home_pairing_session",
      {
        apiBaseUrl: baseUrl,
        connectorToken:
          options.token,
      }
    );
  } catch (error) {
    const parsed =
      parseNativeError(error);

    throw new ConnectorApiError(
      parsed.kind,
      parsed.message,
      {
        status: parsed.status,
        reason: parsed.reason,
        diagnostics:
          parsed.diagnostics,
      }
    );
  }
}

export async function getAppleHomePairingStatus(
  options: {
    token: string;
    sessionId: string;
  }
) {
  const baseUrl =
    getApiBaseUrl();

  try {
    return await invoke<AppleHomePairingStatusResponse>(
      "get_apple_home_pairing_status",
      {
        apiBaseUrl: baseUrl,
        connectorToken:
          options.token,
        sessionId:
          options.sessionId,
      }
    );
  } catch (error) {
    const parsed =
      parseNativeError(error);

    throw new ConnectorApiError(
      parsed.kind,
      parsed.message,
      {
        status: parsed.status,
        reason: parsed.reason,
        diagnostics:
          parsed.diagnostics,
      }
    );
  }
}
