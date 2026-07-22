"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import {
  Bell,
  Compass,
} from "lucide-react";

import Link from "next/link";

import { supabase } from "@/lib/supabase";
import { restartOnboardingProfile } from "@/lib/onboarding";
import { usePermissions } from "@/hooks/usePermissions";
import { NOTIFICATIONS_LOCAL_STATE_NOTE } from "@/lib/notifications";

import {
  ReadOnlyRow,
  SettingsCard,
} from "@/components/account-settings/shared";

export default function PreferencesTab() {
  const router = useRouter();

  const {
    user,
    loading: permissionsLoading,
  } = usePermissions();

  const [
    restartingOnboarding,
    setRestartingOnboarding,
  ] = useState(false);

  async function handleRestartOnboarding() {
    if (!user) {
      return;
    }

    try {
      setRestartingOnboarding(true);

      await restartOnboardingProfile(
        supabase,
        user.id
      );

      router.push("/onboarding?restart=1");
    } catch (error) {
      console.error(
        "Unable to restart onboarding:",
        error
      );

      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to restart onboarding."
      );
    } finally {
      setRestartingOnboarding(false);
    }
  }

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Appearance"
        description="Display options for your vault."
      >
        <div className="space-y-3">
          <ReadOnlyRow
            label="Theme"
            value="Light mode"
          />

          <ReadOnlyRow
            label="Currency"
            value="USD"
          />

          <ReadOnlyRow
            label="Date format"
            value="MM/DD/YYYY"
          />
        </div>

        <p className="mt-4 text-xs leading-5 text-text-tertiary">
          Additional theme and formatting controls
          can be added in a future update.
        </p>
      </SettingsCard>

      <SettingsCard
        title="Notifications"
        description="Review alerts and activity updates from Home Tech Vault."
      >
        <p className="text-sm leading-6 text-text-secondary">
          {NOTIFICATIONS_LOCAL_STATE_NOTE}
        </p>

        <Link
          href="/notifications"
          className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border-subtle bg-surface-card px-5 text-sm font-semibold text-text-primary transition hover:bg-surface-sunken"
        >
          <Bell size={16} />
          Open notifications
        </Link>
      </SettingsCard>

      <SettingsCard
        title="Home Tech Vault preferences"
        description="Reset guided setup if you want to walk through onboarding again."
      >
        <button
          type="button"
          onClick={() => {
            void handleRestartOnboarding();
          }}
          disabled={
            restartingOnboarding ||
            permissionsLoading ||
            !user
          }
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border-subtle bg-surface-card px-5 text-sm font-semibold text-text-primary transition hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          <Compass size={16} />
          {restartingOnboarding
            ? "Restarting..."
            : "Restart onboarding"}
        </button>
      </SettingsCard>
    </div>
  );
}
