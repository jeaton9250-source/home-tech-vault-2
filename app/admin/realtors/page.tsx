import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Gift,
  Home,
  Search,
  Send,
  ShieldCheck,
  UserCheck,
  UserRound,
  UserX,
} from "lucide-react";

import RealtorStatusButton from "@/components/admin/realtors/RealtorStatusButton";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Realtors — Home Tech Vault Admin",
};

type SearchParams = Promise<{
  q?: string | string[];
  status?: string | string[];
  selected?: string | string[];
}>;

function firstParam(
  value: string | string[] | undefined
) {
  return Array.isArray(value)
    ? value[0] ?? ""
    : value ?? "";
}

function formatDate(
  value: string | null | undefined
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function statusLabel(status: string) {
  if (status === "active") return "Active";
  if (status === "inactive") return "Pending Setup";
  if (status === "suspended") return "Suspended";
  return status;
}

function statusClasses(status: string) {
  if (status === "active") {
    return "border-[#718d4f]/20 bg-[#718d4f]/10 text-[#617c43]";
  }

  if (status === "inactive") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-rose-200 bg-rose-50 text-rose-700";
}

function vaultStatusLabel(status: string) {
  const labels: Record<string, string> = {
    draft: "Draft",
    awaiting_payment: "Awaiting Payment",
    paid: "Paid",
    preparing: "Preparing",
    transfer_sent: "Transfer Sent",
    claimed: "Claimed",
    cancelled: "Cancelled",
    refunded: "Refunded",
  };

  return labels[status] ?? status;
}

export default async function AdminRealtorsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const q = firstParam(params.q)
    .trim()
    .toLowerCase();

  const statusFilter = firstParam(
    params.status
  ).trim();

  const selectedId = firstParam(
    params.selected
  ).trim();

  const admin = createAdminClient();

  const [
    partnersResult,
    giftsResult,
    usersResult,
  ] = await Promise.all([
    admin
      .from("realtor_partners")
      .select(
        `
          id,
          user_id,
          brokerage_name,
          license_state,
          referral_code,
          status,
          created_at,
          updated_at
        `
      )
      .order("created_at", {
        ascending: false,
      }),

    admin
      .from("realtor_vault_gifts")
      .select(
        `
          id,
          realtor_partner_id,
          realtor_user_id,
          household_id,
          buyer_email,
          buyer_first_name,
          buyer_last_name,
          property_address_line1,
          property_address_line2,
          property_city,
          property_state,
          property_postal_code,
          gift_plan,
          gift_duration_months,
          status,
          claimed_by_user_id,
          claimed_at,
          created_at,
          updated_at
        `
      )
      .order("created_at", {
        ascending: false,
      }),

    admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    }),
  ]);

  if (partnersResult.error) {
    throw partnersResult.error;
  }

  if (giftsResult.error) {
    throw giftsResult.error;
  }

  if (usersResult.error) {
    throw usersResult.error;
  }

  const partners = partnersResult.data ?? [];
  const gifts = giftsResult.data ?? [];
  const authUsers =
    usersResult.data.users ?? [];

  const authById = new Map(
    authUsers.map((user) => [
      user.id,
      user,
    ])
  );

  const giftsByPartner = new Map<
    string,
    typeof gifts
  >();

  for (const gift of gifts) {
    const current =
      giftsByPartner.get(
        gift.realtor_partner_id
      ) ?? [];

    current.push(gift);

    giftsByPartner.set(
      gift.realtor_partner_id,
      current
    );
  }

  const rows = partners.map((partner) => {
    const authUser = authById.get(
      partner.user_id
    );

    const metadata =
      (authUser?.user_metadata ??
        {}) as Record<string, unknown>;

    const fullName =
      typeof metadata.full_name ===
        "string" &&
      metadata.full_name.trim()
        ? metadata.full_name.trim()
        : [
            typeof metadata.first_name ===
            "string"
              ? metadata.first_name
              : "",
            typeof metadata.last_name ===
            "string"
              ? metadata.last_name
              : "",
          ]
            .filter(Boolean)
            .join(" ")
            .trim() ||
          authUser?.email ||
          "Realtor";

    const email =
      authUser?.email ?? "";

    const partnerGifts =
      giftsByPartner.get(partner.id) ??
      [];

    const claimed =
      partnerGifts.filter(
        (gift) =>
          gift.status === "claimed"
      ).length;

    const transferSent =
      partnerGifts.filter(
        (gift) =>
          gift.status ===
          "transfer_sent"
      ).length;

    const preparing =
      partnerGifts.filter(
        (gift) =>
          ![
            "claimed",
            "cancelled",
            "refunded",
          ].includes(gift.status)
      ).length;

    return {
      partner,
      fullName,
      email,
      gifts: partnerGifts,
      claimed,
      transferSent,
      preparing,
    };
  });

  const filteredRows = rows.filter(
    (row) => {
      if (
        statusFilter &&
        statusFilter !== "all" &&
        row.partner.status !==
          statusFilter
      ) {
        return false;
      }

      if (!q) {
        return true;
      }

      const haystack = [
        row.fullName,
        row.email,
        row.partner
          .brokerage_name ?? "",
        row.partner
          .license_state ?? "",
        row.partner
          .referral_code ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    }
  );

  const totalRealtors =
    partners.length;

  const active = partners.filter(
    (partner) =>
      partner.status === "active"
  ).length;

  const pending = partners.filter(
    (partner) =>
      partner.status === "inactive"
  ).length;

  const suspended = partners.filter(
    (partner) =>
      partner.status === "suspended"
  ).length;

  const preparing = gifts.filter(
    (gift) =>
      ![
        "claimed",
        "cancelled",
        "refunded",
      ].includes(gift.status)
  ).length;

  const transferSent = gifts.filter(
    (gift) =>
      gift.status === "transfer_sent"
  ).length;

  const claimed = gifts.filter(
    (gift) =>
      gift.status === "claimed"
  ).length;

  const selected = selectedId
    ? rows.find(
        (row) =>
          row.partner.id === selectedId
      ) ?? null
    : null;

  return (
    <>
      <section className="overflow-hidden rounded-[28px] border border-[#183047]/8 bg-[#183047] text-white shadow-[0_28px_70px_-45px_rgba(20,43,64,0.8)]">
        <div className="flex flex-col gap-7 px-6 py-7 sm:px-8 sm:py-8 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5">
              <Building2
                size={13}
                className="text-[#b9caa4]"
              />
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
                Partner Operations
              </span>
            </div>

            <h1 className="mt-5 font-serif text-4xl tracking-[-0.04em] sm:text-5xl">
              Realtor Control
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55 sm:text-base">
              Manage Realtor partners,
              Client Vault activity, account
              status, and closing gift
              operations from one place.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            icon={UserRound}
            label="Total Realtors"
            value={totalRealtors}
          />
          <Metric
            icon={UserCheck}
            label="Active"
            value={active}
          />
          <Metric
            icon={ShieldCheck}
            label="Pending Setup"
            value={pending}
          />
          <Metric
            icon={UserX}
            label="Suspended"
            value={suspended}
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            icon={Gift}
            label="Client Vaults"
            value={gifts.length}
          />
          <Metric
            icon={Home}
            label="Preparing"
            value={preparing}
          />
          <Metric
            icon={Send}
            label="Transfers Sent"
            value={transferSent}
          />
          <Metric
            icon={CheckCircle2}
            label="Claimed Homes"
            value={claimed}
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-[26px] border border-[#183047]/8 bg-white shadow-[0_18px_50px_-42px_rgba(20,43,64,0.5)]">
        <div className="border-b border-[#183047]/8 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#718d4f]">
                Partner Directory
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-[#183047]">
                Realtors
              </h2>

              <p className="mt-1 text-sm text-[#183047]/50">
                {filteredRows.length} of{" "}
                {rows.length} Realtor
                accounts
              </p>
            </div>

            <form
              method="get"
              className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto"
            >
              <label className="relative min-w-0 sm:w-[300px]">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#183047]/35"
                />

                <input
                  type="search"
                  name="q"
                  defaultValue={firstParam(
                    params.q
                  )}
                  placeholder="Search Realtors..."
                  className="h-11 w-full rounded-xl border border-[#183047]/10 bg-[#f8f5ef] pl-9 pr-3 text-sm text-[#183047] outline-none transition focus:border-[#718d4f]"
                />
              </label>

              <select
                name="status"
                defaultValue={
                  statusFilter || "all"
                }
                className="h-11 rounded-xl border border-[#183047]/10 bg-[#f8f5ef] px-3 text-sm font-medium text-[#183047] outline-none"
              >
                <option value="all">
                  All statuses
                </option>
                <option value="active">
                  Active
                </option>
                <option value="inactive">
                  Pending Setup
                </option>
                <option value="suspended">
                  Suspended
                </option>
              </select>

              <button
                type="submit"
                className="h-11 rounded-xl bg-[#183047] px-5 text-sm font-semibold text-white transition hover:bg-[#142b40]"
              >
                Filter
              </button>
            </form>
          </div>
        </div>

        {filteredRows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#183047]/8 bg-[#f8f5ef]/70 text-left text-[10px] font-semibold uppercase tracking-[0.13em] text-[#183047]/45">
                  <th className="px-5 py-3">
                    Realtor
                  </th>
                  <th className="px-4 py-3">
                    Brokerage
                  </th>
                  <th className="px-4 py-3">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center">
                    Vaults
                  </th>
                  <th className="px-4 py-3 text-center">
                    Claimed
                  </th>
                  <th className="px-4 py-3">
                    Joined
                  </th>
                  <th className="px-5 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.map(
                  (row) => (
                    <tr
                      key={row.partner.id}
                      className="border-b border-[#183047]/6 last:border-0 hover:bg-[#f8f5ef]/55"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/realtors?selected=${row.partner.id}`}
                          className="group block"
                        >
                          <p className="font-semibold text-[#183047] group-hover:text-[#617c43]">
                            {row.fullName}
                          </p>

                          <p className="mt-1 text-xs text-[#183047]/48">
                            {row.email}
                          </p>

                          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.1em] text-[#718d4f]">
                            {
                              row.partner
                                .referral_code
                            }
                          </p>
                        </Link>
                      </td>

                      <td className="px-4 py-4">
                        <p className="text-sm text-[#183047]">
                          {row.partner
                            .brokerage_name ||
                            "—"}
                        </p>

                        {row.partner
                          .license_state ? (
                          <p className="mt-1 text-xs text-[#183047]/45">
                            License state:{" "}
                            {
                              row.partner
                                .license_state
                            }
                          </p>
                        ) : null}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={[
                            "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                            statusClasses(
                              row.partner
                                .status
                            ),
                          ].join(" ")}
                        >
                          {statusLabel(
                            row.partner
                              .status
                          )}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center text-sm font-semibold text-[#183047]">
                        {row.gifts.length}
                      </td>

                      <td className="px-4 py-4 text-center text-sm font-semibold text-[#183047]">
                        {row.claimed}
                      </td>

                      <td className="px-4 py-4 text-sm text-[#183047]/55">
                        {formatDate(
                          row.partner
                            .created_at
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/realtors?selected=${row.partner.id}`}
                            className="inline-flex min-h-9 items-center justify-center rounded-xl border border-[#183047]/10 px-3 text-xs font-semibold text-[#183047] transition hover:bg-[#f8f5ef]"
                          >
                            View
                          </Link>

                          {row.partner
                            .status !==
                          "inactive" ? (
                            <RealtorStatusButton
                              partnerId={
                                row.partner
                                  .id
                              }
                              currentStatus={
                                row.partner
                                  .status
                              }
                            />
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-14 text-center">
            <Building2
              size={28}
              className="mx-auto text-[#183047]/25"
            />

            <h3 className="mt-4 font-semibold text-[#183047]">
              No Realtors found
            </h3>
          </div>
        )}
      </section>

      {selected ? (
        <section className="overflow-hidden rounded-[28px] border border-[#183047]/8 bg-white shadow-[0_18px_50px_-42px_rgba(20,43,64,0.5)]">
          <div className="border-b border-[#183047]/8 px-6 py-6">
            <h2 className="text-3xl font-semibold tracking-[-0.035em] text-[#183047]">
              {selected.fullName}
            </h2>

            <p className="mt-2 text-sm text-[#183047]/55">
              {selected.email}
            </p>
          </div>

          <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
            <aside className="border-b border-[#183047]/8 bg-[#f8f5ef]/65 p-6 lg:border-b-0 lg:border-r">
              <dl className="space-y-5">
                <Detail
                  label="Referral Code"
                  value={
                    selected.partner
                      .referral_code
                  }
                />

                <Detail
                  label="Client Vaults"
                  value={String(
                    selected.gifts.length
                  )}
                />

                <Detail
                  label="Preparing"
                  value={String(
                    selected.preparing
                  )}
                />

                <Detail
                  label="Transfers Sent"
                  value={String(
                    selected.transferSent
                  )}
                />

                <Detail
                  label="Claimed Homes"
                  value={String(
                    selected.claimed
                  )}
                />
              </dl>
            </aside>

            <div className="p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#718d4f]">
                Client Vaults
              </p>

              <h3 className="mt-2 text-xl font-semibold text-[#183047]">
                Properties
              </h3>

              {selected.gifts.length ? (
                <div className="mt-5 grid gap-3">
                  {selected.gifts.map(
                    (gift) => (
                      <div
                        key={gift.id}
                        className="flex flex-col gap-5 rounded-[20px] border border-[#183047]/8 bg-[#fffdf8] p-5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-semibold text-[#183047]">
                            {
                              gift.property_address_line1
                            }
                          </p>

                          <p className="mt-1 text-sm text-[#183047]/50">
                            {
                              gift.property_city
                            }
                            ,{" "}
                            {
                              gift.property_state
                            }{" "}
                            {
                              gift.property_postal_code
                            }
                          </p>

                          <p className="mt-2 text-xs text-[#183047]/45">
                            Buyer:{" "}
                            {
                              gift.buyer_email
                            }
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs font-semibold text-[#617c43]">
                              {vaultStatusLabel(
                                gift.status
                              )}
                            </p>

                            <p className="mt-1 text-[11px] text-[#183047]/40">
                              Created{" "}
                              {formatDate(
                                gift.created_at
                              )}
                            </p>
                          </div>

                          <ArrowRight
                            size={16}
                            className="text-[#183047]/25"
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="mt-5 text-sm text-[#183047]/50">
                  No Client Vaults yet.
                </p>
              )}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

function Metric({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Home;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-[22px] border border-[#183047]/8 bg-white p-5 shadow-[0_16px_40px_-38px_rgba(20,43,64,0.6)]">
      <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#718d4f]/10 text-[#617c43]">
        <Icon size={17} />
      </div>

      <p className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-[#183047]">
        {value}
      </p>

      <p className="mt-1 text-xs font-medium text-[#183047]/50">
        {label}
      </p>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#183047]/38">
        {label}
      </dt>

      <dd className="mt-1.5 break-words text-sm font-semibold text-[#183047]">
        {value}
      </dd>
    </div>
  );
}
