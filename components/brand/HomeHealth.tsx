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
  angle: number;
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
    ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
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
      ? { box: 248, cx: 124, cy: 124, r: 88 }
      : { box: 200, cx: 100, cy: 100, r: 72 };

  const pillars: Pillar[] = [
    {
      key: "protection",
      label: "Protection",
      value: clamp(protection),
      angle: 225,
    },
    {
      key: "organization",
      label: "Organization",
      value: clamp(organization),
      angle: 315,
    },
    {
      key: "documentation",
      label: "Documentation",
      value: clamp(documentation),
      angle: 45,
    },
    {
      key: "maintenance",
      label: "Maintenance",
      value: clamp(maintenance),
      angle: 135,
    },
  ];

  const sweep = (normalized / 100) * 270;
  const startAngle = 135;
  const endAngle = startAngle + sweep;

  const frameSize = dimensions.box + 32;

  return (
    <div
      className={cn(
        "inline-flex flex-col items-center",
        className
      )}
      role="img"
      aria-label={`Vault Health ${normalized} out of 100. ${label}.`}
    >
      <div
        className="relative"
        style={{
          width: frameSize,
          height: frameSize,
        }}
      >
        {/* Architectural outer frame */}
        <div
          className="absolute inset-0 rounded-[28px] border border-border-subtle bg-gradient-to-b from-surface-card to-surface-base/80 shadow-[var(--shadow-md),var(--shadow-inset)]"
          aria-hidden
        />

        {/* Corner accents */}
        {[
          "top-3 left-3",
          "top-3 right-3",
          "bottom-3 left-3",
          "bottom-3 right-3",
        ].map((position) => (
          <span
            key={position}
            className={cn(
              "absolute h-3 w-3 border-home-health/30",
              position,
              position.includes("top")
                ? "border-t"
                : "border-b",
              position.includes("left")
                ? "border-l"
                : "border-r"
            )}
            aria-hidden
          />
        ))}

        <div
          className="absolute inset-4 flex items-center justify-center"
          aria-hidden
        >
          <svg
            viewBox={`0 0 ${dimensions.box} ${dimensions.box}`}
            className="h-full w-full"
          >
            <defs>
              <linearGradient
                id="vault-health-arc"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor="#1F5C45"
                />
                <stop
                  offset="100%"
                  stopColor="#2A7A5A"
                />
              </linearGradient>
            </defs>

            {/* Inner guide rings */}
            <circle
              cx={dimensions.cx}
              cy={dimensions.cy}
              r={dimensions.r + 10}
              fill="none"
              stroke="var(--color-border-subtle)"
              strokeWidth="0.75"
              opacity={0.6}
            />

            {/* Precision tick marks */}
            {Array.from({ length: 54 }).map(
              (_, index) => {
                const angle =
                  135 + (index / 53) * 270;
                const isMajor = index % 9 === 0;
                const outer = polarToCartesian(
                  dimensions.cx,
                  dimensions.cy,
                  dimensions.r + (isMajor ? 8 : 5),
                  angle
                );
                const inner = polarToCartesian(
                  dimensions.cx,
                  dimensions.cy,
                  dimensions.r - (isMajor ? 2 : 0),
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
                    strokeWidth={isMajor ? 1 : 0.5}
                    opacity={isMajor ? 0.55 : 0.3}
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
                startAngle + 270
              )}
              fill="none"
              stroke="var(--color-home-health-muted)"
              strokeWidth="10"
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
                stroke="url(#vault-health-arc)"
                strokeWidth="10"
                strokeLinecap="round"
                className="transition-all duration-700 ease-[var(--ease-premium)]"
              />
            )}

            {/* Pillar indicators */}
            {pillars.map((pillar) => {
              const point = polarToCartesian(
                dimensions.cx,
                dimensions.cy,
                dimensions.r + 18,
                pillar.angle
              );

              return (
                <g key={pillar.key}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={4}
                    fill="var(--color-surface-card)"
                    stroke="var(--color-home-health)"
                    strokeWidth="1.5"
                    opacity={
                      0.35 + (pillar.value / 100) * 0.65
                    }
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Center medallion */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="flex flex-col items-center justify-center rounded-[20px] border border-border-subtle bg-surface-card text-center shadow-[var(--shadow-well),var(--shadow-inset)]"
            style={{
              width: size === "lg" ? 128 : 104,
              height: size === "lg" ? 128 : 104,
            }}
          >
            <span className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-home-health">
              Vault Health
            </span>

            <span
              className="mt-1 font-medium tabular-nums tracking-[-0.04em] text-text-primary"
              style={{
                fontSize:
                  size === "lg" ? "2.5rem" : "2rem",
                lineHeight: 1,
              }}
            >
              {normalized}
            </span>

            <span className="mt-1.5 text-[0.6875rem] font-medium text-text-muted">
              {label}
            </span>
          </div>
        </div>
      </div>

      {/* Pillar breakdown */}
      <div className="mt-6 grid w-full max-w-[280px] grid-cols-2 gap-x-4 gap-y-3">
        {pillars.map((pillar) => (
          <div key={pillar.key}>
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-[0.6875rem] font-medium text-text-muted">
                {pillar.label}
              </span>
              <span className="text-[0.6875rem] font-semibold tabular-nums text-text-secondary">
                {pillar.value}
              </span>
            </div>

            <div className="h-1 overflow-hidden rounded-full bg-surface-sunken shadow-[var(--shadow-well)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-home-health/70 to-home-health transition-all duration-700 ease-[var(--ease-premium)]"
                style={{ width: `${pillar.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
