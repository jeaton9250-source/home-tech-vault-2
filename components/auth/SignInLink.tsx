"use client";

import Link from "next/link";
import type {
  ComponentProps,
  MouseEvent,
  ReactNode,
} from "react";

import { useDemoMode } from "@/hooks/useDemoMode";
import { clearDemoModeStorage } from "@/lib/demo/demoModeStorage";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";

type SignInLinkProps = {
  children?: ReactNode;
  className?: string;
  href?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
} & Omit<
  ComponentProps<typeof Link>,
  "href" | "className" | "children" | "onClick"
>;

/**
 * Dedicated Sign In control — never shares handlers with demo CTAs.
 * Clears stale demo mode before navigating to /login.
 */
export default function SignInLink({
  children = "Sign In",
  className,
  href = MARKETING_ROUTES.login,
  onClick,
  ...rest
}: SignInLinkProps) {
  const { exitDemo } = useDemoMode();

  return (
    <Link
      href={href}
      className={className}
      onClick={(event) => {
        clearDemoModeStorage();
        exitDemo();
        onClick?.(event);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
