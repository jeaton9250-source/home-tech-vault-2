"use client";

import UpgradeCard from "@/components/ui/UpgradeCard";
import {
  CONNECTOR_UPGRADE_MESSAGE,
} from "@/lib/connector/access";

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
      <p
        className={`text-sm leading-6 text-text-secondary ${
          className ?? ""
        }`}
      >
        {CONNECTOR_UPGRADE_MESSAGE}
      </p>
    );
  }

  return (
    <UpgradeCard
      title="Upgrade to use the connector"
      description={
        CONNECTOR_UPGRADE_MESSAGE
      }
      actionLabel="View Pro and Family plans"
      href="/upgrade"
      className={className}
    />
  );
}