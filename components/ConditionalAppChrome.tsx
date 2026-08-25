"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import ClearDemoOnAuthRoute from "@/components/auth/ClearDemoOnAuthRoute";
import AppChrome from "@/components/AppChrome";
import { normalizePathname } from "@/lib/isChromeFreeRoute";
import {
  isPublicAuthPath,
  isPublicMarketingPath,
} from "@/lib/marketing/routes";

type ConditionalAppChromeProps = {
  children: ReactNode;
};

export default function ConditionalAppChrome({
  children,
}: ConditionalAppChromeProps) {
  const pathname = normalizePathname(usePathname());

  const publicAuthRoute = isPublicAuthPath(pathname);
  const publicMarketingRoute = isPublicMarketingPath(pathname);

  // Public auth pages must never inherit app chrome,
  // AuthGuard, or a stale demo session.
  if (publicAuthRoute) {
    return (
      <>
        <ClearDemoOnAuthRoute />
        {children}
      </>
    );
  }

  // Public marketing pages must also stay outside AppChrome/AuthGuard.
  if (publicMarketingRoute) {
    return <>{children}</>;
  }

  return <AppChrome>{children}</AppChrome>;
}
