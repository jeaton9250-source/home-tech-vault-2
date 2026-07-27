"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import AppHeader from "@/components/navigation/AppHeader";
import FloatingActionButton from "@/components/navigation/FloatingActionButton";
import AIAdvisorPopup from "@/components/ai/AIAdvisorPopup";
import AuthGuard from "@/components/AuthGuard";
import { DemoExperienceProvider } from "@/components/demo/DemoExperienceProvider";
import DemoBanner from "@/components/DemoBanner";
import AccessTestingPanel from "@/components/dev/AccessTestingPanel";
import EntitlementDebugPanel from "@/components/dev/EntitlementDebugPanel";
import { DevelopmentAccessProvider } from "@/hooks/useDevelopmentAccess";
import { AIAdvisorProvider } from "@/hooks/useAIAdvisor";
import { NavMenuProvider } from "@/hooks/useNavMenu";
import { PermissionsProvider } from "@/hooks/usePermissions";
import { isChromeFreeRoute } from "@/lib/isChromeFreeRoute";
import { isAdminRoute } from "@/lib/admin/navigation";

function isOnboardingRoute(
  pathname: string | null | undefined
): boolean {
  return pathname === "/onboarding";
}

type AppChromeProps = {
  children: ReactNode;
};

export default function AppChrome({
  children,
}: AppChromeProps) {
  const pathname = usePathname();
  const hideHomeownerHeader = isAdminRoute(pathname);

  if (isOnboardingRoute(pathname)) {
    return (
      <AuthGuard>
        <DevelopmentAccessProvider>
          <PermissionsProvider>
            <div className="min-h-screen bg-surface-base">
              {children}
            </div>
            <AccessTestingPanel />
            <EntitlementDebugPanel />
          </PermissionsProvider>
        </DevelopmentAccessProvider>
      </AuthGuard>
    );
  }

  if (isChromeFreeRoute(pathname)) {
    return (
      <DevelopmentAccessProvider>
        <PermissionsProvider>
          <div className="min-h-screen bg-surface-base">
            {children}
          </div>
          <AccessTestingPanel />
          <EntitlementDebugPanel />
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
              <DemoExperienceProvider>
                <>
                  <DemoBanner />

                  <div className="flex min-h-screen flex-col bg-surface-base">
                    {!hideHomeownerHeader ? (
                      <AppHeader />
                    ) : null}

                    <main className="flex-1 pb-24">
                      {children}
                    </main>
                  </div>

                  {!hideHomeownerHeader ? (
                    <FloatingActionButton />
                  ) : null}

                  <AIAdvisorPopup />

                  <AccessTestingPanel />
                  <EntitlementDebugPanel />
                </>
              </DemoExperienceProvider>
            </AIAdvisorProvider>
          </NavMenuProvider>
        </PermissionsProvider>
      </DevelopmentAccessProvider>
    </AuthGuard>
  );
}
