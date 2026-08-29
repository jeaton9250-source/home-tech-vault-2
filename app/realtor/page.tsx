import {
  ArrowRight,
  CheckCircle2,
  Gift,
  Home,
  Plus,
  Send,
} from "lucide-react";

import Link from "next/link";
import RemoveClientVaultButton from "@/components/realtor/RemoveClientVaultButton";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function RealtorPage() {
  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      "/login?next=/realtor"
    );
  }

  const admin =
    createAdminClient();

  const {
    data: partner,
  } = await admin
    .from("realtor_partners")
    .select(
      "id, brokerage_name, referral_code, status"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  const {
    data: gifts,
    error: giftsError,
  } = await admin
    .from("realtor_vault_gifts")
    .select("*")
    .eq(
      "realtor_user_id",
      user.id
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    );

  if (giftsError) {
    console.error(
      "[realtor] gifts load failed:",
      giftsError
    );
  }

  const vaults =
    gifts ?? [];

  const preparing =
    vaults.filter(
      (gift) =>
        ![
          "claimed",
          "cancelled",
          "refunded",
        ].includes(gift.status)
    ).length;

  const sent =
    vaults.filter(
      (gift) =>
        gift.status ===
        "transfer_sent"
    ).length;

  const claimed =
    vaults.filter(
      (gift) =>
        gift.status ===
        "claimed"
    ).length;

  return (
    <main className="min-h-screen bg-[#f7f3ec] px-5 py-10 md:px-8 md:py-14">
      <div className="mx-auto max-w-[1180px]">
        {/* HERO */}

        <section className="overflow-hidden rounded-[38px] bg-[#183047] text-white shadow-[0_40px_100px_-60px_rgba(24,48,71,0.8)]">
          <div className="grid gap-10 px-7 py-10 md:px-10 md:py-12 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                <Home size={13} />

                <span className="text-[9px] font-semibold uppercase tracking-[0.19em] text-[#c5d5af]">
                  Home Tech Vault for Real Estate
                </span>
              </div>

              <h1 className="mt-6 max-w-[760px] font-serif text-[clamp(46px,6vw,76px)] leading-[0.94] tracking-[-0.055em]">
                A closing gift
                they&apos;ll actually use.
              </h1>

              <p className="mt-6 max-w-[640px] text-base leading-7 text-white/55">
                Prepare a thoughtful digital
                record of the home before closing,
                then transfer the entire Vault
                to the buyer.
              </p>
            </div>

            <Link
              href="/realtor/new"
              className="inline-flex min-h-[55px] items-center justify-center gap-2 rounded-full bg-[#718d4f] px-7 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#809d5a]"
            >
              <Plus size={16} />
              Gift a Home Vault
            </Link>
          </div>
        </section>

        {/* METRICS */}

        <section className="mt-7 grid gap-4 md:grid-cols-3">
          <MetricCard
            icon={Home}
            value={preparing}
            label="Preparing"
          />

          <MetricCard
            icon={Send}
            value={sent}
            label="Transfers sent"
          />

          <MetricCard
            icon={CheckCircle2}
            value={claimed}
            label="Claimed homes"
          />
        </section>

        {/* CLIENT VAULTS */}

        <section className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#718d4f]">
                Client Vaults
              </p>

              <h2 className="mt-3 font-serif text-4xl tracking-[-0.04em] text-[#183047]">
                Homes you&apos;re preparing.
              </h2>
            </div>

            {partner ? (
              <div className="rounded-full border border-[#183047]/10 bg-white px-4 py-2 text-xs text-[#78827d]">
                Referral code{" "}
                <strong className="text-[#183047]">
                  {partner.referral_code}
                </strong>
              </div>
            ) : null}
          </div>

          {vaults.length === 0 ? (
            <div className="mt-8 rounded-[34px] border border-dashed border-[#183047]/15 bg-white/70 px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf2e7] text-[#617c43]">
                <Gift size={22} />
              </div>

              <h3 className="mt-6 font-serif text-3xl text-[#183047]">
                Your first closing Vault
                starts here.
              </h3>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#7b8580]">
                Create a Vault for a buyer,
                prepare their home information,
                and transfer ownership when
                they close.
              </p>

              <Link
                href="/realtor/new"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#183047] px-7 py-3.5 text-sm font-semibold text-white"
              >
                Create Client Vault
                <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-4">
              {vaults.map(
                (gift) => (
                  <div
                    key={gift.id}
                    className="rounded-[28px] border border-[#183047]/10 bg-white p-6 shadow-[0_24px_70px_-58px_rgba(24,48,71,0.4)]"
                  >
                    <Link
                      href={`/realtor/vaults/${gift.id}`}
                      className="group block transition hover:-translate-y-0.5"
                    >
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#718d4f]">
                          Client Home
                        </p>

                        <h3 className="mt-2 font-serif text-2xl text-[#183047]">
                          {
                            gift.property_address_line1
                          }
                        </h3>

                        <p className="mt-1 text-sm text-[#85908a]">
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

                        <p className="mt-2 text-xs text-[#949c98]">
                          {
                            gift.buyer_email
                          }
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="rounded-full bg-[#edf2e7] px-3 py-1.5 text-[10px] font-semibold text-[#617c43]">
                          {formatStatus(
                            gift.status
                          )}
                        </span>

                        <ArrowRight
                          size={17}
                          className="text-[#9ba39f] transition group-hover:translate-x-1 group-hover:text-[#617c43]"
                        />
                      </div>
                    </div>
                    </Link>

                    {gift.status !== "claimed" ? (
                      <div className="mt-4 flex justify-end border-t border-[#183047]/8 pt-4">
                        <RemoveClientVaultButton
                          giftId={gift.id}
                          address={
                            gift.property_address_line1
                          }
                        />
                      </div>
                    ) : null}
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function MetricCard({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Home;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-[26px] border border-[#183047]/10 bg-white p-6">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf2e7] text-[#617c43]">
          <Icon size={17} />
        </div>

        <span className="font-serif text-4xl text-[#183047]">
          {value}
        </span>
      </div>

      <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.17em] text-[#87918c]">
        {label}
      </p>
    </div>
  );
}

function formatStatus(
  status: string
) {
  return status
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}
