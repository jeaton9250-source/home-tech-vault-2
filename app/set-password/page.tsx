"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import AuthAlert from "@/components/auth/AuthAlert";
import AuthCard from "@/components/auth/AuthCard";
import AuthLayout from "@/components/auth/AuthLayout";
import { brand } from "@/lib/design-system/tokens";
import { supabase } from "@/lib/supabase";

type InviteMetadata = {
  invitation_token?: string;
  invitation_type?: string;
};

function resolveInviteDestination(
  metadata: InviteMetadata | undefined
) {
  const invitationType =
    typeof metadata?.invitation_type === "string"
      ? metadata.invitation_type.trim().toLowerCase()
      : "";

  if (
    invitationType === "create_account" ||
    invitationType === "new_account"
  ) {
    return "/invite/setup";
  }

  const token =
    typeof metadata?.invitation_token === "string"
      ? metadata.invitation_token.trim()
      : "";

  if (!token) {
    return null;
  }

  if (
    invitationType === "join_household" ||
    invitationType === "household_member"
  ) {
    return `/family/accept/${encodeURIComponent(token)}`;
  }

  return `/family/accept/${encodeURIComponent(token)}`;
}

export default function SetPasswordPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function redirectToInviteSetup() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) {
          return;
        }

        if (error) {
          throw error;
        }

        if (!session) {
          setErrorMessage(
            "Open the invitation link from your email to continue account setup."
          );
          return;
        }

        const destination = resolveInviteDestination(
          session.user.user_metadata as InviteMetadata
        );

        if (destination) {
          router.replace(destination);
          return;
        }

        setErrorMessage(
          "This invitation link is missing setup details. Contact support if the problem continues."
        );
      } catch (error) {
        if (!mounted) {
          return;
        }

        console.error("Set-password redirect error:", error);
        setErrorMessage(
          "Unable to continue account setup. Open the invitation link from your email and try again."
        );
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    }

    void redirectToInviteSetup();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted || !session) {
        return;
      }

      const destination = resolveInviteDestination(
        session.user.user_metadata as InviteMetadata
      );

      if (destination) {
        router.replace(destination);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <AuthLayout
      headline="Finish account setup"
      description={`Continue setting up your ${brand.name} account.`}
      benefits={[
        "Create your password securely",
        "Join the household associated with your invitation",
        "Keep your devices and documents private",
      ]}
    >
      <AuthCard
        title="Checking your invitation"
        description="We are preparing your household invitation."
      >
        {checkingSession ? (
          <div className="flex items-center justify-center gap-3 py-8 text-text-secondary">
            <Loader2 size={20} className="animate-spin" />
            Preparing your setup…
          </div>
        ) : null}

        {errorMessage ? (
          <AuthAlert variant="error">{errorMessage}</AuthAlert>
        ) : null}
      </AuthCard>
    </AuthLayout>
  );
}
