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

export default function AppHeader() {
  const pathname = usePathname();

  const {
    canViewFeature,
    inheritsFamilyPlan,
    hasFamilyFeatureAccess,
  } = usePermissions();

  return (
    <>
      <MobileNavSheet />

      <header className="sticky top-0 z-50 hidden border-b border-border-subtle bg-surface-card/90 backdrop-blur-md lg:block">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-5 xl:gap-6 xl:px-8">
          <Link href="/dashboard" className="shrink-0">
            <Logo />
          </Link>

          <nav
            aria-label="Primary"
            className="flex shrink-0 items-center gap-0"
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
            <SearchField prominent />
          </div>

          <div className="flex shrink-0 items-center gap-1.5 xl:gap-2">
            <NotificationBell />

            <div className="hidden 2xl:block">
              <ProfileMenu />
            </div>
            <div className="2xl:hidden">
              <ProfileMenu compact />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
