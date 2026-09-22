"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export default function RefreshDashboard() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      aria-busy={pending}
      onClick={() => startTransition(() => router.refresh())}
    >
      <RefreshCw
        size={15}
        aria-hidden="true"
        className={pending ? "animate-spin motion-reduce:animate-none" : ""}
      />
      <span aria-live="polite">
        {pending ? "Refreshing…" : "Refresh overview"}
      </span>
    </button>
  );
}
