"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Loader2,
  Mail,
} from "lucide-react";

import Button from "@/components/ui/Button";
import PageCard from "@/components/ui/PageCard";
import PageShell from "@/components/ui/PageShell";
import {
  SUPPORT_TICKET_PRIORITIES,
  SUPPORT_TICKET_STATUSES,
  type SupportTicketNoteRecord,
  type SupportTicketPriority,
  type SupportTicketRecord,
  type SupportTicketStatus,
} from "@/lib/support/types";

type TicketDetailPayload = {
  ticket: SupportTicketRecord;
  notes: SupportTicketNoteRecord[];
};

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString(
    "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}

function statusLabel(status: SupportTicketStatus) {
  return status
    .split("_")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1)
    )
    .join(" ");
}

export default function SupportTicketDetailClient({
  ticketId,
}: {
  ticketId: string;
}) {
  const [ticket, setTicket] =
    useState<SupportTicketRecord | null>(
      null
    );
  const [notes, setNotes] = useState<
    SupportTicketNoteRecord[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [noteBody, setNoteBody] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copied, setCopied] = useState(false);

  async function loadTicket() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/support/tickets/${ticketId}`
      );

      const payload =
        (await response.json()) as TicketDetailPayload & {
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          payload.error ||
            "Unable to load support ticket."
        );
      }

      setTicket(payload.ticket);
      setNotes(payload.notes ?? []);

      if (
        !payload.ticket.admin_viewed_at ||
        payload.ticket.status === "new"
      ) {
        await fetch(
          `/api/admin/support/tickets/${ticketId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              markViewed: true,
              status:
                payload.ticket.status === "new"
                  ? "open"
                  : undefined,
            }),
          }
        );
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load support ticket."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTicket();
  }, [ticketId]);

  async function updateTicket(
    updates: {
      status?: SupportTicketStatus;
      priority?: SupportTicketPriority;
    }
  ) {
    if (!ticket) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/support/tickets/${ticketId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        }
      );

      const payload =
        (await response.json()) as {
          ticket?: SupportTicketRecord;
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          payload.error ||
            "Unable to update support ticket."
        );
      }

      setTicket(payload.ticket ?? ticket);
      setSuccess("Ticket updated.");
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update support ticket."
      );
    } finally {
      setSaving(false);
    }
  }

  async function addNote() {
    const body = noteBody.trim();

    if (body.length < 2) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/support/tickets/${ticketId}/notes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ body }),
        }
      );

      const payload =
        (await response.json()) as {
          note?: SupportTicketNoteRecord;
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          payload.error ||
            "Unable to save internal note."
        );
      }

      if (payload.note) {
        setNotes((current) => [
          ...current,
          payload.note!,
        ]);
      }

      setNoteBody("");
      setSuccess("Internal note saved.");
    } catch (noteError) {
      setError(
        noteError instanceof Error
          ? noteError.message
          : "Unable to save internal note."
      );
    } finally {
      setSaving(false);
    }
  }

  async function copyCustomerEmail() {
    if (!ticket) {
      return;
    }

    await navigator.clipboard.writeText(
      ticket.email
    );
    setCopied(true);
    window.setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  if (loading) {
    return (
      <PageShell>
        <div className="flex min-h-64 items-center justify-center text-text-secondary">
          <Loader2
            size={20}
            className="mr-3 animate-spin"
          />
          Loading ticket...
        </div>
      </PageShell>
    );
  }

  if (!ticket) {
    return (
      <PageShell>
        <PageCard className="p-8">
          <p className="text-sm text-red-700">
            {error || "Ticket not found."}
          </p>

          <Button
            href="/admin/support"
            className="mt-6"
            variant="secondary"
          >
            Back to inbox
          </Button>
        </PageCard>
      </PageShell>
    );
  }

  const mailtoHref = `mailto:${encodeURIComponent(ticket.email)}?subject=${encodeURIComponent(`Re: ${ticket.ticket_number} — ${ticket.subject}`)}`;

  return (
    <PageShell>
      <section className="htv-hero-band overflow-hidden shadow-sm">
        <div className="px-6 py-9 md:px-10 md:py-11">
          <Link
            href="/admin/support"
            className="inline-flex items-center gap-2 text-sm font-semibold text-interaction transition hover:text-interaction-hover"
          >
            <ArrowLeft size={16} />
            Back to Support Inbox
          </Link>

          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] md:text-4xl">
            {ticket.ticket_number}
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-text-secondary md:text-base">
            {ticket.category}: {ticket.subject}
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <PageCard className="p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-overline text-charcoal-soft">
                Customer Message
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
                {ticket.name}
              </h2>

              <p className="mt-2 text-sm text-text-secondary">
                {ticket.email}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  void copyCustomerEmail();
                }}
              >
                <Copy size={16} />
                {copied
                  ? "Copied"
                  : "Copy email"}
              </Button>

              <Button href={mailtoHref}>
                <Mail size={16} />
                Reply by email
              </Button>
            </div>
          </div>

          <div className="mt-6 rounded-[24px] border border-border-subtle bg-surface-sunken p-5">
            <p className="whitespace-pre-wrap text-sm leading-7 text-text-primary">
              {ticket.message}
            </p>
          </div>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <DetailItem
              label="Submitted"
              value={formatTimestamp(
                ticket.created_at
              )}
            />
            <DetailItem
              label="Effective plan"
              value={
                ticket.effective_plan ||
                "Not available"
              }
            />
            <DetailItem
              label="Household role"
              value={
                ticket.household_role ||
                "Not available"
              }
            />
            <DetailItem
              label="Source page"
              value={
                ticket.source_page ||
                "Not provided"
              }
            />
          </dl>
        </PageCard>

        <div className="space-y-6">
          <PageCard className="p-6 md:p-7">
            <p className="text-overline text-charcoal-soft">
              Ticket Controls
            </p>

            <div className="mt-4 space-y-4">
              <ControlSelect
                label="Status"
                value={ticket.status}
                options={SUPPORT_TICKET_STATUSES.map(
                  (value) => ({
                    value,
                    label: statusLabel(value),
                  })
                )}
                onChange={(value) => {
                  void updateTicket({
                    status:
                      value as SupportTicketStatus,
                  });
                }}
                disabled={saving}
              />

              <ControlSelect
                label="Priority"
                value={ticket.priority}
                options={SUPPORT_TICKET_PRIORITIES.map(
                  (value) => ({
                    value,
                    label:
                      value.charAt(0).toUpperCase() +
                      value.slice(1),
                  })
                )}
                onChange={(value) => {
                  void updateTicket({
                    priority:
                      value as SupportTicketPriority,
                  });
                }}
                disabled={saving}
              />

              <Button
                type="button"
                variant="secondary"
                disabled={saving}
                onClick={() => {
                  void updateTicket({
                    status: "resolved",
                  });
                }}
              >
                <CheckCircle2 size={16} />
                Mark resolved
              </Button>
            </div>

            {success && (
              <p className="mt-4 text-sm text-emerald-700">
                {success}
              </p>
            )}

            {error && (
              <p className="mt-4 text-sm text-red-700">
                {error}
              </p>
            )}
          </PageCard>

          <PageCard className="p-6 md:p-7">
            <p className="text-overline text-charcoal-soft">
              Internal Notes
            </p>

            <div className="mt-4 space-y-4">
              {notes.length === 0 ? (
                <p className="text-sm text-text-secondary">
                  No internal notes yet.
                </p>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-[20px] border border-border-subtle bg-surface-sunken p-4"
                  >
                    <p className="whitespace-pre-wrap text-sm leading-6 text-text-primary">
                      {note.body}
                    </p>
                    <p className="mt-2 text-xs text-text-tertiary">
                      {formatTimestamp(
                        note.created_at
                      )}
                    </p>
                  </div>
                ))
              )}

              <textarea
                value={noteBody}
                onChange={(event) =>
                  setNoteBody(event.target.value)
                }
                rows={5}
                placeholder="Add an internal note for the support team."
                className="w-full resize-y rounded-2xl border border-border-subtle bg-white px-4 py-3.5 text-sm leading-6 outline-none transition focus:border-interaction focus:ring-4 focus:ring-interaction/10"
              />

              <Button
                type="button"
                disabled={
                  saving ||
                  noteBody.trim().length < 2
                }
                onClick={() => {
                  void addNote();
                }}
              >
                Save internal note
              </Button>
            </div>
          </PageCard>
        </div>
      </section>
    </PageShell>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
        {label}
      </dt>
      <dd className="mt-2 text-sm text-text-primary">
        {value}
      </dd>
    </div>
  );
}

function ControlSelect({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-text-primary">
        {label}
      </span>

      <select
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-2xl border border-border-subtle bg-white px-4 py-3.5 text-sm outline-none transition focus:border-interaction focus:ring-4 focus:ring-interaction/10 disabled:opacity-60"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
