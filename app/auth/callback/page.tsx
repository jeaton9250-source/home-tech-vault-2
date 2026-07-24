"use client";

import {
  useEffect,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { EmailOtpType } from "@supabase/supabase-js";

import {
  readHashAuthParams,
  resolveInviteNextPathFromUser,
} from "@/lib/auth/callbackDestination";
import { createClient } from "@/lib/supabase/client";

function authErrorPath(reason: string) {
  return `/auth/error?reason=${encodeURIComponent(reason)}`;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let cancelled = false;

    async function completeAuthCallback() {
      const requestedNext =
        searchParams.get("next");
      const authError =
        searchParams.get("error");
      const authErrorDescription =
        searchParams.get("error_description");
      const code = searchParams.get("code");
      const tokenHash =
        searchParams.get("token_hash");
      const otpType = searchParams.get("type");
      const hashParams = readHashAuthParams();

      if (authError) {
        console.error(
          "[auth-callback] Provider returned an error:",
          {
            error: authError,
            description: authErrorDescription,
          }
        );

        router.replace(
          authErrorPath("auth_callback_failed")
        );
        return;
      }

      const supabase = createClient();

      try {
        if (code) {
          const { data, error } =
            await supabase.auth.exchangeCodeForSession(
              code
            );

          if (error) {
            throw error;
          }

          if (cancelled) {
            return;
          }

          const destination =
            resolveInviteNextPathFromUser(
              requestedNext,
              data.session?.user ?? null
            );

          console.info("Invite callback", {
            method: "code",
            requestedNext,
            destination,
          });

          router.replace(destination);
          return;
        }

        if (tokenHash && otpType) {
          const { data, error } =
            await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: otpType as EmailOtpType,
            });

          if (error) {
            throw error;
          }

          if (cancelled) {
            return;
          }

          const destination =
            resolveInviteNextPathFromUser(
              requestedNext,
              data.user ?? null
            );

          console.info("Invite callback", {
            method: "token_hash",
            requestedNext,
            destination,
          });

          router.replace(destination);
          return;
        }

        if (
          hashParams.accessToken &&
          hashParams.refreshToken
        ) {
          const { data, error } =
            await supabase.auth.setSession({
              access_token: hashParams.accessToken,
              refresh_token: hashParams.refreshToken,
            });

          if (error) {
            throw error;
          }

          if (cancelled) {
            return;
          }

          const destination =
            resolveInviteNextPathFromUser(
              requestedNext,
              data.session?.user ?? null
            );

          console.info("Invite callback", {
            method: "hash_session",
            requestedNext,
            destination,
          });

          router.replace(destination);
          return;
        }

        if (hashParams.tokenHash && hashParams.type) {
          const { data, error } =
            await supabase.auth.verifyOtp({
              token_hash: hashParams.tokenHash,
              type: hashParams.type as EmailOtpType,
            });

          if (error) {
            throw error;
          }

          if (cancelled) {
            return;
          }

          const destination =
            resolveInviteNextPathFromUser(
              requestedNext,
              data.user ?? null
            );

          console.info("Invite callback", {
            method: "hash_otp",
            requestedNext,
            destination,
          });

          router.replace(destination);
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          if (cancelled) {
            return;
          }

          router.replace(
            resolveInviteNextPathFromUser(
              requestedNext,
              session.user
            )
          );
          return;
        }

        console.error(
          "[auth-callback] Missing authorization code, token hash, or session hash."
        );

        router.replace(
          authErrorPath("missing_auth_code")
        );
      } catch (error) {
        console.error(
          "[auth-callback] Session bootstrap failed:",
          error
        );

        if (!cancelled) {
          router.replace(
            authErrorPath("auth_callback_failed")
          );
        }
      }
    }

    void completeAuthCallback();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-base px-6">
      <div className="flex items-center gap-3 text-text-secondary">
        <Loader2
          size={22}
          className="animate-spin"
        />
        Finishing your invitation setup…
      </div>
    </main>
  );
}
