import {
  isGaEnabled,
  trackEvent,
  type GaEventParams,
} from "@/lib/analytics";

export type ActivationAuthProvider =
  | "email"
  | "google"
  | "apple";

const pendingEvents =
  new Set<string>();

function storageKey(
  key: string
) {
  return `htv:activation:${key}`;
}

function hasTracked(
  key: string
) {
  if (
    typeof window === "undefined"
  ) {
    return false;
  }

  try {
    return (
      window.sessionStorage.getItem(
        storageKey(key)
      ) === "1"
    );
  } catch {
    return false;
  }
}

function markTracked(
  key: string
) {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  try {
    window.sessionStorage.setItem(
      storageKey(key),
      "1"
    );
  } catch {
    // Analytics must never affect product UX.
  }
}

function trackWhenReady(
  eventName: string,
  parameters?: GaEventParams,
  onceKey?: string
) {
  if (
    typeof window === "undefined" ||
    !isGaEnabled()
  ) {
    return;
  }

  if (
    onceKey &&
    hasTracked(onceKey)
  ) {
    return;
  }

  const pendingKey =
    onceKey ??
    `${eventName}:${Date.now()}`;

  if (
    pendingEvents.has(
      pendingKey
    )
  ) {
    return;
  }

  pendingEvents.add(
    pendingKey
  );

  let attempts = 0;

  function attempt() {
    attempts += 1;

    if (
      typeof window.gtag ===
      "function"
    ) {
      trackEvent(
        eventName,
        parameters
      );

      if (onceKey) {
        markTracked(
          onceKey
        );
      }

      pendingEvents.delete(
        pendingKey
      );

      return;
    }

    if (attempts >= 12) {
      pendingEvents.delete(
        pendingKey
      );
      return;
    }

    window.setTimeout(
      attempt,
      250
    );
  }

  attempt();
}

export function trackSignupViewed() {
  trackWhenReady(
    "signup_viewed",
    {
      funnel: "activation",
    },
    "signup_viewed"
  );
}

export function trackAuthStarted(
  provider: ActivationAuthProvider
) {
  trackWhenReady(
    "auth_started",
    {
      funnel: "activation",
      provider,
    }
  );
}

export function trackAccountCreated(
  provider: ActivationAuthProvider
) {
  trackWhenReady(
    "account_created",
    {
      funnel: "activation",
      provider,
    },
    "account_created"
  );
}

export function trackHomeNamed() {
  trackWhenReady(
    "home_named",
    {
      funnel: "activation",
    },
    "home_named"
  );
}

export function trackDashboardReached(
  input: {
    deviceCount: number;
    documentCount: number;
    fromOnboarding: boolean;
  }
) {
  trackWhenReady(
    "dashboard_reached",
    {
      funnel: "activation",
      device_count:
        input.deviceCount,
      document_count:
        input.documentCount,
      from_onboarding:
        input.fromOnboarding,
    },
    "dashboard_reached"
  );
}

export function trackFirstDocumentAdded(
  input: {
    fileType: string;
  }
) {
  trackWhenReady(
    "first_document_added",
    {
      funnel: "activation",
      file_type:
        input.fileType,
    },
    "first_document_added"
  );
}
