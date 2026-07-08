"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);

  const protectedPaths = [
    "/devices/add",
    "/subscriptions/add",
    "/documents/upload",
    "/network/edit",
  ];

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const isProtected =
        protectedPaths.includes(pathname) ||
        pathname.includes("/edit");

      if (!user && isProtected) {
        window.location.href = "/login";
        return;
      }

      if (user && pathname === "/login") {
        window.location.href = "/";
        return;
      }

      setAllowed(true);
    }

    checkUser();
  }, [pathname]);

  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}