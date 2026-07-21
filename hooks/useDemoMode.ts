"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";
import {
  DEMO_DATA_VERSION,
  DEMO_DATA_VERSION_KEY,
  DEMO_TOUR_COMPLETED_KEY,
  DEMO_WELCOME_SEEN_KEY,
} from "@/lib/demo/morganHousehold";

const DEMO_STORAGE_KEY = "home-tech-vault-demo";
const DEMO_CHANGE_EVENT = "home-tech-vault-demo-change";

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

function getStoredDemoMode() {
  if (typeof window === "undefined") {
    return false;
  }

  syncDemoDataVersion();

  return (
    window.localStorage.getItem(DEMO_STORAGE_KEY) === "true"
  );
}

export function useDemoMode() {
  const [user, setUser] = useState<User | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadMode = useCallback(async () => {
    try {
      const demoEnabled = getStoredDemoMode();

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
      setIsDemo(demoEnabled);
    } catch (error) {
      console.error(
        "Unable to load demo mode:",
        error
      );

      setUser(null);
      setIsDemo(getStoredDemoMode());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMode();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        setIsDemo(getStoredDemoMode());
        setLoading(false);
      }
    );

    function handleDemoChange() {
      setIsDemo(getStoredDemoMode());
    }

    function handleStorageChange(
      event: StorageEvent
    ) {
      if (
        event.key === DEMO_STORAGE_KEY ||
        event.key === null
      ) {
        setIsDemo(getStoredDemoMode());
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

    window.localStorage.setItem(
      DEMO_STORAGE_KEY,
      "true"
    );

    setIsDemo(true);

    window.dispatchEvent(
      new Event(DEMO_CHANGE_EVENT)
    );
  }

  function exitDemo() {
    window.localStorage.removeItem(
      DEMO_STORAGE_KEY
    );

    setIsDemo(false);

    window.dispatchEvent(
      new Event(DEMO_CHANGE_EVENT)
    );
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
