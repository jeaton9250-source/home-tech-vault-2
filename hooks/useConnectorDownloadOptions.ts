"use client";

import { useEffect, useState } from "react";

import {
  buildConnectorDownloadOptions,
  type ConnectorDownloadOptionsMap,
} from "@/lib/connector/downloadOptions";

type UseConnectorDownloadOptionsResult = {
  options: ConnectorDownloadOptionsMap | null;
  loading: boolean;
  error: boolean;
};

export function useConnectorDownloadOptions(input?: {
  enabled?: boolean;
}): UseConnectorDownloadOptionsResult {
  const enabled = input?.enabled !== false;
  const [options, setOptions] =
    useState<ConnectorDownloadOptionsMap | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    async function loadDownloadOptions() {
      try {
        const response = await fetch("/api/connector/download-options", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load connector download options.");
        }

        const data = (await response.json()) as ConnectorDownloadOptionsMap;

        if (!cancelled) {
          setOptions(data);
          setError(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setOptions(buildConnectorDownloadOptions());
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadDownloadOptions();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return {
    options: enabled ? options : null,
    loading: enabled ? loading : false,
    error: enabled ? error : false,
  };
}
