"use client";

import { usePathname } from "next/navigation";
import MarketingFooter from "@/components/marketing/MarketingFooter";

const APP_ROUTES = [
  "/dashboard",
  "/devices",
  "/documents",
  "/warranties",
  "/maintenance",
  "/network",
  "/subscriptions",
  "/reports",
  "/settings",
  "/household",
];

function isAppRoute(pathname: string) {
  return APP_ROUTES.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );
}

export default function MarketingFooterGate() {
  const pathname = usePathname();

  if (isAppRoute(pathname)) {
    return null;
  }

  return <MarketingFooter />;
}