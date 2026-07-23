"use client";

import { Activity, Lock } from "lucide-react";

import Badge from "@/components/ui/Badge";
import { CONNECTOR_MONITORING_FREE_MESSAGE } from "@/lib/connector/access";

type ConnectorMonitoringBadgeProps = {
  enabled: boolean;
};

export default function ConnectorMonitoringBadge({
  enabled,
}: ConnectorMonitoringBadgeProps) {
  if (enabled) {
    return (
      <Badge variant="success" className="inline-flex items-center gap-1.5">
        <Activity size={12} />
        Automatic monitoring active
      </Badge>
    );
  }

  return (
    <Badge variant="premium" className="inline-flex items-center gap-1.5">
      <Lock size={12} />
      {CONNECTOR_MONITORING_FREE_MESSAGE}
    </Badge>
  );
}
