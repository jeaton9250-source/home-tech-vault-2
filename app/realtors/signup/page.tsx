"use client";

import Link from "next/link";
import {
  FormEvent,
  useState,
} from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Gift,
  Home,
} from "lucide-react";

import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import FormInput from "@/components/ui/FormInput";
import PasswordInput from "@/components/auth/PasswordInput";
import { supabase } from "@/lib/supabase";
import { clearDemoModeStorage } from "@/lib/demo/demoModeStorage";

const realtorBenefits = [
  "Create and manage Client Vaults",
  "Prepare each property before closing",
  "Securely transfer the vault to your buyer",
  "Give buyers one year of Home Tech Vault Pro",
] as const;

export default function RealtorSignupPage() {
  const [firstName, setFirstName] =
    useState("");
  const [lastName, setLastName] =
    useState("");
  const [email, setEmail] =
    useState("");
  const [brokerageName, setBrokerageName] =
    useState("");
  const [licenseState, setLicenseState] =
    useState("");
  const [password, setPassword] =
    useState("");
  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [submitting, setSubmitting] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const normalizedEmail =
      email.trim().toLowerCase();

    const cleanFirstName =
      firstName.trim();

    const cleanLastName =
      lastName.trim();

    if (
      !cleanFirstName ||
      !cleanLastName
    ) {
      setErrorMessage(
        "Enter your first and last name."
      );
      return;
    }

    if (
      !normalizedEmail ||
      !normalizedEmail.includes("@")
    ) {
      setErrorMessage(
        "Enter a valid email address."
      );
      return;
    }

    if (password.length < 8) {
      setErrorMessage(
        "Your password must be at least 8 characters."
      );
      return;
    }

    try {
      setSubmitting(true);
      clearDemoModeStorage();

      const origin =
        window.location.origin;

      const {
        data,
        error,
      } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo:
            `${origin}/auth/callback?next=${encodeURIComponent(
              "/realtors/setup"
            )}`,
          data: {
            first_name:
              cleanFirstName,
            last_name:
              cleanLastName,
            full_name:
              `${cleanFirstName} ${cleanLastName}`.trim(),
            brokerage_name:
              brokerageName.trim() ||
              undefined,
            license_state:
              licenseState
                .trim()
                .toUpperCase() ||
              undefined,

            /*
             * These values help route the user
             * through Realtor onboarding.
             *
             * Actual Realtor authorization is
             * created server-side after signup.
             */
            account_role:
              "realtor",
            onboarding_mode:
              "realtor",
            platform_access:
              "realtor",
            realtor_public_signup:
              true,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (
        data.user &&
        (data.user.identities?.length ?? 0) ===
          0
      ) {
        throw new Error(
          "An account already exists for this email. Sign in instead."
        );
      }

      /*
       * If email verification is disabled,
       * Supabase may give us a session now.
       */
      if (
        data.user &&
        data.session
      ) {
        window.location.assign(
          "/realtors/setup"
        );
        return;
      }

      setSuccessMessage(
        "Check your email to confirm your Realtor account. After confirming, we'll finish setting up your Realtor workspace."
      );
    } catch (error) {
      console.error(
        "[realtor-public-signup] failed:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to create your Realtor account."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f5ef] text-[#183047]">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[.9fr_1.1fr]">
        <section className="hidden bg-[#183047] px-10 py-14 text-white lg:flex lg:flex-col lg:justify-between">
          <Link
            href="/realtors"
            className="text-lg font-semibold"
          >
            Home Tech Vault
          </Link>

          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/75">
              <Gift size={16} />
              Home Tech Vault for Realtors
            </div>

            <h1 className="mt-7 text-5xl font-semibold tracking-[-0.045em]">
              Give your buyers a better
              handoff.
            </h1>

            <p className="mt-5 text-lg leading-8 text-white/65">
              Prepare a digital owner&apos;s
              manual for the property before
              closing, then securely transfer it
              to the buyer.
            </p>

            <div className="mt-9 space-y-4">
              {realtorBenefits.map(
                (benefit) => (
                  <div
                    key={benefit}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0 text-[#b7cb9e]"
                    />
                    <span className="text-sm text-white/75">
                      {benefit}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          <p className="text-xs text-white/40">
            A dedicated workspace for your
            client properties.
          </p>
        </section>

        <section className="flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-xl">
            <Link
              href="/realtors"
              className="mb-10 inline-flex items-center text-sm font-medium text-[#617c43] hover:underline lg:hidden"
            >
              ← Home Tech Vault for Realtors
            </Link>

            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#617c43]">
                Realtor account
              </p>

              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.035em]">
                Create your Realtor
                workspace
              </h2>

              <p className="mt-4 leading-7 text-[#183047]/65">
                Your Realtor account is
                separate from a homeowner
                vault and is designed for
                preparing Client Vaults.
              </p>
            </div>

            <div
              aria-live="polite"
              className="mb-6 space-y-4 empty:mb-0"
            >
              {errorMessage ? (
                <Alert variant="error">
                  {errorMessage}
                </Alert>
              ) : null}

              {successMessage ? (
                <Alert
                  variant="success"
                  title="Check your email"
                >
                  {successMessage}
                </Alert>
              ) : null}
            </div>

            {!successMessage ? (
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
                noValidate
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <FormInput
                    id="realtor-first-name"
                    label="First name"
                    value={firstName}
                    onChange={(event) =>
                      setFirstName(
                        event.target.value
                      )
                    }
                    autoComplete="given-name"
                    required
                  />

                  <FormInput
                    id="realtor-last-name"
                    label="Last name"
                    value={lastName}
                    onChange={(event) =>
                      setLastName(
                        event.target.value
                      )
                    }
                    autoComplete="family-name"
                    required
                  />
                </div>

                <FormInput
                  id="realtor-email"
                  label="Business email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  autoComplete="email"
                  placeholder="you@brokerage.com"
                  required
                />

                <div className="grid gap-5 sm:grid-cols-[1fr_150px]">
                  <FormInput
                    id="realtor-brokerage"
                    label="Brokerage"
                    value={brokerageName}
                    onChange={(event) =>
                      setBrokerageName(
                        event.target.value
                      )
                    }
                    autoComplete="organization"
                    placeholder="Optional"
                  />

                  <FormInput
                    id="realtor-license-state"
                    label="License state"
                    value={licenseState}
                    onChange={(event) =>
                      setLicenseState(
                        event.target.value
                      )
                    }
                    placeholder="NC"
                    maxLength={40}
                  />
                </div>

                <PasswordInput
                  id="realtor-password"
                  label="Password"
                  value={password}
                  onChange={setPassword}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  helperText="Use at least 8 characters."
                  showPassword={showPassword}
                  onToggleVisibility={() =>
                    setShowPassword(
                      (current) =>
                        !current
                    )
                  }
                  required
                />

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  loading={submitting}
                  loadingLabel="Creating Realtor account..."
                >
                  Create Realtor Account
                </Button>

                <p className="text-center text-xs leading-5 text-[#7b858c]">
                  By continuing, you agree to
                  our{" "}
                  <Link
                    href="/terms"
                    className="font-medium text-[#617c43] underline underline-offset-4"
                  >
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="font-medium text-[#617c43] underline underline-offset-4"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </form>
            ) : null}

            <div className="mt-8 border-t border-[#183047]/10 pt-6 text-center">
              <p className="text-sm text-[#183047]/60">
                Already have a Realtor
                account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[#617c43] hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#183047]/10 bg-white p-4">
                <Building2
                  size={18}
                  className="text-[#617c43]"
                />
                <p className="mt-3 text-sm font-semibold">
                  Realtor workspace
                </p>
                <p className="mt-1 text-xs leading-5 text-[#183047]/55">
                  Keep client properties
                  separate from personal home
                  records.
                </p>
              </div>

              <div className="rounded-2xl border border-[#183047]/10 bg-white p-4">
                <Home
                  size={18}
                  className="text-[#617c43]"
                />
                <p className="mt-3 text-sm font-semibold">
                  Property-by-property
                </p>
                <p className="mt-1 text-xs leading-5 text-[#183047]/55">
                  Create a Client Vault for
                  each closing.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
