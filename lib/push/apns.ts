import "server-only";

export type ApnsEnvironment = "sandbox" | "production";

export function getApnsConfiguration() {
  return {
    keyId: process.env.APNS_KEY_ID?.trim() || null,
    teamId: process.env.APNS_TEAM_ID?.trim() || null,
    privateKey: process.env.APNS_PRIVATE_KEY?.trim() || null,
    bundleId:
      process.env.APNS_BUNDLE_ID?.trim() ||
      process.env.NEXT_PUBLIC_IOS_BUNDLE_ID?.trim() ||
      null,
    environment:
      process.env.APNS_ENVIRONMENT?.trim() === "production"
        ? "production"
        : "sandbox",
  } as const;
}

export function isApnsConfigured() {
  const config = getApnsConfiguration();
  return Boolean(config.keyId && config.teamId && config.privateKey && config.bundleId);
}
