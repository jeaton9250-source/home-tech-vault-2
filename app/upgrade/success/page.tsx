"use client";

import {
  CheckCircle2,
  LayoutDashboard,
} from "lucide-react";

import PageShell from "@/components/ui/PageShell";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

export default function UpgradeSuccessPage() {
  return (
    <PageShell>
      <PageCard className="mx-auto max-w-2xl text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700">
          <CheckCircle2 size={38} />
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#C8A96A]">
          Payment Successful
        </p>

        <h1 className="mt-3 text-4xl font-bold text-[#111827]">
          Welcome to Home Tech Vault Pro
        </h1>

        <p className="mx-auto mt-4 max-w-lg leading-7 text-neutral-500">
          Stripe successfully completed your checkout. Your
          subscription access will activate as soon as the Stripe
          webhook updates your account.
        </p>

        <Button
          href="/dashboard"
          className="mt-8 justify-center"
        >
          <LayoutDashboard size={18} />
          Return to Dashboard
        </Button>
      </PageCard>
    </PageShell>
  );
}