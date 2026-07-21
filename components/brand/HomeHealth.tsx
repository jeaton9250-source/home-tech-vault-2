"use client";

import { cn } from "@/lib/design-system/cn";

type HomeHealthProps = {
  score: number;
  label: string;
  protection: number;
  organization: number;
  documentation: number;
  maintenance: number;
  className?: string;
  size?: "md" | "lg";
};

type Pillar = {
  key: string;
  label: string;
  value: number;
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians =
    ((angleInDegrees - 90) * Math.PI) /
    180;

  return {
    x:
      cx +
      radius *
        Math.cos(angleInRadians),
    y:
      cy +
      radius *
        Math.sin(angleInRadians),
  };
}

function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(
    cx,
    cy,
    radius,
    endAngle
  );

  const end = polarToCartesian(
    cx,
    cy,
    radius,
    startAngle
  );

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

export default function HomeHealth({
  score,
  label,
  protection,
  organization,
  documentation,
  maintenance,
  className,
  size = "lg",
}: HomeHealthProps) {
  const normalized = clamp(score);

  const dimensions =
    size === "lg"
      ? { box: 228, cx: 114, cy: 114, r: 82 }
      : { box: 188, cx: 94, cy: 94, r: 68 };

  const pillars: Pillar[] = [
    {
      key: "protection",
      label: "Protection",
      value: clamp(protection),
    },
    {
      key: "organization",
      label: "Organization",
      value: clamp(organization),
    },
    {
      key: "documentation",
      label: "Documentation",
      value: clamp(documentation),
    },
    {
      key: "maintenance",
      label: "Maintenance",
      value: clamp(maintenance),
    },
  ];

  const sweep =
    (normalized / 100) * 300;
  const startAngle = 120;
  const endAngle = startAngle + sweep;

  return (
    <div
      className={cn(
        "inline-flex flex-col items-center",
        className
      )}
      role="img"
      aria-label={`Home Health ${normalized} out of 100. ${label}.`}
    >
      <div
        className="relative rounded-full bg-gradient-to-b from-home-health-soft/50 to-surface-card p-3 shadow-[var(--shadow-sm)]"
        style={{
          width: dimensions.box + 24,
          height: dimensions.box + 24,
        }}
      >
        <svg
          viewBox={`0 0 ${dimensions.box} ${dimensions.box}`}
          className="h-full w-full"
          aria-hidden
        >
          {/* Outer architectural ring */}
          <circle
            cx={dimensions.cx}
            cy={dimensions.cy}
            r={dimensions.r + 14}
            fill="none"
            stroke="var(--color-border-subtle)"
            strokeWidth="1"
          />

          {Array.from({ length: 60 }).map(
            (_, index) => {
              const angle =
                (index / 60) * 360;

              const outer =
                polarToCartesian(
                  dimensions.cx,
                  dimensions.cy,
                  dimensions.r + 13,
                  angle
                );

              const inner =
                polarToCartesian(
                  dimensions.cx,
                  dimensions.cy,
                  dimensions.r +
                    (index % 5 === 0
                      ? 6
                      : 9),
                  angle
                );

              return (
                <line
                  key={angle}
                  x1={outer.x}
                  y1={outer.y}
                  x2={inner.x}
                  y2={inner.y}
                  stroke="var(--color-border-strong)"
                  strokeWidth={
                    index % 5 === 0
                      ? 1
                      : 0.5
                  }
                  opacity={0.45}
                />
              );
            }
          )}

          {/* Track */}
          <path
            d={describeArc(
              dimensions.cx,
              dimensions.cy,
              dimensions.r,
              startAngle,
              startAngle + 300
            )}
            fill="none"
            stroke="var(--color-home-health-muted)"
            strokeWidth="11"
            strokeLinecap="round"
            opacity={0.35}
          />

          {/* Score arc */}
          {normalized > 0 && (
            <path
              d={describeArc(
                dimensions.cx,
                dimensions.cy,
                dimensions.r,
                startAngle,
                endAngle
              )}
              fill="none"
              stroke="var(--color-home-health)"
              strokeWidth="11"
              strokeLinecap="round"
              className="transition-all duration-700 ease-[var(--ease-premium)]"
            />
          )}
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="flex flex-col items-center justify-center rounded-full border border-border-subtle bg-surface-card text-center shadow-[var(--shadow-inset)]"
            style={{
              width:
                size === "lg" ? 118 : 96,
              height:
                size === "lg" ? 118 : 96,
            }}
          >
            <span className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-home-health">
              Home Health
            </span>

            <span
              className="mt-1 font-medium tabular-nums tracking-[-0.03em] text-text-primary"
              style={{
                fontSize:
                  size === "lg"
                    ? "2.25rem"
                    : "1.875rem",
                lineHeight: 1,
              }}
            >
              {normalized}
            </span>

            <span className="mt-1 text-[0.6875rem] font-medium text-text-secondary">
              {label}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 w-full max-w-[260px] space-y-2.5">
        {pillars.map((pillar) => (
          <div key={pillar.key}>
            <div className="mb-1 flex items-center justify-between gap-3">
              <span className="text-[0.6875rem] font-medium text-text-secondary">
                {pillar.label}
              </span>
              <span className="text-[0.6875rem] font-medium tabular-nums text-text-primary">
                {pillar.value}
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-surface-sunken shadow-[var(--shadow-inset)]">
              <div
                className="h-full rounded-full bg-home-health transition-all duration-700 ease-[var(--ease-premium)]"
                style={{
                  width: `${pillar.value}%`,
                  opacity:
                    0.45 +
                    (pillar.value / 100) *
                      0.55,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
