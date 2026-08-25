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
  const pathname = normalizePathname(
    usePathname()
  );

  const publicAuthRoute =
    isPublicAuthPath(pathname);

  const publicMarketingRoute =
    isPublicMarketingPath(pathname);

  // Public auth pages must never inherit
  // AppChrome, AuthGuard, or stale demo state.
  if (publicAuthRoute) {
    return (
      <>
        <ClearDemoOnAuthRoute />
        {children}
      </>
    );
  }

  // Marketing pages are completely public
  // and must never pass through AppChrome/AuthGuard.
  if (publicMarketingRoute) {
    return <>{children}</>;
  }

  // Everything else is part of the authenticated app.
  return <AppChrome>{children}</AppChrome>;
}
