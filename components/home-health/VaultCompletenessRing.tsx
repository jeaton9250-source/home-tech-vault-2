"use client";

import { useAnimatedNumber } from "@/components/home-health/useAnimatedNumber";
import PageCard from "@/components/ui/PageCard";

type VaultCompletenessRingProps = {
  percentage: number;
};

function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  const startRadians =
    ((startAngle - 90) * Math.PI) / 180;
  const endRadians =
    ((endAngle - 90) * Math.PI) / 180;

  const start = {
    x: cx + radius * Math.cos(startRadians),
    y: cy + radius * Math.sin(startRadians),
  };
  const end = {
    x: cx + radius * Math.cos(endRadians),
    y: cy + radius * Math.sin(endRadians),
  };

  const largeArcFlag =
    endAngle - startAngle <= 180 ? 0 : 1;

  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(" ");
}

export default function VaultCompletenessRing({
  percentage,
}: VaultCompletenessRingProps) {
  const animatedValue = useAnimatedNumber(
    percentage,
    600
  );
  const normalized = Math.max(
    0,
    Math.min(100, percentage)
  );
  const sweep = (normalized / 100) * 360;
  const startAngle = -90;
  const endAngle = startAngle + sweep;

  return (
    <PageCard className="bg-surface-card">
      <p className="text-overline text-text-muted">
        Vault completeness
      </p>

      <div className="mt-5 flex items-center gap-5">
        <div className="relative h-[88px] w-[88px] shrink-0">
          <svg
            viewBox="0 0 88 88"
            className="h-full w-full"
            aria-hidden
          >
            <circle
              cx="44"
              cy="44"
              r="34"
              fill="none"
              stroke="var(--color-home-health-muted)"
              strokeWidth="6"
              opacity={0.35}
            />

            {normalized > 0 ? (
              <path
                d={describeArc(
                  44,
                  44,
                  34,
                  startAngle,
                  endAngle
                )}
                fill="none"
                stroke="var(--color-home-health)"
                strokeWidth="6"
                strokeLinecap="round"
                className="transition-all duration-700 ease-[var(--ease-premium)]"
              />
            ) : null}
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-medium tabular-nums text-text-primary">
              {animatedValue}%
            </span>
          </div>
        </div>

        <div>
          <p className="text-base font-medium text-text-primary">
            Vault complete
          </p>
          <p className="mt-1 text-sm leading-6 text-text-muted">
            Based on devices, documents,
            network, maintenance, and
            subscriptions.
          </p>
        </div>
      </div>
    </PageCard>
  );
}
