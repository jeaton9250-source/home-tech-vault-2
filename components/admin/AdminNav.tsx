"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ADMIN_NAV_ITEMS } from "@/lib/admin/navigation";
import { cn } from "@/lib/design-system/cn";

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {ADMIN_NAV_ITEMS.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname === item.href ||
              pathname.startsWith(
                `${item.href}/`
              );

        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-start gap-3 rounded-[18px] border px-3 py-3 transition",
              active
                ? "border-charcoal bg-charcoal text-surface-card shadow-sm"
                : "border-transparent text-text-secondary hover:border-border-subtle hover:bg-surface-sunken hover:text-text-primary"
            )}
          >
            <Icon
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>
              <span className="block text-sm font-semibold">
                {item.label}
              </span>
              <span
                className={cn(
                  "mt-0.5 block text-xs leading-5",
                  active
                    ? "text-white/75"
                    : "text-text-tertiary"
                )}
              >
                {item.description}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
