"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import MobileNav from "@/components/MobileNav";
import AIAdvisorPopup from "@/components/ai/AIAdvisorPopup";
import DemoBanner from "@/components/DemoBanner";

type AppChromeProps = {
  children: ReactNode;
};

/*
  Routes that render without the app chrome (sidebar,
  top bar, mobile nav, demo banner, AI popup). These are
  public / full-screen surfaces such as the marketing
  landing page and the authentication flows.
*/
const chromeFreeRoutes = [
  "/",
  "/login",
  "/signup",
  "/demo",
  "/forgot-password",
  "/reset-password",
  "/family/accept",
];

export default function AppChrome({
  children,
}: AppChromeProps) {
  const pathname = usePathname();

  const isChromeFree = chromeFreeRoutes.some(
    (route) =>
      route === "/"
        ? pathname === "/"
        : pathname === route ||
          pathname.startsWith(`${route}/`)
  );

  if (isChromeFree) {
    return <>{children}</>;
  }

  return (
    <>
      <DemoBanner />

      <div className="flex min-h-screen bg-[#F7F5EF]">
        <Sidebar />

        <div className="min-w-0 flex-1 pb-20 lg:pb-0">
          <TopBar />

          <main>{children}</main>

          <MobileNav />
        </div>

        <AIAdvisorPopup />
      </div>
    </>
  );
}
