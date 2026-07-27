"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";
import {
  DEMO_CHANGE_EVENT,
  DEMO_STORAGE_KEY,
  clearDemoModeStorage,
  enableDemoModeStorage,
  getStoredDemoMode,
} from "@/lib/demo/demoModeStorage";
import {
  DEMO_DATA_VERSION,
  DEMO_DATA_VERSION_KEY,
  DEMO_TOUR_COMPLETED_KEY,
  DEMO_WELCOME_SEEN_KEY,
} from "@/lib/demo/morganHousehold";

function syncDemoDataVersion() {
  if (typeof window === "undefined") {
    return;
  }

  const storedVersion = window.localStorage.getItem(
    DEMO_DATA_VERSION_KEY
  );

  if (storedVersion === DEMO_DATA_VERSION) {
    return;
  }

  window.localStorage.removeItem(DEMO_WELCOME_SEEN_KEY);
  window.localStorage.removeItem(DEMO_TOUR_COMPLETED_KEY);
  window.localStorage.setItem(
    DEMO_DATA_VERSION_KEY,
    DEMO_DATA_VERSION
  );
}

function readDemoMode() {
  syncDemoDataVersion();
  return getStoredDemoMode();
}

export function useDemoMode() {
  const [user, setUser] = useState<User | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadMode = useCallback(async () => {
    try {
      const demoEnabled = readDemoMode();

      if (demoEnabled) {
        setUser(null);
        setIsDemo(true);
        return;
      }

      /*
        getSession() safely returns session: null
        when the visitor is signed out.
      */
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error(
          "Unable to load auth session:",
          sessionError
        );
      }

      setUser(session?.user || null);
      setIsDemo(false);
    } catch (error) {
      console.error(
        "Unable to load demo mode:",
        error
      );

      setUser(null);
      setIsDemo(readDemoMode());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadMode();
    }, 0);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const demoEnabled = readDemoMode();

        if (demoEnabled) {
          setUser(null);
          setIsDemo(true);
          setLoading(false);
          return;
        }

        setUser(session?.user || null);
        setIsDemo(false);
        setLoading(false);
      }
    );

    function handleDemoChange() {
      setIsDemo(readDemoMode());
    }

    function handleStorageChange(
      event: StorageEvent
    ) {
      if (
        event.key === DEMO_STORAGE_KEY ||
        event.key === null
      ) {
        setIsDemo(readDemoMode());
      }
    }

    window.addEventListener(
      DEMO_CHANGE_EVENT,
      handleDemoChange
    );

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.clearTimeout(timer);
      subscription.unsubscribe();

      window.removeEventListener(
        DEMO_CHANGE_EVENT,
        handleDemoChange
      );

      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, [loadMode]);

  function startDemo() {
    syncDemoDataVersion();

    window.localStorage.removeItem(DEMO_WELCOME_SEEN_KEY);
    window.localStorage.removeItem(DEMO_TOUR_COMPLETED_KEY);

    enableDemoModeStorage();
    setIsDemo(true);
  }

  function exitDemo() {
    clearDemoModeStorage();
    setIsDemo(false);
  }

  return {
    user,
    isDemo,
    loading,
    startDemo,
    exitDemo,
    refreshDemoMode: loadMode,
  };
}
