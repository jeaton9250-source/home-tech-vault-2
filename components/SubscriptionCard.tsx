import Link from "next/link";
import {
  CalendarDays,
  CreditCard,
  Edit3,
  Eye,
  Repeat2,
  StickyNote,
} from "lucide-react";

import DeleteSubscriptionButton from "@/components/DeleteSubscriptionButton";

type SubscriptionCardProps = {
  subscription: {
    id: string;
    service_name: string;
    category?: string | null;
    monthly_cost?: number | null;
    renewal_date?: string | null;
    billing_cycle?: string | null;
    notes?: string | null;
  };
  canEdit?: boolean;
  canDelete?: boolean;
  isViewer?: boolean;
};

export default function SubscriptionCard({
  subscription,
  canEdit = false,
  canDelete = false,
  isViewer = true,
}: SubscriptionCardProps) {
  const isDemo =
    subscription.id.startsWith("demo");

  const viewerOnly =
    isDemo || isViewer;

  const monthlyCost = Number(
    subscription.monthly_cost ?? 0
  );

  return (
    <article className="flex h-full flex-col rounded-[var(--radius-card)] border border-border-subtle bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-overline text-charcoal-soft">
            {subscription.category ||
              "Subscription"}
          </p>

          <h2 className="mt-2 truncate text-2xl font-bold text-text-primary">
            {subscription.service_name}
          </h2>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
          <CreditCard size={23} />
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-surface-sunken p-5">
        <p className="text-overline text-charcoal-soft">
          Monthly Cost
        </p>

        <div className="mt-2 flex items-end gap-2">
          <p className="text-3xl font-bold text-text-primary">
            $
            {monthlyCost.toLocaleString(
              undefined,
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}
          </p>

          <span className="pb-1 text-sm text-text-secondary">
            / month
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border-subtle p-4">
          <div className="flex items-center gap-2 text-text-tertiary">
            <Repeat2 size={15} />

            <p className="text-xs font-semibold uppercase tracking-[0.14em]">
              Billing
            </p>
          </div>

          <p className="mt-2 text-sm font-semibold text-text-primary">
            {subscription.billing_cycle ||
              "Not added"}
          </p>
        </div>

        <div className="rounded-2xl border border-border-subtle p-4">
          <div className="flex items-center gap-2 text-text-tertiary">
            <CalendarDays size={15} />

            <p className="text-xs font-semibold uppercase tracking-[0.14em]">
              Renews
            </p>
          </div>

          <p className="mt-2 text-sm font-semibold text-text-primary">
            {formatRenewalDate(
              subscription.renewal_date
            )}
          </p>
        </div>
      </div>

      {subscription.notes && (
        <div className="mt-5 rounded-2xl border border-border-subtle p-4">
          <div className="flex items-center gap-2 text-text-tertiary">
            <StickyNote size={15} />

            <p className="text-xs font-semibold uppercase tracking-[0.14em]">
              Notes
            </p>
          </div>

          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {subscription.notes}
          </p>
        </div>
      )}

      <div className="mt-auto pt-6">
        {viewerOnly ? (
          <div className="flex items-start gap-3 rounded-2xl border border-border-subtle bg-surface-sunken p-4">
            <Eye
              size={18}
              className="mt-0.5 shrink-0 text-interaction"
            />

            <div>
              <p className="text-sm font-semibold text-text-primary">
                Viewer access
              </p>

              <p className="mt-1 text-sm leading-5 text-text-secondary">
                This subscription is
                read-only. Viewers cannot
                edit or delete records.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 border-t border-border-subtle pt-5">
            {canEdit && (
              <Link
                href={
                  "/subscriptions/" +
                  subscription.id +
                  "/edit"
                }
                className="inline-flex items-center gap-2 rounded-xl bg-charcoal px-4 py-2.5 text-sm font-semibold text-surface-card transition hover:bg-charcoal-hover"
              >
                <Edit3 size={16} />
                Edit
              </Link>
            )}

            {canDelete && (
              <DeleteSubscriptionButton
                subscriptionId={
                  subscription.id
                }
              />
            )}

            {!canEdit && !canDelete && (
              <div className="rounded-2xl bg-surface-sunken p-4 text-sm text-text-secondary">
                You do not have permission
                to change this subscription.
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function formatRenewalDate(
  value?: string | null
) {
  if (!value) {
    return "Not added";
  }

  const date = new Date(
    value + "T00:00:00"
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}