"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import {
  Activity,
  CheckCircle2,
  CircleOff,
  Lightbulb,
  Power,
  Radio,
  RefreshCw,
  Sparkles,
  Thermometer,
  Zap,
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

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  async function refreshDevices() {
    try {
      setRefreshing(true);
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }

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
      <PageCard className="overflow-hidden p-0">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-7 py-10 text-white md:px-10">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl" />

          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 backdrop-blur">
              <Sparkles size={22} />
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-indigo-200">
              Smart Home
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Your connected home,
              beautifully organized
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              Connect Home Assistant through
              the HomeCore Connector to see
              live device states and control
              supported lights and switches.
            </p>
          </div>
        </div>

        <div className="p-7 md:p-8">
          <div className="rounded-2xl border border-dashed border-border-subtle bg-surface-sunken p-6 text-center">
            <CircleOff
              size={24}
              className="mx-auto text-text-tertiary"
            />

            <p className="mt-3 text-sm font-semibold text-text-primary">
              No live devices synced yet
            </p>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary">
              Open the HomeCore Connector,
              connect Home Assistant, and run
              a sync to display your smart-home
              devices here.
            </p>
          </div>
        </div>
      </PageCard>
    );
  }

  const availableCount =
    stats?.availableCount ??
    entities.filter(
      (entity) => entity.available
    ).length;

  const controllableCount =
    entities.filter(
      (entity) =>
        entity.available &&
        (
          entity.domain === "light" ||
          entity.domain === "switch"
        )
    ).length;

  return (
    <div className="space-y-6">
      <PageCard className="overflow-hidden p-0">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-7 py-8 text-white md:px-9">
          <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-indigo-400/15 blur-3xl" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 backdrop-blur">
                  <Sparkles size={20} />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-200">
                    Home Assistant
                  </p>

                  <p className="mt-1 text-sm text-slate-300">
                    Live through HomeCore Connector
                  </p>
                </div>
              </div>

              <h2 className="mt-6 text-3xl font-semibold tracking-tight">
                Smart Home Control Center
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                Review live device status and
                control supported lights and
                switches from one secure place.
              </p>
            </div>

            <button
              type="button"
              disabled={refreshing}
              onClick={() => {
                void refreshDevices();
              }}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15 disabled:cursor-wait disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing…"
                : "Refresh devices"}
            </button>
          </div>

          <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
            <PremiumSummaryStat
              label="Connected"
              value={
                stats?.entityCount ??
                entities.length
              }
            />

            <PremiumSummaryStat
              label="Available"
              value={availableCount}
            />

            <PremiumSummaryStat
              label="Controllable"
              value={controllableCount}
            />
          </div>
        </div>
      </PageCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {entities.map((entity) => {
          const commandState =
            commandStates[entity.id];

          const displayedState =
            optimisticStates[entity.id] ??
            entity.currentState;

          const isOn =
            displayedState === "on";

          const isControllable =
            entity.domain === "light" ||
            entity.domain === "switch";

          const commandPending =
            commandState?.phase ===
              "sending" ||
            commandState?.phase ===
              "queued";

          const controlDisabled =
            !canControl ||
            !entity.available ||
            !isControllable ||
            commandPending;

          const nextService =
            isOn
              ? "turn_off"
              : "turn_on";

          return (
            <article
              key={entity.id}
              className={[
                "group relative overflow-hidden rounded-[24px] border p-5 shadow-sm transition duration-300",
                entity.available
                  ? "border-border-subtle bg-surface-primary hover:-translate-y-0.5 hover:shadow-lg"
                  : "border-border-subtle bg-surface-sunken opacity-80",
                isOn && entity.available
                  ? "ring-1 ring-amber-300/50"
                  : "",
              ].join(" ")}
            >
              {isOn &&
              entity.available ? (
                <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-amber-300/15 blur-3xl" />
              ) : null}

              <div className="relative flex items-start justify-between gap-4">
                <div
                  className={[
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition",
                    isOn &&
                    entity.available
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-border-subtle bg-surface-sunken text-text-secondary",
                  ].join(" ")}
                >
                  <EntityIcon
                    entity={entity}
                  />
                </div>

                <LiveStateBadge
                  available={
                    entity.available
                  }
                  isOn={isOn}
                  stateLabel={formatState({
                    ...entity,
                    currentState:
                      displayedState,
                  })}
                  pending={
                    commandPending
                  }
                />
              </div>

              <div className="relative mt-5">
                <p className="truncate text-lg font-semibold text-text-primary">
                  {entity.vaultDevice
                    ?.deviceName ??
                    entity.friendlyName ??
                    entity.objectId
                      .replaceAll("_", " ")
                      .replace(
                        /\b\w/g,
                        (character) =>
                          character.toUpperCase()
                      )}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-border-subtle bg-surface-sunken px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                    {entity.vaultDevice
                      ?.category ??
                      domainLabel(
                        entity.domain
                      )}
                  </span>

                  {entity.deviceClass ? (
                    <span className="rounded-full border border-border-subtle bg-surface-sunken px-2.5 py-1 text-[11px] font-medium text-text-tertiary">
                      {domainLabel(
                        entity.deviceClass
                      )}
                    </span>
                  ) : null}
                </div>
              </div>

              {entity.vaultDevice ? (
                <div className="relative mt-4 flex items-center justify-between gap-4 rounded-xl border border-border-subtle bg-surface-sunken px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-tertiary">
                      Added to Devices
                    </p>

                    <p className="mt-1 truncate text-xs font-medium text-text-secondary">
                      {entity.vaultDevice
                        .location ??
                        "No room assigned"}
                    </p>
                  </div>

                  <Link
                    href={`/devices/${entity.vaultDevice.id}`}
                    className="shrink-0 text-xs font-semibold text-indigo-700 transition hover:text-indigo-900"
                  >
                    View Device
                  </Link>
                </div>
              ) : (
                <div className="relative mt-4 rounded-xl border border-dashed border-border-subtle bg-surface-sunken px-3 py-2.5">
                  <p className="text-xs font-medium text-text-secondary">
                    Not yet added to your Devices
                  </p>
                </div>
              )}

              <div className="relative mt-6 flex items-center justify-between gap-4 rounded-2xl border border-border-subtle bg-surface-sunken p-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                    Current state
                  </p>

                  <p className="mt-1 text-sm font-semibold text-text-primary">
                    {formatState({
                      ...entity,
                      currentState:
                        displayedState,
                    })}
                  </p>
                </div>

                {isControllable ? (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isOn}
                    aria-label={`Turn ${
                      entity.vaultDevice
                        ?.deviceName ??
                      entity.friendlyName ??
                      entity.objectId
                    } ${
                      isOn ? "off" : "on"
                    }`}
                    disabled={
                      controlDisabled
                    }
                    onClick={() => {
                      void sendCommand(
                        entity,
                        nextService
                      );
                    }}
                    className={[
                      "relative inline-flex h-9 w-[66px] shrink-0 items-center rounded-full border p-1 transition-all duration-300",
                      isOn
                        ? "border-amber-400 bg-amber-400"
                        : "border-slate-300 bg-slate-300",
                      controlDisabled
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer shadow-inner hover:scale-[1.03]",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300",
                        isOn
                          ? "translate-x-7 text-amber-600"
                          : "translate-x-0 text-slate-500",
                      ].join(" ")}
                    >
                      {commandPending ? (
                        <Activity
                          size={14}
                          className="animate-spin"
                        />
                      ) : (
                        <Power size={14} />
                      )}
                    </span>
                  </button>
                ) : (
                  <div className="flex h-9 items-center rounded-full border border-border-subtle bg-surface-primary px-3 text-xs font-semibold text-text-secondary">
                    Live status
                  </div>
                )}
              </div>

              {!canControl &&
              isControllable ? (
                <p className="relative mt-3 text-xs leading-5 text-text-tertiary">
                  Read-only household access
                </p>
              ) : null}

              {commandState?.message ? (
                <div
                  className={[
                    "relative mt-3 flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs leading-5",
                    commandState.phase ===
                    "error"
                      ? "bg-red-50 text-red-700"
                      : commandState.phase ===
                        "succeeded"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-indigo-50 text-indigo-700",
                  ].join(" ")}
                >
                  {commandState.phase ===
                  "succeeded" ? (
                    <CheckCircle2
                      size={15}
                      className="mt-0.5 shrink-0"
                    />
                  ) : commandState.phase ===
                    "error" ? (
                    <CircleOff
                      size={15}
                      className="mt-0.5 shrink-0"
                    />
                  ) : (
                    <Zap
                      size={15}
                      className="mt-0.5 shrink-0"
                    />
                  )}

                  <span>
                    {commandState.message}
                  </span>
                </div>
              ) : null}

              <p className="relative mt-4 truncate text-[11px] text-text-tertiary">
                {entity.entityId}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function PremiumSummaryStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-300">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

function LiveStateBadge({
  available,
  isOn,
  stateLabel,
  pending,
}: {
  available: boolean;
  isOn: boolean;
  stateLabel: string;
  pending: boolean;
}) {
  if (!available) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />

        Unavailable
      </span>
    );
  }

  if (pending) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
        <Activity
          size={12}
          className="animate-spin"
        />

        Updating
      </span>
    );
  }

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        isOn
          ? "bg-amber-50 text-amber-700"
          : "bg-slate-100 text-slate-600",
      ].join(" ")}
    >
      <span
        className={[
          "h-1.5 w-1.5 rounded-full",
          isOn
            ? "bg-amber-500"
            : "bg-slate-400",
        ].join(" ")}
      />

      {stateLabel}
    </span>
  );
}
