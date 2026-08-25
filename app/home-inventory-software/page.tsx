import Link from "next/link";
import {
  ArrowRight,
  FileText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import SEOLandingPage from "@/components/seo/SEOLandingPage";
import { createSeoMetadata } from "@/lib/seo";
import { getSeoLandingPage } from "@/lib/seo/landingPages";

const basePage = getSeoLandingPage("home-inventory-software")!;

const page = {
  ...basePage,

  metaTitle:
    "Home Inventory App for Devices, Receipts & Warranties | Home Tech Vault",

  metaDescription:
    "Create a digital home inventory for your appliances and technology. Track devices, receipts, warranties, manuals, serial numbers, and purchase information in one secure vault.",

  keywords: [
    "home inventory app",
    "home inventory software",
    "digital home inventory",
    "home inventory for homeowners",
    "home technology inventory",
    "appliance inventory app",
    "electronics inventory app",
    "warranty tracker",
    "receipt organizer",
    "device inventory",
    "home inventory tracker",
    "Home Tech Vault",
  ],

  heroTitle:
    "A Home Inventory App Built for the Technology You Own",

  heroDescription:
    "Keep your appliances, electronics, receipts, warranties, manuals, serial numbers, and purchase details organized in one place — so you can find them when something breaks, needs service, or gets replaced.",
  screenshots: [],
};

export const metadata = createSeoMetadata({
  title: page.metaTitle,
  description: page.metaDescription,
  path: page.path,
  keywords: page.keywords,
});

export default function Page() {
  return (
    <>
      <SEOLandingPage page={page} />

      <RelatedResources />
    </>
  );
}

function RelatedResources() {
  const resources = [
    {
      href: "/warranty-tracker",
      icon: ShieldCheck,
      eyebrow: "Warranty Tracking",
      title: "Track appliance and electronics warranties",
      description:
        "Keep warranty dates, receipts, proof of purchase, and serial numbers connected to the devices they belong to.",
    },
    {
      href: "/compare/best-home-inventory-software",
      icon: Sparkles,
      eyebrow: "Buying Guide",
      title: "Compare home inventory software",
      description:
        "See how spreadsheets, Notion, Airtable, paper records, and Home Tech Vault compare for organizing your home.",
    },
    {
      href: "/compare/home-tech-vault-vs-sortly",
      icon: FileText,
      eyebrow: "Comparison",
      title: "Home Tech Vault vs Sortly",
      description:
        "Compare a household-focused technology vault with a broader inventory and asset-management platform.",
    },
  ];

  return (
    <section className="border-t border-border-subtle bg-surface-sunken/30 px-5 py-16 md:px-8 md:py-20 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-home-health">
            Explore Home Inventory
          </p>

          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-text-primary md:text-3xl">
            Build a home inventory that is actually useful.
          </h2>

          <p className="mt-3 text-sm leading-7 text-text-secondary md:text-base">
            Home inventory is more useful when your devices, receipts,
            warranties, manuals, and purchase information stay connected.
            Explore these resources to build a system that works when you
            actually need it.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {resources.map((resource) => {
            const Icon = resource.icon;

            return (
              <Link
                key={resource.href}
                href={resource.href}
                className="group rounded-[24px] border border-border-subtle bg-surface-card p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-home-health/25 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-home-health-soft text-home-health">
                  <Icon size={18} aria-hidden />
                </div>

                <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                  {resource.eyebrow}
                </p>

                <h3 className="mt-2 text-base font-semibold leading-6 text-text-primary">
                  {resource.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {resource.description}
                </p>

                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-home-health">
                  Learn more

                  <ArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 rounded-[24px] border border-home-health/20 bg-home-health-soft/30 p-5 md:flex md:items-center md:justify-between md:gap-8 md:p-6">
          <div>
            <p className="text-sm font-semibold text-text-primary">
              Don&apos;t inventory your entire house today.
            </p>

            <p className="mt-1 text-sm leading-6 text-text-secondary">
              Start with one important device and build your Home Tech Vault
              over time.
            </p>
          </div>

          <Link
            href="/signup"
            className="htv-focus-ring mt-4 inline-flex shrink-0 items-center gap-2 rounded-xl bg-text-primary px-4 py-2.5 text-sm font-semibold text-surface-card transition hover:opacity-90 md:mt-0"
          >
            Create My Free Vault
            <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}