"use client";

import {
  useState,
} from "react";

import {
  Activity,
  CheckCircle2,
  CircleOff,
  Lightbulb,
  Power,
  Radio,
  Thermometer,
} from "lucide-react";

import PageCard from "@/components/ui/PageCard";

import type {
  HomeAssistantEntitySummary,
  HomeAssistantEntityStats,
} from "@/hooks/useNetworkPageData";

type HomeAssistantLiveStatesProps = {
  entities: HomeAssistantEntitySummary[];
  stats: HomeAssistantEntityStats | null;
  householdId: string;
  canControl: boolean;
  onRefresh: () => Promise<void>;
};

type CommandState = {
  phase:
    | "idle"
    | "sending"
    | "queued"
    | "succeeded"
    | "error";
  message: string | null;
  commandId?: string | null;
  requestedService?:
    | "turn_on"
    | "turn_off"
    | null;
};

function formatState(
  entity: HomeAssistantEntitySummary
) {
  const state =
    entity.currentState.trim();

  if (
    entity.unitOfMeasurement &&
    state
  ) {
    return `${state} ${entity.unitOfMeasurement}`;
  }

  if (state === "on") {
    return "On";
  }

  if (state === "off") {
    return "Off";
  }

  if (state === "unavailable") {
    return "Unavailable";
  }

  if (state === "unknown") {
    return "Unknown";
  }

  return state
    .replace(/_/g, " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

function domainLabel(
  domain: string
) {
  return domain
    .replace(/_/g, " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

function EntityIcon({
  entity,
}: {
  entity: HomeAssistantEntitySummary;
}) {
  const iconProps = {
    size: 18,
    strokeWidth: 1.8,
  };

  if (entity.domain === "light") {
    return (
      <Lightbulb {...iconProps} />
    );
  }

  if (entity.domain === "switch") {
    return <Power {...iconProps} />;
  }

  if (
    entity.domain === "sensor" &&
    entity.deviceClass ===
      "temperature"
  ) {
    return (
      <Thermometer {...iconProps} />
    );
  }

  if (
    entity.domain === "binary_sensor"
  ) {
    return <Radio {...iconProps} />;
  }

  return <Activity {...iconProps} />;
}

export default function HomeAssistantLiveStates({
  entities,
  stats,
  householdId,
  canControl,
  onRefresh,
}: HomeAssistantLiveStatesProps) {
  const [
    commandStates,
    setCommandStates,
  ] = useState<
    Record<string, CommandState>
  >({});

  const [
    optimisticStates,
    setOptimisticStates,
  ] = useState<
    Record<string, "on" | "off">
  >({});

  async function watchCommand(
    entityRecordId: string,
    commandId: string,
    requestedService:
      | "turn_on"
      | "turn_off"
  ) {
    const maxAttempts = 30;

    for (
      let attempt = 0;
      attempt < maxAttempts;
      attempt += 1
    ) {
      await new Promise(
        (resolve) =>
          window.setTimeout(
            resolve,
            1_000
          )
      );

      try {
        const response = await fetch(
          `/api/connector/home-assistant/commands?householdId=${encodeURIComponent(
            householdId
          )}&commandId=${encodeURIComponent(
            commandId
          )}`,
          {
            cache: "no-store",
          }
        );

        const payload =
          (await response.json()) as {
            error?: string;
            command?: {
              status?: string;
              error_message?:
                | string
                | null;
            };
          };

        if (!response.ok) {
          throw new Error(
            payload.error ??
              "Unable to check command status."
          );
        }

        const status =
          payload.command?.status;

        if (status === "succeeded") {
          setOptimisticStates(
            (current) => ({
              ...current,
              [entityRecordId]:
                requestedService ===
                "turn_on"
                  ? "on"
                  : "off",
            })
          );

          setCommandStates(
            (current) => ({
              ...current,
              [entityRecordId]: {
                phase:
                  "succeeded",
                message:
                  requestedService ===
                  "turn_on"
                    ? "Turned on."
                    : "Turned off.",
                commandId,
                requestedService,
              },
            })
          );

          return;
        }

        if (
          status === "failed" ||
          status === "expired" ||
          status === "cancelled"
        ) {
          setOptimisticStates(
            (current) => {
              const next = {
                ...current,
              };

              delete next[
                entityRecordId
              ];

              return next;
            }
          );

          setCommandStates(
            (current) => ({
              ...current,
              [entityRecordId]: {
                phase: "error",
                message:
                  payload.command
                    ?.error_message ??
                  "The command could not be completed.",
                commandId,
                requestedService,
              },
            })
          );

          return;
        }
      } catch (error) {
        if (
          attempt ===
          maxAttempts - 1
        ) {
          setCommandStates(
            (current) => ({
              ...current,
              [entityRecordId]: {
                phase: "error",
                message:
                  error instanceof Error
                    ? error.message
                    : "Unable to confirm the command result.",
                commandId,
                requestedService,
              },
            })
          );
        }
      }
    }

    setCommandStates(
      (current) => ({
        ...current,
        [entityRecordId]: {
          phase: "error",
          message:
            "The connector did not finish the command in time.",
          commandId,
          requestedService,
        },
      })
    );
  }

  async function sendCommand(
    entity: HomeAssistantEntitySummary,
    service:
      | "turn_on"
      | "turn_off"
  ) {
    const previousState =
      optimisticStates[entity.id] ??
      (
        entity.currentState === "on" ||
        entity.currentState === "off"
          ? entity.currentState
          : null
      );

    setOptimisticStates(
      (current) => ({
        ...current,
        [entity.id]:
          service === "turn_on"
            ? "on"
            : "off",
      })
    );

    setCommandStates(
      (current) => ({
        ...current,
        [entity.id]: {
          phase: "sending",
          message:
            service === "turn_on"
              ? "Sending turn-on command…"
              : "Sending turn-off command…",
          commandId: null,
          requestedService:
            service,
        },
      })
    );

    try {
      const response = await fetch(
        "/api/connector/home-assistant/commands",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            householdId,
            entityId: entity.id,
            service,
          }),
        }
      );

      const payload =
        (await response.json()) as {
          error?: string;
          command?: {
            id?: string;
          };
        };

      if (!response.ok) {
        throw new Error(
          payload.error ??
            "Unable to send the Home Assistant command."
        );
      }

      const commandId =
        payload.command?.id;

      if (!commandId) {
        throw new Error(
          "The server did not return a command ID."
        );
      }

      setCommandStates(
        (current) => ({
          ...current,
          [entity.id]: {
            phase: "queued",
            message:
              service === "turn_on"
                ? "Turning on…"
                : "Turning off…",
            commandId,
            requestedService:
              service,
          },
        })
      );

      void watchCommand(
        entity.id,
        commandId,
        service
      );
    } catch (error) {
      setOptimisticStates(
        (current) => {
          const next = {
            ...current,
          };

          if (previousState) {
            next[entity.id] =
              previousState;
          } else {
            delete next[entity.id];
          }

          return next;
        }
      );

      setCommandStates(
        (current) => ({
          ...current,
          [entity.id]: {
            phase: "error",
            message:
              error instanceof Error
                ? error.message
                : "Unable to send the command.",
            commandId: null,
            requestedService:
              service,
          },
        })
      );
    }
  }

  if (entities.length === 0) {
    return (
      <PageCard className="p-7 md:p-8">
        <p className="text-overline text-section-network">
          Home Assistant
        </p>

        <h2 className="mt-2 text-2xl font-semibold text-text-primary">
          No live entities synced yet
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">
          Open the Home Tech Vault Connector,
          connect Home Assistant, and run a
          Home Assistant sync to display live
          device states here.
        </p>
      </PageCard>
    );
  }

  return (
    <PageCard className="p-7 md:p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-overline text-section-network">
            Home Assistant
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-text-primary">
            Live device states
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-7 text-text-secondary">
            Read-only states synchronized from
            your local Home Assistant server
            through the Home Tech Vault
            Connector.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:min-w-[320px]">
          <SummaryStat
            label="Entities"
            value={
              stats?.entityCount ??
              entities.length
            }
          />

          <SummaryStat
            label="Available"
            value={
              stats?.availableCount ??
              entities.filter(
                (entity) =>
                  entity.available
              ).length
            }
          />

          <SummaryStat
            label="Types"
            value={
              stats?.domainCount ??
              new Set(
                entities.map(
                  (entity) =>
                    entity.domain
                )
              ).size
            }
          />
        </div>
      </div>

      <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {entities.map((entity) => (
          <article
            key={entity.id}
            className="rounded-[20px] border border-border-subtle bg-surface-sunken p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-border-subtle bg-surface-card text-text-primary">
                <EntityIcon
                  entity={entity}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-text-primary">
                      {entity.friendlyName ??
                        entity.entityId}
                    </h3>

                    <p className="mt-1 truncate text-xs text-text-tertiary">
                      {entity.entityId}
                    </p>
                  </div>

                  <AvailabilityBadge
                    available={
                      entity.available
                    }
                  />
                </div>

                <div className="mt-4">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-text-tertiary">
                    Current state
                  </p>

                  <p className="mt-1 text-lg font-semibold text-text-primary">
                    {optimisticStates[
                      entity.id
                    ] === "on"
                      ? "On"
                      : optimisticStates[
                            entity.id
                          ] === "off"
                        ? "Off"
                        : formatState(
                            entity
                          )}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-border-subtle bg-surface-card px-2.5 py-1 text-xs font-medium text-text-secondary">
                    {domainLabel(
                      entity.domain
                    )}
                  </span>

                  {entity.deviceClass ? (
                    <span className="rounded-full border border-border-subtle bg-surface-card px-2.5 py-1 text-xs font-medium text-text-secondary">
                      {domainLabel(
                        entity.deviceClass
                      )}
                    </span>
                  ) : null}
                </div>

                {canControl &&
                entity.available &&
                (entity.domain === "light" ||
                  entity.domain === "switch") ? (
                  <EntityControls
                    entity={entity}
                    commandState={
                      commandStates[
                        entity.id
                      ] ?? {
                        phase: "idle",
                        message: null,
                        commandId: null,
                        requestedService:
                          null,
                      }
                    }
                    onCommand={
                      sendCommand
                    }
                  />
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </PageCard>
  );
}

function EntityControls({
  entity,
  commandState,
  onCommand,
}: {
  entity: HomeAssistantEntitySummary;
  commandState: CommandState;
  onCommand: (
    entity: HomeAssistantEntitySummary,
    service:
      | "turn_on"
      | "turn_off"
  ) => Promise<void>;
}) {
  const busy =
    commandState.phase ===
      "sending" ||
    commandState.phase ===
      "queued";

  const activeService =
    commandState.requestedService;

  function buttonLabel(
    service:
      | "turn_on"
      | "turn_off"
  ) {
    if (
      busy &&
      activeService === service
    ) {
      if (
        commandState.phase ===
        "sending"
      ) {
        return "Sending…";
      }

      if (
        commandState.phase ===
        "queued"
      ) {
        return service === "turn_on"
          ? "Turning On…"
          : "Turning Off…";
      }

      if (
        commandState.phase ===
        "succeeded"
      ) {
        return "Done";
      }
    }

    return service === "turn_on"
      ? "Turn On"
      : "Turn Off";
  }

  return (
    <div className="mt-4 border-t border-border-subtle pt-4">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            void onCommand(
              entity,
              "turn_on"
            );
          }}
          className={[
            "inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--radius-button)] px-3 py-2 text-sm font-semibold transition",
            busy
              ? "cursor-not-allowed bg-surface-card text-text-tertiary"
              : "bg-charcoal text-surface-card hover:opacity-90",
          ].join(" ")}
        >
          <Power size={16} />

          {buttonLabel(
            "turn_on"
          )}
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={() => {
            void onCommand(
              entity,
              "turn_off"
            );
          }}
          className={[
            "inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--radius-button)] border px-3 py-2 text-sm font-semibold transition",
            busy
              ? "cursor-not-allowed border-border-subtle bg-surface-card text-text-tertiary"
              : "border-border-subtle bg-surface-card text-text-primary hover:bg-surface-sunken",
          ].join(" ")}
        >
          <Power size={16} />

          {buttonLabel(
            "turn_off"
          )}
        </button>
      </div>

      {commandState.message ? (
        <p
          className={[
            "mt-2 text-xs leading-5",
            commandState.phase ===
            "error"
              ? "text-danger"
              : "text-text-secondary",
          ].join(" ")}
        >
          {commandState.message}
        </p>
      ) : null}
    </div>
  );
}

function SummaryStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[16px] border border-border-subtle bg-surface-sunken px-3 py-3 text-center">
      <p className="text-xl font-semibold text-text-primary">
        {value}
      </p>

      <p className="mt-1 text-xs text-text-secondary">
        {label}
      </p>
    </div>
  );
}

function AvailabilityBadge({
  available,
}: {
  available: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold",
        available
          ? "bg-success-soft text-success"
          : "bg-surface-card text-text-tertiary",
      ].join(" ")}
    >
      {available ? (
        <CheckCircle2 size={12} />
      ) : (
        <CircleOff size={12} />
      )}

      {available
        ? "Available"
        : "Offline"}
    </span>
  );
}
