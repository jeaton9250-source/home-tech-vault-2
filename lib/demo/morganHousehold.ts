import { MORGAN_DEMO_STATS } from "@/lib/demo/morganStats";

export { MORGAN_DEMO_STATS };

export const MORGAN_HOUSEHOLD = {
  name: "Morgan Household",
  displayName: "the Morgan Household",
  firstName: "Alex",
  email: "alex.morgan@example.com",
  fullName: "Alex Morgan",
} as const;

export const DEMO_WELCOME_SEEN_KEY =
  "home-tech-vault-demo-welcome-seen";

export const DEMO_TOUR_COMPLETED_KEY =
  "home-tech-vault-demo-tour-completed";

/** Bump when demo content changes so returning visitors get a fresh session. */
export const DEMO_DATA_VERSION = "morgan-household-v3";

export const DEMO_DATA_VERSION_KEY =
  "home-tech-vault-demo-data-version";
