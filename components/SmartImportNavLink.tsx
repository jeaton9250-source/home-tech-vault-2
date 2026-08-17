"use client";

import {
  Sparkles,
} from "lucide-react";

import Link from "next/link";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

type ImportResponse = {
  imports?: Array<{
    id: string;
  }>;

  error?: string;
};

export default function SmartImportNavLink({
  collapsed = false,
}: {
  collapsed?: boolean;
}) {
  const [
    pendingCount,
    setPendingCount,
  ] = useState(0);

  const loadPendingCount =
    useCallback(async () => {
      try {
        const response =
          await fetch(
            "/api/imports",
            {
              method: "GET",
              cache: "no-store",
            }
          );

        if (!response.ok) {
          return;
        }

        const data:
          ImportResponse =
          await response.json();

        setPendingCount(
          data.imports?.length ??
            0
        );
      } catch {
        /*
          If the request fails,
          don't break navigation.
        */
      }
    }, []);

  useEffect(() => {
    void loadPendingCount();

    /*
      Refresh periodically in case
      a receipt arrives while the
      user is already in the app.
    */
    const interval =
      window.setInterval(
        () => {
          void loadPendingCount();
        },
        30000
      );

    /*
      Refresh when the user returns
      to this browser tab.
    */
    function handleFocus() {
      void loadPendingCount();
    }

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      window.clearInterval(
        interval
      );

      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [loadPendingCount]);

  return (
    <Link
      href="/imports"
      title={
        collapsed
          ? "Smart Import"
          : undefined
      }
      className="
        group
        relative
        flex
        min-h-11
        items-center
        gap-3
        rounded-xl
        px-3
        text-sm
        font-medium
        text-text-secondary
        transition
        hover:bg-home-health-soft/50
        hover:text-text-primary
      "
    >
      <div className="relative flex shrink-0 items-center justify-center">
        <Sparkles
          size={19}
          className="text-home-health"
          aria-hidden
        />

        {collapsed &&
          pendingCount > 0 && (
            <span
              className="
                absolute
                -right-2
                -top-2
                flex
                h-4
                min-w-4
                items-center
                justify-center
                rounded-full
                bg-home-health
                px-1
                text-[9px]
                font-bold
                leading-none
                text-white
              "
            >
              {pendingCount > 9
                ? "9+"
                : pendingCount}
            </span>
          )}
      </div>

      {!collapsed && (
        <>
          <span className="flex-1">
            Smart Import
          </span>

          {pendingCount > 0 && (
            <span
              className="
                flex
                h-6
                min-w-6
                items-center
                justify-center
                rounded-full
                bg-home-health
                px-2
                text-[11px]
                font-bold
                text-white
              "
            >
              {pendingCount > 99
                ? "99+"
                : pendingCount}
            </span>
          )}
        </>
      )}
    </Link>
  );
}