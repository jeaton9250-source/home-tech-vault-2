import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Home,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import SEOLandingPage from "@/components/seo/SEOLandingPage";
import { createSeoMetadata } from "@/lib/seo";
import { getSeoLandingPage } from "@/lib/seo/landingPages";

const basePage = getSeoLandingPage("warranty-tracker")!;

const page = {
  ...basePage,

  metaTitle:
    "Warranty Tracker App for Appliances & Electronics | Home Tech Vault",

  metaDescription:
    "Track appliance and electronics warranties, receipts, expiration dates, serial numbers, and proof of purchase in one organized home vault.",

  keywords: [
    "warranty tracker",
    "warranty tracker app",
    "appliance warranty tracker",
    "electronics warranty tracker",
    "home warranty organizer",
    "product warranty tracker",
    "warranty expiration tracker",
    "receipt and warranty organizer",
    "track appliance warranties",
    "track electronics warranties",
    "proof of purchase organizer",
    "Home Tech Vault",
  ],

  heroTitle:
    "Never Lose Track of a Warranty Again",

  heroDescription:
    "Keep warranty dates, receipts, serial numbers, manuals, and proof of purchase connected to the appliance or device they belong to — so you are ready when something breaks.",
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

      <WarrantyResources />
    </>
  );
}

function WarrantyResources() {
  const resources = [
    {
      href: "/home-inventory-software",
      icon: Home,
      eyebrow: "Home Inventory",
      title: "Build a complete home technology inventory",
      description:
        "Keep devices, appliances, receipts, warranties, manuals, serial numbers, and purchase details organized together.",
    },
    {
      href: "/compare/best-warranty-tracker",
      icon: ShieldCheck,
      eyebrow: "Buying Guide",
      title: "Compare warranty tracking options",
      description:
        "See how dedicated warranty trackers compare with spreadsheets, calendar reminders, retailer portals, and paper records.",
    },
    {
      href: "/compare/home-tech-vault-vs-sortly",
      icon: FileText,
      eyebrow: "Comparison",
      title: "Home Tech Vault vs Sortly",
      description:
        "Compare a household-focused warranty and device vault with a broader inventory and asset-management platform.",
    },
  ];

  return (
    <section className="border-t border-border-subtle bg-surface-sunken/30 px-5 py-16 md:px-8 md:py-20 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-home-health/15 bg-home-health-soft/50 px-3 py-1.5">
            <ShieldCheck
              size={13}
              className="text-home-health"
              aria-hidden
            />

            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-home-health">
              Warranty Organization
            </span>
          </div>

          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-text-primary md:text-3xl">
            A warranty is only useful if you can find the proof.
          </h2>

          <p className="mt-3 text-sm leading-7 text-text-secondary md:text-base">
            The expiration date is only part of the story. A useful warranty
            record should also keep the receipt, serial number, model,
            purchase date, manual, and other supporting documents close to
            the device they belong to.
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

        <div className="mt-8 overflow-hidden rounded-[26px] border border-home-health/20 bg-gradient-to-br from-surface-card via-surface-card to-home-health-soft/30 p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex max-w-2xl items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-home-health-soft text-home-health">
                <Sparkles size={18} aria-hidden />
              </div>

              <div>
                <p className="text-base font-semibold text-text-primary">
                  Start with the device you would hate to replace tomorrow.
                </p>

                <p className="mt-1 text-sm leading-6 text-text-secondary">
                  Add its purchase date, warranty, receipt, model, and serial
                  number first. You can build the rest of your vault over time.
                </p>
              </div>
            </div>

            <Link
              href="/signup"
              className="htv-focus-ring inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-text-primary px-4 py-2.5 text-sm font-semibold text-surface-card transition hover:opacity-90"
            >
              Create My Free Vault
              <ArrowRight size={15} aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}