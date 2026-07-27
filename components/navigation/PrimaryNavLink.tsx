"use client";

import Link from "next/link";

import Badge from "@/components/ui/Badge";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/design-system/cn";

export function NavLink({
  href,
  label,
  isActive,
  badge,
  onClick,
  compact = false,
}: {
  href: string;
  label: string;
  isActive: boolean;
  badge?: string | null;
  onClick?: () => void;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold transition-all duration-200",
        compact
          ? "px-3 py-1.5 text-xs lg:px-3.5 lg:text-[0.8125rem]"
          : "px-3.5 py-2 text-xs lg:text-sm",
        isActive
          ? "bg-charcoal text-white shadow-md scale-[1.02]"
          : "text-text-secondary hover:bg-surface-sunken/80 hover:text-text-primary"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {label}

      {badge ? (
        <Badge variant="premium" className="ml-0.5">
          {badge}
        </Badge>
      ) : null}
    </Link>
  );
}

export function MobileNavLink({
  href,
  label,
  isActive,
  badge,
  icon: Icon,
  onClick,
}: {
  href: string;
  label: string;
  isActive: boolean;
  badge?: string | null;
  icon?: LucideIcon;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all duration-200",
        isActive
          ? "bg-charcoal text-white shadow-md"
          : "text-text-primary hover:bg-surface-sunken"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {Icon ? <Icon size={18} aria-hidden /> : null}

      <span className="flex-1">{label}</span>

      {badge ? (
        <Badge variant="premium">{badge}</Badge>
      ) : null}
    </Link>
  );
}

