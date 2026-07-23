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
            A quiet assistant on your home network.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-text-muted">
            The Smart Connector runs locally on your Mac or PC, discovers
            devices with low-impact methods, and syncs observations to your
            vault. It never scans the public internet or inspects browsing
            activity.
          </p>

          <ul className="mt-6 space-y-3 text-sm text-text-secondary">
            <li className="flex items-start gap-3">
              <Radar size={16} className="mt-0.5 shrink-0 text-section-network" />
              Passive discovery across computers, entertainment, smart home,
              networking, and aquarium tech
            </li>
            <li className="flex items-start gap-3">
              <MonitorSmartphone size={16} className="mt-0.5 shrink-0 text-section-network" />
              Confidence-based identification with clear review for unknown
              devices
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-section-network" />
              Private local network only — your data stays in your household
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
            Supported device categories
          </h3>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            Identification improves as signals accumulate. Unknown devices
            always go to review — we do not claim perfect product-level
            matching.
          </p>
        </div>
        <div className="mt-6">
          <ConnectorDeviceCategoryGrid />
        </div>
      </div>
    </section>
  );
}
