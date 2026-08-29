"use client";

import Link from "next/link";
import {
  FormEvent,
  useState,
  useEffect,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import AuthCard from "@/components/auth/AuthCard";
import AuthLayout from "@/components/auth/AuthLayout";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import {
  trackAccountCreated,
  trackAuthStarted,
  trackSignupViewed,
} from "@/lib/analytics/activation";
import PasswordInput from "@/components/auth/PasswordInput";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import FormInput from "@/components/ui/FormInput";
import { brand } from "@/lib/design-system/tokens";
import { clearDemoModeStorage } from "@/lib/demo/demoModeStorage";
import { supabase } from "@/lib/supabase";
import { resolvePostAuthRedirect } from "@/lib/onboarding/redirect";
import { resolveSafeAuthRedirect } from "@/lib/auth/safeRedirect";

const signupBenefits = [
  "Organize every household device",
  "Track warranties and important documents",
  "Share access with trusted household members",
] as const;

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestedNext =
    resolveSafeAuthRedirect(
      searchParams,
      "/onboarding"
    );

  const isHomeClaimSignup =
    requestedNext.startsWith(
      "/claim-home/"
    );

  const signupDestination =
    isHomeClaimSignup
      ? requestedNext
      : "/onboarding";

  useEffect(() => {
    trackSignupViewed();
  }, []);
const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
const [
    showPassword,
    setShowPassword,
  ] = useState(false);
  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);
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

    const normalizedEmail =
      email.trim().toLowerCase();

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

    trackAuthStarted(
      "email"
    );

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
          emailRedirectTo:
            isHomeClaimSignup
              ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(
                  requestedNext
                )}`
              : `${window.location.origin}/onboarding`,
        },
      });

      if (signupError) {
        throw signupError;
      }

      if (
        data.user &&
        (
          data.user.identities
            ?.length ?? 0
        ) > 0
      ) {
        trackAccountCreated(
          "email"
        );

        // Founder notification is intentionally non-blocking.
        // A notification failure must never stop account creation.
        void fetch("/api/signup-notification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: data.user.id,
            email: normalizedEmail,
            method: "email",
          }),
        }).catch((notificationError) => {
          console.error(
            "Signup notification request failed:",
            notificationError
          );
        });
      }

      const user = data.user;
      const session = data.session;

      // Projects with email confirmation disabled can
      // enter onboarding immediately.
      if (user && session) {
        const destination =
          isHomeClaimSignup
            ? requestedNext
            : await resolvePostAuthRedirect(
                supabase,
                user.id,
                "/onboarding"
              );

        router.replace(destination);
        router.refresh();
        return;
      }

      setSuccessMessage(
        "Check your email to confirm your account. After signing in, we'll finish setting up your vault."
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
        overline="Free to start"
        title="Create your vault"
        description="Free to start. No credit card required."
      >
        <div
          onClickCapture={() => trackAuthStarted("google")}
        >
          <GoogleAuthButton
                    nextPath={signupDestination}
                    label="Continue with Google"
                  />
        </div>

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
            id="signup-email"
            label="Email"
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

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={submitting}
            loadingLabel="Creating account..."
          >
            Create free account
          </Button>

          <p className="text-center text-xs leading-5 text-[#7b858c]">
            By continuing, you agree to our{" "}
            <Link
              href="/terms"
              className="font-medium text-[#617c43] underline decoration-[#617c43]/30 underline-offset-4 hover:text-[#718d4f]"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="font-medium text-[#617c43] underline decoration-[#617c43]/30 underline-offset-4 hover:text-[#718d4f]"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </form>

        <p className="mt-6 text-center text-sm leading-6 text-text-muted">
          Already have an account?{" "}
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
