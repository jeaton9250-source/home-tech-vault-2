"use client";

import type {
  ReactNode,
} from "react";

import {
  useEffect,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  Loader2,
} from "lucide-react";

import {
  useDemoMode,
} from "@/hooks/useDemoMode";

import {
  enforceActiveAccount,
} from "@/lib/auth/enforceActiveAccount";

import {
  clearDemoModeStorage,
} from "@/lib/demo/demoModeStorage";

import {
  isPublicAuthPath,
} from "@/lib/marketing/routes";

import {
  isProtectedRoute,
  isPublicRoute,
  normalizePathname,
} from "@/lib/isChromeFreeRoute";

type AuthGuardProps = {
  children: ReactNode;
};

type RealtorAccountContext = {
  authenticated?: boolean;
  realtorOnly?: boolean;
  realtorStatus?:
    | "active"
    | "inactive"
    | "suspended"
    | null;
  isPlatformAdmin?: boolean;
  clientVaultActive?: boolean;
  error?: string;
};

/*
 * Realtor-only accounts always have access to their
 * Realtor workspace.
 */
function isRealtorWorkspacePath(
  pathname: string
) {
  return (
    pathname ===
      "/realtor" ||
    pathname.startsWith(
      "/realtor/"
    )
  );
}

/*
 * These are property-preparation areas.
 *
 * Realtor-only users may enter them only while a valid
 * Client Vault Mode session is active.
 */
function isClientVaultPreparationPath(
  pathname: string
) {
  const allowedPrefixes = [
    "/dashboard",
    "/devices",
    "/documents",
    "/warranties",
    "/maintenance",
    "/network",
    "/family",
  ] as const;

  return allowedPrefixes.some(
    (prefix) =>
      pathname === prefix ||
      pathname.startsWith(
        `${prefix}/`
      )
  );
}

export default function AuthGuard({
  children,
}: AuthGuardProps) {
  const pathname =
    usePathname();

  const router =
    useRouter();

  const normalizedPath =
    normalizePathname(
      pathname
    );

  const {
    user,
    isDemo,
    loading,
  } = useDemoMode();

  const [
    accountBlockedMessage,
    setAccountBlockedMessage,
  ] =
    useState<
      string | null
    >(null);

  const [
    checkingAuth,
    setCheckingAuth,
  ] =
    useState(true);

  const [
    checkingRealtorAccess,
    setCheckingRealtorAccess,
  ] =
    useState(false);

  const [
    realtorContext,
    setRealtorContext,
  ] =
    useState<
      RealtorAccountContext | null
    >(null);

  const routeIsPublicAuth =
    isPublicAuthPath(
      normalizedPath
    );

  const routeIsPublic =
    isPublicRoute(
      normalizedPath
    );

  const routeIsProtected =
    isProtectedRoute(
      normalizedPath
    );

  useEffect(() => {
    console.info(
      "Auth route guard",
      {
        pathname:
          normalizedPath,

        publicRoute:
          routeIsPublicAuth,

        hasUser:
          Boolean(user),
      }
    );
  }, [
    normalizedPath,
    routeIsPublicAuth,
    user,
  ]);

  /*
   * Standard authentication guard.
   */
  useEffect(() => {
    if (
      routeIsPublicAuth
    ) {
      setCheckingAuth(
        false
      );

      return;
    }

    if (
      !routeIsProtected
    ) {
      setCheckingAuth(
        false
      );

      return;
    }

    if (loading) {
      return;
    }

    setCheckingAuth(
      false
    );

    if (
      !user &&
      !isDemo
    ) {
      clearDemoModeStorage();

      router.replace(
        `/login?next=${encodeURIComponent(
          normalizedPath
        )}`
      );
    }
  }, [
    user,
    isDemo,
    loading,
    routeIsProtected,
    routeIsPublicAuth,
    router,
    normalizedPath,
  ]);

  /*
   * Existing account lifecycle enforcement.
   */
  useEffect(() => {
    if (
      routeIsPublicAuth ||
      !routeIsProtected ||
      loading ||
      isDemo ||
      !user
    ) {
      setAccountBlockedMessage(
        null
      );

      return;
    }

    let cancelled =
      false;

    async function verifyAccountStatus() {
      const result =
        await enforceActiveAccount(
          user!.id
        );

      if (cancelled) {
        return;
      }

      if (!result.ok) {
        setAccountBlockedMessage(
          result.message
        );

        router.replace(
          "/login"
        );

        return;
      }

      setAccountBlockedMessage(
        null
      );
    }

    void verifyAccountStatus();

    return () => {
      cancelled = true;
    };
  }, [
    user,
    isDemo,
    loading,
    routeIsProtected,
    routeIsPublicAuth,
    router,
  ]);

  /*
   * Realtor-only route enforcement.
   *
   * Authorization comes from server-side database state,
   * never user-editable browser metadata.
   */
  useEffect(() => {
    if (
      routeIsPublicAuth ||
      !routeIsProtected ||
      loading ||
      isDemo ||
      !user
    ) {
      setCheckingRealtorAccess(
        false
      );

      setRealtorContext(
        null
      );

      return;
    }

    let cancelled =
      false;

    async function verifyRealtorAccess() {
      try {
        setCheckingRealtorAccess(
          true
        );

        const response =
          await fetch(
            "/api/realtor/account-context",
            {
              method: "GET",
              cache: "no-store",
              credentials:
                "same-origin",
            }
          );

        const payload =
          (await response.json()) as RealtorAccountContext;

        if (cancelled) {
          return;
        }

        if (
          !response.ok
        ) {
          /*
           * Do not accidentally lock ordinary users out
           * because the Realtor context endpoint had a
           * temporary server failure.
           */
          console.error(
            "Unable to verify Realtor account context:",
            payload.error
          );

          setRealtorContext(
            null
          );

          return;
        }

        setRealtorContext(
          payload
        );

        if (
          !payload.realtorOnly
        ) {
          return;
        }

        /*
         * Suspended Realtor-only accounts must not enter
         * the workspace.
         */
        if (
          payload.realtorStatus ===
          "suspended"
        ) {
          router.replace(
            "/login?account=realtor-suspended"
          );

          return;
        }

        /*
         * Inactive is primarily used while the invitation
         * is still being completed.
         */
        if (
          payload.realtorStatus !==
          "active"
        ) {
          if (
            !normalizedPath.startsWith(
              "/invite/"
            )
          ) {
            router.replace(
              "/invite/setup"
            );
          }

          return;
        }

        /*
         * The Realtor workspace itself is always allowed.
         */
        if (
          isRealtorWorkspacePath(
            normalizedPath
          )
        ) {
          return;
        }

        /*
         * Property-management pages are allowed only
         * while a verified Client Vault Mode is active.
         */
        if (
          payload.clientVaultActive &&
          isClientVaultPreparationPath(
            normalizedPath
          )
        ) {
          return;
        }

        /*
         * Everything else belongs to the homeowner
         * experience.
         */
        router.replace(
          "/realtor"
        );
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Realtor route guard failed:",
            error
          );

          setRealtorContext(
            null
          );
        }
      } finally {
        if (!cancelled) {
          setCheckingRealtorAccess(
            false
          );
        }
      }
    }

    void verifyRealtorAccess();

    return () => {
      cancelled = true;
    };
  }, [
    user,
    isDemo,
    loading,
    routeIsProtected,
    routeIsPublicAuth,
    router,
    normalizedPath,
  ]);

  if (
    routeIsPublicAuth ||
    routeIsPublic
  ) {
    return (
      <>
        {children}
      </>
    );
  }

  if (
    loading ||
    checkingAuth ||
    checkingRealtorAccess
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-sunken">
        <div className="flex items-center gap-3 text-text-secondary">
          <Loader2
            size={22}
            className="animate-spin"
          />

          Loading Home Tech Vault...
        </div>
      </div>
    );
  }

  if (
    !user &&
    !isDemo
  ) {
    return null;
  }

  if (
    accountBlockedMessage
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-sunken px-6">
        <p className="max-w-md text-center text-sm text-text-secondary">
          {
            accountBlockedMessage
          }
        </p>
      </div>
    );
  }

  /*
   * Avoid briefly rendering a blocked homeowner page
   * before router.replace() finishes.
   */
  if (
    realtorContext?.realtorOnly &&
    realtorContext.realtorStatus ===
      "active" &&
    !isRealtorWorkspacePath(
      normalizedPath
    ) &&
    !(
      realtorContext.clientVaultActive &&
      isClientVaultPreparationPath(
        normalizedPath
      )
    )
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-sunken">
        <div className="flex items-center gap-3 text-text-secondary">
          <Loader2
            size={22}
            className="animate-spin"
          />

          Opening Realtor workspace...
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
    </>
  );
}
