"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useDemoMode } from "@/hooks/useDemoMode";

import {
  DEV_ACCESS_CHANGE_EVENT,
  DEV_ACCESS_STORAGE_KEY,
  buildDevelopmentPlanInput,
  getDevAccessProfileLabel,
  isDevAccessProfile,
  isDevelopmentEnvironment,
  profileUsesDemoMode,
  type DevAccessProfile,
} from "@/lib/permissions/developmentAccess";

type DevelopmentAccessContextValue = {
  profile: DevAccessProfile;
  isOverrideActive: boolean;
  profileLabel: string;
  setProfile: (
    profile: DevAccessProfile
  ) => void;
  resetProfile: () => void;
  isDevelopment: boolean;
};

const DevelopmentAccessContext =
  createContext<DevelopmentAccessContextValue | null>(
    null
  );

function readStoredProfile(): DevAccessProfile {
  if (
    typeof window === "undefined" ||
    !isDevelopmentEnvironment()
  ) {
    return "real";
  }

  const stored =
    window.localStorage.getItem(
      DEV_ACCESS_STORAGE_KEY
    );

  if (isDevAccessProfile(stored)) {
    return stored;
  }

  return "real";
}

function writeStoredProfile(
  profile: DevAccessProfile
) {
  if (
    typeof window === "undefined" ||
    !isDevelopmentEnvironment()
  ) {
    return;
  }

  if (profile === "real") {
    window.localStorage.removeItem(
      DEV_ACCESS_STORAGE_KEY
    );
  } else {
    window.localStorage.setItem(
      DEV_ACCESS_STORAGE_KEY,
      profile
    );
  }

  window.dispatchEvent(
    new Event(DEV_ACCESS_CHANGE_EVENT)
  );
}

export function DevelopmentAccessProvider({
  children,
}: {
  children: ReactNode;
}) {
  const isDevelopment =
    isDevelopmentEnvironment();

  const {
    startDemo,
    exitDemo,
  } = useDemoMode();

  const [
    profile,
    setProfileState,
  ] = useState<DevAccessProfile>("real");

  const demoEnabledByTester =
    useRef(false);

  useEffect(() => {
    if (!isDevelopment) {
      return;
    }

    const storedProfile =
      readStoredProfile();

    setProfileState(storedProfile);

    if (
      profileUsesDemoMode(
        storedProfile
      )
    ) {
      startDemo();
      demoEnabledByTester.current =
        true;
    }
  }, [isDevelopment, startDemo]);

  useEffect(() => {
    if (!isDevelopment) {
      return;
    }

    function handleProfileChange() {
      const storedProfile =
        readStoredProfile();

      setProfileState(storedProfile);
    }

    window.addEventListener(
      DEV_ACCESS_CHANGE_EVENT,
      handleProfileChange
    );

    window.addEventListener(
      "storage",
      handleProfileChange
    );

    return () => {
      window.removeEventListener(
        DEV_ACCESS_CHANGE_EVENT,
        handleProfileChange
      );

      window.removeEventListener(
        "storage",
        handleProfileChange
      );
    };
  }, [isDevelopment]);

  const applyDemoSideEffects =
    useCallback(
      (
        nextProfile: DevAccessProfile
      ) => {
        if (
          profileUsesDemoMode(
            nextProfile
          )
        ) {
          startDemo();
          demoEnabledByTester.current =
            true;
          return;
        }

        if (
          demoEnabledByTester.current
        ) {
          exitDemo();
          demoEnabledByTester.current =
            false;
        }
      },
      [startDemo, exitDemo]
    );

  const setProfile = useCallback(
    (
      nextProfile: DevAccessProfile
    ) => {
      if (!isDevelopment) {
        return;
      }

      writeStoredProfile(
        nextProfile
      );

      setProfileState(nextProfile);
      applyDemoSideEffects(
        nextProfile
      );
    },
    [
      isDevelopment,
      applyDemoSideEffects,
    ]
  );

  const resetProfile =
    useCallback(() => {
      setProfile("real");
    }, [setProfile]);

  const value: DevelopmentAccessContextValue =
    {
      profile: isDevelopment
        ? profile
        : "real",
      isOverrideActive:
        isDevelopment &&
        profile !== "real",
      profileLabel:
        getDevAccessProfileLabel(
          isDevelopment
            ? profile
            : "real"
        ),
      setProfile,
      resetProfile,
      isDevelopment,
    };

  return (
    <DevelopmentAccessContext.Provider
      value={value}
    >
      {children}
    </DevelopmentAccessContext.Provider>
  );
}

export function useDevelopmentAccess() {
  const context = useContext(
    DevelopmentAccessContext
  );

  if (!context) {
    throw new Error(
      "useDevelopmentAccess must be used within a DevelopmentAccessProvider."
    );
  }

  return context;
}

export {
  buildDevelopmentPlanInput,
  isDevelopmentEnvironment,
  type DevAccessProfile,
};
