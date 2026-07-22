"use client";

import { useMemo, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileText,
  MapPin,
  Pencil,
  ShieldCheck,
  Tag,
  Wifi,
} from "lucide-react";

import PageShell from "@/components/ui/PageShell";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/design-system/cn";
import type {
  DemoDevice,
  DemoDocument,
  DemoTimelineEvent,
} from "@/lib/demo/types";

type DemoDeviceProfileProps = {
  device: DemoDevice;
  imageSrc: string;
  documents: DemoDocument[];
  timeline: DemoTimelineEvent[];
  onReadOnlyAction: () => void;
};

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not recorded";
  }

  return new Date(`${value}T12:00:00.000Z`).toLocaleDateString(
    undefined,
    { month: "short", day: "numeric", year: "numeric" }
  );
}

function formatCurrency(value: number | null | undefined) {
  if (value == null) {
    return "Not recorded";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function getProtectionStatus(warrantyDate: string) {
  if (!warrantyDate) {
    return {
      label: "Missing coverage",
      className: "bg-warning-soft text-warning",
    };
  }

  const expiry = new Date(`${warrantyDate}T23:59:59`);
  const now = new Date();
  const days = Math.ceil(
    (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (days < 0) {
    return {
      label: "Expired",
      className: "bg-surface-sunken text-text-secondary",
    };
  }

  if (days <= 30) {
    return {
      label: `Expiring in ${days} days`,
      className: "bg-warning-soft text-warning",
    };
  }

  return {
    label: "Protected",
    className: "bg-home-health-soft text-home-health",
  };
}

export default function DemoDeviceProfile({
  device,
  imageSrc,
  documents,
  timeline,
  onReadOnlyAction,
}: DemoDeviceProfileProps) {
  const [timelineExpanded, setTimelineExpanded] =
    useState(false);

  const [notesExpanded, setNotesExpanded] =
    useState(false);

  const protection = getProtectionStatus(
    device.warranty_date
  );

  const receipt = documents.find(
    (doc) => doc.document_type === "Receipt"
  );

  const manual = documents.find(
    (doc) => doc.document_type === "Manual"
  );

  const visibleTimeline = useMemo(() => {
    if (timelineExpanded) {
      return timeline;
    }

    return timeline.slice(0, 3);
  }, [timeline, timelineExpanded]);

  const notesLong =
    (device.notes?.length ?? 0) > 160;

  const notesPreview = notesLong
    ? `${device.notes.slice(0, 160)}…`
    : device.notes;

  const hasNetwork =
    Boolean(device.ip_address) ||
    Boolean(device.mac_address);

  return (
    <PageShell className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/devices"
          className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition hover:text-text-primary"
        >
          <ArrowLeft size={17} />
          Devices
        </Link>

        <Button
          type="button"
          variant="secondary"
          onClick={onReadOnlyAction}
        >
          <Pencil size={16} />
          Edit Device
        </Button>
      </div>

      {/* Hero */}
      <PageCard className="overflow-hidden p-0">
        <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
          <div className="relative aspect-[4/3] bg-surface-sunken md:aspect-auto md:min-h-[320px]">
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={device.device_name}
                fill
                unoptimized
                className="object-contain p-6 md:p-10"
              />
            ) : null}
          </div>

          <div className="flex flex-col justify-center p-6 md:p-8">
            <span
              className={cn(
                "inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold",
                protection.className
              )}
            >
              {protection.label}
            </span>

            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-text-primary">
              {device.device_name}
            </h1>

            <p className="mt-2 text-sm text-text-secondary">
              {device.brand} · {device.model_number}
            </p>

            <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-text-muted">
              <MapPin size={14} aria-hidden />
              {device.location}
            </p>
          </div>
        </div>
      </PageCard>

      {/* Quick Facts */}
      <PageCard className="p-6 md:p-8">
        <p className="text-overline text-section-technology">
          Quick Facts
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Brand", value: device.brand },
            { label: "Model", value: device.model_number },
            { label: "Room", value: device.location },
            {
              label: "Purchase Date",
              value: formatDate(device.purchase_date),
            },
            {
              label: "Purchase Price",
              value: formatCurrency(device.purchase_price),
            },
            {
              label: "Serial Number",
              value: device.serial_number,
            },
            {
              label: "Estimated Value",
              value: formatCurrency(device.purchase_price),
            },
          ].map((fact) => (
            <div
              key={fact.label}
              className="rounded-[20px] bg-surface-sunken p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                {fact.label}
              </p>
              <p className="mt-2 font-semibold text-text-primary">
                {fact.value}
              </p>
            </div>
          ))}
        </div>
      </PageCard>

      {/* Protection */}
      <PageCard className="p-6 md:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-home-health-soft text-home-health">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="text-overline text-section-technology">
              Protection
            </p>
            <h2 className="text-xl font-semibold text-text-primary">
              Warranty & Coverage
            </h2>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[20px] bg-surface-sunken p-4">
            <p className="text-xs text-text-secondary">Status</p>
            <p className="mt-2 font-semibold text-text-primary">
              {protection.label}
            </p>
          </div>
          <div className="rounded-[20px] bg-surface-sunken p-4">
            <p className="text-xs text-text-secondary">Expires</p>
            <p className="mt-2 font-semibold text-text-primary">
              {formatDate(device.warranty_date || null)}
            </p>
          </div>
          <div className="rounded-[20px] bg-surface-sunken p-4">
            <p className="text-xs text-text-secondary">Receipt on file</p>
            <p className="mt-2 font-semibold text-text-primary">
              {receipt ? receipt.file_name : "Not yet attached"}
            </p>
          </div>
        </div>
      </PageCard>

      {/* Documents */}
      <PageCard className="p-6 md:p-8">
        <p className="text-overline text-section-technology">
          Documents
        </p>
        <h2 className="mt-2 text-xl font-semibold text-text-primary">
          Receipts, manuals & warranty files
        </h2>

        <div className="mt-5 space-y-3">
          {documents.length === 0 ? (
            <p className="text-sm text-text-secondary">
              No documents attached yet.
            </p>
          ) : (
            documents.map((document) => (
              <div
                key={document.id}
                className="flex items-center gap-4 rounded-[20px] border border-border-subtle p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-sunken text-charcoal">
                  <FileText size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-text-primary">
                    {document.file_name}
                  </p>
                  <p className="mt-0.5 text-sm text-text-secondary">
                    {document.document_type}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[20px] bg-surface-sunken p-4 text-sm">
            <span className="font-semibold text-text-primary">Receipt: </span>
            <span className="text-text-secondary">
              {receipt?.file_name ?? "—"}
            </span>
          </div>
          <div className="rounded-[20px] bg-surface-sunken p-4 text-sm">
            <span className="font-semibold text-text-primary">Manual: </span>
            <span className="text-text-secondary">
              {manual?.file_name ?? "—"}
            </span>
          </div>
        </div>
      </PageCard>

      {/* Photos */}
      <PageCard className="p-6 md:p-8">
        <p className="text-overline text-section-technology">Photos</p>
        <div className="mt-4 overflow-hidden rounded-[24px] bg-surface-sunken">
          {imageSrc ? (
            <div className="relative aspect-[16/10]">
              <Image
                src={imageSrc}
                alt={`${device.device_name} photo`}
                fill
                unoptimized
                className="object-contain p-4"
              />
            </div>
          ) : null}
        </div>
      </PageCard>

      {/* Network */}
      {hasNetwork ? (
        <PageCard className="p-6 md:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-surface-sunken text-charcoal">
              <Wifi size={18} />
            </div>
            <div>
              <p className="text-overline text-section-technology">
                Network
              </p>
              <h2 className="text-xl font-semibold text-text-primary">
                Connection details
              </h2>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-[20px] bg-surface-sunken p-4">
              <p className="text-xs text-text-secondary">Status</p>
              <p className="mt-2 font-semibold text-text-primary">
                {device.online ? "Online" : "Offline"}
              </p>
            </div>
            <div className="rounded-[20px] bg-surface-sunken p-4">
              <p className="text-xs text-text-secondary">IP Address</p>
              <p className="mt-2 font-semibold text-text-primary">
                {device.ip_address || "—"}
              </p>
            </div>
            <div className="rounded-[20px] bg-surface-sunken p-4">
              <p className="text-xs text-text-secondary">MAC Address</p>
              <p className="mt-2 font-semibold text-text-primary">
                {device.mac_address || "—"}
              </p>
            </div>
            <div className="rounded-[20px] bg-surface-sunken p-4">
              <p className="text-xs text-text-secondary">Last seen</p>
              <p className="mt-2 font-semibold text-text-primary">
                {formatDate(device.last_seen_at?.slice(0, 10))}
              </p>
            </div>
          </div>
        </PageCard>
      ) : null}

      {/* Timeline */}
      <PageCard className="p-6 md:p-8">
        <p className="text-overline text-section-technology">
          Timeline
        </p>
        <h2 className="mt-2 text-xl font-semibold text-text-primary">
          Device history
        </h2>

        <div className="relative mt-6 space-y-4 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-border-subtle">
          {visibleTimeline.map((event) => (
            <div key={event.id} className="relative pl-8">
              <span className="absolute left-0 top-2 h-[15px] w-[15px] rounded-full border-4 border-surface-card bg-home-health shadow-sm" />
              <div className="rounded-[20px] bg-surface-sunken p-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-text-primary">
                      {event.title}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-text-secondary">
                      {event.description}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-text-tertiary">
                    {formatDate(event.event_date.slice(0, 10))}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {timeline.length > 3 ? (
          <button
            type="button"
            onClick={() =>
              setTimelineExpanded((open) => !open)
            }
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-interaction"
          >
            {timelineExpanded ? (
              <>
                Show less <ChevronUp size={16} />
              </>
            ) : (
              <>
                Show full history <ChevronDown size={16} />
              </>
            )}
          </button>
        ) : null}
      </PageCard>

      {/* Notes */}
      {device.notes ? (
        <PageCard className="p-6 md:p-8">
          <div className="flex items-center gap-3">
            <Tag size={18} className="text-charcoal" />
            <h2 className="text-xl font-semibold text-text-primary">
              Notes
            </h2>
          </div>
          <p className="mt-4 text-sm leading-7 text-text-secondary">
            {notesExpanded ? device.notes : notesPreview}
          </p>
          {notesLong ? (
            <button
              type="button"
              onClick={() =>
                setNotesExpanded((open) => !open)
              }
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-interaction"
            >
              {notesExpanded ? "Show less" : "Read more"}
              {notesExpanded ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>
          ) : null}
        </PageCard>
      ) : null}
    </PageShell>
  );
}
