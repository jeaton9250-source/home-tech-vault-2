"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Sparkles } from "lucide-react";

import Logo from "@/components/brand/Logo";

import NotificationBell from "@/components/NotificationBell";
import { NavLink } from "@/components/navigation/PrimaryNavLink";
import ProfileMenu from "@/components/navigation/ProfileMenu";
import QuickAddMenu from "@/components/navigation/QuickAddMenu";
import SearchField from "@/components/navigation/SearchField";
import MobileNavSheet from "@/components/navigation/MobileNavSheet";

import { useAIAdvisor } from "@/hooks/useAIAdvisor";
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

  const { open: openAdvisor } = useAIAdvisor();

  return (
    <>
      <MobileNavSheet />

      <header className="sticky top-0 z-50 hidden border-b border-border-subtle bg-surface-card/90 backdrop-blur-md lg:block">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-6 px-6 xl:px-8">
          <Link href="/dashboard" className="shrink-0">
            <Logo />
          </Link>

          <nav
            aria-label="Primary"
            className="flex flex-1 items-center justify-center gap-0.5"
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

          <div className="flex shrink-0 items-center gap-2">
            <div className="w-56 xl:w-64">
              <SearchField />
            </div>

            <QuickAddMenu />

            <NotificationBell />

            {canViewFeature("aiAdvisor") ? (
              <button
                type="button"
                onClick={openAdvisor}
                className="htv-focus-ring inline-flex h-10 items-center gap-2 rounded-[var(--radius-button)] border border-border-subtle bg-surface-card px-3 text-sm font-medium text-text-secondary transition hover:bg-surface-sunken hover:text-text-primary"
              >
                <Sparkles size={16} />
                <span className="hidden xl:inline">AI Advisor</span>
              </button>
            ) : null}

            <ProfileMenu />
          </div>
        </div>
      </header>
    </>
  );
}
