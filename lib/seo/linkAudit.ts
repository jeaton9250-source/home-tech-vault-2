import { KNOWLEDGE_CATALOG } from "@/lib/knowledge/catalog";
import {
  knowledgeArticlePath,
  knowledgeCategoryPath,
  KNOWLEDGE_CATEGORIES,
} from "@/lib/knowledge/categories";
import {
  INDEXABLE_MARKETING_PATHS,
  SEO_LANDING_PATHS,
} from "@/lib/marketing/routes";
import { getAllComparisonPages } from "@/lib/seo/comparisons/pages";
import { getAllSeoFaqs, seoFaqPath } from "@/lib/seo/faqs/catalog";
import { CORE_INTERNAL_LINKS } from "@/lib/seo/internalLinks";
import { getAllProgrammaticGuides } from "@/lib/seo/programmatic";

/**
 * Every public content URL that should participate in the link graph.
 */
export function listAllIndexableContentPaths(): string[] {
  const paths = new Set<string>();

  for (const path of INDEXABLE_MARKETING_PATHS) {
    paths.add(path);
  }

  for (const path of SEO_LANDING_PATHS) {
    paths.add(path);
  }

  for (const link of CORE_INTERNAL_LINKS) {
    paths.add(link.href);
  }

  paths.add("/knowledge");
  for (const category of KNOWLEDGE_CATEGORIES) {
    paths.add(knowledgeCategoryPath(category.slug));
  }
  for (const entry of KNOWLEDGE_CATALOG) {
    paths.add(knowledgeArticlePath(entry.category, entry.slug));
  }

  paths.add("/guides");
  for (const guide of getAllProgrammaticGuides()) {
    paths.add(guide.path);
  }

  paths.add("/compare");
  for (const page of getAllComparisonPages()) {
    paths.add(page.path);
  }

  paths.add("/faq");
  for (const faq of getAllSeoFaqs()) {
    paths.add(seoFaqPath(faq.slug));
  }

  return [...paths].sort();
}

export type LinkAuditIssue = {
  source: string;
  href: string;
  reason: string;
};

/**
 * Collect outbound internal hrefs declared in programmatic content catalogs.
 */
export function collectCatalogOutboundLinks(): Array<{
  source: string;
  href: string;
  label?: string;
}> {
  const links: Array<{
    source: string;
    href: string;
    label?: string;
  }> = [];

  for (const core of CORE_INTERNAL_LINKS) {
    links.push({
      source: "[core-internal-links]",
      href: core.href,
      label: core.label,
    });
  }

  for (const guide of getAllProgrammaticGuides()) {
    for (const slug of guide.relatedSlugs) {
      links.push({
        source: guide.path,
        href: `/guides/${slug}`,
        label: slug,
      });
    }
    links.push({ source: guide.path, href: guide.primaryCtaHref });
    links.push({ source: guide.path, href: guide.secondaryCtaHref });
  }

  for (const page of getAllComparisonPages()) {
    for (const slug of page.relatedSlugs) {
      links.push({
        source: page.path,
        href: `/compare/${slug}`,
        label: slug,
      });
    }
    links.push({ source: page.path, href: page.primaryCtaHref });
    links.push({ source: page.path, href: page.secondaryCtaHref });
  }

  for (const faq of getAllSeoFaqs()) {
    const source = seoFaqPath(faq.slug);
    for (const related of faq.related) {
      links.push({
        source,
        href: related.href,
        label: related.label,
      });
    }
  }

  for (const entry of KNOWLEDGE_CATALOG) {
    const source = knowledgeArticlePath(
      entry.category,
      entry.slug
    );
    for (const related of entry.relatedSlugs) {
      const target = KNOWLEDGE_CATALOG.find(
        (item) => item.slug === related
      );
      if (target) {
        links.push({
          source,
          href: knowledgeArticlePath(
            target.category,
            target.slug
          ),
          label: related,
        });
      } else {
        links.push({
          source,
          href: `/knowledge/_missing_/${related}`,
          label: related,
        });
      }
    }
  }

  // Hub → children (guarantees inbound links)
  for (const category of KNOWLEDGE_CATEGORIES) {
    links.push({
      source: "/knowledge",
      href: knowledgeCategoryPath(category.slug),
    });
  }

  for (const entry of KNOWLEDGE_CATALOG) {
    links.push({
      source: "/knowledge",
      href: knowledgeArticlePath(entry.category, entry.slug),
    });
    links.push({
      source: knowledgeCategoryPath(entry.category),
      href: knowledgeArticlePath(entry.category, entry.slug),
    });
  }

  for (const guide of getAllProgrammaticGuides()) {
    links.push({ source: "/guides", href: guide.path });
  }

  for (const page of getAllComparisonPages()) {
    links.push({ source: "/compare", href: page.path });
  }

  for (const faq of getAllSeoFaqs()) {
    links.push({ source: "/faq", href: seoFaqPath(faq.slug) });
  }

  for (const path of SEO_LANDING_PATHS) {
    links.push({ source: "/", href: path });
  }

  return links;
}

export function auditInternalLinks(): {
  validPaths: string[];
  broken: LinkAuditIssue[];
  orphans: string[];
  inboundCount: Record<string, number>;
} {
  const validPaths = new Set(listAllIndexableContentPaths());
  // Auth/marketing CTAs that are valid even if not in content set
  const allowExtra = new Set([
    "/signup",
    "/login",
    "/demo",
    "/features",
    "/contact",
    "/trust",
    "/privacy",
    "/terms",
    "/warranty-tracker",
    "/smart-home-organizer",
    "/digital-home-vault",
    "/home-inventory-software",
    "/home-tech-checklist",
    "/homeowner-tech-management",
    "/home-tech-inventory",
  ]);

  const broken: LinkAuditIssue[] = [];
  const inboundCount: Record<string, number> = {};

  for (const path of validPaths) {
    inboundCount[path] = 0;
  }

  // Synthetic inbound from core block on every article-like page
  const articleLike = [...validPaths].filter(
    (path) =>
      path.startsWith("/knowledge/") ||
      path.startsWith("/guides/") ||
      path.startsWith("/compare/") ||
      (path.startsWith("/faq/") && path !== "/faq")
  );

  for (const source of articleLike) {
    for (const core of CORE_INTERNAL_LINKS) {
      if (core.href !== source && validPaths.has(core.href)) {
        inboundCount[core.href] =
          (inboundCount[core.href] ?? 0) + 1;
      }
    }
  }

  for (const link of collectCatalogOutboundLinks()) {
    const href = link.href.split("#")[0] ?? link.href;
    if (!href.startsWith("/")) {
      continue;
    }

    const ok =
      validPaths.has(href) ||
      allowExtra.has(href) ||
      [...allowExtra].some(
        (extra) => href === extra || href.startsWith(`${extra}/`)
      );

    if (!ok) {
      broken.push({
        source: link.source,
        href,
        reason: "Target path is not a known public content URL",
      });
      continue;
    }

    if (href in inboundCount) {
      inboundCount[href] += 1;
    } else if (validPaths.has(href)) {
      inboundCount[href] = 1;
    }
  }

  // Root / hubs are never orphans
  const hubExempt = new Set([
    "/",
    "/knowledge",
    "/guides",
    "/compare",
    "/faq",
    "/pricing",
    "/features",
    "/demo",
    "/contact",
    "/privacy",
    "/terms",
    "/trust",
    ...SEO_LANDING_PATHS,
  ]);

  const orphans = [...validPaths].filter((path) => {
    if (hubExempt.has(path)) {
      return false;
    }
    return (inboundCount[path] ?? 0) === 0;
  });

  return {
    validPaths: [...validPaths],
    broken,
    orphans,
    inboundCount,
  };
}
