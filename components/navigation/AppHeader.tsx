"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Sparkles } from "lucide-react";

import Logo from "@/components/brand/Logo";
import Button from "@/components/ui/Button";

import NotificationBell from "@/components/NotificationBell";
import NavDropdown, {
  NavLink,
} from "@/components/navigation/NavDropdown";
import ProfileMenu from "@/components/navigation/ProfileMenu";
import QuickAddMenu from "@/components/navigation/QuickAddMenu";
import SearchField from "@/components/navigation/SearchField";
import MobileNavSheet from "@/components/navigation/MobileNavSheet";

import { useAIAdvisor } from "@/hooks/useAIAdvisor";
import { usePermissions } from "@/hooks/usePermissions";

import { resolveActiveNavGroup } from "@/lib/navigation/activeGroup";
import { PRIMARY_NAV_GROUPS } from "@/lib/navigation/config";
import { NAV_MENU_IDS } from "@/lib/navigation/menuIds";

export default function AppHeader() {
  const pathname = usePathname();

  const activeGroup =
    resolveActiveNavGroup(pathname);

  const {
    canViewFeature,
    canManageBilling,
  } = usePermissions();

  const { open: openAdvisor } =
    useAIAdvisor();

  const groups =
    PRIMARY_NAV_GROUPS.map((group) => {
      if (group.id !== "more") {
        return group;
      }

      return {
        ...group,
        items: group.items?.filter(
          (item) =>
            item.href !==
              "/settings/billing" ||
            canManageBilling
        ),
      };
    });

  return (
    <>
      <MobileNavSheet />

      <header className="sticky top-0 z-50 hidden border-b border-border-subtle bg-surface-card/95 backdrop-blur-sm lg:block">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-6 xl:px-8">
          <Link
            href="/dashboard"
            className="shrink-0"
          >
            <Logo />
          </Link>

          <div className="mx-auto w-full max-w-xl">
            <SearchField />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <QuickAddMenu />

            <NotificationBell />

            {canViewFeature(
              "aiAdvisor"
            ) && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={openAdvisor}
              >
                <Sparkles size={16} />
                AI Advisor
              </Button>
            )}

            <ProfileMenu />
          </div>
        </div>

        <div className="border-t border-border-subtle">
          <nav
            aria-label="Primary"
            className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-1 px-6 py-2 xl:px-8"
          >
            {groups.map((group) => {
              const isActive =
                activeGroup ===
                group.id;

              if (group.href) {
                return (
                  <NavLink
                    key={group.id}
                    href={group.href}
                    label={group.label}
                    isActive={isActive}
                  />
                );
              }

              if (!group.items) {
                return null;
              }

              return (
                <NavDropdown
                  key={group.id}
                  menuId={NAV_MENU_IDS.navGroup(
                    group.id
                  )}
                  label={group.label}
                  items={group.items}
                  isActive={isActive}
                />
              );
            })}
          </nav>
        </div>
      </header>
    </>
  );
}
