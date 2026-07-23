"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { cn } from "@/lib/design-system/cn";

type LandingScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
};

export default function LandingScrollReveal({
  children,
  className,
  delayMs = 0,
}: LandingScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -4% 0px",
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "htv-scroll-reveal motion-reduce:opacity-100 motion-reduce:transform-none",
        visible && "htv-scroll-reveal-visible",
        className
      )}
      style={
        delayMs > 0
          ? { transitionDelay: `${delayMs}ms` }
          : undefined
      }
    >
      {children}
    </div>
  );
}
