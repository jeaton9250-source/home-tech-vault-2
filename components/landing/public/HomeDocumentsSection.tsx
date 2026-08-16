"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  FileText,
  FolderOpen,
  Receipt,
  Search,
  ShieldCheck,
} from "lucide-react";

import { landingTheme } from "@/components/landing/public/landingTheme";

const documentTypes = [
  {
    icon: Receipt,
    title: "Receipts",
    description:
      "Keep proof of purchase attached directly to the device it belongs to.",
    example: "Best Buy Receipt.pdf",
  },
  {
    icon: ShieldCheck,
    title: "Warranties",
    description:
      "Save warranty details and coverage documents before you ever need to file a claim.",
    example: "Samsung Warranty.pdf",
  },
  {
    icon: FileText,
    title: "Manuals",
    description:
      "Keep setup instructions and owner manuals easy to find without searching the web again.",
    example: "Owner Manual.pdf",
  },
  {
    icon: FolderOpen,
    title: "Other Documents",
    description:
      "Store invoices, service records, installation paperwork, and other files with the right device.",
    example: "Service Record.pdf",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: custom * 0.08,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export default function HomeDocumentsSection() {
  return (
    <section className="relative overflow-hidden bg-surface-base px-5 py-20 md:px-8 md:py-24 lg:px-12">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-r from-home-health-soft/25 via-transparent to-premium-soft/25 blur-3xl" />

      <div className={landingTheme.sectionNarrow}>
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div
            variants={fadeUp}
            custom={0}
            className={`${landingTheme.pill} mx-auto`}
          >
            <FolderOpen
              size={14}
              className="text-home-health"
              aria-hidden
            />
            <span>Everything where it belongs</span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            custom={1}
            className="mt-6 text-3xl font-medium tracking-[-0.04em] text-text-primary sm:text-4xl md:text-5xl"
          >
            Stop searching for the paperwork
            <span className="block bg-gradient-to-r from-text-primary via-home-health to-premium bg-clip-text text-transparent">
              after something goes wrong.
            </span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="mx-auto mt-5 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg"
          >
            Receipts, warranties, manuals, invoices, and service records stay
            connected to the device they belong to — so you know exactly where
            to look when you need them.
          </motion.p>
        </motion.div>

        {/* Main document experience */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mx-auto mt-14 max-w-6xl overflow-hidden rounded-[28px] border border-border-subtle bg-surface-card shadow-lift"
        >
          {/* Mock app header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle px-5 py-4 sm:px-7">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                Living Room TV
              </p>

              <p className="mt-1 text-sm font-semibold text-text-primary">
                Samsung QN65S90D
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-home-health/20 bg-home-health-soft px-3 py-1.5 text-[11px] font-semibold text-home-health">
              <CheckCircle2 size={13} aria-hidden />
              Documents organized
            </div>
          </div>

          <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
            {/* Device summary */}
            <div className="border-b border-border-subtle p-5 sm:p-7 lg:border-b-0 lg:border-r">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Device information
              </p>

              <div className="mt-4 rounded-2xl border border-border-subtle bg-surface-sunken/45 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold tracking-tight text-text-primary">
                      Samsung 65&quot; OLED TV
                    </p>

                    <p className="mt-1 text-xs text-text-muted">
                      Living Room
                    </p>
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-home-health-soft text-home-health">
                    <ShieldCheck size={20} aria-hidden />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <DeviceDetail
                    label="Purchased"
                    value="May 8, 2026"
                  />

                  <DeviceDetail
                    label="Warranty"
                    value="Active"
                    highlight
                  />

                  <DeviceDetail
                    label="Model"
                    value="QN65S90D"
                  />

                  <DeviceDetail
                    label="Serial"
                    value="••••9482"
                  />
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-border-subtle bg-surface-sunken/30 p-4">
                <div className="flex items-start gap-3">
                  <Search
                    size={17}
                    className="mt-0.5 shrink-0 text-home-health"
                    aria-hidden
                  />

                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      One place to look
                    </p>

                    <p className="mt-1 text-xs leading-5 text-text-muted">
                      You should not have to remember whether a receipt is in
                      your inbox, a filing cabinet, a junk drawer, or the
                      original box.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Document list */}
            <div className="p-5 sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                    Attached documents
                  </p>

                  <p className="mt-1 text-sm font-semibold text-text-primary">
                    Everything connected to this device
                  </p>
                </div>

                <span className="rounded-full border border-border-subtle bg-surface-sunken px-3 py-1 text-[10px] font-semibold text-text-muted">
                  4 files
                </span>
              </div>

              <div className="mt-5 space-y-3">
                <DocumentRow
                  icon={<Receipt size={17} />}
                  title="Purchase Receipt"
                  detail="Best Buy · May 8, 2026"
                  type="PDF"
                />

                <DocumentRow
                  icon={<ShieldCheck size={17} />}
                  title="Manufacturer Warranty"
                  detail="Coverage through May 8, 2027"
                  type="PDF"
                />

                <DocumentRow
                  icon={<FileText size={17} />}
                  title="Owner's Manual"
                  detail="Samsung QN65S90D"
                  type="PDF"
                />

                <DocumentRow
                  icon={<FolderOpen size={17} />}
                  title="Installation Record"
                  detail="Living Room · May 9, 2026"
                  type="PDF"
                />
              </div>

              <div className="mt-5 rounded-xl border border-dashed border-border-subtle bg-surface-sunken/35 px-4 py-3 text-center">
                <p className="text-xs font-medium text-text-secondary">
                  + Add another document
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Document type cards */}
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {documentTypes.map((document, index) => {
            const Icon = document.icon;

            return (
              <motion.article
                key={document.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="rounded-[22px] border border-border-subtle bg-surface-card p-5 transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-home-health-soft text-home-health">
                  <Icon size={18} aria-hidden />
                </div>

                <h3 className="mt-4 text-base font-semibold text-text-primary">
                  {document.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {document.description}
                </p>

                <div className="mt-4 flex items-center gap-2 rounded-lg bg-surface-sunken/55 px-3 py-2">
                  <FileText
                    size={13}
                    className="shrink-0 text-text-muted"
                    aria-hidden
                  />

                  <span className="truncate text-[10px] font-medium text-text-muted">
                    {document.example}
                  </span>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Email / junk drawer pain */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mx-auto mt-14 max-w-4xl rounded-[24px] border border-border-subtle bg-surface-sunken/40 p-6 sm:p-8"
        >
          <div className="grid gap-8 md:grid-cols-[1fr_auto_1fr] md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
                The old way
              </p>

              <div className="mt-4 space-y-3">
                <OldWayItem text="Search your inbox for the receipt" />
                <OldWayItem text="Check the junk drawer for paperwork" />
                <OldWayItem text="Dig through the original box" />
                <OldWayItem text="Google the manual again" />
              </div>
            </div>

            <div className="hidden h-full w-px bg-border-subtle md:block" />

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-home-health">
                The Home Tech Vault way
              </p>

              <div className="mt-4 space-y-3">
                <NewWayItem text="Open the device" />
                <NewWayItem text="See the purchase information" />
                <NewWayItem text="Open the receipt or warranty" />
                <NewWayItem text="Done" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Closing */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mt-12 max-w-2xl text-center"
        >
          <p className="text-lg font-semibold tracking-tight text-text-primary sm:text-xl">
            The document is only useful if you can find it.
          </p>

          <p className="mt-2 text-sm leading-6 text-text-muted sm:text-base">
            Home Tech Vault keeps the paperwork connected to the thing it
            belongs to, instead of scattered across your home and inbox.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function DeviceDetail({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
        {label}
      </p>

      <p
        className={`mt-1 text-xs font-semibold ${
          highlight ? "text-home-health" : "text-text-primary"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function DocumentRow({
  icon,
  title,
  detail,
  type,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  type: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border-subtle bg-surface-card p-3.5 transition-colors hover:border-home-health/30">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-home-health-soft text-home-health">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-text-primary">
            {title}
          </p>

          <p className="mt-0.5 truncate text-[10px] text-text-muted">
            {detail}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="rounded-md bg-surface-sunken px-2 py-1 text-[9px] font-semibold text-text-muted">
          {type}
        </span>

        <CheckCircle2
          size={15}
          className="text-home-health"
          aria-hidden
        />
      </div>
    </div>
  );
}

function OldWayItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-text-secondary">
      <span className="h-2 w-2 shrink-0 rounded-full bg-warning" />
      <span>{text}</span>
    </div>
  );
}

function NewWayItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm font-medium text-text-primary">
      <CheckCircle2
        size={16}
        className="shrink-0 text-home-health"
        aria-hidden
      />
      <span>{text}</span>
    </div>
  );
}