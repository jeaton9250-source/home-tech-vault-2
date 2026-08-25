"use client";

import type { ReactNode } from "react";

import LandingHeader from "@/components/landing/public/LandingHeader";
import LandingFooter from "@/components/landing/public/LandingFooter";
import { landingTheme } from "@/components/landing/public/landingTheme";

type PublicMarketingShellProps = {
  children: ReactNode;
  isSignedIn?: boolean;
  showFooter?: boolean;
};

export default function PublicMarketingShell({
  children,
  isSignedIn = false,
  showFooter = true,
}: PublicMarketingShellProps) {
  return (
    <div className={landingTheme.page}>
      <LandingHeader isSignedIn={isSignedIn} />

      <main
        id="main-content"
        className="min-h-[calc(100vh-72px)] bg-[#f5f1e8] text-[#17212a]"
      >
        {children}
      </main>

      {showFooter ? <LandingFooter /> : null}
    </div>
  );
}
