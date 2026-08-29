import type {
  Metadata,
} from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Gift,
  Home,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";

import PublicMarketingShell from "@/components/landing/public/PublicMarketingShell";

export const metadata: Metadata = {
  title:
    "Home Tech Vault for Realtors | A Closing Gift Buyers Actually Use",
  description:
    "Give your buyers a digital owner's manual for their new home. Prepare a Home Tech Vault before closing, transfer it securely, and include one year of Pro access.",
  alternates: {
    canonical:
      "https://www.hometechvault.com/realtors",
  },
};

const steps = [
  {
    number: "01",
    title: "Create the Client Vault",
    description:
      "Start a private Home Tech Vault for the property before closing.",
  },
  {
    number: "02",
    title: "Prepare the Home",
    description:
      "Add appliances, warranties, manuals, receipts, maintenance details, documents, and home technology.",
  },
  {
    number: "03",
    title: "Send the Handoff",
    description:
      "When closing is ready, securely invite the buyer to take ownership of their new home's vault.",
  },
  {
    number: "04",
    title: "Buyer Takes Ownership",
    description:
      "The buyer receives the prepared vault and one full year of Home Tech Vault Pro.",
  },
];

const included = [
  {
    icon: Home,
    title: "A Digital Owner's Manual",
    description:
      "Give buyers one organized place for the information that comes with their new home.",
  },
  {
    icon: FileText,
    title: "Documents That Stay With the Home",
    description:
      "Keep receipts, manuals, warranties, service records, and important property documents organized.",
  },
  {
    icon: Wrench,
    title: "Maintenance History",
    description:
      "Start buyers with useful maintenance information instead of a stack of loose papers.",
  },
  {
    icon: KeyRound,
    title: "Secure Buyer Handoff",
    description:
      "Prepare the vault privately, then transfer ownership directly to the buyer.",
  },
  {
    icon: Users,
    title: "Built for Your Client Experience",
    description:
      "Manage Client Vaults from a dedicated Realtor workspace without mixing them with a personal household.",
  },
  {
    icon: ShieldCheck,
    title: "Buyer-Owned After Closing",
    description:
      "Once transferred, the homeowner controls the vault. Your access to that Client Vault ends.",
  },
];

export default function RealtorsPage() {
  return (
    <PublicMarketingShell>
      <main className="overflow-hidden bg-[#f8f5ef] text-[#183047]">
        <section className="relative isolate overflow-hidden border-b border-[#183047]/10">
          <div className="absolute inset-0 -z-10">
            <div className="absolute -right-28 top-4 h-80 w-80 rounded-full bg-[#718d4f]/10 blur-3xl" />
            <div className="absolute -left-36 bottom-0 h-96 w-96 rounded-full bg-[#183047]/5 blur-3xl" />
          </div>

          <div className="mx-auto grid max-w-7xl gap-14 px-6 py-20 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:px-8 lg:py-28">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#718d4f]/30 bg-white/75 px-4 py-2 text-sm font-medium text-[#617c43] shadow-sm">
                <Sparkles size={16} />
                Home Tech Vault for Realtors
              </div>

              <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.045em] text-[#183047] sm:text-6xl lg:text-7xl">
                A closing gift they&apos;ll
                actually use.
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-[#183047]/72 sm:text-xl">
                Give your buyers a digital
                owner&apos;s manual for their new
                home. Prepare it before closing,
                hand it off securely, and include
                one full year of Home Tech Vault
                Pro.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/realtors/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#183047] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#183047]/15 transition hover:-translate-y-0.5 hover:bg-[#142b40]"
                >
                  Create Free Realtor Workspace
                  <ArrowRight size={17} />
                </Link>

                <Link
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-full border border-[#183047]/15 bg-white/70 px-7 py-3.5 text-sm font-semibold text-[#183047] transition hover:bg-white"
                >
                  See How It Works
                </Link>
              </div>

              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#183047]/65">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2
                    size={16}
                    className="text-[#617c43]"
                  />
                  Free Realtor workspace
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2
                    size={16}
                    className="text-[#617c43]"
                  />
                  Pay only when you gift a vault
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2
                    size={16}
                    className="text-[#617c43]"
                  />
                  Buyer receives 1 Year Pro
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[32px] border border-[#183047]/10 bg-white p-5 shadow-[0_32px_90px_rgba(24,48,71,0.12)] sm:p-7">
                <div className="rounded-[26px] bg-[#183047] p-6 text-white sm:p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">
                        Client Vault
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold">
                        1247 Willow Creek Lane
                      </h2>
                      <p className="mt-1 text-sm text-white/60">
                        Preparing for buyer
                      </p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                      <Gift size={23} />
                    </div>
                  </div>

                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    {[
                      "Appliances",
                      "Home Documents",
                      "Warranties",
                      "Maintenance",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"
                      >
                        <CheckCircle2
                          size={17}
                          className="text-[#b5c99c]"
                        />
                        <p className="mt-3 text-sm font-medium">
                          {item}
                        </p>
                        <p className="mt-1 text-xs text-white/50">
                          Ready for handoff
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-2xl bg-[#f8f5ef] p-5 text-[#183047]">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#617c43]">
                      Closing Gift
                    </p>
                    <div className="mt-2 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xl font-semibold">
                          1 Year Pro
                        </p>
                        <p className="mt-1 text-sm text-[#183047]/60">
                          Transfers with the home
                        </p>
                      </div>

                      <ArrowRight
                        size={20}
                        className="mb-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-7 -left-7 hidden max-w-56 rounded-2xl border border-[#183047]/10 bg-white p-4 shadow-xl lg:block">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#617c43]">
                  Buyer experience
                </p>
                <p className="mt-2 text-sm leading-6 text-[#183047]/70">
                  Everything the buyer needs,
                  organized before they move in.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#183047]/10 bg-white">
          <div className="mx-auto grid max-w-7xl divide-y divide-[#183047]/10 px-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:px-8">
            <div className="px-4 py-7 text-center">
              <p className="text-sm font-semibold text-[#183047]">
                Free Realtor Workspace
              </p>
              <p className="mt-1 text-xs text-[#183047]/55">
                Create and prepare Client Vaults
              </p>
            </div>

            <div className="px-4 py-7 text-center">
              <p className="text-sm font-semibold text-[#183047]">
                $95.88 Per Closing Gift
              </p>
              <p className="mt-1 text-xs text-[#183047]/55">
                One-time purchase for the property
              </p>
            </div>

            <div className="px-4 py-7 text-center">
              <p className="text-sm font-semibold text-[#183047]">
                Buyer Owns It After Closing
              </p>
              <p className="mt-1 text-xs text-[#183047]/55">
                Your access ends after secure handoff
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-[#183047]/10 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#617c43]">
                A closing gift with a job to do
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">
                Help your buyers feel organized
                before move-in day.
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#183047]/65">
                Instead of another item that gets
                used once, give buyers one organized
                place for the information they will
                need throughout homeownership.
              </p>
            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {[
                {
                  title: "Memorable",
                  text:
                    "Stand out with a closing gift buyers are not already expecting.",
                },
                {
                  title: "Practical",
                  text:
                    "Help buyers keep important home information organized from day one.",
                },
                {
                  title: "Built to Last",
                  text:
                    "The vault stays with the homeowner long after closing day.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[26px] border border-[#183047]/10 bg-[#f8f5ef] p-7"
                >
                  <h3 className="text-xl font-semibold">
                    {item.title}
                  </h3>
                  <p className="mt-3 leading-7 text-[#183047]/65">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="bg-[#f8f5ef]"
        >
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#617c43]">
                How it works
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                Prepare the home before they ever
                log in.
              </h2>
            </div>

            <div className="mt-14 grid gap-5 lg:grid-cols-4">
              {steps.map((step) => (
                <article
                  key={step.number}
                  className="rounded-[26px] border border-[#183047]/10 bg-white p-7 shadow-sm"
                >
                  <p className="text-sm font-semibold text-[#718d4f]">
                    {step.number}
                  </p>
                  <h3 className="mt-8 text-xl font-semibold">
                    {step.title}
                  </h3>
                  <p className="mt-3 leading-7 text-[#183047]/64">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#183047] text-white">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
              <div className="max-w-xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#b7cb9e]">
                  What you can prepare
                </p>
                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                  The useful details buyers are
                  usually left to figure out
                  themselves.
                </h2>
                <p className="mt-5 text-lg leading-8 text-white/62">
                  Build a cleaner handoff by
                  organizing the information that
                  belongs with the property.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {included.map((item) => {
                  const Icon = item.icon;

                  return (
                    <article
                      key={item.title}
                      className="rounded-[24px] border border-white/10 bg-white/[0.06] p-6"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[#c2d3ad]">
                        <Icon size={21} />
                      </div>

                      <h3 className="mt-5 text-lg font-semibold">
                        {item.title}
                      </h3>

                      <p className="mt-2 leading-7 text-white/58">
                        {item.description}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f8f5ef]">
          <div className="mx-auto max-w-5xl px-6 py-20 lg:px-8 lg:py-24">
            <div className="overflow-hidden rounded-[34px] border border-[#183047]/10 bg-white shadow-[0_24px_70px_rgba(24,48,71,0.09)]">
              <div className="grid lg:grid-cols-[1fr_.8fr]">
                <div className="p-8 sm:p-11">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#617c43]">
                    The closing gift
                  </p>

                  <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em]">
                    One year of Home Tech Vault
                    Pro.
                  </h2>

                  <p className="mt-5 max-w-xl text-lg leading-8 text-[#183047]/65">
                    Prepare the Client Vault,
                    transfer it at closing, and
                    give your buyer a full year
                    to keep their new home
                    organized.
                  </p>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {[
                      "Device & appliance records",
                      "Receipts and documents",
                      "Warranty tracking",
                      "Maintenance history",
                      "Home network details",
                      "Secure ownership transfer",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-3 text-sm text-[#183047]/72"
                      >
                        <CheckCircle2
                          size={17}
                          className="mt-0.5 shrink-0 text-[#617c43]"
                        />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col justify-between bg-[#f1eee6] p-8 sm:p-11">
                  <div>
                    <Gift
                      size={30}
                      className="text-[#617c43]"
                    />

                    <p className="mt-8 text-sm font-medium text-[#183047]/55">
                      Realtor Closing Gift
                    </p>

                    <div className="mt-3 flex items-end gap-2">
                      <p className="text-5xl font-semibold tracking-[-0.05em]">
                        $95.88
                      </p>
                    </div>

                    <p className="mt-2 text-sm font-medium text-[#617c43]">
                      One-time · per property
                    </p>

                    <p className="mt-5 leading-7 text-[#183047]/60">
                      Includes a prepared Client Vault
                      and one full year of Home Tech
                      Vault Pro for your buyer.
                    </p>

                    <div className="mt-6 rounded-2xl border border-[#183047]/10 bg-white/70 p-4">
                      <p className="text-sm font-semibold text-[#183047]">
                        Your Realtor workspace is free.
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#183047]/55">
                        You purchase the closing gift
                        only when you are ready to give
                        a Client Vault to a buyer.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/realtors/signup"
                    className="mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-[#718d4f] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#617c43]"
                  >
                    Start a Realtor Account
                    <ArrowRight size={17} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[#183047]/10 bg-[#f8f5ef]">
          <div className="mx-auto max-w-5xl px-6 py-20 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#617c43]">
                Realtor FAQ
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] text-[#183047] sm:text-5xl">
                Everything you need to know
                before your first closing.
              </h2>
            </div>

            <div className="mt-12 divide-y divide-[#183047]/10 overflow-hidden rounded-[28px] border border-[#183047]/10 bg-white">
              {[
                {
                  question:
                    "Do I pay for a Realtor account?",
                  answer:
                    "No. Your Realtor workspace is free. You only purchase a Home Tech Vault closing gift when you are ready to gift a Client Vault to a buyer.",
                },
                {
                  question:
                    "What does the buyer receive?",
                  answer:
                    "The buyer receives ownership of the prepared Home Tech Vault along with one full year of Home Tech Vault Pro.",
                },
                {
                  question:
                    "Can I prepare the vault before closing?",
                  answer:
                    "Yes. Create the Client Vault in advance and add useful property information such as appliances, warranties, manuals, documents, maintenance details, and home technology.",
                },
                {
                  question:
                    "Can the buyer see the vault while I am preparing it?",
                  answer:
                    "Not until you send the secure handoff. You prepare the Client Vault privately from your Realtor workspace.",
                },
                {
                  question:
                    "Do I keep access after the buyer accepts it?",
                  answer:
                    "No. Once the buyer accepts the ownership transfer, the vault belongs to the homeowner and your access to that Client Vault ends.",
                },
                {
                  question:
                    "Can I manage more than one closing?",
                  answer:
                    "Yes. Your Realtor workspace is designed to manage separate Client Vaults for multiple properties.",
                },
              ].map((item) => (
                <details
                  key={item.question}
                  className="group px-6 py-5 sm:px-8"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-semibold text-[#183047]">
                    {item.question}
                    <span className="text-xl font-normal text-[#617c43] transition group-open:rotate-45">
                      +
                    </span>
                  </summary>

                  <p className="max-w-3xl pt-4 leading-7 text-[#183047]/62">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/realtors/signup"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#617c43] hover:text-[#718d4f]"
              >
                Create your free Realtor workspace
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-[#183047]/10 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-20 text-center lg:px-8">
            <h2 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Give your next buyer something
              built for the home.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#183047]/65">
              Start your Realtor workspace for
              free. Create the Client Vault now
              and purchase the closing gift when
              you are ready to hand it over.
            </p>

            <div className="mt-8">
              <Link
                href="/realtors/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#183047] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#142b40]"
              >
Create Free Realtor Workspace
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicMarketingShell>
  );
}
