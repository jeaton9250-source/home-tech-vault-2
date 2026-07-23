"use client";

import {
  type ChangeEvent,
  type ReactNode,
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  Camera,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  Download,
  Eye,
  FileText,
  ImagePlus,
  Laptop,
  Loader2,
  MapPin,
  Pencil,
  Radio,
  Receipt,
  Share2,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  Wifi,
} from "lucide-react";

import { cn } from "@/lib/design-system/cn";
import {
  displayValue,
  formatLastSeen,
  formatNetworkUpdatedAt,
  formatProfileCurrency,
  formatProfileDate,
  getWarrantyPresentation,
  presentDeviceNetworkPresence,
} from "@/lib/devices/deviceProfileUtils";
import PageShell from "@/components/ui/PageShell";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";
import DeviceProfileMaintenance from "@/components/devices/DeviceProfileMaintenance";
import { ViewerBanner } from "@/components/ui/PermissionUI";

export type DeviceProfileDevice = {
  id: string;
  device_name: string | null;
  brand: string | null;
  model_number: string | null;
  category: string | null;
  serial_number: string | null;
  purchase_date: string | null;
  warranty_date: string | null;
  purchase_price: number | null;
  location: string | null;
  notes: string | null;
  online?: boolean | null;
  last_seen_at?: string | null;
  ip_address?: string | null;
  mac_address?: string | null;
  hostname?: string | null;
  manufacturer?: string | null;
  discovery_source?: string | null;
  connector_id?: string | null;
  network_fingerprint?: string | null;
  first_seen_at?: string | null;
  network_updated_at?: string | null;
};

export type DeviceProfilePhoto = {
  id: string;
  src: string;
  isDemoAsset?: boolean;
};

export type DeviceProfileDocument = {
  id: string;
  name: string;
  type: string;
  fileName: string;
  dateAdded: string;
  previewUrl?: string;
};

export type DeviceProfileTimelineEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
};

type DeviceProfileProps = {
  device: DeviceProfileDevice;
  photos: DeviceProfilePhoto[];
  documents?: DeviceProfileDocument[];
  timeline?: DeviceProfileTimelineEvent[];
  selectedPhotoIndex?: number;
  onSelectPhoto?: (index: number) => void;
  canEdit?: boolean;
  canUpload?: boolean;
  canDelete?: boolean;
  isDemo?: boolean;
  uploading?: boolean;
  deletingDevice?: boolean;
  deletingPhotoId?: string | null;
  viewerBannerDescription?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onReadOnlyAction?: () => void;
  onUploadPhotos?: (event: ChangeEvent<HTMLInputElement>) => void;
  onDeletePhoto?: (photoId: string) => void;
  documentsSection?: ReactNode;
  timelineSection?: ReactNode;
  connectorName?: string | null;
  connectorStatusMayBeOutdated?: boolean;
};

const NOTES_COLLAPSE_LENGTH = 220;

export default function DeviceProfile({
  device,
  photos,
  documents = [],
  timeline = [],
  selectedPhotoIndex = 0,
  onSelectPhoto,
  canEdit = false,
  canUpload = false,
  canDelete = false,
  uploading = false,
  deletingDevice = false,
  deletingPhotoId = null,
  viewerBannerDescription,
  onEdit,
  onDelete,
  onReadOnlyAction,
  onUploadPhotos,
  onDeletePhoto,
  documentsSection,
  timelineSection,
  connectorName = null,
  connectorStatusMayBeOutdated = false,
}: DeviceProfileProps) {
  const [timelineExpanded, setTimelineExpanded] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [previewPhotoId, setPreviewPhotoId] = useState<string | null>(null);

  const warranty = getWarrantyPresentation(device.warranty_date);
  const heroPhoto = photos[selectedPhotoIndex] ?? photos[0] ?? null;
  const previewPhoto =
    photos.find((photo) => photo.id === previewPhotoId) ?? heroPhoto;

  const hasNetworkMatch = Boolean(
    device.connector_id ||
      device.network_fingerprint ||
      device.network_updated_at
  );

  const hasNetwork = Boolean(
    hasNetworkMatch ||
      device.ip_address ||
      device.mac_address ||
      device.hostname ||
      device.manufacturer ||
      device.discovery_source ||
      device.last_seen_at ||
      device.online !== null
  );

  const networkPresence = presentDeviceNetworkPresence({
    online: device.online,
    lastSeenAt: device.last_seen_at,
    firstSeenAt: device.first_seen_at,
    networkUpdatedAt: device.network_updated_at,
  });

  const receipt = documents.find((doc) => doc.type === "Receipt");
  const manual = documents.find((doc) => doc.type === "Manual");
  const warrantyDoc = documents.find((doc) => doc.type === "Warranty");

  const visibleTimeline = useMemo(() => {
    const sorted = [...timeline].sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    if (timelineExpanded || timelineSection) {
      return sorted;
    }

    return sorted.slice(0, 4);
  }, [timeline, timelineExpanded, timelineSection]);

  const notes = device.notes?.trim() ?? "";
  const notesLong = notes.length > NOTES_COLLAPSE_LENGTH;
  const notesPreview = notesLong
    ? `${notes.slice(0, NOTES_COLLAPSE_LENGTH)}…`
    : notes;

  const quickFacts = [
    {
      icon: CalendarDays,
      label: "Purchase Date",
      value: formatProfileDate(device.purchase_date),
    },
    {
      icon: CircleDollarSign,
      label: "Purchase Price",
      value: formatProfileCurrency(device.purchase_price),
    },
    {
      icon: Sparkles,
      label: "Estimated Value",
      value: formatProfileCurrency(device.purchase_price),
    },
    {
      icon: ShieldCheck,
      label: "Warranty Ends",
      value: formatProfileDate(device.warranty_date),
    },
    {
      icon: Tag,
      label: "Serial Number",
      value: device.serial_number,
    },
    {
      icon: MapPin,
      label: "Location",
      value: device.location,
    },
    {
      icon: Laptop,
      label: "Category",
      value: device.category,
    },
  ];

  function handleEditClick() {
    if (canEdit && onEdit) {
      onEdit();
      return;
    }

    onReadOnlyAction?.();
  }

  return (
    <PageShell className="space-y-6 pb-10">
      <header>
        <Link
          href="/devices"
          className="htv-focus-ring inline-flex items-center gap-2 rounded-full text-sm font-semibold text-text-secondary transition hover:text-text-primary"
        >
          <ArrowLeft size={17} aria-hidden />
          Devices
        </Link>
      </header>

      {viewerBannerDescription ? (
        <ViewerBanner description={viewerBannerDescription} />
      ) : null}

      {/* Hero */}
      <PageCard className="overflow-hidden p-0">
        <div className="relative aspect-[16/10] overflow-hidden bg-[#F3F1EC] md:aspect-[21/9]">
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#FAF9F7]/30 via-transparent to-[#E7E2DA]/50"
            aria-hidden
          />

          {heroPhoto ? (
            <Image
              src={heroPhoto.src}
              alt={displayValue(device.device_name, "Device")}
              fill
              priority
              unoptimized={
                heroPhoto.isDemoAsset || heroPhoto.src.startsWith("http")
              }
              className="object-cover object-center"
            />
          ) : canUpload && onUploadPhotos ? (
            <label className="flex h-full cursor-pointer flex-col items-center justify-center px-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-[var(--radius-card)] border border-border-subtle bg-surface-card text-charcoal shadow-[var(--shadow-sm)]">
                <Camera size={32} />
              </div>
              <p className="mt-5 text-lg font-semibold text-text-primary">
                Add a device photo
              </p>
              <p className="mt-2 max-w-sm text-sm leading-6 text-text-secondary">
                Photos make your inventory easier to identify and document.
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploading}
                onChange={onUploadPhotos}
                className="hidden"
              />
            </label>
          ) : (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-[var(--radius-card)] border border-border-subtle bg-surface-card text-charcoal shadow-[var(--shadow-sm)]">
                <Camera size={32} />
              </div>
              <p className="mt-5 text-lg font-semibold text-text-primary">
                No device photo yet
              </p>
              <p className="mt-2 max-w-sm text-sm leading-6 text-text-secondary">
                Upload a photo to complete this device record.
              </p>
            </div>
          )}

          {photos.length > 0 && canUpload && onUploadPhotos ? (
            <label className="absolute bottom-4 right-4 inline-flex cursor-pointer items-center gap-2 rounded-full border border-border-subtle bg-surface-card/95 px-4 py-2.5 text-sm font-semibold text-text-primary shadow-lg backdrop-blur transition hover:bg-surface-card">
              {uploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ImagePlus size={16} />
              )}
              {uploading ? "Uploading" : "Add Photos"}
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploading}
                onChange={onUploadPhotos}
                className="hidden"
              />
            </label>
          ) : null}
        </div>

        <div className="border-t border-border-subtle p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                  warranty.className
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    warranty.tone === "protected"
                      ? "bg-home-health"
                      : warranty.tone === "warning"
                        ? "bg-warning"
                        : warranty.tone === "expired"
                          ? "bg-danger"
                          : "bg-text-tertiary"
                  )}
                  aria-hidden
                />
                {warranty.label}
              </span>

              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-text-primary md:text-4xl">
                {displayValue(device.device_name, "Unnamed Device")}
              </h1>

              <p className="mt-2 text-base text-text-secondary">
                {[device.brand, device.model_number].filter(Boolean).join(" · ") ||
                  "Brand and model not provided"}
              </p>

              {device.location ? (
                <p className="mt-3 inline-flex items-center gap-2 text-sm text-text-muted">
                  <MapPin size={15} aria-hidden />
                  {device.location}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="secondary" onClick={handleEditClick}>
                <Pencil size={16} />
                Edit
              </Button>

              <Button
                type="button"
                variant="ghost"
                disabled
                aria-label="Share device (coming soon)"
                title="Share coming soon"
              >
                <Share2 size={16} />
                Share
              </Button>

              {canDelete && onDelete ? (
                <Button
                  type="button"
                  variant="danger"
                  onClick={onDelete}
                  loading={deletingDevice}
                  loadingLabel="Deleting"
                >
                  <Trash2 size={16} />
                  Delete
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </PageCard>

      {/* Quick Facts */}
      <PageCard className="p-6 md:p-8">
        <p className="text-overline text-section-technology">Quick Facts</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-text-primary">
          Ownership details
        </h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {quickFacts.map((fact) => (
            <FactCard
              key={fact.label}
              icon={fact.icon}
              label={fact.label}
              value={displayValue(fact.value)}
            />
          ))}
        </div>
      </PageCard>

      {/* Protection */}
      <PageCard className="p-6 md:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border-subtle bg-home-health-soft text-home-health shadow-[var(--shadow-sm)]">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-overline text-section-technology">Protection</p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-text-primary">
              Warranty & coverage
            </h2>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[24px] border border-border-subtle bg-surface-sunken p-6">
            <div className="flex flex-wrap items-center gap-2">
              <StatusChip tone={warranty.tone} label={warranty.label} />
              {warranty.daysRemaining != null && warranty.daysRemaining >= 0 ? (
                <StatusChip
                  tone={warranty.tone === "protected" ? "protected" : "warning"}
                  label={`${warranty.daysRemaining} days left`}
                />
              ) : null}
            </div>

            <p className="mt-5 text-sm text-text-secondary">
              Warranty ends{" "}
              <span className="font-semibold text-text-primary">
                {formatProfileDate(device.warranty_date) ?? "Not recorded"}
              </span>
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <AttachmentChip
              label="Receipt attached"
              attached={Boolean(receipt)}
            />
            <AttachmentChip
              label="Manual attached"
              attached={Boolean(manual)}
            />
            <AttachmentChip
              label="Warranty file attached"
              attached={Boolean(warrantyDoc)}
            />
            <AttachmentChip label="Insurance included" attached={false} />
          </div>
        </div>
      </PageCard>

      {/* Documents */}
      {documentsSection ?? (
        <PageCard className="p-6 md:p-8">
          <p className="text-overline text-section-technology">Documents</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-text-primary">
            Files & records
          </h2>

          {documents.length === 0 ? (
            <div className="mt-6 rounded-[24px] border border-dashed border-border-subtle bg-surface-sunken/60 p-8 text-center">
              <FileText size={28} className="mx-auto text-text-tertiary" />
              <p className="mt-4 text-sm font-medium text-text-primary">
                No documents have been added yet.
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                Upload receipts or manuals to keep everything in one place.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {documents.map((document) => (
                <article
                  key={document.id}
                  className="rounded-[24px] border border-border-subtle bg-surface-card p-5 shadow-[var(--shadow-sm)]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal">
                      <DocumentTypeIcon type={document.type} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-text-primary">
                        {document.fileName}
                      </p>
                      <p className="mt-1 text-sm text-text-secondary">
                        {document.type}
                      </p>
                      <p className="mt-1 text-xs text-text-tertiary">
                        Added {formatProfileDate(document.dateAdded.slice(0, 10))}
                      </p>
                    </div>
                  </div>

                  {document.previewUrl ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <a
                        href={document.previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="htv-focus-ring inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-sunken px-4 py-2 text-sm font-semibold text-text-primary transition hover:bg-surface-hover"
                      >
                        <Eye size={15} />
                        Preview
                      </a>
                      <a
                        href={document.previewUrl}
                        download
                        className="htv-focus-ring inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-sunken px-4 py-2 text-sm font-semibold text-text-primary transition hover:bg-surface-hover"
                      >
                        <Download size={15} />
                        Download
                      </a>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </PageCard>
      )}

      {/* Photos */}
      <PageCard className="p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-overline text-section-technology">Photos</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-text-primary">
              Visual record
            </h2>
          </div>

          {canUpload && onUploadPhotos ? (
            <label className="htv-focus-ring inline-flex cursor-pointer items-center gap-2 rounded-full border border-border-subtle bg-surface-card px-4 py-2.5 text-sm font-semibold text-text-primary shadow-[var(--shadow-sm)] transition hover:bg-surface-hover">
              {uploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ImagePlus size={16} />
              )}
              Upload photo
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploading}
                onChange={onUploadPhotos}
                className="hidden"
              />
            </label>
          ) : null}
        </div>

        {photos.length === 0 ? (
          <div className="mt-6 rounded-[24px] border border-dashed border-border-subtle bg-surface-sunken/60 p-8 text-center">
            <Camera size={28} className="mx-auto text-text-tertiary" />
            <p className="mt-4 text-sm font-medium text-text-primary">
              No photos have been added yet.
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              Add clear photos to make this device easy to identify later.
            </p>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setPreviewPhotoId(heroPhoto?.id ?? null)}
              className="htv-focus-ring mt-6 block w-full overflow-hidden rounded-[24px] border border-border-subtle bg-[#F3F1EC]"
            >
              <div className="relative aspect-[16/10]">
                {previewPhoto ? (
                  <Image
                    src={previewPhoto.src}
                    alt={`${device.device_name ?? "Device"} preview`}
                    fill
                    unoptimized={
                      previewPhoto.isDemoAsset ||
                      previewPhoto.src.startsWith("http")
                    }
                    className="object-cover object-center transition duration-500 hover:scale-[1.02]"
                  />
                ) : null}
              </div>
            </button>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {photos.map((photo, index) => {
                const active = index === selectedPhotoIndex;

                return (
                  <div
                    key={photo.id}
                    className="group relative aspect-[4/3] overflow-hidden rounded-[20px] border border-border-subtle bg-[#F3F1EC]"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelectPhoto?.(index);
                        setPreviewPhotoId(photo.id);
                      }}
                      className={cn(
                        "htv-focus-ring absolute inset-0",
                        active && "ring-2 ring-charcoal ring-offset-2"
                      )}
                      aria-label={`View photo ${index + 1}`}
                    >
                      <Image
                        src={photo.src}
                        alt=""
                        fill
                        unoptimized={
                          photo.isDemoAsset || photo.src.startsWith("http")
                        }
                        className="object-cover object-center transition duration-500 group-hover:scale-[1.03]"
                      />
                    </button>

                    {canDelete && onDeletePhoto ? (
                      <button
                        type="button"
                        onClick={() => onDeletePhoto(photo.id)}
                        disabled={deletingPhotoId === photo.id}
                        aria-label="Delete photo"
                        className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-charcoal/70 text-surface-card opacity-100 backdrop-blur transition hover:bg-danger md:opacity-0 md:group-hover:opacity-100"
                      >
                        {deletingPhotoId === photo.id ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </PageCard>

      {/* Network */}
      {hasNetwork ? (
        <PageCard className="p-6 md:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-sm)]">
              <Wifi size={20} />
            </div>
            <div>
              <p className="text-overline text-section-technology">Network</p>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-text-primary">
                Network status
              </h2>
            </div>
          </div>

          {connectorStatusMayBeOutdated ? (
            <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Connector online. Device status may be outdated.
            </p>
          ) : null}

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <FactCard
              icon={Wifi}
              label="Status"
              value={networkPresence.label}
            />
            <FactCard
              icon={Radio}
              label="Last Detected"
              value={formatLastSeen(device.last_seen_at)}
            />
            <FactCard
              icon={Radio}
              label="Current IP"
              value={displayValue(device.ip_address)}
            />
            <FactCard
              icon={Radio}
              label="MAC Address"
              value={displayValue(device.mac_address)}
            />
            <FactCard
              icon={Laptop}
              label="Hostname"
              value={displayValue(device.hostname)}
            />
            <FactCard
              icon={Laptop}
              label="Manufacturer"
              value={displayValue(device.manufacturer)}
            />
            <FactCard
              icon={Sparkles}
              label="Discovery Source"
              value={displayValue(device.discovery_source)}
            />
            <FactCard
              icon={Sparkles}
              label="Connector"
              value={displayValue(connectorName, "Home Tech Vault Connector")}
            />
            <FactCard
              icon={CalendarDays}
              label="First Detected"
              value={formatProfileDate(device.first_seen_at) ?? "Not recorded"}
            />
            <FactCard
              icon={CalendarDays}
              label="Last Network Update"
              value={formatNetworkUpdatedAt(device.network_updated_at)}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/network/discovery" variant="secondary">
              Review discovery
            </Button>
            <Button href="/network?tab=monitoring" variant="ghost">
              View monitoring
            </Button>
          </div>
        </PageCard>
      ) : (
        <PageCard className="p-6 md:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-sm)]">
              <Wifi size={20} />
            </div>
            <div>
              <p className="text-overline text-section-technology">Network</p>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-text-primary">
                Network status
              </h2>
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-text-secondary">
            This device has not been matched to a network device yet.
          </p>
          <div className="mt-6">
            <Button href="/network/discovery">Match Network Device</Button>
          </div>
        </PageCard>
      )}

      {/* Maintenance */}
      <DeviceProfileMaintenance
        deviceId={device.id}
        onReadOnlyAction={onReadOnlyAction}
      />

      {/* Notes */}
      <PageCard className="p-6 md:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-sm)]">
            <Tag size={18} />
          </div>
          <div>
            <p className="text-overline text-section-technology">Notes</p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-text-primary">
              Device notebook
            </h2>
          </div>
        </div>

        {!notes ? (
          <div className="mt-6 rounded-[24px] border border-dashed border-border-subtle bg-surface-sunken/60 p-8 text-center">
            <p className="text-sm font-medium text-text-primary">
              No notes have been added yet.
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              Capture setup details, quirks, or service history in one place.
            </p>
          </div>
        ) : (
          <article className="mt-6 rounded-[24px] border border-border-subtle bg-[linear-gradient(180deg,#FDFCFA_0%,#F7F5F0_100%)] p-6 shadow-[var(--shadow-sm)]">
            <p className="whitespace-pre-wrap text-sm leading-7 text-text-primary">
              {notesExpanded ? notes : notesPreview}
            </p>
            {notesLong ? (
              <button
                type="button"
                onClick={() => setNotesExpanded((open) => !open)}
                className="htv-focus-ring mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-interaction"
              >
                {notesExpanded ? (
                  <>
                    Show less <ChevronUp size={16} />
                  </>
                ) : (
                  <>
                    Read full note <ChevronDown size={16} />
                  </>
                )}
              </button>
            ) : null}
          </article>
        )}
      </PageCard>

      {/* Timeline */}
      {timelineSection ?? (
        <PageCard className="p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-overline text-section-technology">Timeline</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-text-primary">
                Device history
              </h2>
            </div>

            {timeline.length > 4 ? (
              <button
                type="button"
                onClick={() => setTimelineExpanded((open) => !open)}
                className="htv-focus-ring inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface-card px-4 py-2 text-sm font-semibold text-text-primary shadow-[var(--shadow-sm)]"
                aria-expanded={timelineExpanded}
              >
                {timelineExpanded ? (
                  <>
                    Collapse timeline <ChevronUp size={16} />
                  </>
                ) : (
                  <>
                    View full history <ChevronDown size={16} />
                  </>
                )}
              </button>
            ) : null}
          </div>

          {timeline.length === 0 ? (
            <div className="mt-6 rounded-[24px] border border-dashed border-border-subtle bg-surface-sunken/60 p-8 text-center">
              <p className="text-sm font-medium text-text-primary">
                No timeline events have been recorded yet.
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                Purchases, uploads, and maintenance will appear here over time.
              </p>
            </div>
          ) : (
            <ol className="relative mt-6 space-y-4 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-border-subtle">
              {visibleTimeline.map((event) => (
                <li key={event.id} className="relative pl-8">
                  <span
                    className="absolute left-0 top-2 h-[15px] w-[15px] rounded-full border-4 border-surface-card bg-home-health shadow-sm"
                    aria-hidden
                  />
                  <article className="rounded-[24px] border border-border-subtle bg-surface-card p-5 shadow-[var(--shadow-sm)]">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-text-primary">
                          {event.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-text-secondary">
                          {event.description}
                        </p>
                      </div>
                      <time
                        dateTime={event.date}
                        className="shrink-0 text-xs text-text-tertiary"
                      >
                        {formatProfileDate(event.date.slice(0, 10))}
                      </time>
                    </div>
                  </article>
                </li>
              ))}
            </ol>
          )}
        </PageCard>
      )}
    </PageShell>
  );
}

function FactCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Tag;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-border-subtle bg-surface-card p-5 shadow-[var(--shadow-sm)]">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
        <Icon size={18} aria-hidden />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
        {label}
      </p>
      <p className="mt-2 break-words text-base font-semibold text-text-primary">
        {value}
      </p>
    </div>
  );
}

function StatusChip({
  tone,
  label,
}: {
  tone: "protected" | "warning" | "expired" | "neutral";
  label: string;
}) {
  const className =
    tone === "protected"
      ? "bg-home-health-soft text-home-health"
      : tone === "warning"
        ? "bg-warning-soft text-warning"
        : tone === "expired"
          ? "bg-danger-soft text-danger"
          : "bg-surface-sunken text-text-secondary";

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
        className
      )}
    >
      {label}
    </span>
  );
}

function AttachmentChip({
  label,
  attached,
}: {
  label: string;
  attached: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-[20px] border border-border-subtle bg-surface-card px-4 py-3 shadow-[var(--shadow-sm)]">
      <span className="text-sm text-text-secondary">{label}</span>
      <span
        className={cn(
          "rounded-full px-2.5 py-1 text-xs font-semibold",
          attached
            ? "bg-home-health-soft text-home-health"
            : "bg-surface-sunken text-text-tertiary"
        )}
      >
        {attached ? "Yes" : "No"}
      </span>
    </div>
  );
}

function DocumentTypeIcon({ type }: { type: string }) {
  if (type === "Receipt") {
    return <Receipt size={18} />;
  }

  if (type === "Warranty") {
    return <ShieldCheck size={18} />;
  }

  return <FileText size={18} />;
}
