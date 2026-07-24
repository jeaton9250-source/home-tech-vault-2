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
import Button from "@/components/ui/Button";
import FormInput from "@/components/ui/FormInput";
import {
  readInviteUserMetadata,
  resolveCreateAccountInvitePath,
  userHasHouseholdMembership,
} from "@/lib/auth/inviteOnboarding";
import { brand } from "@/lib/design-system/tokens";
import { supabase } from "@/lib/supabase";

const setupBenefits = [
  "Name the household you will own",
  "Start with a blank vault dashboard",
  "Invite family members when you are ready",
] as const;

export default function CreateHouseholdOnboardingPage() {
  const router = useRouter();

  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [householdName, setHouseholdName] = useState("");
  const [homeNickname, setHomeNickname] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) {
          return;
        }

        if (!session) {
          router.replace("/invite/setup");
          return;
        }

        const hasHousehold =
          await userHasHouseholdMembership(
            session.user.id
          );

        const invitePath = resolveCreateAccountInvitePath({
          user: session.user,
          hasHousehold,
        });

        if (invitePath === "/invite/setup") {
          router.replace("/invite/setup");
          return;
        }

        if (hasHousehold) {
          router.replace("/dashboard");
          return;
        }

        const metadata = readInviteUserMetadata(
          session.user
        );

        console.info("Invite onboarding route", {
          userId: session.user.id,
          invitationType: metadata.invitationType,
          onboardingMode: metadata.onboardingMode,
          hasHousehold,
        });

        setSessionReady(true);

        setFirstName(
          typeof session.user.user_metadata
            ?.first_name === "string"
            ? session.user.user_metadata.first_name
            : ""
        );
        setLastName(
          typeof session.user.user_metadata
            ?.last_name === "string"
            ? session.user.user_metadata.last_name
            : ""
        );
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    }

    void loadSession();
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!householdName.trim()) {
      setErrorMessage("Enter a household name.");
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage("Enter your first and last name.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        "/api/invite/create-account/household",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            householdName: householdName.trim(),
            homeNickname: homeNickname.trim() || null,
          }),
        }
      );

      const payload = (await response.json()) as {
        redirectTo?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          payload.error || "Unable to create your household."
        );
      }

      router.replace(payload.redirectTo || "/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Create household onboarding error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to create your household."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (checkingSession || !sessionReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface-base px-6">
        <div className="flex items-center gap-3 text-text-secondary">
          <Loader2 size={22} className="animate-spin" />
          Preparing your vault setup…
        </div>
      </main>
    );
  }

  return (
    <AuthLayout
      headline={brand.identity}
      description="Name the Home Tech Vault household you will own."
      benefits={[...setupBenefits]}
    >
      <AuthCard
        overline="Vault setup"
        title="Name your Home Tech Vault"
        description="Choose the household name that will appear across your dashboard."
      >
        {errorMessage ? (
          <AuthAlert variant="error">{errorMessage}</AuthAlert>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <FormInput
            id="household-name"
            label="Household / vault name"
            value={householdName}
            onChange={(event) =>
              setHouseholdName(event.target.value)
            }
            placeholder="Eaton Home"
            autoComplete="organization"
            required
          />

          <FormInput
            id="home-nickname"
            label="Home nickname (optional)"
            value={homeNickname}
            onChange={(event) =>
              setHomeNickname(event.target.value)
            }
            placeholder="Main house"
            autoComplete="off"
          />

          <Button
            type="submit"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating vault…
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
