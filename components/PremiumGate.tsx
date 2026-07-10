"use client";

import type { ReactNode } from "react";
import {
  CheckCircle2,
  Loader2,
  LockKeyhole,
  Sparkles,
} from "lucide-react";

import { useSubscription } from "@/hooks/useSubscription";
import PageShell from "@/components/ui/PageShell";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

type PremiumGateProps = {
  children: ReactNode;
  feature: string;
  description?: string;
  requiredPlan?: "pro" | "family";
};

export default function PremiumGate({
  children,
  feature,
  description,
  requiredPlan = "pro",
}: PremiumGateProps) {
  const {
  loading,
  isAdmin,
  isFamily,
  canUsePremiumFeatures,
} = useSubscription();

  if (loading) {
    return (
      <PageShell>
        <PageCard className="flex min-h-64 items-center justify-center">
          <div className="flex items-center gap-3 text-neutral-500">
            <Loader2
              size={22}
              className="animate-spin"
            />
            Checking your subscription...
          </div>
        </PageCard>
      </PageShell>
    );
  }

  const hasAccess =
  isAdmin ||
  (requiredPlan === "family"
    ? isFamily
    : canUsePremiumFeatures);

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <PageShell>
      <PageCard className="overflow-hidden p-0">
        <div className="bg-[#111827] px-6 py-10 text-center text-white md:px-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10">
            <LockKeyhole
              size={30}
              className="text-[#C8A96A]"
            />
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-[#C8A96A]">
            {requiredPlan === "family"
              ? "Family Feature"
              : "Pro Feature"}
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            Unlock {feature}
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/70">
            {description ||
              `${feature} requires a Home Tech Vault ${
                requiredPlan === "family"
                  ? "Family"
                  : "Pro"
              } subscription.`}
          </p>
        </div>

        <div className="p-6 md:p-10">
          <div className="mx-auto max-w-xl">
            <div className="flex items-center gap-3">
              <Sparkles
                size={21}
                className="text-[#C8A96A]"
              />

              <h2 className="text-xl font-bold text-[#111827]">
                Upgrade your vault
              </h2>
            </div>

            <div className="mt-6 space-y-4">
              <Benefit text="Unlimited device tracking" />
              <Benefit text="Network device discovery" />
              <Benefit text="Advanced reports and analytics" />
              <Benefit text="Insurance-ready exports" />
              <Benefit text="Smart recommendations" />

              {requiredPlan === "family" && (
                <Benefit text="Household sharing and permissions" />
              )}
            </div>

            <Button
              href="/upgrade"
              className="mt-8 w-full justify-center"
            >
              <Sparkles size={18} />
              View Upgrade Options
            </Button>
          </div>
        </div>
      </PageCard>
    </PageShell>
  );
}

function Benefit({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#F7F5EF] p-4">
      <CheckCircle2
        size={19}
        className="shrink-0 text-[#C8A96A]"
      />

      <p className="font-medium text-[#111827]">
        {text}
      </p>
    </div>
  );
}