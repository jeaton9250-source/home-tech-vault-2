"use client";

import {
  Camera,
  Check,
  ImageIcon,
  Loader2,
  ScanLine,
  Sparkles,
  X,
} from "lucide-react";
import { useRef, useState } from "react";

import type { DeviceLookupResult } from "@/lib/devices/deviceQuickLookup";

type IdentificationBasis = "model_label" | "barcode" | "product" | "unknown";

type VisionExtraction = {
  brand: string;
  manufacturer: string;
  modelNumber: string;
  serialNumber: string;
  productName: string;
  category: string;
  barcode: string;
  identificationBasis: IdentificationBasis;
  confidence: "high" | "medium" | "low";
  visibleText: string[];
};

type VisionResponse = {
  extraction?: VisionExtraction | null;
  searchQuery?: string;
  error?: string;
  unavailable?: boolean;
};

type LookupResponse = {
  matches?: DeviceLookupResult[];
};

type SmartPhotoAddProps = {
  onSelect: (device: DeviceLookupResult) => void;
  onSerialNumberDetected?: (serialNumber: string) => void;
  onPhotoReady?: (imageDataUrl: string | null) => void;
};

const MAX_FILE_SIZE = 12 * 1024 * 1024;

function mergeMatches(
  first: DeviceLookupResult[],
  second: DeviceLookupResult[],
) {
  const seen = new Set<string>();

  const merged: DeviceLookupResult[] = [];

  for (const item of [...first, ...second]) {
    const key = [item.brand, item.modelNumber]
      .join("|")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "");

    if (key && seen.has(key)) {
      continue;
    }

    if (key) {
      seen.add(key);
    }

    merged.push(item);
  }

  return merged.slice(0, 5);
}

async function fileToOptimizedDataUrl(file: File) {
  const sourceUrl = URL.createObjectURL(file);

  try {
    const image = new Image();

    image.decoding = "async";

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();

      image.onerror = () =>
        reject(new Error("This photo format could not be read."));

      image.src = sourceUrl;
    });

    const maxDimension = 1600;

    const scale = Math.min(
      1,
      maxDimension / Math.max(image.width, image.height),
    );

    const width = Math.max(1, Math.round(image.width * scale));

    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Photo processing is unavailable.");
    }

    context.drawImage(image, 0, 0, width, height);

    return canvas.toDataURL("image/jpeg", 0.86);
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

async function lookupMatches(query: string) {
  const databaseResponse = await fetch(
    `/api/devices/lookup?q=${encodeURIComponent(query)}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  let databaseMatches: DeviceLookupResult[] = [];

  if (databaseResponse.ok) {
    const data = (await databaseResponse.json()) as LookupResponse;

    databaseMatches = Array.isArray(data.matches) ? data.matches : [];
  }

  /*
   * Exact barcode/database results are
   * already strong evidence. For normal
   * product/model extraction, also ask
   * the existing web-verified HTV lookup.
   */
  if (
    /^\d{8}$|^\d{12}$|^\d{13}$|^\d{14}$/.test(query) &&
    databaseMatches.length
  ) {
    return databaseMatches;
  }

  const aiResponse = await fetch(
    `/api/devices/ai-lookup?q=${encodeURIComponent(query)}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  let aiMatches: DeviceLookupResult[] = [];

  if (aiResponse.ok) {
    const data = (await aiResponse.json()) as LookupResponse;

    aiMatches = Array.isArray(data.matches) ? data.matches : [];
  }

  return mergeMatches(databaseMatches, aiMatches);
}

function basisLabel(basis: IdentificationBasis) {
  if (basis === "model_label") {
    return "Model label read";
  }

  if (basis === "barcode") {
    return "Barcode read";
  }

  if (basis === "product") {
    return "Product recognized";
  }

  return "Photo reviewed";
}

export default function SmartPhotoAdd({
  onSelect,
  onSerialNumberDetected,
  onPhotoReady,
}: SmartPhotoAddProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [analyzing, setAnalyzing] = useState(false);

  const [preview, setPreview] = useState<string | null>(null);

  const [extraction, setExtraction] = useState<VisionExtraction | null>(null);

  const [matches, setMatches] = useState<DeviceLookupResult[]>([]);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [message, setMessage] = useState<string | null>(null);

  function reset() {
    setPreview(null);
    setExtraction(null);
    setMatches([]);
    setSelectedId(null);
    setMessage(null);
    onPhotoReady?.(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function chooseMatch(device: DeviceLookupResult) {
    onSelect(device);

    if (extraction?.serialNumber) {
      onSerialNumberDetected?.(extraction.serialNumber);
    }

    setSelectedId(device.id);

    setMessage("Verified details filled into your device record.");
  }

  function useVisibleDetails() {
    if (!extraction) {
      return;
    }

    const deviceName =
      extraction.productName ||
      [extraction.brand, extraction.modelNumber].filter(Boolean).join(" ") ||
      "Household Device";

    const inferred: DeviceLookupResult = {
      id: `vision:${Date.now()}`,
      deviceName,
      brand: extraction.brand,
      manufacturer: extraction.manufacturer || extraction.brand,
      modelNumber: extraction.modelNumber,
      category: extraction.category || "Other",
      confidence: "inferred",
      description: "Details read from your photo",
      ...(extraction.barcode
        ? {
            upc: extraction.barcode,
          }
        : {}),
    };

    onSelect(inferred);

    if (extraction.serialNumber) {
      onSerialNumberDetected?.(extraction.serialNumber);
    }

    setSelectedId(inferred.id);

    setMessage("Visible label details filled in. Review them before saving.");
  }

  async function handlePhoto(file: File) {
    reset();

    if (file.size > MAX_FILE_SIZE) {
      setMessage("That photo is too large. Choose an image under 12 MB.");
      return;
    }

    try {
      setAnalyzing(true);
      setMessage("Reading the product and model label…");

      const imageDataUrl = await fileToOptimizedDataUrl(file);

      setPreview(imageDataUrl);

      onPhotoReady?.(imageDataUrl);

      const visionResponse = await fetch("/api/devices/vision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageDataUrl,
        }),
      });

      const visionData = (await visionResponse.json()) as VisionResponse;

      if (!visionResponse.ok || !visionData.extraction) {
        throw new Error(visionData.error || "We couldn't identify that photo.");
      }

      setExtraction(visionData.extraction);

      if (visionData.extraction.serialNumber) {
        onSerialNumberDetected?.(visionData.extraction.serialNumber);
      }

      const searchQuery = visionData.searchQuery?.trim() || "";

      if (!searchQuery) {
        setMessage(
          "We found some visible details, but not enough to verify the exact product.",
        );
        return;
      }

      setMessage("Details found. Verifying the exact product…");

      const verifiedMatches = await lookupMatches(searchQuery);

      setMatches(verifiedMatches);

      if (verifiedMatches.length === 1) {
        setMessage("We found one verified match. Review it below.");
      } else if (verifiedMatches.length > 1) {
        setMessage("We found a few possible matches. Choose the exact one.");
      } else {
        setMessage(
          "We read the photo, but couldn't verify an exact product online. You can still use the visible label details.",
        );
      }
    } catch (error) {
      console.error("[smart-photo-add] failed", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "We couldn't read that photo. Try a clearer picture of the model label.",
      );
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div data-smart-photo-add className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (file) {
            void handlePhoto(file);
          }
        }}
      />

      <button
        type="button"
        disabled={analyzing}
        onClick={() => inputRef.current?.click()}
        className="group relative w-full overflow-hidden rounded-[28px] border border-[#263a46] bg-[#172b3a] p-6 text-left text-white shadow-[0_22px_60px_-32px_rgba(23,33,42,0.8)] transition hover:-translate-y-0.5 hover:bg-[#1d3546] hover:shadow-[0_28px_70px_-32px_rgba(23,33,42,0.9)] disabled:cursor-wait disabled:opacity-80 sm:p-7"
      >
        <div
          className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-[#8ea864]/20 blur-3xl"
          aria-hidden
        />

        <div className="relative flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-inner">
            {analyzing ? (
              <Loader2 size={25} className="animate-spin" />
            ) : (
              <Camera size={25} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#c8dba8]">
                Smart Add
              </p>

              <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold text-white/70">
                Photo powered
              </span>
            </div>

            <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">
              {analyzing ? "Reading your photo…" : "Scan to Add"}
            </p>

            <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">
              Take a photo of the product or, for the best result, its model and
              serial-number label.
            </p>

            {!analyzing ? (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-[#172b3a] shadow-sm">
                <ScanLine size={15} />
                Take a photo or upload one
              </div>
            ) : null}
          </div>
        </div>
      </button>

      {preview ? (
        <div className="overflow-hidden rounded-3xl border border-border-subtle bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-4 py-3">
            <div className="flex items-center gap-2">
              <ImageIcon size={16} className="text-home-health" />

              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">
                Photo analyzed
              </p>
            </div>

            <button
              type="button"
              onClick={reset}
              aria-label="Remove photo"
              className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition hover:bg-surface-sunken hover:text-text-primary"
            >
              <X size={15} />
            </button>
          </div>

          <div className="grid gap-4 p-4 sm:grid-cols-[150px_1fr]">
            <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-sunken">
              <img
                src={preview}
                alt="Product being identified"
                className="aspect-square h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0">
              {analyzing ? (
                <div className="flex min-h-32 items-center gap-3 text-sm text-text-secondary">
                  <Loader2
                    size={18}
                    className="animate-spin text-home-health"
                  />
                  Reading model, serial and product details…
                </div>
              ) : extraction ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-home-health-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-home-health">
                      <Sparkles size={11} />
                      {basisLabel(extraction.identificationBasis)}
                    </span>

                    <span className="rounded-full border border-border-subtle px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                      {extraction.confidence} confidence
                    </span>
                  </div>

                  <p className="mt-3 text-base font-semibold text-text-primary">
                    {extraction.productName ||
                      [extraction.brand, extraction.modelNumber]
                        .filter(Boolean)
                        .join(" ") ||
                      "Product details found"}
                  </p>

                  <div className="mt-3 grid gap-1.5 text-xs text-text-secondary">
                    {extraction.brand ? (
                      <p>
                        Brand:{" "}
                        <span className="font-semibold text-text-primary">
                          {extraction.brand}
                        </span>
                      </p>
                    ) : null}

                    {extraction.modelNumber ? (
                      <p>
                        Model:{" "}
                        <span className="font-semibold text-text-primary">
                          {extraction.modelNumber}
                        </span>
                      </p>
                    ) : null}

                    {extraction.serialNumber ? (
                      <p>
                        Serial:{" "}
                        <span className="font-semibold text-text-primary">
                          {extraction.serialNumber}
                        </span>
                      </p>
                    ) : null}

                    {extraction.barcode ? (
                      <p>
                        Barcode:{" "}
                        <span className="font-semibold text-text-primary">
                          {extraction.barcode}
                        </span>
                      </p>
                    ) : null}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {message ? (
        <div
          aria-live="polite"
          className="flex items-start gap-2 rounded-2xl border border-border-subtle bg-surface-sunken/50 px-4 py-3 text-xs leading-5 text-text-secondary"
        >
          {analyzing ? (
            <Loader2
              size={14}
              className="mt-0.5 shrink-0 animate-spin text-home-health"
            />
          ) : (
            <Sparkles size={14} className="mt-0.5 shrink-0 text-home-health" />
          )}

          <span>{message}</span>
        </div>
      ) : null}

      {!analyzing && matches.length > 0 ? (
        <div className="overflow-hidden rounded-3xl border border-border-subtle bg-white shadow-sm">
          <div className="border-b border-border-subtle bg-surface-sunken/40 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">
              Verified matches
            </p>
          </div>

          <div className="divide-y divide-border-subtle">
            {matches.map((device) => (
              <button
                key={device.id}
                type="button"
                onClick={() => chooseMatch(device)}
                className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-surface-sunken/60"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border-subtle bg-surface-sunken">
                  {device.imageUrl ? (
                    <img
                      src={device.imageUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-contain p-1.5"
                    />
                  ) : (
                    <ImageIcon size={20} className="text-text-tertiary" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text-primary">
                    {device.deviceName}
                  </p>

                  <p className="mt-1 truncate text-xs text-text-secondary">
                    {[device.brand, device.modelNumber]
                      .filter(Boolean)
                      .join(" • ")}
                  </p>
                </div>

                {selectedId === device.id ? (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-home-health text-white">
                    <Check size={16} />
                  </div>
                ) : (
                  <span className="shrink-0 text-xs font-semibold text-interaction">
                    Use
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {!analyzing &&
      extraction &&
      matches.length === 0 &&
      (extraction.modelNumber || extraction.productName) ? (
        <button
          type="button"
          onClick={useVisibleDetails}
          className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[#617c43]/25 bg-[#f3f6ee] px-4 py-3.5 text-left transition hover:border-[#617c43]/40"
        >
          <div>
            <p className="text-sm font-semibold text-[#17212a]">
              Use visible details
            </p>

            <p className="mt-1 text-xs leading-5 text-[#68737b]">
              HTV will fill what it could clearly read. You can review every
              field before saving.
            </p>
          </div>

          <Check size={18} className="shrink-0 text-[#617c43]" />
        </button>
      ) : null}
    </div>
  );
}
