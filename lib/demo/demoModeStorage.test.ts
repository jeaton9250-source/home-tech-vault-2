import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  AUTH_ROUTES_THAT_CLEAR_DEMO,
  clearDemoModeForAuthRoute,
  clearDemoModeStorage,
  enableDemoModeStorage,
  getStoredDemoMode,
  isAuthRouteThatClearsDemo,
} from "@/lib/demo/demoModeStorage";

describe("demo mode storage helpers", () => {
  it("identifies auth routes that must clear demo", () => {
    for (const route of AUTH_ROUTES_THAT_CLEAR_DEMO) {
      assert.equal(
        isAuthRouteThatClearsDemo(route),
        true
      );
    }

    assert.equal(
      isAuthRouteThatClearsDemo("/login?next=/dashboard"),
      false
    );
    assert.equal(
      isAuthRouteThatClearsDemo("/dashboard"),
      false
    );
    assert.equal(
      isAuthRouteThatClearsDemo("/demo"),
      false
    );
  });

  it("clears demo storage on auth routes only", () => {
    const memory = new Map<string, string>();

    const originalLocalStorage = globalThis.localStorage;
    const originalWindow = globalThis.window;

    const fakeStorage = {
      getItem(key: string) {
        return memory.get(key) ?? null;
      },
      setItem(key: string, value: string) {
        memory.set(key, value);
      },
      removeItem(key: string) {
        memory.delete(key);
      },
    };

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        localStorage: fakeStorage,
        dispatchEvent() {
          return true;
        },
      },
    });

    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: fakeStorage,
    });

    try {
      enableDemoModeStorage();
      assert.equal(getStoredDemoMode(), true);

      assert.equal(
        clearDemoModeForAuthRoute("/dashboard"),
        false
      );
      assert.equal(getStoredDemoMode(), true);

      assert.equal(
        clearDemoModeForAuthRoute("/login"),
        true
      );
      assert.equal(getStoredDemoMode(), false);

      enableDemoModeStorage();
      clearDemoModeStorage();
      assert.equal(getStoredDemoMode(), false);
    } finally {
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: originalWindow,
      });
      Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        value: originalLocalStorage,
      });
    }
  });
});
