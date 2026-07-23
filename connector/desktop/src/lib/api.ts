import { invoke } from "@tauri-apps/api/core";

import { getApiBaseUrl } from "./config";
import { logConnectorEvent } from "./logger";

import type {
  HeartbeatResponse,
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
