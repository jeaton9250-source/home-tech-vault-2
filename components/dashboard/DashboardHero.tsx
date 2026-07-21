"use client";

import HomeHealth from "@/components/brand/HomeHealth";
import Button from "@/components/ui/Button";

import { brand, sections } from "@/lib/design-system/tokens";

import type { VaultScoreResult } from "@/lib/calculateVaultScore";

type DashboardHeroProps = {
  firstName: string;
  householdName: string;
  deviceCount: number;
  documentCount: number;
  protectedValue: number;
  vaultScore: VaultScoreResult;
  isDemo: boolean;
};

export default function DashboardHero({
  firstName,
  householdName,
  deviceCount,
  documentCount,
  protectedValue,
  vaultScore,
  isDemo,
}: DashboardHeroProps) {
  const healthMessage =
    vaultScore.total >= 90
      ? "Everything looks great today."
      : vaultScore.total >= 75
        ? "Your household records are in good shape with room to refine."
        : vaultScore.recommendations[0] ||
          "A few calm improvements could strengthen your vault.";

  const summaryParts = [
    `${deviceCount} device${deviceCount === 1 ? "" : "s"}`,
    `${documentCount} document${documentCount === 1 ? "" : "s"}`,
    `${formatCurrency(protectedValue)} protected`,
  ];

  return (
    <section className="htv-command-hero overflow-hidden p-8 md:p-10 lg:p-12">
      <div className="flex flex-col gap-10 xl:flex-row xl:items-center xl:justify-between">
        <div className="max-w-2xl">
          <p
            className="text-overline"
            style={{ color: sections.homeHealth.accent }}
          >
            {brand.commandCenter}
          </p>

          <h1 className="text-hero mt-3 text-text-primary">
            Welcome home, {firstName}.
          </h1>

          <p className="mt-3 text-lg font-medium text-text-secondary">
            {householdName}
          </p>

          <p className="mt-4 text-sm leading-7 text-text-muted">
            {summaryParts.join(" · ")}
          </p>

          <p className="mt-4 max-w-xl text-base leading-7 text-text-secondary">
            {healthMessage}
          </p>

          {isDemo && (
            <div className="mt-6 rounded-[var(--radius-button)] border border-border-subtle bg-surface-card/90 px-4 py-3 shadow-[var(--shadow-sm)]">
              <p className="text-sm text-text-secondary">
                You are exploring a sample household.
                Create an account to organize your own home.
              </p>
              <Button href="/signup" size="sm" className="mt-3">
                Create Your Vault
              </Button>
            </div>
          )}
        </div>

        <HomeHealth
          score={vaultScore.total}
          label={vaultScore.label}
          protection={vaultScore.protection}
          organization={vaultScore.organization}
          documentation={vaultScore.documentation}
          maintenance={vaultScore.maintenance}
        />
      </div>
    </section>
  );
}

function formatCurrency(value: number) {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}
