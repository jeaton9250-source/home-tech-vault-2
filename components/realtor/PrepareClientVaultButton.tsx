"use client";

import {
  useState,
} from "react";

import {
  ArrowRight,
  Check,
  Loader2,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

export default function PrepareClientVaultButton({
  giftId,
}: {
  giftId: string;
}) {
  const router =
    useRouter();

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    success,
    setSuccess,
  ] = useState(false);

  async function prepare() {
    setLoading(true);
    setError(null);

    try {
      const response =
        await fetch(
          `/api/realtor/gifts/${giftId}/prepare-household`,
          {
            method:
              "POST",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to prepare this Client Vault."
        );
      }

      setSuccess(true);

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to prepare this Client Vault."
      );

      setLoading(false);
    }
  }

  return (
    <div>
      {error ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
          {error}
        </div>
      ) : null}

      <button
        type="button"
        onClick={prepare}
        disabled={
          loading ||
          success
        }
        className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full bg-[#718d4f] px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#617c43] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2
              size={16}
              className="animate-spin"
            />

            Preparing Client Vault...
          </>
        ) : success ? (
          <>
            <Check size={16} />

            Client Vault Prepared
          </>
        ) : (
          <>
            Prepare Client Vault

            <ArrowRight size={15} />
          </>
        )}
      </button>
    </div>
  );
}
