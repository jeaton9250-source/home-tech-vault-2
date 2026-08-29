"use client";

import {
  useEffect,
  useState,
} from "react";

export type ClientVaultModeState = {
  active: boolean;
  label: string | null;
  giftId: string | null;
  loading: boolean;
};

export function useClientVaultMode(): ClientVaultModeState {
  const [
    state,
    setState,
  ] =
    useState<ClientVaultModeState>({
      active: false,
      label: null,
      giftId: null,
      loading: true,
    });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response =
          await fetch(
            "/api/realtor/vault-mode/status",
            {
              cache:
                "no-store",
            }
          );

        const payload =
          (await response.json()) as {
            active?: boolean;
            label?: string;
            giftId?: string;
          };

        if (cancelled) {
          return;
        }

        setState({
          active:
            payload.active === true,
          label:
            payload.label?.trim() ||
            null,
          giftId:
            payload.giftId ||
            null,
          loading: false,
        });
      } catch {
        if (!cancelled) {
          setState({
            active: false,
            label: null,
            giftId: null,
            loading: false,
          });
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
