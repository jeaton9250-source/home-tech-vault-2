export type InstallationGuideStep = {
  id: string;
  title: string;
  description: string;
  detail?: string;
  actionLabel?: string;
  actionHref?: string;
};

export const CONNECTOR_INSTALLATION_STEPS: InstallationGuideStep[] = [
  {
    id: "download",
    title: "Download the connector",
    description:
      "Install the Home Tech Vault Connector on a Mac that stays connected to your home network.",
    actionLabel: "Download for macOS",
  },
  {
    id: "install",
    title: "Open and install",
    description:
      "Open the downloaded app and move it to Applications if macOS prompts you.",
    detail:
      "The connector runs quietly in the background once paired.",
  },
  {
    id: "pair",
    title: "Generate a pairing code",
    description:
      "From Home Tech Vault, generate a one-time pairing code as a household Admin.",
    actionLabel: "Open pairing",
    actionHref: "/network/connect",
  },
  {
    id: "enter-code",
    title: "Enter the code in the connector",
    description:
      "Paste the pairing code into the connector app within 10 minutes to link securely.",
  },
  {
    id: "scan",
    title: "Run your first scan",
    description:
      "Use Manual Scan My Network in the connector to discover devices on your LAN.",
    actionLabel: "Review discovery",
    actionHref: "/network/discovery",
  },
  {
    id: "monitor",
    title: "Enable automatic monitoring",
    description:
      "Upgrade to Pro for background scans every 15 minutes, presence monitoring, and Home Pulse updates.",
    actionLabel: "View Pro plans",
    actionHref: "/upgrade",
  },
];
