import { PLAN_LIMITS } from "@/lib/permissions/plans";

import type { SubscriptionPlan } from "@/hooks/useSubscription";

export const CONNECTOR_UPGRADE_MESSAGE =
  "Upgrade to Pro to automatically monitor your home and keep Home Tech Vault up to date.";

export const CONNECTOR_MONITORING_FREE_MESSAGE =
  "Enable Automatic Monitoring with Pro.";

export type ConnectorAccessContext = {
  plan: SubscriptionPlan;
  isPlatformAdmin: boolean;
  canUseMonitoring: boolean;
  maxConnectors: number | null;
  activeConnectorCount: number;
};

export function resolveConnectorLimits(
  plan: SubscriptionPlan,
  isPlatformAdmin: boolean
) {
  if (isPlatformAdmin) {
    return {
      maxConnectors: null,
      canUseMonitoring: true,
    };
  }

  const limits = PLAN_LIMITS[plan];

  return {
    maxConnectors: limits.maxConnectors,
    canUseMonitoring: plan === "pro" || plan === "family",
  };
}

export function canPairAnotherConnector(input: {
  plan: SubscriptionPlan;
  isPlatformAdmin: boolean;
  activeConnectorCount: number;
}): boolean {
  const { maxConnectors } = resolveConnectorLimits(
    input.plan,
    input.isPlatformAdmin
  );

  if (maxConnectors === null) {
    return true;
  }

  return input.activeConnectorCount < maxConnectors;
}

export function connectorLimitLabel(
  plan: SubscriptionPlan
): string {
  const limit = PLAN_LIMITS[plan].maxConnectors;

  if (limit === null) {
    return "Unlimited household connectors";
  }

  if (limit === 1) {
    return "1 paired connector on Free";
  }

  return `Up to ${limit} paired connectors on Pro`;
}

export function buildConnectorAccessContext(input: {
  plan: SubscriptionPlan;
  isPlatformAdmin: boolean;
  canUseMonitoring: boolean;
  activeConnectorCount: number;
}): ConnectorAccessContext {
  const limits = resolveConnectorLimits(
    input.plan,
    input.isPlatformAdmin
  );

  return {
    plan: input.plan,
    isPlatformAdmin: input.isPlatformAdmin,
    canUseMonitoring:
      input.canUseMonitoring || limits.canUseMonitoring,
    maxConnectors: limits.maxConnectors,
    activeConnectorCount: input.activeConnectorCount,
  };
}
