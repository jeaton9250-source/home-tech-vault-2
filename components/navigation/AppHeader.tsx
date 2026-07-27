"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import Logo from "@/components/brand/Logo";

import NotificationBell from "@/components/NotificationBell";
import { NavLink } from "@/components/navigation/PrimaryNavLink";
import ProfileMenu from "@/components/navigation/ProfileMenu";
import SearchField from "@/components/navigation/SearchField";
import MobileNavSheet from "@/components/navigation/MobileNavSheet";

import { usePermissions } from "@/hooks/usePermissions";

import { isPrimaryNavActive } from "@/lib/navigation/activeGroup";
import { PRIMARY_NAV_ITEMS } from "@/lib/navigation/config";
import { shouldShowPremiumBadge } from "@/lib/navigation/navVisibility";
import { normalizePathname } from "@/lib/isChromeFreeRoute";

export default function AppHeader() {
  const pathname = usePathname();
  const normalizedPath = normalizePathname(pathname);
  const hideGlobalSearchOnHome =
    normalizedPath === "/home" ||
    normalizedPath === "/dashboard";

  const {
    canViewFeature,
    inheritsFamilyPlan,
    hasFamilyFeatureAccess,
  } = usePermissions();

  return (
    <>
      <MobileNavSheet />

      <header className="sticky top-0 z-50 hidden border-b border-border-subtle/70 bg-surface-card/80 shadow-[0_1px_0_rgba(15,23,42,0.04),0_10px_30px_-24px_rgba(15,23,42,0.35)] backdrop-blur-xl lg:block">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-3 px-4 xl:gap-4 xl:px-6">
          <Link href="/dashboard" className="shrink-0">
            <Logo className="max-w-[10.5rem] [&>p]:text-[0.75rem] [&>p]:tracking-[0.14em]" />
          </Link>

          <nav
            aria-label="Primary"
            className="flex shrink-0 items-center gap-0.5"
          >
            {PRIMARY_NAV_ITEMS.map((item) => {
              const badge = shouldShowPremiumBadge(
                item.feature,
                canViewFeature,
                inheritsFamilyPlan,
                hasFamilyFeatureAccess
              );

              return (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  isActive={isPrimaryNavActive(
                    pathname,
                    item.href
                  )}
                  badge={badge}
                />
              );
            })}
          </nav>

          <div className="min-w-0 flex-1">
            {hideGlobalSearchOnHome ? (
              <div aria-hidden="true" className="h-12 w-full" />
            ) : (
              <SearchField prominent />
            )}
          </div>

          <div className="flex shrink-0 items-center rounded-full border border-border-subtle/70 bg-surface-card/80 p-1 shadow-sm">
            <NotificationBell compact />
            <ProfileMenu compact />
          </div>
        </div>
      </header>
    </>
  );
}
