import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminPanel from "@/components/admin/AdminPanel";
import type { AdminConfigCheck } from "@/lib/admin/types";
import { loadAdminSystemHealth } from "@/lib/admin/data/loaders";

export const metadata = {
  title: "System Health — Home Tech Vault Admin",
};

export default async function AdminSystemPage() {
  const health = await loadAdminSystemHealth();

  return (
    <>
      <AdminPageHeader
        title="System Health"
        description="Safe configuration checks for production operations. Secret values are never displayed."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <HealthCard
          label="Environment"
          value={health.environment}
        />
        <HealthCard
          label="Public URL"
          value={health.publicUrl}
        />
        <HealthCard
          label="App version"
          value={health.appVersion}
        />
        <HealthCard
          label="Supabase connection"
          value={
            health.supabaseConnected
              ? "Connected"
              : "Unavailable"
          }
        />
        <HealthCard
          label="Resend"
          value={
            health.resendConfigured
              ? "Configured"
              : "Missing"
          }
        />
        <HealthCard
          label="Stripe"
          value={
            health.stripeConfigured
              ? "Configured"
              : "Missing"
          }
        />
      </section>

      <AdminPanel
        title="Configuration checks"
        className="mt-6"
      >
        <div className="space-y-3">
          {health.checks.map((check) => (
            <ConfigCheckRow
              key={check.id}
              check={check}
            />
          ))}
        </div>
      </AdminPanel>
    </>
  );
}

function HealthCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-border-subtle bg-surface-card p-5 shadow-[var(--shadow-sm)]">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
        {label}
      </p>
      <p className="mt-3 text-lg font-semibold text-text-primary">
        {value}
      </p>
    </div>
  );
}

function ConfigCheckRow({
  check,
}: {
  check: AdminConfigCheck;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[18px] border border-border-subtle bg-surface-sunken px-4 py-3">
      <div>
        <p className="font-medium text-text-primary">
          {check.label}
        </p>
        <p className="mt-1 text-sm text-text-secondary">
          {check.detail}
        </p>
      </div>
      <StatusBadge status={check.status} />
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: AdminConfigCheck["status"];
}) {
  const classes = {
    configured:
      "bg-emerald-50 text-emerald-700",
    missing: "bg-red-50 text-red-700",
    optional:
      "bg-surface-card text-text-tertiary",
    warning:
      "bg-warning-soft text-achievement",
  }[status];

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${classes}`}
    >
      {status}
    </span>
  );
}
