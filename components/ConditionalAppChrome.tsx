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

const MARKETING_ROUTES = [
  "/",
  "/what-it-remembers",
  "/explore",
  "/realtors",
  "/pricing",
  "/our-story",
  "/demo",
];

function isMarketingRoute(pathname: string) {
  return MARKETING_ROUTES.some((route) => {
    if (route === "/") {
      return pathname === "/";
    }

    return (
      pathname === route ||
      pathname.startsWith(`${route}/`)
    );
  });
}

export default function ConditionalAppChrome({
  children,
}: ConditionalAppChromeProps) {
  const pathname = normalizePathname(
    usePathname()
  );

  const publicAuthRoute =
    isPublicAuthPath(pathname);

  const marketingRoute =
    isMarketingRoute(pathname);

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

  // Public marketing pages render their own
  // MarketingHeader and must not inherit AppChrome.
  if (marketingRoute) {
    return <>{children}</>;
  }

  // Logged-in application pages keep the normal
  // Home Tech Vault app chrome.
  return <AppChrome>{children}</AppChrome>;
}
