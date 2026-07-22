"use client";

import { Suspense } from "react";

import { useSearchParams } from "next/navigation";

import AccountSettingsTabs from "@/components/account-settings/AccountSettingsTabs";
import BillingTab from "@/components/account-settings/BillingTab";
import PreferencesTab from "@/components/account-settings/PreferencesTab";
import ProfileTab from "@/components/account-settings/ProfileTab";
import SecurityTab from "@/components/account-settings/SecurityTab";
import PageShell from "@/components/ui/PageShell";

import {
  resolveAccountSettingsTab,
  type AccountSettingsTabId,
} from "@/lib/account-settings/tabs";

function AccountSettingsContent() {
  const searchParams = useSearchParams();
  const activeTab = resolveAccountSettingsTab(
    searchParams.get("tab")
  );

  return (
    <>
      <AccountSettingsTabs
        activeTab={activeTab}
      />

      <div
        id={`account-settings-panel-${activeTab}`}
        role="tabpanel"
        className="mt-8"
      >
        <TabPanel tab={activeTab} />
      </div>
    </>
  );
}

function TabPanel({
  tab,
}: {
  tab: AccountSettingsTabId;
}) {
  switch (tab) {
    case "preferences":
      return <PreferencesTab />;
    case "security":
      return <SecurityTab />;
    case "billing":
      return <BillingTab />;
    case "profile":
    default:
      return <ProfileTab />;
  }
}

export default function AccountSettingsPage() {
  return (
    <PageShell>
      <header className="mb-8">
        <p className="text-overline text-text-secondary">
          Account
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-text-primary md:text-4xl">
          Account & Settings
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary md:text-base">
          Manage your profile, preferences, security,
          and subscription.
        </p>
      </header>

      <Suspense
        fallback={
          <div className="text-sm text-text-secondary">
            Loading account settings...
          </div>
        }
      >
        <AccountSettingsContent />
      </Suspense>
    </PageShell>
  );
}
