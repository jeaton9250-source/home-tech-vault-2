"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import AuthAlert from "@/components/auth/AuthAlert";
import AuthCard from "@/components/auth/AuthCard";
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordInput from "@/components/auth/PasswordInput";
import Button from "@/components/ui/Button";
import FormInput from "@/components/ui/FormInput";
import { brand } from "@/lib/design-system/tokens";
import { supabase } from "@/lib/supabase";

const setupBenefits = [
  "Create your own independent Home Tech Vault",
  "Organize devices, documents, and warranties securely",
  "Stay separate from the administrator who invited you",
] as const;

export default function CreateAccountInviteSetupPage() {
  const router = useRouter();

  const [checkingSession, setCheckingSession] = useState(true);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function establishSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) {
          return;
        }

        if (session) {
          setSessionReady(true);
        }
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    }

    void establishSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) {
        return;
      }

      if (session) {
        setSessionReady(true);
        setErrorMessage("");
      }

      setCheckingSession(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!sessionReady) {
      return;
    }

    let cancelled = false;

    async function loadInvitation() {
      try {
        setLoadingInvite(true);
        setErrorMessage("");

        const response = await fetch(
          "/api/invite/create-account/session"
        );
        const payload = (await response.json()) as {
          invitation?: {
            email: string;
            firstName: string | null;
            lastName: string | null;
          };
          error?: string;
        };

        if (!response.ok) {
          throw new Error(
            payload.error ||
              "Unable to load this invitation."
          );
        }

        if (cancelled || !payload.invitation) {
          return;
        }

        setInviteEmail(payload.invitation.email);
        setFirstName(
          payload.invitation.firstName?.trim() || ""
        );
        setLastName(
          payload.invitation.lastName?.trim() || ""
        );
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load this invitation."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingInvite(false);
        }
      }
    }

    void loadInvitation();

    return () => {
      cancelled = true;
    };
  }, [sessionReady]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!sessionReady) {
      setErrorMessage(
        "Open the invitation link from your email to continue."
      );
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage("Enter your first and last name.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage(
        "Your password must be at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Your passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);

      const { error: passwordError } =
        await supabase.auth.updateUser({
          password,
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            full_name: `${firstName.trim()} ${lastName.trim()}`,
            onboarding_mode: "create_household",
            invitation_type: "create_account",
          },
        });

      if (passwordError) {
        throw passwordError;
      }

      router.replace("/onboarding/create-household");
      router.refresh();
    } catch (error) {
      console.error("Create-account setup error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save your account details."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (checkingSession || (sessionReady && loadingInvite)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface-base px-6">
        <div className="flex items-center gap-3 text-text-secondary">
          <Loader2 size={22} className="animate-spin" />
          Preparing your account setup…
        </div>
      </main>
    );
  }

  if (!sessionReady) {
    return (
      <AuthLayout
        headline={brand.identity}
        description="Create the Home Tech Vault account you were invited to set up."
        benefits={[...setupBenefits]}
      >
        <AuthCard
          overline="Account invitation"
          title="Open your invitation link"
          description="Use the secure link from your invitation email to continue. You will set your password on the next step."
        >
          {errorMessage ? (
            <AuthAlert variant="error">{errorMessage}</AuthAlert>
          ) : null}

          <div className="mt-6 flex flex-col gap-3">
            <Button href="/contact" variant="secondary">
              Contact support
            </Button>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      headline="Create your Home Tech Vault"
      description="Set your password and confirm your name to continue."
      benefits={[...setupBenefits]}
    >
      <AuthCard
        overline="Account invitation"
        title="Create your Home Tech Vault"
        description={
          inviteEmail
            ? `Finish setup for ${inviteEmail}.`
            : "Finish setup for your Home Tech Vault invitation."
        }
      >
        {errorMessage ? (
          <AuthAlert variant="error">{errorMessage}</AuthAlert>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <FormInput
            id="invite-email"
            label="Email"
            value={inviteEmail}
            readOnly
            disabled
            autoComplete="email"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              id="invite-first-name"
              label="First name"
              value={firstName}
              onChange={(event) =>
                setFirstName(event.target.value)
              }
              autoComplete="given-name"
              required
            />
            <FormInput
              id="invite-last-name"
              label="Last name"
              value={lastName}
              onChange={(event) =>
                setLastName(event.target.value)
              }
              autoComplete="family-name"
              required
            />
          </div>

          <PasswordInput
            id="invite-password"
            label="Password"
            value={password}
            onChange={setPassword}
            showPassword={showPassword}
            onToggleVisibility={() =>
              setShowPassword((current) => !current)
            }
            autoComplete="new-password"
            required
          />

          <PasswordInput
            id="invite-confirm-password"
            label="Confirm password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            showPassword={showConfirmPassword}
            onToggleVisibility={() =>
              setShowConfirmPassword((current) => !current)
            }
            autoComplete="new-password"
            required
          />

          <p className="text-xs leading-5 text-text-tertiary">
            Passwords must be at least 8 characters and match.
            Platform-admin access is not included with this
            invitation.
          </p>

          <Button
            type="submit"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving account…
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
