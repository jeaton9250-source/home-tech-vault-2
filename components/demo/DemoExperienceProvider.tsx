"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { usePathname } from "next/navigation";

import { useDemoMode } from "@/hooks/useDemoMode";
import {
  DEMO_TOUR_COMPLETED_KEY,
  DEMO_WELCOME_SEEN_KEY,
} from "@/lib/demo/morganHousehold";

import DemoWelcomeModal from "@/components/demo/DemoWelcomeModal";
import DemoReadOnlyModal from "@/components/demo/DemoReadOnlyModal";
import DemoGuidedTour from "@/components/demo/DemoGuidedTour";

type DemoExperienceContextValue = {
  showReadOnlyModal: () => void;
  startTour: () => void;
  dismissWelcome: () => void;
  tourActive: boolean;
};

const DemoExperienceContext =
  createContext<DemoExperienceContextValue | null>(
    null
  );

function getStoredFlag(key: string) {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.localStorage.getItem(key) === "true"
  );
}

export function DemoExperienceProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { isDemo, user, loading } = useDemoMode();

  const [welcomeOpen, setWelcomeOpen] =
    useState(false);

  const [readOnlyOpen, setReadOnlyOpen] =
    useState(false);

  const [tourActive, setTourActive] =
    useState(false);

  const isDemoVisitor =
    !loading && isDemo && !user;

  useEffect(() => {
    if (!isDemoVisitor) {
      setWelcomeOpen(false);
      return;
    }

    const welcomeSeen = getStoredFlag(
      DEMO_WELCOME_SEEN_KEY
    );

    if (!welcomeSeen) {
      setWelcomeOpen(true);
    }
  }, [isDemoVisitor, pathname]);

  const dismissWelcome = useCallback(() => {
    window.localStorage.setItem(
      DEMO_WELCOME_SEEN_KEY,
      "true"
    );

    setWelcomeOpen(false);
  }, []);

  const startTour = useCallback(() => {
    dismissWelcome();

    window.localStorage.removeItem(
      DEMO_TOUR_COMPLETED_KEY
    );

    setTourActive(true);
  }, [dismissWelcome]);

  const finishTour = useCallback(() => {
    window.localStorage.setItem(
      DEMO_TOUR_COMPLETED_KEY,
      "true"
    );

    setTourActive(false);
  }, []);

  const showReadOnlyModal = useCallback(() => {
    setReadOnlyOpen(true);
  }, []);

  const value = useMemo(
    () => ({
      showReadOnlyModal,
      startTour,
      dismissWelcome,
      tourActive,
    }),
    [
      showReadOnlyModal,
      startTour,
      dismissWelcome,
      tourActive,
    ]
  );

  return (
    <DemoExperienceContext.Provider value={value}>
      {children}

      {isDemoVisitor ? (
        <>
          <DemoWelcomeModal
            open={welcomeOpen}
            onExplore={() => dismissWelcome()}
            onStartTour={startTour}
          />

          <DemoReadOnlyModal
            open={readOnlyOpen}
            onClose={() => setReadOnlyOpen(false)}
          />

          <DemoGuidedTour
            active={tourActive}
            onFinish={finishTour}
          />
        </>
      ) : null}
    </DemoExperienceContext.Provider>
  );
}

export function useDemoExperience() {
  const context = useContext(
    DemoExperienceContext
  );

  return context;
}

export function useDemoReadOnlyAction() {
  const { isDemo } = useDemoMode();
  const experience = useDemoExperience();

  return useCallback(
    (event?: { preventDefault?: () => void }) => {
      if (!isDemo) {
        return false;
      }

      event?.preventDefault?.();
      experience?.showReadOnlyModal();

      return true;
    },
    [isDemo, experience]
  );
}
