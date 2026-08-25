"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  LogOut,
  Menu,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import Button from "@/components/ui/Button";

import NotificationBell from "@/components/NotificationBell";
import { MobileNavLink } from "@/components/navigation/PrimaryNavLink";
import ProfileMenu from "@/components/navigation/ProfileMenu";

import { useAIAdvisor } from "@/hooks/useAIAdvisor";
import { useDemoMode } from "@/hooks/useDemoMode";
import { usePermissions } from "@/hooks/usePermissions";
import type { NotificationsState } from "@/hooks/useNotifications";

import { isPrimaryNavActive } from "@/lib/navigation/activeGroup";
import { MOBILE_NAV_ITEMS } from "@/lib/navigation/config";
import { shouldShowPremiumBadge } from "@/lib/navigation/navVisibility";

import { supabase } from "@/lib/supabase";

type MobileNavSheetProps = {
  notificationsState: NotificationsState;
};

export default function MobileNavSheet({
  notificationsState,
}: MobileNavSheetProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] =
    useState(false);

  const { user, isDemo } =
    useDemoMode();

  const {
    canViewFeature,
    inheritsFamilyPlan,
    hasFamilyFeatureAccess,
    isVerifiedPlatformAdmin,
    permissionsReady,
  } = usePermissions();

  const {
    open: openAdvisor,
  } = useAIAdvisor();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const visibleItems =
    MOBILE_NAV_ITEMS.filter(
      (item) => {
        if (
          "adminOnly" in item &&
          item.adminOnly
        ) {
          return (
            permissionsReady &&
            isVerifiedPlatformAdmin
          );
        }

        if (
          item.feature &&
          !canViewFeature(
            item.feature
          )
        ) {
          return false;
        }

        return true;
      }
    );

  return (
    <>
      {/* MOBILE HEADER */}

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#183047]/95 text-[#f5f1e8] shadow-[0_10px_30px_-24px_rgba(0,0,0,0.8)] backdrop-blur-xl md:hidden">
        <div className="flex h-[68px] items-center gap-2 px-3 sm:px-4">
          <button
            type="button"
            onClick={() =>
              setOpen(true)
            }
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#f5f1e8] transition hover:bg-white/[0.07]"
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>

          <Link
            href="/dashboard"
            className="flex min-w-0 flex-1 items-center gap-2.5"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#718d4f]/30 bg-[#718d4f]/10 text-[#718d4f]">
              <ShieldCheck
                size={17}
              />
            </div>

            <p className="truncate font-serif text-sm font-semibold">
              Home Tech Vault
            </p>
          </Link>

          <div className="flex items-center rounded-full border border-white/10 bg-white/[0.04] p-0.5 [&_button]:text-[#f5f1e8] [&_button:hover]:bg-white/[0.07]">
            <NotificationBell
              compact
              notificationsState={notificationsState}
            />

            <ProfileMenu compact />
          </div>
        </div>
      </header>

      {/* DRAWER */}

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation menu"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="fixed inset-0 z-50 bg-[#07101a]/60 backdrop-blur-[2px] md:hidden"
              onClick={() =>
                setOpen(false)
              }
            />

            <motion.aside
              initial={{
                x: "100%",
              }}
              animate={{
                x: 0,
              }}
              exit={{
                x: "100%",
              }}
              drag="x"
              dragConstraints={{
                left: 0,
                right: 0,
              }}
              dragElastic={0.08}
              onDragEnd={(
                _,
                info
              ) => {
                if (
                  info.offset.x >
                    80 ||
                  info.velocity.x >
                    400
                ) {
                  setOpen(false);
                }
              }}
              transition={{
                duration: 0.24,
                ease: [
                  0.22,
                  1,
                  0.36,
                  1,
                ],
              }}
              className="fixed inset-y-0 right-0 z-[60] flex w-[min(100vw,360px)] flex-col border-l border-white/10 bg-[#183047] text-[#f5f1e8] shadow-[0_0_60px_rgba(0,0,0,0.35)] md:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              {/* DRAWER HEADER */}

              <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#718d4f]/30 bg-[#718d4f]/10 text-[#718d4f]">
                    <ShieldCheck
                      size={17}
                    />
                  </div>

                  <div>
                    <p className="font-serif text-sm font-semibold">
                      Home Tech Vault
                    </p>

                    <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-white/30">
                      Navigation
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setOpen(false)
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white/70 transition hover:bg-white/[0.07] hover:text-white"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* AI ADVISOR */}

              {canViewFeature(
                "aiAdvisor"
              ) ? (
                <div className="border-b border-white/10 p-4">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="border-white/10 bg-white/[0.05] text-[#f5f1e8] hover:border-[#718d4f]/30 hover:bg-white/[0.08]"
                    onClick={() => {
                      openAdvisor();
                      setOpen(
                        false
                      );
                    }}
                  >
                    <Sparkles
                      size={16}
                    />

                    AI Advisor
                  </Button>
                </div>
              ) : null}

              {/* LINKS */}

              <nav
                aria-label="Mobile primary"
                className="flex-1 overflow-y-auto p-4"
              >
                <ul className="space-y-1 [&_a]:text-[#c6ced4] [&_a:hover]:bg-white/[0.05] [&_a:hover]:text-white">
                  {visibleItems.map(
                    (item) => {
                      const badge =
                        shouldShowPremiumBadge(
                          item.feature,
                          canViewFeature,
                          inheritsFamilyPlan,
                          hasFamilyFeatureAccess
                        );

                      const icon =
                        "icon" in
                        item
                          ? item.icon
                          : undefined;

                      return (
                        <li
                          key={
                            item.href
                          }
                        >
                          <MobileNavLink
                            href={
                              item.href
                            }
                            label={
                              item.label
                            }
                            isActive={isPrimaryNavActive(
                              pathname,
                              item.href
                            )}
                            badge={
                              badge
                            }
                            icon={
                              icon
                            }
                            onClick={() =>
                              setOpen(
                                false
                              )
                            }
                          />
                        </li>
                      );
                    }
                  )}
                </ul>
              </nav>

              {/* SIGN OUT */}

              <div className="border-t border-white/10 p-4">
                {!isDemo && user ? (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(
                        false
                      );
                      void signOut();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#c6ced4] transition hover:bg-white/[0.05] hover:text-white"
                  >
                    <LogOut
                      size={18}
                    />

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