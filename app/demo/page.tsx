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
    <main className="min-h-screen bg-surface-sunken px-5 py-10 md:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="htv-hero-band overflow-hidden rounded-[36px] px-7 py-12 text-text-primary shadow-xl md:px-12 md:py-16">
          <p className="text-overline text-home-health">
            Interactive Product Tour
          </p>

          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
            Explore Home Tech Vault before creating an account.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-text-secondary">
            Click through a complete sample vault containing devices,
            warranties, subscriptions, maintenance records, documents,
            and network details.
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
      </div>
    </main>
  );
}