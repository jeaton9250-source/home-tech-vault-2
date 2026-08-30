"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";


import { Search, ShieldCheck } from "lucide-react";

import NotificationBell from "@/components/NotificationBell";
import { NavLink } from "@/components/navigation/PrimaryNavLink";
import ProfileMenu from "@/components/navigation/ProfileMenu";
import MobileNavSheet from "@/components/navigation/MobileNavSheet";

import { usePermissions } from "@/hooks/usePermissions";
import { useClientVaultMode } from "@/hooks/useClientVaultMode";
import { useNotifications } from "@/hooks/useNotifications";

import { isPrimaryNavActive } from "@/lib/navigation/activeGroup";
import { PRIMARY_NAV_ITEMS } from "@/lib/navigation/config";
import { shouldShowPremiumBadge } from "@/lib/navigation/navVisibility";

export default function AppHeader() {
  const pathname = usePathname();
  const notificationsState = useNotifications();

  const {
    active: isClientVaultMode,
  } = useClientVaultMode();

  const {
    canViewFeature,
    inheritsFamilyPlan,
    hasFamilyFeatureAccess,
  } = usePermissions();

  return (
    <>
      <MobileNavSheet notificationsState={notificationsState} />

      <header className="sticky top-0 z-50 hidden border-b border-white/10 bg-[#183047]/95 text-[#f5f1e8] shadow-[0_10px_35px_-28px_rgba(0,0,0,0.85)] backdrop-blur-xl md:block">
        <div className="mx-auto grid h-[72px] max-w-[var(--content-max)] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-4 sm:px-6 lg:px-8">
          {/* BRAND */}

          <Link
            href="/dashboard"
            className="flex items-center gap-3 justify-self-start"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#718d4f]/35 bg-[#718d4f]/10 text-[#718d4f]">
              <ShieldCheck
                size={19}
                strokeWidth={1.7}
              />
            </div>

            <div className="hidden leading-none lg:block">
              <p className="font-serif text-[15px] font-semibold text-[#f5f1e8]">
                Home Tech
              </p>

              <p className="mt-1 font-serif text-[15px] font-semibold text-[#f5f1e8]">
                Vault
              </p>
            </div>
          </Link>

          {/* PRIMARY NAV */}

          <nav
            aria-label="Primary"
            className="justify-self-center"
          >
            <div className="flex items-center rounded-full border border-white/10 bg-white/[0.04] p-1 shadow-inner [&_a]:text-[#c5cdd3] [&_a:hover]:text-white">
              {PRIMARY_NAV_ITEMS.map(
                (item) => {
                  const isActive =
                    isPrimaryNavActive(
                      pathname,
                      item.href
                    );

                  if (item.href === "/smart-search") {
                    return null;
                  }

                  const premiumBadge =
                    shouldShowPremiumBadge(
                      item.feature,
                      canViewFeature,
                      inheritsFamilyPlan,
                      hasFamilyFeatureAccess
                    );

                  const badge =
                    premiumBadge;

                  return (
                    <NavLink
                      key={item.href}
                      href={item.href}
                      label={
                        item.label
                      }
                      isActive={isActive}
                      badge={badge}
                      compact
                    />
                  );
                }
              )}
            </div>
          </nav>

          {/* ACCOUNT CONTROLS */}

          <div className="flex min-w-0 items-center justify-self-end">
            <div className="flex items-center rounded-full border border-white/10 bg-white/[0.04] p-1 text-[#f5f1e8] shadow-inner [&_button]:text-[#f5f1e8] [&_button:hover]:bg-white/[0.07]">
              <Link
                href="/smart-search"
                aria-label="Search your home"
                title="Search"
                className={[
                  "flex h-9 w-9 items-center justify-center rounded-full transition",
                  pathname.startsWith("/smart-search")
                    ? "bg-white/[0.12] text-white"
                    : "text-[#f5f1e8] hover:bg-white/[0.07]",
                ].join(" ")}
              >
                <Search
                  size={17}
                  strokeWidth={1.8}
                  aria-hidden
                />
                <span className="sr-only">
                  Search
                </span>
              </Link>

              {!isClientVaultMode ? (
                <NotificationBell
                  compact
                  notificationsState={notificationsState}
                />
              ) : null}

              <ProfileMenu compact />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}