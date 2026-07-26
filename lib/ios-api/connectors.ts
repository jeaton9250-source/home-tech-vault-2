import { deriveConnectorPresence } from "@/lib/connector/presence";
import type { ConnectorInstallationRow } from "@/lib/connector/types";

export type IosConnectorStatus =
  | "unpaired"
  | "waiting_for_pairing"
  | "online"
  | "stale"
  | "offline"
  | "revoked"
  | "error";

export function mapConnectorStatus(row: Pick<ConnectorInstallationRow, "status" | "last_seen_at">): IosConnectorStatus {
  const presence = deriveConnectorPresence(row.status, row.last_seen_at);

  switch (presence) {
    case "online":
      return "online";
    case "recently_seen":
      return "stale";
    case "offline":
      return "offline";
    case "revoked":
      return "revoked";
    case "pending":
      return "waiting_for_pairing";
  }
}

export function connectorCodeHint(code: string) {
  const digits = code.replace(/\D/g, "");
  const suffix = digits.slice(-4) || code.slice(-4);
  return `••${suffix}`;
}
