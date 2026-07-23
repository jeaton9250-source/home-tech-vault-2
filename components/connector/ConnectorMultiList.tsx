"use client";

import {
  connectorPresenceDescription,
  connectorPresenceLabel,
  deriveConnectorPresence,
} from "@/lib/connector/presence";
import { formatConnectorRelativeTime } from "@/lib/connector/scanHistory";
import { formatPlatformLabel } from "@/lib/connector/platforms";
import { checkConnectorUpdate } from "@/lib/connector/updates";

import type { ConnectorInstallationSummary } from "@/lib/connector/types";

type ConnectorMultiListProps = {
  connectors: ConnectorInstallationSummary[];
  selectedId?: string | null;
  onSelect?: (connectorId: string) => void;
};

export default function ConnectorMultiList({
  connectors,
  selectedId,
  onSelect,
}: ConnectorMultiListProps) {
  const activeConnectors = connectors.filter(
    (connector) => connector.status !== "revoked"
  );

  if (activeConnectors.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-border-subtle bg-surface-sunken p-6 text-sm leading-6 text-text-secondary">
        No connectors paired yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activeConnectors.map((connector) => {
        const presence = deriveConnectorPresence(
          connector.status,
          connector.lastSeenAt
        );
        const update = checkConnectorUpdate(connector.appVersion);
        const isSelected = selectedId === connector.id;

        return (
          <button
            key={connector.id}
            type="button"
            onClick={() => onSelect?.(connector.id)}
            className={
              "w-full rounded-[24px] border p-5 text-left transition " +
              (isSelected
                ? "border-charcoal bg-surface-sunken"
                : "border-border-subtle bg-white hover:border-border-strong")
            }
          >
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-lg font-semibold text-text-primary">
                {connector.name}
              </p>
              <span className="rounded-full bg-surface-sunken px-3 py-1 text-xs font-semibold text-text-secondary">
                {connectorPresenceLabel(presence)}
              </span>
              {update.status === "update_available" ? (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                  Update available
                </span>
              ) : null}
            </div>

            <p className="mt-2 text-sm text-text-secondary">
              {formatPlatformLabel(connector.platform)}
              {connector.appVersion
                ? ` · v${connector.appVersion}`
                : ""}
            </p>

            <p className="mt-1 text-xs text-text-tertiary">
              {connectorPresenceDescription(presence)} · Last seen{" "}
              {formatConnectorRelativeTime(connector.lastSeenAt)}
            </p>
          </button>
        );
      })}
    </div>
  );
}
