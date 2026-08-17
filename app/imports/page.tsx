"use client";

import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Inbox,
  Loader2,
  MapPin,
  PackageCheck,
  Receipt,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

type DeviceImport = {
  id: string;

  retailer: string | null;
  order_number: string | null;

  device_name: string | null;
  category: string | null;

  brand: string | null;
  manufacturer: string | null;

  model_number: string | null;
  serial_number: string | null;

  purchase_date: string | null;

  purchase_price:
    | number
    | string
    | null;

  warranty_expiration:
    | string
    | null;

  location: string | null;

  confidence: number | null;

  status: string;

  created_at: string;
};

type EditableImport = {
  device_name: string;
  category: string;
  brand: string;
  manufacturer: string;
  model_number: string;
  serial_number: string;
  purchase_date: string;
  purchase_price: string;
  warranty_expiration: string;
  location: string;
};

export default function ImportsPage() {
  const [
    imports,
    setImports,
  ] = useState<DeviceImport[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    approvingId,
    setApprovingId,
  ] = useState<string | null>(null);

  const [
    rejectingId,
    setRejectingId,
  ] = useState<string | null>(null);

  const [
    drafts,
    setDrafts,
  ] = useState<
    Record<string, EditableImport>
  >({});

  const loadImports =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const response =
          await fetch(
            "/api/imports",
            {
              method: "GET",
              cache: "no-store",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ??
              "Unable to load imports."
          );
        }

        const nextImports:
          DeviceImport[] =
          data.imports ?? [];

        setImports(nextImports);

        const nextDrafts: Record<
          string,
          EditableImport
        > = {};

        for (
          const item of nextImports
        ) {
          nextDrafts[item.id] = {
            device_name:
              item.device_name ?? "",

            category:
              item.category ?? "Other",

            brand:
              item.brand ?? "",

            manufacturer:
              item.manufacturer ?? "",

            model_number:
              item.model_number ?? "",

            serial_number:
              item.serial_number ?? "",

            purchase_date:
              item.purchase_date ?? "",

            purchase_price:
              item.purchase_price != null
                ? String(
                    item.purchase_price
                  )
                : "",

            warranty_expiration:
              item.warranty_expiration ??
              "",

            location:
              item.location ?? "",
          };
        }

        setDrafts(nextDrafts);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load imports."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadImports();
  }, [loadImports]);

  function updateDraft(
    id: string,
    field: keyof EditableImport,
    value: string
  ) {
    setDrafts((current) => ({
      ...current,

      [id]: {
        ...current[id],
        [field]: value,
      },
    }));
  }

  async function approveImport(
    id: string
  ) {
    const draft = drafts[id];

    if (!draft) {
      return;
    }

    if (
      !draft.device_name.trim()
    ) {
      setError(
        "Give the device a name before adding it to your vault."
      );

      return;
    }

    setApprovingId(id);
    setError(null);

    try {
      const response =
        await fetch(
          `/api/imports/${id}/approve`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              device_name:
                draft.device_name,

              category:
                draft.category,

              brand:
                draft.brand,

              manufacturer:
                draft.manufacturer,

              model_number:
                draft.model_number,

              serial_number:
                draft.serial_number,

              purchase_date:
                draft.purchase_date,

              purchase_price:
                draft.purchase_price
                  ? Number(
                      draft.purchase_price
                    )
                  : null,

              warranty_expiration:
                draft.warranty_expiration,

              location:
                draft.location,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Unable to add device."
        );
      }

      removeImportFromPage(id);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to approve import."
      );
    } finally {
      setApprovingId(null);
    }
  }

  async function rejectImport(
    id: string
  ) {
    setRejectingId(id);
    setError(null);

    try {
      const response =
        await fetch(
          `/api/imports/${id}/reject`,
          {
            method: "POST",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Unable to remove import."
        );
      }

      removeImportFromPage(id);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to remove import."
      );
    } finally {
      setRejectingId(null);
    }
  }

  function removeImportFromPage(
    id: string
  ) {
    setImports((current) =>
      current.filter(
        (item) =>
          item.id !== id
      )
    );

    setDrafts((current) => {
      const next = {
        ...current,
      };

      delete next[id];

      return next;
    });
  }

  return (
    <main className="min-h-screen bg-surface-base px-5 py-10 md:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-6 border-b border-border-subtle pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-home-health/15 bg-home-health-soft px-3 py-1.5 text-xs font-semibold text-home-health">
              <Sparkles
                size={14}
                aria-hidden
              />

              Smart Import
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-text-primary sm:text-4xl">
              We found a few things
              for your vault.
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary sm:text-base">
              Review what we found
              before anything is added
              to your Home Tech Vault.
            </p>
          </div>

          <Link
            href="/devices"
            className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition hover:text-text-primary"
          >
            My devices

            <ArrowRight
              size={15}
              aria-hidden
            />
          </Link>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[360px] items-center justify-center">
            <div className="text-center">
              <Loader2
                size={28}
                className="mx-auto animate-spin text-home-health"
              />

              <p className="mt-3 text-sm text-text-muted">
                Checking your imports...
              </p>
            </div>
          </div>
        ) : imports.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mt-8 space-y-6">
            {imports.map(
              (item) => {
                const draft =
                  drafts[item.id];

                if (!draft) {
                  return null;
                }

                return (
                  <ImportCard
                    key={item.id}
                    item={item}
                    draft={draft}

                    approving={
                      approvingId ===
                      item.id
                    }

                    rejecting={
                      rejectingId ===
                      item.id
                    }

                    busy={
                      approvingId ===
                        item.id ||
                      rejectingId ===
                        item.id
                    }

                    onChange={(
                      field,
                      value
                    ) =>
                      updateDraft(
                        item.id,
                        field,
                        value
                      )
                    }

                    onApprove={() =>
                      approveImport(
                        item.id
                      )
                    }

                    onReject={() =>
                      rejectImport(
                        item.id
                      )
                    }
                  />
                );
              }
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function ImportCard({
  item,
  draft,
  approving,
  rejecting,
  busy,
  onChange,
  onApprove,
  onReject,
}: {
  item: DeviceImport;

  draft: EditableImport;

  approving: boolean;
  rejecting: boolean;
  busy: boolean;

  onChange: (
    field: keyof EditableImport,
    value: string
  ) => void;

  onApprove: () => void;
  onReject: () => void;
}) {
  const confidence =
    typeof item.confidence ===
    "number"
      ? Math.round(
          item.confidence * 100
        )
      : null;

  return (
    <article className="overflow-hidden rounded-[28px] border border-border-subtle bg-surface-card shadow-sm">
      <div className="flex flex-col gap-5 border-b border-border-subtle bg-home-health-soft/15 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-7">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-home-health-soft text-home-health">
            <PackageCheck
              size={22}
              aria-hidden
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-home-health">
              We found something
            </p>

            <h2 className="mt-1 text-xl font-semibold tracking-tight text-text-primary">
              {draft.device_name ||
                "Unnamed device"}
            </h2>

            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-muted">
              {item.retailer && (
                <span>
                  {item.retailer}
                </span>
              )}

              {item.order_number && (
                <span>
                  Order{" "}
                  {item.order_number}
                </span>
              )}
            </div>
          </div>
        </div>

        {confidence !== null && (
          <div className="rounded-full border border-border-subtle bg-surface-card px-3 py-1.5 text-xs font-semibold text-text-muted">
            {confidence}% match
          </div>
        )}
      </div>

      <div className="p-5 sm:p-7">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Device name"
            value={
              draft.device_name
            }
            onChange={(value) =>
              onChange(
                "device_name",
                value
              )
            }
          />

          <Field
            label="Category"
            value={draft.category}
            onChange={(value) =>
              onChange(
                "category",
                value
              )
            }
          />

          <Field
            label="Brand"
            value={draft.brand}
            onChange={(value) =>
              onChange(
                "brand",
                value
              )
            }
          />

          <Field
            label="Manufacturer"
            value={
              draft.manufacturer
            }
            onChange={(value) =>
              onChange(
                "manufacturer",
                value
              )
            }
          />

          <Field
            label="Model number"
            value={
              draft.model_number
            }
            onChange={(value) =>
              onChange(
                "model_number",
                value
              )
            }
          />

          <Field
            label="Serial number"
            value={
              draft.serial_number
            }
            placeholder="Add later"
            onChange={(value) =>
              onChange(
                "serial_number",
                value
              )
            }
          />

          <Field
            label="Purchase date"
            value={
              draft.purchase_date
            }
            type="date"
            onChange={(value) =>
              onChange(
                "purchase_date",
                value
              )
            }
          />

          <Field
            label="Purchase price"
            value={
              draft.purchase_price
            }
            type="number"
            placeholder="0.00"
            onChange={(value) =>
              onChange(
                "purchase_price",
                value
              )
            }
          />

          <Field
            label="Warranty expires"
            value={
              draft.warranty_expiration
            }
            type="date"
            onChange={(value) =>
              onChange(
                "warranty_expiration",
                value
              )
            }
          />

          <Field
            label="Where is it?"
            value={draft.location}
            placeholder="Living Room"
            onChange={(value) =>
              onChange(
                "location",
                value
              )
            }
          />
        </div>

        <div className="mt-7 rounded-2xl border border-border-subtle bg-surface-sunken/40 p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <MiniBenefit
              icon={Receipt}
              title="Purchase info"
              text="Already filled in"
            />

            <MiniBenefit
              icon={ShieldCheck}
              title="Warranty ready"
              text="Add coverage later"
            />

            <MiniBenefit
              icon={FileText}
              title="Documents"
              text="Attach anytime"
            />
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-5 border-t border-border-subtle pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <MapPin
              size={16}
              className="mt-0.5 shrink-0 text-text-muted"
              aria-hidden
            />

            <p className="max-w-md text-xs leading-5 text-text-muted">
              Review anything that looks
              wrong. Nothing is added to
              your vault until you approve
              it.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={busy}
              onClick={onReject}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border-subtle bg-surface-card px-5 text-sm font-semibold text-text-secondary transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {rejecting ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                    aria-hidden
                  />

                  Removing...
                </>
              ) : (
                <>
                  <XCircle
                    size={16}
                    aria-hidden
                  />

                  Don&apos;t Add to My Vault
                </>
              )}
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={onApprove}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-home-health px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {approving ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                    aria-hidden
                  />

                  Adding...
                </>
              ) : (
                <>
                  <CheckCircle2
                    size={16}
                    aria-hidden
                  />

                  Add to My Vault
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function Field({
  label,
  value,
  placeholder,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  type?: string;

  onChange: (
    value: string
  ) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-text-secondary">
        {label}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        step={
          type === "number"
            ? "0.01"
            : undefined
        }
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="h-11 w-full rounded-xl border border-border-subtle bg-surface-base px-3.5 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-home-health/50 focus:ring-2 focus:ring-home-health/10"
      />
    </label>
  );
}

function MiniBenefit({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Receipt;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-home-health-soft text-home-health">
        <Icon
          size={15}
          aria-hidden
        />
      </div>

      <div>
        <p className="text-xs font-semibold text-text-primary">
          {title}
        </p>

        <p className="mt-0.5 text-[11px] text-text-muted">
          {text}
        </p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto flex min-h-[420px] max-w-xl flex-col items-center justify-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-home-health-soft text-home-health">
        <Inbox
          size={25}
          aria-hidden
        />
      </div>

      <h2 className="mt-5 text-xl font-semibold tracking-tight text-text-primary">
        Nothing to review right now.
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">
        When Home Tech Vault finds
        something from a receipt or order
        confirmation, it&apos;ll appear
        here before being added to your
        vault.
      </p>

      <Link
        href="/devices"
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-home-health"
      >
        Go to my devices

        <ArrowRight
          size={15}
          aria-hidden
        />
      </Link>
    </div>
  );
}