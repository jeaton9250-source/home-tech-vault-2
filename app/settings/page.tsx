"use client";

import { Suspense } from "react";

import { useSearchParams } from "next/navigation";

import AccountSettingsTabs from "@/components/account-settings/AccountSettingsTabs";
import BillingTab from "@/components/account-settings/BillingTab";
import PreferencesTab from "@/components/account-settings/PreferencesTab";
import ProfileTab from "@/components/account-settings/ProfileTab";
import SecurityTab from "@/components/account-settings/SecurityTab";
import PageShell from "@/components/ui/PageShell";
import PageHero from "@/components/ui/PageHero";

import {
  resolveAccountSettingsTab,
  type AccountSettingsTabId,
} from "@/lib/account-settings/tabs";

function AccountSettingsContent() {
  const searchParams = useSearchParams();
  const activeTab = resolveAccountSettingsTab(searchParams.get("tab"));

  return (
    <>
      <AccountSettingsTabs activeTab={activeTab} />

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

function TabPanel({ tab }: { tab: AccountSettingsTabId }) {
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
    <PageShell className="bg-[#f7f6f2]">
      <PageHero
        eyebrow="Account"
        title="Settings"
        description="Manage your profile, preferences, security, and subscription."
      />

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
