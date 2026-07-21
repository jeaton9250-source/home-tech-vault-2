"use client";

import { cn } from "@/lib/design-system/cn";
import {
  type ReactNode,
  useEffect,
  useState,
} from "react";

type CircularProgressRingProps = {
  value: number;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  progressColor?: string;
  ariaLabel: string;
  className?: string;
  children?: ReactNode;
  animate?: boolean;
};

export default function CircularProgressRing({
  value,
  size = 180,
  strokeWidth = 10,
  trackColor = "var(--color-home-health-muted)",
  progressColor = "var(--color-home-health)",
  ariaLabel,
  className,
  children,
  animate = true,
}: CircularProgressRingProps) {
  const normalized = Math.max(
    0,
    Math.min(100, value)
  );
  const radius =
    (size - strokeWidth) / 2;
  const circumference =
    2 * Math.PI * radius;
  const [offset, setOffset] = useState(
    animate ? circumference : circumference - (normalized / 100) * circumference
  );
  const [reduceMotion, setReduceMotion] =
    useState(false);

  useEffect(() => {
    const media = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const update = () => {
      setReduceMotion(media.matches);
    };

    update();
    media.addEventListener(
      "change",
      update
    );

    return () => {
      media.removeEventListener(
        "change",
        update
      );
    };
  }, []);

  useEffect(() => {
    const targetOffset =
      circumference -
      (normalized / 100) *
        circumference;

    if (!animate || reduceMotion) {
      setOffset(targetOffset);
      return;
    }

    setOffset(circumference);

    const frame = requestAnimationFrame(
      () => {
        setOffset(targetOffset);
      }
    );

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [
    animate,
    circumference,
    normalized,
    reduceMotion,
  ]);

  return (
    <div
      className={cn(
        "relative shrink-0",
        className
      )}
      style={{
        width: size,
        height: size,
      }}
      role="img"
      aria-label={ariaLabel}
    >
      <svg
        width={size}
        height={size}
        className="block"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
          opacity={0.35}
        />

        {normalized > 0 ? (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={progressColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            className={cn(
              !reduceMotion &&
                animate &&
                "transition-[stroke-dashoffset] duration-700 ease-[var(--ease-premium)]"
            )}
          />
        ) : null}
      </svg>

      {children ? (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      ) : null}
    </div>
  );
}
