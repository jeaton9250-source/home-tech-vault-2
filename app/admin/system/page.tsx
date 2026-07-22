import {
  AdminContentSection,
  AdminPageHero,
  AdminStatusBadge,
  AdminSummaryCard,
  AdminSummaryGrid,
} from "@/components/admin/layout/AdminPageLayout";
import type { AdminConfigCheck } from "@/lib/admin/types";
import { loadAdminSystemHealth } from "@/lib/admin/data/loaders";

export const metadata = {
  title: "System Health — Home Tech Vault Admin",
};

export default async function AdminSystemPage() {
  const health = await loadAdminSystemHealth();

  const configuredCount = health.checks.filter(
    (check) => check.status === "configured"
  ).length;

  return (
    <>
      <AdminPageHero
        title="System Health"
        description="Safe configuration checks for production operations. Secret values are never displayed."
      />

      <AdminSummaryGrid>
        <AdminSummaryCard
          label="Environment"
          value={health.environment}
        />
        <AdminSummaryCard
          label="Supabase"
          value={
            health.supabaseConnected
              ? "Connected"
              : "Unavailable"
          }
        />
        <AdminSummaryCard
          label="Resend"
          value={
            health.resendConfigured
              ? "Configured"
              : "Missing"
          }
        />
        <AdminSummaryCard
          label="Checks passing"
          value={`${configuredCount}/${health.checks.length}`}
        />
      </AdminSummaryGrid>

      <AdminContentSection
        id="system-checks-heading"
        title="Configuration checks"
        subtitle="Integration and environment validation."
      >
        <ul className="space-y-3">
          {health.checks.map((check) => (
            <li key={check.id}>
              <ConfigCheckRow check={check} />
            </li>
          ))}
        </ul>
      </AdminContentSection>

      <AdminContentSection
        id="system-meta-heading"
        title="Deployment context"
        subtitle="Non-secret operational metadata."
      >
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[20px] border border-border-subtle bg-surface-sunken px-4 py-4">
            <dt className="text-xs font-medium uppercase tracking-[0.14em] text-text-tertiary">
              Public URL
            </dt>
            <dd className="mt-2 text-sm text-text-primary">
              {health.publicUrl}
            </dd>
          </div>
          <div className="rounded-[20px] border border-border-subtle bg-surface-sunken px-4 py-4">
            <dt className="text-xs font-medium uppercase tracking-[0.14em] text-text-tertiary">
              App version
            </dt>
            <dd className="mt-2 text-sm text-text-primary">
              {health.appVersion}
            </dd>
          </div>
        </dl>
      </AdminContentSection>
    </>
  );
}

function ConfigCheckRow({
  check,
}: {
  check: AdminConfigCheck;
}) {
  const tone = {
    configured: "success",
    missing: "danger",
    optional: "neutral",
    warning: "warning",
  }[check.status] as
    | "success"
    | "danger"
    | "neutral"
    | "warning";

  return (
    <div className="flex items-start justify-between gap-4 rounded-[20px] border border-border-subtle bg-surface-sunken px-4 py-4">
      <div>
        <p className="font-medium text-text-primary">
          {check.label}
        </p>
        <p className="mt-1 text-sm leading-6 text-text-secondary">
          {check.detail}
        </p>
      </div>
      <AdminStatusBadge tone={tone}>
        {check.status}
      </AdminStatusBadge>
    </div>
  );
}
