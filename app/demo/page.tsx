"use client";

import {
  ArrowRight,
  Check,
  FileText,
  Home,
  KeyRound,
  ReceiptText,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import MarketingLayout, {
  MarketingContent,
} from "@/components/marketing/MarketingLayout";
import { useDemoMode } from "@/hooks/useDemoMode";

const homeDetails = [
  {
    title: "The dishwasher",
    detail: "Model, serial number, receipt, manual and warranty.",
    icon: ReceiptText,
  },
  {
    title: "The HVAC system",
    detail: "Installation details, service history and coverage.",
    icon: Wrench,
  },
  {
    title: "Important home files",
    detail: "Receipts, manuals and documents kept where they belong.",
    icon: FileText,
  },
  {
    title: "What needs attention",
    detail: "Maintenance and warranty information before it gets forgotten.",
    icon: ShieldCheck,
  },
];

const moments = [
  {
    number: "01",
    question: "Something breaks.",
    answer:
      "Find the model number, receipt, manual and warranty without searching through drawers or old email.",
  },
  {
    number: "02",
    question: "It is time for service.",
    answer:
      "See what was done before and keep the next repair connected to the home.",
  },
  {
    number: "03",
    question: "You need a document.",
    answer:
      "Open the home record and find the file beside the appliance or part of the house it belongs to.",
  },
  {
    number: "04",
    question: "The home changes hands.",
    answer:
      "Useful history can stay with the property instead of starting over with the next owner.",
  },
];

export default function DemoPage() {
  const { startDemo } = useDemoMode();

  function enterDemo() {
    startDemo();

    /*
     * Demo mode is stored in the browser. A full navigation lets every
     * provider and route guard read that flag before the protected
     * dashboard renders, avoiding a race that can send visitors to login.
     */
    window.location.assign("/dashboard");
  }

  return (
    <MarketingLayout minimalNav>
      <MarketingContent className="py-0">

        {/* HERO */}
        <section className="relative overflow-hidden px-0 pb-24 pt-20 sm:pt-24 lg:pb-32 lg:pt-28">
          <div className="pointer-events-none absolute -right-48 top-0 h-[560px] w-[560px] rounded-full bg-[#dce5e3]/70 blur-[130px]" />
          <div className="pointer-events-none absolute -left-48 bottom-0 h-[420px] w-[420px] rounded-full bg-white blur-[120px]" />

          <div className="relative grid gap-16 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
            <div className="max-w-[680px]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7f8a95]">
                Step inside a sample home
              </p>

              <h1 className="mt-6 font-serif text-[52px] leading-[0.98] tracking-[-0.055em] text-[#17212a] sm:text-[68px] lg:text-[78px]">
                See what it feels like
                <br />
                when your home
                <br />
                <span className="text-[#7c8553]">
                  remembers.
                </span>
              </h1>

              <p className="mt-8 max-w-[610px] text-lg leading-8 text-[#65707a]">
                Walk through a fully prepared sample home and see how
                appliances, warranties, manuals, documents and maintenance
                history can stay connected to the place they belong.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={enterDemo}
                  className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-full bg-[#17283a] px-8 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#243a50]"
                >
                  Walk through the sample home
                  <ArrowRight className="h-4 w-4" />
                </button>

                <span className="px-2 text-sm text-[#818a92]">
                  No account required.
                </span>
              </div>
            </div>

            {/* HOME RECORD */}
            <div className="relative mx-auto w-full max-w-[560px]">
              <div className="absolute -inset-10 rounded-full bg-white/55 blur-3xl" />

              <div className="relative overflow-hidden rounded-[34px] border border-white/80 bg-white/70 p-4 shadow-[0_38px_100px_rgba(30,43,54,0.11)] backdrop-blur-xl sm:p-5">
                <div className="overflow-hidden rounded-[28px] bg-[#162638]">
                  <div className="px-7 pb-8 pt-7 sm:px-9 sm:pb-9">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.07]">
                          <Home className="h-4 w-4 text-white/70" />
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                            Sample home
                          </p>
                          <p className="mt-1 text-sm font-medium text-white">
                            Morgan Household
                          </p>
                        </div>
                      </div>

                      <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-[10px] text-white/45">
                        Ready to explore
                      </span>
                    </div>

                    <div className="mt-10">
                      <p className="font-serif text-[34px] leading-tight tracking-[-0.035em] text-white sm:text-[42px]">
                        The useful history
                        <br />
                        of a home.
                      </p>

                      <p className="mt-4 max-w-[420px] text-sm leading-6 text-white/45">
                        Not a folder of random files. A record where useful
                        information stays connected to the home.
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-white/[0.07] px-7 py-6 sm:px-9">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                      {[
                        "Appliances",
                        "Warranties",
                        "Documents",
                        "Maintenance",
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-2.5 text-sm text-white/60"
                        >
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#aeb56d]/15">
                            <Check className="h-3 w-3 text-[#c8cd7d]" />
                          </div>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#f1efe8] px-7 py-6 text-[#17212a] sm:px-9">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b949c]">
                          Your tour
                        </p>
                        <p className="mt-1 font-serif text-xl">
                          Everything is already filled in.
                        </p>
                      </div>

                      <KeyRound className="h-5 w-5 text-[#65717c]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PHILOSOPHY */}
        <section className="border-t border-[#17212a]/[0.07] py-24 lg:py-36">
          <div className="grid gap-14 lg:grid-cols-[1.12fr_0.88fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#87919a]">
                Why it exists
              </p>

              <h2 className="mt-6 max-w-[760px] font-serif text-[48px] leading-[1.02] tracking-[-0.045em] text-[#17212a] sm:text-[62px] lg:text-[70px]">
                A home collects
                <br />
                more than belongings.
              </h2>
            </div>

            <div className="lg:pb-2">
              <p className="max-w-[480px] text-lg leading-8 text-[#65717d]">
                It collects receipts, model numbers, paint colors,
                warranties, repairs, manuals and dozens of details that
                become useful months or years later.
              </p>

              <div className="mt-8 h-px bg-[#17212a]/10" />

              <p className="mt-8 max-w-[460px] text-sm leading-7 text-[#7b858f]">
                Home Tech Vault is simply a place for that history to stay
                organized instead of disappearing into drawers, inboxes
                and forgotten folders.
              </p>
            </div>
          </div>
        </section>

        {/* DETAILS INSIDE THE HOME */}
        <section className="-mx-[100vw] bg-[#e9e8e2] px-[100vw] py-24 lg:py-32">
          <div className="grid gap-16 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7c8791]">
                Inside the sample
              </p>

              <h2 className="mt-5 max-w-[560px] font-serif text-5xl leading-[1.03] tracking-[-0.045em] text-[#17212a] sm:text-6xl">
                Look up the things
                <br />
                homeowners actually need.
              </h2>

              <p className="mt-7 max-w-[520px] text-lg leading-8 text-[#65717d]">
                The sample household is already populated, so you can
                experience the record without entering any of your own
                information.
              </p>

              <button
                type="button"
                onClick={enterDemo}
                className="mt-9 inline-flex items-center gap-2 text-sm font-semibold text-[#17212a]"
              >
                Open the sample home
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-hidden rounded-[32px] bg-[#17283a] p-5 shadow-[0_30px_80px_rgba(23,40,58,0.12)] sm:p-7">
              <div className="border-b border-white/[0.08] px-2 pb-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                  Morgan Household
                </p>

                <p className="mt-2 font-serif text-3xl tracking-[-0.025em] text-white">
                  A few things you can find
                </p>
              </div>

              <div className="mt-3">
                {homeDetails.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="flex gap-5 border-b border-white/[0.07] px-2 py-6 last:border-b-0"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
                        <Icon className="h-4 w-4 text-[#c3c978]" />
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-white">
                          {item.title}
                        </h3>
                        <p className="mt-1.5 max-w-[420px] text-sm leading-6 text-white/40">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* REAL-LIFE MOMENTS */}
        <section className="py-24 lg:py-36">
          <div className="max-w-[800px]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#87919a]">
              Picture the moment
            </p>

            <h2 className="mt-5 font-serif text-5xl leading-[1.03] tracking-[-0.045em] text-[#17212a] sm:text-6xl">
              You do not need your home&apos;s
              information every day.
              <br />
              <span className="text-[#8a9182]">
                You need it when you need it.
              </span>
            </h2>
          </div>

          <div className="mt-16 border-t border-[#17212a]/10">
            {moments.map((moment) => (
              <div
                key={moment.number}
                className="grid gap-5 border-b border-[#17212a]/10 py-10 sm:grid-cols-[100px_0.8fr_1.2fr] sm:items-start lg:py-12"
              >
                <span className="font-serif text-2xl text-[#17212a]/25">
                  {moment.number}
                </span>

                <h3 className="font-serif text-3xl tracking-[-0.025em] text-[#17212a]">
                  {moment.question}
                </h3>

                <p className="max-w-[510px] leading-7 text-[#687581]">
                  {moment.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* HANDOFF / MEMORY */}
        <section className="-mx-[100vw] bg-[#f0eee7] px-[100vw] py-24 lg:py-32">
          <div className="mx-auto max-w-[900px] text-center">
            <Home className="mx-auto h-6 w-6 text-[#7e8860]" />

            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.22em] text-[#89929a]">
              One home. One useful record.
            </p>

            <h2 className="mt-5 font-serif text-5xl leading-[1.03] tracking-[-0.045em] text-[#17212a] sm:text-6xl">
              The details stop living
              <br />
              in random places.
            </h2>

            <p className="mx-auto mt-7 max-w-[650px] text-lg leading-8 text-[#687581]">
              Explore the sample home and see what changes when the
              information around a home has somewhere dependable to live.
            </p>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="-mx-[100vw] bg-[#142437] px-[100vw] py-24 text-center text-white lg:py-32">
          <div className="mx-auto max-w-[850px]">
            <KeyRound className="mx-auto h-7 w-7 text-white/40" />

            <h2 className="mt-7 font-serif text-5xl leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Walk through the home.
            </h2>

            <p className="mx-auto mt-7 max-w-[600px] text-lg leading-8 text-white/50">
              Nothing to create. Nothing to upload. The sample household
              is already waiting for you.
            </p>

            <button
              type="button"
              onClick={enterDemo}
              className="mt-10 inline-flex min-h-[54px] items-center justify-center gap-2 rounded-full bg-[#f3f1e9] px-8 text-sm font-semibold text-[#17283a] transition duration-200 hover:-translate-y-0.5 hover:bg-white"
            >
              Open the sample home
              <ArrowRight className="h-4 w-4" />
            </button>

            <p className="mt-5 text-xs text-white/30">
              No account required.
            </p>
          </div>
        </section>

      </MarketingContent>
    </MarketingLayout>
  );
}
