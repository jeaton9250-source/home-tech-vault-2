import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Gift,
  Home,
  Mail,
  MapPin,
  ShieldCheck,
  Wifi,
  Wrench,
} from "lucide-react";

import Link from "next/link";

import {
  notFound,
  redirect,
} from "next/navigation";

import PrepareClientVaultButton from "@/components/realtor/PrepareClientVaultButton";
import EnterClientVaultButton from "@/components/realtor/EnterClientVaultButton";
import RealtorCheckoutButton from "@/components/realtor/RealtorCheckoutButton";
import SendOwnershipTransferButton from "@/components/realtor/SendOwnershipTransferButton";
import ResendOwnershipTransferButton from "@/components/realtor/ResendOwnershipTransferButton";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic =
  "force-dynamic";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RealtorVaultPage({
  params,
}: Props) {
  const {
    id,
  } = await params;

  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?next=/realtor/vaults/${id}`
    );
  }

  const admin =
    createAdminClient();

  const {
    data: gift,
    error,
  } = await admin
    .from("realtor_vault_gifts")
    .select("*")
    .eq(
      "id",
      id
    )
    .eq(
      "realtor_user_id",
      user.id
    )
    .maybeSingle();

  if (
    error ||
    !gift
  ) {
    notFound();
  }

  const buyerName =
    [
      gift.buyer_first_name,
      gift.buyer_last_name,
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <main className="min-h-screen bg-[#f7f3ec] px-5 py-10 md:px-8 md:py-14">
      <div className="mx-auto max-w-[1120px]">
        <Link
          href="/realtor"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#78837d] transition hover:text-[#183047]"
        >
          <ArrowLeft size={15} />
          Client Vaults
        </Link>

        <section className="mt-9 overflow-hidden rounded-[38px] bg-[#183047] text-white shadow-[0_40px_100px_-60px_rgba(24,48,71,0.85)]">
          <div className="grid gap-8 p-7 md:p-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#c4d5ae]">
                Client Home Vault
              </p>

              <h1 className="mt-5 max-w-[760px] font-serif text-[clamp(44px,6vw,72px)] leading-[0.95] tracking-[-0.055em]">
                {
                  gift.property_address_line1
                }
              </h1>

              <div className="mt-5 flex items-center gap-2 text-sm text-white/55">
                <MapPin size={14} />

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
              </div>
            </div>

            <StatusBadge
              status={
                gift.status
              }
            />
          </div>
        </section>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <InfoCard
            icon={Mail}
            label="Buyer"
            title={
              buyerName ||
              "Buyer"
            }
            copy={
              gift.buyer_email
            }
          />

          <InfoCard
            icon={Gift}
            label="Closing gift"
            title="1 Year Pro"
            copy="Transfers with the home"
          />

          <InfoCard
            icon={Home}
            label="Client Vault"
            title={
              gift.household_id
                ? "Prepared"
                : "Not prepared"
            }
            copy={
              gift.household_id
                ? "Separate property household"
                : "Household setup required"
            }
          />

          <InfoCard
            icon={ShieldCheck}
            label="Ownership"
            title={
              gift.status ===
              "claimed"
                ? "Buyer owns Vault"
                : "Realtor owns temporarily"
            }
            copy={
              gift.status ===
              "claimed"
                ? "Handoff complete"
                : "Transfers at closing"
            }
          />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_350px]">
          <section className="rounded-[32px] border border-[#183047]/10 bg-white p-7 md:p-8">
            <p className="text-[9px] font-semibold uppercase tracking-[0.19em] text-[#718d4f]">
              Prepare the home
            </p>

            <h2 className="mt-4 font-serif text-4xl tracking-[-0.04em] text-[#183047]">
              Build the record
              they&apos;ll receive at closing.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#78837d]">
              This property now has its own
              dedicated Home Tech Vault household.
              Anything added to this household
              can travel with the home when
              ownership is transferred.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <PrepareCard
                icon={Home}
                title="Devices"
                copy="Appliances, electronics and smart-home equipment."
              />

              <PrepareCard
                icon={FileText}
                title="Documents"
                copy="Receipts, manuals and important home records."
              />

              <PrepareCard
                icon={ShieldCheck}
                title="Warranties"
                copy="Coverage details and expiration dates."
              />

              <PrepareCard
                icon={Wifi}
                title="Home Wi-Fi"
                copy="Router and connected-home information."
              />

              <PrepareCard
                icon={Wrench}
                title="Maintenance"
                copy="Service notes and useful home history."
              />

              <PrepareCard
                icon={Gift}
                title="Closing Handoff"
                copy="Transfer the organized Vault to the buyer."
              />
            </div>

            {gift.household_id ? (
              <div className="mt-8 rounded-[22px] bg-[#f7f3ec] p-5">
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#718d4f]">
                  Client Household
                </p>

                <p className="mt-2 font-mono text-[11px] text-[#8c9690]">
                  {
                    gift.household_id
                  }
                </p>

                {gift.status !== "claimed" ? (
                  <div className="mt-5">
                    <EnterClientVaultButton
                      giftId={gift.id}
                    />
                  </div>
                ) : null}

                {gift.status !== "claimed" ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <Link
                      href={`/devices/add?${new URLSearchParams({
                        householdId:
                          gift.household_id,
                        returnTo:
                          `/realtor/vaults/${gift.id}`,
                      }).toString()}`}
                      className="group rounded-2xl bg-[#183047] px-5 py-4 text-white transition hover:bg-[#142b40]"
                    >
                      <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-[#c4d5ae]">
                        Prepare the home
                      </span>

                      <span className="mt-2 flex items-center justify-between text-sm font-semibold">
                        Add Device

                        <ArrowRight
                          size={15}
                          className="transition group-hover:translate-x-1"
                        />
                      </span>
                    </Link>

                    <Link
                      href={`/documents/upload?${new URLSearchParams({
                        householdId:
                          gift.household_id,
                        returnTo:
                          `/realtor/vaults/${gift.id}`,
                      }).toString()}`}
                      className="group rounded-2xl border border-[#183047]/10 bg-white px-5 py-4 text-[#183047] transition hover:border-[#718d4f]/40"
                    >
                      <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-[#718d4f]">
                        Home records
                      </span>

                      <span className="mt-2 flex items-center justify-between text-sm font-semibold">
                        Upload Document

                        <ArrowRight
                          size={15}
                          className="transition group-hover:translate-x-1"
                        />
                      </span>
                    </Link>
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>

          <aside className="space-y-5">
            <section className="rounded-[30px] bg-[#183047] p-7 text-white">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#c4d5ae]">
                Next step
              </p>

              {!gift.household_id ? (
                <>
                  <h3 className="mt-4 font-serif text-3xl">
                    Prepare this Client Vault.
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-white/55">
                    This gift was created before
                    the property household finished
                    setting up. Prepare it now to
                    create the dedicated household
                    for this home.
                  </p>

                  <div className="mt-6">
                    <PrepareClientVaultButton
                      giftId={gift.id}
                    />
                  </div>
                </>
              ) : gift.status ===
              "awaiting_payment" ? (
                <>
                  <h3 className="mt-4 font-serif text-3xl">
                    Complete the gift purchase.
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-white/55">
                    The Client Vault is prepared.
                    Ownership transfer will unlock
                    after payment.
                  </p>

                  <div className="mt-6">
                    <RealtorCheckoutButton
                      giftId={gift.id}
                    />
                  </div>

                  <p className="mt-4 text-center text-[10px] leading-5 text-white/40">
                    One-time closing gift purchase.
                    The buyer will not be charged.
                  </p>
                </>
              ) : gift.status ===
                "claimed" ? (
                <>
                  <h3 className="mt-4 font-serif text-3xl">
                    Handoff complete.
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-white/55">
                    The buyer now owns this Home Vault.
                  </p>
                </>
              ) : gift.status ===
                "transfer_sent" ? (
                <>
                  <h3 className="mt-4 font-serif text-3xl">
                    Ownership sent.
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-white/55">
                    The buyer has been invited
                    to claim this Home Vault.
                  </p>

                  <div className="mt-6 rounded-2xl bg-white/10 px-4 py-4 text-xs leading-5 text-white/60">
                    Waiting for {gift.buyer_email}
                    to accept ownership.
                  </div>

                  <ResendOwnershipTransferButton
                    giftId={gift.id}
                    buyerEmail={gift.buyer_email}
                  />
                </>
              ) : (
                <>
                  <h3 className="mt-4 font-serif text-3xl">
                    Prepare for closing.
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-white/55">
                    Build the home record,
                    then send ownership to
                    the buyer.
                  </p>

                  <div className="mt-6">
                    <SendOwnershipTransferButton
                      giftId={gift.id}
                      buyerEmail={gift.buyer_email}
                    />
                  </div>
                </>
              )}
            </section>

            <section className="rounded-[30px] border border-[#183047]/10 bg-white p-7">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#718d4f]">
                Handoff flow
              </p>

              <div className="mt-5 space-y-5">
                <Step
                  number="01"
                  text="Create the property Vault."
                  complete={
                    Boolean(
                      gift.household_id
                    )
                  }
                />

                <Step
                  number="02"
                  text="Complete the closing-gift purchase."
                  complete={
                    [
                      "paid",
                      "preparing",
                      "transfer_sent",
                      "claimed",
                    ].includes(
                      gift.status
                    )
                  }
                />

                <Step
                  number="03"
                  text="Prepare useful information for the home."
                  complete={
                    [
                      "preparing",
                      "transfer_sent",
                      "claimed",
                    ].includes(
                      gift.status
                    )
                  }
                />

                <Step
                  number="04"
                  text="Send ownership to the buyer."
                  complete={
                    [
                      "transfer_sent",
                      "claimed",
                    ].includes(
                      gift.status
                    )
                  }
                />

                <Step
                  number="05"
                  text="Buyer claims their Home Vault."
                  complete={
                    gift.status ===
                    "claimed"
                  }
                />
              </div>
            </section>

            <Link
              href="/realtor"
              className="group flex items-center justify-between rounded-[24px] border border-[#183047]/10 bg-white px-5 py-4 text-sm font-semibold text-[#183047]"
            >
              Back to Client Vaults

              <ArrowRight
                size={15}
                className="transition group-hover:translate-x-1"
              />
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}

function InfoCard({
  icon: Icon,
  label,
  title,
  copy,
}: {
  icon: typeof Home;
  label: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="rounded-[26px] border border-[#183047]/10 bg-white p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf2e7] text-[#617c43]">
        <Icon size={17} />
      </div>

      <p className="mt-5 text-[8px] font-semibold uppercase tracking-[0.17em] text-[#89938d]">
        {label}
      </p>

      <h3 className="mt-2 truncate font-serif text-xl text-[#183047]">
        {title}
      </h3>

      <p className="mt-1 truncate text-[11px] text-[#909994]">
        {copy}
      </p>
    </div>
  );
}

function PrepareCard({
  icon: Icon,
  title,
  copy,
}: {
  icon: typeof Home;
  title: string;
  copy: string;
}) {
  return (
    <div className="rounded-[23px] bg-[#f7f3ec] p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#617c43]">
        <Icon size={15} />
      </div>

      <h3 className="mt-4 font-serif text-xl text-[#183047]">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-[#7d8781]">
        {copy}
      </p>
    </div>
  );
}

function Step({
  number,
  text,
  complete,
}: {
  number: string;
  text: string;
  complete: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div
        className={[
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold",
          complete
            ? "bg-[#718d4f] text-white"
            : "bg-[#edf2e7] text-[#617c43]",
        ].join(" ")}
      >
        {complete
          ? "✓"
          : number}
      </div>

      <p className="pt-1 text-sm leading-5 text-[#748079]">
        {text}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  return (
    <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-[#d2dfc1]">
      {status
        .replaceAll(
          "_",
          " "
        )
        .replace(
          /\b\w/g,
          (letter) =>
            letter.toUpperCase()
        )}
    </span>
  );
}
