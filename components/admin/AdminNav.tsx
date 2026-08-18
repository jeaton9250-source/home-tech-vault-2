"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ADMIN_NAV_GROUPS,
  isAdminNavItemActive,
} from "@/lib/admin/navigation";

import { cn } from "@/lib/design-system/cn";

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin navigation"
      className="space-y-7"
    >
      {ADMIN_NAV_GROUPS.map((group) => (
        <section key={group.id}>
          <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/55">
            {group.label}
          </p>

          <div className="mt-2 space-y-1">
            {group.items.map((item) => {
              const active =
                isAdminNavItemActive(
                  pathname,
                  item
                );

              const Icon = item.icon;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  className={cn(
                    "group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors",
                    active
                      ? "bg-[#718d4f] text-white shadow-sm"
                      : "text-white/72 hover:bg-white/[0.07] hover:text-white"
                  )}
                >
                  <Icon
                    size={17}
                    className={cn(
                      "shrink-0 transition-colors",
                      active
                        ? "text-white"
                        : "text-white/55 group-hover:text-white/90"
                    )}
                  />

                  <span className="truncate">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </nav>
  );
}
