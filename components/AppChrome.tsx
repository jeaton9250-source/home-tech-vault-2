"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import AppHeader from "@/components/navigation/AppHeader";
import AIAdvisorPopup from "@/components/ai/AIAdvisorPopup";
import AuthGuard from "@/components/AuthGuard";
import DemoBanner from "@/components/DemoBanner";
import AccessTestingPanel from "@/components/dev/AccessTestingPanel";
import { DevelopmentAccessProvider } from "@/hooks/useDevelopmentAccess";
import { AIAdvisorProvider } from "@/hooks/useAIAdvisor";
import { NavMenuProvider } from "@/hooks/useNavMenu";
import { PermissionsProvider } from "@/hooks/usePermissions";
import { isChromeFreeRoute } from "@/lib/isChromeFreeRoute";

type AppChromeProps = {
  children: ReactNode;
};

export default function AppChrome({
  children,
}: AppChromeProps) {
  const pathname = usePathname();

  if (isChromeFreeRoute(pathname)) {
    return (
      <DevelopmentAccessProvider>
        <PermissionsProvider>
          <div className="min-h-screen bg-surface-base">
            {children}
          </div>
          <AccessTestingPanel />
        </PermissionsProvider>
      </DevelopmentAccessProvider>
    );
  }

  return (
    <AuthGuard>
      <DevelopmentAccessProvider>
        <PermissionsProvider>
          <NavMenuProvider>
            <AIAdvisorProvider>
              <>
                <DemoBanner />

                <div className="flex min-h-screen flex-col bg-surface-base">
                  <AppHeader />

                  <main className="flex-1">
                    {children}
                  </main>
                </div>

                <AIAdvisorPopup />

                <AccessTestingPanel />
              </>
            </AIAdvisorProvider>
          </NavMenuProvider>
        </PermissionsProvider>
      </DevelopmentAccessProvider>
    </AuthGuard>
  );
}
