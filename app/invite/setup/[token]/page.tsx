"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LegacyTokenInviteSetupRedirectPage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();

  useEffect(() => {
    void (async () => {
      router.replace("/invite/setup");
    })();
  }, [router, params.token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-base px-6">
      <div className="flex items-center gap-3 text-text-secondary">
        <Loader2 size={22} className="animate-spin" />
        Redirecting to account setup…
      </div>
    </main>
  );
}
