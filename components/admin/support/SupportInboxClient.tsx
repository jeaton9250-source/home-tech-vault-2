"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  Loader2,
  Search,
} from "lucide-react";

import Button from "@/components/ui/Button";
import PageCard from "@/components/ui/PageCard";
import PageShell from "@/components/ui/PageShell";
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

export default function SupportInboxClient() {
  const [tickets, setTickets] = useState<
    InboxTicket[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [sort, setSort] = useState<
    "newest" | "oldest"
  >("newest");

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

      const payload =
        (await response.json()) as {
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
    void loadTickets();
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

  return (
    <PageShell>
      <section className="htv-hero-band overflow-hidden shadow-sm">
        <div className="px-6 py-9 md:px-10 md:py-11">
          <p className="text-overline text-charcoal-soft">
            Platform Admin
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
            Support Inbox
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-text-secondary md:text-base">
            Review customer requests, update ticket
            status, and reply from your support inbox
            using the customer Reply-To address.
          </p>

          {unreadCount > 0 && (
            <p className="mt-4 inline-flex rounded-full border border-warning/30 bg-warning-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-achievement">
              {unreadCount} need attention
            </p>
          )}
        </div>
      </section>

      <PageCard className="p-6 md:p-8">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))]">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
              Search
            </span>

            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Ticket number, name, email, subject"
                className="w-full rounded-2xl border border-border-subtle bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-interaction focus:ring-4 focus:ring-interaction/10"
              />
            </div>
          </label>

          <FilterSelect
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

          <FilterSelect
            label="Category"
            value={category}
            onChange={setCategory}
            options={SUPPORT_CATEGORIES.map(
              (value) => ({
                value,
                label: value,
              })
            )}
          />

          <FilterSelect
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

          <FilterSelect
            label="Sort"
            value={sort}
            onChange={(value) =>
              setSort(
                value === "oldest"
                  ? "oldest"
                  : "newest"
              )
            }
            options={[
              {
                value: "newest",
                label: "Newest first",
              },
              {
                value: "oldest",
                label: "Oldest first",
              },
            ]}
          />
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            onClick={() => {
              void loadTickets();
            }}
          >
            Apply Filters
          </Button>
        </div>

        {loading ? (
          <div className="mt-8 flex min-h-40 items-center justify-center text-text-secondary">
            <Loader2
              size={20}
              className="mr-3 animate-spin"
            />
            Loading support tickets...
          </div>
        ) : error ? (
          <div className="mt-8 rounded-[22px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : tickets.length === 0 ? (
          <div className="mt-8 rounded-[22px] border border-border-subtle bg-surface-sunken p-8 text-center text-sm text-text-secondary">
            No support tickets match these filters.
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-xs uppercase tracking-[0.14em] text-text-tertiary">
                  <th className="px-3 py-3 font-semibold">
                    Ticket
                  </th>
                  <th className="px-3 py-3 font-semibold">
                    Customer
                  </th>
                  <th className="px-3 py-3 font-semibold">
                    Subject
                  </th>
                  <th className="px-3 py-3 font-semibold">
                    Status
                  </th>
                  <th className="px-3 py-3 font-semibold">
                    Priority
                  </th>
                  <th className="px-3 py-3 font-semibold">
                    Created
                  </th>
                </tr>
              </thead>

              <tbody>
                {tickets.map((ticket) => {
                  const isUnread =
                    !ticket.admin_viewed_at ||
                    ticket.status === "new";

                  return (
                    <tr
                      key={ticket.id}
                      className="border-b border-border-subtle/70 hover:bg-surface-sunken/60"
                    >
                      <td className="px-3 py-4 align-top">
                        <Link
                          href={`/admin/support/${ticket.id}`}
                          className="font-semibold text-interaction hover:text-interaction-hover"
                        >
                          {ticket.ticket_number}
                        </Link>

                        {isUnread && (
                          <span className="ml-2 inline-flex rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-achievement">
                            New
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-4 align-top">
                        <p className="font-medium text-text-primary">
                          {ticket.name}
                        </p>
                        <p className="mt-1 text-xs text-text-secondary">
                          {ticket.email}
                        </p>
                      </td>

                      <td className="px-3 py-4 align-top">
                        <p className="font-medium text-text-primary">
                          {ticket.subject}
                        </p>
                        <p className="mt-1 text-xs text-text-secondary">
                          {ticket.category}
                        </p>
                      </td>

                      <td className="px-3 py-4 align-top capitalize text-text-secondary">
                        {statusLabel(ticket.status)}
                      </td>

                      <td className="px-3 py-4 align-top capitalize text-text-secondary">
                        {ticket.priority}
                      </td>

                      <td className="px-3 py-4 align-top text-text-secondary">
                        {formatTimestamp(
                          ticket.created_at
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </PageCard>
    </PageShell>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-2xl border border-border-subtle bg-white px-4 py-3.5 text-sm outline-none transition focus:border-interaction focus:ring-4 focus:ring-interaction/10"
      >
        <option value="">All</option>

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
