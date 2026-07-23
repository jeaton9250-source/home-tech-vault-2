import NetworkPageContent from "@/components/network/NetworkPageContent";

/**
 * Network monitoring dashboard.
 * UI and data loading live in NetworkPageContent so tab search params can
 * suspend under a shared PageShell skeleton.
 */
export default function NetworkPage() {
  return <NetworkPageContent />;
}
