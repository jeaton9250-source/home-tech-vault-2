"use client";

import Link from "next/link";

import { useDemoMode } from "@/hooks/useDemoMode";
import { MORGAN_HOUSEHOLD } from "@/lib/demo/morganHousehold";

export default function DemoBanner() {
  const {
    isDemo,
    user,
    loading,
  } = useDemoMode();

  if (loading || user || !isDemo) {
    return null;
  }

  return (
    <div
      className="sticky top-0 z-50 border-b border-border-subtle bg-surface-sunken/95 px-4 py-2.5 backdrop-blur-sm"
      data-tour="demo-banner"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-secondary">
          <span aria-hidden>🏠 </span>
          <span className="font-medium text-text-primary">
            Interactive Demo
          </span>
          {" · "}
          You&apos;re exploring the {MORGAN_HOUSEHOLD.name}.{" "}
          <Link
            href="/signup"
            className="font-medium text-interaction underline-offset-2 hover:underline"
          >
            Create your own Home Tech Vault
          </Link>{" "}
          whenever you&apos;re ready.
        </p>
      </div>
    </div>
  );
}
