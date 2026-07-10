import Link from "next/link";
import {
  CalendarDays,
  CreditCard,
  Edit3,
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
};

export default function SubscriptionCard({
  subscription,
}: SubscriptionCardProps) {
  const isDemo = subscription.id.startsWith("demo");

  const monthlyCost = Number(subscription.monthly_cost || 0);

  return (
    <article className="flex h-full flex-col rounded-[28px] border border-[#E8E2D6] bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
            {subscription.category || "Subscription"}
          </p>

          <h2 className="mt-2 truncate text-2xl font-bold text-[#111827]">
            {subscription.service_name}
          </h2>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
          <CreditCard size={23} />
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-[#F7F5EF] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">
          Monthly Cost
        </p>

        <div className="mt-2 flex items-end gap-2">
          <p className="text-3xl font-bold text-[#111827]">
            $
            {monthlyCost.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>

          <span className="pb-1 text-sm text-neutral-500">
            / month
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#E8E2D6] p-4">
          <div className="flex items-center gap-2 text-neutral-400">
            <Repeat2 size={15} />

            <p className="text-xs font-semibold uppercase tracking-[0.14em]">
              Billing
            </p>
          </div>

          <p className="mt-2 text-sm font-semibold text-[#111827]">
            {subscription.billing_cycle || "Not added"}
          </p>
        </div>

        <div className="rounded-2xl border border-[#E8E2D6] p-4">
          <div className="flex items-center gap-2 text-neutral-400">
            <CalendarDays size={15} />

            <p className="text-xs font-semibold uppercase tracking-[0.14em]">
              Renews
            </p>
          </div>

          <p className="mt-2 text-sm font-semibold text-[#111827]">
            {formatRenewalDate(subscription.renewal_date)}
          </p>
        </div>
      </div>

      {subscription.notes && (
        <div className="mt-5 rounded-2xl border border-[#E8E2D6] p-4">
          <div className="flex items-center gap-2 text-neutral-400">
            <StickyNote size={15} />

            <p className="text-xs font-semibold uppercase tracking-[0.14em]">
              Notes
            </p>
          </div>

          <p className="mt-2 text-sm leading-6 text-neutral-600">
            {subscription.notes}
          </p>
        </div>
      )}

      <div className="mt-auto pt-6">
        {isDemo ? (
          <div className="rounded-2xl bg-[#F7F5EF] p-4 text-sm text-neutral-500">
            Demo item — sign in to manage your own subscriptions.
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 border-t border-[#E8E2D6] pt-5">
            <Link
              href={`/subscriptions/${subscription.id}/edit`}
              className="inline-flex items-center gap-2 rounded-xl bg-[#111827] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#263044]"
            >
              <Edit3 size={16} />
              Edit
            </Link>

            <DeleteSubscriptionButton
              subscriptionId={subscription.id}
            />
          </div>
        )}
      </div>
    </article>
  );
}

function formatRenewalDate(value?: string | null) {
  if (!value) {
    return "Not added";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}