"use client";

import {
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  FileText,
  Inbox,
  Loader2,
  Mail,
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

type ImportAddressResponse = {
  emailAddress: string;
  token?: string;
  domain?: string;
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

  const [
    importEmail,
    setImportEmail,
  ] = useState<string | null>(null);

  const [
    importEmailLoading,
    setImportEmailLoading,
  ] = useState(true);

  const [
    copied,
    setCopied,
  ] = useState(false);

  const loadImportAddress =
    useCallback(async () => {
      setImportEmailLoading(true);

      try {
        const response =
          await fetch(
            "/api/import-address",
            {
              method: "GET",
              cache: "no-store",
            }
          );

        const data:
          ImportAddressResponse & {
            error?: string;
          } =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ??
              "Unable to load your Smart Import email."
          );
        }

        setImportEmail(
          data.emailAddress
        );
      } catch (err) {
        console.error(
          "Unable to load Smart Import email:",
          err
        );
      } finally {
        setImportEmailLoading(false);
      }
    }, []);

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
    void Promise.all([
      loadImportAddress(),
      loadImports(),
    ]);
  }, [
    loadImportAddress,
    loadImports,
  ]);

  async function copyImportEmail() {
    if (!importEmail) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        importEmail
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError(
        "Unable to copy the email address."
      );
    }
  }

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
    <main className="min-h-screen bg-[#eee9df] px-5 py-8 text-[#17212a] md:px-8 md:py-10 lg:px-12">
      <div className="mx-auto max-w-[1180px]">
        {/* HEADER */}

        <div className="flex flex-col gap-6 border-b border-[#182533]/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#617c43]/20 bg-[#617c43]/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#617c43]">
              <Sparkles
                size={14}
                aria-hidden
              />

              Smart Import
            </div>

            <h1 className="mt-4 max-w-2xl font-serif text-4xl font-medium leading-[1.03] tracking-[-0.045em] text-[#101a22] sm:text-5xl">
              Forward it. We&apos;ll
              do the typing.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#68737b] sm:text-base">
              Send your receipts and
              order confirmations to
              your personal Home Tech
              Vault email. We&apos;ll
              pull out the important
              details and prepare them
              for review.
            </p>
          </div>

          <Link
            href="/devices"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#617c43] transition hover:text-[#718d4f]"
          >
            My devices

            <ArrowRight
              size={15}
              aria-hidden
            />
          </Link>
        </div>

        {/* PERSONAL IMPORT EMAIL */}

        <section className="relative mt-8 overflow-hidden rounded-[30px] border border-white/10 bg-[#0b1623] text-[#f4f0e8] shadow-[0_30px_70px_-44px_rgba(0,0,0,0.7)]">
          <div className="p-5 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#617c43]/15 bg-[#617c43]/10 text-[#617c43]">
                  <Mail
                    size={22}
                    aria-hidden
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#617c43]">
                    Your Smart Import
                    Email
                  </p>

                  {importEmailLoading ? (
                    <div className="mt-2 flex items-center gap-2 text-sm text-white/45">
                      <Loader2
                        size={15}
                        className="animate-spin"
                        aria-hidden
                      />

                      Creating your
                      personal address...
                    </div>
                  ) : importEmail ? (
                    <p className="mt-2 break-all font-serif text-lg font-medium tracking-[-0.02em] text-[#f4f0e8] sm:text-xl">
                      {importEmail}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-white/45">
                      Your Smart Import
                      address is currently
                      unavailable.
                    </p>
                  )}
                </div>
              </div>

              {importEmail && (
                <button
                  type="button"
                  onClick={
                    copyImportEmail
                  }
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 text-sm font-semibold text-[#dce2e5] transition hover:border-[#718d4f]/30 hover:bg-white/[0.08] hover:text-white"
                >
                  {copied ? (
                    <>
                      <Check
                        size={16}
                        aria-hidden
                      />

                      Copied
                    </>
                  ) : (
                    <>
                      <Copy
                        size={16}
                        aria-hidden
                      />

                      Copy Email
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="mt-6 grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-3">
              <ImportStep
                number="1"
                title="Forward"
                text="Send a receipt or order confirmation."
              />

              <ImportStep
                number="2"
                title="We organize it"
                text="Home Tech Vault extracts the useful details."
              />

              <ImportStep
                number="3"
                title="You approve"
                text="Nothing enters your vault until you say so."
              />
            </div>

            <div className="mt-5 rounded-2xl border border-[#718d4f]/15 bg-[#718d4f]/8 px-4 py-3">
              <p className="text-xs leading-5 text-[#aeb8c1]">
                <span className="font-semibold text-[#f4f0e8]">
                  Tip:
                </span>{" "}
                Save this address as
                &quot;Home Tech
                Vault&quot; in your
                contacts. Then whenever
                you buy a new device,
                simply forward the order
                confirmation here.
              </p>
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-6 rounded-2xl border border-[#a6584e]/20 bg-[#a6584e]/10 px-4 py-3 text-sm text-[#984e46]">
            {error}
          </div>
        )}

        {/* REVIEW HEADER */}

        {!loading &&
          imports.length > 0 && (
            <div className="mt-10">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#617c43]">
                  Ready for review
                </p>

                <h2 className="mt-2 font-serif text-3xl font-medium tracking-[-0.035em] text-[#17212a]">
                  We found{" "}
                  {imports.length === 1
                    ? "something"
                    : `${imports.length} things`}{" "}
                  for your vault.
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#68737b]">
                  Check the details below.
                  You can edit anything
                  before adding it.
                </p>
              </div>
            </div>
          )}

        {/* IMPORTS */}

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <Loader2
                size={28}
                className="mx-auto animate-spin text-[#617c43]"
              />

              <p className="mt-3 text-sm text-[#7c878e]">
                Checking your
                imports...
              </p>
            </div>
          </div>
        ) : imports.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mt-6 space-y-6">
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

function ImportStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#617c43] text-xs font-bold text-white">
        {number}
      </div>

      <div>
        <p className="text-xs font-semibold text-[#f4f0e8]">
          {title}
        </p>

        <p className="mt-0.5 text-[11px] leading-5 text-white/40">
          {text}
        </p>
      </div>
    </div>
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
    <article className="overflow-hidden rounded-[28px] border border-[#182533]/10 bg-[#f8f5ef] shadow-[0_24px_55px_-42px_rgba(15,25,35,0.5)]">
      <div className="flex flex-col gap-5 border-b border-[#182533]/8 bg-[#eee9df]/55 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-7">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#617c43]/15 bg-[#617c43]/10 text-[#617c43]">
            <PackageCheck
              size={22}
              aria-hidden
            />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#617c43]">
              We found something
            </p>

            <h2 className="mt-2 font-serif text-2xl font-medium tracking-[-0.03em] text-[#17212a]">
              {draft.device_name ||
                "Unnamed device"}
            </h2>

            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#7a858d]">
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
          <div className="rounded-full border border-[#617c43]/15 bg-[#617c43]/10 px-3 py-1.5 text-xs font-semibold text-[#617c43]">
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

        <div className="mt-7 rounded-2xl border border-[#182533]/8 bg-[#eee9df]/55 p-4">
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

        <div className="mt-7 flex flex-col gap-5 border-t border-[#182533]/8 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <MapPin
              size={16}
              className="mt-0.5 shrink-0 text-[#7a858d]"
              aria-hidden
            />

            <p className="max-w-md text-xs leading-5 text-[#7a858d]">
              Review anything that
              looks wrong. Nothing is
              added to your vault until
              you approve it.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={busy}
              onClick={onReject}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#182533]/10 bg-transparent px-5 text-sm font-semibold text-[#68737b] transition hover:border-[#a6584e]/20 hover:bg-[#a6584e]/8 hover:text-[#984e46] disabled:cursor-not-allowed disabled:opacity-60"
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

                  Don&apos;t Add to My
                  Vault
                </>
              )}
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={onApprove}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#718d4f]/30 bg-[#617c43] px-5 text-sm font-semibold text-white shadow-[0_12px_28px_-18px_rgba(97,124,67,0.85)] transition hover:bg-[#718d4f] disabled:cursor-not-allowed disabled:opacity-60"
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
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#66727a]">
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
        className="h-11 w-full rounded-xl border border-[#182533]/10 bg-[#eee9df]/45 px-3.5 text-sm text-[#17212a] outline-none transition placeholder:text-[#929ba1] focus:border-[#617c43]/40 focus:bg-[#f8f5ef] focus:ring-4 focus:ring-[#617c43]/10"
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
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#617c43]/10 text-[#617c43]">
        <Icon
          size={15}
          aria-hidden
        />
      </div>

      <div>
        <p className="text-xs font-semibold text-[#f4f0e8]">
          {title}
        </p>

        <p className="mt-0.5 text-[11px] text-[#7a858d]">
          {text}
        </p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto flex min-h-[320px] max-w-xl flex-col items-center justify-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#617c43]/15 bg-[#617c43]/10 text-[#617c43]">
        <Inbox
          size={25}
          aria-hidden
        />
      </div>

      <h2 className="mt-5 font-serif text-2xl font-medium tracking-[-0.03em] text-[#17212a]">
        Nothing to review right now.
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-[#68737b]">
        Forward your next receipt or
        order confirmation to your
        Smart Import email above.
        We&apos;ll prepare anything we
        find for your approval.
      </p>

      <Link
        href="/devices"
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#617c43] transition hover:text-[#718d4f]"
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