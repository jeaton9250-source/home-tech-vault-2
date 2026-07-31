"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ChevronDown } from "lucide-react";

import AdminAccountMenu from "@/components/admin/AdminAccountMenu";
import AdminGlobalSearch from "@/components/admin/founder-control-center/AdminGlobalSearch";
import AdminNotificationBell from "@/components/admin/ui/AdminNotificationBell";
import Logo from "@/components/brand/Logo";
import Button from "@/components/ui/Button";
import {
  ADMIN_APP_HOME_HREF,
  ADMIN_NAV_GROUPS,
  isAdminNavGroupActive,
  isAdminNavItemActive,
} from "@/lib/admin/navigation";
import { cn } from "@/lib/design-system/cn";

export default function AdminControlCenterHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 hidden border-b border-border-subtle bg-surface-card/95 backdrop-blur-sm lg:block">
      <div className="mx-auto flex min-h-16 max-w-[1600px] items-center gap-4 px-6 py-2 xl:px-8">
        <Link
          href="/admin"
          className="flex shrink-0 items-center gap-3"
        >
          <Logo />

          <span
            aria-hidden="true"
            className="h-4 w-px bg-border-subtle"
          />

          <span className="text-xs font-medium uppercase tracking-[0.14em] text-text-tertiary">
            Control Center
          </span>
        </Link>

        <nav
          aria-label="Admin"
          className="flex flex-1 items-center justify-center gap-1"
        >
          {ADMIN_NAV_GROUPS.map((group) => {
            const groupActive = isAdminNavGroupActive(
              pathname,
              group
            );

            if (group.items.length === 1) {
              const item = group.items[0];
              const Icon = item.icon;

              return (
                <Link
                  key={group.id}
                  href={item.href}
                  aria-current={
                    groupActive ? "page" : undefined
                  }
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition",
                    groupActive
                      ? "bg-surface-sunken text-text-primary"
                      : "text-text-secondary hover:bg-surface-sunken/70 hover:text-text-primary"
                  )}
                >
                  <Icon size={16} />
                  {group.label}
                </Link>
              );
            }

            return (
              <details
                key={group.id}
                className="group relative"
              >
                <summary
                  className={cn(
                    "flex cursor-pointer list-none items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition",
                    groupActive
                      ? "bg-surface-sunken text-text-primary"
                      : "text-text-secondary hover:bg-surface-sunken/70 hover:text-text-primary"
                  )}
                >
                  {group.label}
                  <ChevronDown
                    size={14}
                    className="transition group-open:rotate-180"
                  />
                </summary>

                <div className="absolute left-1/2 top-full z-50 mt-2 w-72 -translate-x-1/2 rounded-[22px] border border-border-subtle bg-surface-card p-2 shadow-[var(--shadow-md)]">
                  <div className="px-3 pb-2 pt-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                      {group.label}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-text-secondary">
                      {group.description}
                    </p>
                  </div>

                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const active = isAdminNavItemActive(
                        pathname,
                        item
                      );
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          className={cn(
                            "flex items-start gap-3 rounded-[16px] px-3 py-3 transition",
                            active
                              ? "bg-surface-sunken text-text-primary"
                              : "text-text-secondary hover:bg-surface-sunken/70 hover:text-text-primary"
                          )}
                        >
                          <Icon
                            size={17}
                            className="mt-0.5 shrink-0"
                          />

                          <span>
                            <span className="block text-sm font-semibold">
                              {item.label}
                            </span>
                            <span className="mt-0.5 block text-xs leading-5 text-text-tertiary">
                              {item.description}
                            </span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </details>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <div className="w-52 xl:w-64">
            <AdminGlobalSearch />
          </div>

          <Button
            href={ADMIN_APP_HOME_HREF}
            variant="secondary"
            size="sm"
          >
            View App
          </Button>

          <AdminNotificationBell />
          <AdminAccountMenu />
        </div>
      </div>
    </header>
  );
}
