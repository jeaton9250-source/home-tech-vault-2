import {
  FileText,
  Home,
  PackageCheck,
  Receipt,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import MarketingPageShell from "@/components/marketing/MarketingPageShell";
import {
  PrimaryMarketingButton,
  SecondaryMarketingButton,
} from "@/components/marketing/MarketingButtons";

const items = [
  {
    title: "Appliances",
    description:
      "Models, serial numbers, purchase dates and important details.",
    icon: PackageCheck,
  },
  {
    title: "Documents",
    description:
      "Manuals, invoices, receipts and important home records.",
    icon: FileText,
  },
  {
    title: "Warranties",
    description:
      "Keep coverage details with the things they belong to.",
    icon: ShieldCheck,
  },
  {
    title: "Maintenance",
    description:
      "Remember what was serviced and when it happened.",
    icon: Wrench,
  },
  {
    title: "Purchases",
    description:
      "Keep receipts and purchase history from disappearing.",
    icon: Receipt,
  },
  {
    title: "Your Home",
    description:
      "Build a useful record that grows with the place you live.",
    icon: Home,
  },
];

export default function WhatItRemembersPage() {
  return (
    <MarketingPageShell
      eyebrow="What Home Tech Vault Remembers"
      title={
        <>
          Your home has
          <br />
          more to remember.
        </>
      }
      description={
        <>
          From the appliances you buy to the
          repairs you make, Home Tech Vault
          gives the important details of your
          home one place to live.
        </>
      }
      actions={
        <>
          <PrimaryMarketingButton href="/signup">
            Start Your Home
          </PrimaryMarketingButton>

          <SecondaryMarketingButton href="/explore">
            Explore HTV
          </SecondaryMarketingButton>
        </>
      }
      visual={
        <div className="rounded-[36px] border border-white/80 bg-white/55 p-5 shadow-[0_30px_90px_rgba(29,47,66,0.12)] backdrop-blur-xl">
          <div className="rounded-[28px] bg-[#142333] p-8 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              Your Home
            </p>

            <h2 className="mt-3 font-serif text-3xl">
              1247 Willow Creek Lane
            </h2>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                "Appliances",
                "Documents",
                "Warranties",
                "Maintenance",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4"
                >
                  <div className="mb-5 h-2 w-2 rounded-full bg-[#a5aa4a]" />

                  <p className="text-sm font-medium">
                    {item}
                  </p>

                  <p className="mt-1 text-xs text-white/40">
                    Organized and ready
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <section className="px-5 py-24 sm:px-6 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-[1380px]">
          <div className="mb-12 max-w-[700px]">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7b8795]">
              One record for your home
            </p>

            <h2 className="mt-4 font-serif text-4xl tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              The details that matter,
              remembered together.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-[28px] border border-[#152335]/[0.07] bg-white/60 p-8 transition duration-300 hover:-translate-y-1 hover:bg-white"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8ecee]">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-8 font-serif text-3xl">
                    {item.title}
                  </h3>

                  <p className="mt-3 leading-7 text-[#687486]">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </MarketingPageShell>
  );
}
