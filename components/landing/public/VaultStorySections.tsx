import Link from "next/link";

import {
  CalendarClock,
  Check,
  FileText,
  HardDrive,
  Home,
  Laptop,
  Network,
  Receipt,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Wifi,
  Wrench,
} from "lucide-react";

import { MARKETING_ROUTES } from "@/lib/marketing/routes";

const vaultAreas = [
  {
    icon: Laptop,
    title: "Devices",
    text: "Keep one clear record for every piece of technology in your home.",
  },
  {
    icon: FileText,
    title: "Documents",
    text: "Attach receipts, manuals, invoices and important files where they belong.",
  },
  {
    icon: ShieldCheck,
    title: "Warranties",
    text: "Know what is covered and keep the information ready when something breaks.",
  },
  {
    icon: Wrench,
    title: "Maintenance",
    text: "Track service, upkeep and useful maintenance history over time.",
  },
  {
    icon: Wifi,
    title: "Network",
    text: "Keep useful context about the technology connected to your home.",
  },
  {
    icon: Users,
    title: "Family",
    text: "Make important household technology information accessible to the right people.",
  },
];

export function VaultOverviewSection() {
  return (
    <section
      id="vault-overview"
      className="border-y border-border-subtle bg-surface-card px-5 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-[var(--content-max)]">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-home-health">
            One home. One Vault.
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-text-primary sm:text-4xl lg:text-5xl">
            Your home has a lot of
            technology.
            <br />
            Your records shouldn&apos;t be
            scattered everywhere.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-text-secondary">
            Home Tech Vault gives every
            device, document, warranty,
            maintenance record and network
            detail a place to live.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vaultAreas.map((area) => {
            const Icon = area.icon;

            return (
              <article
                key={area.title}
                className="rounded-[24px] border border-border-subtle bg-surface-base p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-home-health-soft text-home-health">
                  <Icon size={19} />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-text-primary">
                  {area.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {area.text}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function DeviceRecordsSection() {
  return (
    <section className="bg-surface-base px-5 py-20 md:px-8 md:py-28 lg:px-12">
      <div className="mx-auto grid max-w-[var(--content-max)] gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-home-health">
            Device records
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-text-primary sm:text-4xl">
            One record for every device
            you own.
          </h2>

          <p className="mt-5 max-w-xl text-base leading-7 text-text-secondary">
            Stop treating the receipt,
            serial number, manual and
            warranty as separate pieces of
            information. Keep everything
            connected to the device itself.
          </p>

          <div className="mt-7 space-y-3">
            <FeatureCheck text="Purchase date and price" />
            <FeatureCheck text="Brand, model and serial number" />
            <FeatureCheck text="Receipts and manuals" />
            <FeatureCheck text="Warranty information" />
            <FeatureCheck text="Maintenance history" />
          </div>
        </div>

        <div className="rounded-[28px] border border-border-subtle bg-surface-card p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-home-health-soft text-home-health">
              <Laptop size={22} />
            </div>

            <div>
              <p className="text-xs text-text-muted">
                Office
              </p>

              <h3 className="font-semibold text-text-primary">
                LG UltraWide Monitor
              </h3>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <InfoCard
              label="Model"
              value="34WQ500-B"
            />

            <InfoCard
              label="Purchased"
              value="Aug 12, 2026"
            />

            <InfoCard
              label="Price"
              value="$349.99"
            />

            <InfoCard
              label="Warranty"
              value="Tracked"
            />
          </div>

          <div className="mt-4 rounded-2xl bg-home-health-soft/35 p-4">
            <div className="flex items-center gap-2">
              <Receipt
                size={16}
                className="text-home-health"
              />

              <p className="text-sm font-semibold text-text-primary">
                Receipt attached
              </p>
            </div>

            <p className="mt-1 text-xs text-text-muted">
              Purchase information stays with
              the device record.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function DocumentsWarrantySection() {
  return (
    <section className="border-y border-border-subtle bg-surface-card px-5 py-20 md:px-8 md:py-28 lg:px-12">
      <div className="mx-auto max-w-[var(--content-max)]">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="rounded-[28px] border border-border-subtle bg-surface-base p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
              Everything attached
            </p>

            <div className="mt-5 space-y-3">
              <DocumentRow
                icon={Receipt}
                title="Best Buy Receipt"
                meta="Aug 12, 2026"
              />

              <DocumentRow
                icon={FileText}
                title="Owner Manual"
                meta="PDF"
              />

              <DocumentRow
                icon={ShieldCheck}
                title="Manufacturer Warranty"
                meta="Coverage tracked"
              />

              <DocumentRow
                icon={HardDrive}
                title="Purchase Documentation"
                meta="Saved"
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-home-health">
              Documents + warranties
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-text-primary sm:text-4xl">
              Stop searching your inbox
              when something breaks.
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-text-secondary">
              Keep receipts, manuals,
              warranty details and other
              important files attached to
              the device they belong to.
            </p>

            <p className="mt-5 text-sm leading-6 text-text-secondary">
              When you need information
              later, you know exactly where
              to look.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function NetworkSection() {
  return (
    <section className="bg-surface-base px-5 py-20 md:px-8 md:py-28 lg:px-12">
      <div className="mx-auto grid max-w-[var(--content-max)] gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-home-health">
            Network
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-text-primary sm:text-4xl">
            Know what&apos;s connected to
            your home.
          </h2>

          <p className="mt-5 max-w-xl text-base leading-7 text-text-secondary">
            Home Tech Vault can keep network
            context alongside your device
            inventory so your home technology
            makes more sense as one system.
          </p>

          <div className="mt-7 space-y-3">
            <FeatureCheck text="Connected device context" />
            <FeatureCheck text="IP and MAC information where available" />
            <FeatureCheck text="Known and unidentified devices" />
            <FeatureCheck text="Network documentation" />
          </div>
        </div>

        <div className="rounded-[28px] border border-border-subtle bg-surface-card p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted">
                Home Network
              </p>

              <h3 className="mt-1 font-semibold text-text-primary">
                Connected Devices
              </h3>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-home-health-soft text-home-health">
              <Network size={18} />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <NetworkRow
              name="Living Room TV"
              status="Known"
            />

            <NetworkRow
              name="Office MacBook"
              status="Known"
            />

            <NetworkRow
              name="Eero Pro 6E"
              status="Known"
            />

            <NetworkRow
              name="New Device"
              status="Review"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function MaintenanceSection() {
  return (
    <section className="border-y border-border-subtle bg-surface-card px-5 py-20 md:px-8 md:py-28 lg:px-12">
      <div className="mx-auto grid max-w-[var(--content-max)] gap-12 lg:grid-cols-2 lg:items-center">
        <div className="rounded-[28px] border border-border-subtle bg-surface-base p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-home-health-soft text-home-health">
              <CalendarClock size={19} />
            </div>

            <div>
              <p className="text-xs text-text-muted">
                Upcoming
              </p>

              <p className="font-semibold text-text-primary">
                Home technology maintenance
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <MaintenanceRow
              title="Router firmware review"
              meta="Due this month"
            />

            <MaintenanceRow
              title="Clean desktop PC"
              meta="Due in 12 days"
            />

            <MaintenanceRow
              title="Check camera storage"
              meta="Scheduled"
            />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-home-health">
            Ownership over time
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-text-primary sm:text-4xl">
            Your Vault stays useful long
            after the purchase.
          </h2>

          <p className="mt-5 max-w-xl text-base leading-7 text-text-secondary">
            The purchase is just the start.
            Keep maintenance, service history
            and useful reminders connected to
            the technology you own.
          </p>
        </div>
      </div>
    </section>
  );
}

export function FamilySection() {
  return (
    <section className="bg-surface-base px-5 py-20 md:px-8 md:py-28 lg:px-12">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-home-health-soft text-home-health">
          <Users size={21} />
        </div>

        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-home-health">
          Built for the household
        </p>

        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-text-primary sm:text-4xl">
          Important home information
          shouldn&apos;t live in one
          person&apos;s head.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-text-secondary">
          Home Tech Vault helps households
          keep useful technology information
          organized and accessible to the
          right people.
        </p>
      </div>
    </section>
  );
}

export function WhyVaultSection() {
  return (
    <section className="border-y border-border-subtle bg-surface-card px-5 py-20 md:px-8 md:py-28 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-home-health">
            Why Home Tech Vault
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-text-primary sm:text-4xl">
            More useful than a spreadsheet.
            Easier than building one yourself.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <ComparisonCard
            title="Spreadsheet"
            muted
            items={[
              ["Device list", true],
              ["Attached documents", false],
              ["Warranty organization", false],
              ["Maintenance history", false],
              ["Network context", false],
              ["Smart Import™", false],
            ]}
          />

          <ComparisonCard
            title="Home Tech Vault"
            items={[
              ["Device records", true],
              ["Attached documents", true],
              ["Warranty organization", true],
              ["Maintenance history", true],
              ["Network context", true],
              ["Smart Import™", true],
            ]}
          />
        </div>
      </div>
    </section>
  );
}

export function WholeVaultFinalSection({
  isSignedIn = false,
}: {
  isSignedIn?: boolean;
}) {
  const href = isSignedIn
    ? "/dashboard"
    : MARKETING_ROUTES.signup;

  return (
    <section className="bg-surface-base px-5 py-24 md:px-8 md:py-32 lg:px-12">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-home-health-soft text-home-health">
          <Home size={21} />
        </div>

        <h2 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-text-primary sm:text-4xl lg:text-5xl">
          Your home already has the
          technology.
          <br />
          Give it a Vault.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-text-secondary">
          Start with one device, one
          receipt, or one Smart Import.
          Build your Home Tech Vault at your
          own pace.
        </p>

        <Link
          href={href}
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-home-health px-7 text-sm font-semibold text-white"
        >
          {isSignedIn
            ? "Open My Vault"
            : "Create My Free Vault"}
        </Link>
      </div>
    </section>
  );
}

function FeatureCheck({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-home-health-soft text-home-health">
        <Check size={13} />
      </div>

      <span className="text-sm font-medium text-text-primary">
        {text}
      </span>
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-surface-sunken/60 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-text-primary">
        {value}
      </p>
    </div>
  );
}

function DocumentRow({
  icon: Icon,
  title,
  meta,
}: {
  icon: typeof FileText;
  title: string;
  meta: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-card px-4 py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-home-health-soft text-home-health">
        <Icon size={16} />
      </div>

      <div>
        <p className="text-sm font-semibold text-text-primary">
          {title}
        </p>

        <p className="text-xs text-text-muted">
          {meta}
        </p>
      </div>
    </div>
  );
}

function NetworkRow({
  name,
  status,
}: {
  name: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-surface-sunken/60 px-4 py-3">
      <span className="text-sm font-medium text-text-primary">
        {name}
      </span>

      <span className="rounded-full bg-home-health-soft px-2 py-1 text-[10px] font-semibold text-home-health">
        {status}
      </span>
    </div>
  );
}

function MaintenanceRow({
  title,
  meta,
}: {
  title: string;
  meta: string;
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card px-4 py-3">
      <p className="text-sm font-semibold text-text-primary">
        {title}
      </p>

      <p className="mt-1 text-xs text-text-muted">
        {meta}
      </p>
    </div>
  );
}

function ComparisonCard({
  title,
  items,
  muted = false,
}: {
  title: string;
  items: [string, boolean][];
  muted?: boolean;
}) {
  return (
    <div
      className={
        muted
          ? "rounded-[26px] border border-border-subtle bg-surface-base p-6"
          : "rounded-[26px] border border-home-health/20 bg-home-health-soft/25 p-6"
      }
    >
      <h3 className="text-xl font-semibold text-text-primary">
        {title}
      </h3>

      <div className="mt-6 space-y-3">
        {items.map(([label, enabled]) => (
          <div
            key={label}
            className="flex items-center justify-between"
          >
            <span className="text-sm text-text-secondary">
              {label}
            </span>

            <span
              className={
                enabled
                  ? "text-home-health"
                  : "text-text-muted"
              }
            >
              {enabled ? "✓" : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}