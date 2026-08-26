import type { SubscriptionPlan } from "@/hooks/useSubscription";
import { PLAN_LIMITS } from "@/lib/permissions/plans";

import {
  resolveConnectorLimits,
  type ConnectorAccessContext,
} from "@/lib/connector/access";

export const CONNECTOR_AUTO_SCAN_INTERVAL_MINUTES = 15;

export type ConnectorPlanEntitlements = {
  plan: SubscriptionPlan;
  maxConnectors: number | null;
  canDownload: boolean;
  canPair: boolean;
  canManualScan: boolean;
  canDiscovery: boolean;
  canAutoMonitoring: boolean;
  canBackgroundScanning: boolean;
  canTimeline: boolean;
  canRecommendations: boolean;
  canHomePulseLive: boolean;
};

export function getConnectorPlanEntitlements(
  plan: SubscriptionPlan,
  isPlatformAdmin = false
): ConnectorPlanEntitlements {
  const { maxConnectors, canUseMonitoring } = resolveConnectorLimits(
    plan,
    isPlatformAdmin
  );

  return {
    plan,
    maxConnectors,
    canDownload: true,
    canPair: true,
    canManualScan: true,
    canDiscovery: true,
    canAutoMonitoring: canUseMonitoring,
    canBackgroundScanning: canUseMonitoring,
    canTimeline: canUseMonitoring,
    canRecommendations: canUseMonitoring,
    canHomePulseLive: canUseMonitoring,
  };
}

export function connectorPlanLabel(plan: SubscriptionPlan): string {
  return PLAN_LIMITS[plan] ? plan.charAt(0).toUpperCase() + plan.slice(1) : plan;
}

export function describeConnectorAccess(
  access: ConnectorAccessContext
): string {
  if (access.maxConnectors === null) {
    return "Unlimited connectors on Family";
  }

  if (access.maxConnectors === 1) {
    return "1 connector on Free · manual scans and discovery included";
  }

  return `Up to ${access.maxConnectors} connectors on Pro`;
}
