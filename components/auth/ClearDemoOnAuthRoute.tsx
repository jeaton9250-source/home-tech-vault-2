"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { useDemoMode } from "@/hooks/useDemoMode";
import {
  clearDemoModeForAuthRoute,
  isAuthRouteThatClearsDemo,
} from "@/lib/demo/demoModeStorage";

/**
 * Ensures explicit visits to /login and other auth routes
 * are never overridden by a stale demo localStorage flag.
 */
export default function ClearDemoOnAuthRoute() {
  const pathname = usePathname();
  const { isDemo, exitDemo } = useDemoMode();

  useEffect(() => {
    if (!isAuthRouteThatClearsDemo(pathname)) {
      return;
    }

    const cleared = clearDemoModeForAuthRoute(pathname);

    if (cleared || isDemo) {
      exitDemo();
    }
  }, [pathname, isDemo, exitDemo]);

  return null;
}
