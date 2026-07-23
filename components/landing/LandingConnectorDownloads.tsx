"use client";

import Link from "next/link";
import { Download } from "lucide-react";

import ConnectorDownloadActions from "@/components/connector/ConnectorDownloadActions";
import Button from "@/components/ui/Button";
import { useDemoMode } from "@/hooks/useDemoMode";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { cn } from "@/lib/design-system/cn";

export default function LandingConnectorDownloads({
  className,
  layout = "row",
}: {
  className?: string;
  layout?: "row" | "stack";
}) {
  const { user, loading } = useDemoMode();

  if (loading) {
    return (
      <div
        className={cn(
          layout === "row"
            ? "flex flex-wrap gap-3"
            : "flex flex-col gap-3",
          className
        )}
      >
        <Button type="button" variant="secondary" disabled>
          <Download size={16} />
          Loading...
        </Button>
      </div>
    );
  }

  if (user) {
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
        Available after signup.{" "}
        <Link
          href={MARKETING_ROUTES.signup}
          className="font-medium text-interaction hover:text-interaction-hover"
        >
          Create your free vault
        </Link>
      </p>
    </div>
  );
}
