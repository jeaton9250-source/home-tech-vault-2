"use client";

import Link from "next/link";
import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import AuthCard from "@/components/auth/AuthCard";
import AuthLayout from "@/components/auth/AuthLayout";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import PasswordInput from "@/components/auth/PasswordInput";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import FormInput from "@/components/ui/FormInput";
import { brand } from "@/lib/design-system/tokens";
import { clearDemoModeStorage } from "@/lib/demo/demoModeStorage";
import { supabase } from "@/lib/supabase";
import { resolvePostAuthRedirect } from "@/lib/onboarding/redirect";

const signupBenefits = [
  "Organize every household device",
  "Track warranties and important documents",
  "Share access with trusted household members",
] as const;

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] =
    useState("");
  const [householdName, setHouseholdName] =
    useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);
  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

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

      clearDemoModeStorage();

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

        /*
         * A signup with an immediate authenticated session can
         * create its canonical household now. If email confirmation
         * is required and session is null, normal onboarding will
         * call the same endpoint through saveHomeName().
         */
        const householdResponse =
          await fetch(
            "/api/household/ensure",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                householdName:
                  normalizedHousehold,
              }),
            }
          );

        if (!householdResponse.ok) {
          const householdPayload =
            (await householdResponse.json()) as {
              error?: string;
            };

          console.error(
            "Unable to create canonical household:",
            householdPayload.error ||
              householdResponse.statusText
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
    <AuthLayout
      headline={brand.identity}
      description="Create one secure place for your household devices, warranties, documents, subscriptions, and maintenance records."
      benefits={[...signupBenefits]}
      brandHref="/"
    >
      <AuthCard
        overline="Get started"
        title="Create your Home Tech Vault"
        description="Set up one secure place for your household devices, warranties, documents, subscriptions, and maintenance records."
      >
        <GoogleAuthButton
          nextPath="/onboarding"
          label="Continue with Google"
        />

        <p className="mt-3 text-center text-xs leading-5 text-text-muted">
          By continuing with Google, you agree to our{" "}
          <Link
            href="/terms"
            className="font-medium text-interaction hover:underline"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="font-medium text-interaction hover:underline"
          >
            Privacy Policy
          </Link>
          .
        </p>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-border-subtle" />

          <span className="text-xs font-medium text-text-muted">
            or continue with email
          </span>

          <div className="h-px flex-1 bg-border-subtle" />
        </div>

        <div
          aria-live="polite"
          aria-atomic="true"
          className="mb-5 space-y-4 empty:mb-0"
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
              {successMessage}{" "}
              <Link
                href="/login"
                className="font-medium underline underline-offset-4"
              >
                Go to sign in
              </Link>
            </Alert>
          ) : null}
        </div>

        <form
          onSubmit={handleSignup}
          className="space-y-5"
          noValidate
        >
          <FormInput
            id="signup-full-name"
            label="Full name"
            type="text"
            value={fullName}
            onChange={(event) =>
              setFullName(
                event.target.value
              )
            }
            autoComplete="name"
            placeholder="Your full name"
            required
          />

          <FormInput
            id="signup-household-name"
            label="Household name"
            type="text"
            value={householdName}
            onChange={(event) =>
              setHouseholdName(
                event.target.value
              )
            }
            autoComplete="organization"
            placeholder="My household"
            helperText="This is the name your household will see in Home Tech Vault."
            required
          />

          <FormInput
            id="signup-email"
            label="Email address"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            autoComplete="email"
            placeholder="you@example.com"
            required
          />

          <PasswordInput
            id="signup-password"
            label="Password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            helperText="Use at least 8 characters."
            showPassword={showPassword}
            onToggleVisibility={() =>
              setShowPassword(
                (current) => !current
              )
            }
            required
          />

          <PasswordInput
            id="signup-confirm-password"
            label="Confirm password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            placeholder="Enter your password again"
            showPassword={showConfirmPassword}
            onToggleVisibility={() =>
              setShowConfirmPassword(
                (current) => !current
              )
            }
            required
          />

          <label className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-input)] border border-border-subtle bg-surface-sunken/70 p-4">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(event) =>
                setAgreedToTerms(
                  event.target.checked
                )
              }
              className="mt-1 h-4 w-4 accent-interaction"
            />

            <span className="text-sm leading-6 text-text-secondary">
              I agree to the{" "}
              <Link
                href="/terms"
                className="font-medium text-interaction underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-medium text-interaction underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
              >
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={submitting}
            loadingLabel="Creating your vault..."
          >
            Create My Vault
          </Button>
        </form>

        <p className="mt-6 text-center text-sm leading-6 text-text-muted">
          Already have a vault?{" "}
          <Link
            href="/login"
            className="font-medium text-interaction underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
          >
            Sign in
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
