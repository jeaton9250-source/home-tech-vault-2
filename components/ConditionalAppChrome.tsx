"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import ClearDemoOnAuthRoute from "@/components/auth/ClearDemoOnAuthRoute";
import AppChrome from "@/components/AppChrome";
import { normalizePathname } from "@/lib/isChromeFreeRoute";
import { isPublicAuthPath } from "@/lib/marketing/routes";

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

  return <AppChrome>{children}</AppChrome>;
}
