import type { ReactNode } from "react";

import AdminNav from "@/components/admin/AdminNav";
import PageShell from "@/components/ui/PageShell";

type AdminShellProps = {
  children: ReactNode;
};

export default function AdminShell({
  children,
}: AdminShellProps) {
  return (
    <PageShell>
      <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="rounded-[28px] border border-border-subtle bg-surface-card p-4 shadow-[var(--shadow-sm)] xl:sticky xl:top-6 xl:self-start">
          <p className="px-3 text-overline text-charcoal-soft">
            Platform Admin
          </p>

          <p className="mt-2 px-3 text-sm leading-6 text-text-secondary">
            Operational tools for Home Tech
            Vault staff.
          </p>

          <div className="mt-5">
            <AdminNav />
          </div>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </PageShell>
  );
}
