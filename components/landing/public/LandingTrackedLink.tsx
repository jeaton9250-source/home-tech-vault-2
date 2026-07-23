"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent, ReactNode } from "react";

import { trackLandingEvent } from "@/lib/marketing/landingAnalytics";
import { cn } from "@/lib/design-system/cn";

type LandingTrackedLinkProps = {
  href: string;
  eventName?: string;
  eventParams?: Record<
    string,
    string | number | boolean | undefined
  >;
  className?: string;
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
} & Omit<
  ComponentProps<typeof Link>,
  "href" | "className" | "children" | "onClick"
>;

export default function LandingTrackedLink({
  href,
  eventName,
  eventParams,
  className,
  children,
  onClick,
  ...rest
}: LandingTrackedLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={(event) => {
        if (eventName) {
          trackLandingEvent(eventName, eventParams);
        }

        onClick?.(event);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}

export function LandingScrollLink({
  sectionId,
  eventName,
  className,
  children,
}: {
  sectionId: string;
  eventName?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={`#${sectionId}`}
      className={cn(className)}
      onClick={() => {
        if (eventName) {
          trackLandingEvent(eventName);
        }
      }}
    >
      {children}
    </a>
  );
}
