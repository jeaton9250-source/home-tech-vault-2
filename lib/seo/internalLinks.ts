/**
 * Canonical internal destinations for marketing / SEO content pages.
 * Prefer public indexable URLs (not auth-gated app routes).
 */

export type CoreInternalLink = {
  id:
    | "devices"
    | "documents"
    | "maintenance"
    | "network"
    | "families"
    | "pricing"
    | "knowledge";
  /** Descriptive anchor text (not bare “click here”) */
  label: string;
  href: string;
  description: string;
};

/**
 * Every article / guide / FAQ / comparison should surface these destinations.
 */
export const CORE_INTERNAL_LINKS: readonly CoreInternalLink[] = [
  {
    id: "devices",
    label: "Organize your home device inventory",
    href: "/device-inventory",
    description:
      "Track laptops, TVs, appliances, and gadgets room by room.",
  },
  {
    id: "documents",
    label: "Store receipts, manuals, and home documents",
    href: "/home-document-organizer",
    description:
      "Attach proof and PDFs to the devices they belong to.",
  },
  {
    id: "maintenance",
    label: "Browse home tech maintenance guides",
    href: "/knowledge/maintenance",
    description:
      "Seasonal checkups, batteries, firmware, and care habits.",
  },
  {
    id: "network",
    label: "Document your home network",
    href: "/network-documentation",
    description:
      "Router notes, Wi-Fi context, and ISP details for calmer outages.",
  },
  {
    id: "families",
    label: "Share your vault with family members",
    href: "/knowledge/security/household-access-without-oversharing",
    description:
      "Household roles and access boundaries without oversharing.",
  },
  {
    id: "pricing",
    label: "Compare Free, Pro, and Family pricing",
    href: "/pricing",
    description:
      "See plan limits, sharing, and what to start with.",
  },
  {
    id: "knowledge",
    label: "Explore the Knowledge Center",
    href: "/knowledge",
    description:
      "Long-form guides for devices, warranties, networking, and more.",
  },
] as const;

export type InternalLinkItem = {
  href: string;
  label: string;
  description?: string;
};

/**
 * Core site links for a page, optionally excluding the current path
 * and merging extra related links with deduplication by href.
 */
export function buildPageInternalLinks(input: {
  currentPath?: string;
  related?: ReadonlyArray<InternalLinkItem>;
  includeCore?: boolean;
}): InternalLinkItem[] {
  const includeCore = input.includeCore !== false;
  const current = normalizePath(input.currentPath);
  const seen = new Set<string>();
  const links: InternalLinkItem[] = [];

  function push(link: InternalLinkItem) {
    const href = normalizePath(link.href);
    if (!href || href === current || seen.has(href)) {
      return;
    }
    seen.add(href);
    links.push({
      href,
      label: link.label,
      description: link.description,
    });
  }

  if (includeCore) {
    for (const link of CORE_INTERNAL_LINKS) {
      push(link);
    }
  }

  for (const link of input.related ?? []) {
    push(link);
  }

  return links;
}

export function normalizePath(
  path: string | null | undefined
): string {
  if (!path) {
    return "";
  }

  const trimmed = path.trim();
  if (!trimmed || trimmed.startsWith("http")) {
    return trimmed.replace(/\/+$/, "") || "/";
  }

  const withSlash = trimmed.startsWith("/")
    ? trimmed
    : `/${trimmed}`;

  if (withSlash.length > 1 && withSlash.endsWith("/")) {
    return withSlash.slice(0, -1);
  }

  return withSlash;
}
