import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { ADMIN_PLATFORM_LINKS } from "@/lib/admin/navigation";

export const metadata = {
  title: "Platform — Home Tech Vault Admin",
};

export default function AdminPlatformPage() {
  return (
    <>
      <AdminPageHeader
        overline="Platform"
        title="Platform Tools"
        description="Secondary admin tools for system health, support, billing, and founding programs."
      />

      <section className="grid gap-4 md:grid-cols-2">
        {ADMIN_PLATFORM_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group rounded-[24px] border border-border-subtle bg-surface-card p-6 shadow-[var(--shadow-sm)] transition hover:border-charcoal/10"
          >
            <div className="flex items-start justify-between gap-4">
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
                className="h-4 w-4 text-text-tertiary transition group-hover:text-charcoal"
              />
            </div>
          </Link>
        ))}
      </section>
    </>
  );
}
