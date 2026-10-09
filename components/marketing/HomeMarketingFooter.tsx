import { MarketingText } from "@/components/marketing/MarketingContent";
import Link from "next/link";
const exploreLinks = [
  { label: "What It Remembers", href: "/#memory" },
  { label: "Explore", href: "/explore" },
  { label: "Resources", href: "/resources" },
  { label: "Pricing", href: "/pricing" },
  { label: "For Realtors", href: "/realtors" },
] as const;
const companyLinks = [
  { label: "Our Story", href: "/our-story" },
  { label: "Sign In", href: "/login" },
  { label: "Create Your Home", href: "/signup" },
] as const;
const legalLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Contact", href: "/contact" },
] as const;
export default function HomeMarketingFooter() {
  return (
    <footer className="bg-[#f7f5f1] px-5 py-14 text-[#152335] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1380px]">
        <div className="grid gap-10 border-b border-[#152335]/10 pb-12 md:grid-cols-[1.4fr_0.6fr_0.6fr]">
          <div>
            <Link
              href="/"
              aria-label="Home Tech Vault home"
              className="inline-flex items-center gap-3 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#152335]"
            >
              <span className="font-serif text-3xl font-semibold tracking-[-0.04em]">
                <MarketingText scope="components/marketing/HomeMarketingFooter.tsx">
                  {"HTV"}
                </MarketingText>
              </span>

              <span className="text-sm font-medium">
                <MarketingText scope="components/marketing/HomeMarketingFooter.tsx">
                  {"Home Tech Vault"}
                </MarketingText>
              </span>
            </Link>

            <p className="mt-5 max-w-[400px] leading-7 text-[#6a7585]">
              <MarketingText scope="components/marketing/HomeMarketingFooter.tsx">
                {
                  "Your home remembers more than you think. Keep its useful history in one place."
                }
              </MarketingText>
            </p>
          </div>

          <FooterColumn title="Explore" links={exploreLinks} />
          <FooterColumn title="Company" links={companyLinks} />
        </div>

        <div className="flex flex-col justify-between gap-4 pt-8 text-xs text-[#7c8592] sm:flex-row">
          <p>
            <MarketingText scope="components/marketing/HomeMarketingFooter.tsx">
              {"\u00A9"}
            </MarketingText>
            {new Date().getFullYear()}
            <MarketingText scope="components/marketing/HomeMarketingFooter.tsx">
              {"Home Tech Vault. All rights reserved."}
            </MarketingText>
          </p>

          <nav aria-label="Legal" className="flex gap-5">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-[#152335] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#152335]"
              >
                <MarketingText scope="shared">{link.label}</MarketingText>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{
    label: string;
    href: string;
  }>;
}) {
  return (
    <nav aria-label={title}>
      <p className="font-semibold">
        <MarketingText scope="shared">{title}</MarketingText>
      </p>

      <ul className="mt-5 flex flex-col gap-3 text-sm text-[#6a7585]">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="transition-colors hover:text-[#152335] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#152335]"
            >
              <MarketingText scope="shared">{link.label}</MarketingText>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
