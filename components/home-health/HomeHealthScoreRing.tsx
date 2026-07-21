"use client";

import { cn } from "@/lib/design-system/cn";
import type { HomeHealthStatusLabel } from "@/lib/home-health/types";
import { useAnimatedNumber } from "@/components/home-health/useAnimatedNumber";

type HomeHealthScoreRingProps = {
  score: number;
  status: HomeHealthStatusLabel;
  statusMessage: string;
  className?: string;
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

function getScoreColor(score: number) {
  if (score >= 80) {
    return "var(--color-home-health)";
  }

  if (score >= 60) {
    return "var(--color-warning)";
  }

  return "var(--color-text-muted)";
}

export default function HomeHealthScoreRing({
  score,
  status,
  statusMessage,
  className,
}: HomeHealthScoreRingProps) {
  const animatedScore =
    useAnimatedNumber(score);
  const normalized = Math.max(
    0,
    Math.min(100, score)
  );
  const sweep = (normalized / 100) * 270;
  const startAngle = 135;
  const endAngle = startAngle + sweep;
  const stroke = getScoreColor(normalized);

  return (
    <div
      className={cn(
        "flex flex-col items-center",
        className
      )}
      role="img"
      aria-label={`Home Health score ${score} out of 100. ${status}.`}
    >
      <div className="relative h-[220px] w-[220px]">
        <svg
          viewBox="0 0 220 220"
          className="h-full w-full"
          aria-hidden
        >
          <path
            d={describeArc(
              110,
              110,
              88,
              startAngle,
              startAngle + 270
            )}
            fill="none"
            stroke="var(--color-home-health-muted)"
            strokeWidth="10"
            strokeLinecap="round"
            opacity={0.35}
          />

          {normalized > 0 ? (
            <path
              d={describeArc(
                110,
                110,
                88,
                startAngle,
                endAngle
              )}
              fill="none"
              stroke={stroke}
              strokeWidth="10"
              strokeLinecap="round"
              className="transition-all duration-700 ease-[var(--ease-premium)]"
            />
          ) : null}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-home-health">
            Home Health
          </span>
          <span className="mt-1 text-5xl font-medium tabular-nums tracking-[-0.04em] text-text-primary">
            {animatedScore}
          </span>
          <span className="mt-1 text-sm font-medium text-text-secondary">
            {status}
          </span>
        </div>
      </div>

      <p className="mt-4 max-w-xs text-center text-sm leading-7 text-text-muted">
        {statusMessage}
      </p>
    </div>
  );
}
