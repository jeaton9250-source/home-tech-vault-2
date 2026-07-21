import AuditAccessNotice from "@/components/audit/AuditAccessNotice";
import DownloadAuditPdfButton from "@/components/DownloadAuditPdfButton";
import StatCard from "@/components/StatCard";
import Button from "@/components/ui/Button";
import PageCard from "@/components/ui/PageCard";
import PageHero from "@/components/ui/PageHero";
import PageShell from "@/components/ui/PageShell";
import { calculateTechnologyScore } from "@/lib/calculateTechnologyScore";
import { loadAuditData } from "@/lib/data/auditData";
import { createClient } from "@/lib/supabase/server";

type AuditDevice = {
  device_name?: string | null;
  serial_number?: string | null;
  warranty_date?: string | null;
  photo_url?: string | null;
  purchase_price?: number | null;
};

type AuditSubscription = {
  monthly_cost?: number | null;
};

export default async function AuditPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const audit = user
    ? await loadAuditData(
        supabase,
        user.id
      )
    : {
        devices: [],
        subscriptions: [],
        documents: [],
        network: null,
      };

  const deviceList =
    audit.devices as AuditDevice[];
  const subscriptionList =
    audit.subscriptions as AuditSubscription[];
  const documentList = audit.documents;
  const network = audit.network;

  const score = calculateTechnologyScore(
    deviceList as Parameters<
      typeof calculateTechnologyScore
    >[0]
  );

  const totalValue = deviceList.reduce(
    (sum, device) =>
      sum +
      Number(device.purchase_price || 0),
    0
  );

  const monthlySpend =
    subscriptionList.reduce(
      (sum, sub) =>
        sum +
        Number(sub.monthly_cost || 0),
      0
    );

  const missingSerials = deviceList.filter(
    (device) => !device.serial_number
  );
  const missingWarranties =
    deviceList.filter(
      (device) => !device.warranty_date
    );
  const missingPhotos = deviceList.filter(
    (device) => !device.photo_url
  );

  return (
    <PageShell className="print:bg-surface-card">
      <div className="print:hidden">
        <AuditAccessNotice />
      </div>

      <div className="print:hidden flex flex-wrap items-start justify-between gap-4">
        <PageHero
          section="insights"
          eyebrow="Vault health"
          title="Technology audit"
          description="A complete snapshot of your home technology health and completeness."
        />

        <DownloadAuditPdfButton />
      </div>

      <div className="hidden print:block">
        <h1 className="text-page-title font-medium text-text-primary">
          Home Tech Vault
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Technology audit report
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4 print:grid-cols-4">
        <StatCard
          title="Tech score"
          value={`${score}/100`}
          description="Overall health"
        />

        <StatCard
          title="Devices"
          value={String(deviceList.length)}
          description="Tracked devices"
        />

        <StatCard
          title="Documents"
          value={String(documentList.length)}
          description="Stored files"
        />

        <StatCard
          title="Monthly spend"
          value={`$${monthlySpend.toFixed(2)}`}
          description="Subscriptions"
        />
      </div>

      <PageCard className="mt-8 p-6 md:p-8 print:border print:shadow-none">
        <h2 className="text-section-title text-text-primary">
          Audit summary
        </h2>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-[var(--radius-button)] bg-interaction-soft p-6">
            <p className="text-sm text-text-muted">
              Estimated technology value
            </p>
            <h3 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">
              ${totalValue.toFixed(2)}
            </h3>
          </div>

          <div className="rounded-[var(--radius-button)] bg-interaction-soft p-6">
            <p className="text-sm text-text-muted">
              Network status
            </p>
            <h3 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">
              {network ? "Documented" : "Missing"}
            </h3>
          </div>
        </div>
      </PageCard>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <AuditCard
          title="Missing serial numbers"
          count={missingSerials.length}
          items={missingSerials.map(
            (device) =>
              device.device_name ?? "Device"
          )}
        />

        <AuditCard
          title="Missing warranties"
          count={missingWarranties.length}
          items={missingWarranties.map(
            (device) =>
              device.device_name ?? "Device"
          )}
        />

        <AuditCard
          title="Missing photos"
          count={missingPhotos.length}
          items={missingPhotos.map(
            (device) =>
              device.device_name ?? "Device"
          )}
        />
      </div>

      <PageCard className="mt-8 p-6 md:p-8 print:border print:shadow-none">
        <h2 className="text-section-title text-text-primary">
          Recommended next steps
        </h2>

        <ul className="mt-5 space-y-3 text-sm leading-6 text-text-secondary">
          <li>
            Add missing serial numbers for better
            insurance documentation.
          </li>
          <li>
            Upload receipts and warranty documents for
            high-value devices.
          </li>
          <li>
            Add device photos to improve your inventory
            quality.
          </li>
          <li>
            Keep subscription renewal dates updated.
          </li>
          <li>
            Review your network information at least twice
            per year.
          </li>
        </ul>

        <Button
          href="/devices"
          className="mt-6 print:hidden"
        >
          Improve my vault
        </Button>
      </PageCard>
    </PageShell>
  );
}

function AuditCard({
  title,
  count,
  items,
}: {
  title: string;
  count: number;
  items: string[];
}) {
  return (
    <PageCard className="p-6 print:border print:shadow-none">
      <p className="text-sm text-text-muted">
        {title}
      </p>

      <h2 className="mt-2 text-4xl font-semibold tracking-tight text-text-primary">
        {count}
      </h2>

      {items.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-text-secondary">
          Everything looks complete here.
        </p>
      ) : (
        <ul className="mt-4 space-y-2 text-sm leading-6 text-text-secondary">
          {items.slice(0, 5).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </PageCard>
  );
}
