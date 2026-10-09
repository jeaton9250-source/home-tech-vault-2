"use client";
import { MarketingText } from "@/components/marketing/MarketingContent";

import type { ReactNode } from "react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import HomeMarketingFooter from "@/components/marketing/HomeMarketingFooter";
type PublicMarketingShellProps = {
  children: ReactNode;
  isSignedIn?: boolean;
  showFooter?: boolean;
};
export default function PublicMarketingShell({
  children,
  showFooter = true,
}: PublicMarketingShellProps) {
  return (
    <div className="min-h-screen bg-[#f5f2eb] text-[#12233a]">
      <MarketingHeader />

      <main
        id="main-content"
        className="min-h-[calc(100vh-72px)] bg-[#f5f2eb] text-[#12233a]"
      >
        <MarketingText scope="shared">{children}</MarketingText>
      </main>

      {showFooter ? <HomeMarketingFooter /> : null}
    </div>
  );
}
