"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
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
  User,
  Users,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { resolvePostAuthRedirect } from "@/lib/onboarding/redirect";

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [householdName, setHouseholdName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [agreedToTerms, setAgreedToTerms] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  async function handleSignup(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const normalizedName = fullName.trim();
    const normalizedHousehold =
      householdName.trim();
    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedName) {
      setErrorMessage(
        "Enter your full name."
      );
      return;
    }

    if (!normalizedHousehold) {
      setErrorMessage(
        "Enter a household name."
      );
      return;
    }

    if (!normalizedEmail) {
      setErrorMessage(
        "Enter your email address."
      );
      return;
    }

    if (password.length < 8) {
      setErrorMessage(
        "Your password must be at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(
        "Your passwords do not match."
      );
      return;
    }

    if (!agreedToTerms) {
      setErrorMessage(
        "You must agree to the Terms and Privacy Policy."
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
        error: signupError,
      } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: normalizedName,
            household_name:
              normalizedHousehold,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (signupError) {
        throw signupError;
      }

      const user = data.user;
      const session = data.session;

      if (user && session) {
        const {
          error: profileError,
        } = await supabase
          .from("profiles")
          .upsert(
            {
              id: user.id,
              full_name:
                normalizedName,
              household_name:
                normalizedHousehold,
              avatar_url: null,
            },
            {
              onConflict: "id",
            }
          );

        if (profileError) {
          console.error(
            "Unable to create profile:",
            profileError
          );
        }

        const destination =
          await resolvePostAuthRedirect(
            supabase,
            user.id,
            "/dashboard"
          );

        router.replace(destination);
        router.refresh();
        return;
      }

      setSuccessMessage(
        "Your vault was created. Check your email to confirm your account, then sign in."
      );
    } catch (error) {
      console.error(
        "Signup error:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to create your account."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-surface-sunken px-5 py-8 md:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-64px)] max-w-7xl overflow-hidden rounded-[36px] border border-border-subtle bg-white shadow-xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="htv-auth-panel relative overflow-hidden px-7 py-10 text-text-primary md:px-12 md:py-14">
          <div className="relative z-10">
            <Link
              href="/demo"
              className="inline-flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border-subtle bg-surface-card text-section-insights shadow-[var(--shadow-sm)]">
                <ShieldCheck size={22} />
              </div>

              <div>
                <p className="font-bold">
                  Home Tech Vault
                </p>

                <p className="text-xs text-text-tertiary">
                  Organize. Protect. Simplify.
                </p>
              </div>
            </Link>

            <p className="mt-14 text-overline text-home-health">
              Your home technology, organized
            </p>

            <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-tight md:text-6xl">
              Create one secure place for every device in your home.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-text-secondary">
              Track devices, warranties, receipts,
              subscriptions, maintenance, and network
              details without searching through drawers,
              inboxes, or old files.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <SignupBenefit text="Track every device" />
              <SignupBenefit text="Store receipts and manuals" />
              <SignupBenefit text="Monitor warranty dates" />
              <SignupBenefit text="Protect your home inventory" />
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
              Create Your Vault
            </p>

            <h2 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">
              Start organizing your home technology
            </h2>

            <p className="mt-3 text-sm leading-6 text-text-secondary">
              Create your account and begin building
              your personal Home Tech Vault.
            </p>

            {errorMessage && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700">
                {successMessage}

                <Link
                  href="/login"
                  className="mt-3 block font-semibold underline"
                >
                  Go to Sign In
                </Link>
              </div>
            )}

            <form
              onSubmit={handleSignup}
              className="mt-8 space-y-5"
            >
              <FormField
                label="Full Name"
                icon={User}
              >
                <input
                  type="text"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(
                      event.target.value
                    )
                  }
                  autoComplete="name"
                  placeholder="Your Full Name"
                  className={inputClassName}
                />
              </FormField>

              <FormField
                label="Household Name"
                icon={Users}
              >
                <input
                  type="text"
                  value={householdName}
                  onChange={(event) =>
                    setHouseholdName(
                      event.target.value
                    )
                  }
                  placeholder="My Household"
                  className={inputClassName}
                />
              </FormField>

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
                  className={inputClassName}
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
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
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
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </FormField>

              <FormField
                label="Confirm Password"
                icon={LockKeyhole}
              >
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
                  placeholder="Enter your password again"
                  className={inputClassName}
                />
              </FormField>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-surface-sunken p-4">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(event) =>
                    setAgreedToTerms(
                      event.target.checked
                    )
                  }
                  className="mt-1 h-4 w-4 accent-[#111827]"
                />

                <span className="text-sm leading-6 text-text-secondary">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="font-semibold text-text-primary underline"
                  >
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="font-semibold text-text-primary underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>

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
                  <Sparkles size={19} />
                )}

                {submitting
                  ? "Creating Your Vault..."
                  : "Create My Vault"}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-text-secondary">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-text-primary underline"
              >
                Sign In
              </Link>
            </p>

            <p className="mt-4 text-center text-sm text-text-secondary">
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
  icon: typeof User;
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

function SignupBenefit({
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