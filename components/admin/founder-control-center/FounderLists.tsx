import Link from "next/link";
import {
  ArrowUpRight,
  CreditCard,
  UserPlus,
} from "lucide-react";

import { formatAdminDate } from "@/components/admin/AdminPanel";
import {
  FounderLinkAction,
  FounderSection,
} from "@/components/admin/founder-control-center/FounderHeader";
import type { FounderActivityEvent } from "@/lib/admin/founderControlCenter";
import type { AdminRecentSignup } from "@/lib/admin/types";
import { cn } from "@/lib/design-system/cn";

const activityIcons = {
  signup: UserPlus,
  upgrade: CreditCard,
  support: ArrowUpRight,
} as const;

type FounderRecentSignupsProps = {
  signups: AdminRecentSignup[];
};

export function FounderRecentSignups({
  signups,
}: FounderRecentSignupsProps) {
  return (
    <FounderSection
      id="founder-signups-heading"
      title="Recent Signups"
      subtitle="The five most recent user registrations."
      action={
        <FounderLinkAction
          href="/admin/users"
          label="View all users"
        />
      }
    >
      <div className="overflow-hidden rounded-[26px] border border-[#182533]/10 bg-[#fffdf9] shadow-[0_24px_60px_-52px_rgba(18,32,45,0.6)]">
        {signups.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-[#5f5b55]">
            No recent signups.
          </p>
        ) : (
          <ul className="divide-y divide-[#182533]/10">
            {signups.slice(0, 5).map((signup) => (
              <li key={signup.id}>
                <Link
                  href={`/admin/users?selected=${signup.id}`}
                  className="group flex flex-col gap-3 bg-[#fffdf9] px-5 py-5 transition hover:bg-[#f5f1e9] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-[#18202b]">
                      {signup.fullName ||
                        "Unnamed user"}
                    </p>
                    <p className="mt-1 text-sm text-[#5f5b55]">
                      {signup.email ?? "No email"}
                    </p>
                  </div>
                  <p className="text-xs text-[#777169]">
                    {formatAdminDate(
                      signup.createdAt
                    )}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </FounderSection>
  );
}

export function FounderActivityTimeline({
  events,
}: {
  events: FounderActivityEvent[];
}) {
  return (
    <FounderSection
      id="founder-activity-heading"
      title="Platform Activity"
      subtitle="Recent meaningful events across the platform."
    >
      <ol className="rounded-[26px] border border-[#182533]/10 bg-[#fffdf9] px-6 py-6 shadow-[0_24px_60px_-52px_rgba(18,32,45,0.6)]">
        {events.length === 0 ? (
          <li className="rounded-[20px] border border-border-subtle bg-surface-sunken px-5 py-8 text-center text-sm text-[#5f5b55]">
            No recent platform activity.
          </li>
        ) : (
          events.map((event, index) => {
            const Icon =
              activityIcons[event.kind];

            const content = (
              <>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#182533]/10 bg-[#f5f1e9] text-[#617c43]">
                    <Icon
                      aria-hidden="true"
                      className="h-4 w-4"
                    />
                  </span>
                  <time
                    dateTime={event.timestamp}
                    className="text-xs text-[#777169]"
                  >
                    {formatAdminDate(
                      event.timestamp
                    )}
                  </time>
                </div>
                <p className="mt-3 text-[14px] leading-6 text-[#333c44]">
                  {event.description}
                </p>
              </>
            );

            return (
              <li
                key={event.id}
                className={cn(
                  "relative border-l border-[#dcd5ca] pl-7",
                  index < events.length - 1
                    ? "pb-6"
                    : "pb-0"
                )}
              >
                <span
                  aria-hidden="true"
                  className="absolute -left-[6px] top-3 h-3 w-3 rounded-full border-2 border-[#fffdf9] bg-[#718d4f] shadow-[0_0_0_1px_rgba(113,141,79,0.25)]"
                />
                {event.href ? (
                  <Link
                    href={event.href}
                    className="block rounded-[18px] px-2 py-1 transition hover:bg-surface-sunken"
                  >
                    {content}
                  </Link>
                ) : (
                  <div className="px-2 py-1">
                    {content}
                  </div>
                )}
              </li>
            );
          })
        )}
      </ol>
    </FounderSection>
  );
}

export function FounderQuickActions() {
  return (
    <FounderSection
      id="founder-actions-heading"
      title="Admin Actions"
      subtitle="Common workflows across the platform."
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {[
          {
            href: "/admin/users",
            label: "Manage Users",
            description:
              "Search accounts and review access",
          },
          {
            href: "/admin/households",
            label: "Manage Households",
            description:
              "Review membership and ownership",
          },
          {
            href: "/admin/analytics",
            label: "View Reports",
            description:
              "Signups, plans, and platform totals",
          },
          {
            href: "/admin/emails",
            label: "Send Announcement",
            description:
              "Review templates and send test email",
          },
          {
            href: "/admin/system",
            label: "Platform Settings",
            description:
              "Configuration and health checks",
          },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group flex min-h-[120px] flex-col justify-between rounded-[22px] border border-border-subtle bg-surface-sunken p-5 transition hover:border-charcoal/10 hover:bg-surface-card"
          >
            <div>
              <p className="text-base font-semibold text-text-primary">
                {action.label}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#5f5b55]">
                {action.description}
              </p>
            </div>
            <ArrowUpRight
              aria-hidden="true"
              className="mt-4 h-4 w-4 text-[#777169] transition group-hover:text-charcoal"
            />
          </Link>
        ))}
      </div>
    </FounderSection>
  );
}
