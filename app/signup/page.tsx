"use client";

import Link from "next/link";
import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Mail,
  Sparkles,
  User,
  Users,
} from "lucide-react";

import AuthAlert from "@/components/auth/AuthAlert";
import AuthCard from "@/components/auth/AuthCard";
import AuthFormField from "@/components/auth/AuthFormField";
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordInput from "@/components/auth/PasswordInput";
import { authInputClassName } from "@/components/auth/authStyles";
import Button from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { resolvePostAuthRedirect } from "@/lib/onboarding/redirect";

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
    <AuthLayout
      overline="Get started"
      headline="Create your Home Tech Vault"
      description="Set up one secure place for your household devices, warranties, documents, subscriptions, and maintenance records."
      benefits={[
        "Organize every household device",
        "Track warranties and important documents",
        "Share access with trusted household members",
        "Keep network and subscription details together",
      ]}
      brandHref="/"
    >
      <AuthCard
        overline="Get started"
        title="Create your Home Tech Vault"
        description="Set up one secure place for your household devices, warranties, documents, subscriptions, and maintenance records."
      >
        <ul className="mb-6 space-y-2.5">
          {[
            "Organize every household device",
            "Track warranties and important documents",
            "Share access with trusted household members",
          ].map((benefit) => (
            <li
              key={benefit}
              className="flex items-start gap-2.5 text-sm leading-6 text-text-secondary"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-interaction" />
              {benefit}
            </li>
          ))}
        </ul>

        {errorMessage ? (
          <AuthAlert
            variant="error"
            className="mb-5"
          >
            {errorMessage}
          </AuthAlert>
        ) : null}

        {successMessage ? (
          <AuthAlert
            variant="success"
            className="mb-5"
          >
            {successMessage}

            <Link
              href="/login"
              className="mt-2 inline-block font-medium underline underline-offset-4"
            >
              Go to sign in
            </Link>
          </AuthAlert>
        ) : null}

        <form
          onSubmit={handleSignup}
          className="space-y-5"
          noValidate
        >
          <AuthFormField
            label="Full name"
            htmlFor="signup-full-name"
            icon={User}
          >
            <input
              id="signup-full-name"
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
              className={authInputClassName}
            />
          </AuthFormField>

          <AuthFormField
            label="Household name"
            htmlFor="signup-household-name"
            icon={Users}
            hint="This is the name your household will see in Home Tech Vault."
          >
            <input
              id="signup-household-name"
              type="text"
              value={householdName}
              onChange={(event) =>
                setHouseholdName(
                  event.target.value
                )
              }
              autoComplete="organization"
              placeholder="My household"
              required
              className={authInputClassName}
            />
          </AuthFormField>

          <AuthFormField
            label="Email address"
            htmlFor="signup-email"
            icon={Mail}
          >
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              autoComplete="email"
              placeholder="you@example.com"
              required
              className={authInputClassName}
            />
          </AuthFormField>

          <AuthFormField
            label="Password"
            htmlFor="signup-password"
            hint="Use at least 8 characters."
          >
            <PasswordInput
              id="signup-password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              showPassword={showPassword}
              onToggleVisibility={() =>
                setShowPassword(
                  (current) => !current
                )
              }
              required
              describedBy="signup-password-hint"
            />
          </AuthFormField>

          <AuthFormField
            label="Confirm password"
            htmlFor="signup-confirm-password"
          >
            <PasswordInput
              id="signup-confirm-password"
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
          </AuthFormField>

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
                className="font-medium text-interaction underline-offset-4 hover:underline"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-medium text-interaction underline-offset-4 hover:underline"
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
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                  aria-hidden
                />
                Creating your vault...
              </>
            ) : (
              <>
                <Sparkles
                  size={18}
                  aria-hidden
                />
                Create my vault
              </>
            )}
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

        <p className="mt-5 text-center text-sm text-text-muted">
          Want to look around first?{" "}
          <Link
            href="/demo"
            className="font-medium text-interaction underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction"
          >
            Open interactive demo
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
