"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  usePathname,
} from "next/navigation";

import {
  Analytics,
} from "@vercel/analytics/next";

import {
  supabase,
} from "@/lib/supabase";

const INTERNAL_ANALYTICS_KEY =
  "htv_internal_analytics";

export default function InternalAwareVercelAnalytics() {
  const pathname = usePathname();

  const [
    shouldTrack,
    setShouldTrack,
  ] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function resolveTracking() {
      /*
       * Never count Control Center traffic.
       */
      if (
        pathname === "/admin" ||
        pathname.startsWith("/admin/")
      ) {
        if (!cancelled) {
          setShouldTrack(false);
        }

        return;
      }

      /*
       * Once this browser has been recognized as an internal
       * admin/developer browser, keep analytics disabled even
       * after sign-out. That prevents production homepage and
       * marketing testing from inflating traffic.
       */
      try {
        if (
          window.localStorage.getItem(
            INTERNAL_ANALYTICS_KEY
          ) === "1"
        ) {
          if (!cancelled) {
            setShouldTrack(false);
          }

          return;
        }
      } catch {
        // localStorage may be unavailable in restricted browsers.
      }

      try {
        const {
          data: {
            session,
          },
        } =
          await supabase.auth.getSession();

        const userId =
          session?.user?.id;

        if (!userId) {
          if (!cancelled) {
            setShouldTrack(true);
          }

          return;
        }

        const {
          data: profile,
          error,
        } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", userId)
          .maybeSingle();

        if (error) {
          console.warn(
            "[analytics] Unable to determine internal-user status:",
            error.message
          );

          /*
           * Fail open for regular visitors. We don't want an
           * analytics lookup issue to disable tracking globally.
           */
          if (!cancelled) {
            setShouldTrack(true);
          }

          return;
        }

        const isInternal =
          profile?.is_admin === true;

        if (isInternal) {
          try {
            window.localStorage.setItem(
              INTERNAL_ANALYTICS_KEY,
              "1"
            );
          } catch {
            // Ignore storage failures.
          }
        }

        if (!cancelled) {
          setShouldTrack(
            !isInternal
          );
        }
      } catch (error) {
        console.warn(
          "[analytics] Internal-user check failed:",
          error
        );

        if (!cancelled) {
          setShouldTrack(true);
        }
      }
    }

    void resolveTracking();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (!shouldTrack) {
    return null;
  }

  return <Analytics />;
}
