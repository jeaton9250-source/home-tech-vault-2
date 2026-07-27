"use client";

import Link from "next/link";
import { useId } from "react";

import { Plus, X } from "lucide-react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";

import { useNavMenu } from "@/hooks/useNavMenu";
import { usePermissions } from "@/hooks/usePermissions";

import { QUICK_ADD_ITEMS } from "@/lib/navigation/config";
import { NAV_MENU_IDS } from "@/lib/navigation/menuIds";

import { cn } from "@/lib/design-system/cn";

export default function FloatingActionButton() {
  const instanceId = useId();
  const { isMenuOpen, toggleMenu, closeMenu } = useNavMenu();
  const isOpen = isMenuOpen(NAV_MENU_IDS.floatingAdd, instanceId);

  const {
    canPerformCreate,
    getActionHref,
    getActionLabel,
    canViewFeature,
  } = usePermissions();

  const visibleItems = QUICK_ADD_ITEMS.filter(
    (item) =>
      !item.feature || canViewFeature(item.feature)
  );

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {isOpen ? (
          <motion.button
            type="button"
            aria-label="Close add menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[90] bg-text-primary/20 lg:hidden"
            onClick={closeMenu}
          />
        ) : null}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
        <AnimatePresence>
          {isOpen ? (
            <motion.ul
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{
                duration: 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mb-1 w-[min(280px,calc(100vw-48px))] overflow-hidden rounded-[var(--radius-dialog)] border border-border-subtle bg-surface-card p-2 shadow-lg"
              role="menu"
              aria-label="Add to your home"
            >
              {visibleItems.map((item, index) => {
                const Icon = item.icon;
                const href = getActionHref(
                  item.href,
                  item.actionFeature
                );
                const label = getActionLabel(item.label);
                const canMutate = canPerformCreate(item.actionFeature);

                return (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: index * 0.04,
                      duration: 0.18,
                    }}
                  >
                    <Link
                      href={href}
                      role="menuitem"
                      onClick={closeMenu}
                      aria-label={
                        canMutate
                          ? item.label
                          : `${label} — read-only`
                      }
                      className={cn(
                        "flex items-center gap-3 rounded-[var(--radius-button)] px-3 py-3 transition hover:bg-surface-sunken focus-visible:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25",
                        !canMutate && "opacity-90"
                      )}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-surface-sunken text-charcoal">
                        <Icon size={17} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-text-primary">
                          {label}
                        </span>
                        {item.description ? (
                          <span className="mt-0.5 block text-xs text-text-secondary">
                            {item.description}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  </motion.li>
                );
              })}
            </motion.ul>
          ) : null}
        </AnimatePresence>

        <button
          type="button"
          onClick={() =>
            toggleMenu(NAV_MENU_IDS.floatingAdd, instanceId)
          }
          aria-label={isOpen ? "Close add menu" : "Add to your home"}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          className={cn(
            "htv-focus-ring flex h-14 w-14 items-center justify-center rounded-full border border-charcoal bg-charcoal text-surface-card shadow-lg transition hover:bg-charcoal-hover active:scale-[0.97]",
            isOpen && "rotate-0"
          )}
        >
          <motion.span
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? <X size={22} /> : <Plus size={22} />}
          </motion.span>
        </button>
      </div>
    </>
  );
}
