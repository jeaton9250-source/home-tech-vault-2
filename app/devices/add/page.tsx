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
import { useDemoMode } from "@/hooks/useDemoMode";
import { useSubscription } from "@/hooks/useSubscription";

import PageShell from "@/components/ui/PageShell";
import PageTitle from "@/components/ui/PageTitle";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

export default function AddDevicePage() {
  const router = useRouter();

  const {
    user,
    isDemo,
    loading: demoModeLoading,
  } = useDemoMode();

  const {
    deviceLimit,
    hasUnlimitedDevices,
    loading: subscriptionLoading,
  } = useSubscription();

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
      if (
        demoModeLoading ||
        subscriptionLoading
      ) {
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

        const {
          data: membership,
          error: membershipError,
        } = await supabase
          .from("household_members")
          .select("household_id")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();

        if (membershipError) {
          throw membershipError;
        }

        const currentHouseholdId =
          membership?.household_id || null;

        setHouseholdId(
          currentHouseholdId
        );

        let countQuery =
          supabase
            .from("devices")
            .select("*", {
              count: "exact",
              head: true,
            });

        if (currentHouseholdId) {
          countQuery =
            countQuery.eq(
              "household_id",
              currentHouseholdId
            );
        } else {
          countQuery =
            countQuery.eq(
              "user_id",
              user.id
            );
        }

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
    demoModeLoading,
    subscriptionLoading,
  ]);

  const loading =
    demoModeLoading ||
    subscriptionLoading ||
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

      const { error } = await supabase
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
            location.trim() || null,
          notes:
            notes.trim() || null,
        });

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
          <div className="flex items-center gap-3 text-neutral-500">
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
      <PageShell>
        <PageTitle
          eyebrow="Interactive Demo"
          title="Create your vault to add devices"
          description="Demo Mode lets you explore sample devices, but changes are not saved."
        />

        <PageCard className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
            <Laptop size={30} />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-[#111827]">
            Ready to add your own devices?
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-neutral-500">
            Create a free Home Tech Vault account and save up to
            eight devices.
          </p>

          <Button
            href="/signup"
            className="mt-6"
          >
            Create Your Vault
          </Button>
        </PageCard>
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell>
        <PageCard className="text-center">
          <h1 className="text-2xl font-bold text-[#111827]">
            Sign in to add a device
          </h1>

          <p className="mt-3 text-neutral-500">
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

  if (deviceLimitReached) {
    return (
      <PageShell>
        <PageTitle
          eyebrow="Device Limit Reached"
          title="Upgrade to add more devices"
          description="Free accounts can store up to 8 devices. Upgrade to Pro for unlimited device tracking."
        />

        <PageCard className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
            <Laptop size={30} />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-[#111827]">
            You have used all 8 free device slots
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-neutral-500">
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
        className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-[#111827] hover:underline"
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
          <PageCard className="border-[#D8C69D] bg-[#FFF8E8]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A6A2F]">
              Free Device Allowance
            </p>

            <h2 className="mt-2 text-xl font-bold text-[#111827]">
              {deviceCount} of {deviceLimit} devices used
            </h2>

            <p className="mt-2 text-sm text-neutral-600">
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

          <div className="flex flex-col-reverse gap-3 border-t border-[#E8E2D6] pt-6 sm:flex-row sm:justify-end">
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
  "w-full rounded-2xl border border-[#E8E2D6] bg-white px-4 py-3.5 text-[#111827] outline-none transition placeholder:text-neutral-400 focus:border-[#C8A96A] focus:ring-2 focus:ring-[#C8A96A]/20";

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
      <span className="mb-2 block text-sm font-semibold text-[#111827]">
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