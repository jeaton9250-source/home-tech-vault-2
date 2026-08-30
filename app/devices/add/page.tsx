"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Laptop,
  Loader2,
  PencilLine,
  Save,
  Sparkles,
  Wifi,
} from "lucide-react";

import {
  getHouseholdLimitMessage,
  useHouseholdLimits,
} from "@/hooks/useHouseholdLimits";
import { usePermissions } from "@/hooks/usePermissions";
import DemoWriteGate from "@/components/demo/DemoWriteGate";
import { addDevice } from "@/app/devices/actions";
import { sendMilestoneEmailForCurrentUser } from "@/app/onboarding/actions";
import {
  DEVICE_FIELD_LIMITS,
  MAX_DEVICE_PURCHASE_PRICE,
  validateDeviceInput,
} from "@/lib/devices/deviceInputValidation";
import SmartPhotoAdd from "@/components/devices/SmartPhotoAdd";
import SmartDeviceSearch, {
  type DeviceLookupResult,
} from "@/components/devices/SmartDeviceSearch";
import { buildDeviceMaintenanceRecommendationsUrl } from "@/lib/devices/maintenanceRecommendations";
import { supabase } from "@/lib/supabase";
import {
  completeOnboarding,
  trackFirstDeviceAdded,
  trackOnboardingCompleted,
  trackOnboardingStepCompleted,
} from "@/lib/onboarding";

import PageShell from "@/components/ui/PageShell";
import PageTitle from "@/components/ui/PageTitle";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

function getRequestedHouseholdId() {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    new URLSearchParams(window.location.search).get("householdId")?.trim() ||
    null
  );
}

export default function AddDevicePage() {
  const router = useRouter();

  const [isFirstDeviceFlow, setIsFirstDeviceFlow] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);

    setIsFirstDeviceFlow(query.get("first") === "1");
  }, []);

  const [isOnboarding, setIsOnboarding] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);

    setIsOnboarding(query.get("onboarding") === "1");
  }, []);

  const {
    user,
    isDemo,
    canCreate,
    isPersonalVault,
    isViewer,
    loading: permissionsLoading,
  } = usePermissions();

  const quota = useHouseholdLimits();

  const [requestedHouseholdId, setRequestedHouseholdId] = useState<
    string | null
  >(null);

  const [returnTo, setReturnTo] = useState<string | null>(null);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);

    setRequestedHouseholdId(query.get("householdId")?.trim() || null);

    setReturnTo(query.get("returnTo")?.trim() || null);
  }, []);

  const isClientVault = Boolean(requestedHouseholdId);

  /*
   * For Realtor preparation, the URL-selected household
   * is authoritative. Do not replace it with the user's
   * normal Personal Vault household.
   */
  const householdId = requestedHouseholdId ?? quota.householdId;

  const quotaLoading = isClientVault ? false : quota.loading;
  const deviceLimitReached = quota.deviceLimitReached;

  const limitMessage = getHouseholdLimitMessage(
    quota.limitReason === "allowed"
      ? deviceLimitReached
        ? quota.canUseProFeatures
          ? "household_device_limit"
          : "free_device_limit"
        : "allowed"
      : quota.limitReason,
    {
      canManageBilling: quota.canManageBilling,
    },
  );

  const [saving, setSaving] = useState(false);

  const [saveProgress, setSaveProgress] = useState(0);

  const [saveStage, setSaveStage] = useState("Saving your device...");

  function canSearchForManual() {
    return Boolean(
      productUpc?.trim() ||
      ((brand?.trim() || manufacturer?.trim()) && modelNumber?.trim()),
    );
  }

  useEffect(() => {
    if (!saving) {
      setSaveProgress(0);
      setSaveStage("Saving your device...");
      return;
    }

    setSaveProgress(8);
    setSaveStage("Saving your device...");

    const startedAt = Date.now();

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;

      setSaveProgress((current) => {
        if (current >= 92) {
          return 92;
        }

        if (current < 28) {
          return Math.min(current + 4, 28);
        }

        if (current < 55) {
          return Math.min(current + 3, 55);
        }

        if (current < 78) {
          return Math.min(current + 2, 78);
        }

        return Math.min(current + 1, 92);
      });

      if (elapsed < 1800) {
        setSaveStage("Saving your device...");
      } else if (!canSearchForManual()) {
        if (elapsed < 4200) {
          setSaveStage("Creating your device record...");
        } else if (elapsed < 7200) {
          setSaveStage("Organizing your device details...");
        } else {
          setSaveStage("Preparing everything for your Vault...");
        }
      } else if (elapsed < 4200) {
        setSaveStage("Identifying the exact model...");
      } else if (elapsed < 7200) {
        setSaveStage("Checking official manufacturer sources...");
      } else if (elapsed < 10500) {
        setSaveStage("Verifying the best manual...");
      } else {
        setSaveStage("Preparing everything for your Vault...");
      }
    }, 300);

    return () => {
      window.clearInterval(interval);
    };
  }, [saving]);

  /*
   * The Add Device screen begins with discovery,
   * not a blank data-entry form.
   */
  const [deviceChosenFromLookup, setDeviceChosenFromLookup] = useState(false);

  const [showMoreDetails, setShowMoreDetails] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [deviceName, setDeviceName] = useState("");

  const [category, setCategory] = useState("");

  const [brand, setBrand] = useState("");

  const [manufacturer, setManufacturer] = useState("");

  const [modelNumber, setModelNumber] = useState("");

  const [serialNumber, setSerialNumber] = useState("");

  const [purchaseDate, setPurchaseDate] = useState("");

  const [warrantyDate, setWarrantyDate] = useState("");

  const [purchasePrice, setPurchasePrice] = useState("");

  const [location, setLocation] = useState("");

  const [notes, setNotes] = useState("");

  /*
   * When a product database match includes a UPC/EAN,
   * keep it so the server can permanently copy the
   * product image into the user's vault after save.
   */
  const [productUpc, setProductUpc] = useState("");

  const [smartAddPhotoDataUrl, setSmartAddPhotoDataUrl] = useState<
    string | null
  >(null);
  async function persistSmartAddPhoto(deviceId: string) {
    if (!smartAddPhotoDataUrl || !user) {
      return;
    }

    try {
      const match = smartAddPhotoDataUrl.match(
        /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/,
      );

      if (!match) {
        throw new Error("Smart Add photo data is invalid.");
      }

      const contentType = match[1];

      const base64 = match[2];

      const binary = window.atob(base64);

      const bytes = new Uint8Array(binary.length);

      for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
      }

      const blob = new Blob([bytes], {
        type: contentType,
      });

      if (!blob.type.startsWith("image/")) {
        throw new Error("Smart Add photo is invalid.");
      }

      const filePath = `${user.id}/${deviceId}/${crypto.randomUUID()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("device-images")
        .upload(filePath, blob, {
          cacheControl: "3600",
          contentType: blob.type || "image/jpeg",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      /*
       * Smart Add's real homeowner photo should
       * become the device's primary memory.
       *
       * Existing product/catalog images are created
       * during addDevice() and HTV currently chooses
       * the oldest device image as primary.
       *
       * Give the user's scan an earlier timestamp so
       * it sorts ahead of the generic product image.
       */
      const smartAddCreatedAt = new Date(Date.now() - 60 * 1000).toISOString();

      const { error: recordError } = await supabase
        .from("device_images")
        .insert({
          device_id: deviceId,
          user_id: user.id,
          image_url: filePath,
          created_at: smartAddCreatedAt,
        });

      if (recordError) {
        await supabase.storage.from("device-images").remove([filePath]);

        throw recordError;
      }
    } catch (error) {
      console.warn(
        "[smart-add] device saved but photo could not be saved",
        error,
      );
    }
  }

  function handleDeviceMatch(device: DeviceLookupResult) {
    setDeviceName(device.deviceName);

    setBrand(device.brand);

    setManufacturer(device.manufacturer);

    setModelNumber(device.modelNumber);

    setCategory(device.category);

    setProductUpc(device.upc ?? "");
    setDeviceChosenFromLookup(true);
  }

  async function saveDevice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");

    if (isDemo) {
      router.push("/signup");
      return;
    }

    if (!user) {
      router.push("/login");
      return;
    }

    if (!canCreate || isViewer) {
      setErrorMessage("Viewer access is read-only. You cannot add devices.");
      return;
    }

    /*
     * Do not block the user while the quota
     * request is still loading.
     *
     * The server action performs the final
     * quota validation before inserting.
     */
    if (!quotaLoading && deviceLimitReached) {
      if (quota.canUseProFeatures || quota.billingManagedByHousehold) {
        router.push("/family");
        return;
      }

      router.push("/upgrade?reason=device-limit");

      return;
    }

    if (!deviceName.trim()) {
      setErrorMessage("Give this device a name.");
      return;
    }

    const validation = validateDeviceInput({
      deviceName,
      category,
      brand,
      manufacturer,
      modelNumber,
      serialNumber,
      purchaseDate,
      warrantyDate,
      purchasePrice,
      location,
      notes,
      productUpc,
    });

    if (!validation.success) {
      setErrorMessage(validation.error);
      return;
    }

    try {
      setSaving(true);

      const result = await addDevice(
        {
          deviceName,
          category,
          brand,
          manufacturer,
          modelNumber,
          serialNumber,
          purchaseDate,
          warrantyDate,
          purchasePrice,
          location,
          notes,
          productUpc,
        },
        requestedHouseholdId,
      );

      if (!result.success) {
        if (result.code === "UNAUTHENTICATED") {
          router.push("/login");
          return;
        }

        if (result.code === "VIEWER_READ_ONLY") {
          setErrorMessage(
            "Viewer access is read-only. You cannot add devices.",
          );
          return;
        }

        if (result.code === "HOUSEHOLD_DEVICE_LIMIT") {
          router.push("/family");
          return;
        }

        if (
          result.code === "FREE_DEVICE_LIMIT" ||
          result.code === "DEVICE_LIMIT_REACHED"
        ) {
          router.push("/upgrade?reason=device-limit");
          return;
        }

        if (result.code === "VALIDATION_ERROR") {
          setErrorMessage(
            result.error || "Check the device details and try again.",
          );
          return;
        }

        setErrorMessage(result.error || "Unable to save this device.");
        return;
      }

      if (result.deviceId && smartAddPhotoDataUrl) {
        await persistSmartAddPhoto(result.deviceId);
      }

      void sendMilestoneEmailForCurrentUser("first_device").catch(
        (emailError) => {
          console.error(
            "[milestone-email] first-device delivery failed",
            emailError,
          );
        },
      );

      if (isOnboarding && user) {
        await completeOnboarding(supabase, user.id);

        void sendMilestoneEmailForCurrentUser("onboarding_complete").catch(
          (emailError) => {
            console.error(
              "[milestone-email] onboarding-complete delivery failed",
              emailError,
            );
          },
        );

        trackFirstDeviceAdded("onboarding");

        trackOnboardingStepCompleted("device");

        trackOnboardingCompleted();

        router.replace(`/devices/${result.deviceId}/added?onboarding=1`);

        router.refresh();
        return;
      }

      if (isFirstDeviceFlow) {
        router.replace(`/devices/${result.deviceId}/added?first=1`);

        router.refresh();
        return;
      }

      router.push(buildDeviceMaintenanceRecommendationsUrl(result.deviceId));

      router.refresh();
    } catch (error) {
      console.error("Unable to save device:", error);

      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save this device.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (permissionsLoading) {
    return (
      <PageShell className="pb-[calc(2rem+env(safe-area-inset-bottom))] sm:pb-10">
        <PageCard className="flex min-h-56 items-center justify-center">
          <div className="flex items-center gap-3 text-text-secondary">
            <Loader2 size={20} className="animate-spin" />
            Opening Smart Add...
          </div>
        </PageCard>
      </PageShell>
    );
  }

  if (isDemo) {
    return <DemoWriteGate backHref="/devices" backLabel="Back to Devices" />;
  }

  if (!user) {
    return (
      <PageShell className="pb-[calc(2rem+env(safe-area-inset-bottom))] sm:pb-10">
        <PageCard className="text-center">
          <h1 className="text-2xl font-bold text-text-primary">
            Sign in to add a device
          </h1>

          <p className="mt-3 text-text-secondary">
            Your device inventory is connected to your account.
          </p>

          <Button href="/login" className="mt-6">
            Sign In
          </Button>
        </PageCard>
      </PageShell>
    );
  }

  if (!canCreate || isViewer) {
    return (
      <PageShell className="pb-[calc(2rem+env(safe-area-inset-bottom))] sm:pb-10">
        <PageTitle
          eyebrow="Read-only access"
          title="You cannot add devices"
          description={
            isPersonalVault
              ? "Your account does not currently have permission to add devices."
              : "Viewers can review shared devices but cannot add or change records."
          }
        />

        <PageCard className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal">
            <Laptop size={30} />
          </div>

          <h2 className="mt-5 text-2xl font-semibold text-text-primary">
            Read-only access
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-text-secondary">
            Contact the household owner or an administrator if you need
            permission to add devices.
          </p>

          <Button href="/devices" className="mt-6">
            Back to Devices
          </Button>
        </PageCard>
      </PageShell>
    );
  }

  if (!quotaLoading && deviceLimitReached) {
    return (
      <PageShell className="pb-[calc(2rem+env(safe-area-inset-bottom))] sm:pb-10">
        <PageTitle
          eyebrow="Device Limit Reached"
          title={limitMessage.title}
          description={limitMessage.description}
        />

        <PageCard className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal">
            <Laptop size={30} />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-text-primary">
            {limitMessage.title}
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-text-secondary">
            {limitMessage.description}
          </p>

          {limitMessage.actionHref && limitMessage.actionLabel && (
            <Button href={limitMessage.actionHref} className="mt-6">
              {limitMessage.actionLabel}
            </Button>
          )}
        </PageCard>
      </PageShell>
    );
  }

  return (
    <PageShell className="pb-[calc(2rem+env(safe-area-inset-bottom))] sm:pb-10">
      <button
        type="button"
        onClick={() => router.push("/devices")}
        className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-text-primary hover:underline"
      >
        <ArrowLeft size={17} />
        Back to Devices
      </button>

      <PageTitle
        eyebrow="Smart Add"
        title="Add something to your home"
        description="Show Home Tech Vault what it is, search for the exact model, or scan its barcode. Review the details, then add it to your home."
      />

      {errorMessage && (
        <PageCard className="border-red-200 bg-red-50 text-red-700">
          {errorMessage}
        </PageCard>
      )}

      <PageCard>
        <form onSubmit={saveDevice} className="scroll-mt-4 space-y-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-home-health">
              Smart Add
            </p>

            <h2 className="mt-2 text-xl font-semibold text-text-primary">
              How would you like to add it?
            </h2>

            <p className="mt-1 text-sm leading-6 text-text-secondary">
              Scan it, search for it, discover it on your Home Wi-Fi, or enter
              the details yourself.
            </p>
          </div>

          <SmartPhotoAdd
            onSelect={handleDeviceMatch}
            onSerialNumberDetected={(value) => {
              if (!serialNumber.trim()) {
                setSerialNumber(value);
              }
            }}
            onPhotoReady={setSmartAddPhotoDataUrl}
          />

          <div className="flex items-center gap-4 py-1">
            <div className="h-px flex-1 bg-border-subtle" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
              Or find it another way
            </span>
            <div className="h-px flex-1 bg-border-subtle" />
          </div>

          <SmartDeviceSearch onSelect={handleDeviceMatch} />

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => router.push("/network/discovery")}
              className="flex items-start gap-4 rounded-3xl border border-border-subtle bg-white p-5 text-left transition hover:border-home-health/30 hover:bg-surface-sunken/35"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-home-health-soft text-home-health">
                <Wifi size={20} />
              </div>

              <div>
                <p className="text-sm font-bold text-text-primary">
                  Discover it
                </p>
                <p className="mt-1 text-xs leading-5 text-text-secondary">
                  Find devices already visible on your Home Wi-Fi.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setDeviceChosenFromLookup(true);
                setShowMoreDetails(true);
              }}
              className="flex items-start gap-4 rounded-3xl border border-border-subtle bg-white p-5 text-left transition hover:border-charcoal/20 hover:bg-surface-sunken/35"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-charcoal text-white">
                <PencilLine size={19} />
              </div>

              <div>
                <p className="text-sm font-bold text-text-primary">
                  Add manually
                </p>
                <p className="mt-1 text-xs leading-5 text-text-secondary">
                  Enter the details yourself when there is nothing to scan.
                </p>
              </div>
            </button>
          </div>
          {/* HTV_DEVICE_LOOKUP_CONFIRM_START */}
          {deviceChosenFromLookup ? (
            <>
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-border-subtle" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                  Review before saving
                </span>

                <div className="h-px flex-1 bg-border-subtle" />
              </div>

              <div className="overflow-hidden rounded-3xl border border-[#617c43]/20 bg-[#f7f9f4]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#617c43]/15 px-5 py-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-home-health">
                      What Home Tech Vault found
                    </p>

                    <p className="mt-1 text-sm text-text-secondary">
                      Check these details before adding it to your home.
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold text-home-health shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-home-health" />
                    Ready to review
                  </div>
                </div>

                <div className="grid gap-5 p-5 sm:grid-cols-[140px_1fr]">
                  <div className="overflow-hidden rounded-2xl border border-border-subtle bg-white">
                    {smartAddPhotoDataUrl ? (
                      <img
                        src={smartAddPhotoDataUrl}
                        alt="Your Smart Add photo"
                        className="aspect-square h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-square items-center justify-center px-4 text-center text-xs text-text-muted">
                        Product identified without a captured photo
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-lg font-semibold tracking-[-0.02em] text-text-primary">
                      {deviceName || "Device found"}
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-border-subtle bg-white px-4 py-3">
                        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-text-muted">
                          Brand
                        </p>
                        <p className="mt-1 truncate text-sm font-semibold text-text-primary">
                          {brand || "Not found"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-border-subtle bg-white px-4 py-3">
                        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-text-muted">
                          Model
                        </p>
                        <p className="mt-1 truncate text-sm font-semibold text-text-primary">
                          {modelNumber || "Not found"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-border-subtle bg-white px-4 py-3">
                        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-text-muted">
                          Serial
                        </p>
                        <p className="mt-1 truncate text-sm font-semibold text-text-primary">
                          {serialNumber || "Not found"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-border-subtle bg-white px-4 py-3">
                        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-text-muted">
                          Category
                        </p>
                        <p className="mt-1 truncate text-sm font-semibold text-text-primary">
                          {category || "Not found"}
                        </p>
                      </div>
                    </div>

                    {smartAddPhotoDataUrl ? (
                      <p className="mt-4 text-xs leading-5 text-text-secondary">
                        Your Smart Add photo will be saved with this device.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">
                  Make any changes
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  Everything below can be edited before it becomes part of your
                  Vault.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <FormField label="Device Name" required>
                  <input
                    autoFocus
                    maxLength={DEVICE_FIELD_LIMITS.deviceName}
                    value={deviceName}
                    onChange={(event) => setDeviceName(event.target.value)}
                    placeholder="Living Room TV"
                    className={inputClassName}
                  />
                </FormField>

                <FormField label="Serial Number">
                  <input
                    maxLength={DEVICE_FIELD_LIMITS.serialNumber}
                    value={serialNumber}
                    onChange={(event) => setSerialNumber(event.target.value)}
                    placeholder="Optional"
                    className={inputClassName}
                  />
                </FormField>

                <FormField label="Location">
                  <input
                    maxLength={DEVICE_FIELD_LIMITS.location}
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Living Room"
                    className={inputClassName}
                  />
                </FormField>
              </div>

              <div className="rounded-2xl border border-border-subtle bg-surface-sunken/45">
                <button
                  type="button"
                  onClick={() => setShowMoreDetails((current) => !current)}
                  aria-expanded={showMoreDetails}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      Purchase, warranty & more
                    </p>

                    <p className="mt-1 text-xs text-text-secondary">
                      Fine-tune the product record and add ownership details
                    </p>
                  </div>

                  {showMoreDetails ? (
                    <ChevronUp size={19} className="text-text-secondary" />
                  ) : (
                    <ChevronDown size={19} className="text-text-secondary" />
                  )}
                </button>

                {showMoreDetails && (
                  <div className="border-t border-border-subtle px-5 py-5">
                    <div className="grid gap-4 lg:grid-cols-2">
                      <FormField label="Brand">
                        <input
                          maxLength={DEVICE_FIELD_LIMITS.brand}
                          value={brand}
                          onChange={(event) => setBrand(event.target.value)}
                          placeholder="Samsung"
                          className={inputClassName}
                        />
                      </FormField>

                      <FormField label="Model">
                        <input
                          maxLength={DEVICE_FIELD_LIMITS.modelNumber}
                          value={modelNumber}
                          onChange={(event) =>
                            setModelNumber(event.target.value)
                          }
                          placeholder="Model number"
                          className={inputClassName}
                        />
                      </FormField>

                      <FormField label="Category">
                        <input
                          maxLength={DEVICE_FIELD_LIMITS.category}
                          value={category}
                          onChange={(event) => setCategory(event.target.value)}
                          placeholder="TV"
                          className={inputClassName}
                        />
                      </FormField>

                      <FormField label="Purchase Date">
                        <input
                          type="date"
                          value={purchaseDate}
                          onChange={(event) =>
                            setPurchaseDate(event.target.value)
                          }
                          className={inputClassName}
                        />
                      </FormField>

                      <FormField label="Purchase Price">
                        <input
                          type="number"
                          min="0"
                          max={MAX_DEVICE_PURCHASE_PRICE}
                          step="0.01"
                          value={purchasePrice}
                          onChange={(event) =>
                            setPurchasePrice(event.target.value)
                          }
                          placeholder="0.00"
                          className={inputClassName}
                        />
                      </FormField>

                      <FormField label="Warranty Expiration">
                        <input
                          type="date"
                          value={warrantyDate}
                          onChange={(event) =>
                            setWarrantyDate(event.target.value)
                          }
                          className={inputClassName}
                        />
                      </FormField>
                    </div>

                    <div className="mt-5">
                      <FormField label="Notes">
                        <textarea
                          maxLength={DEVICE_FIELD_LIMITS.notes}
                          value={notes}
                          onChange={(event) => setNotes(event.target.value)}
                          placeholder="Service history, setup notes, quirks, accessories, or anything worth remembering..."
                          rows={4}
                          className={`${inputClassName} resize-y`}
                        />
                      </FormField>
                    </div>
                  </div>
                )}
              </div>

              {!quotaLoading && quota.limits.maxDevices !== null && (
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-border-subtle bg-surface-sunken/40 px-4 py-3">
                  <p className="text-xs text-text-secondary">
                    {quota.usage.devices} of {quota.limits.maxDevices} device
                    slots used
                  </p>

                  <p className="text-xs font-semibold text-home-health">
                    {quota.remaining.devices} remaining
                  </p>
                </div>
              )}

              {saving ? (
                <div
                  className="rounded-2xl border border-[#617c43]/20 bg-[#f2f5ee] p-4 sm:p-5"
                  role="status"
                  aria-live="polite"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#617c43] text-white">
                      <Loader2 size={18} className="animate-spin" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#17212a]">
                            {canSearchForManual()
                              ? "Finding your manual..."
                              : "Setting up your device..."}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-[#69747a]">
                            {saveStage}
                          </p>
                        </div>

                        <span className="shrink-0 text-xs font-semibold tabular-nums text-[#617c43]">
                          {Math.round(saveProgress)}%
                        </span>
                      </div>

                      <div
                        className="mt-3 h-2 overflow-hidden rounded-full bg-[#617c43]/15"
                        aria-hidden="true"
                      >
                        <div
                          className="h-full rounded-full bg-[#617c43] transition-[width] duration-300 ease-out"
                          style={{
                            width: `${saveProgress}%`,
                          }}
                        />
                      </div>

                      <p className="mt-3 text-[11px] leading-5 text-[#7b858a]">
                        {canSearchForManual()
                          ? "This may take a moment while Home Tech Vault checks trusted sources for the best match."
                          : "Home Tech Vault is saving and organizing your device details."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col-reverse gap-3 border-t border-border-subtle pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-text-secondary">
                  You can finish the device profile anytime.
                </p>

                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.push("/devices")}
                  >
                    Cancel
                  </Button>

                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}

                    {saving
                      ? canSearchForManual()
                        ? "Finding manual..."
                        : "Adding device..."
                      : "Add Device"}
                  </Button>
                </div>
              </div>
            </>
          ) : null}
          {/* HTV_DEVICE_LOOKUP_CONFIRM_END */}
        </form>
      </PageCard>
    </PageShell>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-border-subtle bg-white px-4 py-3.5 text-text-primary outline-none transition placeholder:text-text-tertiary focus:border-interaction focus:ring-2 focus:ring-interaction/15";

function FormField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-text-primary">
        {label}

        {required && <span className="ml-1 text-red-600">*</span>}
      </span>

      {children}
    </label>
  );
}
