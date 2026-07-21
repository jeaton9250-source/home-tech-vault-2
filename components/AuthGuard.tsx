"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useDemoMode } from "@/hooks/useDemoMode";
import {
  isProtectedRoute,
  isPublicRoute,
  normalizePathname,
} from "@/lib/isChromeFreeRoute";

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

  const routeIsPublic =
    isPublicRoute(normalizedPath);
  const routeIsProtected =
    isProtectedRoute(normalizedPath);

  useEffect(() => {
    if (!routeIsProtected) {
      return;
    }

    if (loading) {
      return;
    }

    if (!user && !isDemo) {
      router.replace("/login");
    }
  }, [
    user,
    isDemo,
    loading,
    routeIsProtected,
    router,
  ]);

  if (routeIsPublic) {
    return <>{children}</>;
  }

  if (loading) {
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

  return <>{children}</>;
}
