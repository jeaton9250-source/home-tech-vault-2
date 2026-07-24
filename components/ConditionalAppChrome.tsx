"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import AppChrome from "@/components/AppChrome";
import {
  normalizePathname,
} from "@/lib/isChromeFreeRoute";
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
  const publicRoute =
    isPublicAuthPath(pathname);

  if (publicRoute) {
    return <>{children}</>;
  }

  return <AppChrome>{children}</AppChrome>;
}
