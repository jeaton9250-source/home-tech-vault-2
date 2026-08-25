import type { Metadata } from "next";
import Link from "next/link";

import {
  ArrowRight,
  Check,
  FileText,
  Home,
  KeyRound,
  PackageCheck,
  Receipt,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import { MARKETING_ROUTES } from "@/lib/marketing/routes";

export const metadata: Metadata = {
  title: "New Homeowner Organizer | Home Tech Vault",
  description:
    "Keep the important details about your new home together from day one — appliances, warranties, receipts, manuals, maintenance records, and home documents.",
};

const firstThings = [
  "Refrigerator and major kitchen appliances",
  "Washer and dryer",
  "HVAC system and thermostat",
  "Water heater",
  "TVs and home electronics",
  "Smart-home and security devices",
  "Receipts and warranties",
  "Important home documents",
];

const savedItems = [
  {
    icon: PackageCheck,
    title: "Kitchen refrigerator",
    detail: "Model number, serial number, purchase details",
  },
  {
    icon: ShieldCheck,
    title: "Appliance warranty",
    detail: "Coverage information saved",
  },
  {
    icon: Receipt,
    title: "Purchase receipt",
    detail: "Easy to find when you need it",
  },
  {
    icon: Wrench,
    title: "HVAC filter",
    detail: "Next replacement date remembered",
  },
];

export default function NewHomeownerPage() {
  return (
    <div className="min-h-screen bg-[#f5f1e8] text-[#17212a]">
      {/* HEADER */}
      <header className="border-b border-[#17212a]/10 bg-[#f5f1e8]/95">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-5 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#617c43]/10 text-[#617c43]">
              <Home size={18} />
            </div>

            <div>
              <p className="font-serif text-base font-medium">
                Home Tech Vault
              </p>
              <p className="text-[9px] uppercase tracking-[0.16em] text-[#778078]">
                For your new home
              </p>
            </div>
          </Link>

          <Link
            href={MARKETING_ROUTES.signup}
            className="rounded-full bg-[#617c43] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#718d4f]"
          >
            Set Up My Vault
          </Link>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden px-5 py-20 md:px-8 md:py-28">
          <div className="pointer-events-none absolute right-[-180px] top-[-150px] h-[520px] w-[520px] rounded-full bg-[#718d4f]/10 blur-[120px]" />

          <div className="relative mx-auto grid max-w-[1180px] gap-16 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-2 shadow-sm ring-1 ring-[#17212a]/5">
                <KeyRound size={14} className="text-[#617c43]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#617c43]">
                  Welcome home
                </span>
              </div>

              <h1 className="mt-8 max-w-[720px] font-serif text-[3.4rem] font-medium leading-[0.98] tracking-[-0.055em] sm:text-[4.5rem] lg:text-[5.4rem]">
                You&apos;ve got the keys.
                <br />
                <span className="text-[#617c43]">
                  Now keep the important stuff together.
                </span>
              </h1>

              <p className="mt-7 max-w-[640px] text-lg leading-8 text-[#5f6863]">
                Your new home comes with more paperwork, appliances,
                warranties, manuals, receipts, and little details than you
                realize. Home Tech Vault gives you one simple place to keep the
                things you&apos;ll want later.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={MARKETING_ROUTES.signup}
                  className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-[#617c43] px-7 text-sm font-semibold text-white shadow-[0_16px_35px_-18px_rgba(97,124,67,0.8)] transition hover:bg-[#718d4f]"
                >
                  Set Up My Home Vault
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href={MARKETING_ROUTES.demo}
                  className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-[#17212a]/15 bg-white/50 px-7 text-sm font-semibold transition hover:bg-white"
                >
                  See an Example
                </Link>
              </div>

              <p className="mt-5 text-sm text-[#7b827e]">
                No credit card required. Start with just one thing.
              </p>
            </div>

            {/* DIGITAL HOME BINDER */}
            <div className="relative">
              <div className="absolute -inset-8 -z-10 rounded-[40px] bg-[#617c43]/8 blur-3xl" />

              <div className="rotate-[1deg] rounded-[30px] bg-[#e7dfd0] p-3 shadow-[0_35px_80px_-40px_rgba(38,45,39,0.45)]">
                <div className="-rotate-[1deg] overflow-hidden rounded-[25px] border border-[#17212a]/10 bg-[#fffdf8]">
                  <div className="border-b border-[#17212a]/10 px-7 py-6">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#778078]">
                      My New Home
                    </p>

                    <h2 className="mt-2 font-serif text-3xl">
                      My Home Binder
                    </h2>

                    <p className="mt-2 text-sm text-[#6c746f]">
                      The things I don&apos;t want to lose track of.
                    </p>
                  </div>

                  <div className="p-6 sm:p-7">
                    <div className="space-y-3">
                      {savedItems.map((item) => {
                        const Icon = item.icon;

                        return (
                          <div
                            key={item.title}
                            className="flex items-start gap-4 rounded-2xl bg-[#f6f2e9] p-4"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#617c43]/10 text-[#617c43]">
                              <Icon size={17} />
                            </div>

                            <div>
                              <p className="font-medium">
                                {item.title}
                              </p>

                              <p className="mt-1 text-sm leading-6 text-[#747c77]">
                                {item.detail}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-5 rounded-2xl border border-dashed border-[#617c43]/25 bg-[#617c43]/5 px-5 py-4">
                      <p className="font-serif text-lg text-[#46553a]">
                        Add things as you settle in.
                      </p>

                      <p className="mt-1 text-sm leading-6 text-[#6d756f]">
                        There&apos;s no need to organize your whole house today.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PERSONAL NOTE */}
        <section className="px-5 py-10 md:px-8">
          <div className="mx-auto max-w-[900px] rounded-[30px] bg-[#e7dfd0] px-7 py-10 text-center sm:px-12">
            <p className="font-serif text-2xl leading-10 text-[#354033] sm:text-3xl">
              Buying a home gives you keys.
              <br className="hidden sm:block" />
              It doesn&apos;t give you a system for remembering everything that
              comes with it.
            </p>
          </div>
        </section>

        {/* START HERE */}
        <section className="px-5 py-24 md:px-8 md:py-32">
          <div className="mx-auto grid max-w-[1100px] gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#617c43]">
                Start here
              </p>

              <h2 className="mt-5 font-serif text-4xl font-medium leading-[1.05] tracking-[-0.04em] sm:text-5xl">
                You don&apos;t need to organize everything today.
              </h2>

              <p className="mt-6 max-w-lg text-base leading-8 text-[#68716c]">
                Start with the things you&apos;d hate to search for later. A few
                minutes now can save a lot of frustration when something breaks,
                needs service, or requires proof of purchase.
              </p>
            </div>

            <div className="rounded-[30px] bg-[#fffdf8] p-6 shadow-[0_25px_60px_-45px_rgba(15,25,35,0.35)] sm:p-8">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-[#617c43]" />

                <p className="font-serif text-2xl">
                  A good first-day list
                </p>
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                {firstThings.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#617c43]/10 text-[#617c43]">
                      <Check size={12} strokeWidth={2.2} />
                    </div>

                    <span className="text-sm leading-6 text-[#59625d]">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* WHY IT MATTERS */}
        <section className="bg-[#183047] px-5 py-24 text-[#f7f3eb] md:px-8 md:py-32">
          <div className="mx-auto max-w-[1100px]">
            <div className="max-w-3xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9bb27a]">
                You&apos;ll thank yourself later
              </p>

              <h2 className="mt-5 font-serif text-4xl font-medium leading-[1.05] tracking-[-0.04em] sm:text-5xl">
                When something breaks, you already know where to look.
              </h2>
            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-3">
              <StoryCard
                number="01"
                title="The refrigerator stops cooling."
                text="Pull up the model, receipt, warranty, and manual without digging through email."
              />

              <StoryCard
                number="02"
                title="The HVAC needs service."
                text="Keep past maintenance and system details together so you have useful context."
              />

              <StoryCard
                number="03"
                title="You replace something."
                text="Add the new purchase and keep the history of your home growing over time."
              />
            </div>
          </div>
        </section>

        {/* SIMPLE PROMISE */}
        <section className="px-5 py-24 md:px-8 md:py-32">
          <div className="mx-auto max-w-[1000px] text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#617c43]">
              Your digital home binder
            </p>

            <h2 className="mx-auto mt-5 max-w-3xl font-serif text-4xl font-medium leading-[1.04] tracking-[-0.045em] sm:text-5xl">
              Keep what matters. Find it when you need it.
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#68716c]">
              Home Tech Vault isn&apos;t about turning your home into a project.
              It&apos;s simply a place to keep the details that are easy to
              forget and annoying to find later.
            </p>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-5 pb-20 md:px-8 md:pb-28">
          <div className="mx-auto max-w-[1040px] overflow-hidden rounded-[36px] bg-[#617c43] px-7 py-16 text-center text-white shadow-[0_30px_70px_-40px_rgba(45,60,35,0.6)] sm:px-12 sm:py-20">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
              <Home size={22} />
            </div>

            <h2 className="mx-auto mt-7 max-w-3xl font-serif text-4xl font-medium leading-[1.03] tracking-[-0.04em] sm:text-5xl">
              Make your new home a little easier to manage.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/75">
              Start with one appliance, warranty, receipt, or document. Your
              Vault can grow with your home.
            </p>

            <Link
              href={MARKETING_ROUTES.signup}
              className="mt-8 inline-flex min-h-[54px] items-center justify-center gap-2 rounded-full bg-[#fffdf8] px-8 text-sm font-semibold text-[#40502f] transition hover:bg-white"
            >
              Set Up My Home Vault
              <ArrowRight size={16} />
            </Link>

            <p className="mt-4 text-xs text-white/60">
              Free to start. No credit card required.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#17212a]/10 px-5 py-8 md:px-8">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-[#7b827e]">
            © 2026 Home Tech Vault
          </p>

          <div className="flex gap-5 text-xs text-[#68716c]">
            <Link href="/privacy" className="hover:text-[#17212a]">
              Privacy
            </Link>

            <Link href="/security" className="hover:text-[#17212a]">
              Security
            </Link>

            <Link href="/" className="hover:text-[#17212a]">
              Home Tech Vault
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StoryCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-7">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9bb27a]">
        {number}
      </p>

      <h3 className="mt-5 font-serif text-2xl leading-tight">
        {title}
      </h3>

      <p className="mt-4 text-sm leading-7 text-white/60">
        {text}
      </p>
    </div>
  );
}
