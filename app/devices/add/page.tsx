"use client";

import {
  FormEvent,
  useState,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Laptop,
  Loader2,
  Save,
  Sparkles,
} from "lucide-react";

import {
  getHouseholdLimitMessage,
  useHouseholdLimits,
} from "@/hooks/useHouseholdLimits";
import { usePermissions } from "@/hooks/usePermissions";
import DemoWriteGate from "@/components/demo/DemoWriteGate";
import { addDevice } from "@/app/devices/actions";
import SmartDeviceSearch, { type DeviceLookupResult } from "@/components/devices/SmartDeviceSearch";
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

export default function AddDevicePage() {
  const router = useRouter();

  const [
    isFirstDeviceFlow,
    setIsFirstDeviceFlow,
  ] = useState(false);

  useEffect(() => {
    const query =
      new URLSearchParams(
        window.location.search
      );

    setIsFirstDeviceFlow(
      query.get("first") === "1"
    );
  }, []);

  const [
    isOnboarding,
    setIsOnboarding,
  ] = useState(false);

  useEffect(() => {
    const query =
      new URLSearchParams(
        window.location.search
      );

    setIsOnboarding(
      query.get("onboarding") === "1"
    );
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

  const householdId = quota.householdId;
  const quotaLoading = quota.loading;
  const deviceLimitReached =
    quota.deviceLimitReached;

  const limitMessage = getHouseholdLimitMessage(
    quota.limitReason === "allowed"
      ? deviceLimitReached
        ? quota.canUseProFeatures
          ? "household_device_limit"
          : "free_device_limit"
        : "allowed"
      : quota.limitReason,
    {
      canManageBilling:
        quota.canManageBilling,
    }
  );

  const [saving, setSaving] =
    useState(false);

  const [
    showMoreDetails,
    setShowMoreDetails,
  ] = useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [deviceName, setDeviceName] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [brand, setBrand] =
    useState("");

  const [manufacturer, setManufacturer] =
    useState("");

  const [modelNumber, setModelNumber] =
    useState("");

  const [serialNumber, setSerialNumber] =
    useState("");

  const [purchaseDate, setPurchaseDate] =
    useState("");

  const [warrantyDate, setWarrantyDate] =
    useState("");

  const [purchasePrice, setPurchasePrice] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [notes, setNotes] =
    useState("");

  /*
   * When a product database match includes a UPC/EAN,
   * keep it so the server can permanently copy the
   * product image into the user's vault after save.
   */
  const [productUpc, setProductUpc] =
    useState("");

  function handleDeviceMatch(
    device: DeviceLookupResult
  ) {
    setDeviceName(
      device.deviceName
    );

    setBrand(
      device.brand
    );

    setManufacturer(
      device.manufacturer
    );

    setModelNumber(
      device.modelNumber
    );

    setCategory(
      device.category
    );

    setProductUpc(
      device.upc ?? ""
    );
  }

  async function saveDevice(
    event: FormEvent<HTMLFormElement>
  ) {
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
      setErrorMessage(
        "Viewer access is read-only. You cannot add devices."
      );
      return;
    }

    /*
     * Do not block the user while the quota
     * request is still loading.
     *
     * The server action performs the final
     * quota validation before inserting.
     */
    if (
      !quotaLoading &&
      deviceLimitReached
    ) {
      if (
        quota.canUseProFeatures ||
        quota.billingManagedByHousehold
      ) {
        router.push("/family");
        return;
      }

      router.push(
        "/upgrade?reason=device-limit"
      );

      return;
    }

    if (!deviceName.trim()) {
      setErrorMessage(
        "Give this device a name."
      );
      return;
    }

    try {
      setSaving(true);

      const result = await addDevice({
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

      if (!result.success) {
        if (
          result.code ===
          "UNAUTHENTICATED"
        ) {
          router.push("/login");
          return;
        }

        if (
          result.code ===
          "VIEWER_READ_ONLY"
        ) {
          setErrorMessage(
            "Viewer access is read-only. You cannot add devices."
          );
          return;
        }

        if (
          result.code ===
          "HOUSEHOLD_DEVICE_LIMIT"
        ) {
          router.push("/family");
          return;
        }

        if (
          result.code ===
            "FREE_DEVICE_LIMIT" ||
          result.code ===
            "DEVICE_LIMIT_REACHED"
        ) {
          router.push(
            "/upgrade?reason=device-limit"
          );
          return;
        }

        if (
          result.code ===
          "VALIDATION_ERROR"
        ) {
          setErrorMessage(
            "Give this device a name."
          );
          return;
        }

        setErrorMessage(
          result.error ||
            "Unable to save this device."
        );
        return;
      }

      if (
        isOnboarding &&
        user
      ) {
        await completeOnboarding(
          supabase,
          user.id
        );

        trackFirstDeviceAdded(
          "onboarding"
        );

        trackOnboardingStepCompleted(
          "device"
        );

        trackOnboardingCompleted();

        router.replace(
          `/devices/${result.deviceId}/added?onboarding=1`
        );

        router.refresh();
        return;
      }

      if (
        isFirstDeviceFlow
      ) {
        router.replace(
          `/devices/${result.deviceId}/added?first=1`
        );

        router.refresh();
        return;
      }

      router.push(
        buildDeviceMaintenanceRecommendationsUrl(
          result.deviceId
        )
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Unable to save device:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save this device."
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
            <Loader2
              size={20}
              className="animate-spin"
            />

            Opening Quick Add...
          </div>
        </PageCard>
      </PageShell>
    );
  }

  if (isDemo) {
    return (
      <DemoWriteGate
        backHref="/devices"
        backLabel="Back to Devices"
      />
    );
  }

  if (!user) {
    return (
      <PageShell className="pb-[calc(2rem+env(safe-area-inset-bottom))] sm:pb-10">
        <PageCard className="text-center">
          <h1 className="text-2xl font-bold text-text-primary">
            Sign in to add a device
          </h1>

          <p className="mt-3 text-text-secondary">
            Your device inventory is connected
            to your account.
          </p>

          <Button
            href="/login"
            className="mt-6"
          >
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
            Contact the household owner or an
            administrator if you need permission
            to add devices.
          </p>

          <Button
            href="/devices"
            className="mt-6"
          >
            Back to Devices
          </Button>
        </PageCard>
      </PageShell>
    );
  }

  if (
    !quotaLoading &&
    deviceLimitReached
  ) {
    return (
      <PageShell className="pb-[calc(2rem+env(safe-area-inset-bottom))] sm:pb-10">
        <PageTitle
          eyebrow="Device Limit Reached"
          title={limitMessage.title}
          description={
            limitMessage.description
          }
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

          {limitMessage.actionHref &&
            limitMessage.actionLabel && (
              <Button
                href={
                  limitMessage.actionHref
                }
                className="mt-6"
              >
                {
                  limitMessage.actionLabel
                }
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
        onClick={() =>
          router.push("/devices")
        }
        className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-text-primary hover:underline"
      >
        <ArrowLeft size={17} />
        Back to Devices
      </button>

      <PageTitle
        eyebrow="Quick Add"
        title="Add a device"
        description="Start with the basics. You can add receipts, warranties, purchase details, and everything else later."
      />

      <PageCard className="overflow-hidden border-home-health/20 bg-home-health-soft/20">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-home-health text-white">
              <Sparkles size={21} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-home-health">
                Faster option
              </p>

              <h2 className="mt-1 text-lg font-semibold text-text-primary">
                Already have the purchase email?
              </h2>

              <p className="mt-1 max-w-xl text-sm leading-6 text-text-secondary">
                Smart Import can pull device and
                purchase information from your
                order confirmation so you do less
                typing.
              </p>
            </div>
          </div>

          <Button
            href="/imports"
            variant="secondary"
          >
            Use Smart Import
          </Button>
        </div>
      </PageCard>

      {errorMessage && (
        <PageCard className="border-red-200 bg-red-50 text-red-700">
          {errorMessage}
        </PageCard>
      )}

      <PageCard>
        <form
          onSubmit={saveDevice}
          className="scroll-mt-4 space-y-7"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-home-health">
              Quick Add
            </p>

            <h2 className="mt-2 text-xl font-semibold text-text-primary">
              Just the basics.
            </h2>

            <p className="mt-1 text-sm leading-6 text-text-secondary">
              Search for your device first.
              Home Tech Vault can fill the basics
              so you do less typing.
            </p>
          </div>

          <SmartDeviceSearch
            onSelect={handleDeviceMatch}
          />

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-border-subtle" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
              Device details
            </span>

            <div className="h-px flex-1 bg-border-subtle" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <FormField
              label="Device Name"
              required
            >
              <input
                autoFocus
                value={deviceName}
                onChange={(event) =>
                  setDeviceName(
                    event.target.value
                  )
                }
                placeholder="Living Room TV"
                className={inputClassName}
              />
            </FormField>

            <FormField label="Serial Number">
              <input
                value={serialNumber}
                onChange={(event) =>
                  setSerialNumber(
                    event.target.value
                  )
                }
                placeholder="Optional"
                className={inputClassName}
              />
            </FormField>

            <FormField label="Location">
              <input
                value={location}
                onChange={(event) =>
                  setLocation(
                    event.target.value
                  )
                }
                placeholder="Living Room"
                className={inputClassName}
              />
            </FormField>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-surface-sunken/45">
            <button
              type="button"
              onClick={() =>
                setShowMoreDetails(
                  (current) => !current
                )
              }
              aria-expanded={
                showMoreDetails
              }
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  Add more details
                </p>

                <p className="mt-1 text-xs text-text-secondary">
                  Brand, model, purchase,
                  warranty and notes
                </p>
              </div>

              {showMoreDetails ? (
                <ChevronUp
                  size={19}
                  className="text-text-secondary"
                />
              ) : (
                <ChevronDown
                  size={19}
                  className="text-text-secondary"
                />
              )}
            </button>

            {showMoreDetails && (
              <div className="border-t border-border-subtle px-5 py-5">
                <div className="grid gap-4 lg:grid-cols-2">
                  <FormField label="Brand">
                    <input
                      value={brand}
                      onChange={(event) =>
                        setBrand(
                          event.target.value
                        )
                      }
                      placeholder="Samsung"
                      className={
                        inputClassName
                      }
                    />
                  </FormField>

                  <FormField label="Model">
                    <input
                      value={modelNumber}
                      onChange={(event) =>
                        setModelNumber(
                          event.target.value
                        )
                      }
                      placeholder="Model number"
                      className={
                        inputClassName
                      }
                    />
                  </FormField>

                  <FormField label="Category">
                    <input
                      value={category}
                      onChange={(event) =>
                        setCategory(
                          event.target.value
                        )
                      }
                      placeholder="TV"
                      className={
                        inputClassName
                      }
                    />
                  </FormField>

                  <FormField label="Purchase Date">
                    <input
                      type="date"
                      value={purchaseDate}
                      onChange={(event) =>
                        setPurchaseDate(
                          event.target.value
                        )
                      }
                      className={
                        inputClassName
                      }
                    />
                  </FormField>

                  <FormField label="Purchase Price">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={purchasePrice}
                      onChange={(event) =>
                        setPurchasePrice(
                          event.target.value
                        )
                      }
                      placeholder="0.00"
                      className={
                        inputClassName
                      }
                    />
                  </FormField>

                  <FormField label="Warranty Expiration">
                    <input
                      type="date"
                      value={warrantyDate}
                      onChange={(event) =>
                        setWarrantyDate(
                          event.target.value
                        )
                      }
                      className={
                        inputClassName
                      }
                    />
                  </FormField>
                </div>

                <div className="mt-5">
                  <FormField label="Notes">
                    <textarea
                      value={notes}
                      onChange={(event) =>
                        setNotes(
                          event.target.value
                        )
                      }
                      placeholder="Anything useful to remember about this device..."
                      rows={4}
                      className={`${inputClassName} resize-y`}
                    />
                  </FormField>
                </div>
              </div>
            )}
          </div>

          {!quotaLoading &&
            quota.limits.maxDevices !==
              null && (
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-border-subtle bg-surface-sunken/40 px-4 py-3">
                <p className="text-xs text-text-secondary">
                  {quota.usage.devices} of{" "}
                  {
                    quota.limits
                      .maxDevices
                  }{" "}
                  device slots used
                </p>

                <p className="text-xs font-semibold text-home-health">
                  {
                    quota.remaining
                      .devices
                  }{" "}
                  remaining
                </p>
              </div>
            )}

          <div className="flex flex-col-reverse gap-3 border-t border-border-subtle pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-text-secondary">
              You can finish the device
              profile anytime.
            </p>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  router.push(
                    "/devices"
                  )
                }
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={saving}
              >
                {saving ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={18} />
                )}

                {saving
                  ? "Adding..."
                  : "Add Device"}
              </Button>
            </div>
          </div>
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

        {required && (
          <span className="ml-1 text-red-600">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}
