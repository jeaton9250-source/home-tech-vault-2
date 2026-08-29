"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  Loader2,
} from "lucide-react";

import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";

export default function RealtorSetupPage() {
  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    retrying,
    setRetrying,
  ] = useState(false);

  async function finishSetup() {
    setErrorMessage("");
    setRetrying(true);

    try {
      const {
        data: {
          user,
        },
        error: userError,
      } = await supabase.auth.getUser();

      if (
        userError ||
        !user
      ) {
        window.location.assign(
          `/login?redirect=${encodeURIComponent(
            "/realtors/setup"
          )}`
        );
        return;
      }

      const response = await fetch(
        "/api/realtor/register",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );

      const payload =
        (await response.json()) as {
          success?: boolean;
          redirectTo?: string;
          error?: string;
        };

      if (
        !response.ok ||
        !payload.success
      ) {
        throw new Error(
          payload.error ||
            "Unable to finish Realtor setup."
        );
      }

      window.location.assign(
        payload.redirectTo ||
          "/realtor"
      );
    } catch (error) {
      console.error(
        "[realtor-setup] failed:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to finish Realtor setup."
      );
    } finally {
      setRetrying(false);
    }
  }

  useEffect(() => {
    void finishSetup();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f5ef] px-6">
      <div className="w-full max-w-lg rounded-[28px] border border-[#183047]/10 bg-white p-8 text-center shadow-[0_24px_70px_rgba(24,48,71,0.08)]">
        {!errorMessage ? (
          <>
            <Loader2
              size={30}
              className="mx-auto animate-spin text-[#617c43]"
            />

            <h1 className="mt-6 text-2xl font-semibold tracking-[-0.025em] text-[#183047]">
              Preparing your Realtor
              workspace
            </h1>

            <p className="mt-3 leading-7 text-[#183047]/60">
              We&apos;re finishing your
              Home Tech Vault Realtor
              account.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-[#183047]">
              We couldn&apos;t finish
              setup
            </h1>

            <Alert
              variant="error"
              className="mt-5 text-left"
            >
              {errorMessage}
            </Alert>

            <Button
              type="button"
              fullWidth
              size="lg"
              className="mt-6"
              loading={retrying}
              loadingLabel="Trying again..."
              onClick={() => {
                void finishSetup();
              }}
            >
              Try Again
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
