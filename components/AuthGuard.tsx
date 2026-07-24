"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useDemoMode } from "@/hooks/useDemoMode";
import { isPublicAuthPath } from "@/lib/marketing/routes";
import {
  isProtectedRoute,
  isPublicRoute,
  normalizePathname,
} from "@/lib/isChromeFreeRoute";
import { enforceActiveAccount } from "@/lib/auth/enforceActiveAccount";

type AuthGuardProps = {
  children: ReactNode;
};

export default function AuthGuard({
  children,
}: AuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const normalizedPath =
    normalizePathname(pathname);

  const {
    user,
    isDemo,
    loading,
  } = useDemoMode();

  const [
    accountBlockedMessage,
    setAccountBlockedMessage,
  ] = useState<string | null>(null);
  const [
    checkingAuth,
    setCheckingAuth,
  ] = useState(true);

  const routeIsPublicAuth =
    isPublicAuthPath(normalizedPath);
  const routeIsPublic =
    isPublicRoute(normalizedPath);
  const routeIsProtected =
    isProtectedRoute(normalizedPath);

  useEffect(() => {
    console.info("Auth route guard", {
      pathname: normalizedPath,
      publicRoute: routeIsPublicAuth,
      hasUser: Boolean(user),
    });
  }, [
    normalizedPath,
    routeIsPublicAuth,
    user,
  ]);

  useEffect(() => {
    if (routeIsPublicAuth) {
      setCheckingAuth(false);
      return;
    }

    if (!routeIsProtected) {
      setCheckingAuth(false);
      return;
    }

    if (loading) {
      return;
    }

    setCheckingAuth(false);

    if (!user && !isDemo) {
      router.replace(
        `/login?redirect=${encodeURIComponent(normalizedPath)}`
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

  useEffect(() => {
    if (
      routeIsPublicAuth ||
      !routeIsProtected ||
      loading ||
      isDemo ||
      !user
    ) {
      setAccountBlockedMessage(null);
      return;
    }

    let cancelled = false;

    async function verifyAccountStatus() {
      const result = await enforceActiveAccount(
        user!.id
      );

      if (cancelled) {
        return;
      }

      if (!result.ok) {
        setAccountBlockedMessage(result.message);
        router.replace("/login");
        return;
      }

      setAccountBlockedMessage(null);
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

  if (routeIsPublicAuth || routeIsPublic) {
    return <>{children}</>;
  }

  if (loading || checkingAuth) {
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

  if (!user && !isDemo) {
    return null;
  }

  if (accountBlockedMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-sunken px-6">
        <p className="max-w-md text-center text-sm text-text-secondary">
          {accountBlockedMessage}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
