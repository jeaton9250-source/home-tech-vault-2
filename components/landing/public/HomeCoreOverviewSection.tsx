import {
  Activity,
  Archive,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

import { landingTheme } from "@/components/landing/public/landingTheme";

const HOMOS_PILLARS = [
  {
    title: "Organize",
    description:
      "Keep every device, receipt, warranty, manual, and important home technology detail in one place.",
    icon: Archive,
  },
  {
    title: "Monitor",
    description:
      "See what is connected, what is online, and what may need your attention across your home.",
    icon: Activity,
  },
  {
    title: "Control",
    description:
      "Bring supported smart-home and Home Assistant controls into the same experience as your records.",
    icon: SlidersHorizontal,
  },
  {
    title: "Protect",
    description:
      "Stay ahead of expiring warranties, maintenance, missing documents, and technology problems.",
    icon: ShieldCheck,
  },
] as const;

export default function HomeCoreOverviewSection() {
  return (
    <section
      id="homecore"
      className="border-y border-border-subtle bg-surface-sunken/45 px-5 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className={landingTheme.sectionNarrow}>
        <div className="mx-auto max-w-3xl text-center">
          <p className={landingTheme.pill}>
            Meet HomeCore
          </p>

          <h2 className="mt-6 text-3xl font-medium tracking-[-0.035em] text-text-primary sm:text-4xl md:text-5xl">
            One command center for everything that
            keeps your home connected.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-text-secondary md:text-lg">
            HomeCore brings your devices, network,
            documents, warranties, maintenance,
            household access, and smart-home
            controls together in one organized
            home technology command center.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {HOMOS_PILLARS.map((pillar) => {
            const Icon = pillar.icon;

            return (
              <article
                key={pillar.title}
                className="rounded-[24px] border border-border-subtle bg-surface-card p-6 shadow-[var(--shadow-sm)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-home-health-soft text-home-health">
                  <Icon size={19} />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-text-primary">
                  {pillar.title}
                </h3>

                <p className="mt-2 text-sm leading-7 text-text-secondary">
                  {pillar.description}
                </p>
              </article>
            );
          })}
        </div>

        <div className="mt-10 rounded-[26px] border border-border-subtle bg-surface-card px-6 py-6 text-center shadow-[var(--shadow-sm)] md:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-text-muted">
            Home Tech Vault presents
          </p>

          <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-text-primary">
            HomeCore
          </p>

          <p className="mt-2 text-sm leading-6 text-text-secondary">
            The command center for your home
            technology.
          </p>
        </div>
      </div>
    </section>
  );
}
