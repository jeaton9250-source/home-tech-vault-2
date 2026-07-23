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
}: {
  href: string;
  label: string;
  isActive: boolean;
  badge?: string | null;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center gap-1 rounded-[var(--radius-button)] px-2 py-2 text-sm font-medium transition xl:px-2.5",
        isActive
          ? "font-semibold text-text-primary"
          : "text-text-secondary hover:text-text-primary"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {label}

      {badge ? (
        <Badge variant="premium" className="ml-0.5">
          {badge}
        </Badge>
      ) : null}

      {isActive ? (
        <span
          className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-charcoal"
          aria-hidden
        />
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
