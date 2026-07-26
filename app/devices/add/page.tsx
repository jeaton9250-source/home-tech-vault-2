"use client";

import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Laptop,
  Loader2,
  Save,
} from "lucide-react";

import {
  getHouseholdLimitMessage,
  useHouseholdLimits,
} from "@/hooks/useHouseholdLimits";
import { usePermissions } from "@/hooks/usePermissions";
import DemoWriteGate from "@/components/demo/DemoWriteGate";
import { addDevice } from "@/app/devices/actions";

import PageShell from "@/components/ui/PageShell";
import PageTitle from "@/components/ui/PageTitle";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

export default function AddDevicePage() {
  const router = useRouter();

  const {
    user,
    isDemo,
    canCreate,
    isPersonalVault,
    isViewer,
  } = usePermissions();

  const quota = useHouseholdLimits();

  const householdId = quota.householdId;

  const loading = quota.loading;

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

  const [errorMessage, setErrorMessage] =
    useState("");

  const [deviceName, setDeviceName] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [brand, setBrand] =
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

    if (loading) {
      return;
    }

    if (!canCreate || isViewer) {
      setErrorMessage(
        "Viewer access is read-only. You cannot add devices."
      );
      return;
    }

    if (deviceLimitReached) {
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
        "Enter a device name."
      );
      return;
    }

    try {
      setSaving(true);

      const result = await addDevice({
        deviceName,
        category,
        brand,
        modelNumber,
        serialNumber,
        purchaseDate,
        warrantyDate,
        purchasePrice,
        location,
        notes,
      });

      if (!result.success) {
        if (result.code === "UNAUTHENTICATED") {
          router.push("/login");
          return;
        }

        if (result.code === "VIEWER_READ_ONLY") {
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

        if (result.code === "VALIDATION_ERROR") {
          setErrorMessage(
            "Enter a device name."
          );
          return;
        }

        setErrorMessage(
          result.error ||
            "Unable to save this device."
        );
        return;
      }

      router.push("/devices");
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

  if (loading) {
    return (
      <PageShell>
        <PageCard className="flex min-h-64 items-center justify-center">
          <div className="flex items-center gap-3 text-text-secondary">
            <Loader2
              size={22}
              className="animate-spin"
            />

            Checking your device allowance...
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
      <PageShell>
        <PageCard className="text-center">
          <h1 className="text-2xl font-bold text-text-primary">
            Sign in to add a device
          </h1>

          <p className="mt-3 text-text-secondary">
            Your device inventory is connected to your account.
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

  if (!loading && !canCreate) {
    return (
      <PageShell>
        <PageTitle
          eyebrow="Read-only access"
          title="You cannot add devices"
          description={
            isPersonalVault
              ? "Your account does not currently have permission to add devices."
              : "Viewers can review shared devices, warranties, documents, and other household information, but cannot add or change records."
          }
        />

        <PageCard className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
            <Laptop size={30} />
          </div>

          <h2 className="mt-5 text-2xl font-semibold text-text-primary">
            You cannot add devices
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-text-secondary">
            Your household role is Viewer. Contact the household
            owner or an administrator if you need permission to add
            or edit information.
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

  if (!loading && deviceLimitReached) {
    return (
      <PageShell>
        <PageTitle
          eyebrow="Device Limit Reached"
          title={limitMessage.title}
          description={limitMessage.description}
        />

        <PageCard className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
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
                href={limitMessage.actionHref}
                className="mt-6"
              >
                {limitMessage.actionLabel}
              </Button>
            )}
        </PageCard>
      </PageShell>
    );
  }

  return (
    <PageShell>
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
        eyebrow="Device Inventory"
        title="Add New Device"
        description={
          householdId
            ? "Add a device to your shared household vault."
            : "Save purchase details, warranty information, serial numbers, and notes in your vault."
        }
      />

      {quota.limits.maxDevices !== null && (
          <PageCard className="border-warning/40 bg-warning-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-achievement">
              Household Device Allowance
            </p>

            <h2 className="mt-2 text-xl font-bold text-text-primary">
              {quota.usage.devices} of{" "}
              {quota.limits.maxDevices} devices used
            </h2>

            <p className="mt-2 text-sm text-text-secondary">
              You have{" "}
              {quota.remaining.devices ?? 0}{" "}
              device slot
              {quota.remaining.devices === 1
                ? ""
                : "s"}{" "}
              remaining in this household.
            </p>
          </PageCard>
        )}

      {errorMessage && (
        <PageCard className="border-red-200 bg-red-50 text-red-700">
          {errorMessage}
        </PageCard>
      )}

      <PageCard>
        <form
          onSubmit={saveDevice}
          className="space-y-6"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              label="Device Name"
              required
            >
              <input
                value={deviceName}
                onChange={(event) =>
                  setDeviceName(
                    event.target.value
                  )
                }
                placeholder="MacBook Pro"
                className={inputClassName}
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
                placeholder="Computer"
                className={inputClassName}
              />
            </FormField>

            <FormField label="Brand">
              <input
                value={brand}
                onChange={(event) =>
                  setBrand(
                    event.target.value
                  )
                }
                placeholder="Apple"
                className={inputClassName}
              />
            </FormField>

            <FormField label="Model Number">
              <input
                value={modelNumber}
                onChange={(event) =>
                  setModelNumber(
                    event.target.value
                  )
                }
                placeholder="14-inch M3 Pro"
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
                placeholder="Enter the serial number"
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
                placeholder="Home Office"
                className={inputClassName}
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
                className={inputClassName}
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
                className={inputClassName}
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
                className={inputClassName}
              />
            </FormField>
          </div>

          <FormField label="Notes">
            <textarea
              value={notes}
              onChange={(event) =>
                setNotes(
                  event.target.value
                )
              }
              placeholder="Add warranty, maintenance, setup, or device notes..."
              rows={5}
              className={`${inputClassName} resize-y`}
            />
          </FormField>

          <div className="flex flex-col-reverse gap-3 border-t border-border-subtle pt-6 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                router.push("/devices")
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
                ? "Saving Device..."
                : "Save Device"}
            </Button>
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