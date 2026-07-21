"use client";

import CircularProgressRing from "@/components/ui/CircularProgressRing";
import { useAnimatedNumber } from "@/components/home-health/useAnimatedNumber";
import {
  getHomeHealthDisplayMessage,
  getHomeHealthRingColor,
} from "@/lib/home-health/display";
import { cn } from "@/lib/design-system/cn";
import type { HomeHealthStatusLabel } from "@/lib/home-health/types";

type HomeHealthScoreRingProps = {
  score: number;
  status: HomeHealthStatusLabel;
  className?: string;
  size?: number;
};

export default function HomeHealthScoreRing({
  score,
  status,
  className,
  size = 168,
}: HomeHealthScoreRingProps) {
  const animatedScore =
    useAnimatedNumber(score);
  const displayMessage =
    getHomeHealthDisplayMessage(status);
  const progressColor =
    getHomeHealthRingColor(status);

  return (
    <div
      className={cn(
        "flex flex-col items-center",
        className
      )}
    >
      <CircularProgressRing
        value={score}
        size={size}
        strokeWidth={11}
        progressColor={progressColor}
        ariaLabel={`Home Health score: ${score} percent, ${status}`}
      >
        <div className="flex flex-col items-center justify-center px-2 text-center">
          <span className="text-[clamp(2rem,5vw,2.75rem)] font-medium tabular-nums tracking-[-0.04em] text-text-primary">
            {animatedScore}
            <span className="text-[0.55em] font-medium text-text-secondary">
              %
            </span>
          </span>
          <span className="mt-0.5 text-xs font-medium text-text-secondary">
            {status}
          </span>
        </div>
      </CircularProgressRing>

      <p className="sr-only">{displayMessage}</p>
    </div>
  );
}
