/**
 * Demo mode is a client-only flag in localStorage.
 * It must never override explicit navigation to public auth routes.
 */

export const DEMO_STORAGE_KEY = "home-tech-vault-demo";
export const DEMO_CHANGE_EVENT = "home-tech-vault-demo-change";

export const AUTH_ROUTES_THAT_CLEAR_DEMO = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/set-password",
  "/auth/callback",
  "/auth/confirm",
  "/auth/error",
] as const;

function normalizePathname(
  pathname: string | null | undefined
): string {
  if (!pathname || pathname === "") {
    return "/";
  }

  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

export function isAuthRouteThatClearsDemo(
  pathname: string | null | undefined
): boolean {
  const path = normalizePathname(pathname);

  return AUTH_ROUTES_THAT_CLEAR_DEMO.some(
    (route) =>
      path === route || path.startsWith(`${route}/`)
  );
}

export function getStoredDemoMode(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.localStorage.getItem(DEMO_STORAGE_KEY) ===
    "true"
  );
}

export function clearDemoModeStorage(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const wasEnabled = getStoredDemoMode();

  window.localStorage.removeItem(DEMO_STORAGE_KEY);

  if (wasEnabled) {
    window.dispatchEvent(new Event(DEMO_CHANGE_EVENT));
  }

  return wasEnabled;
}

export function enableDemoModeStorage() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DEMO_STORAGE_KEY, "true");
  window.dispatchEvent(new Event(DEMO_CHANGE_EVENT));
}

/**
 * Clear a stale demo flag when the user explicitly opens an auth route.
 * Returns true if demo mode was active and cleared.
 */
export function clearDemoModeForAuthRoute(
  pathname: string | null | undefined
): boolean {
  if (!isAuthRouteThatClearsDemo(pathname)) {
    return false;
  }

  return clearDemoModeStorage();
}
