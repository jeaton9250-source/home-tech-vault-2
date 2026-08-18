"use client";

import {
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Check,
  Database,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";

import {
  searchDeviceCatalog,
  type DeviceLookupResult,
} from "@/lib/devices/deviceQuickLookup";

export type {
  DeviceLookupResult,
};

type SmartDeviceSearchProps = {
  onSelect: (
    device:
      DeviceLookupResult
  ) => void;
};

type LookupResponse = {
  matches?:
    DeviceLookupResult[];

  unavailable?:
    boolean;

  rateLimited?:
    boolean;

  cached?:
    boolean;
};

function normalizeKey(
  device:
    DeviceLookupResult
) {
  return [
    device.brand,
    device.modelNumber,
  ]
    .join("|")
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      ""
    );
}

function mergeResults(
  exact:
    DeviceLookupResult[],
  local:
    DeviceLookupResult[]
) {
  const seen =
    new Set<string>();

  const merged:
    DeviceLookupResult[] =
      [];

  for (
    const device of [
      ...exact,
      ...local,
    ]
  ) {
    const key =
      normalizeKey(
        device
      );

    if (
      key &&
      seen.has(key)
    ) {
      continue;
    }

    if (key) {
      seen.add(key);
    }

    merged.push(device);
  }

  return merged.slice(
    0,
    7
  );
}

export default function SmartDeviceSearch({
  onSelect,
}: SmartDeviceSearchProps) {
  const [
    query,
    setQuery,
  ] = useState("");

  const [
    selectedId,
    setSelectedId,
  ] = useState<
    string | null
  >(null);

  const [
    exactResults,
    setExactResults,
  ] = useState<
    DeviceLookupResult[]
  >([]);

  const [
    searching,
    setSearching,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState<
    string | null
  >(null);

  const cacheRef =
    useRef(
      new Map<
        string,
        DeviceLookupResult[]
      >()
    );

  const localResults =
    useMemo(
      () =>
        searchDeviceCatalog(
          query
        ),
      [query]
    );

  const results =
    useMemo(
      () =>
        mergeResults(
          exactResults,
          localResults
        ),
      [
        exactResults,
        localResults,
      ]
    );

  const showResults =
    query.trim()
      .length >= 2 &&
    selectedId === null;

  async function findExactModel() {

    const cleaned =
      query.trim();

    if (
      cleaned.length < 3
    ) {
      setMessage(
        "Enter at least 3 characters."
      );
      return;
    }

    const cacheKey =
      cleaned.toLowerCase();

    const cached =
      cacheRef.current.get(
        cacheKey
      );

    if (cached) {
      setExactResults(
        cached
      );

      setMessage(
        cached.length
          ? "Exact database matches loaded."
          : "No exact database match found."
      );

      return;
    }

    try {
      setSearching(true);

      setMessage(null);

      const response =
        await fetch(
          `/api/devices/lookup?q=${encodeURIComponent(
            cleaned
          )}`,
          {
            method: "GET",

            headers: {
              Accept:
                "application/json",
            },
          }
        );

      if (
        response.status ===
        401
      ) {
        setMessage(
          "Sign in to use exact model search."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Exact lookup failed."
        );
      }

      const data =
        (await response.json()) as
          LookupResponse;

      const matches =
        Array.isArray(
          data.matches
        )
          ? data.matches
          : [];

      cacheRef.current.set(
        cacheKey,
        matches
      );

      setExactResults(
        matches
      );

      if (
        matches.length >
        0
      ) {
        setMessage(
          "Exact database matches loaded."
        );
      } else if (
        data.rateLimited
      ) {
        setMessage(
          "The free exact-search limit is resting. Instant suggestions still work."
        );
      } else if (
        data.unavailable
      ) {
        setMessage(
          "Exact lookup is temporarily unavailable. Instant suggestions still work."
        );
      } else {
        setMessage(
          "No exact database match found. You can still use the suggested details."
        );
      }
    } catch (error) {
      console.error(
        "Exact device lookup failed:",
        error
      );

      setMessage(
        "Exact lookup is temporarily unavailable. Instant suggestions still work."
      );
    } finally {
      setSearching(false);
    }
  }

  function selectDevice(
    device:
      DeviceLookupResult
  ) {
    onSelect(device);

    setSelectedId(
      device.id
    );

    setQuery(
      device.deviceName
    );

    setMessage(null);
  }

  function handleQueryChange(
    value: string
  ) {
    setQuery(value);

    setSelectedId(null);

    setExactResults([]);

    setMessage(null);
  }

  function badgeFor(
    device:
      DeviceLookupResult
  ) {
    if (
      device.confidence ===
      "upcitemdb"
    ) {
      return {
        label:
          "Database match",

        Icon:
          Database,
      };
    }

    if (
      device.confidence ===
      "icecat"
    ) {
      return {
        label:
          "Icecat match",

        Icon:
          Database,
      };
    }

    if (
      device.confidence ===
      "catalog"
    ) {
      return {
        label:
          "Auto-fill",

        Icon:
          Sparkles,
      };
    }

    return {
      label:
        "Use this",

      Icon:
        Check,
    };
  }

  return (
    <div>
      <div>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-text-primary">
            Search by device
            or model
          </span>

          <div className="relative">
            <Search
              size={19}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary"
            />

            <input
              value={
                query
              }
              onChange={(
                event
              ) =>
                handleQueryChange(
                  event
                    .target
                    .value
                )
              }
              placeholder="Try Brother MFC-L3780CDW, Samsung QN65S90D..."
              autoComplete="off"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  event.stopPropagation();
                  void findExactModel();
                }
              }}
              className="w-full rounded-2xl border border-border-subtle bg-white py-4 pl-12 pr-4 text-text-primary outline-none transition placeholder:text-text-tertiary focus:border-interaction focus:ring-2 focus:ring-interaction/15"
            />
          </div>
        </label>

        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              void findExactModel();
            }}
            disabled={
              searching ||
              query
                .trim()
                .length <
                3
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border-subtle bg-white px-4 py-2.5 text-xs font-semibold text-text-primary shadow-sm transition hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-50"
          >
            {searching ? (
              <Loader2
                size={15}
                className="animate-spin"
              />
            ) : (
              <Database
                size={15}
              />
            )}

            {searching
              ? "Searching..."
              : "Find exact model"}
          </button>

          <span className="text-xs text-text-muted">
            Or press Enter
          </span>
        </div>
      </div>

      {message ? (
        <p className="mt-3 text-xs leading-5 text-text-secondary">
          {message}
        </p>
      ) : null}

      {selectedId ? (
        <div className="mt-3 flex items-start gap-3 rounded-2xl border border-home-health/25 bg-home-health-soft/30 px-4 py-3">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-home-health text-white">
            <Check
              size={14}
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-text-primary">
              Device details
              filled
            </p>

            <p className="mt-0.5 text-xs leading-5 text-text-secondary">
              Add your serial
              number and room,
              review the details,
              then save.
            </p>
          </div>
        </div>
      ) : null}

      {showResults ? (
        <div className="mt-3 overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-lg">
          <div className="flex items-center justify-between gap-4 border-b border-border-subtle bg-surface-sunken/45 px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles
                size={15}
                className="text-home-health"
              />

              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">
                Suggested
                matches
              </p>
            </div>

            {searching ? (
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Loader2
                  size={13}
                  className="animate-spin"
                />

                Searching
                database...
              </div>
            ) : null}
          </div>

          <div className="divide-y divide-border-subtle">
            {results.map(
              (
                device
              ) => {
                const {
                  label,
                  Icon,
                } =
                  badgeFor(
                    device
                  );

                return (
                  <button
                    key={
                      device.id
                    }
                    type="button"
                    onClick={() =>
                      selectDevice(
                        device
                      )
                    }
                    className="flex w-full items-center justify-between gap-5 px-4 py-4 text-left transition hover:bg-surface-sunken/60"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text-primary">
                        {
                          device.deviceName
                        }
                      </p>

                      <p className="mt-1 text-xs leading-5 text-text-secondary">
                        {[
                          device.brand,
                          device.category,
                          device.modelNumber,
                        ]
                          .filter(
                            Boolean
                          )
                          .join(
                            " • "
                          )}
                      </p>

                      {device.description ? (
                        <p className="mt-1 text-[11px] text-text-muted">
                          {
                            device.description
                          }
                        </p>
                      ) : null}
                    </div>

                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-home-health-soft px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-home-health">
                      <Icon
                        size={11}
                      />

                      {label}
                    </span>
                  </button>
                );
              }
            )}
          </div>
        </div>
      ) : null}

      <div className="mt-3 flex items-start gap-2 text-xs leading-5 text-text-muted">
        <Database
          size={13}
          className="mt-1 shrink-0"
        />

        <p>
          Instant suggestions
          are free and local.
          Exact search uses a
          free product database
          only when you request
          it.
        </p>
      </div>
    </div>
  );
}
