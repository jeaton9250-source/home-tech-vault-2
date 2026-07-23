export type InstallationGuideStep = {
  id: string;
  title: string;
  description: string;
  detail?: string;
  actionLabel?: string;
  actionHref?: string;
};

export const CONNECTOR_INSTALLATION_COMPLETE_MESSAGE =
  "Your home is now connected.";

export const CONNECTOR_INSTALLATION_STEPS: InstallationGuideStep[] = [
  {
    id: "download",
    title: "Download",
    description:
      "Download the Home Tech Vault Connector for macOS on a Mac that stays connected to your home network.",
    actionLabel: "Download for macOS",
  },
  {
    id: "move",
    title: "Move to Applications",
    description:
      "Drag Home Tech Vault Connector into your Applications folder when macOS prompts you.",
    detail:
      "Keeping the app in Applications ensures it stays available for background monitoring.",
  },
  {
    id: "open",
    title: "Open",
    description:
      "Launch the connector from Applications and allow any local network permissions macOS requests.",
    detail:
      "The connector runs quietly in the menu bar once paired.",
  },
  {
    id: "pair",
    title: "Pair",
    description:
      "Generate a one-time pairing code in Home Tech Vault, then enter it in the connector within 10 minutes.",
    actionLabel: "Open pairing",
    actionHref: "/network/connect",
  },
  {
    id: "scan",
    title: "Scan My Network",
    description:
      "Run Manual Scan My Network in the connector to discover devices on your LAN.",
    actionLabel: "Review discovery",
    actionHref: "/network/discovery",
  },
  {
    id: "monitor",
    title: "Automatic Monitoring (Pro)",
    description:
      "Upgrade to Pro for background scans every 15 minutes, presence monitoring, and Home Pulse updates.",
    actionLabel: "View Pro plans",
    actionHref: "/upgrade",
  },
];
