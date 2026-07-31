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
  claimHomeAssistantCommand,
  completeHomeAssistantCommand,
  confirmPairing,
  createAppleHomePairingSession,
  getAppleHomePairingStatus,
  executeHomeAssistantService,
  sendHeartbeat,
  syncDiscoveryResults,
  syncHomeAssistantEntities,
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
  startHomeAssistantCommandScheduler,
  type HomeAssistantCommandTickResult,
} from "./lib/homeAssistantCommandScheduler";

import {
  getHomeAssistantStates,
  groupHomeAssistantStates,
  mapHomeAssistantDevicesForSync,
  mapHomeAssistantEntitiesForSync,
  testHomeAssistantConnection,
} from "./lib/homeAssistant";

import { logConnectorEvent } from "./lib/logger";
import {
  startMonitoringScheduler,
  type MonitoringSchedulerStatus,
} from "./lib/monitoringScheduler";

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
  getPendingDiscoverySyncCount,
} from "./lib/discoverySyncQueue";

import {
  checkConnectorForUpdates,
  openOfficialConnectorDownloadPage,
} from "./lib/updates";

import {
  ConnectorApiError,
} from "./lib/types";

import type {
  AppScreen,
  AppleHomePairingInitResponse,
  ConnectorMetadata,
} from "./lib/types";

import type {
  GroupedHomeAssistantDevice,
} from "./lib/homeAssistant";

import "./styles.css";

type ConnectedTab =
  | "connector"
  | "home-assistant"
  | "apple-home"
  | "diagnostics";

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
    activeConnectedTab,
    setActiveConnectedTab,
  ] =
    useState<ConnectedTab>(
      "connector"
    );

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
    monitoringStatus,
    setMonitoringStatus,
  ] =
    useState<MonitoringSchedulerStatus | null>(
      null
    );

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

  const [
    appleHomeSetupOpen,
    setAppleHomeSetupOpen,
  ] = useState(false);

  const [
    appleHomePairing,
    setAppleHomePairing,
  ] =
    useState<AppleHomePairingInitResponse | null>(
      null
    );

  const [
    appleHomePending,
    setAppleHomePending,
  ] = useState(false);

  const [
    appleHomeError,
    setAppleHomeError,
  ] =
    useState<string | null>(null);

  const [
    appleHomeNow,
    setAppleHomeNow,
  ] = useState(Date.now());

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

  const processHomeAssistantCommand =
    useCallback(
      async (): Promise<HomeAssistantCommandTickResult> => {
        const currentMetadata =
          metadataRef.current;

        if (
          screen !== "connected" ||
          !currentMetadata ||
          !currentMetadata.homeAssistantConnected ||
          !currentMetadata.homeAssistantUrl
        ) {
          return {
            ok: true,
          };
        }

        const connectorToken =
          await loadConnectorToken();

        if (!connectorToken) {
          return {
            ok: false,
            retryable: false,
          };
        }

        try {
          const claim =
            await claimHomeAssistantCommand({
              token: connectorToken,
            });

          if (!claim.command) {
            return {
              ok: true,
            };
          }

          const command =
            claim.command;

          try {
            const result =
              await executeHomeAssistantService({
                baseUrl:
                  currentMetadata.homeAssistantUrl,
                entityId:
                  command.homeAssistantEntityId,
                domain:
                  command.domain,
                service:
                  command.service,
              });

            await completeHomeAssistantCommand({
              token: connectorToken,
              commandId: command.id,
              succeeded: true,
              result: {
                entityId:
                  result.entityId,
                domain:
                  result.domain,
                service:
                  result.service,
              },
            });

            /*
             * Home Assistant may need a brief moment to publish
             * the new entity state after the service call.
             */
            await new Promise(
              (resolve) =>
                window.setTimeout(
                  resolve,
                  1_500
                )
            );

            const latestMetadata =
              metadataRef.current;

            const configuredUrl =
              normalizeHomeAssistantUrl(
                latestMetadata
                  ?.homeAssistantUrl ??
                  homeAssistantUrl
              );

            if (configuredUrl) {
              const assistantToken =
                await resolveHomeAssistantToken();

              const freshStates =
                await getHomeAssistantStates({
                  baseUrl:
                    configuredUrl,
                  accessToken:
                    assistantToken,
                });

              const freshDevices =
                groupHomeAssistantStates(
                  freshStates
                );

              const expectedState =
                command.service ===
                "turn_on"
                  ? "on"
                  : "off";

              const freshEntities =
                mapHomeAssistantEntitiesForSync(
                  freshDevices
                ).map((entity) =>
                  entity.entityId ===
                  command.homeAssistantEntityId
                    ? {
                        ...entity,
                        currentState:
                          expectedState,
                        available: true,
                        lastChangedAt:
                          new Date().toISOString(),
                        lastUpdatedAt:
                          new Date().toISOString(),
                      }
                    : entity
                );

              await syncHomeAssistantEntities({
                token:
                  connectorToken,
                syncedAt:
                  new Date().toISOString(),
                entities:
                  freshEntities,
              });
            }

            logConnectorEvent(
              "home_assistant_command_succeeded",
              {
                commandId:
                  command.id,
                entityId:
                  command.homeAssistantEntityId,
                domain:
                  command.domain,
                service:
                  command.service,
              }
            );

            return {
              ok: true,
            };
          } catch (executionError) {
            const errorMessage =
              executionError instanceof Error
                ? executionError.message
                : "Home Assistant command failed.";

            try {
              await completeHomeAssistantCommand({
                token: connectorToken,
                commandId: command.id,
                succeeded: false,
                errorMessage,
                result: {},
              });
            } catch {
              // Keep the original execution error.
            }

            logConnectorEvent(
              "home_assistant_command_failed",
              {
                commandId:
                  command.id,
                entityId:
                  command.homeAssistantEntityId,
                errorMessage,
              }
            );

            return {
              ok: false,
              retryable: true,
            };
          }
        } catch (error) {
          if (
            error instanceof ConnectorApiError &&
            error.kind === "unauthorized"
          ) {
            return {
              ok: false,
              retryable: false,
            };
          }

          return {
            ok: false,
            retryable: true,
          };
        }
      },
      [screen]
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

  useEffect(() => {
    if (
      screen !== "connected" ||
      !metadata?.connectorId ||
      !metadata.homeAssistantConnected ||
      !metadata.homeAssistantUrl
    ) {
      return;
    }

    const scheduler =
      startHomeAssistantCommandScheduler({
        onTick:
          processHomeAssistantCommand,
      });

    scheduler.start();

    return () => {
      scheduler.stop();
    };
  }, [
    screen,
    metadata?.connectorId,
    metadata?.homeAssistantConnected,
    metadata?.homeAssistantUrl,
    processHomeAssistantCommand,
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

      const syncEntities =
        mapHomeAssistantEntitiesForSync(
          groupedDevices
        );

      await syncHomeAssistantEntities({
        token:
          connectorToken,

        syncedAt:
          scannedAt,

        entities:
          syncEntities,
      });

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
    const scanStartedAt =
      new Date().toISOString();

    const scanStartedMs =
      Date.now();

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

      const {
        scan,
        sync,
        pendingQueueCount,
      } =
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

        lastScanStartedAt:
          scanStartedAt,

        lastSuccessfulSyncAt:
          sync
            ? scannedAt
            : currentMetadata
                .lastSuccessfulSyncAt ??
              null,

        lastScanDurationMs:
          Math.max(
            0,
            Date.now() -
              scanStartedMs
          ),

        lastScanDeviceCount:
          deviceCount,

        consecutiveScanFailures:
          0,

        lastScanFailureAt:
          null,

        lastScanFailureMessage:
          null,

        pendingDiscoveryUploads:
          pendingQueueCount,

        scanConsentAccepted:
          true,
      };

      await saveConnectorMetadata(
        nextMetadata
      );

      setMetadata(nextMetadata);

      /*
       * A successful discovery sync proves
       * that Home Tech Vault is reachable
       * and the connector token is valid.
       */
      setConnectionProblem(false);

      if (silent) {
        setErrorMessage(null);
      }

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
      const message =
        error instanceof Error
          ? error.message
          : "Unable to complete the network scan.";

      const currentMetadata =
        metadataRef.current;

      if (currentMetadata) {
        const failedMetadata:
          ConnectorMetadata = {
          ...currentMetadata,

          lastScanStartedAt:
            scanStartedAt,

          lastScanDurationMs:
            Math.max(
              0,
              Date.now() -
                scanStartedMs
            ),

          consecutiveScanFailures:
            (
              currentMetadata
                .consecutiveScanFailures ??
              0
            ) + 1,

          lastScanFailureAt:
            new Date().toISOString(),

          lastScanFailureMessage:
            message,

          pendingDiscoveryUploads:
            getPendingDiscoverySyncCount(),
        };

        try {
          await saveConnectorMetadata(
            failedMetadata
          );

          setMetadata(
            failedMetadata
          );
        } catch (
          metadataError
        ) {
          console.error(
            "Unable to save scan failure diagnostics:",
            metadataError
          );
        }
      }

      if (!silent) {
        setErrorMessage(message);
      }

      /*
       * Background scans must reject so
       * monitoringScheduler can apply its
       * exponential retry policy.
       */
      if (silent) {
        throw error instanceof Error
          ? error
          : new Error(message);
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

          onStatusChange:
            setMonitoringStatus,

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

  const startAppleHomeSetup =
    useCallback(async () => {
      setAppleHomeSetupOpen(true);
      setAppleHomePending(true);
      setAppleHomeError(null);
      setAppleHomePairing(null);

      try {
        const connectorToken =
          await loadConnectorToken();

        if (!connectorToken) {
          throw new Error(
            "Connector token missing. Pair this Mac again."
          );
        }

        const result =
          await createAppleHomePairingSession({
            token: connectorToken,
          });

        setAppleHomePairing(result);
        setAppleHomeNow(Date.now());
      } catch (error) {
        setAppleHomeError(
          error instanceof Error
            ? error.message
            : "Unable to start Apple Home setup."
        );
      } finally {
        setAppleHomePending(false);
      }
    }, []);

  const closeAppleHomeSetup =
    useCallback(() => {
      setAppleHomeSetupOpen(false);
      setAppleHomePairing(null);
      setAppleHomeError(null);
      setAppleHomePending(false);
    }, []);

  useEffect(() => {
    if (
      !appleHomeSetupOpen ||
      !appleHomePairing ||
      appleHomePairing.status !==
        "pending"
    ) {
      return;
    }

    const timer =
      window.setInterval(() => {
        setAppleHomeNow(Date.now());
      }, 1_000);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    appleHomePairing,
    appleHomeSetupOpen,
  ]);

  useEffect(() => {
    if (
      !appleHomeSetupOpen ||
      !appleHomePairing ||
      appleHomePairing.status !==
        "pending"
    ) {
      return;
    }

    let cancelled = false;

    const checkStatus =
      async () => {
        try {
          const connectorToken =
            await loadConnectorToken();

          if (!connectorToken) {
            return;
          }

          const result =
            await getAppleHomePairingStatus({
              token: connectorToken,
              sessionId:
                appleHomePairing.sessionId,
            });

          if (cancelled) {
            return;
          }

          setAppleHomePairing(
            (current) =>
              current
                ? {
                    ...current,
                    status: result.status,
                    expiresAt:
                      result.expiresAt,
                  }
                : current
          );

          if (
            result.status ===
            "approved"
          ) {
            setStatusMessage(
              "Apple Home pairing approved."
            );
          }
        } catch (error) {
          if (!cancelled) {
            setAppleHomeError(
              error instanceof Error
                ? error.message
                : "Unable to check Apple Home pairing status."
            );
          }
        }
      };

    void checkStatus();

    const interval =
      window.setInterval(
        () => {
          void checkStatus();
        },
        3_000
      );

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [
    appleHomePairing?.sessionId,
    appleHomePairing?.status,
    appleHomeSetupOpen,
  ]);

  const appleHomeSecondsRemaining =
    appleHomePairing
      ? Math.max(
          0,
          Math.ceil(
            (
              new Date(
                appleHomePairing.expiresAt
              ).getTime() -
              appleHomeNow
            ) / 1_000
          )
        )
      : 0;

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
            <header className="connector-app-header">
              <div>
                <div className="connector-title-row">
                  <span className="connector-logo-mark">
                    HTV
                  </span>

                  <div>
                    <p className="connector-product-label">
                      Home Tech Vault Connector
                    </p>

                    <h1>
                      {metadata.connectorName}
                    </h1>
                  </div>
                </div>

                <p className="lede">
                  Securely monitor your
                  network and connected
                  smart-home platforms.
                </p>
              </div>

              <div className="connector-header-status">
                <span
                  className={`live-status-dot ${
                    connectionProblem
                      ? "live-status-warning"
                      : "live-status-online"
                  }`}
                />

                <div>
                  <strong>
                    {connectionProblem
                      ? "Attention needed"
                      : "Connected"}
                  </strong>

                  <span>
                    {connectionLabel}
                  </span>
                </div>
              </div>
            </header>

            <nav
              className="connector-tabs"
              aria-label="Connector sections"
            >
              <button
                type="button"
                className={
                  activeConnectedTab ===
                  "connector"
                    ? "connector-tab active"
                    : "connector-tab"
                }
                onClick={() =>
                  setActiveConnectedTab(
                    "connector"
                  )
                }
              >
                <span className="tab-icon">
                  ◈
                </span>

                <span>
                  Connector
                </span>
              </button>

              <button
                type="button"
                className={
                  activeConnectedTab ===
                  "home-assistant"
                    ? "connector-tab active"
                    : "connector-tab"
                }
                onClick={() =>
                  setActiveConnectedTab(
                    "home-assistant"
                  )
                }
              >
                <span className="tab-icon">
                  HA
                </span>

                <span>
                  Home Assistant
                </span>

                {metadata.homeAssistantConnected ? (
                  <span className="tab-status-dot" />
                ) : null}
              </button>

              <button
                type="button"
                className={
                  activeConnectedTab ===
                  "apple-home"
                    ? "connector-tab active"
                    : "connector-tab"
                }
                onClick={() =>
                  setActiveConnectedTab(
                    "apple-home"
                  )
                }
              >
                <span className="tab-icon">
                  ⌂
                </span>

                <span>
                  Apple Home
                </span>

                <span className="tab-coming-soon">
                  Coming Soon
                </span>
              </button>

              <button
                type="button"
                className={
                  activeConnectedTab ===
                  "diagnostics"
                    ? "connector-tab active"
                    : "connector-tab"
                }
                onClick={() =>
                  setActiveConnectedTab(
                    "diagnostics"
                  )
                }
              >
                <span className="tab-icon">
                  ⌁
                </span>

                <span>
                  Diagnostics
                </span>
              </button>
            </nav>

            <section
              className={`connector-overview ${
                activeConnectedTab ===
                "connector"
                  ? ""
                  : "tab-hidden"
              }`}
            >
              <div className="section-heading">
                <div>
                  <p className="section-kicker">
                    Standard connector
                  </p>

                  <h2>
                    Network monitoring
                  </h2>

                  <p>
                    Keep your network inventory
                    and device status current.
                  </p>
                </div>

                <span className="premium-plan-badge">
                  Pro monitoring
                </span>
              </div>

              <dl className="details premium-details">
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
            </section>

            <section
              className={`scan-panel premium-tab-panel ${
                activeConnectedTab ===
                "connector"
                  ? ""
                  : "tab-hidden"
              }`}
            >
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

            <section
              className={`scan-panel diagnostics-panel premium-tab-panel ${
                activeConnectedTab ===
                "diagnostics"
                  ? ""
                  : "tab-hidden"
              }`}
            >
              <div className="diagnostics-heading">
                <div>
                  <h2>
                    Connector Diagnostics
                  </h2>

                  <p className="help">
                    Live reliability and
                    background monitoring
                    information for this
                    connector.
                  </p>
                </div>

                <span
                  className={`health-badge ${
                    connectionProblem ||
                    (
                      metadata
                        .consecutiveScanFailures ??
                      0
                    ) > 0
                      ? "health-warning"
                      : "health-healthy"
                  }`}
                >
                  {connectionProblem
                    ? "Connection issue"
                    : (
                          metadata
                            .consecutiveScanFailures ??
                          0
                        ) > 0
                      ? "Recovering"
                      : "Healthy"}
                </span>
              </div>

              <dl className="diagnostics-grid">
                <div>
                  <dt>
                    Background monitoring
                  </dt>

                  <dd>
                    {!metadata.monitoringEnabled
                      ? "Disabled"
                      : metadata.monitoringPaused
                        ? "Paused"
                        : monitoringStatus
                            ?.running
                          ? "Active"
                          : "Starting"}
                  </dd>
                </div>

                <div>
                  <dt>
                    Current activity
                  </dt>

                  <dd>
                    {monitoringStatus
                      ?.scanning
                      ? "Scanning network"
                      : scanPhase ===
                          "scanning"
                        ? "Scanning network"
                        : scanPhase ===
                            "syncing"
                          ? "Syncing devices"
                          : "Ready"}
                  </dd>
                </div>

                <div>
                  <dt>
                    Last successful sync
                  </dt>

                  <dd>
                    {formatTimestamp(
                      metadata
                        .lastSuccessfulSyncAt ??
                        metadata
                          .lastScanAt ??
                        null
                    )}
                  </dd>
                </div>

                <div>
                  <dt>
                    Last scan duration
                  </dt>

                  <dd>
                    {typeof metadata
                      .lastScanDurationMs ===
                    "number"
                      ? `${
                          Math.round(
                            metadata
                              .lastScanDurationMs /
                              100
                          ) / 10
                        } seconds`
                      : "—"}
                  </dd>
                </div>

                <div>
                  <dt>
                    Consecutive failures
                  </dt>

                  <dd>
                    {metadata
                      .consecutiveScanFailures ??
                      monitoringStatus
                        ?.consecutiveFailures ??
                      0}
                  </dd>
                </div>

                <div>
                  <dt>
                    Next scheduled scan
                  </dt>

                  <dd>
                    {metadata.monitoringEnabled &&
                    !metadata.monitoringPaused
                      ? formatTimestamp(
                          monitoringStatus
                            ?.nextScheduledAt ??
                            null
                        )
                      : "—"}
                  </dd>
                </div>

                <div>
                  <dt>
                    Pending uploads
                  </dt>

                  <dd>
                    {metadata
                      .pendingDiscoveryUploads ??
                      getPendingDiscoverySyncCount()}
                  </dd>
                </div>

                <div>
                  <dt>
                    Next retry
                  </dt>

                  <dd>
                    {formatTimestamp(
                      monitoringStatus
                        ?.nextRetryAt ??
                        null
                    )}
                  </dd>
                </div>

                <div>
                  <dt>
                    Last scan trigger
                  </dt>

                  <dd>
                    {monitoringStatus
                      ?.lastTrigger
                      ? monitoringStatus
                          .lastTrigger
                          .charAt(0)
                          .toUpperCase() +
                        monitoringStatus
                          .lastTrigger
                          .slice(1)
                      : "—"}
                  </dd>
                </div>
              </dl>

              {metadata
                .lastScanFailureMessage ? (
                <div className="diagnostic-warning">
                  <strong>
                    Last scan issue
                  </strong>

                  <span>
                    {
                      metadata
                        .lastScanFailureMessage
                    }
                  </span>

                  <small>
                    {formatTimestamp(
                      metadata
                        .lastScanFailureAt ??
                        null
                    )}
                  </small>
                </div>
              ) : null}
            </section>

            <section
              className={`scan-panel premium-tab-panel ${
                activeConnectedTab ===
                "connector"
                  ? ""
                  : "tab-hidden"
              }`}
            >
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

            <section
              className={`scan-panel premium-tab-panel ${
                activeConnectedTab ===
                "connector"
                  ? ""
                  : "tab-hidden"
              }`}
            >
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

            <section
              className={`scan-panel premium-tab-panel apple-home-tab ${
                activeConnectedTab ===
                "apple-home"
                  ? ""
                  : "tab-hidden"
              }`}
            >
              <div className="integration-heading">
                <div>
                  <h2>
                    Apple Home
                  </h2>

                  <span className="integration-badge coming-soon-badge">
                    Coming Soon
                  </span>
                </div>
              </div>

              <p className="help">
                Apple Home support is
                currently in development.
                Once released, Home Tech
                Vault will securely connect
                with compatible rooms and
                accessories already configured
                in the Apple Home app.
              </p>

              <div className="coming-soon-card">
                <div className="coming-soon-icon">
                  <span aria-hidden="true">
                    ⌂
                  </span>
                </div>

                <div>
                  <span className="coming-soon-label">
                    In development
                  </span>

                  <h3>
                    Apple Home is coming soon
                  </h3>

                  <p>
                    Connect Apple Home
                    accessories, view device
                    availability, and manage
                    compatible smart-home
                    technology from one Home
                    Tech Vault dashboard.
                  </p>
                </div>
              </div>

              <div className="feature-preview-grid">
                <div>
                  <span className="feature-preview-icon">
                    ◫
                  </span>

                  <strong>
                    Room synchronization
                  </strong>

                  <p>
                    Organize accessories using
                    your existing Apple Home
                    rooms.
                  </p>
                </div>

                <div>
                  <span className="feature-preview-icon">
                    ◉
                  </span>

                  <strong>
                    Live device status
                  </strong>

                  <p>
                    View compatible accessory
                    availability in Home Tech
                    Vault.
                  </p>
                </div>

                <div>
                  <span className="feature-preview-icon">
                    ◆
                  </span>

                  <strong>
                    Secure approval
                  </strong>

                  <p>
                    Apple Home access will
                    require approval from your
                    iPhone.
                  </p>
                </div>
              </div>

              {!appleHomeSetupOpen ? (
                <div className="actions">
                  <button
                    className="primary"
                    type="button"
                    disabled={
                      appleHomePending
                    }
                    onClick={() =>
                      void startAppleHomeSetup()
                    }
                  >
                    {appleHomePending
                      ? "Starting Apple Home Setup…"
                      : "Start Apple Home Setup"}
                  </button>
                </div>
              ) : (
                <div className="apple-home-setup">
                  <div className="apple-home-icon">
                    <span aria-hidden="true">
                      ⌂
                    </span>
                  </div>

                  <div>
                    <h3>
                      Finish setup on your iPhone
                    </h3>

                    <p>
                      The Mac connector will start
                      the connection, and your
                      iPhone will securely approve
                      access to Apple Home.
                    </p>
                  </div>

                  <ol className="apple-home-steps">
                    <li>
                      Open the Home Tech Vault app on
                      your iPhone.
                    </li>

                    <li>
                      Choose Connect Apple Home.
                    </li>

                    <li>
                      Scan the pairing code shown
                      here.
                    </li>

                    <li>
                      Approve Apple Home access.
                    </li>
                  </ol>

                  {appleHomeError ? (
                    <p className="status error">
                      {appleHomeError}
                    </p>
                  ) : null}

                  {appleHomePending ? (
                    <p className="status">
                      Creating a secure pairing session…
                    </p>
                  ) : null}

                  {appleHomePairing ? (
                    <div className="apple-home-placeholder">
                      {appleHomePairing.status ===
                      "approved" ? (
                        <>
                          <span>
                            Apple Home authorization
                          </span>

                          <strong>
                            Approved
                          </strong>
                        </>
                      ) : appleHomePairing.status ===
                        "expired" ||
                        appleHomeSecondsRemaining ===
                          0 ? (
                        <>
                          <span>
                            This pairing session has expired
                          </span>

                          <strong>
                            Generate a new code
                          </strong>
                        </>
                      ) : (
                        <>
                          <span>
                            Enter this code on your iPhone
                          </span>

                          <strong className="apple-home-code">
                            {appleHomePairing.code}
                          </strong>

                          <span>
                            Expires in{" "}
                            {Math.floor(
                              appleHomeSecondsRemaining /
                                60
                            )}
                            :
                            {String(
                              appleHomeSecondsRemaining %
                                60
                            ).padStart(
                              2,
                              "0"
                            )}
                          </span>

                          <a
                            href={
                              appleHomePairing.pairingUrl
                            }
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open approval link
                          </a>
                        </>
                      )}
                    </div>
                  ) : null}

                  <div className="actions">
                    <button
                      className="secondary"
                      type="button"
                      onClick={
                        closeAppleHomeSetup
                      }
                    >
                      Cancel Setup
                    </button>
                  </div>
                </div>
              )}
            </section>

            <section
              className={`scan-panel premium-tab-panel home-assistant-tab ${
                activeConnectedTab ===
                "home-assistant"
                  ? ""
                  : "tab-hidden"
              }`}
            >
              <div className="section-heading">
                <div>
                  <p className="section-kicker">
                    Smart-home integration
                  </p>

                  <h2>
                    Home Assistant
                  </h2>
                </div>

                <span
                  className={`integration-status-pill ${
                    metadata.homeAssistantConnected
                      ? "integration-connected"
                      : "integration-not-connected"
                  }`}
                >
                  {metadata.homeAssistantConnected
                    ? "Connected"
                    : "Not connected"}
                </span>
              </div>

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
              <section
                className={`consent-panel premium-tab-panel ${
                  activeConnectedTab ===
                  "connector"
                    ? ""
                    : "tab-hidden"
                }`}
              >
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