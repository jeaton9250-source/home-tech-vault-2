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
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { resolvePostAuthRedirect } from "@/lib/onboarding/redirect";
import { enforceActiveAccount } from "@/lib/auth/enforceActiveAccount";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    redirectPath,
    setRedirectPath,
  ] = useState("/dashboard");

  useEffect(() => {
    const searchParams =
      new URLSearchParams(
        window.location.search
      );

    const requestedRedirect =
      searchParams.get("redirect");

    if (
      requestedRedirect &&
      requestedRedirect.startsWith("/") &&
      !requestedRedirect.startsWith("//")
    ) {
      setRedirectPath(
        requestedRedirect
      );
    }
  }, []);

  async function handleSignIn(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setErrorMessage(
        "Enter your email address."
      );
      return;
    }

    if (!password) {
      setErrorMessage(
        "Enter your password."
      );
      return;
    }

    try {
      setSubmitting(true);

      window.localStorage.removeItem(
        "home-tech-vault-demo"
      );

      const {
        data,
        error,
      } =
        await supabase.auth.signInWithPassword(
          {
            email: normalizedEmail,
            password,
          }
        );

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error(
          "Your account could not be loaded."
        );
      }

      const accountCheck =
        await enforceActiveAccount(
          data.user.id
        );

      if (!accountCheck.ok) {
        setErrorMessage(accountCheck.message);
        return;
      }

      const destination =
        await resolvePostAuthRedirect(
          supabase,
          data.user.id,
          redirectPath
        );

      router.replace(destination);

      router.refresh();
    } catch (error) {
      console.error(
        "Sign-in error:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to sign in."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const signupHref =
    redirectPath !== "/dashboard"
      ? `/signup?redirect=${encodeURIComponent(
          redirectPath
        )}`
      : "/signup";

  const forgotPasswordHref =
    redirectPath !== "/dashboard"
      ? `/forgot-password?redirect=${encodeURIComponent(
          redirectPath
        )}`
      : "/forgot-password";

  const isFamilyInvitation =
    redirectPath.startsWith(
      "/family/accept/"
    );

  return (
    <main className="min-h-screen bg-surface-sunken px-5 py-8 md:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-64px)] max-w-7xl overflow-hidden rounded-[36px] border border-border-subtle bg-white shadow-xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="htv-auth-panel relative overflow-hidden px-7 py-10 text-text-primary md:px-12 md:py-14">
          <div className="relative z-10">
            <Link
              href="/demo"
              className="inline-flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border-subtle bg-surface-card text-charcoal shadow-[var(--shadow-sm)]">
                <ShieldCheck
                  size={22}
                />
              </div>

              <div>
                <p className="font-bold">
                  Home Tech Vault
                </p>

                <p className="text-xs text-text-tertiary">
                  Organize. Protect.
                  Simplify.
                </p>
              </div>
            </Link>

            <p className="mt-14 text-xs font-semibold uppercase tracking-[0.22em] text-text-secondary">
              {isFamilyInvitation
                ? "Household invitation"
                : "Welcome back"}
            </p>

            <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-tight md:text-6xl">
              {isFamilyInvitation
                ? "Sign in to join your shared household."
                : "Your home technology is waiting for you."}
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-text-secondary">
              {isFamilyInvitation
                ? "After signing in, you’ll return to your invitation and be added to the shared Home Tech Vault household."
                : "Sign in to review your devices, warranties, subscriptions, documents, maintenance records, and network information."}
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <LoginBenefit text="Review every device" />

              <LoginBenefit text="Track warranty coverage" />

              <LoginBenefit text="Find important documents" />

              <LoginBenefit text="Monitor your technology health" />
            </div>
          </div>

          <div className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-home-health-soft blur-3xl" />

          <div className="pointer-events-none absolute -left-40 top-1/3 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        </section>

        <section className="flex items-center px-6 py-10 md:px-12 md:py-14">
          <div className="mx-auto w-full max-w-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
              <Sparkles size={23} />
            </div>

            <p className="mt-6 text-overline text-charcoal-soft">
              Sign In
            </p>

            <h2 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">
              {isFamilyInvitation
                ? "Continue to your invitation"
                : "Welcome back to your vault"}
            </h2>

            <p className="mt-3 text-sm leading-6 text-text-secondary">
              {isFamilyInvitation
                ? "Use the email address that received the household invitation."
                : "Enter your account details to continue managing your home technology."}
            </p>

            {isFamilyInvitation && (
              <div className="mt-6 rounded-2xl border border-warning/40 bg-warning-soft p-4">
                <p className="text-sm font-semibold text-achievement">
                  Family invitation detected
                </p>

                <p className="mt-1 text-sm leading-6 text-text-secondary">
                  You will return to the
                  invitation automatically
                  after signing in.
                </p>
              </div>
            )}

            {errorMessage && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <form
              onSubmit={handleSignIn}
              className="mt-8 space-y-5"
            >
              <FormField
                label="Email Address"
                icon={Mail}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  className={
                    inputClassName
                  }
                />
              </FormField>

              <FormField
                label="Password"
                icon={LockKeyhole}
              >
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
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    required
                    className={`${inputClassName} pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary transition hover:text-text-primary"
                  >
                    {showPassword ? (
                      <EyeOff
                        size={18}
                      />
                    ) : (
                      <Eye
                        size={18}
                      />
                    )}
                  </button>
                </div>
              </FormField>

              <div className="flex items-center justify-end">
                <Link
                  href={
                    forgotPasswordHref
                  }
                  className="text-sm font-semibold text-text-primary underline"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-charcoal px-6 py-4 font-semibold text-surface-card transition hover:bg-charcoal-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />
                ) : (
                  <ShieldCheck
                    size={19}
                  />
                )}

                {submitting
                  ? isFamilyInvitation
                    ? "Returning to Invitation..."
                    : "Opening Your Vault..."
                  : isFamilyInvitation
                    ? "Sign In and Accept Invitation"
                    : "Sign In to My Vault"}
              </button>
            </form>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-border-subtle" />

              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-text-tertiary">
                New here?
              </span>

              <div className="h-px flex-1 bg-border-subtle" />
            </div>

            <Link
              href={signupHref}
              className="inline-flex w-full items-center justify-center rounded-2xl border border-border-subtle bg-white px-6 py-4 font-semibold text-text-primary transition hover:border-border-strong hover:bg-surface-sunken"
            >
              {isFamilyInvitation
                ? "Create an Account to Join"
                : "Create Your Vault"}
            </Link>

            <p className="mt-7 text-center text-sm text-text-secondary">
              Want to look around first?{" "}
              <Link
                href="/demo"
                className="font-semibold text-text-primary underline"
              >
                Open Interactive Demo
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-border-subtle bg-white px-4 py-3.5 text-text-primary outline-none transition placeholder:text-text-tertiary focus:border-interaction focus:ring-2 focus:ring-interaction/20";

function FormField({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: typeof Mail;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-text-primary">
        <Icon
          size={16}
          className="text-interaction"
        />

        {label}
      </span>

      {children}
    </label>
  );
}

function LoginBenefit({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-4">
      <CheckCircle2
        size={19}
        className="shrink-0 text-interaction"
      />

      <p className="text-sm font-medium text-text-primary">
        {text}
      </p>
    </div>
  );
}