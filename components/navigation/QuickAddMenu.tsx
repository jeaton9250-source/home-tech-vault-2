"use client";

import Link from "next/link";

import { ChevronDown, Plus } from "lucide-react";

import DropdownMenu from "@/components/navigation/DropdownMenu";

import { useNavMenu } from "@/hooks/useNavMenu";
import { usePermissions } from "@/hooks/usePermissions";

import { QUICK_ADD_ITEMS } from "@/lib/navigation/config";
import { NAV_MENU_IDS } from "@/lib/navigation/menuIds";

import { cn } from "@/lib/design-system/cn";

type QuickAddMenuProps = {
  compact?: boolean;
  /** Show only the plus icon with an accessible label */
  iconOnly?: boolean;
};

export default function QuickAddMenu({
  compact = false,
  iconOnly = false,
}: QuickAddMenuProps) {
  const { closeMenu } = useNavMenu();

  const {
    canPerformCreate,
    getActionHref,
    getActionLabel,
  } = usePermissions();

  return (
    <DropdownMenu
      menuId={NAV_MENU_IDS.quickAdd}
      align="end"
      widthClass="w-72"
      trigger={(triggerProps) => (
        <button
          type="button"
          {...triggerProps}
          title="Quick Add"
          className={cn(
            "inline-flex items-center justify-center gap-2 font-medium leading-none outline-none transition-all duration-200 focus-visible:ring-4 focus-visible:ring-accent/25",
            "border border-charcoal bg-charcoal text-surface-card shadow-sm hover:border-charcoal-hover hover:bg-charcoal-hover hover:shadow-md active:scale-[0.98]",
            iconOnly
              ? "h-10 w-10 rounded-[var(--radius-button)]"
              : compact
                ? "min-h-9 rounded-[var(--radius-button)] px-3.5 py-2 text-xs"
                : "min-h-10 rounded-[var(--radius-button)] px-4 py-2 text-sm"
          )}
        >
          <Plus size={16} />
          {!iconOnly && !compact ? "Quick Add" : null}
          {(iconOnly || compact) && (
            <span className="sr-only">Quick Add</span>
          )}
          {!iconOnly && !compact ? (
            <ChevronDown
              size={16}
              className={cn(
                "transition-transform",
                triggerProps["aria-expanded"] && "rotate-180"
              )}
            />
          ) : null}
        </button>
      )}
    >
      <ul className="p-2">
        {QUICK_ADD_ITEMS.map(
          (item) => {
            const Icon = item.icon;

            const href = getActionHref(
              item.href,
              item.actionFeature
            );

            const label = getActionLabel(
              item.label
            );

            const canMutate =
              canPerformCreate(
                item.actionFeature
              );

            return (
              <li key={item.href}>
                <Link
                  href={href}
                  role="menuitem"
                  tabIndex={-1}
                  onClick={() =>
                    closeMenu()
                  }
                  aria-label={
                    canMutate
                      ? item.label
                      : `${label} — read-only`
                  }
                  className={cn(
                    "flex items-start gap-3 rounded-[var(--radius-button)] px-3 py-3 transition hover:bg-surface-sunken focus-visible:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25",
                    !canMutate &&
                      "opacity-90"
                  )}
                >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
                    <Icon size={18} />
                  </span>

                  <span>
                    <span className="block text-sm font-medium text-text-primary">
                      {label}
                    </span>

                    {item.description && (
                      <span className="mt-0.5 block text-xs text-text-secondary">
                        {
                          item.description
                        }
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            );
          }
        )}
      </ul>
    </DropdownMenu>
  );
}
