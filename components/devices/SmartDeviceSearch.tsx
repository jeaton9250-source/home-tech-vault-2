"use client";

import {
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Camera,
  Check,
  Database,
  ImageIcon,
  Loader2,
  ScanBarcode,
  Search,
  Sparkles,
  X,
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
    device: DeviceLookupResult
  ) => void;
};

type LookupResponse = {
  matches?: DeviceLookupResult[];
  unavailable?: boolean;
  rateLimited?: boolean;
  cached?: boolean;
};

type ScannerControls = {
  stop: () => void;
};

function normalizeKey(
  device: DeviceLookupResult
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
  exact: DeviceLookupResult[],
  local: DeviceLookupResult[]
) {
  const seen =
    new Set<string>();

  const merged:
    DeviceLookupResult[] = [];

  for (const device of [
    ...exact,
    ...local,
  ]) {
    const key =
      normalizeKey(device);

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

  return merged.slice(0, 7);
}

function isBarcode(
  value: string
) {
  const cleaned =
    value.replace(/\D/g, "");

  return (
    cleaned === value.trim() &&
    [8, 12, 13, 14].includes(
      cleaned.length
    )
  );
}

export default function SmartDeviceSearch({
  onSelect,
}: SmartDeviceSearchProps) {
  const [query, setQuery] =
    useState("");

  const [
    entryMode,
    setEntryMode,
  ] =
    useState<
      "search" | "scan" | null
    >(null);

  const [
    selectedDevice,
    setSelectedDevice,
  ] =
    useState<DeviceLookupResult | null>(
      null
    );

  const [
    exactResults,
    setExactResults,
  ] =
    useState<DeviceLookupResult[]>(
      []
    );

  const [
    searching,
    setSearching,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] =
    useState<string | null>(
      null
    );

  const [
    scannerOpen,
    setScannerOpen,
  ] = useState(false);

  const [
    scannerStarting,
    setScannerStarting,
  ] = useState(false);

  const [
    scannerMessage,
    setScannerMessage,
  ] =
    useState<string | null>(
      null
    );

  const [
    lastBarcode,
    setLastBarcode,
  ] =
    useState<string | null>(
      null
    );

  const videoRef =
    useRef<HTMLVideoElement | null>(
      null
    );

  const scannerControlsRef =
    useRef<ScannerControls | null>(
      null
    );

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
    query.trim().length >=
      2 &&
    selectedDevice === null;

  async function findExactModel(
    overrideQuery?: string
  ) {
    const cleaned =
      (
        overrideQuery ??
        query
      ).trim();

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

    const barcodeLookup =
      isBarcode(cleaned);

    if (barcodeLookup) {
      setLastBarcode(
        cleaned
      );
    }

    /*
     * Never reuse an old failed
     * barcode lookup from the
     * in-memory search cache.
     */
    const cached =
      barcodeLookup
        ? undefined
        : cacheRef.current.get(
            cacheKey
          );

    if (cached) {
      setExactResults(
        cached
      );

      setMessage(
        cached.length
          ? isBarcode(
              cleaned
            )
            ? "Barcode match loaded."
            : "Exact database matches loaded."
          : "No database match found."
      );

      return;
    }

    try {
      setSearching(true);

      setMessage(
        barcodeLookup
          ? `Barcode ${cleaned} detected. Looking up product...`
          : null
      );

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

      const catalogMatches =
        Array.isArray(
          data.matches
        )
          ? data.matches
          : [];

      /*
       * [device-quick-find] OpenAI expansion
       *
       * Text Quick Search expands every explicit
       * search across the web. Barcode lookup
       * stays database-first and only asks
       * OpenAI when UPCItemDB/Icecat missed.
       */
      let matches =
        catalogMatches;

      const shouldExpandWithOpenAI =
        !barcodeLookup ||
        catalogMatches.length === 0;

      if (shouldExpandWithOpenAI) {
        try {
          const aiResponse =
            await fetch(
              `/api/devices/ai-lookup?q=${encodeURIComponent(
                cleaned
              )}`,
              {
                method: "GET",
                cache: "no-store",
              }
            );

          if (aiResponse.ok) {
            const aiData =
              (await aiResponse.json()) as LookupResponse;

            const aiMatches =
              Array.isArray(
                aiData.matches
              )
                ? aiData.matches
                : [];

            matches =
              mergeResults(
                catalogMatches,
                aiMatches
              );
          }
        } catch (error) {
          console.warn(
            "[device-quick-find] OpenAI expansion unavailable",
            error
          );
        }
      }

      /*
       * Only cache successful responses.
       * This prevents a temporary API
       * miss or rate limit from becoming
       * a fake permanent miss.
       */
      if (
        matches.length > 0
      ) {
        cacheRef.current.set(
          cacheKey,
          matches
        );
      }

      setExactResults(
        matches
      );

      /*
       * A scanned UPC/EAN is already an
       * exact identifier. If the database
       * returns one product, select it
       * automatically and fill Quick Add.
       */
      const firstMatch =
        matches[0];

      if (
        barcodeLookup &&
        firstMatch
      ) {
        selectDevice(
          firstMatch
        );

        setMessage(
          "Barcode recognized. Device details filled automatically."
        );

        return;
      }

      if (
        matches.length > 0
      ) {
        setMessage(
          isBarcode(
            cleaned
          )
            ? "Barcode recognized."
            : "Exact database matches loaded."
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
          isBarcode(
            cleaned
          )
            ? "We couldn't identify that barcode yet."
            : "No exact database match found. You can still use the suggested details."
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

  function stopScanner() {
    scannerControlsRef.current?.stop();

    scannerControlsRef.current =
      null;

    setScannerOpen(false);

    setScannerStarting(
      false
    );
  }

  async function startScanner() {
    try {
      scannerControlsRef.current?.stop();
      scannerControlsRef.current = null;

      setScannerOpen(true);
      setLastBarcode(null);
      setScannerStarting(true);
      setScannerMessage(
        "Starting rear camera..."
      );

      await new Promise<void>(
        (resolve) => {
          window.requestAnimationFrame(
            () => resolve()
          );
        }
      );

      const video =
        videoRef.current;

      if (!video) {
        throw new Error(
          "Camera preview is unavailable."
        );
      }

      const [
        browserModule,
        libraryModule,
      ] = await Promise.all([
        import("@zxing/browser"),
        import("@zxing/library"),
      ]);

      const {
        BrowserMultiFormatReader,
      } = browserModule;

      const {
        BarcodeFormat,
        DecodeHintType,
      } = libraryModule;

      /*
       * We only care about real
       * retail product barcodes
       * here. Narrowing the formats
       * makes detection faster and
       * more reliable.
       */
      const hints =
        new Map();

      hints.set(
        DecodeHintType.POSSIBLE_FORMATS,
        [
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
          BarcodeFormat.EAN_8,
          BarcodeFormat.EAN_13,
        ]
      );

      hints.set(
        DecodeHintType.TRY_HARDER,
        true
      );

      const reader =
        new BrowserMultiFormatReader(
          hints,
          {
            delayBetweenScanAttempts:
              100,

            delayBetweenScanSuccess:
              500,

            tryPlayVideoTimeout:
              5000,
          }
        );

      setScannerMessage(
        "Looking for a UPC or EAN barcode..."
      );

      const controls =
        await reader.decodeFromConstraints(
          {
            audio: false,

            video: {
              facingMode: {
                ideal:
                  "environment",
              },

              width: {
                ideal: 1920,
              },

              height: {
                ideal: 1080,
              },
            },
          },
          video,
          (
            result,
            error,
            callbackControls
          ) => {
            if (result) {
              const barcode =
                result
                  .getText()
                  .replace(
                    /\s+/g,
                    ""
                  )
                  .trim();

              console.log(
                "[barcode] detected:",
                barcode
              );

              if (
                !barcode
              ) {
                return;
              }

              /*
               * UPC-A: 12 digits
               * EAN-13: 13 digits
               * EAN-8: 8 digits
               *
               * Ignore anything
               * unexpected rather
               * than sending junk to
               * the product lookup.
               */
              if (
                !/^\d{8}$|^\d{12}$|^\d{13}$/.test(
                  barcode
                )
              ) {
                setScannerMessage(
                  `Barcode read (${barcode}), but it is not a UPC/EAN product code.`
                );

                return;
              }

              callbackControls.stop();

              scannerControlsRef.current =
                null;

              setScannerOpen(
                false
              );

              setScannerStarting(
                false
              );

              setScannerMessage(
                null
              );

              setQuery(
                barcode
              );

              setSelectedDevice(
                null
              );

              setExactResults(
                []
              );

              setMessage(
                `Barcode ${barcode} detected. Looking up product...`
              );

              void findExactModel(
                barcode
              );

              return;
            }

            /*
             * "NotFoundException"
             * simply means this
             * particular video frame
             * didn't contain a
             * readable barcode.
             *
             * Other errors are useful
             * to expose while testing.
             */
            if (
              error &&
              error.name !==
                "NotFoundException"
            ) {
              console.warn(
                "[barcode] decode warning:",
                error
              );
            }
          }
        );

      scannerControlsRef.current =
        controls;

      setScannerStarting(
        false
      );

      setScannerMessage(
        "Scanning… keep the full barcode inside the box and hold steady."
      );
    } catch (error) {
      console.error(
        "Unable to start barcode scanner:",
        error
      );

      scannerControlsRef.current?.stop();

      scannerControlsRef.current =
        null;

      setScannerStarting(
        false
      );

      setScannerMessage(
        error instanceof Error
          ? `Scanner error: ${error.message}`
          : "Camera scanning is unavailable."
      );
    }
  }

  function selectDevice(
    device: DeviceLookupResult
  ) {
    onSelect(device);

    setSelectedDevice(
      device
    );

    setQuery(
      device.deviceName
    );

    setMessage(null);
  }

  function changeSelection() {
    setLastBarcode(null);

    setSelectedDevice(
      null
    );

    setExactResults(
      []
    );

    setMessage(null);
  }

  function handleQueryChange(
    value: string
  ) {
    setQuery(value);

    setLastBarcode(null);

    setSelectedDevice(
      null
    );

    setExactResults(
      []
    );

    setMessage(null);
  }

  function badgeFor(
    device: DeviceLookupResult
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
          "Database match",
        Icon:
          Database,
      };
    }

    if (
      String(
        device.confidence
      ) === "openai"
    ) {
      return {
        label:
          "Web verified",
        Icon:
          Sparkles,
      };
    }

    if (
      device.confidence ===
      "catalog"
    ) {
      return {
        label:
          "HTV match",
        Icon:
          Sparkles,
      };
    }

    return {
      label:
        "Suggested",
      Icon:
        Sparkles,
    };
  }

  return (
    <div className="space-y-3">
      <div
        data-device-entry-method-picker
        className="grid gap-3 sm:grid-cols-2"
      >
        <button
          type="button"
          onClick={() => {
            stopScanner();
            setEntryMode(
              "search"
            );
          }}
          className={`group rounded-3xl border p-5 text-left transition ${
            entryMode === "search"
              ? "border-home-health/35 bg-home-health-soft/35 shadow-sm"
              : "border-border-subtle bg-white hover:border-home-health/25 hover:bg-surface-sunken/35"
          }`}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-home-health-soft text-home-health">
            <Search size={20} />
          </div>

          <p className="mt-4 text-base font-bold text-text-primary">
            Quick Search
          </p>

          <p className="mt-1 text-sm leading-6 text-text-secondary">
            Type the brand, product name, or model. HTV searches its databases and the web.
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            setEntryMode(
              "scan"
            );
            void startScanner();
          }}
          className={`group rounded-3xl border p-5 text-left transition ${
            entryMode === "scan"
              ? "border-charcoal/30 bg-charcoal/[0.04] shadow-sm"
              : "border-border-subtle bg-white hover:border-charcoal/20 hover:bg-surface-sunken/35"
          }`}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-charcoal text-white">
            <ScanBarcode
              size={21}
            />
          </div>

          <p className="mt-4 text-base font-bold text-text-primary">
            Scan UPC
          </p>

          <p className="mt-1 text-sm leading-6 text-text-secondary">
            Point your camera at a UPC or EAN barcode and let HTV identify the product.
          </p>
        </button>
      </div>
      {lastBarcode ? (
        <div
          data-smart-scan-status
          aria-live="polite"
          className="overflow-hidden rounded-2xl border border-[#617c43]/20 bg-[#f3f6ee] shadow-sm"
        >
          <div className="flex items-start gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#617c43] text-white">
              <Check
                size={17}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-[#17212a]">
                  {searching
                    ? "Barcode detected"
                    : selectedDevice
                      ? "Product found"
                      : "Barcode checked"}
                </p>

                {searching ? (
                  <Loader2
                    size={14}
                    className="animate-spin text-[#617c43]"
                  />
                ) : null}
              </div>

              {searching ? (
                <div className="mt-2">
                  <p className="text-xs leading-5 text-[#68737b]">
                    Finding the exact product...
                  </p>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#617c43]/10">
                    <div className="h-full w-2/3 animate-pulse rounded-full bg-[#617c43]" />
                  </div>
                </div>
              ) : selectedDevice ? (
                <div className="mt-2">
                  <p className="truncate text-sm font-semibold text-[#17212a]">
                    {selectedDevice.deviceName}
                  </p>

                  <p className="mt-1 text-xs text-[#68737b]">
                    {[
                      selectedDevice.brand,
                      selectedDevice.modelNumber,
                    ]
                      .filter(Boolean)
                      .join(" - ")}
                  </p>

                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#617c43]/10 px-2.5 py-1 text-[11px] font-semibold text-[#617c43]">
                    <Sparkles
                      size={12}
                    />

                    Details filled automatically
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-xs leading-5 text-[#68737b]">
                  We read the barcode, but no exact product match was returned. Try Quick Search with the brand and model number.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
      {entryMode === "search" ? (
      <div>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-text-primary">
            Search by
            device, model,
            or barcode
          </span>

          <div className="relative">
            <Search
              size={19}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary"
            />

            <input
              value={query}
              onChange={(
                event
              ) =>
                handleQueryChange(
                  event
                    .target
                    .value
                )
              }
              onKeyDown={(
                event
              ) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  event.preventDefault();
                  event.stopPropagation();

                  void findExactModel();
                }
              }}
              placeholder="Model, product name, or UPC..."
              autoComplete="off"
              className="w-full rounded-2xl border border-border-subtle bg-white py-4 pl-12 pr-4 text-text-primary outline-none transition placeholder:text-text-tertiary focus:border-interaction focus:ring-2 focus:ring-interaction/15"
            />
          </div>
        </label>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              void findExactModel();
            }}
            disabled={
              searching ||
              query
                .trim()
                .length < 3
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
              : "Search devices"}
          </button>

          <button
            type="button"
            onClick={() => {
              void startScanner();
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-charcoal px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:brightness-110"
          >
            <ScanBarcode
              size={16}
            />

            Scan barcode
          </button>

          <span className="text-xs text-text-muted">
            Press Enter for
            exact search
          </span>
        </div>
      </div>

      ) : null}

      <div
        className={
          scannerOpen
            ? "overflow-hidden rounded-3xl border border-border-subtle bg-charcoal p-3 shadow-xl"
            : "hidden"
        }
      >
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2 text-white">
            <Camera
              size={17}
            />

            <p className="text-sm font-semibold">
              Scan product
              barcode
            </p>
          </div>

          <button
            type="button"
            onClick={
              stopScanner
            }
            aria-label="Close barcode scanner"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <X size={16} />
          </button>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-black">
          <video
            ref={videoRef}
            muted
            playsInline
            className="aspect-[4/3] w-full object-cover"
          />

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-28 w-[78%] rounded-2xl border-2 border-white/90 shadow-[0_0_0_999px_rgba(0,0,0,0.22)]" />
          </div>
        </div>

        <div className="flex items-center gap-2 px-2 pb-1 pt-3 text-xs text-white/75">
          {scannerStarting ? (
            <Loader2
              size={14}
              className="animate-spin"
            />
          ) : (
            <ScanBarcode
              size={14}
            />
          )}

          {scannerMessage ??
            "Center the barcode inside the frame."}
        </div>
      </div>

      {message ? (
        <p className="text-xs leading-5 text-text-secondary">
          {message}
        </p>
      ) : null}

      {selectedDevice ? (
        <div className="overflow-hidden rounded-3xl border border-home-health/25 bg-gradient-to-br from-white to-home-health-soft/30 shadow-sm">
          <div className="flex items-start gap-4 p-4 sm:p-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-sm">
              {selectedDevice.imageUrl ? (
                <img
                  src={
                    selectedDevice.imageUrl
                  }
                  alt=""
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <ImageIcon
                  size={28}
                  className="text-text-tertiary"
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-home-health-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-home-health">
                  <Check
                    size={11}
                  />
                  Match selected
                </span>

                {selectedDevice.confidence ===
                  "upcitemdb" ||
                selectedDevice.confidence ===
                  "icecat" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                    <Database
                      size={11}
                    />
                    Product database
                  </span>
                ) : null}
              </div>

              <p className="mt-3 text-base font-semibold tracking-[-0.02em] text-text-primary">
                {
                  selectedDevice.deviceName
                }
              </p>

              <p className="mt-1 text-xs leading-5 text-text-secondary">
                {[
                  selectedDevice.brand,
                  selectedDevice.category,
                  selectedDevice.modelNumber,
                ]
                  .filter(
                    Boolean
                  )
                  .join(
                    " • "
                  )}
              </p>

              {selectedDevice.upc ? (
                <p className="mt-1 text-[11px] text-text-muted">
                  UPC/EAN{" "}
                  {
                    selectedDevice.upc
                  }
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border-subtle/70 bg-white/70 px-4 py-3 sm:px-5">
            <p className="text-xs text-text-secondary">
              Details have
              been filled into
              Quick Add.
            </p>

            <button
              type="button"
              onClick={
                changeSelection
              }
              className="text-xs font-semibold text-interaction transition hover:text-interaction-hover"
            >
              Change
            </button>
          </div>
        </div>
      ) : null}

      {showResults ? (
        <div className="overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-lg">
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
                Searching...
              </div>
            ) : null}
          </div>

          <div className="divide-y divide-border-subtle">
            {results.map(
              (device) => {
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
                    className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-surface-sunken/60"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border-subtle bg-surface-sunken">
                      {device.imageUrl ? (
                        <img
                          src={
                            device.imageUrl
                          }
                          alt=""
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-contain p-1.5"
                        />
                      ) : (
                        <Database
                          size={18}
                          className="text-text-tertiary"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
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
                    </div>

                    <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-home-health-soft px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-home-health sm:inline-flex">
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

      <div className="flex items-start gap-2 text-xs leading-5 text-text-muted">
        <Database
          size={13}
          className="mt-1 shrink-0"
        />

        <p>
          Type a model for
          instant suggestions,
          search the product
          database, or scan a
          UPC/EAN barcode.
        </p>
      </div>
    </div>
  );
}
