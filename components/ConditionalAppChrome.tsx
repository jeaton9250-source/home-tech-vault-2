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

  const newHomeownerRoute =
    pathname === "/new-homeowners" ||
    pathname.startsWith("/new-homeowners/");

  // Public auth pages must never inherit
  // AppChrome, AuthGuard, or a stale demo session.
  if (publicAuthRoute) {
    return (
      <>
        <ClearDemoOnAuthRoute />
        {children}
      </>
    );
  }

  // The new-homeowner landing page is public
  // and must not pass through AppChrome/AuthGuard.
  if (newHomeownerRoute) {
    return <>{children}</>;
  }

  // Keep the existing application behavior everywhere else.
  // Some existing pages rely on providers inside AppChrome.
  return <AppChrome>{children}</AppChrome>;
}
