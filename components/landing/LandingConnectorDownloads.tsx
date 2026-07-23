"use client";

import Link from "next/link";
import { Download } from "lucide-react";

import { LandingConnectorDemoSummary } from "@/components/landing/LandingConnectorIllustrations";
import ConnectorDownloadActions from "@/components/connector/ConnectorDownloadActions";
import Button from "@/components/ui/Button";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { cn } from "@/lib/design-system/cn";

export default function LandingConnectorDownloads({
  className,
  layout = "row",
  isSignedIn = false,
  showDemoPreview = false,
}: {
  className?: string;
  layout?: "row" | "stack";
  isSignedIn?: boolean;
  showDemoPreview?: boolean;
}) {
  if (isSignedIn) {
    return (
      <ConnectorDownloadActions
        className={className}
        layout={layout}
        showVersionLabel={false}
      />
    );
  }

  return (
    <div className={className}>
      {showDemoPreview ? (
        <div className="space-y-5">
          <p className="text-sm leading-6 text-text-secondary">
            Smart Connector available after signup.{" "}
            <Link
              href={MARKETING_ROUTES.signup}
              className="font-medium text-interaction hover:text-interaction-hover"
            >
              Start Free
            </Link>
          </p>
          <LandingConnectorDemoSummary />
        </div>
      ) : (
        <>
          <div
            className={cn(
              layout === "row"
                ? "flex flex-wrap gap-3"
                : "flex flex-col gap-3"
            )}
          >
            <Button type="button" variant="secondary" disabled>
              <Download size={16} />
              Download for macOS
            </Button>
            <Button type="button" variant="secondary" disabled>
              <Download size={16} />
              Download for Windows
            </Button>
          </div>
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            Smart Connector available after signup.{" "}
            <Link
              href={MARKETING_ROUTES.signup}
              className="font-medium text-interaction hover:text-interaction-hover"
            >
              Start Free
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
