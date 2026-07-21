"use client";

import CircularProgressRing from "@/components/ui/CircularProgressRing";
import { useAnimatedNumber } from "@/components/home-health/useAnimatedNumber";
import PageCard from "@/components/ui/PageCard";
import {
  getVaultCategoryStates,
  type VaultCategoryState,
} from "@/lib/home-health/display";
import { cn } from "@/lib/design-system/cn";
import type { HomeHealthCategoryCard } from "@/lib/home-health/types";
import { Check } from "lucide-react";

type VaultCompletenessRingProps = {
  percentage: number;
  cards: HomeHealthCategoryCard[];
};

function VaultCategoryItem({
  category,
}: {
  category: VaultCategoryState;
}) {
  return (
    <li className="flex items-center gap-2 text-sm text-text-secondary">
      <span
        className={cn(
          "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
          category.complete
            ? "border-home-health/25 bg-home-health-soft text-home-health"
            : "border-border-subtle bg-surface-sunken text-text-muted"
        )}
        aria-hidden
      >
        {category.complete ? (
          <Check size={12} strokeWidth={2.5} />
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-border-strong" />
        )}
      </span>
      <span>{category.label}</span>
    </li>
  );
}

export default function VaultCompletenessRing({
  percentage,
  cards,
}: VaultCompletenessRingProps) {
  const animatedValue = useAnimatedNumber(
    percentage,
    600
  );
  const categories = getVaultCategoryStates(
    cards
  );
  const completedCount =
    categories.filter(
      (category) => category.complete
    ).length;

  return (
    <PageCard className="bg-surface-card">
      <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
        <div className="flex items-center gap-5">
          <CircularProgressRing
            value={percentage}
            size={96}
            strokeWidth={7}
            progressColor="var(--color-home-health)"
            ariaLabel={`Vault completeness: ${percentage} percent`}
          >
            <span className="text-lg font-medium tabular-nums text-text-primary">
              {animatedValue}%
            </span>
          </CircularProgressRing>

          <div className="md:hidden">
            <p className="text-overline text-text-muted">
              Vault completeness
            </p>
            <p className="mt-1 text-base font-medium text-text-primary">
              {completedCount} of{" "}
              {categories.length} areas
              started
            </p>
          </div>
        </div>

        <div>
          <p className="hidden text-overline text-text-muted md:block">
            Vault completeness
          </p>

          <div className="mt-0 md:mt-1">
            <p className="text-base font-medium text-text-primary">
              Vault complete
            </p>
            <p className="mt-1 max-w-2xl text-[0.9375rem] leading-6 text-text-muted">
              Vault completeness reflects how
              much of your home technology
              information has been organized.
            </p>
          </div>

          <ul
            className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
            aria-label="Vault completeness categories"
          >
            {categories.map((category) => (
              <VaultCategoryItem
                key={category.key}
                category={category}
              />
            ))}
          </ul>
        </div>
      </div>
    </PageCard>
  );
}
