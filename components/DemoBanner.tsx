"use client";

import { useRouter } from "next/navigation";
import {
  LogIn,
  Sparkles,
  X,
} from "lucide-react";

import { useDemoMode } from "@/hooks/useDemoMode";

export default function DemoBanner() {
  const router = useRouter();

  const {
    isDemo,
    user,
    loading,
    exitDemo,
  } = useDemoMode();

  if (loading || user || !isDemo) {
    return null;
  }

  function leaveDemo() {
    exitDemo();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="sticky top-0 z-50 border-b border-interaction/20 bg-interaction-soft px-4 py-3">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-charcoal text-surface-card">
            <Sparkles size={18} />
          </div>

          <div>
            <p className="text-sm font-medium text-text-primary">
              You are viewing an interactive demo.
            </p>

            <p className="text-xs text-text-secondary">
              Sample changes are not permanently saved.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/signup")}
            className="inline-flex items-center gap-2 rounded-[var(--radius-button)] bg-charcoal px-4 py-2 text-sm font-medium text-surface-card hover:bg-charcoal-hover"
          >
            <LogIn size={16} />
            Create Your Vault
          </button>

          <button
            type="button"
            onClick={leaveDemo}
            aria-label="Exit demo"
            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-button)] text-text-secondary hover:bg-surface-card"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
