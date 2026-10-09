import { MarketingText } from "@/components/marketing/MarketingContent";
import Link from "next/link";
import { cn } from "@/lib/design-system/cn";
import { CORE_INTERNAL_LINKS, normalizePath, type InternalLinkItem, } from "@/lib/seo/internalLinks";
type CoreSiteLinksProps = {
    currentPath?: string;
    related?: ReadonlyArray<InternalLinkItem>;
    title?: string;
    className?: string;
};
/**
 * Automatic internal-link block for SEO / marketing content pages.
 * Always includes Devices, Documents, Maintenance, Network, Families,
 * Pricing, and Knowledge Center (unless the page is that destination).
 */
export default function CoreSiteLinks({ currentPath, related = [], title = "Explore Home Tech Vault", className, }: CoreSiteLinksProps) {
    const current = normalizePath(currentPath);
    const seen = new Set<string>(current ? [current] : []);
    const coreLinks = CORE_INTERNAL_LINKS.filter((link) => {
        const href = normalizePath(link.href);
        if (seen.has(href)) {
            return false;
        }
        seen.add(href);
        return true;
    });
    const relatedLinks: InternalLinkItem[] = [];
    for (const link of related) {
        const href = normalizePath(link.href);
        if (!href || seen.has(href)) {
            continue;
        }
        seen.add(href);
        relatedLinks.push({
            href,
            label: link.label,
            description: link.description,
        });
    }
    if (coreLinks.length === 0 && relatedLinks.length === 0) {
        return null;
    }
    return (<section className={cn("w-full space-y-10", className)}>
      <div>
        <h2 className="text-xl font-medium tracking-[-0.02em] text-text-primary md:text-2xl">
          <MarketingText scope="shared">{title}</MarketingText>
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted"><MarketingText scope="components/seo/CoreSiteLinks.tsx">{"Devices, documents, maintenance, network, family sharing, pricing, and the Knowledge Center \u2014 linked from every guide."}</MarketingText></p>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {coreLinks.map((link) => (<li key={link.href}>
              <Link href={link.href} className="htv-focus-ring flex h-full flex-col border border-border-subtle bg-surface-card p-4 transition hover:border-border-strong">
                <span className="text-sm font-medium text-text-primary">
                  <MarketingText scope="shared">{link.label}</MarketingText>
                </span>
                <span className="mt-1.5 text-sm leading-6 text-text-muted">
                  <MarketingText scope="shared">{link.description}</MarketingText>
                </span>
              </Link>
            </li>))}
        </ul>
      </div>

      {relatedLinks.length > 0 ? (<div>
          <h2 className="text-xl font-medium tracking-[-0.02em] text-text-primary md:text-2xl"><MarketingText scope="components/seo/CoreSiteLinks.tsx">{"Related articles"}</MarketingText></h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {relatedLinks.map((link) => (<li key={link.href}>
                <Link href={link.href} className="htv-focus-ring flex h-full flex-col border border-border-subtle bg-surface-card p-4 transition hover:border-border-strong">
                  <span className="text-sm font-medium text-text-primary">
                    <MarketingText scope="shared">{link.label}</MarketingText>
                  </span>
                  {link.description ? (<span className="mt-1.5 text-sm leading-6 text-text-muted">
                      <MarketingText scope="shared">{link.description}</MarketingText>
                    </span>) : null}
                </Link>
              </li>))}
          </ul>
        </div>) : null}
    </section>);
}
