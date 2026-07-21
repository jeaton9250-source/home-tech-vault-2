"use client";

import { useEffect, useState } from "react";

export function useAnimatedNumber(
  value: number,
  durationMs = 700
) {
  const [displayValue, setDisplayValue] =
    useState(value);
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
    if (reduceMotion) {
      setDisplayValue(value);
      return;
    }

    if (value <= 0) {
      setDisplayValue(0);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(
        (now - start) / durationMs,
        1
      );
      const eased =
        1 - Math.pow(1 - progress, 3);

      setDisplayValue(
        Math.round(value * eased)
      );

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [value, durationMs, reduceMotion]);

  return displayValue;
}
