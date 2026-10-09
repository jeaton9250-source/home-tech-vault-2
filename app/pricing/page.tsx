import type { Metadata } from "next";
import {
  MarketingText,
  MarketingImg,
} from "@/components/marketing/MarketingContent";
import { SitePage } from "@/components/marketing/RedesignSitePage";
export const metadata: Metadata = {
  title: "Pricing | Home Tech Vault",
  description:
    "Start Home Tech Vault for free, then choose Home Plus or Household when you need more storage, smarter tools, or shared access.",
};
const plans: [string, string, string, string, string[]][] = [
  [
    "HOME",
    "$0",
    "forever",
    "A simple place to start organizing the useful details of your home.",
    [
      "Core home record",
      "Appliances and devices",
      "Basic documents",
      "Warranty tracking",
      "Maintenance notes",
      "No credit card required",
    ],
  ],
  [
    "HOME PLUS",
    "$7.99",
    "per month",
    "For homeowners who want a deeper, more complete record of their home.",
    [
      "Everything in Home",
      "Expanded document storage",
      "Advanced warranty tracking",
      "Maintenance history",
      "Ask Your Home",
      "Priority features as HTV grows",
    ],
  ],
  [
    "HOUSEHOLD",
    "$14.99",
    "per month",
    "For families who want to manage the home together.",
    [
      "Everything in Home Plus",
      "Multiple household members",
      "Shared access",
      "Family organization",
      "Collaborative home records",
      "Built for the whole household",
    ],
  ],
];
export default function PricingPage() {
  return (
    <SitePage
      eyebrow="SIMPLE PRICING"
      title={
        <>
          <MarketingText scope="app/pricing/page.tsx">
            {"A better record"}
          </MarketingText>
          <br />
          <MarketingText scope="app/pricing/page.tsx">
            {"for your home."}
          </MarketingText>
        </>
      }
      intro="Start free, organize what matters, and upgrade only when you want more room for your home's history."
    >
      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href="#plans"
          className="rounded-full bg-[#18283b] px-6 py-3 font-semibold text-white"
        >
          <MarketingText scope="app/pricing/page.tsx">
            {"Start Free"}
          </MarketingText>
        </a>
        <a
          href="#why"
          className="rounded-full border border-[#18283b]/20 px-6 py-3 font-semibold"
        >
          <MarketingText scope="app/pricing/page.tsx">
            {"See Your Home Record"}
          </MarketingText>
        </a>
      </div>
      <section id="plans" className="mt-24">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a09b31]">
          <MarketingText scope="app/pricing/page.tsx">
            {"CHOOSE WHAT FITS"}
          </MarketingText>
        </p>
        <h2 className="mt-5 font-serif text-5xl leading-none">
          <MarketingText scope="app/pricing/page.tsx">
            {"Start simple."}
          </MarketingText>
          <br />
          <MarketingText scope="app/pricing/page.tsx">
            {"Grow when you need to."}
          </MarketingText>
        </h2>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {plans.map(([name, price, cadence, description, features]) => (
            <article
              key={name}
              className="rounded-2xl border border-[#d8d5cc] bg-[#faf8f3] p-8"
            >
              <p className="text-xs font-semibold tracking-[0.2em] text-[#a09b31]">
                <MarketingText scope="shared">{name}</MarketingText>
              </p>
              <h3 className="mt-8 font-serif text-5xl">
                <MarketingText scope="shared">{price}</MarketingText>
              </h3>
              <p className="text-sm text-[#536174]">
                <MarketingText scope="shared">{cadence}</MarketingText>
              </p>
              <p className="mt-6 leading-relaxed text-[#536174]">
                <MarketingText scope="shared">{description}</MarketingText>
              </p>
              <ul className="mt-8 space-y-3 text-sm">
                {features.map((feature) => (
                  <li key={feature}>
                    <MarketingText scope="app/pricing/page.tsx">
                      {"\u2713"}
                    </MarketingText>
                    <MarketingText scope="shared">{feature}</MarketingText>
                  </li>
                ))}
              </ul>
              <a
                href="/signup"
                className="mt-8 inline-block rounded-full bg-[#18283b] px-5 py-3 font-semibold text-white"
              >
                {name === "HOME"
                  ? "Start Free"
                  : name === "HOME PLUS"
                    ? "Start Home Plus"
                    : "Start Household"}
              </a>
            </article>
          ))}
        </div>
      </section>
      <section id="why" className="mt-24 rounded-2xl bg-[#e8e4d9] p-8 md:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a09b31]">
          <MarketingText scope="app/pricing/page.tsx">
            {"WHY IT MATTERS"}
          </MarketingText>
        </p>
        <h2 className="mt-5 max-w-2xl font-serif text-5xl leading-none">
          <MarketingText scope="app/pricing/page.tsx">
            {"A little less to remember. A lot easier to find."}
          </MarketingText>
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#536174]">
          <MarketingText scope="app/pricing/page.tsx">
            {
              "Home Tech Vault gives the useful details of your home a place to stay \u2014 so when you need something later, you already know where to look."
            }
          </MarketingText>
        </p>
      </section>
    </SitePage>
  );
}
