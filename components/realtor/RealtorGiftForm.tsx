"use client";

import {
  useState,
} from "react";

import {
  ArrowRight,
  Check,
  Gift,
  Home,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

export default function RealtorGiftForm() {
  const router =
    useRouter();

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    buyerFirstName,
    setBuyerFirstName,
  ] = useState("");

  const [
    buyerLastName,
    setBuyerLastName,
  ] = useState("");

  const [
    buyerEmail,
    setBuyerEmail,
  ] = useState("");

  const [
    addressLine1,
    setAddressLine1,
  ] = useState("");

  const [
    addressLine2,
    setAddressLine2,
  ] = useState("");

  const [
    city,
    setCity,
  ] = useState("");

  const [
    state,
    setState,
  ] = useState("");

  const [
    postalCode,
    setPostalCode,
  ] = useState("");

  async function submit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const response =
        await fetch(
          "/api/realtor/gifts",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              buyerFirstName,
              buyerLastName,
              buyerEmail,
              addressLine1,
              addressLine2,
              city,
              state,
              postalCode,
              giftPlan: "pro",
              giftDurationMonths: 12,
            }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.gift?.id
      ) {
        throw new Error(
          data.error ||
            "Unable to create the client Vault."
        );
      }

      const giftId =
        data.gift.id as string;

      const prepareResponse =
        await fetch(
          `/api/realtor/gifts/${giftId}/prepare-household`,
          {
            method:
              "POST",
          }
        );

      const prepareData =
        await prepareResponse.json();

      if (
        !prepareResponse.ok
      ) {
        throw new Error(
          prepareData.error ||
            "The Client Vault was created, but its household could not be prepared."
        );
      }

      router.push(
        `/realtor/vaults/${giftId}`
      );

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );

      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-8"
    >
      <section className="rounded-[32px] border border-[#183047]/10 bg-white p-7 shadow-[0_30px_80px_-60px_rgba(24,48,71,0.45)]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf2e7] text-[#617c43]">
            <Home size={18} />
          </div>

          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#718d4f]">
              Property
            </p>

            <h2 className="mt-1 font-serif text-2xl text-[#183047]">
              Which home is this for?
            </h2>
          </div>
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-2">
          <Field
            label="Street address"
            value={addressLine1}
            onChange={setAddressLine1}
            placeholder="123 Main Street"
            required
            className="md:col-span-2"
          />

          <Field
            label="Address line 2"
            value={addressLine2}
            onChange={setAddressLine2}
            placeholder="Unit, suite, etc."
            className="md:col-span-2"
          />

          <Field
            label="City"
            value={city}
            onChange={setCity}
            placeholder="Wilmington"
            required
          />

          <Field
            label="State"
            value={state}
            onChange={setState}
            placeholder="NC"
            required
          />

          <Field
            label="ZIP code"
            value={postalCode}
            onChange={setPostalCode}
            placeholder="28412"
            required
          />
        </div>
      </section>

      <section className="rounded-[32px] border border-[#183047]/10 bg-white p-7 shadow-[0_30px_80px_-60px_rgba(24,48,71,0.45)]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf2e7] text-[#617c43]">
            <Mail size={18} />
          </div>

          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#718d4f]">
              Buyer
            </p>

            <h2 className="mt-1 font-serif text-2xl text-[#183047]">
              Who will receive the Vault?
            </h2>
          </div>
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-2">
          <Field
            label="First name"
            value={buyerFirstName}
            onChange={setBuyerFirstName}
            placeholder="Sarah"
          />

          <Field
            label="Last name"
            value={buyerLastName}
            onChange={setBuyerLastName}
            placeholder="Johnson"
          />

          <Field
            label="Buyer email"
            type="email"
            value={buyerEmail}
            onChange={setBuyerEmail}
            placeholder="sarah@example.com"
            required
            className="md:col-span-2"
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-[32px] bg-[#183047] text-white">
        <div className="p-7">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
            <Gift size={13} />

            <span className="text-[9px] font-semibold uppercase tracking-[0.17em] text-[#c6d7ae]">
              Closing Gift
            </span>
          </div>

          <h2 className="mt-5 font-serif text-3xl">
            1 Year Home Tech Vault Pro
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">
            Prepare the home before closing,
            then transfer the complete Vault
            to the buyer when they are ready.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <GiftCheck>
              Device records
            </GiftCheck>

            <GiftCheck>
              Documents & receipts
            </GiftCheck>

            <GiftCheck>
              Warranty tracking
            </GiftCheck>

            <GiftCheck>
              Home Wi-Fi
            </GiftCheck>

            <GiftCheck>
              Connector access
            </GiftCheck>

            <GiftCheck>
              Ownership transfer
            </GiftCheck>
          </div>
        </div>

        <div className="border-t border-white/10 bg-white/5 px-7 py-5">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <ShieldCheck size={14} />
            Realtor checkout will be connected next.
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex min-h-[58px] items-center justify-center gap-2 rounded-full bg-[#718d4f] px-8 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#617c43] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2
              size={17}
              className="animate-spin"
            />
            Creating Vault...
          </>
        ) : (
          <>
            Create Client Vault
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label
      className={[
        "block",
        className,
      ].join(" ")}
    >
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#71807a]">
        {label}
      </span>

      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-[#183047]/10 bg-[#faf8f3] px-4 text-sm text-[#183047] outline-none transition placeholder:text-[#a6ada9] focus:border-[#718d4f]/50 focus:bg-white focus:ring-4 focus:ring-[#718d4f]/10"
      />
    </label>
  );
}

function GiftCheck({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-white/70">
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#718d4f]/25 text-[#c6d7ae]">
        <Check size={11} />
      </div>

      {children}
    </div>
  );
}
