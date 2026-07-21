"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Menu, Sparkles, X } from "lucide-react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";

import Logo from "@/components/brand/Logo";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

import NotificationBell from "@/components/NotificationBell";
import ProfileMenu from "@/components/navigation/ProfileMenu";
import QuickAddMenu from "@/components/navigation/QuickAddMenu";
import SearchField from "@/components/navigation/SearchField";

import { useAIAdvisor } from "@/hooks/useAIAdvisor";
import { usePermissions } from "@/hooks/usePermissions";

import { resolveActiveNavGroup } from "@/lib/navigation/activeGroup";
import { PRIMARY_NAV_GROUPS } from "@/lib/navigation/config";

import { FEATURE_REQUIREMENTS } from "@/lib/permissions/features";

import type { FeatureKey } from "@/lib/permissions/types";

import { cn } from "@/lib/design-system/cn";

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

export default function MobileNavSheet() {
  const pathname = usePathname();

  const [open, setOpen] =
    useState(false);

  const activeGroup =
    resolveActiveNavGroup(pathname);

  const {
    canViewFeature,
    canManageBilling,
    inheritsFamilyPlan,
    hasFamilyFeatureAccess,
  } = usePermissions();

  const { open: openAdvisor } = useAIAdvisor();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow =
        "";
      return;
    }

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        "";
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open]);

  function showPremiumBadge(
    feature?: FeatureKey
  ) {
    if (!feature || canViewFeature(feature)) {
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

    return true;
  }

  const groups =
    PRIMARY_NAV_GROUPS.map((group) => {
      if (group.id !== "more") {
        return group;
      }

      return {
        ...group,
        items: group.items?.filter(
          (item) =>
            item.href !==
              "/settings/billing" ||
            canManageBilling
        ),
      };
    });

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border-subtle bg-surface-card/95 backdrop-blur-sm lg:hidden">
        <div className="flex h-14 items-center gap-2 px-4">
          <button
            type="button"
            onClick={() =>
              setOpen(true)
            }
            className="htv-focus-ring flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)] text-text-primary hover:bg-surface-sunken"
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>

          <Link
            href="/dashboard"
            className="min-w-0 flex-1"
          >
            <Logo collapsed />
          </Link>

          <NotificationBell />

          <ProfileMenu compact />
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-text-primary/20 lg:hidden"
              onClick={() =>
                setOpen(false)
              }
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              drag="x"
              dragConstraints={{
                left: 0,
                right: 0,
              }}
              dragElastic={0.08}
              onDragEnd={(_, info) => {
                if (
                  info.offset.x > 80 ||
                  info.velocity.x > 400
                ) {
                  setOpen(false);
                }
              }}
              transition={{
                duration: 0.24,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="fixed inset-y-0 right-0 z-[60] flex w-[min(100vw,360px)] flex-col bg-surface-card shadow-lg lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              <div className="flex h-14 items-center justify-between border-b border-border-subtle px-4">
                <p className="text-sm font-medium text-text-primary">
                  Menu
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setOpen(false)
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)] hover:bg-surface-sunken"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 border-b border-border-subtle p-4">
                <SearchField compact />

                <div className="flex flex-wrap gap-2">
                  <QuickAddMenu compact />

                  {canViewFeature(
                    "aiAdvisor"
                  ) && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        openAdvisor();
                        setOpen(false);
                      }}
                    >
                      <Sparkles size={16} />
                      AI Advisor
                    </Button>
                  )}
                </div>
              </div>

              <nav className="flex-1 overflow-y-auto p-4">
                <div className="space-y-6">
                  {groups.map((group) => (
                    <section key={group.id}>
                      {group.href ? (
                        <Link
                          href={group.href}
                          className={cn(
                            "block rounded-[var(--radius-button)] px-3 py-2 text-base font-medium",
                            activeGroup ===
                              group.id
                              ? "bg-interaction-soft text-interaction"
                              : "text-text-primary hover:bg-surface-sunken"
                          )}
                        >
                          {group.label}
                        </Link>
                      ) : (
                        <>
                          <p className="text-overline px-3">
                            {group.label}
                          </p>

                          <ul className="mt-2 space-y-1">
                            {group.items?.map(
                              (item) => {
                                const Icon =
                                  item.icon;

                                const badge =
                                  item.feature &&
                                  showPremiumBadge(
                                    item.feature
                                  )
                                    ? planBadgeLabel(
                                        item.feature!
                                      )
                                    : null;

                                const itemActive =
                                  pathname ===
                                    item.href ||
                                  pathname.startsWith(
                                    `${item.href}/`
                                  );

                                return (
                                  <li
                                    key={
                                      item.href
                                    }
                                  >
                                    <Link
                                      href={
                                        item.href
                                      }
                                      className={cn(
                                        "flex items-center gap-3 rounded-[var(--radius-button)] px-3 py-3",
                                        itemActive
                                          ? "bg-interaction-soft text-interaction"
                                          : "text-text-primary hover:bg-surface-sunken"
                                      )}
                                    >
                                      <Icon
                                        size={
                                          18
                                        }
                                      />

                                      <span className="flex-1 text-sm font-medium">
                                        {
                                          item.label
                                        }
                                      </span>

                                      {badge && (
                                        <Badge variant="premium">
                                          {
                                            badge
                                          }
                                        </Badge>
                                      )}
                                    </Link>
                                  </li>
                                );
                              }
                            )}
                          </ul>
                        </>
                      )}
                    </section>
                  ))}
                </div>
              </nav>

              <div className="border-t border-border-subtle p-4">
                <Button
                  href="/dashboard"
                  variant="secondary"
                  fullWidth
                  onClick={() =>
                    setOpen(false)
                  }
                >
                  Back to Overview
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
