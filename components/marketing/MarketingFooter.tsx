import Link from "next/link";

import Logo from "@/components/brand/Logo";
import { brand } from "@/lib/design-system/tokens";
import {
  FOOTER_BRAND_DESCRIPTION,
  FOOTER_COPYRIGHT,
  FOOTER_GUIDE_LINKS,
  FOOTER_LEGAL_LINKS,
  FOOTER_PRODUCT_LINKS,
  FOOTER_SUPPORT_LINKS,
  type FooterLink,
} from "@/lib/marketing/footer";

export default function MarketingFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#183047] text-[#f5f1e8]">
      <div className="mx-auto max-w-6xl px-8 py-16 md:px-10 md:py-20">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          <div className="max-w-sm lg:max-w-md">
            <div className="[&_svg]:text-[#718d4f] [&_span]:text-[#f5f1e8] [&_p]:text-[#f5f1e8]">
              <Logo />
            </div>

            <p className="mt-4 text-sm leading-6 text-[#d4d9dd]">
              {brand.tagline}
            </p>

            <p className="mt-3 text-sm leading-6 text-[#9da8b0]">
              {FOOTER_BRAND_DESCRIPTION}
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4 lg:gap-12">
            <FooterColumn
              title="Product"
              links={FOOTER_PRODUCT_LINKS}
            />

            <FooterColumn
              title="Guides"
              links={FOOTER_GUIDE_LINKS}
            />

            <FooterColumn
              title="Support"
              links={FOOTER_SUPPORT_LINKS}
            />

            <FooterColumn
              title="Legal"
              links={FOOTER_LEGAL_LINKS}
            />
          </div>
        </div>

        <p className="mt-12 border-t border-white/10 pt-8 text-xs leading-5 text-[#8e99a2]">
          {FOOTER_COPYRIGHT}
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: FooterLink[];
}) {
  const headingId = `footer-${title.toLowerCase()}`;

  return (
    <nav aria-labelledby={headingId}>
      <p
        id={headingId}
        className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#718d4f]"
      >
        {title}
      </p>

      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={`${link.href}-${link.label}`}>
            <Link
              href={link.href}
              className="text-sm leading-6 text-[#c7cfd5] transition-colors duration-200 hover:text-[#f5f1e8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#718d4f]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}