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
    <div className="sticky top-0 z-50 border-b border-[#D8C69D] bg-[#FFF8E8] px-4 py-3">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#111827] text-[#C8A96A]">
            <Sparkles size={18} />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#111827]">
              You are viewing an interactive demo.
            </p>

            <p className="text-xs text-neutral-600">
              Sample changes are not permanently saved.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/signup")}
            className="inline-flex items-center gap-2 rounded-xl bg-[#111827] px-4 py-2 text-sm font-semibold text-white"
          >
            <LogIn size={16} />
            Create Your Vault
          </button>

          <button
            type="button"
            onClick={leaveDemo}
            aria-label="Exit demo"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-neutral-600 hover:bg-black/5"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}