import Link from "next/link";

import Logo from "@/components/brand/Logo";
import { landingTheme } from "@/components/landing/public/landingTheme";
import {
  LANDING_PUBLIC_SECTION_IDS,
} from "@/lib/marketing/landingPublicContent";
import { FOOTER_COPYRIGHT } from "@/lib/marketing/footer";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";

const footerLinks = [
  {
    label: "Features",
    href: `#${LANDING_PUBLIC_SECTION_IDS.features}`,
  },
  {
    label: "How It Works",
    href: `#${LANDING_PUBLIC_SECTION_IDS.howItWorks}`,
  },
  {
    label: "Pricing",
    href: `#${LANDING_PUBLIC_SECTION_IDS.pricing}`,
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
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <div className="max-w-md">
            <Logo />
            <p className="mt-4 text-sm leading-7 text-[#667085]">
              Organize your home&apos;s devices, receipts,
              warranties, manuals, maintenance records, and
              network details in one secure place.
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="grid gap-3 sm:grid-cols-2">
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
        </div>

        <p className="mt-12 border-t border-[#E7E9EC] pt-8 text-xs leading-5 text-[#667085]">
          {FOOTER_COPYRIGHT}
        </p>
      </div>
    </footer>
  );
}
