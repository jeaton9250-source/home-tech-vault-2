"use client";

import DashboardUnlockCelebration from "@/components/dashboard/DashboardUnlockCelebration";

import {
  ArrowRight,
  BookOpen,
  Check,
  Circle,
  FileText,
  Laptop,
  Loader2,
  Plus,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import {
  useParams,
  useRouter,
} from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  usePermissions,
} from "@/hooks/usePermissions";
import {
  trackEvent,
} from "@/lib/analytics";
import {
  supabase,
} from "@/lib/supabase";

import PageCard from "@/components/ui/PageCard";
import PageShell from "@/components/ui/PageShell";

type ManualStatus =
  | "pending"
  | "found"
  | "not_found"
  | null;

type DeviceRecord = {
  id: string;
  device_name: string;
  brand: string | null;
  manufacturer: string | null;
  model_number: string | null;
  category: string | null;
  warranty_date: string | null;
  manual_status: ManualStatus;
  manual_checked_at: string | null;
};

type ManualRecord = {
  id: string;
  file_path: string;
  document_name: string | null;
  document_type: string | null;
};

type SuccessData = {
  device: DeviceRecord;
  imageUrl: string | null;
  manualUrl: string | null;
  manual: ManualRecord | null;
  hasReceipt: boolean;
};

function isSafeInternalPath(
  value: string | null
) {
  return Boolean(
    value &&
    value.startsWith("/") &&
    !value.startsWith("//")
  );
}

export default function DeviceAddedPage() {
  const params =
    useParams<{
      id: string;
    }>();

  const router =
    useRouter();

  const {
    user,
    isDemo,
    loading: permissionsLoading,
  } = usePermissions();

  const deviceId =
    params.id;

  const [
    data,
    setData,
  ] =
    useState<SuccessData | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState("");

  const [
    onboardingFlow,
    setOnboardingFlow,
  ] =
    useState(false);

  const trackedView =
    useRef(false);

  useEffect(() => {
    const query =
      new URLSearchParams(
        window.location.search
      );

    setOnboardingFlow(
      query.get("onboarding") === "1"
    );
  }, []);

  useEffect(() => {
    if (
      permissionsLoading
    ) {
      return;
    }

    if (
      isDemo
    ) {
      router.replace(
        "/signup"
      );
      return;
    }

    if (!user) {
      router.replace(
        "/login"
      );
      return;
    }

    let cancelled = false;

    async function loadSuccessData() {
      try {
        setLoading(true);
        setErrorMessage("");

        const [
          deviceResult,
          imageResult,
          manualResult,
          receiptResult,
        ] =
          await Promise.all([
            supabase
              .from("devices")
              .select(
                [
                  "id",
                  "device_name",
                  "brand",
                  "manufacturer",
                  "model_number",
                  "category",
                  "warranty_date",
                  "manual_status",
                  "manual_checked_at",
                ].join(",")
              )
              .eq(
                "id",
                deviceId
              )
              .maybeSingle(),

            supabase
              .from(
                "device_images"
              )
              .select(
                "image_url, created_at"
              )
              .eq(
                "device_id",
                deviceId
              )
              .order(
                "created_at",
                {
                  ascending: true,
                }
              )
              .limit(1),

            supabase
              .from(
                "device_documents"
              )
              .select(
                "id, file_path, document_name, document_type"
              )
              .eq(
                "device_id",
                deviceId
              )
              .eq(
                "document_type",
                "Manual"
              )
              .limit(1)
              .maybeSingle(),

            supabase
              .from(
                "documents"
              )
              .select(
                "id"
              )
              .eq(
                "device_id",
                deviceId
              )
              .ilike(
                "file_type",
                "Receipt"
              )
              .limit(1),
          ]);

        if (
          deviceResult.error
        ) {
          throw (
            deviceResult.error
          );
        }

        if (
          !deviceResult.data
        ) {
          throw new Error(
            "Device not found."
          );
        }

        let imageUrl:
          string | null =
          null;

        const imagePath =
          imageResult.data?.[0]
            ?.image_url ??
          null;

        if (imagePath) {
          if (
            imagePath.startsWith(
              "http://"
            ) ||
            imagePath.startsWith(
              "https://"
            ) ||
            imagePath.startsWith(
              "/"
            )
          ) {
            imageUrl =
              imagePath;
          } else {
            const {
              data: signed,
              error:
                signedError,
            } =
              await supabase.storage
                .from(
                  "device-images"
                )
                .createSignedUrl(
                  imagePath,
                  3600
                );

            if (
              !signedError
            ) {
              imageUrl =
                signed?.signedUrl ??
                null;
            }
          }
        }

        let manualUrl:
          string | null =
          null;

        const manual =
          manualResult.data
            ? (manualResult.data as unknown as ManualRecord)
            : null;

        if (
          manual?.file_path
        ) {
          const {
            data: signedManual,
            error:
              signedManualError,
          } =
            await supabase.storage
              .from(
                "device-documents"
              )
              .createSignedUrl(
                manual.file_path,
                3600
              );

          if (
            !signedManualError
          ) {
            manualUrl =
              signedManual
                ?.signedUrl ??
              null;
          }
        }

        if (cancelled) {
          return;
        }

        setData({
          device:
            deviceResult.data as unknown as DeviceRecord,
          imageUrl,
          manualUrl,
          manual,
          hasReceipt:
            (
              receiptResult
                .data?.length ??
              0
            ) > 0,
        });
      } catch (error) {
        console.error(
          "Unable to load device success screen:",
          error
        );

        if (
          !cancelled
        ) {
          setErrorMessage(
            error instanceof
            Error
              ? error.message
              : "Unable to load this device."
          );
        }
      } finally {
        if (
          !cancelled
        ) {
          setLoading(false);
        }
      }
    }

    void loadSuccessData();

    return () => {
      cancelled = true;
    };
  }, [
    deviceId,
    user,
    isDemo,
    permissionsLoading,
    router,
  ]);

  useEffect(() => {
    if (
      !data ||
      trackedView.current
    ) {
      return;
    }

    trackedView.current =
      true;

    trackEvent(
      "first_device_success_viewed",
      {
        funnel:
          "activation",
        has_image:
          Boolean(
            data.imageUrl
          ),
        manual_status:
          data.device
            .manual_status ??
          "not_requested",
        has_warranty:
          Boolean(
            data.device
              .warranty_date
          ),
        has_receipt:
          data.hasReceipt,
        onboarding:
          onboardingFlow,
      }
    );
  }, [
    data,
    onboardingFlow,
  ]);

  function trackAction(
    action: string
  ) {
    trackEvent(
      "first_device_success_action",
      {
        funnel:
          "activation",
        action,
      }
    );
  }

  if (
    loading ||
    permissionsLoading
  ) {
    return (
      <PageShell>
        <PageCard className="flex min-h-[420px] items-center justify-center">
          <div className="flex items-center gap-3 text-text-secondary">
            <Loader2
              size={22}
              className="animate-spin"
            />

            Preparing your device…
          </div>
        </PageCard>
      </PageShell>
    );
  }

  if (
    errorMessage ||
    !data
  ) {
    return (
      <PageShell>
        <PageCard className="mx-auto max-w-2xl text-center">
<h1 className="font-serif text-3xl font-medium tracking-[-0.04em] text-[#17212a]">
            Your device was saved.
          </h1>

          <p className="mt-3 text-sm leading-6 text-text-secondary">
            We could not load the
            enrichment summary, but
            your device record is still
            available in your vault.
          </p>

          <div className="mt-6 flex justify-center">
            <Link
              href={`/devices/${deviceId}`}
              className="inline-flex items-center gap-2 rounded-xl bg-[#17212a] px-5 py-3 text-sm font-semibold text-white"
            >
              View device
              <ArrowRight
                size={16}
              />
            </Link>
          </div>
        </PageCard>
      </PageShell>
    );
  }

  const {
    device,
    imageUrl,
    manualUrl,
    hasReceipt,
  } = data;

  const displayBrand =
    device.brand?.trim() ||
    device.manufacturer
      ?.trim() ||
    "Device";

  const manualStatus =
    device.manual_status;

  const hasWarranty =
    Boolean(
      device.warranty_date
    );

  const returnPath =
    `/devices/${deviceId}/added${
      onboardingFlow
        ? "?onboarding=1"
        : "?first=1"
    }`;

  const receiptHref =
    "/documents/upload?" +
    new URLSearchParams({
      deviceId,
      type: "Receipt",
      returnTo:
        returnPath,
    }).toString();

  const doneHref =
    onboardingFlow
      ? `/dashboard?welcome=1&device=${encodeURIComponent(
          deviceId
        )}`
      : "/dashboard";

  return (
    <PageShell className="!pt-5 md:!pt-7">

      <DashboardUnlockCelebration />

      <div className="mx-auto max-w-5xl">
        <section className="overflow-hidden rounded-[32px] border border-[#617c43]/20 bg-[#f3f6ee] shadow-[0_30px_80px_-55px_rgba(15,25,35,0.65)]">
          <div className="border-b border-[#617c43]/15 px-6 py-7 text-center sm:px-8 sm:py-9">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#617c43] text-white shadow-sm">
              <Check
                size={24}
              />
            </div>

            <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#617c43]">
              You're covered.
            </p>

            <h1 className="mt-3 font-serif text-3xl font-medium tracking-[-0.04em] text-[#17212a] sm:text-4xl">
              Your device is in the vault.
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#68737b] sm:text-base">
              Home Tech Vault has
              already organized what
              it could find. You can
              fill the remaining gaps
              now or come back later.
            </p>
          </div>

          <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="border-b border-[#617c43]/15 p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <div className="flex min-h-[250px] items-center justify-center rounded-[24px] border border-[#182533]/10 bg-[#f8f5ef] p-6">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={
                      device.device_name
                    }
                    className="max-h-[230px] max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#617c43]/10 text-[#617c43]">
                      <Laptop
                        size={30}
                      />
                    </div>

                    <p className="mt-4 text-xs font-medium text-[#7b858c]">
                      Product photo
                      can be added
                      anytime
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#879089]">
                  {displayBrand}
                </p>

                <h2 className="mt-2 font-serif text-2xl font-medium tracking-[-0.03em] text-[#17212a]">
                  {
                    device.device_name
                  }
                </h2>

                <div className="mt-3 flex flex-wrap gap-2">
                  {device.model_number ? (
                    <span className="rounded-full border border-[#182533]/10 bg-white/60 px-3 py-1.5 text-xs text-[#667179]">
                      Model{" "}
                      {
                        device.model_number
                      }
                    </span>
                  ) : null}

                  {device.category ? (
                    <span className="rounded-full border border-[#182533]/10 bg-white/60 px-3 py-1.5 text-xs text-[#667179]">
                      {
                        device.category
                      }
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#617c43]">
                Already handled for you
              </p>

              <div className="mt-4 rounded-2xl border border-[#617c43]/15 bg-[#f2f5ee] p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#617c43] text-white">
                    <ShieldCheck
                      size={17}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#17212a]">
                      This is why your vault matters.
                    </p>

                    <p className="mt-1 text-sm leading-6 text-[#69747a]">
                      If this device breaks, gets stolen, or needs a warranty claim later, this is the place you can come back to for its important details and documents.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <StatusRow
                  complete
                  title="Device record created"
                  description="Your product details are saved in the vault."
                />

                <StatusRow
                  complete={
                    Boolean(
                      imageUrl
                    )
                  }
                  title={
                    imageUrl
                      ? "Product image saved"
                      : "Product image not available"
                  }
                  description={
                    imageUrl
                      ? "A matched product photo was saved automatically."
                      : "You can add a device photo later."
                  }
                />

                <StatusRow
                  complete={
                    manualStatus ===
                    "found"
                  }
                  pending={
                    manualStatus ===
                    "pending"
                  }
                  title={
                    manualStatus ===
                    "found"
                      ? "Official manual found"
                      : manualStatus ===
                          "pending"
                        ? "Manual lookup pending"
                        : manualStatus ===
                            "not_found"
                          ? "No automatic manual found"
                          : "Manual not requested"
                  }
                  description={
                    manualStatus ===
                    "found"
                      ? "The product manual is already attached to this device."
                      : manualStatus ===
                          "pending"
                        ? "Home Tech Vault can continue trying available sources."
                        : manualStatus ===
                            "not_found"
                          ? "You can upload a manual whenever you find one."
                          : "Manual lookup runs when a supported product identifier is available."
                  }
                />

                <StatusRow
                  complete={
                    hasWarranty
                  }
                  title={
                    hasWarranty
                      ? "Warranty details saved"
                      : "Warranty details missing"
                  }
                  description={
                    hasWarranty
                      ? "Your coverage date is ready for warranty tracking."
                      : "Add a coverage date so Home Tech Vault can help you stay ahead of expiration."
                  }
                />

                <StatusRow
                  complete={
                    hasReceipt
                  }
                  title={
                    hasReceipt
                      ? "Receipt saved"
                      : "Receipt not added yet"
                  }
                  description={
                    hasReceipt
                      ? "Proof of purchase is connected to this device."
                      : "A receipt makes warranty and insurance records much more useful."
                  }
                />
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {!hasReceipt ? (
                  <Link
                    href={
                      receiptHref
                    }
                    onClick={() =>
                      trackAction(
                        "add_receipt"
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#17212a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#27333d]"
                  >
                    <FileText
                      size={16}
                    />

                    Add receipt
                  </Link>
                ) : null}

                {!hasWarranty ? (
                  <Link
                    href={`/devices/${deviceId}/edit`}
                    onClick={() =>
                      trackAction(
                        "add_warranty"
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#182533]/10 bg-[#f8f5ef] px-4 py-3 text-sm font-semibold text-[#17212a] transition hover:bg-white"
                  >
                    <ShieldCheck
                      size={16}
                    />

                    Add warranty
                  </Link>
                ) : null}

                {manualUrl ? (
                  <a
                    href={
                      manualUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                    onClick={() =>
                      trackAction(
                        "view_manual"
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#182533]/10 bg-[#f8f5ef] px-4 py-3 text-sm font-semibold text-[#17212a] transition hover:bg-white"
                  >
                    <BookOpen
                      size={16}
                    />

                    View manual
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#617c43]/15 bg-[#f8f5ef]/70 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="flex flex-wrap gap-2">
              <Link
                href="/devices/add?first=1"
                onClick={() =>
                  trackAction(
                    "scan_another"
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-[#617c43] transition hover:bg-[#617c43]/5"
              >
                <Plus
                  size={16}
                />
                Scan another
              </Link>

              <Link
                href={`/devices/${deviceId}`}
                onClick={() =>
                  trackAction(
                    "view_device"
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-[#6e787f] transition hover:bg-[#17212a]/5 hover:text-[#17212a]"
              >
                View device
              </Link>
            </div>

            <Link
              href={
                doneHref
              }
              onClick={() =>
                trackAction(
                  "done"
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#617c43] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95"
            >
              Done
              <ArrowRight
                size={16}
              />
            </Link>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

function StatusRow({
  complete = false,
  pending = false,
  title,
  description,
}: {
  complete?: boolean;
  pending?: boolean;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-[#182533]/8 bg-[#f8f5ef] p-4">
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          complete
            ? "bg-[#617c43] text-white"
            : pending
              ? "bg-[#d9b968]/15 text-[#9a7726]"
              : "bg-[#17212a]/5 text-[#929a9f]"
        }`}
      >
        {complete ? (
          <Check
            size={15}
          />
        ) : pending ? (
          <Loader2
            size={15}
            className="animate-spin"
          />
        ) : (
          <Circle
            size={14}
          />
        )}
      </div>

      <div>
        <p className="text-sm font-semibold text-[#17212a]">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-[#737d84]">
          {description}
        </p>
      </div>
    </div>
  );
}
