"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Logo from "@/components/brand/Logo";

import NotificationBell from "@/components/NotificationBell";
import { NavLink } from "@/components/navigation/PrimaryNavLink";
import ProfileMenu from "@/components/navigation/ProfileMenu";
import MobileNavSheet from "@/components/navigation/MobileNavSheet";

import { usePermissions } from "@/hooks/usePermissions";

import { isPrimaryNavActive } from "@/lib/navigation/activeGroup";
import { PRIMARY_NAV_ITEMS } from "@/lib/navigation/config";
import { shouldShowPremiumBadge } from "@/lib/navigation/navVisibility";

type ImportResponse = {
  imports?: Array<{
    id: string;
  }>;
};

export default function AppHeader() {
  const pathname = usePathname();

  const [
    pendingImportCount,
    setPendingImportCount,
  ] = useState(0);

  const {
    canViewFeature,
    inheritsFamilyPlan,
    hasFamilyFeatureAccess,
  } = usePermissions();

  const loadPendingImports =
    useCallback(async () => {
      try {
        const response =
          await fetch(
            "/api/imports",
            {
              method: "GET",
              cache: "no-store",
            }
          );

        if (!response.ok) {
          return;
        }

        const data:
          ImportResponse =
          await response.json();

        setPendingImportCount(
          data.imports?.length ??
            0
        );
      } catch {
        /*
          Never let a failed badge
          request break navigation.
        */
      }
    }, []);

  useEffect(() => {
    void loadPendingImports();

    const interval =
      window.setInterval(
        () => {
          void loadPendingImports();
        },
        30000
      );

    function handleFocus() {
      void loadPendingImports();
    }

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      window.clearInterval(
        interval
      );

      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [loadPendingImports]);

  /*
    Refresh after navigating back
    from Smart Import.

    This helps the badge update after
    approving or rejecting imports.
  */
  useEffect(() => {
    void loadPendingImports();
  }, [
    pathname,
    loadPendingImports,
  ]);

  return (
    <>
      <MobileNavSheet />

      <header className="sticky top-0 z-50 hidden border-b border-border-subtle/70 bg-surface-card/85 shadow-[0_1px_0_rgba(15,23,42,0.04),0_10px_30px_-24px_rgba(15,23,42,0.35)] backdrop-blur-xl md:block">
        <div className="mx-auto grid h-[68px] max-w-[var(--content-max)] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="justify-self-start"
          >
            <Logo
              withMark
              collapsed={false}
            />
          </Link>

          <nav
            aria-label="Primary"
            className="justify-self-center"
          >
            <div className="flex items-center rounded-full border border-border-subtle/70 bg-surface-card/90 p-1 shadow-sm">
              {PRIMARY_NAV_ITEMS.map(
                (item) => {
                  const premiumBadge =
                    shouldShowPremiumBadge(
                      item.feature,
                      canViewFeature,
                      inheritsFamilyPlan,
                      hasFamilyFeatureAccess
                    );

                  /*
                    Smart Import gets its
                    pending review count.

                    All other links retain
                    their existing premium
                    badge behavior.
                  */
                  const badge =
                    item.href ===
                      "/imports" &&
                    pendingImportCount >
                      0
                      ? pendingImportCount >
                        99
                        ? "99+"
                        : String(
                            pendingImportCount
                          )
                      : premiumBadge;

                  return (
                    <NavLink
                      key={item.href}
                      href={item.href}
                      label={
                        item.label
                      }
                      isActive={isPrimaryNavActive(
                        pathname,
                        item.href
                      )}
                      badge={badge}
                      compact
                    />
                  );
                }
              )}
            </div>
          </nav>

          <div className="flex min-w-0 items-center justify-self-end">
            <div className="flex items-center rounded-full border border-border-subtle/70 bg-surface-card/90 p-1 shadow-sm">
              <NotificationBell
                compact
              />

              <ProfileMenu compact />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}