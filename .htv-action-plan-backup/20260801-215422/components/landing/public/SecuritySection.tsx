import Link from "next/link";
import { EyeOff, Laptop, LockKeyhole, ShieldCheck } from "lucide-react";

import { landingTheme } from "@/components/landing/public/landingTheme";

const trustPoints = [
  {
    icon: ShieldCheck,
    title: "Your account, your vault",
    description:
      "Your household information stays connected to the Home Tech Vault account and household you control.",
  },
  {
    icon: Laptop,
    title: "Discovery is optional",
    description:
      "Use Home Tech Vault manually in any browser, or pair the lightweight Mac connector for automatic device discovery.",
  },
  {
    icon: EyeOff,
    title: "We do not sell your personal data",
    description:
      "Home Tech Vault is built to organize your home information, not to turn that information into an advertising profile.",
  },
] as const;

export default function SecuritySection() {
  return (
    <section className="bg-surface-sunken px-5 py-20 md:px-8 lg:px-12">
      <div className={landingTheme.sectionNarrow}>
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-home-health-soft text-home-health">
              <LockKeyhole size={22} aria-hidden />
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-home-health">
              Privacy in plain English
            </p>
            <h2 className="mt-4 text-3xl font-medium tracking-[-0.035em] text-text-primary md:text-5xl">
              Know what Home Tech Vault stores before you connect anything.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-text-secondary">
              Supported platforms, connector behavior, and data handling should
              never be hidden in fine print.
            </p>
            <Link
              href="/trust"
              className="mt-6 inline-flex font-semibold text-interaction underline underline-offset-4"
            >
              Read the Trust Center
            </Link>
          </div>

          <div className="grid gap-4">
            {trustPoints.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-[26px] border border-border-subtle bg-surface-card p-6 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-home-health-soft text-home-health">
                    <Icon size={19} aria-hidden />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">{title}</h3>
                    <p className="mt-2 text-sm leading-7 text-text-secondary">
                      {description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
