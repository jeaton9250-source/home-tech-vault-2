import type { ComponentType } from "react";
export const previewPages = {
  "/faq/[slug]": () => import("@/app/faq/[slug]/page"),
  "/guides/[slug]": () => import("@/app/guides/[slug]/page"),
  "/compare/[slug]": () => import("@/app/compare/[slug]/page"),
  "/knowledge/[category]/[slug]": () =>
    import("@/app/knowledge/[category]/[slug]/page"),
  "/about": () => import("@/app/about/page"),
  "/features": () => import("@/app/features/page"),
  "/pricing": () => import("@/app/pricing/page"),
  "/faq": () => import("@/app/faq/page"),
  "/contact": () => import("@/app/contact/page"),
  "/trust": () => import("@/app/trust/page"),
  "/privacy": () => import("@/app/privacy/page"),
  "/terms": () => import("@/app/terms/page"),
  "/new-homeowners": () => import("@/app/new-homeowners/page"),
  "/realtors": () => import("@/app/realtors/page"),
  "/device-inventory": () => import("@/app/device-inventory/page"),
  "/home-tech-inventory": () => import("@/app/home-tech-inventory/page"),
  "/warranty-tracker": () => import("@/app/warranty-tracker/page"),
  "/home-document-organizer": () =>
    import("@/app/home-document-organizer/page"),
  "/network-documentation": () => import("@/app/network-documentation/page"),
  "/homeowner-tech-management": () =>
    import("@/app/homeowner-tech-management/page"),
  "/smart-home-organizer": () => import("@/app/smart-home-organizer/page"),
  "/home-inventory": () => import("@/app/home-inventory/page"),
  "/home-inventory-software": () =>
    import("@/app/home-inventory-software/page"),
  "/digital-home-vault": () => import("@/app/digital-home-vault/page"),
  "/home-tech-checklist": () => import("@/app/home-tech-checklist/page"),
  "/new-homeowner-checklist": () =>
    import("@/app/new-homeowner-checklist/page"),
  "/appliance-model-serial-number": () =>
    import("@/app/appliance-model-serial-number/page"),
  "/home-maintenance-checklist": () =>
    import("@/app/home-maintenance-checklist/page"),
  "/knowledge": () => import("@/app/knowledge/page"),
  "/resources": () => import("@/app/resources/page"),
  "/guides": () => import("@/app/guides/page"),
  "/compare": () => import("@/app/compare/page"),
  "/our-story": () => import("@/app/our-story/page"),
  "/what-it-remembers": () => import("@/app/what-it-remembers/page"),
  "/explore": () => import("@/app/explore/page"),
} as Record<
  string,
  () => Promise<{
    default: ComponentType<{
      params: Promise<{ slug: string; category: string }>;
      searchParams: Promise<Record<string, string | undefined>>;
    }>;
  }>
>;
