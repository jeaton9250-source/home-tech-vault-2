import {
  StrictMode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createRoot } from "react-dom/client";
import { listen } from "@tauri-apps/api/event";

import {
  confirmPairing,
  sendHeartbeat,
  syncDiscoveryResults,
} from "./lib/api";

import {
  getAutostartEnabled,
  setAutostartEnabled,
} from "./lib/autostart";

import {
  APP_VERSION,
  getApiBaseUrl,
} from "./lib/config";

import {
  deleteConnectorMetadata,
  deleteHomeAssistantToken,
  disconnectLocally,
  getDeviceName,
  loadConnectorMetadata,
  loadConnectorToken,
  loadHomeAssistantToken,
  saveConnectorMetadata,
  saveConnectorToken,
  saveHomeAssistantToken,
} from "./lib/credentials";

import {
  startHeartbeatScheduler,
  type HeartbeatTickResult,
} from "./lib/heartbeatScheduler";

import {
  getHomeAssistantStates,
  groupHomeAssistantStates,
  mapHomeAssistantDevicesForSync,
  testHomeAssistantConnection,
} from "./lib/homeAssistant";

import { logConnectorEvent } from "./lib/logger";
import { startMonitoringScheduler } from "./lib/monitoringScheduler";

import {
  credentialStoreLabel,
  detectConnectorOsPlatform,
  platformDisplayName,
} from "./lib/platform";

import {
  quitConnectorApp,
  setConnectorRuntimePreferences,
} from "./lib/runtimePreferences";

import {
  cancelLocalNetworkScan,
  scanAndSyncDiscovery,
} from "./lib/scan";

import {
  checkConnectorForUpdates,
  openOfficialConnectorDownloadPage,
} from "./lib/updates";

import {
  ConnectorApiError,
} from "./lib/types";

import type {
  AppScreen,
  ConnectorMetadata,
} from "./lib/types";

import type {
  GroupedHomeAssistantDevice,
} from "./lib/homeAssistant";

import "./styles.css";

const RECENT_HEARTBEAT_MS =
  10 * 60 * 1000;

function shortenId(value: string) {
  if (value.length <= 12) {
    return value;
  }

  return `${value.slice(0, 8)}…`;
}

function formatTimestamp(
  value: string | null
) {
  if (!value) {
    return "Never";
  }

  return new Date(
    value
  ).toLocaleString();
}

function isRecentHeartbeat(
  value: string | null
) {
  if (!value) {
    return false;
  }

  const timestamp =
    new Date(value).getTime();

  if (!Number.isFinite(timestamp)) {
    return false;
  }

  return (
    Date.now() - timestamp <=
    RECENT_HEARTBEAT_MS
  );
}

function normalizeHomeAssistantUrl(
  value: string
) {
  return value
    .trim()
    .replace(/\/+$/, "");
}

function App() {
  const [screen, setScreen] =
    useState<AppScreen>("unpaired");

  const [
    pairingCode,
    setPairingCode,
  ] = useState("");

  const [
    connectorName,
    setConnectorName,
  ] = useState("");

  const [
    metadata,
    setMetadata,
  ] =
    useState<ConnectorMetadata | null>(
      null
    );

  const [
    statusMessage,
    setStatusMessage,
  ] =
    useState<string | null>(null);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<string | null>(null);

  const [
    heartbeatPending,
    setHeartbeatPending,
  ] = useState(false);

  const [
    connectionProblem,
    setConnectionProblem,
  ] = useState(false);

  const [
    bootstrapping,
    setBootstrapping,
  ] = useState(true);

  const [
    scanPhase,
    setScanPhase,
  ] = useState<
    "idle" | "scanning" | "syncing"
  >("idle");

  const [
    scanConsentOpen,
    setScanConsentOpen,
  ] = useState(false);

  const [
    lastScanDeviceCount,
    setLastScanDeviceCount,
  ] =
    useState<number | null>(null);

  const [
    autostartEnabled,
    setAutostartEnabledState,
  ] = useState(false);

  const [
    homeAssistantUrl,
    setHomeAssistantUrl,
  ] = useState("");

  const [
    homeAssistantToken,
    setHomeAssistantToken,
  ] = useState("");

  const [
    homeAssistantTokenStored,
    setHomeAssistantTokenStored,
  ] = useState(false);

  const [
    homeAssistantDevices,
    setHomeAssistantDevices,
  ] = useState<
    GroupedHomeAssistantDevice[]
  >([]);

  const [
    homeAssistantPhase,
    setHomeAssistantPhase,
  ] = useState<
    | "idle"
    | "testing"
    | "previewing"
    | "syncing"
  >("idle");

  const [
    homeAssistantMessage,
    setHomeAssistantMessage,
  ] =
    useState<string | null>(null);

  const [
    homeAssistantError,
    setHomeAssistantError,
  ] =
    useState<string | null>(null);

  const metadataRef =
    useRef(metadata);

  metadataRef.current = metadata;

  const osPlatform = useMemo(
    () =>
      detectConnectorOsPlatform(),
    []
  );

  const secureStoreLabel =
    useMemo(
      () =>
        credentialStoreLabel(
          osPlatform
        ),
      [osPlatform]
    );

  const devicePlatformLabel =
    useMemo(
      () =>
        platformDisplayName(
          osPlatform
        ),
      [osPlatform]
    );

  const apiBaseUrl = useMemo(
    () => getApiBaseUrl(),
    []
  );

  const connectionLabel =
    useMemo(() => {
      if (heartbeatPending) {
        return "Sending heartbeat…";
      }

      if (
        errorMessage?.includes(
          "revoked"
        )
      ) {
        return "Access revoked";
      }

      if (
        errorMessage?.includes(
          "rejected"
        )
      ) {
        return "Token rejected";
      }

      if (connectionProblem) {
        return "Connection problem";
      }

      if (
        isRecentHeartbeat(
          metadata?.lastHeartbeatAt ??
            null
        )
      ) {
        return "Connected";
      }

      if (
        metadata?.lastHeartbeatAt
      ) {
        return "Waiting for next heartbeat";
      }

      return "Waiting for first heartbeat";
    }, [
      heartbeatPending,
      errorMessage,
      connectionProblem,
      metadata?.lastHeartbeatAt,
    ]);

  const clearIncompletePairing =
    useCallback(async () => {
      await deleteConnectorMetadata();

      setMetadata(null);
      setScreen("unpaired");
    }, []);

  const performHeartbeat =
    useCallback(
      async (options?: {
        manual?: boolean;
      }): Promise<HeartbeatTickResult> => {
        const manual =
          options?.manual ?? false;

        if (manual) {
          setHeartbeatPending(true);
          setErrorMessage(null);
          setStatusMessage(null);
        }

        try {
          const token =
            await loadConnectorToken();

          if (!token) {
            logConnectorEvent(
              "token_missing"
            );

            await clearIncompletePairing();

            setErrorMessage(
              `Connector token missing from ${secureStoreLabel}. Pair this device again.`
            );

            return {
              ok: false,
              retryable: false,
            };
          }

          const deviceName =
            await getDeviceName();

          const response =
            await sendHeartbeat({
              token,
              appVersion:
                APP_VERSION,
              deviceName,
            });

          const nextMetadata:
            ConnectorMetadata = {
            ...metadataRef.current,

            connectorId:
              response.connectorId,

            householdId:
              response.householdId,

            connectorName:
              metadataRef.current
                ?.connectorName ??
              "Connector",

            lastHeartbeatAt:
              response.serverTime,
          };

          await saveConnectorMetadata(
            nextMetadata
          );

          setMetadata(nextMetadata);
          setScreen("connected");
          setConnectionProblem(false);

          if (manual) {
            setStatusMessage(
              "Heartbeat sent successfully."
            );
          }

          return {
            ok: true,
          };
        } catch (error) {
          if (
            error instanceof
              ConnectorApiError &&
            error.kind ===
              "unauthorized"
          ) {
            setConnectionProblem(
              false
            );

            if (
              error.reason ===
              "revoked"
            ) {
              setErrorMessage(
                "Connector access was revoked in Home Tech Vault. Generate a new pairing code, or disconnect locally."
              );
            } else {
              setErrorMessage(
                `Connector token was rejected by Home Tech Vault. Disconnect this ${devicePlatformLabel} device and pair again.`
              );
            }

            logConnectorEvent(
              "connector_revoked",
              {
                apiBaseUrl,
                appVersion:
                  APP_VERSION,

                httpStatus:
                  error.status ??
                  null,

                reason:
                  error.reason ??
                  null,

                connectorId:
                  (error
                    .diagnostics
                    ?.connectorId as
                    | string
                    | undefined) ??
                  metadataRef
                    .current
                    ?.connectorId ??
                  null,

                tokenHashPrefix:
                  (error
                    .diagnostics
                    ?.tokenHashPrefix as
                    | string
                    | undefined) ??
                  null,

                installationStatus:
                  (error
                    .diagnostics
                    ?.installationStatus as
                    | string
                    | undefined) ??
                  null,

                revokedAtPresent:
                  (error
                    .diagnostics
                    ?.revokedAtPresent as
                    | boolean
                    | undefined) ??
                  null,
              }
            );

            return {
              ok: false,
              retryable: false,
            };
          }

          const retryable =
            error instanceof
              ConnectorApiError &&
            (
              error.kind ===
                "network" ||
              error.kind ===
                "timeout" ||
              error.kind ===
                "server" ||
              error.kind ===
                "tls"
            );

          if (retryable) {
            setConnectionProblem(true);

            if (manual) {
              setErrorMessage(
                "Unable to reach Home Tech Vault right now. Automatic retries will continue."
              );
            }
          } else if (manual) {
            setErrorMessage(
              error instanceof Error
                ? error.message
                : "Temporary server issue."
            );
          } else {
            setConnectionProblem(true);
          }

          return {
            ok: false,
            retryable,
          };
        } finally {
          if (manual) {
            setHeartbeatPending(
              false
            );
          }
        }
      },
      [
        apiBaseUrl,
        clearIncompletePairing,
        devicePlatformLabel,
        secureStoreLabel,
      ]
    );

  useEffect(() => {
    logConnectorEvent(
      "app_started"
    );

    async function bootstrap() {
      try {
        const [
          storedMetadata,
          connectorToken,
          deviceName,
          autostart,
          storedHomeAssistantToken,
        ] = await Promise.all([
          loadConnectorMetadata(),

          loadConnectorToken(),

          getDeviceName(),

          getAutostartEnabled()
            .catch(() => false),

          loadHomeAssistantToken()
            .catch(() => null),
        ]);

        setConnectorName(
          deviceName
        );

        setAutostartEnabledState(
          autostart
        );

        setHomeAssistantTokenStored(
          Boolean(
            storedHomeAssistantToken
          )
        );

        setHomeAssistantUrl(
          storedMetadata
            ?.homeAssistantUrl ??
            ""
        );

        if (
          storedMetadata &&
          !connectorToken
        ) {
          await deleteConnectorMetadata();

          setErrorMessage(
            "Previous pairing was incomplete. Generate a new code and pair again."
          );

          return;
        }

        if (
          !storedMetadata ||
          !connectorToken
        ) {
          return;
        }

        setMetadata(
          storedMetadata
        );

        setLastScanDeviceCount(
          storedMetadata
            .lastScanDeviceCount ??
            null
        );

        setScreen("connected");

        await performHeartbeat();
      } finally {
        setBootstrapping(false);
      }
    }

    void bootstrap();
  }, [performHeartbeat]);

  useEffect(() => {
    if (
      screen !== "connected" ||
      !metadata
    ) {
      return;
    }

    const scheduler =
      startHeartbeatScheduler({
        onTick: () =>
          performHeartbeat(),
      });

    scheduler.start();

    return () => {
      scheduler.stop();
    };
  }, [
    screen,
    metadata?.connectorId,
    performHeartbeat,
  ]);

  async function handleConnect() {
    setErrorMessage(null);
    setStatusMessage(null);
    setConnectionProblem(false);
    setScreen("pairing");

    try {
      const result =
        await confirmPairing({
          code: pairingCode,

          connectorName:
            connectorName.trim() ||
            (await getDeviceName()),

          appVersion:
            APP_VERSION,
        });

      await saveConnectorToken(
        result.connectorToken
      );

      const nextMetadata:
        ConnectorMetadata = {
        connectorId:
          result.connectorId,

        householdId:
          result.householdId,

        connectorName:
          result.connectorName,

        lastHeartbeatAt: null,
      };

      await saveConnectorMetadata(
        nextMetadata
      );

      setMetadata(nextMetadata);
      setPairingCode("");
      setScreen("connected");

      setStatusMessage(
        "Paired successfully."
      );

      await performHeartbeat();
    } catch (error) {
      setScreen("unpaired");

      setErrorMessage(
        error instanceof Error
          ? error.message
          : `Unable to pair this ${devicePlatformLabel} device.`
      );
    }
  }

  async function handleDisconnect() {
    await disconnectLocally();

    setMetadata(null);
    setPairingCode("");
    setStatusMessage(null);
    setErrorMessage(null);
    setConnectionProblem(false);

    setHomeAssistantUrl("");
    setHomeAssistantToken("");
    setHomeAssistantTokenStored(
      false
    );
    setHomeAssistantDevices([]);

    setScreen("unpaired");
  }

  async function handleQuit() {
    await quitConnectorApp();
  }

  async function handleCheckForUpdates() {
    const platform =
      osPlatform === "windows"
        ? "windows"
        : "macos";

    const result =
      await checkConnectorForUpdates(
        platform
      );

    if (result.downloadUrl) {
      window.open(
        result.downloadUrl,
        "_blank",
        "noopener,noreferrer"
      );
    } else {
      openOfficialConnectorDownloadPage();
    }

    setStatusMessage(
      result.message
    );
  }

  async function handleAutostartToggle(
    enabled: boolean
  ) {
    await setAutostartEnabled(
      enabled
    );

    setAutostartEnabledState(
      enabled
    );

    if (metadata) {
      const nextMetadata = {
        ...metadata,
        autostartEnabled:
          enabled,
      };

      await saveConnectorMetadata(
        nextMetadata
      );

      setMetadata(nextMetadata);
    }
  }

  async function handleMonitoringToggle(
    enabled: boolean
  ) {
    if (!metadata) {
      return;
    }

    const nextMetadata = {
      ...metadata,

      monitoringEnabled:
        enabled,

      monitoringPaused:
        enabled
          ? metadata
              .monitoringPaused ??
            false
          : true,
    };

    await saveConnectorMetadata(
      nextMetadata
    );

    setMetadata(nextMetadata);

    await setConnectorRuntimePreferences(
      {
        minimizeToTray:
          enabled,

        monitoringPaused:
          Boolean(
            nextMetadata
              .monitoringPaused
          ),
      }
    );
  }

  async function resolveHomeAssistantToken() {
    const enteredToken =
      homeAssistantToken.trim();

    if (enteredToken) {
      return enteredToken;
    }

    const storedToken =
      await loadHomeAssistantToken();

    if (!storedToken) {
      throw new Error(
        "Enter your Home Assistant access token."
      );
    }

    return storedToken;
  }

  async function saveHomeAssistantConnection(
    url: string,
    token: string
  ) {
    const currentMetadata =
      metadataRef.current;

    if (!currentMetadata) {
      throw new Error(
        "The Home Tech Vault connector must be paired first."
      );
    }

    await saveHomeAssistantToken(
      token
    );

    const nextMetadata:
      ConnectorMetadata = {
      ...currentMetadata,

      homeAssistantUrl:
        url,

      homeAssistantConnected:
        true,
    };

    await saveConnectorMetadata(
      nextMetadata
    );

    setMetadata(nextMetadata);
    setHomeAssistantUrl(url);
    setHomeAssistantToken("");

    setHomeAssistantTokenStored(
      true
    );
  }

  async function handleTestHomeAssistant() {
    setHomeAssistantPhase(
      "testing"
    );

    setHomeAssistantMessage(
      null
    );

    setHomeAssistantError(
      null
    );

    try {
      const url =
        normalizeHomeAssistantUrl(
          homeAssistantUrl
        );

      if (!url) {
        throw new Error(
          "Enter your Home Assistant URL."
        );
      }

      const token =
        await resolveHomeAssistantToken();

      const connected =
        await testHomeAssistantConnection(
          {
            baseUrl: url,
            accessToken: token,
          }
        );

      if (!connected) {
        throw new Error(
          "Home Assistant responded, but the API response was not recognized."
        );
      }

      await saveHomeAssistantConnection(
        url,
        token
      );

      setHomeAssistantMessage(
        "Home Assistant connected successfully."
      );
    } catch (error) {
      setHomeAssistantError(
        error instanceof Error
          ? error.message
          : "Unable to connect to Home Assistant."
      );
    } finally {
      setHomeAssistantPhase(
        "idle"
      );
    }
  }

  async function handlePreviewHomeAssistant() {
    setHomeAssistantPhase(
      "previewing"
    );

    setHomeAssistantMessage(
      null
    );

    setHomeAssistantError(
      null
    );

    try {
      const url =
        normalizeHomeAssistantUrl(
          homeAssistantUrl
        );

      if (!url) {
        throw new Error(
          "Enter your Home Assistant URL."
        );
      }

      const token =
        await resolveHomeAssistantToken();

      const states =
        await getHomeAssistantStates(
          {
            baseUrl: url,
            accessToken: token,
          }
        );

      const devices =
        groupHomeAssistantStates(
          states
        );

      setHomeAssistantDevices(
        devices
      );

      setHomeAssistantMessage(
        `${devices.length} Home Assistant device${
          devices.length === 1
            ? ""
            : "s"
        } ready to sync.`
      );
    } catch (error) {
      setHomeAssistantDevices([]);

      setHomeAssistantError(
        error instanceof Error
          ? error.message
          : "Unable to preview Home Assistant devices."
      );
    } finally {
      setHomeAssistantPhase(
        "idle"
      );
    }
  }

  async function handleSyncHomeAssistant() {
    setHomeAssistantPhase(
      "syncing"
    );

    setHomeAssistantMessage(
      null
    );

    setHomeAssistantError(
      null
    );

    try {
      const currentMetadata =
        metadataRef.current;

      if (!currentMetadata) {
        throw new Error(
          "The Home Tech Vault connector is not paired."
        );
      }

      const connectorToken =
        await loadConnectorToken();

      if (!connectorToken) {
        throw new Error(
          `Connector token missing from ${secureStoreLabel}. Pair this device again.`
        );
      }

      const url =
        normalizeHomeAssistantUrl(
          homeAssistantUrl
        );

      if (!url) {
        throw new Error(
          "Enter your Home Assistant URL."
        );
      }

      const assistantToken =
        await resolveHomeAssistantToken();

      const states =
        await getHomeAssistantStates(
          {
            baseUrl: url,

            accessToken:
              assistantToken,
          }
        );

      const groupedDevices =
        groupHomeAssistantStates(
          states
        );

      if (
        groupedDevices.length ===
        0
      ) {
        throw new Error(
          "No useful Home Assistant devices were found."
        );
      }

      const scannedAt =
        new Date().toISOString();

      const syncDevices =
        mapHomeAssistantDevicesForSync(
          groupedDevices,
          scannedAt
        );

      const result =
        await syncDiscoveryResults(
          {
            token:
              connectorToken,

            scannedAt,

            devices:
              syncDevices,

            runMatching:
              true,
          }
        );

      await saveHomeAssistantToken(
        assistantToken
      );

      const nextMetadata:
        ConnectorMetadata = {
        ...currentMetadata,

        homeAssistantUrl:
          url,

        homeAssistantConnected:
          true,

        homeAssistantLastSyncAt:
          result.scannedAt,

        homeAssistantDeviceCount:
          groupedDevices.length,
      };

      await saveConnectorMetadata(
        nextMetadata
      );

      setMetadata(nextMetadata);
      setHomeAssistantUrl(url);
      setHomeAssistantToken("");

      setHomeAssistantTokenStored(
        true
      );

      setHomeAssistantDevices(
        groupedDevices
      );

      setHomeAssistantMessage(
        `${result.upserted} Home Assistant device${
          result.upserted === 1
            ? ""
            : "s"
        } synced to Home Tech Vault.`
      );
    } catch (error) {
      setHomeAssistantError(
        error instanceof Error
          ? error.message
          : "Unable to sync Home Assistant devices."
      );
    } finally {
      setHomeAssistantPhase(
        "idle"
      );
    }
  }

  async function handleDisconnectHomeAssistant() {
    setHomeAssistantMessage(
      null
    );

    setHomeAssistantError(
      null
    );

    try {
      await deleteHomeAssistantToken();

      const currentMetadata =
        metadataRef.current;

      if (currentMetadata) {
        const nextMetadata:
          ConnectorMetadata = {
          ...currentMetadata,

          homeAssistantUrl:
            null,

          homeAssistantConnected:
            false,

          homeAssistantLastSyncAt:
            null,

          homeAssistantDeviceCount:
            null,
        };

        await saveConnectorMetadata(
          nextMetadata
        );

        setMetadata(
          nextMetadata
        );
      }

      setHomeAssistantUrl("");
      setHomeAssistantToken("");

      setHomeAssistantTokenStored(
        false
      );

      setHomeAssistantDevices([]);

      setHomeAssistantMessage(
        "Home Assistant disconnected from this connector."
      );
    } catch (error) {
      setHomeAssistantError(
        error instanceof Error
          ? error.message
          : "Unable to disconnect Home Assistant."
      );
    }
  }

  async function handleNetworkScan() {
    if (
      !metadata
        ?.scanConsentAccepted
    ) {
      setScanConsentOpen(true);
      return;
    }

    await runNetworkScan();
  }

  async function runNetworkScan(
    silent = false
  ) {
    if (!silent) {
      setErrorMessage(null);
      setStatusMessage(null);
      setScanPhase("scanning");
    }

    logConnectorEvent(
      "discovery_scan_started"
    );

    try {
      const token =
        await loadConnectorToken();

      if (!token) {
        throw new Error(
          `Connector token missing from ${secureStoreLabel}. Pair this device again.`
        );
      }

      const { scan, sync } =
        await scanAndSyncDiscovery(
          {
            token,

            runMatching: true,

            onScanComplete:
              () => {
                if (!silent) {
                  setScanPhase(
                    "syncing"
                  );
                }
              },
          }
        );

      if (scan.cancelled) {
        if (!silent) {
          setStatusMessage(
            "Network scan cancelled."
          );
        }

        return;
      }

      const scannedAt =
        sync?.scannedAt ??
        new Date().toISOString();

      const deviceCount =
        scan.devices.length;

      setLastScanDeviceCount(
        deviceCount
      );

      const currentMetadata =
        metadataRef.current;

      if (!currentMetadata) {
        return;
      }

      const nextMetadata:
        ConnectorMetadata = {
        ...currentMetadata,

        lastScanAt:
          scannedAt,

        lastScanDeviceCount:
          deviceCount,

        scanConsentAccepted:
          true,
      };

      await saveConnectorMetadata(
        nextMetadata
      );

      setMetadata(nextMetadata);

      logConnectorEvent(
        "discovery_scan_completed",
        {
          devicesFound:
            deviceCount,

          upserted:
            sync?.upserted ??
            0,
        }
      );

      setStatusMessage(
        silent
          ? `Automatic scan complete. ${deviceCount} device${
              deviceCount === 1
                ? ""
                : "s"
            } synced.`
          : `Scan complete. ${deviceCount} device${
              deviceCount === 1
                ? ""
                : "s"
            } found and synced to Home Tech Vault.`
      );
    } catch (error) {
      if (!silent) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to complete the network scan."
        );
      }
    } finally {
      if (!silent) {
        setScanPhase("idle");
        setScanConsentOpen(
          false
        );
      }
    }
  }

  useEffect(() => {
    if (
      screen !== "connected" ||
      !metadata
    ) {
      return;
    }

    void setConnectorRuntimePreferences(
      {
        minimizeToTray:
          Boolean(
            metadata
              .monitoringEnabled
          ),

        monitoringPaused:
          Boolean(
            metadata
              .monitoringPaused
          ),
      }
    );
  }, [
    screen,
    metadata?.monitoringEnabled,
    metadata?.monitoringPaused,
  ]);

  useEffect(() => {
    if (
      screen !== "connected" ||
      !metadata
        ?.monitoringEnabled
    ) {
      return;
    }

    const scheduler =
      startMonitoringScheduler(
        {
          isPaused: () =>
            Boolean(
              metadataRef
                .current
                ?.monitoringPaused
            ),

          onTick: async () => {
            await runNetworkScan(
              true
            );
          },
        }
      );

    scheduler.start();

    return () => {
      scheduler.stop();
    };
  }, [
    screen,
    metadata?.monitoringEnabled,
    metadata?.monitoringPaused,
  ]);

  useEffect(() => {
    const unlisteners = [
      listen(
        "connector://scan-requested",
        () => {
          void handleNetworkScan();
        }
      ),

      listen(
        "connector://monitoring-paused",
        async () => {
          if (
            !metadataRef.current
          ) {
            return;
          }

          const nextMetadata = {
            ...metadataRef.current,

            monitoringPaused:
              true,
          };

          await saveConnectorMetadata(
            nextMetadata
          );

          setMetadata(
            nextMetadata
          );
        }
      ),

      listen(
        "connector://monitoring-resumed",
        async () => {
          if (
            !metadataRef.current
          ) {
            return;
          }

          const nextMetadata = {
            ...metadataRef.current,

            monitoringPaused:
              false,
          };

          await saveConnectorMetadata(
            nextMetadata
          );

          setMetadata(
            nextMetadata
          );
        }
      ),

      listen(
        "connector://check-updates-requested",
        () => {
          void handleCheckForUpdates();
        }
      ),
    ];

    return () => {
      void Promise.all(
        unlisteners
      ).then((handles) => {
        handles.forEach(
          (handle) => {
            void handle();
          }
        );
      });
    };
  }, []);

  function handleCancelScan() {
    void cancelLocalNetworkScan();

    setScanPhase("idle");

    setStatusMessage(
      "Cancelling scan…"
    );
  }

  if (bootstrapping) {
    return (
      <main className="app-shell">
        <section className="panel">
          <p className="eyebrow">
            Home Tech Vault
          </p>

          <h1>
            Loading connector…
          </h1>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="panel">
        <p className="eyebrow">
          Home Tech Vault Connector
        </p>

        {screen ===
        "unpaired" ? (
          <>
            <h1>
              Connect this{" "}
              {devicePlatformLabel}{" "}
              device to your household
            </h1>

            <p className="lede">
              Pair this device with
              your Home Tech Vault
              household using a
              one-time code.
            </p>

            <label className="field">
              <span>
                Pairing code
              </span>

              <input
                value={
                  pairingCode
                }
                onChange={(
                  event
                ) =>
                  setPairingCode(
                    event.target
                      .value
                  )
                }
                placeholder="ABCD-1234"
                autoCapitalize="characters"
              />
            </label>

            <label className="field">
              <span>
                Connector name
              </span>

              <input
                value={
                  connectorName
                }
                onChange={(
                  event
                ) =>
                  setConnectorName(
                    event.target
                      .value
                  )
                }
                placeholder={
                  osPlatform ===
                  "windows"
                    ? "Jason’s PC"
                    : "Jason’s MacBook"
                }
              />
            </label>

            <button
              className="primary"
              type="button"
              onClick={() =>
                void handleConnect()
              }
            >
              Connect
            </button>

            <p className="help">
              Generate a pairing code
              from Home Tech Vault
              under Network → Connect
              Your Home Network.
            </p>

            {import.meta.env
              .DEV ? (
              <p className="help api-target">
                API target:{" "}
                {apiBaseUrl}
              </p>
            ) : null}
          </>
        ) : null}

        {screen ===
        "pairing" ? (
          <>
            <h1>Pairing…</h1>

            <p className="lede">
              Contacting Home Tech
              Vault securely. Do not
              close the app.
            </p>

            <div className="spinner" />
          </>
        ) : null}

        {screen ===
          "connected" &&
        metadata ? (
          <>
            <h1>
              Connected to Home Tech
              Vault
            </h1>

            <p className="lede">
              This device sends
              automatic heartbeats
              every 5 minutes while
              the connector is running.
            </p>

            <dl className="details">
              <div>
                <dt>
                  Connector name
                </dt>

                <dd>
                  {
                    metadata.connectorName
                  }
                </dd>
              </div>

              <div>
                <dt>
                  Household
                </dt>

                <dd>
                  {shortenId(
                    metadata.householdId
                  )}
                </dd>
              </div>

              <div>
                <dt>
                  App version
                </dt>

                <dd>
                  {APP_VERSION}
                </dd>
              </div>

              <div>
                <dt>
                  Last heartbeat
                </dt>

                <dd>
                  {formatTimestamp(
                    metadata.lastHeartbeatAt
                  )}
                </dd>
              </div>

              <div>
                <dt>
                  Connection status
                </dt>

                <dd>
                  {connectionLabel}
                </dd>
              </div>

              <div>
                <dt>
                  Last scan
                </dt>

                <dd>
                  {formatTimestamp(
                    metadata.lastScanAt ??
                      null
                  )}
                </dd>
              </div>

              <div>
                <dt>
                  Devices found
                </dt>

                <dd>
                  {lastScanDeviceCount ??
                    metadata.lastScanDeviceCount ??
                    "—"}
                </dd>
              </div>
            </dl>

            <section className="scan-panel">
              <h2>
                Monitoring
              </h2>

              <p className="help">
                Enable automatic
                monitoring to scan
                your private network
                every 15 minutes.
                Requires a Pro or
                Family plan in Home
                Tech Vault.
              </p>

              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={Boolean(
                    metadata.monitoringEnabled
                  )}
                  onChange={(
                    event
                  ) =>
                    void handleMonitoringToggle(
                      event.target
                        .checked
                    )
                  }
                />

                <span>
                  Enable automatic
                  monitoring
                </span>
              </label>

              {metadata.monitoringEnabled ? (
                <p className="help">
                  {metadata.monitoringPaused
                    ? "Monitoring is paused."
                    : "Monitoring is active every 15 minutes."}
                </p>
              ) : null}
            </section>

            <section className="scan-panel">
              <h2>
                Startup
              </h2>

              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={
                    autostartEnabled
                  }
                  onChange={(
                    event
                  ) =>
                    void handleAutostartToggle(
                      event.target
                        .checked
                    )
                  }
                />

                <span>
                  Start Home Tech Vault
                  Connector when I sign
                  in
                </span>
              </label>
            </section>

            <section className="scan-panel">
              <h2>
                Network scan
              </h2>

              <p className="help">
                Scan your local private
                network and sync results
                to Home Tech Vault.
                Nothing is imported
                automatically.
              </p>

              {scanPhase !==
              "idle" ? (
                <p className="status">
                  {scanPhase ===
                  "scanning"
                    ? "Scanning your local network…"
                    : "Syncing discovered devices…"}
                </p>
              ) : null}

              <div className="actions">
                <button
                  className="primary"
                  type="button"
                  disabled={
                    scanPhase !==
                    "idle"
                  }
                  onClick={() =>
                    void handleNetworkScan()
                  }
                >
                  Scan My Network
                </button>

                {scanPhase !==
                "idle" ? (
                  <button
                    className="secondary"
                    type="button"
                    onClick={
                      handleCancelScan
                    }
                  >
                    Cancel Scan
                  </button>
                ) : null}
              </div>
            </section>

            <section className="scan-panel">
              <h2>
                Home Assistant
              </h2>

              <p className="help">
                Connect Home Assistant
                to discover supported
                smart-home devices and
                send them to Home Tech
                Vault for review.
                Nothing is imported
                automatically.
              </p>

              <label className="field">
                <span>
                  Home Assistant URL
                </span>

                <input
                  value={
                    homeAssistantUrl
                  }
                  onChange={(
                    event
                  ) =>
                    setHomeAssistantUrl(
                      event.target
                        .value
                    )
                  }
                  placeholder="http://192.168.1.158:8123"
                  autoCapitalize="none"
                  autoCorrect="off"
                />
              </label>

              <label className="field">
                <span>
                  Long-lived access
                  token
                </span>

                <input
                  type="password"
                  value={
                    homeAssistantToken
                  }
                  onChange={(
                    event
                  ) =>
                    setHomeAssistantToken(
                      event.target
                        .value
                    )
                  }
                  placeholder={
                    homeAssistantTokenStored
                      ? "Token securely stored — leave blank to reuse"
                      : "Paste your Home Assistant token"
                  }
                  autoCapitalize="none"
                  autoCorrect="off"
                />
              </label>

              {metadata.homeAssistantConnected ? (
                <dl className="details compact-details">
                  <div>
                    <dt>Status</dt>
                    <dd>
                      Connected
                    </dd>
                  </div>

                  <div>
                    <dt>
                      Last sync
                    </dt>

                    <dd>
                      {formatTimestamp(
                        metadata.homeAssistantLastSyncAt ??
                          null
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt>
                      Devices
                    </dt>

                    <dd>
                      {metadata.homeAssistantDeviceCount ??
  (homeAssistantDevices.length > 0
    ? homeAssistantDevices.length
    : "—")}
                    </dd>
                  </div>
                </dl>
              ) : null}

              {homeAssistantPhase !==
              "idle" ? (
                <p className="status">
                  {homeAssistantPhase ===
                  "testing"
                    ? "Testing Home Assistant connection…"
                    : homeAssistantPhase ===
                        "previewing"
                      ? "Loading Home Assistant devices…"
                      : "Syncing Home Assistant devices…"}
                </p>
              ) : null}

              <div className="actions">
                <button
                  className="secondary"
                  type="button"
                  disabled={
                    homeAssistantPhase !==
                    "idle"
                  }
                  onClick={() =>
                    void handleTestHomeAssistant()
                  }
                >
                  Test Connection
                </button>

                <button
                  className="secondary"
                  type="button"
                  disabled={
                    homeAssistantPhase !==
                    "idle"
                  }
                  onClick={() =>
                    void handlePreviewHomeAssistant()
                  }
                >
                  Preview Devices
                </button>

                <button
                  className="primary"
                  type="button"
                  disabled={
                    homeAssistantPhase !==
                    "idle"
                  }
                  onClick={() =>
                    void handleSyncHomeAssistant()
                  }
                >
                  Sync to Home Tech
                  Vault
                </button>

                {homeAssistantTokenStored ||
                metadata.homeAssistantConnected ? (
                  <button
                    className="secondary"
                    type="button"
                    disabled={
                      homeAssistantPhase !==
                      "idle"
                    }
                    onClick={() =>
                      void handleDisconnectHomeAssistant()
                    }
                  >
                    Disconnect Home
                    Assistant
                  </button>
                ) : null}
              </div>

              {homeAssistantDevices.length >
              0 ? (
                <div className="home-assistant-preview">
                  <h3>
                    Device preview
                  </h3>

                  <ul>
                    {homeAssistantDevices.map(
                      (
                        device
                      ) => (
                        <li
                          key={
                            device.localFingerprint
                          }
                        >
                          <div>
                            <strong>
                              {
                                device.name
                              }
                            </strong>

                            <span>
                              {device.domains.join(
                                ", "
                              )}
                            </span>
                          </div>

                          <span
                            className={
                              device.available
                                ? "device-online"
                                : "device-offline"
                            }
                          >
                            {device.available
                              ? "Online"
                              : "Offline"}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              ) : null}

              {homeAssistantMessage ? (
                <p className="status success">
                  {
                    homeAssistantMessage
                  }
                </p>
              ) : null}

              {homeAssistantError ? (
                <p className="status error">
                  {
                    homeAssistantError
                  }
                </p>
              ) : null}
            </section>

            {scanConsentOpen ? (
              <section className="consent-panel">
                <h2>
                  Before you scan
                </h2>

                <p className="help">
                  Home Tech Vault scans
                  only your local
                  network to identify
                  connected devices. It
                  does not inspect
                  browsing history,
                  packet contents,
                  personal files, or
                  internet activity.
                </p>

                <div className="actions">
                  <button
                    className="primary"
                    type="button"
                    onClick={() =>
                      void runNetworkScan()
                    }
                  >
                    Start Scan
                  </button>

                  <button
                    className="secondary"
                    type="button"
                    onClick={() =>
                      setScanConsentOpen(
                        false
                      )
                    }
                  >
                    Cancel
                  </button>
                </div>
              </section>
            ) : null}

            <div className="actions">
              <button
                className="primary"
                type="button"
                disabled={
                  heartbeatPending
                }
                onClick={() =>
                  void performHeartbeat(
                    {
                      manual: true,
                    }
                  )
                }
              >
                Send Test Heartbeat
              </button>

              <button
                className="secondary"
                type="button"
                onClick={() =>
                  void handleCheckForUpdates()
                }
              >
                Check for Updates
              </button>

              <button
                className="secondary"
                type="button"
                onClick={() =>
                  void handleDisconnect()
                }
              >
                Disconnect This Device
              </button>

              <button
                className="secondary"
                type="button"
                onClick={() =>
                  void handleQuit()
                }
              >
                Quit
              </button>
            </div>

            <p className="help">
              Disconnect locally
              removes this
              device&apos;s token and
              Home Assistant token from{" "}
              {secureStoreLabel}. To
              revoke server-side
              access, use Home Tech
              Vault → Network →
              Connect.
            </p>
          </>
        ) : null}

        {statusMessage ? (
          <p className="status success">
            {statusMessage}
          </p>
        ) : null}

        {errorMessage ? (
          <p className="status error">
            {errorMessage}
          </p>
        ) : null}
      </section>
    </main>
  );
}

createRoot(
  document.getElementById(
    "root"
  )!
).render(
  <StrictMode>
    <App />
  </StrictMode>
);