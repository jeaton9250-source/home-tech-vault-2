import {
  MonitorSmartphone,
  Radar,
  ShieldCheck,
} from "lucide-react";

import LandingConnectorDownloads from "@/components/landing/LandingConnectorDownloads";
import {
  ConnectorDeviceCategoryGrid,
  ConnectorNetworkIllustration,
} from "@/components/landing/LandingConnectorIllustrations";
import { LANDING_SECTION_IDS } from "@/lib/marketing/landingNav";
import {
  landingMotionRise,
  landingSectionClass,
  landingSectionAnchor,
} from "@/lib/marketing/landingStyles";
import { cn } from "@/lib/design-system/cn";

export default function LandingSmartConnectorSection() {
  return (
    <section
      id={LANDING_SECTION_IDS.smartConnector}
      className={cn(
        landingSectionClass,
        landingSectionAnchor,
        "px-8 lg:px-10"
      )}
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <div className={cn(landingMotionRise, "order-2 lg:order-1")}>
          <ConnectorNetworkIllustration />
        </div>

        <div className={cn(landingMotionRise, "htv-landing-delay-1 order-1 lg:order-2")}>
          <p className="text-overline text-section-network">
            Smart Connector
          </p>
          <h2 className="mt-3 text-3xl font-medium tracking-[-0.03em] text-text-primary md:text-4xl">
            A quiet assistant for your home&apos;s technology.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-text-muted">
            The Smart Connector quietly watches over your home&apos;s
            technology. It automatically discovers compatible devices,
            keeps network information up to date, and helps Home Tech
            Vault remember what matters.
          </p>

          <div className="mt-5 space-y-1 text-sm font-medium text-text-secondary">
            <p>No complicated networking.</p>
            <p>No spreadsheets.</p>
            <p>No guesswork.</p>
          </div>

          <ul className="mt-6 space-y-3 text-sm text-text-secondary">
            <li className="flex items-start gap-3">
              <Radar size={16} className="mt-0.5 shrink-0 text-section-network" />
              Know what&apos;s connected — from TVs and speakers to smart
              home gear and aquarium tech
            </li>
            <li className="flex items-start gap-3">
              <MonitorSmartphone size={16} className="mt-0.5 shrink-0 text-section-network" />
              Clear, friendly review when something new appears on your
              network
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-section-network" />
              Private and local — it only watches your home network, never
              the public internet
            </li>
          </ul>

          <div className="mt-8">
            <LandingConnectorDownloads />
          </div>
        </div>
      </div>

      <div className="mx-auto mt-14 max-w-6xl">
        <div className="max-w-2xl">
          <h3 className="text-xl font-medium tracking-[-0.02em] text-text-primary">
            Technology your home already has
          </h3>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            Technology changes. Your memories stay organized.
          </p>
        </div>
        <div className="mt-6">
          <ConnectorDeviceCategoryGrid />
        </div>
      </div>
    </section>
  );
}
