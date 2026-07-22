export const ACCOUNT_SETTINGS_TABS = [
  {
    id: "profile",
    label: "Profile",
  },
  {
    id: "preferences",
    label: "Preferences",
  },
  {
    id: "security",
    label: "Security",
  },
  {
    id: "billing",
    label: "Billing",
  },
] as const;

export type AccountSettingsTabId =
  (typeof ACCOUNT_SETTINGS_TABS)[number]["id"];

export function isAccountSettingsTabId(
  value: string | null | undefined
): value is AccountSettingsTabId {
  return ACCOUNT_SETTINGS_TABS.some(
    (tab) => tab.id === value
  );
}

export function resolveAccountSettingsTab(
  value: string | null | undefined
): AccountSettingsTabId {
  if (isAccountSettingsTabId(value)) {
    return value;
  }

  return "profile";
}

export function accountSettingsHref(
  tab: AccountSettingsTabId = "profile"
) {
  if (tab === "profile") {
    return "/settings";
  }

  return `/settings?tab=${tab}`;
}
