import { PRIMARY_NAV_ITEMS } from "@/lib/navigation/config";

/**
 * Returns the href of the active primary nav item, if any.
 */
export function resolveActivePrimaryNav(
  pathname: string
): string | null {
  for (const item of PRIMARY_NAV_ITEMS) {
    const prefixes = item.activePrefixes ?? [
      item.href,
    ];

    if (
      prefixes.some(
        (prefix) =>
          pathname === prefix ||
          pathname.startsWith(`${prefix}/`)
      )
    ) {
      return item.href;
    }
  }

  return null;
}

export function isPrimaryNavActive(
  pathname: string,
  href: string
): boolean {
  return resolveActivePrimaryNav(pathname) === href;
}

/** @deprecated Use resolveActivePrimaryNav */
export function resolveActiveNavGroup(
  pathname: string
): string | null {
  const active = resolveActivePrimaryNav(pathname);

  if (active === "/dashboard") {
    return "overview";
  }

  if (active === "/devices") {
    return "technology";
  }

  if (active === "/documents") {
    return "digitalVault";
  }

  if (active === "/network") {
    return "network";
  }

  if (active === "/reports") {
    return "insights";
  }

  if (active === "/warranties") {
    return "technology";
  }

  return null;
}
