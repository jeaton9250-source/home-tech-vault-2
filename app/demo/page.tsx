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

const demoFeatures = [
  {
    icon: Laptop,
    title: "Device Inventory",
    description:
      "Browse computers, televisions, smart-home devices, and network equipment.",
  },
  {
    icon: House,
    title: "Home View",
    description:
      "See technology organized by rooms throughout a sample home.",
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
      "View examples of receipts, manuals, and warranty records.",
  },
  {
    icon: BarChart3,
    title: "Reports",
    description:
      "Preview technology health, protected value, and inventory insights.",
  },
  {
    icon: Sparkles,
    title: "Premium Tools",
    description:
      "Explore advanced Home Tech Vault automation and premium features.",
  },
];

export default function DemoPage() {
  function enterDemo() {
    window.localStorage.setItem(
      "home-tech-vault-demo",
      "true"
    );

    window.location.assign("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#F7F5EF] px-5 py-10 md:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-[36px] bg-[#111827] px-7 py-12 text-white shadow-xl md:px-12 md:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C8A96A]">
            Interactive Product Tour
          </p>

          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
            Explore Home Tech Vault before creating an account.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
            Click through a complete sample vault containing devices,
            warranties, subscriptions, maintenance records, documents,
            and network details.
          </p>

          <button
            type="button"
            onClick={enterDemo}
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#C8A96A] px-6 py-4 font-semibold text-[#111827] transition hover:brightness-105"
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
                className="rounded-3xl border border-[#E8E2D6] bg-white p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
                  <Icon size={23} />
                </div>

                <h2 className="mt-5 text-xl font-bold text-[#111827]">
                  {title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  {description}
                </p>
              </article>
            )
          )}
        </section>
      </div>
    </main>
  );
}