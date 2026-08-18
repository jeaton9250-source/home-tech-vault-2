"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  usePathname,
  useRouter,
} from "next/navigation";

import { Menu, X } from "lucide-react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";

import AdminAccountMenu from "@/components/admin/AdminAccountMenu";
import Logo from "@/components/brand/Logo";
import {
  ADMIN_APP_HOME_HREF,
  ADMIN_NAV_GROUPS,
  isAdminNavItemActive,
} from "@/lib/admin/navigation";
import { cn } from "@/lib/design-system/cn";
import { supabase } from "@/lib/supabase";

export default function AdminMobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
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

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open]);

  async function signOut() {
    setOpen(false);
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/8 bg-[#0b1623]/95 text-white backdrop-blur-xl lg:hidden">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
          <Link
            href="/admin"
            className="flex min-w-0 flex-1 items-center gap-3"
          >
            <Logo />
            <span className="h-4 w-px shrink-0 bg-border-subtle" />
            <span className="truncate text-xs font-medium uppercase tracking-[0.14em] text-white/45">
              Control Center
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="htv-focus-ring inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/75"
            aria-expanded={open}
            aria-controls="admin-mobile-nav-panel"
            aria-label="Open admin navigation menu"
          >
            <Menu size={18} />
          </button>

          <AdminAccountMenu compact />
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              aria-label="Close admin navigation menu"
              className="fixed inset-0 z-[60] bg-charcoal/20 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            <motion.nav
              id="admin-mobile-nav-panel"
              aria-label="Admin"
              className="fixed inset-y-0 right-0 z-[70] flex w-[min(100vw-2rem,360px)] flex-col border-l border-white/10 bg-[#0b1623] text-white shadow-2xl lg:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                stiffness: 420,
                damping: 36,
              }}
            >
              <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    Control Center
                  </p>
                  <p className="text-xs text-text-secondary">
                    Platform administration
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="htv-focus-ring inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)] border border-border-subtle bg-surface-card"
                  aria-label="Close admin navigation menu"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-6">
                  {ADMIN_NAV_GROUPS.map((group) => (
                    <section key={group.id}>
                      <div className="px-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
                          {group.label}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-text-secondary">
                          {group.description}
                        </p>
                      </div>

                      <div className="mt-2 space-y-1">
                        {group.items.map((item) => {
                          const active =
                            isAdminNavItemActive(
                              pathname,
                              item
                            );
                          const Icon = item.icon;

                          return (
                            <Link
                              key={item.id}
                              href={item.href}
                              aria-current={
                                active
                                  ? "page"
                                  : undefined
                              }
                              className={cn(
                                "flex items-start gap-3 rounded-[18px] px-3 py-3 transition",
                                active
                                  ? "bg-surface-sunken text-text-primary"
                                  : "text-text-secondary hover:bg-surface-sunken/70 hover:text-text-primary"
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
                                <span className="mt-0.5 block text-xs leading-5 text-text-tertiary">
                                  {item.description}
                                </span>
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              </div>

              <div className="space-y-1 border-t border-border-subtle p-3">
                <Link
                  href={ADMIN_APP_HOME_HREF}
                  className="block rounded-[18px] px-4 py-3 text-sm font-medium text-text-secondary transition hover:bg-surface-sunken/70 hover:text-text-primary"
                >
                  View Customer App
                </Link>

                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="block w-full rounded-[18px] px-4 py-3 text-left text-sm font-medium text-text-secondary transition hover:bg-surface-sunken/70 hover:text-text-primary"
                >
                  Sign Out
                </button>
              </div>
            </motion.nav>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
