import { ArrowLeft } from "lucide-react";

import AdminNav from "@/components/admin/AdminNav";
import PageShell from "@/components/ui/PageShell";
import Button from "@/components/ui/Button";

type AdminShellProps = {
  children: React.ReactNode;
};

export default function AdminShell({
  children,
}: AdminShellProps) {
  return (
    <PageShell className="bg-surface-base">
      <div className="grid gap-6 xl:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="rounded-[28px] border border-border-subtle bg-surface-card p-4 shadow-[var(--shadow-sm)] xl:sticky xl:top-6 xl:self-start">
          <p className="px-3 text-overline text-charcoal-soft">
            Platform Admin
          </p>

          <p className="mt-2 px-3 text-sm leading-6 text-text-secondary">
            Founder tools for Home Tech Vault.
          </p>

          <div className="mt-5">
            <AdminNav />
          </div>

          <div className="mt-6 border-t border-border-subtle pt-5">
            <Button
              href="/home"
              variant="secondary"
              size="sm"
              className="w-full justify-center"
            >
              <ArrowLeft
                aria-hidden="true"
                className="h-4 w-4"
              />
              Back to app
            </Button>
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          {children}
        </div>
      </div>
    </PageShell>
  );
}
