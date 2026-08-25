"use client";

import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Home,
  PackageSearch,
  Receipt,
  ShieldCheck,
  Sparkles,
  Users,
  Wifi,
  Wrench,
} from "lucide-react";

import MarketingLayout from "@/components/marketing/MarketingLayout";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";

const features = [
  {
    icon: Home,
    eyebrow: "Home Inventory",
    title: "Know what you own.",
    description:
      "Keep appliances, electronics, model numbers, serial numbers, purchase details, locations, and other useful information connected to the things in your home.",
    href: "/home-inventory-software",
    linkLabel: "Explore home inventory",
  },
  {
    icon: FileText,
    eyebrow: "Home Documents",
    title: "Keep the paperwork with the thing it belongs to.",
    description:
      "Save receipts, manuals, proof of purchase, service records, and important household documents so you are not searching through email when you need them.",
    href: "/home-document-organizer",
    linkLabel: "Explore home documents",
  },
  {
    icon: ShieldCheck,
    eyebrow: "Warranties",
    title: "Know what is still protected.",
    description:
      "Track warranty dates, coverage information, receipts, serial numbers, and supporting documents in one organized record.",
    href: "/warranty-tracker",
    linkLabel: "Explore warranty tracking",
  },
  {
    icon: Wrench,
    eyebrow: "Maintenance",
    title: "Remember the little things your home needs.",
    description:
      "Keep maintenance history and recurring household tasks together so filters, servicing, cleaning, and other upkeep are easier to remember.",
    href: "/features",
    linkLabel: null,
  },
  {
    icon: Wifi,
    eyebrow: "Home Wi-Fi",
    title: "Keep your internet details somewhere useful.",
    description:
      "Save router information, internet provider details, Wi-Fi notes, connected-device information, and other network details without turning your home into an IT project.",
    href: "/network-documentation",
    linkLabel: "Explore Home Wi-Fi",
  },
  {
    icon: Sparkles,
    eyebrow: "Smart Import",
    title: "Spend less time typing everything in.",
    description:
      "Give Home Tech Vault the information you already have and let it help identify devices, manufacturers, models, manuals, and useful details.",
    href: MARKETING_ROUTES.demo,
    linkLabel: "See how it works",
  },
  {
    icon: Users,
    eyebrow: "Household Sharing",
    title: "Give your household one place to look.",
    description:
      "Share access with the people who help manage your home while keeping your home records organized in one central vault.",
    href: "/family",
    linkLabel: "Learn about household access",
  },
  {
    icon: PackageSearch,
    eyebrow: "One Organized Vault",
    title: "Everything stays connected.",
    description:
      "Instead of keeping receipts in email, manuals in drawers, warranty dates in your head, and appliance details in separate notes, keep the useful pieces together.",
    href: MARKETING_ROUTES.signup,
    linkLabel: "Start my home vault",
  },
] as const;

const moments = [
  {
    icon: Receipt,
    title: "Something breaks",
    text: "Find the model, receipt, manual, warranty, and other useful details without hunting through the house.",
  },
  {
    icon: ShieldCheck,
    title: "You need proof",
    text: "Pull up purchase information and supporting documents when a warranty, service call, or claim needs them.",
  },
  {
    icon: Wrench,
    title: "It is time for maintenance",
    text: "Keep useful service history and recurring home tasks from disappearing into forgotten notes.",
  },
];

export default function FeaturesPageContent() {
  return (
    <MarketingLayout>
      <section className="border-b border-[#17212a]/10 bg-[#f5f1e8] px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1180px]">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-7 bg-[#617c43]" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#617c43]">
                Everything in one place
              </p>
            </div>

            <h1 className="mt-6 max-w-4xl font-serif text-5xl font-medium leading-[0.98] tracking-[-0.05em] text-[#17212a] sm:text-6xl lg:text-7xl">
              Your entire home.
              <br />
              <span className="text-[#617c43]">
                One organized vault.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#68716c]">
              Home Tech Vault keeps the information that comes with your home
              together — devices, documents, warranties, maintenance, Home
              Wi-Fi, receipts, manuals, and the details you will want later.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href={MARKETING_ROUTES.signup}
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-[#617c43] px-7 text-sm font-semibold text-white transition hover:bg-[#718d4f]"
              >
                Start My Home Vault
                <ArrowRight size={16} aria-hidden />
              </Link>

              <Link
                href={MARKETING_ROUTES.demo}
                className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-[#17212a]/15 bg-[#fffdf8] px-7 text-sm font-semibold text-[#17212a] transition hover:bg-white"
              >
                See an Example
              </Link>
            </div>

            <p className="mt-4 text-sm text-[#8e9690]">
              Free to start · No credit card required
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-[#17212a]/10 bg-[#fffdf8] px-5 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1180px]">
          <div className="max-w-3xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#617c43]">
              How it works
            </p>

            <h2 className="mt-5 font-serif text-4xl font-medium leading-[1.04] tracking-[-0.04em] text-[#17212a] sm:text-5xl">
              Add it once. Find it when you need it.
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-8 text-[#68716c]">
              Home Tech Vault works like a digital home binder. Start small,
              keep the useful details together, and build your vault over time.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <article className="rounded-[26px] border border-[#ded7ca] bg-[#f5f1e8] p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf2e7] text-[#617c43]">
                <Home size={18} aria-hidden />
              </div>

              <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8e9690]">
                Step 01
              </p>

              <h3 className="mt-2 font-serif text-2xl text-[#17212a]">
                Add something from your home.
              </h3>

              <p className="mt-3 text-sm leading-7 text-[#68716c]">
                Start with one appliance, device, receipt, warranty, document,
                or home record you would hate to lose track of.
              </p>
            </article>

            <article className="rounded-[26px] border border-[#ded7ca] bg-[#f5f1e8] p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf2e7] text-[#617c43]">
                <FileText size={18} aria-hidden />
              </div>

              <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8e9690]">
                Step 02
              </p>

              <h3 className="mt-2 font-serif text-2xl text-[#17212a]">
                Keep the useful details together.
              </h3>

              <p className="mt-3 text-sm leading-7 text-[#68716c]">
                Connect receipts, manuals, warranty details, serial numbers,
                maintenance notes, and purchase information to the record they
                belong to.
              </p>
            </article>

            <article className="rounded-[26px] border border-[#ded7ca] bg-[#f5f1e8] p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf2e7] text-[#617c43]">
                <PackageSearch size={18} aria-hidden />
              </div>

              <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8e9690]">
                Step 03
              </p>

              <h3 className="mt-2 font-serif text-2xl text-[#17212a]">
                Find it when something happens.
              </h3>

              <p className="mt-3 text-sm leading-7 text-[#68716c]">
                When something breaks, needs service, gets replaced, or
                requires proof of purchase, you already know where to look.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1180px]">
          <div className="max-w-3xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#617c43]">
              What belongs in your vault
            </p>

            <h2 className="mt-5 font-serif text-4xl font-medium leading-[1.04] tracking-[-0.04em] text-[#17212a] sm:text-5xl">
              The things that are easy to lose track of.
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-8 text-[#68716c]">
              You do not need another complicated home-management system. You
              need one reliable place for the information you already have.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.eyebrow}
                  className="group rounded-[28px] border border-[#ded7ca] bg-[#fffdf8] p-7 shadow-[0_18px_50px_-40px_rgba(15,25,35,0.35)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_25px_60px_-40px_rgba(15,25,35,0.4)] sm:p-8"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf2e7] text-[#617c43]">
                    <Icon size={20} strokeWidth={1.8} aria-hidden />
                  </div>

                  <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.17em] text-[#617c43]">
                    {feature.eyebrow}
                  </p>

                  <h3 className="mt-2 font-serif text-2xl font-medium leading-tight text-[#17212a] sm:text-3xl">
                    {feature.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-[#68716c] sm:text-base">
                    {feature.description}
                  </p>

                  {feature.linkLabel ? (
                    <Link
                      href={feature.href}
                      className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#617c43] transition hover:text-[#718d4f]"
                    >
                      {feature.linkLabel}
                      <ArrowRight
                        size={14}
                        className="transition-transform group-hover:translate-x-1"
                        aria-hidden
                      />
                    </Link>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#183047] px-5 py-20 text-[#f5f1e8] md:px-8 md:py-28">
        <div className="mx-auto max-w-[1180px]">
          <div className="max-w-3xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9bb27a]">
              When it becomes useful
            </p>

            <h2 className="mt-5 font-serif text-4xl font-medium leading-[1.04] tracking-[-0.04em] sm:text-5xl">
              You organize it once.
              <br />
              You appreciate it later.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {moments.map((moment) => {
              const Icon = moment.icon;

              return (
                <article
                  key={moment.title}
                  className="rounded-[26px] border border-white/10 bg-white/[0.04] p-7"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#9bb27a]/10 text-[#9bb27a]">
                    <Icon size={18} aria-hidden />
                  </div>

                  <h3 className="mt-6 font-serif text-2xl">
                    {moment.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-white/60">
                    {moment.text}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1040px] rounded-[36px] bg-[#617c43] px-7 py-16 text-center text-white shadow-[0_30px_70px_-40px_rgba(45,60,35,0.6)] sm:px-12 sm:py-20">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/65">
            Start simple
          </p>

          <h2 className="mx-auto mt-5 max-w-3xl font-serif text-4xl font-medium leading-[1.03] tracking-[-0.04em] sm:text-5xl">
            Start with one thing you would hate to lose.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/75">
            Add a refrigerator, receipt, warranty, appliance manual, or another
            important home record. Your Vault can grow as you need it.
          </p>

          <Link
            href={MARKETING_ROUTES.signup}
            className="mt-8 inline-flex min-h-[54px] items-center justify-center gap-2 rounded-full bg-[#fffdf8] px-8 text-sm font-semibold text-[#40502f] transition hover:bg-white"
          >
            Create My Free Vault
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
