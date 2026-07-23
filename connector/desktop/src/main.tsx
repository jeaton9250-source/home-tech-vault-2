import { StrictMode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { getCurrentWindow } from "@tauri-apps/api/window";

import { confirmPairing, sendHeartbeat } from "./lib/api";
import { APP_VERSION, getApiBaseUrl } from "./lib/config";
import {
  disconnectLocally,
  getDeviceName,
  loadConnectorMetadata,
  loadConnectorToken,
  saveConnectorMetadata,
  saveConnectorToken,
  deleteConnectorMetadata,
} from "./lib/credentials";
import {
  startHeartbeatScheduler,
  type HeartbeatTickResult,
} from "./lib/heartbeatScheduler";
import { logConnectorEvent } from "./lib/logger";
import { ConnectorApiError } from "./lib/types";

import type {
  AppScreen,
  ConnectorMetadata,
} from "./lib/types";

import "./styles.css";

const RECENT_HEARTBEAT_MS = 10 * 60 * 1000;

function shortenId(value: string) {
  if (value.length <= 12) {
    return value;
  }

  return `${value.slice(0, 8)}…`;
}

function formatTimestamp(value: string | null) {
  if (!value) {
    return "Never";
  }

  return new Date(value).toLocaleString();
}

function isRecentHeartbeat(value: string | null) {
  if (!value) {
    return false;
  }

  const timestamp = new Date(value).getTime();

  if (!Number.isFinite(timestamp)) {
    return false;
  }

  return Date.now() - timestamp <= RECENT_HEARTBEAT_MS;
}

function App() {
  const [screen, setScreen] =
    useState<AppScreen>("unpaired");
  const [pairingCode, setPairingCode] =
    useState("");
  const [connectorName, setConnectorName] =
    useState("");
  const [metadata, setMetadata] =
    useState<ConnectorMetadata | null>(null);
  const [statusMessage, setStatusMessage] =
    useState<string | null>(null);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);
  const [heartbeatPending, setHeartbeatPending] =
    useState(false);
  const [connectionProblem, setConnectionProblem] =
    useState(false);
  const [bootstrapping, setBootstrapping] =
    useState(true);

  const metadataRef = useRef(metadata);
  metadataRef.current = metadata;

  const apiBaseUrl = useMemo(
    () => getApiBaseUrl(),
    []
  );

  const connectionLabel = useMemo(() => {
    if (heartbeatPending) {
      return "Sending heartbeat…";
    }

    if (errorMessage?.includes("revoked")) {
      return "Access revoked";
    }

    if (connectionProblem) {
      return "Connection problem";
    }

    if (isRecentHeartbeat(metadata?.lastHeartbeatAt ?? null)) {
      return "Connected";
    }

    if (metadata?.lastHeartbeatAt) {
      return "Waiting for next heartbeat";
    }

    return "Waiting for first heartbeat";
  }, [
    heartbeatPending,
    errorMessage,
    connectionProblem,
    metadata?.lastHeartbeatAt,
  ]);

  const clearIncompletePairing = useCallback(async () => {
    await deleteConnectorMetadata();
    setMetadata(null);
    setScreen("unpaired");
  }, []);

  const performHeartbeat = useCallback(
    async (options?: {
      manual?: boolean;
    }): Promise<HeartbeatTickResult> => {
      const manual = options?.manual ?? false;

      if (manual) {
        setHeartbeatPending(true);
        setErrorMessage(null);
        setStatusMessage(null);
      }

      try {
        const token =
          await loadConnectorToken();

        if (!token) {
          logConnectorEvent("token_missing");
          await clearIncompletePairing();
          setErrorMessage(
            "Connector token missing from Keychain. Pair this Mac again."
          );
          return {
            ok: false,
            retryable: false,
          };
        }

        const deviceName =
          await getDeviceName();

        const response = await sendHeartbeat({
          token,
          appVersion: APP_VERSION,
          deviceName,
        });

        const nextMetadata: ConnectorMetadata =
          {
            connectorId: response.connectorId,
            householdId: response.householdId,
            connectorName:
              metadataRef.current?.connectorName ??
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

        return { ok: true };
      } catch (error) {
        if (
          error instanceof ConnectorApiError &&
          error.kind === "unauthorized"
        ) {
          setConnectionProblem(false);
          setErrorMessage(
            "Connector access revoked or invalid. Generate a new pairing code in Home Tech Vault, or disconnect locally."
          );
          return {
            ok: false,
            retryable: false,
          };
        }

        const retryable =
          error instanceof ConnectorApiError &&
          (error.kind === "network" ||
            error.kind === "timeout" ||
            error.kind === "server" ||
            error.kind === "tls");

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
          setHeartbeatPending(false);
        }
      }
    },
    [clearIncompletePairing]
  );

  useEffect(() => {
    logConnectorEvent("app_started");

    async function bootstrap() {
      try {
        const [
          storedMetadata,
          token,
          deviceName,
        ] = await Promise.all([
          loadConnectorMetadata(),
          loadConnectorToken(),
          getDeviceName(),
        ]);

        setConnectorName(deviceName);

        if (storedMetadata && !token) {
          await deleteConnectorMetadata();
          setErrorMessage(
            "Previous pairing was incomplete. Generate a new code and pair again."
          );
          return;
        }

        if (!storedMetadata || !token) {
          return;
        }

        setMetadata(storedMetadata);
        setScreen("connected");

        await performHeartbeat();
      } finally {
        setBootstrapping(false);
      }
    }

    void bootstrap();
  }, [performHeartbeat]);

  useEffect(() => {
    if (screen !== "connected" || !metadata) {
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
      const result = await confirmPairing({
        code: pairingCode,
        connectorName:
          connectorName.trim() ||
          (await getDeviceName()),
        appVersion: APP_VERSION,
      });

      await saveConnectorToken(
        result.connectorToken
      );

      const nextMetadata: ConnectorMetadata = {
        connectorId: result.connectorId,
        householdId: result.householdId,
        connectorName: result.connectorName,
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
          : "Unable to pair this Mac."
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
    setScreen("unpaired");
  }

  async function handleQuit() {
    await getCurrentWindow().close();
  }

  if (bootstrapping) {
    return (
      <main className="app-shell">
        <section className="panel">
          <p className="eyebrow">
            Home Tech Vault
          </p>
          <h1>Loading connector…</h1>
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

        {screen === "unpaired" ? (
          <>
            <h1>
              Connect this Mac to your
              household
            </h1>
            <p className="lede">
              Pair this Mac with your Home
              Tech Vault household using a
              one-time code.
            </p>

            <label className="field">
              <span>Pairing code</span>
              <input
                value={pairingCode}
                onChange={(event) =>
                  setPairingCode(
                    event.target.value
                  )
                }
                placeholder="ABCD-1234"
                autoCapitalize="characters"
              />
            </label>

            <label className="field">
              <span>Connector name</span>
              <input
                value={connectorName}
                onChange={(event) =>
                  setConnectorName(
                    event.target.value
                  )
                }
                placeholder="Jason’s MacBook"
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
              Generate a pairing code from
              Home Tech Vault under Network
              → Connect Your Home Network.
            </p>

            {import.meta.env.DEV ? (
              <p className="help api-target">
                API target: {apiBaseUrl}
              </p>
            ) : null}
          </>
        ) : null}

        {screen === "pairing" ? (
          <>
            <h1>Pairing…</h1>
            <p className="lede">
              Contacting Home Tech Vault
              securely. Do not close the
              app.
            </p>
            <div className="spinner" />
          </>
        ) : null}

        {screen === "connected" && metadata ? (
          <>
            <h1>
              Connected to Home Tech Vault
            </h1>
            <p className="lede">
              This Mac sends automatic
              heartbeats every 5 minutes
              while the app is running.
            </p>

            <dl className="details">
              <div>
                <dt>Connector name</dt>
                <dd>{metadata.connectorName}</dd>
              </div>
              <div>
                <dt>Household</dt>
                <dd>
                  {shortenId(
                    metadata.householdId
                  )}
                </dd>
              </div>
              <div>
                <dt>App version</dt>
                <dd>{APP_VERSION}</dd>
              </div>
              <div>
                <dt>Last heartbeat</dt>
                <dd>
                  {formatTimestamp(
                    metadata.lastHeartbeatAt
                  )}
                </dd>
              </div>
              <div>
                <dt>Connection status</dt>
                <dd>{connectionLabel}</dd>
              </div>
            </dl>

            <div className="actions">
              <button
                className="primary"
                type="button"
                disabled={heartbeatPending}
                onClick={() =>
                  void performHeartbeat({
                    manual: true,
                  })
                }
              >
                Send Test Heartbeat
              </button>

              <button
                className="secondary"
                type="button"
                onClick={() =>
                  void handleDisconnect()
                }
              >
                Disconnect This Mac
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
              Disconnect locally removes this
              Mac&apos;s Keychain token. To
              revoke server-side access, use
              Home Tech Vault → Network →
              Connect Your Home Network.
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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
