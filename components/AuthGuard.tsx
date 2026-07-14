"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useDemoMode } from "@/hooks/useDemoMode";

type AuthGuardProps = {
  children: ReactNode;
};

const publicRoutes = [
  "/login",
  "/signup",
  "/demo",
  "/forgot-password",
  "/reset-password",
  "/upgrade",
  "/upgrade/success",
];

export default function AuthGuard({
  children,
}: AuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();

  const {
    user,
    isDemo,
    loading,
  } = useDemoMode();

  const isPublicRoute = publicRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user && !isDemo && !isPublicRoute) {
      router.replace("/login");
    }
  }, [
    user,
    isDemo,
    loading,
    isPublicRoute,
    router,
  ]);

  if (loading && !isPublicRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F5EF]">
        <div className="flex items-center gap-3 text-neutral-500">
          <Loader2
            size={22}
            className="animate-spin"
          />
          Loading Home Tech Vault...
        </div>
      </div>
    );
  }

  if (!user && !isDemo && !isPublicRoute) {
    return null;
  }

  return <>{children}</>;
}