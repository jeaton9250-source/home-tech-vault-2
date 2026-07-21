"use client";

import PageShell from "@/components/ui/PageShell";
import { ViewerBanner } from "@/components/ui/PermissionUI";

export default function SecurityPage() {
  return (
    <PageShell>
      <ViewerBanner />

      <section className="rounded-[var(--radius-card)] border border-border-subtle bg-white p-8 shadow-sm">
        <h1 className="text-4xl font-bold text-text-primary">
          Security
        </h1>

        <p className="mt-2 text-text-secondary">
          This section is coming soon.
        </p>
      </section>
    </PageShell>
  );
}
