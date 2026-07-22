"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import AdminAccountMenu from "@/components/admin/AdminAccountMenu";
import AdminGlobalSearch from "@/components/admin/founder-control-center/AdminGlobalSearch";
import Logo from "@/components/brand/Logo";
import Button from "@/components/ui/Button";
import {
  ADMIN_APP_HOME_HREF,
  ADMIN_HEADER_NAV_ITEMS,
} from "@/lib/admin/navigation";
import { cn } from "@/lib/design-system/cn";

export default function AdminControlCenterHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 hidden border-b border-border-subtle bg-surface-card/95 backdrop-blur-sm lg:block">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-6 xl:px-8">
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
          {ADMIN_HEADER_NAV_ITEMS.map((item) => {
            const active = item.isActive(pathname);

            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={
                  active ? "page" : undefined
                }
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium transition",
                  active
                    ? "bg-surface-sunken text-text-primary"
                    : "text-text-secondary hover:bg-surface-sunken/70 hover:text-text-primary"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <div className="w-56 xl:w-64">
            <AdminGlobalSearch />
          </div>

          <Button
            href={ADMIN_APP_HOME_HREF}
            variant="secondary"
            size="sm"
          >
            View App
          </Button>

          <AdminAccountMenu />
        </div>
      </div>
    </header>
  );
}
