"use client";

import UpgradeCard from "@/components/ui/UpgradeCard";
import { CONNECTOR_UPGRADE_MESSAGE } from "@/lib/connector/access";

type ConnectorUpgradePromptProps = {
  compact?: boolean;
  className?: string;
};

export default function ConnectorUpgradePrompt({
  compact = false,
  className,
}: ConnectorUpgradePromptProps) {
  if (compact) {
    return (
      <p className={`text-sm leading-6 text-text-secondary ${className ?? ""}`}>
        {CONNECTOR_UPGRADE_MESSAGE}
      </p>
    );
  }

  return (
    <UpgradeCard
      title="Enable automatic monitoring"
      description={CONNECTOR_UPGRADE_MESSAGE}
      actionLabel="Upgrade to Pro"
      href="/upgrade"
      className={className}
    />
  );
}
