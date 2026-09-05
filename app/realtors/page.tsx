import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileText,
  Gift,
  Home,
  KeyRound,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";

import MarketingHeader from "@/components/marketing/MarketingHeader";

const benefits = [
  "Free Realtor workspace",
  "Pay only when you gift a vault",
  "Buyer receives 1 Year Pro",
];

const steps = [
  {
    number: "01",
    icon: Home,
    title: "Create the home",
    description:
      "Start a vault for your buyer and add the address before closing.",
  },
  {
    number: "02",
    icon: PackageCheck,
    title: "Prepare the details",
    description:
      "Add appliances, warranties, documents, manuals and useful home information.",
  },
  {
    number: "03",
    icon: Gift,
    title: "Gift it at closing",
    description:
      "Send the completed Home Tech Vault securely to your buyer when the home changes hands.",
  },
];

export default function RealtorsPage() {
  return (
    <main className="min-h-screen bg-[#f7f5f1] text-[#152335]">
      <MarketingHeader />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[#152335]/[0.06] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),rgba(232,241,244,0.82)_45%,rgba(247,245,241,1)_82%)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-8 h-[420px] w-[420px] rounded-full bg-white/70 blur-[100px]" />

          <div className="absolute right-[-120px] top-20 h-[500px] w-[500px] rounded-full bg-[#d9e7ea]/60 blur-[120px]" />
        </div>

        <div className="relative mx-auto grid min-h-[650px] max-w-[1380px] items-center gap-16 px-5 py-20 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-10 lg:py-24">
          {/* LEFT */}
          <div className="max-w-[700px]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#152335]/10 bg-white/55 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#6d7d8d] backdrop-blur">
              <Gift className="h-4 w-4" />
              Home Tech Vault for Realtors
            </div>

            <h1 className="font-serif text-[52px] leading-[0.97] tracking-[-0.05em] text-[#152335] sm:text-[68px] lg:text-[78px]">
              A closing gift they&apos;ll
              <br />
              actually use.
            </h1>

            <p className="mt-7 max-w-[650px] text-lg leading-8 text-[#637184] sm:text-xl">
              Give your buyers a digital owner&apos;s manual
              for their new home. Prepare it before closing,
              hand it off securely, and include one full year
              of Home Tech Vault Pro.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/realtors/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#152335] px-7 py-4 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#24384c]"
              >
                Create Free Realtor Workspace
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#152335]/12 bg-white/60 px-7 py-4 text-sm font-semibold text-[#152335] backdrop-blur transition hover:bg-white"
              >
                See How It Works
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-7 flex flex-col gap-3 text-sm text-[#687486] sm:flex-row sm:flex-wrap sm:gap-6">
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-2"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[#152335]/15 bg-white/60">
                    <Check className="h-3 w-3" />
                  </div>

                  {benefit}
                </div>
              ))}
            </div>
          </div>

          {/* CLIENT VAULT VISUAL */}
          <div className="relative mx-auto w-full max-w-[570px]">
            <div className="rounded-[38px] border border-white/80 bg-white/45 p-5 shadow-[0_35px_100px_rgba(20,36,52,0.17)] backdrop-blur-xl sm:p-7">
              <div className="overflow-hidden rounded-[30px] bg-[#132231] p-7 text-white sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                      Client Vault
                    </p>

                    <h2 className="mt-2 text-xl font-semibold sm:text-2xl">
                      1247 Willow Creek Lane
                    </h2>

                    <p className="mt-1 text-sm text-white/45">
                      Preparing for buyer
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.07]">
                    <Gift className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3">
                  {[
                    {
                      label: "Appliances",
                      icon: PackageCheck,
                    },
                    {
                      label: "Home Documents",
                      icon: FileText,
                    },
                    {
                      label: "Warranties",
                      icon: ShieldCheck,
                    },
                    {
                      label: "Maintenance",
                      icon: Home,
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="rounded-[18px] border border-white/[0.07] bg-white/[0.035] p-4"
                      >
                        <Icon className="h-4 w-4 text-[#a5aa4a]" />

                        <p className="mt-5 text-sm font-medium">
                          {item.label}
                        </p>

                        <p className="mt-1 text-[11px] text-white/35">
                          Ready for handoff
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 rounded-[20px] bg-[#f5f4ef] p-5 text-[#152335]">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d8793]">
                    Closing Gift
                  </p>

                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <p className="font-serif text-2xl">
                        1 Year Pro
                      </p>

                      <p className="mt-1 text-xs text-[#75808b]">
                        Included for your buyer
                      </p>
                    </div>

                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-5 hidden max-w-[220px] rounded-[18px] border border-[#152335]/[0.06] bg-white/95 p-5 shadow-xl lg:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#87919c]">
                Buyer Experience
              </p>

              <p className="mt-2 text-sm leading-6 text-[#526174]">
                Everything they need, organized before they
                move in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="scroll-mt-[100px] px-5 py-24 sm:px-6 lg:px-10 lg:py-32"
      >
        <div className="mx-auto max-w-[1380px]">
          <div className="mx-auto max-w-[760px] text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7b8794]">
              How It Works
            </p>

            <h2 className="mt-4 font-serif text-4xl leading-[1.05] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              From listing to closing,
              <br />
              in three simple steps.
            </h2>

            <p className="mx-auto mt-6 max-w-[650px] text-lg leading-8 text-[#687486]">
              Build the home record while you&apos;re already
              preparing for closing, then hand it off when
              your buyer gets the keys.
            </p>
          </div>

          <div className="mt-16 grid gap-5 lg:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.number}
                  className="relative overflow-hidden rounded-[30px] border border-[#152335]/[0.07] bg-[#fffdf9] p-8 shadow-[0_12px_40px_rgba(20,35,52,0.04)] sm:p-9"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e9edef]">
                      <Icon className="h-5 w-5" />
                    </div>

                    <span className="font-serif text-4xl text-[#152335]/15">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-12 font-serif text-3xl tracking-[-0.025em]">
                    {step.title}
                  </h3>

                  <p className="mt-4 leading-7 text-[#687486]">
                    {step.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY REALTORS */}
      <section className="bg-[#ebe9e3] px-5 py-24 sm:px-6 lg:px-10 lg:py-32">
        <div className="mx-auto grid max-w-[1380px] items-center gap-14 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7b8794]">
              More useful than another basket
            </p>

            <h2 className="mt-4 max-w-[610px] font-serif text-4xl leading-[1.04] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Give them something that stays with the home.
            </h2>

            <p className="mt-7 max-w-[600px] text-lg leading-8 text-[#667486]">
              Homeownership comes with years of manuals,
              receipts, warranties, maintenance records and
              important details. HTV gives all of that a
              permanent place to live.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Useful on day one",
                copy: "Buyers move in with important information already organized.",
                icon: KeyRound,
              },
              {
                title: "Your brand stays remembered",
                copy: "Give buyers something that remains useful long after closing.",
                icon: Gift,
              },
              {
                title: "Simple handoff",
                copy: "Transfer the vault securely when the sale is complete.",
                icon: ArrowRight,
              },
              {
                title: "Built around the home",
                copy: "The record stays connected to the property, not a paper folder.",
                icon: Home,
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-[26px] bg-white/65 p-7"
                >
                  <Icon className="h-5 w-5 text-[#536679]" />

                  <h3 className="mt-8 font-serif text-2xl">
                    {item.title}
                  </h3>

                  <p className="mt-3 leading-7 text-[#687486]">
                    {item.copy}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="bg-[#132231] px-5 py-24 text-white sm:px-6 lg:px-10 lg:py-28">
        <div className="mx-auto flex max-w-[900px] flex-col items-center text-center">
          <Gift className="h-8 w-8 text-white/55" />

          <h2 className="mt-6 font-serif text-5xl leading-[1] tracking-[-0.045em] sm:text-6xl">
            Make your next closing
            <br />
            more memorable.
          </h2>

          <p className="mt-7 max-w-[620px] text-lg leading-8 text-white/60">
            Create your Realtor workspace for free and build
            your first buyer vault when you&apos;re ready.
          </p>

          <Link
            href="/realtors/signup"
            className="mt-9 inline-flex items-center gap-2 rounded-full bg-[#a5aa4a] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#94993f]"
          >
            Create Free Realtor Workspace
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
