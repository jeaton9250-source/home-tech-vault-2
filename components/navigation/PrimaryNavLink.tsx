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
        "inline-flex items-center gap-1.5 rounded-full font-medium transition",
        compact
          ? "px-2.5 py-2 text-[13px] lg:px-3 lg:text-sm"
          : "px-3 py-2 text-sm",
        isActive
          ? "bg-surface-sunken text-text-primary shadow-[var(--shadow-inset)]"
          : "text-text-secondary hover:bg-surface-sunken/70 hover:text-text-primary"
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
        "flex items-center gap-3 rounded-[var(--radius-button)] px-3 py-3 text-sm font-medium transition",
        isActive
          ? "bg-surface-sunken font-semibold text-text-primary"
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
