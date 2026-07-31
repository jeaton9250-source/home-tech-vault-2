import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import {
  AdminContentSection,
  AdminPageHero,
  AdminSummaryCard,
  AdminSummaryGrid,
} from "@/components/admin/layout/AdminPageLayout";


const PLATFORM_LINKS = [
  {
    href: "/admin/system",
    label: "System Health",
    description: "Environment and integration checks",
  },
  {
    href: "/admin/support",
    label: "Support Inbox",
    description: "Customer support tickets",
  },
  {
    href: "/admin/founding-members",
    label: "Founding Members",
    description: "First 50 member program",
  },
  {
    href: "/admin/subscriptions",
    label: "Subscriptions",
    description: "Billing overview",
  },
] as const;

export const metadata = {
  title: "Platform — Home Tech Vault Admin",
};

export default function AdminPlatformPage() {
  return (
    <>
      <AdminPageHero
        title="Platform"
        description="System health, support, billing, and founding member tools."
      />

      <AdminSummaryGrid>
        <AdminSummaryCard
          label="Tools"
          value={PLATFORM_LINKS.length}
          hint="Available platform sections"
        />
      </AdminSummaryGrid>

      <AdminContentSection
        id="platform-tools-heading"
        title="Platform tools"
        subtitle="Secondary admin areas grouped for quick access."
      >
        <ul className="grid gap-4 md:grid-cols-2">
          {PLATFORM_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="group flex items-start justify-between gap-4 rounded-[22px] border border-border-subtle bg-surface-sunken px-5 py-5 transition hover:bg-surface-card"
              >
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">
                    {link.label}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">
                    {link.description}
                  </p>
                </div>
                <ArrowUpRight
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-text-tertiary transition group-hover:text-charcoal"
                />
              </Link>
            </li>
          ))}
        </ul>
      </AdminContentSection>
    </>
  );
}
