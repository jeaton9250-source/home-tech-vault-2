export const NAV_MENU_IDS = {
  quickAdd: "quick-add",
  profile: "profile",
  notifications: "notifications",
  navGroup: (groupId: string) =>
    `nav-${groupId}`,
} as const;
