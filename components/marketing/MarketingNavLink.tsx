"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";

import type { LandingSectionId } from "@/lib/marketing/landingNav";
import { landingSectionHref } from "@/lib/marketing/landingNav";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { cn } from "@/lib/design-system/cn";

type MarketingNavLinkProps = {
  label: string;
  sectionId: LandingSectionId;
  className?: string;
  onNavigate?: () => void;
};

export default function MarketingNavLink({
  label,
  sectionId,
  className,
  onNavigate,
}: MarketingNavLinkProps) {
  const pathname = usePathname();
  const isHome = pathname === MARKETING_ROUTES.home;
  const href = landingSectionHref(sectionId);

  function scrollToSection() {
    const target = document.getElementById(sectionId);

    if (!target) {
      return;
    }

    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    window.history.replaceState(
      null,
      "",
      `#${sectionId}`
    );
  }

  function handleClick(
    event: MouseEvent<HTMLAnchorElement>
  ) {
    if (isHome) {
      event.preventDefault();
      scrollToSection();
      onNavigate?.();
    }
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(className)}
    >
      {label}
    </Link>
  );
}
