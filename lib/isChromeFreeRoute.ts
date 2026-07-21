const CHROME_FREE_PREFIX_ROUTES = [
  "/login",
  "/signup",
  "/demo",
  "/forgot-password",
  "/reset-password",
] as const;

export function isChromeFreeRoute(
  pathname: string
): boolean {
  if (pathname === "/") {
    return true;
  }

  if (
    pathname.startsWith(
      "/family/accept/"
    )
  ) {
    return true;
  }

  return CHROME_FREE_PREFIX_ROUTES.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );
}

export function isPublicRoute(
  pathname: string
): boolean {
  if (isChromeFreeRoute(pathname)) {
    return true;
  }

  if (
    pathname === "/upgrade" ||
    pathname.startsWith("/upgrade/")
  ) {
    return true;
  }

  return false;
}
