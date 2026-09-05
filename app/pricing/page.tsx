import Link from "next/link";
import {
  ArrowRight,
  Check,
  Home,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import MarketingHeader from "@/components/marketing/MarketingHeader";

const plans = [
  {
    name: "Home",
    price: "$0",
    cadence: "forever",
    description:
      "A simple place to start organizing the useful details of your home.",
    cta: "Start Free",
    href: "/signup",
    highlighted: false,
    features: [
      "Core home record",
      "Appliances and devices",
      "Basic documents",
      "Warranty tracking",
      "Maintenance notes",
      "No credit card required",
    ],
  },
  {
    name: "Home Plus",
    price: "$7.99",
    cadence: "per month",
    description:
      "For homeowners who want a deeper, more complete record of their home.",
    cta: "Start Home Plus",
    href: "/signup",
    highlighted: true,
    features: [
      "Everything in Home",
      "Expanded document storage",
      "Advanced warranty tracking",
      "Maintenance history",
      "Ask Your Home",
      "Priority features as HTV grows",
    ],
  },
  {
    name: "Household",
    price: "$14.99",
    cadence: "per month",
    description:
      "For families who want to manage the home together.",
    cta: "Start Household",
    href: "/signup",
    highlighted: false,
    features: [
      "Everything in Home Plus",
      "Multiple household members",
      "Shared access",
      "Family organization",
      "Collaborative home records",
      "Built for the whole household",
    ],
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#f7f5f1] text-[#152335]">
      <MarketingHeader />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[#152335]/[0.06] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),rgba(232,241,244,0.8)_45%,rgba(247,245,241,1)_82%)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-8 h-[420px] w-[420px] rounded-full bg-white/70 blur-[110px]" />
          <div className="absolute right-[-100px] top-20 h-[500px] w-[500px] rounded-full bg-[#dce8eb]/60 blur-[130px]" />
        </div>

        <div className="relative mx-auto grid min-h-[560px] max-w-[1380px] items-center gap-14 px-5 py-20 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-10 lg:py-24">
          <div className="max-w-[680px]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#152335]/10 bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#6f7e8d] backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Simple Pricing
            </div>

            <h1 className="font-serif text-[52px] leading-[0.98] tracking-[-0.05em] sm:text-[68px] lg:text-[78px]">
              A better record
              <br />
              for your home.
            </h1>

            <p className="mt-7 max-w-[610px] text-lg leading-8 text-[#637184] sm:text-xl">
              Start free, organize what matters, and
              upgrade only when you want more room for your
              home&apos;s history.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#152335] px-7 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#24384c]"
              >
                Start Free
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/what-it-remembers"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#152335]/12 bg-white/60 px-7 py-4 text-sm font-semibold text-[#152335] backdrop-blur transition hover:bg-white"
              >
                See What HTV Remembers
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex lg:justify-end">
            <div className="max-w-[340px] rounded-[30px] border border-white/70 bg-white/55 p-7 shadow-[0_25px_80px_rgba(20,35,52,0.12)] backdrop-blur-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#152335] text-white">
                <Home className="h-5 w-5" />
              </div>

              <h2 className="mt-6 font-serif text-3xl">
                Start with your home.
              </h2>

              <p className="mt-4 leading-7 text-[#697585]">
                No complicated setup. No enterprise-style
                pricing. Just a clearer way to keep your
                home&apos;s useful information together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING CARDS */}
      <section className="px-5 py-24 sm:px-6 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-[1380px]">
          <div className="mx-auto max-w-[760px] text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7a8794]">
              Choose what fits
            </p>

            <h2 className="mt-4 font-serif text-4xl leading-[1.05] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Start simple.
              <br />
              Grow when you need to.
            </h2>

            <p className="mx-auto mt-6 max-w-[650px] text-lg leading-8 text-[#697585]">
              Every plan is built around the same idea:
              keeping the useful history of your home in one
              place.
            </p>
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={[
                  "relative rounded-[30px] border p-8 sm:p-9",
                  plan.highlighted
                    ? "border-[#152335] bg-[#152335] text-white shadow-[0_24px_70px_rgba(20,35,52,0.16)]"
                    : "border-[#152335]/[0.07] bg-[#fffdf9]",
                ].join(" ")}
              >
                {plan.highlighted && (
                  <div className="absolute right-6 top-6 rounded-full bg-[#a5aa4a] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                    Most Popular
                  </div>
                )}

                <p
                  className={[
                    "text-xs font-semibold uppercase tracking-[0.18em]",
                    plan.highlighted
                      ? "text-white/50"
                      : "text-[#8893a0]",
                  ].join(" ")}
                >
                  {plan.name}
                </p>

                <div className="mt-5 flex items-end gap-2">
                  <span className="font-serif text-5xl tracking-[-0.04em]">
                    {plan.price}
                  </span>

                  <span
                    className={[
                      "pb-1 text-sm",
                      plan.highlighted
                        ? "text-white/45"
                        : "text-[#7b8794]",
                    ].join(" ")}
                  >
                    {plan.cadence}
                  </span>
                </div>

                <p
                  className={[
                    "mt-5 min-h-[84px] leading-7",
                    plan.highlighted
                      ? "text-white/65"
                      : "text-[#687486]",
                  ].join(" ")}
                >
                  {plan.description}
                </p>

                <Link
                  href={plan.href}
                  className={[
                    "mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold transition",
                    plan.highlighted
                      ? "bg-white text-[#152335] hover:bg-[#f1f3f5]"
                      : "bg-[#152335] text-white hover:bg-[#24384c]",
                  ].join(" ")}
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <div
                  className={[
                    "my-8 h-px",
                    plan.highlighted
                      ? "bg-white/10"
                      : "bg-[#152335]/10",
                  ].join(" ")}
                />

                <div className="space-y-4">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-3"
                    >
                      <div
                        className={[
                          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                          plan.highlighted
                            ? "bg-white/10"
                            : "bg-[#edf1f2]",
                        ].join(" ")}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </div>

                      <span
                        className={[
                          "text-sm leading-6",
                          plan.highlighted
                            ? "text-white/75"
                            : "text-[#556578]",
                        ].join(" ")}
                      >
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* VALUE SECTION */}
      <section className="bg-[#ebe9e3] px-5 py-24 sm:px-6 lg:px-10 lg:py-32">
        <div className="mx-auto grid max-w-[1380px] gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#788590]">
              What you&apos;re really buying
            </p>

            <h2 className="mt-4 font-serif text-4xl leading-[1.04] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Less searching.
              <br />
              More knowing.
            </h2>

            <p className="mt-7 max-w-[560px] text-lg leading-8 text-[#677485]">
              HTV is not just storage. It gives your home a
              useful record that gets more valuable the
              longer you own it.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: ShieldCheck,
                title: "Know what&apos;s covered",
                copy: "Keep warranty details beside the items they belong to.",
              },
              {
                icon: Home,
                title: "Know what&apos;s been done",
                copy: "Remember maintenance, repairs and important home changes.",
              },
              {
                icon: Users,
                title: "Share when needed",
                copy: "Keep everyone in the household on the same page.",
              },
              {
                icon: Sparkles,
                title: "Build useful history",
                copy: "Your home record becomes more valuable over time.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-[26px] bg-white/65 p-7"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e7ecee]">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-7 font-serif text-2xl">
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

      {/* FAQ */}
      <section className="px-5 py-24 sm:px-6 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-[1000px]">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#788590]">
              A few common questions
            </p>

            <h2 className="mt-4 font-serif text-4xl tracking-[-0.04em] sm:text-5xl">
              Before you start.
            </h2>
          </div>

          <div className="mt-14 divide-y divide-[#152335]/10 border-y border-[#152335]/10">
            {[
              {
                q: "Can I start for free?",
                a: "Yes. The Home plan is designed to let you start organizing your home without entering a credit card.",
              },
              {
                q: "Can I upgrade later?",
                a: "Yes. You can start simple and move to a larger plan when you want more features or household access.",
              },
              {
                q: "Is this only for smart homes?",
                a: "No. HTV is designed for the whole home — appliances, documents, warranties, maintenance records and more.",
              },
              {
                q: "What happens to my home record if I move?",
                a: "Your home record can become part of the story of the property, and HTV is being built to support useful ownership handoffs.",
              },
            ].map((item) => (
              <div
                key={item.q}
                className="grid gap-4 py-7 md:grid-cols-[0.8fr_1.2fr]"
              >
                <h3 className="font-serif text-2xl">
                  {item.q}
                </h3>

                <p className="leading-7 text-[#687486]">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[#152335] px-5 py-24 text-white sm:px-6 lg:px-10 lg:py-28">
        <div className="mx-auto flex max-w-[900px] flex-col items-center text-center">
          <Home className="h-8 w-8 text-white/55" />

          <h2 className="mt-6 font-serif text-5xl leading-[1] tracking-[-0.045em] sm:text-6xl">
            Start with your home.
          </h2>

          <p className="mt-7 max-w-[620px] text-lg leading-8 text-white/60">
            Build a clearer record of the place you live,
            one useful detail at a time.
          </p>

          <Link
            href="/signup"
            className="mt-9 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-[#152335] transition hover:bg-[#f1f3f5]"
          >
            Start Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
