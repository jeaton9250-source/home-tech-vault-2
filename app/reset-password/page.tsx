"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    checkingSession,
    setCheckingSession,
  ] = useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [recoveryReady, setRecoveryReady] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function checkRecoverySession() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) {
          return;
        }

        if (error) {
          console.error(
            "Unable to read recovery session:",
            error
          );
        }

        if (session) {
          setRecoveryReady(true);
        }
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    }

    checkRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) {
          return;
        }

        if (
          event === "PASSWORD_RECOVERY" ||
          Boolean(session)
        ) {
          setRecoveryReady(true);
          setErrorMessage("");
        }

        setCheckingSession(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleResetPassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");

    if (!recoveryReady) {
      setErrorMessage(
        "This password reset link is invalid or has expired. Request a new reset email."
      );
      return;
    }

    if (password.length < 8) {
      setErrorMessage(
        "Your new password must be at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(
        "The passwords do not match."
      );
      return;
    }

    try {
      setSubmitting(true);

      const { error } =
        await supabase.auth.updateUser({
          password,
        });

      if (error) {
        throw error;
      }

      setSuccess(true);

      window.setTimeout(() => {
        router.replace("/dashboard");
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error(
        "Password update error:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update your password."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F5EF] px-6">
        <div className="flex items-center gap-3 text-neutral-500">
          <Loader2
            size={22}
            className="animate-spin"
          />

          Verifying your reset link...
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F5EF] px-5 py-8">
      <div className="w-full max-w-lg rounded-[32px] border border-[#E8E2D6] bg-white p-7 shadow-xl md:p-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
          {success ? (
            <CheckCircle2 size={24} />
          ) : (
            <ShieldCheck size={24} />
          )}
        </div>

        {success ? (
          <>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
              Password Updated
            </p>

            <h1 className="mt-2 text-3xl font-bold text-[#111827]">
              Your new password is ready
            </h1>

            <p className="mt-3 leading-7 text-neutral-500">
              Your password was updated successfully. You are
              being redirected to your Home Tech Vault.
            </p>

            <div className="mt-7 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              <Loader2
                size={18}
                className="animate-spin"
              />

              Opening your dashboard...
            </div>
          </>
        ) : recoveryReady ? (
          <>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
              Secure Password Reset
            </p>

            <h1 className="mt-2 text-3xl font-bold text-[#111827]">
              Choose a new password
            </h1>

            <p className="mt-3 leading-7 text-neutral-500">
              Enter a new password for your Home Tech Vault
              account.
            </p>

            {errorMessage && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <form
              onSubmit={handleResetPassword}
              className="mt-8 space-y-5"
            >
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#111827]">
                  <LockKeyhole
                    size={16}
                    className="text-[#C8A96A]"
                  />
                  New Password
                </span>

                <div className="relative">
                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    className={`${inputClassName} pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#111827]"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#111827]">
                  <LockKeyhole
                    size={16}
                    className="text-[#C8A96A]"
                  />
                  Confirm New Password
                </span>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  autoComplete="new-password"
                  placeholder="Enter the password again"
                  className={inputClassName}
                />
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#111827] px-6 py-4 font-semibold text-white transition hover:bg-[#263044] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />
                ) : (
                  <ShieldCheck size={19} />
                )}

                {submitting
                  ? "Updating Password..."
                  : "Update Password"}
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-red-600">
              Reset Link Unavailable
            </p>

            <h1 className="mt-2 text-3xl font-bold text-[#111827]">
              This reset link is invalid or expired
            </h1>

            <p className="mt-3 leading-7 text-neutral-500">
              Request a new password reset email and use the
              newest link you receive.
            </p>

            <Link
              href="/forgot-password"
              className="mt-7 inline-flex w-full items-center justify-center rounded-2xl bg-[#111827] px-6 py-4 font-semibold text-white transition hover:bg-[#263044]"
            >
              Request Another Reset Link
            </Link>

            <Link
              href="/login"
              className="mt-3 inline-flex w-full items-center justify-center rounded-2xl border border-[#E8E2D6] px-6 py-4 font-semibold text-[#111827] hover:bg-[#F7F5EF]"
            >
              Back to Sign In
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-[#E8E2D6] bg-white px-4 py-3.5 text-[#111827] outline-none transition placeholder:text-neutral-400 focus:border-[#C8A96A] focus:ring-2 focus:ring-[#C8A96A]/20";