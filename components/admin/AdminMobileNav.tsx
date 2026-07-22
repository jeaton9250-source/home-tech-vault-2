"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Menu, X } from "lucide-react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";

import AdminAccountMenu from "@/components/admin/AdminAccountMenu";
import Logo from "@/components/brand/Logo";
import {
  ADMIN_APP_HOME_HREF,
  ADMIN_HEADER_NAV_ITEMS,
} from "@/lib/admin/navigation";
import { cn } from "@/lib/design-system/cn";
import { supabase } from "@/lib/supabase";

export default function AdminMobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setOpen(false);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
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
    setOpen(false);
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border-subtle bg-surface-card/95 backdrop-blur-sm lg:hidden">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
          <Link
            href="/admin"
            className="flex min-w-0 flex-1 items-center gap-3"
          >
            <Logo />
            <span className="h-4 w-px shrink-0 bg-border-subtle" />
            <span className="truncate text-xs font-medium uppercase tracking-[0.14em] text-text-tertiary">
              Control Center
            </span>
          </Link>

          <button
            type="button"
            onClick={() => {
              setOpen(true);
            }}
            className="htv-focus-ring inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)] border border-border-subtle bg-surface-card text-text-secondary"
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
              onClick={() => {
                setOpen(false);
              }}
            />

            <motion.nav
              id="admin-mobile-nav-panel"
              aria-label="Admin"
              className="fixed inset-y-0 right-0 z-[70] flex w-[min(100vw-2rem,320px)] flex-col border-l border-border-subtle bg-surface-card shadow-[var(--shadow-md)] lg:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                stiffness: 420,
                damping: 36,
              }}
            >
              <div className="flex items-center justify-between border-b border-border-subtle px-4 py-4">
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
                  onClick={() => {
                    setOpen(false);
                  }}
                  className="htv-focus-ring inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)] border border-border-subtle bg-surface-card"
                  aria-label="Close admin navigation menu"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                <ul className="space-y-1">
                  {ADMIN_HEADER_NAV_ITEMS.map((item) => {
                    const active = item.isActive(
                      pathname
                    );

                    return (
                      <li key={item.id}>
                        <Link
                          href={item.href}
                          className={cn(
                            "block rounded-[18px] px-4 py-3 text-sm font-medium transition",
                            active
                              ? "bg-surface-sunken text-text-primary"
                              : "text-text-secondary hover:bg-surface-sunken/70 hover:text-text-primary"
                          )}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="space-y-1 border-t border-border-subtle p-3">
                <Link
                  href={ADMIN_APP_HOME_HREF}
                  className="block rounded-[18px] px-4 py-3 text-sm font-medium text-text-secondary transition hover:bg-surface-sunken/70 hover:text-text-primary"
                >
                  View App
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    void signOut();
                  }}
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
