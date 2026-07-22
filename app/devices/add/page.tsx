"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Laptop,
  Loader2,
  Save,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { applyHouseholdScope } from "@/lib/data/householdScope";
import {
  getDefaultActivityTitle,
  recordActivity,
} from "@/lib/activity";
import { usePermissions } from "@/hooks/usePermissions";
import DemoWriteGate from "@/components/demo/DemoWriteGate";
import { FREE_DEVICE_LIMIT } from "@/lib/permissions/plans";

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
    householdId: permissionsHouseholdId,
    deviceLimit,
    hasUnlimitedDevices,
    loading: permissionsLoading,
  } = usePermissions();

  const [deviceCount, setDeviceCount] =
    useState(0);

  const [
    householdId,
    setHouseholdId,
  ] = useState<string | null>(null);

  const [
    checkingDeviceLimit,
    setCheckingDeviceLimit,
  ] = useState(true);

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

  useEffect(() => {
    async function loadHouseholdAndDeviceCount() {
      if (permissionsLoading) {
        return;
      }

      try {
        setCheckingDeviceLimit(true);
        setErrorMessage("");

        if (isDemo || !user) {
          setHouseholdId(null);
          setDeviceCount(0);
          return;
        }

        setHouseholdId(
          permissionsHouseholdId
        );

        let countQuery =
          applyHouseholdScope(
            supabase
              .from("devices")
              .select("*", {
                count: "exact",
                head: true,
              }),
            permissionsHouseholdId,
            user.id
          );

        const {
          count,
          error: countError,
        } = await countQuery;

        if (countError) {
          throw countError;
        }

        setDeviceCount(count || 0);
      } catch (error) {
        console.error(
          "Unable to check device limit:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to check your device allowance."
        );
      } finally {
        setCheckingDeviceLimit(false);
      }
    }

    void loadHouseholdAndDeviceCount();
  }, [
    user,
    isDemo,
    permissionsLoading,
    permissionsHouseholdId,
  ]);

  const loading =
    permissionsLoading ||
    checkingDeviceLimit;

  const deviceLimitReached =
    !hasUnlimitedDevices &&
    deviceLimit !== null &&
    deviceCount >= deviceLimit;

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

    if (!canCreate) {
      setErrorMessage(
        "Viewer access is read-only. You cannot add devices."
      );
      return;
    }

    if (deviceLimitReached) {
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

      const locationsResult =
        await applyHouseholdScope(
          supabase
            .from("devices")
            .select("location"),
          householdId,
          user.id
        );

      const existingLocations = new Set(
        (
          (locationsResult.data ||
            []) as {
            location: string | null;
          }[]
        )
          .map((row) =>
            row.location?.trim().toLowerCase()
          )
          .filter(Boolean)
      );

      const trimmedLocation =
        location.trim();

      const { data: createdDevice, error } =
        await supabase
          .from("devices")
          .insert({
            user_id: user.id,
            household_id:
              householdId,
            device_name:
              deviceName.trim(),
            category:
              category.trim() || null,
            brand:
              brand.trim() || null,
            model_number:
              modelNumber.trim() || null,
            serial_number:
              serialNumber.trim() || null,
            purchase_date:
              purchaseDate || null,
            warranty_date:
              warrantyDate || null,
            purchase_price:
              purchasePrice
                ? Number(purchasePrice)
                : null,
            location:
              trimmedLocation || null,
            notes:
              notes.trim() || null,
          })
          .select("id")
          .single();

      if (error) {
        if (
          error.message.includes(
            "DEVICE_LIMIT_REACHED"
          )
        ) {
          router.push(
            "/upgrade?reason=device-limit"
          );
          return;
        }

        throw error;
      }

      if (createdDevice?.id) {
        const name =
          deviceName.trim();

        await recordActivity({
          activityType: "device.added",
          title:
            getDefaultActivityTitle(
              "device.added",
              name
            ),
          description:
            "Device saved to your vault.",
          userId: user.id,
          householdId,
          deviceId: createdDevice.id,
        });

        if (warrantyDate) {
          await recordActivity({
            activityType: "warranty.added",
            title:
              getDefaultActivityTitle(
                "warranty.added",
                name
              ),
            description:
              "Warranty coverage recorded on the device.",
            userId: user.id,
            householdId,
            deviceId: createdDevice.id,
          });
        }

        if (
          trimmedLocation &&
          !existingLocations.has(
            trimmedLocation.toLowerCase()
          )
        ) {
          await recordActivity({
            activityType: "room.created",
            title:
              getDefaultActivityTitle(
                "room.created",
                trimmedLocation
              ),
            description:
              "A new room was created when this device was assigned a location.",
            userId: user.id,
            householdId,
            entityId: trimmedLocation,
          });
        }
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

  if (!canCreate) {
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

  if (deviceLimitReached) {
    return (
      <PageShell>
        <PageTitle
          eyebrow="Device Limit Reached"
          title="Upgrade to add more devices"
          description={`Free accounts can store up to ${FREE_DEVICE_LIMIT} devices. Upgrade to Pro for unlimited device tracking.`}
        />

        <PageCard className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
            <Laptop size={30} />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-text-primary">
            You have used all {FREE_DEVICE_LIMIT} free device slots
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-text-secondary">
            Your existing devices remain safe. Upgrade your
            account to continue adding devices.
          </p>

          <Button
            href="/upgrade?reason=device-limit"
            className="mt-6"
          >
            View Upgrade Options
          </Button>
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

      {!hasUnlimitedDevices &&
        deviceLimit !== null && (
          <PageCard className="border-warning/40 bg-warning-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-achievement">
              Free Device Allowance
            </p>

            <h2 className="mt-2 text-xl font-bold text-text-primary">
              {deviceCount} of {deviceLimit} devices used
            </h2>

            <p className="mt-2 text-sm text-text-secondary">
              You have{" "}
              {Math.max(
                deviceLimit -
                  deviceCount,
                0
              )}{" "}
              device slot
              {deviceLimit -
                deviceCount ===
              1
                ? ""
                : "s"}{" "}
              remaining.
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