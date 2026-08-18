import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import LandingFooter from "@/components/landing/public/LandingFooter";
import LandingHeader from "@/components/landing/public/LandingHeader";

export const metadata: Metadata = {
  title: "Compare Home Tech Vault | Sortly, HomeZada, and Home Assistant",
  description:
    "Compare Home Tech Vault with Sortly, HomeZada, and Home Assistant based on home technology inventory, warranties, documents, discovery, and automation.",
  alternates: { canonical: "https://www.hometechvault.com/compare" },
};

const comparisons = [
  {
    title: "Home Tech Vault vs. Sortly",
    href: "/compare/home-tech-vault-vs-sortly",
    description:
      "A home-technology-specific vault compared with a broader inventory platform.",
  },
  {
    title: "Home Tech Vault vs. HomeZada",
    href: "/compare/home-tech-vault-vs-homezada",
    description:
      "Focused technology organization compared with whole-home management software.",
  },
  {
    title: "Home Tech Vault vs. Home Assistant",
    href: "/compare/home-tech-vault-vs-home-assistant",
    description:
      "Inventory and warranty organization compared with a smart-home automation platform.",
  },
] as const;

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-surface-base">
      <LandingHeader />
      <main className="px-5 py-16 md:px-8 md:py-24 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-home-health">
              Honest comparisons
            </p>
            <h1 className="mt-4 text-4xl font-medium tracking-[-0.04em] text-text-primary md:text-6xl">
              Choose the tool that matches the job.
            </h1>
            <p className="mt-6 text-lg leading-8 text-text-secondary">
              Home Tech Vault is not the best tool for every use case. These pages
              explain where it fits and where another platform may be the better choice.
            </p>
          </div>

          <div className="mt-12 grid gap-5">
            {comparisons.map((comparison) => (
              <Link
                key={comparison.href}
                href={comparison.href}
                className="group rounded-[28px] border border-border-subtle bg-surface-card p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="flex items-center justify-between gap-5">
                  <div>
                    <h2 className="text-xl font-semibold text-text-primary">
                      {comparison.title}
                    </h2>
                    <p className="mt-2 leading-7 text-text-secondary">
                      {comparison.description}
                    </p>
                  </div>
                  <ArrowRight
                    size={20}
                    className="shrink-0 text-home-health transition group-hover:translate-x-1"
                    aria-hidden
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
