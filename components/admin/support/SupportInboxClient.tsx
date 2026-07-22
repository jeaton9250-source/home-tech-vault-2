"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  AdminContentSection,
  AdminEmptyState,
  AdminErrorState,
  AdminFilterSelect,
  AdminList,
  AdminLoadingState,
  AdminPageHero,
  AdminSearchField,
  AdminSearchFilters,
  AdminStatusBadge,
  AdminSummaryCard,
  AdminSummaryGrid,
} from "@/components/admin/layout/AdminPageLayout";
import Button from "@/components/ui/Button";
import { SUPPORT_CATEGORIES } from "@/lib/support/categories";
import {
  SUPPORT_TICKET_PRIORITIES,
  SUPPORT_TICKET_STATUSES,
  type SupportTicketPriority,
  type SupportTicketStatus,
} from "@/lib/support/types";

type InboxTicket = {
  id: string;
  ticket_number: string;
  name: string;
  email: string;
  subject: string;
  category: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  admin_viewed_at: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  effective_plan: string | null;
  household_role: string | null;
  source_page: string | null;
};

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusLabel(status: SupportTicketStatus) {
  return status
    .split("_")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() + part.slice(1)
    )
    .join(" ");
}

export default function SupportInboxClient() {
  const [tickets, setTickets] = useState<InboxTicket[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">(
    "newest"
  );

  async function loadTickets() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("q", search.trim());
      }

      if (status) {
        params.set("status", status);
      }

      if (category) {
        params.set("category", category);
      }

      if (priority) {
        params.set("priority", priority);
      }

      params.set("sort", sort);

      const response = await fetch(
        `/api/admin/support/tickets?${params.toString()}`
      );

      const payload = (await response.json()) as {
        tickets?: InboxTicket[];
        error?: string;
      };

      if (!response.ok) {
        setTickets([]);
        throw new Error(
          response.status === 404 ||
            response.status === 401 ||
            response.status === 403
            ? "Support Inbox is unavailable."
            : payload.error ||
                "Unable to load support tickets."
        );
      }

      setTickets(payload.tickets ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load support tickets."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTickets();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const unreadCount = useMemo(
    () =>
      tickets.filter(
        (ticket) =>
          !ticket.admin_viewed_at ||
          ticket.status === "new"
      ).length,
    [tickets]
  );

  const openCount = useMemo(
    () =>
      tickets.filter((ticket) =>
        [
          "new",
          "open",
          "in_progress",
          "waiting_on_customer",
        ].includes(ticket.status)
      ).length,
    [tickets]
  );

  return (
    <>
      <AdminPageHero
        title="Support Inbox"
        description="Review customer requests, update ticket status, and reply using the customer Reply-To address."
        badge={
          unreadCount > 0 ? (
            <AdminStatusBadge tone="warning">
              {unreadCount} need attention
            </AdminStatusBadge>
          ) : null
        }
      />

      <AdminSummaryGrid>
        <AdminSummaryCard
          label="Visible tickets"
          value={tickets.length}
        />
        <AdminSummaryCard
          label="Need attention"
          value={unreadCount}
        />
        <AdminSummaryCard
          label="Open"
          value={openCount}
        />
        <AdminSummaryCard
          label="Sort order"
          value={sort === "newest" ? "Newest" : "Oldest"}
        />
      </AdminSummaryGrid>

      <AdminSearchFilters>
        <AdminSearchField
          className="md:col-span-2"
          value={search}
          onChange={setSearch}
          placeholder="Search ticket number, name, email, or subject"
        />
        <AdminFilterSelect
          label="Status"
          value={status}
          onChange={setStatus}
          options={SUPPORT_TICKET_STATUSES.map(
            (value) => ({
              value,
              label: statusLabel(value),
            })
          )}
        />
        <AdminFilterSelect
          label="Category"
          value={category}
          onChange={setCategory}
          options={SUPPORT_CATEGORIES.map((value) => ({
            value,
            label: value,
          }))}
        />
        <AdminFilterSelect
          label="Priority"
          value={priority}
          onChange={setPriority}
          options={SUPPORT_TICKET_PRIORITIES.map(
            (value) => ({
              value,
              label:
                value.charAt(0).toUpperCase() +
                value.slice(1),
            })
          )}
        />
        <AdminFilterSelect
          label="Sort"
          value={sort}
          onChange={(value) =>
            setSort(value === "oldest" ? "oldest" : "newest")
          }
          options={[
            { value: "newest", label: "Newest first" },
            { value: "oldest", label: "Oldest first" },
          ]}
        />
      </AdminSearchFilters>

      <AdminContentSection
        id="support-inbox-heading"
        title="Support tickets"
        subtitle="Select a ticket to review the full conversation."
        action={
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => {
              void loadTickets();
            }}
          >
            Apply filters
          </Button>
        }
      >
        {loading ? (
          <AdminLoadingState label="Loading support tickets…" />
        ) : error ? (
          <AdminErrorState message={error} />
        ) : tickets.length === 0 ? (
          <AdminEmptyState
            title="No tickets found"
            description="No support tickets match these filters."
          />
        ) : (
          <AdminList>
            {tickets.map((ticket) => {
              const isUnread =
                !ticket.admin_viewed_at ||
                ticket.status === "new";

              return (
                <li key={ticket.id}>
                  <Link
                    href={`/admin/support/${ticket.id}`}
                    className="block bg-surface-sunken px-4 py-4 transition hover:bg-surface-card"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-interaction">
                            {ticket.ticket_number}
                          </p>
                          {isUnread ? (
                            <AdminStatusBadge tone="warning">
                              New
                            </AdminStatusBadge>
                          ) : null}
                        </div>
                        <p className="mt-2 font-medium text-text-primary">
                          {ticket.subject}
                        </p>
                        <p className="mt-1 text-sm text-text-secondary">
                          {ticket.name} · {ticket.email}
                        </p>
                        <p className="mt-1 text-xs text-text-tertiary">
                          {ticket.category}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-sm capitalize text-text-primary">
                          {statusLabel(ticket.status)}
                        </p>
                        <p className="mt-1 text-sm capitalize text-text-secondary">
                          {ticket.priority}
                        </p>
                        <p className="mt-1 text-xs text-text-tertiary">
                          {formatTimestamp(ticket.created_at)}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </AdminList>
        )}
      </AdminContentSection>
    </>
  );
}
