"use client";

import Link from "next/link";

import { ChevronDown } from "lucide-react";

import Badge from "@/components/ui/Badge";

import DropdownMenu from "@/components/navigation/DropdownMenu";

import { useNavMenu } from "@/hooks/useNavMenu";
import { usePermissions } from "@/hooks/usePermissions";

import { shouldShowPremiumBadge } from "@/lib/navigation/navVisibility";

import type {
  NavMenuItem,
} from "@/lib/navigation/types";

import { cn } from "@/lib/design-system/cn";

type NavDropdownProps = {
  menuId: string;
  label: string;
  items: NavMenuItem[];
  isActive?: boolean;
};

/** @deprecated Primary navigation is flat. Kept for any legacy references. */
export default function NavDropdown({
  menuId,
  label,
  items,
  isActive = false,
}: NavDropdownProps) {
  const { closeMenu } = useNavMenu();

  const {
    canViewFeature,
    inheritsFamilyPlan,
    hasFamilyFeatureAccess,
  } = usePermissions();

  return (
    <DropdownMenu
      menuId={menuId}
      trigger={(triggerProps) => (
        <button
          type="button"
          {...triggerProps}
          className={cn(
            "relative inline-flex items-center gap-1.5 rounded-[var(--radius-button)] px-3 py-2 text-sm font-medium transition",
            isActive
              ? "font-semibold text-text-primary"
              : "text-text-secondary hover:bg-surface-sunken hover:text-text-primary"
          )}
        >
          {label}

          <ChevronDown
            size={16}
            className={cn(
              "transition-transform duration-200",
              triggerProps["aria-expanded"] && "rotate-180"
            )}
          />

          {isActive ? (
            <span
              className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-charcoal"
              aria-hidden
            />
          ) : null}
        </button>
      )}
    >
      <ul className="p-2">
        {items.map((item) => {
          const Icon = item.icon;

          const badge = shouldShowPremiumBadge(
            item.feature,
            canViewFeature,
            inheritsFamilyPlan,
            hasFamilyFeatureAccess
          );

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                role="menuitem"
                tabIndex={-1}
                onClick={() => closeMenu()}
                className="flex items-start gap-3 rounded-[var(--radius-button)] px-3 py-3 transition hover:bg-surface-sunken focus-visible:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction/20"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
                  <Icon size={18} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary">
                      {item.label}
                    </span>

                    {badge ? (
                      <Badge variant="premium">{badge}</Badge>
                    ) : null}
                  </span>

                  {item.description ? (
                    <span className="mt-0.5 block text-xs leading-5 text-text-secondary">
                      {item.description}
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </DropdownMenu>
  );
}

export { NavLink } from "@/components/navigation/PrimaryNavLink";
