"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  ArrowLeft,
  CheckCircle2,
  Copy,
} from "lucide-react";

import {
  AdminContentSection,
  AdminDetailField,
  AdminErrorState,
  AdminFilterSelect,
  AdminLoadingState,
  AdminPageHero,
  AdminStatusBadge,
  AdminSummaryCard,
  AdminSummaryGrid,
} from "@/components/admin/layout/AdminPageLayout";
import Button from "@/components/ui/Button";
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

function statusTone(
  status: SupportTicketStatus
): "neutral" | "success" | "warning" | "danger" | "info" {
  switch (status) {
    case "new":
      return "warning";
    case "open":
    case "in_progress":
      return "info";
    case "waiting_on_customer":
      return "neutral";
    case "resolved":
      return "success";
    case "closed":
      return "neutral";
    default:
      return "neutral";
  }
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

  const loadTicket = useCallback(async () => {
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
  }, [ticketId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTicket();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadTicket]);

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
      <AdminLoadingState label="Loading support ticket…" />
    );
  }

  if (!ticket) {
    return (
      <>
        <AdminPageHero
          title="Support ticket"
          description="The requested ticket could not be loaded."
        />
        <AdminErrorState
          message={error || "Ticket not found."}
        />
        <Button
          href="/admin/support"
          className="mt-4"
          variant="secondary"
        >
          Back to inbox
        </Button>
      </>
    );
  }

  const mailtoHref = `mailto:${encodeURIComponent(ticket.email)}?subject=${encodeURIComponent(`Re: ${ticket.ticket_number} — ${ticket.subject}`)}`;

  return (
    <>
      <Link
        href="/admin/support"
        className="inline-flex items-center gap-2 text-sm font-medium text-accent transition hover:underline"
      >
        <ArrowLeft size={16} />
        Back to Support Inbox
      </Link>

      <AdminPageHero
        title={ticket.ticket_number}
        description={`${ticket.category}: ${ticket.subject}`}
        badge={
          <AdminStatusBadge tone={statusTone(ticket.status)}>
            {statusLabel(ticket.status)}
          </AdminStatusBadge>
        }
        primaryAction={{
          label: "Reply by email",
          href: mailtoHref,
        }}
      />

      <AdminSummaryGrid>
        <AdminSummaryCard
          label="Customer"
          value={ticket.name}
          hint={ticket.email}
        />
        <AdminSummaryCard
          label="Priority"
          value={
            ticket.priority.charAt(0).toUpperCase() +
            ticket.priority.slice(1)
          }
        />
        <AdminSummaryCard
          label="Submitted"
          value={formatTimestamp(ticket.created_at)}
        />
        <AdminSummaryCard
          label="Effective plan"
          value={ticket.effective_plan || "Not available"}
        />
      </AdminSummaryGrid>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <AdminContentSection
          id="customer-message-heading"
          title="Customer message"
          subtitle={ticket.email}
          action={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                void copyCustomerEmail();
              }}
            >
              <Copy size={16} />
              {copied ? "Copied" : "Copy email"}
            </Button>
          }
        >
          <div className="rounded-[20px] bg-surface-sunken px-5 py-5">
            <p className="whitespace-pre-wrap text-sm leading-7 text-text-primary">
              {ticket.message}
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <AdminDetailField
              label="Household role"
              value={
                ticket.household_role ||
                "Not available"
              }
            />
            <AdminDetailField
              label="Source page"
              value={
                ticket.source_page ||
                "Not provided"
              }
            />
          </div>
        </AdminContentSection>

        <div className="space-y-4">
          <AdminContentSection
            id="ticket-controls-heading"
            title="Ticket controls"
            subtitle="Update status and priority."
          >
            <div className="grid gap-4">
              <AdminFilterSelect
                label="Status"
                value={ticket.status}
                includeAll={false}
                onChange={(value) => {
                  void updateTicket({
                    status:
                      value as SupportTicketStatus,
                  });
                }}
                options={SUPPORT_TICKET_STATUSES.map(
                  (value) => ({
                    value,
                    label: statusLabel(value),
                  })
                )}
              />

              <AdminFilterSelect
                label="Priority"
                value={ticket.priority}
                includeAll={false}
                onChange={(value) => {
                  void updateTicket({
                    priority:
                      value as SupportTicketPriority,
                  });
                }}
                options={SUPPORT_TICKET_PRIORITIES.map(
                  (value) => ({
                    value,
                    label:
                      value.charAt(0).toUpperCase() +
                      value.slice(1),
                  })
                )}
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

            {success ? (
              <p className="mt-4 text-sm text-emerald-700">
                {success}
              </p>
            ) : null}

            {error ? (
              <div className="mt-4">
                <AdminErrorState message={error} />
              </div>
            ) : null}
          </AdminContentSection>

          <AdminContentSection
            id="internal-notes-heading"
            title="Internal notes"
            subtitle="Visible only to the support team."
          >
            <div className="space-y-4">
              {notes.length === 0 ? (
                <p className="text-sm text-text-secondary">
                  No internal notes yet.
                </p>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-[20px] bg-surface-sunken px-4 py-4"
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
                className="w-full resize-y rounded-[20px] border border-border-subtle bg-surface-card px-4 py-3.5 text-sm leading-6 outline-none transition focus-visible:border-interaction/40 focus-visible:ring-2 focus-visible:ring-interaction/15"
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
          </AdminContentSection>
        </div>
      </section>
    </>
  );
}
