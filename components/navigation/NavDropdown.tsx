"use client";

import Link from "next/link";

import { ChevronDown } from "lucide-react";

import Badge from "@/components/ui/Badge";

import DropdownMenu from "@/components/navigation/DropdownMenu";

import { useNavMenu } from "@/hooks/useNavMenu";
import { usePermissions } from "@/hooks/usePermissions";

import { FEATURE_REQUIREMENTS } from "@/lib/permissions/features";

import type { FeatureKey } from "@/lib/permissions/types";

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

function planBadgeLabel(
  feature: FeatureKey
): string | null {
  const required =
    FEATURE_REQUIREMENTS[feature];

  if (required === "pro") {
    return "Pro";
  }

  if (required === "family") {
    return "Family";
  }

  return null;
}

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

  function showPremiumBadge(
    feature?: FeatureKey
  ) {
    if (!feature) {
      return false;
    }

    if (canViewFeature(feature)) {
      return false;
    }

    const required =
      FEATURE_REQUIREMENTS[feature];

    if (
      required === "family" &&
      inheritsFamilyPlan &&
      hasFamilyFeatureAccess
    ) {
      return false;
    }

    return (
      planBadgeLabel(feature) !== null
    );
  }

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
              ? "bg-surface-sunken font-semibold text-text-primary"
              : "text-text-secondary hover:bg-surface-sunken hover:text-text-primary"
          )}
        >
          {label}

          <ChevronDown
            size={16}
            className={cn(
              "transition-transform duration-200",
              triggerProps[
                "aria-expanded"
              ] && "rotate-180"
            )}
          />

          {isActive && (
            <span
              className="absolute inset-x-2 -bottom-2 h-0.5 rounded-full bg-charcoal"
              aria-hidden
            />
          )}
        </button>
      )}
    >
      <ul className="p-2">
        {items.map((item) => {
          const Icon = item.icon;

          const badge =
            item.feature &&
            showPremiumBadge(
              item.feature
            )
              ? planBadgeLabel(
                  item.feature
                )
              : null;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                role="menuitem"
                tabIndex={-1}
                onClick={() =>
                  closeMenu()
                }
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

                    {badge && (
                      <Badge variant="premium">
                        {badge}
                      </Badge>
                    )}
                  </span>

                  {item.description && (
                    <span className="mt-0.5 block text-xs leading-5 text-text-secondary">
                      {
                        item.description
                      }
                    </span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </DropdownMenu>
  );
}

export function NavLink({
  href,
  label,
  isActive,
}: {
  href: string;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative inline-flex items-center rounded-[var(--radius-button)] px-3 py-2 text-sm font-medium transition",
        isActive
          ? "bg-surface-sunken font-semibold text-text-primary"
          : "text-text-secondary hover:bg-surface-sunken hover:text-text-primary"
      )}
    >
      {label}

      {isActive && (
        <span
          className="absolute inset-x-2 -bottom-2 h-0.5 rounded-full bg-charcoal"
          aria-hidden
        />
      )}
    </Link>
  );
}
