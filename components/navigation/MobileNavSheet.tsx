"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { LogOut, Menu, Search, Sparkles, X } from "lucide-react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";

import Logo from "@/components/brand/Logo";
import Button from "@/components/ui/Button";

import { MobileNavLink } from "@/components/navigation/PrimaryNavLink";
import QuickAddMenu from "@/components/navigation/QuickAddMenu";
import SearchField from "@/components/navigation/SearchField";

import { useAIAdvisor } from "@/hooks/useAIAdvisor";
import { useDemoMode } from "@/hooks/useDemoMode";
import { usePermissions } from "@/hooks/usePermissions";

import { isPrimaryNavActive } from "@/lib/navigation/activeGroup";
import { MOBILE_NAV_ITEMS } from "@/lib/navigation/config";
import { shouldShowPremiumBadge } from "@/lib/navigation/navVisibility";

import { supabase } from "@/lib/supabase";

import { cn } from "@/lib/design-system/cn";

export default function MobileNavSheet() {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const { user, isDemo } = useDemoMode();

  const {
    canViewFeature,
    inheritsFamilyPlan,
    hasFamilyFeatureAccess,
  } = usePermissions();

  const { open: openAdvisor } = useAIAdvisor();

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const visibleItems = MOBILE_NAV_ITEMS.filter((item) => {
    if (item.feature && !canViewFeature(item.feature)) {
      return false;
    }

    return true;
  });

  function isItemActive(href: string) {
    if (href === "/dashboard") {
      return isPrimaryNavActive(pathname, href);
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  function openSheet() {
    setOpen(true);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border-subtle bg-surface-card/90 backdrop-blur-md lg:hidden">
        <div className="flex h-14 items-center gap-2 px-4">
          <button
            type="button"
            onClick={openSheet}
            className="htv-focus-ring flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)] text-text-primary hover:bg-surface-sunken"
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>

          <Link href="/dashboard" className="min-w-0 flex-1">
            <Logo collapsed />
          </Link>

          <button
            type="button"
            onClick={() => {
              setSearchOpen((current) => !current);
              setOpen(true);
            }}
            className="htv-focus-ring flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)] text-text-primary hover:bg-surface-sunken"
            aria-label="Open search"
          >
            <Search size={20} />
          </button>
        </div>

        {searchOpen && !open ? (
          <div className="border-t border-border-subtle px-4 py-3">
            <SearchField compact />
          </div>
        ) : null}
      </header>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-text-primary/20 lg:hidden"
              onClick={() => setOpen(false)}
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.08}
              onDragEnd={(_, info) => {
                if (info.offset.x > 80 || info.velocity.x > 400) {
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
                  onClick={() => setOpen(false)}
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

                  {canViewFeature("aiAdvisor") ? (
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
                  ) : null}
                </div>
              </div>

              <nav
                aria-label="Mobile primary"
                className="flex-1 overflow-y-auto p-4"
              >
                <ul className="space-y-1">
                  {visibleItems.map((item) => {
                    const badge = shouldShowPremiumBadge(
                      item.feature,
                      canViewFeature,
                      inheritsFamilyPlan,
                      hasFamilyFeatureAccess
                    );

                    const icon =
                      "icon" in item ? item.icon : undefined;

                    return (
                      <li key={item.href}>
                        <MobileNavLink
                          href={item.href}
                          label={item.label}
                          isActive={isItemActive(item.href)}
                          badge={badge}
                          icon={icon}
                          onClick={() => setOpen(false)}
                        />
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="border-t border-border-subtle p-4">
                {!isDemo && user ? (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      void signOut();
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-[var(--radius-button)] px-3 py-3 text-sm font-medium text-text-primary hover:bg-surface-sunken"
                    )}
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                ) : null}
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
