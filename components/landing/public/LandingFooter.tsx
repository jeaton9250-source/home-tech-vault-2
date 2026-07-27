import Link from "next/link";

import Logo from "@/components/brand/Logo";
import {
  FOOTER_COPYRIGHT,
  FOOTER_GUIDE_LINKS,
} from "@/lib/marketing/footer";
import {
  LANDING_PUBLIC_SECTION_IDS,
} from "@/lib/marketing/landingPublicContent";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";

const footerLinks = [
  {
    label: "Home Health",
    href: `#${LANDING_PUBLIC_SECTION_IDS.homeHealth}`,
  },
  {
    label: "Home Advisor",
    href: `#${LANDING_PUBLIC_SECTION_IDS.advisor}`,
  },
  {
    label: "Pricing",
    href: `#${LANDING_PUBLIC_SECTION_IDS.pricing}`,
  },
  {
    label: "Interactive Demo",
    href: MARKETING_ROUTES.demo,
  },
  {
    label: "Knowledge Center",
    href: "/knowledge",
  },
  {
    label: "Brand Guides",
    href: "/guides",
  },
  {
    label: "Compare",
    href: "/compare",
  },
  {
    label: "Sign In",
    href: MARKETING_ROUTES.login,
  },
  {
    label: "Create Account",
    href: MARKETING_ROUTES.signup,
  },
  {
    label: "Privacy",
    href: MARKETING_ROUTES.privacy,
  },
  {
    label: "Terms",
    href: MARKETING_ROUTES.terms,
  },
] as const;

export default function LandingFooter() {
  return (
    <footer className="border-t border-[#E7E9EC] bg-white">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="max-w-md">
            <Logo />
            <p className="mt-4 text-sm leading-7 text-[#667085]">
              Organize your home&apos;s devices, receipts,
              warranties, manuals, maintenance records, and
              network details in one secure place.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2">
            <nav aria-label="Footer">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#98A2B3]">
                Product
              </p>
              <ul className="mt-4 grid gap-3">
                {footerLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#667085] transition hover:text-[#172033] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183B56]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Guides">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#98A2B3]">
                Guides
              </p>
              <ul className="mt-4 grid gap-3">
                {FOOTER_GUIDE_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#667085] transition hover:text-[#172033] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183B56]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <p className="mt-12 border-t border-[#E7E9EC] pt-8 text-xs leading-5 text-[#667085]">
          {FOOTER_COPYRIGHT}
        </p>
      </div>
    </footer>
  );
}
