"use client";

import {
  ArrowRight,
  BarChart3,
  FileText,
  House,
  Laptop,
  Radar,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { useRouter } from "next/navigation";

import MarketingLayout, {
  MarketingContent,
} from "@/components/marketing/MarketingLayout";
import { useDemoMode } from "@/hooks/useDemoMode";
import { MORGAN_HOUSEHOLD } from "@/lib/demo/morganHousehold";

const demoFeatures = [
  {
    icon: Laptop,
    title: "Device Inventory",
    description:
      "Browse computers, TVs, gaming consoles, appliances, and smart-home devices.",
  },
  {
    icon: House,
    title: "Home View",
    description:
      "See technology organized by rooms throughout the Morgan Household.",
  },
  {
    icon: ShieldCheck,
    title: "Warranty Center",
    description:
      "Review active, expiring, expired, and missing warranties.",
  },
  {
    icon: Wrench,
    title: "Maintenance",
    description:
      "Explore scheduled maintenance and device service history.",
  },
  {
    icon: Radar,
    title: "Network Center",
    description:
      "Preview internet, router, Wi-Fi, and connected-device information.",
  },
  {
    icon: FileText,
    title: "Documents",
    description:
      "View receipts, manuals, warranty records, and household files.",
  },
  {
    icon: BarChart3,
    title: "Reports",
    description:
      "Preview insurance, warranty, and home technology summaries.",
  },
  {
    icon: Sparkles,
    title: "Home Pulse",
    description:
      "See how a fully organized vault keeps an entire home running smoothly.",
  },
];

export default function DemoPage() {
  const router = useRouter();
  const { startDemo } = useDemoMode();

  function enterDemo() {
    startDemo();
    router.push("/dashboard");
  }

  return (
    <MarketingLayout minimalNav>
      <MarketingContent className="py-10 md:py-14">
        <section className="htv-hero-band overflow-hidden rounded-[36px] px-7 py-12 text-text-primary shadow-xl md:px-12 md:py-16">
          <p className="text-overline text-home-health">
            Interactive Demo
          </p>

          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
            Explore the {MORGAN_HOUSEHOLD.name} before creating your vault.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-text-secondary">
            Walk through the Morgan Household — 24 devices, 47 documents,
            18 active warranties, and 8 subscriptions.
          </p>

          <button
            type="button"
            onClick={enterDemo}
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-charcoal px-6 py-4 font-semibold text-surface-card transition hover:brightness-105"
          >
            Start Interactive Demo
            <ArrowRight size={19} />
          </button>
        </section>

        <section className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {demoFeatures.map(
            ({
              icon: Icon,
              title,
              description,
            }) => (
              <article
                key={title}
                className="rounded-3xl border border-border-subtle bg-white p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
                  <Icon size={23} />
                </div>

                <h2 className="mt-5 text-xl font-bold text-text-primary">
                  {title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {description}
                </p>
              </article>
            )
          )}
        </section>
      </MarketingContent>
    </MarketingLayout>
  );
}
