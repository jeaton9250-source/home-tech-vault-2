"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Save,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import {
  applyHouseholdMutationScope,
  applyHouseholdScope,
} from "@/lib/data/householdScope";
import {
  getDefaultActivityTitle,
  recordActivity,
} from "@/lib/activity";
import { usePermissions } from "@/hooks/usePermissions";
import { getEditAccess, getEditAccessMessage } from "@/lib/permissions/editAccess";
import { isDevelopmentEnvironment } from "@/lib/permissions/developmentAccess";

import PageShell from "@/components/ui/PageShell";
import PageTitle from "@/components/ui/PageTitle";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

type DeviceForm = {
  device_name: string;
  category: string;
  brand: string;
  model_number: string;
  serial_number: string;
  purchase_date: string;
  warranty_date: string;
  purchase_price: string;
  location: string;
  notes: string;
};

const emptyForm: DeviceForm = {
  device_name: "",
  category: "",
  brand: "",
  model_number: "",
  serial_number: "",
  purchase_date: "",
  warranty_date: "",
  purchase_price: "",
  location: "",
  notes: "",
};

export default function EditDevicePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const {
    user,
    householdId,
    canEdit,
    isViewer,
    loading: permissionsLoading,
    personalPlan,
    effectivePlan,
    canUseProFeatures,
    rawHouseholdRole,
    isVerifiedPlatformAdmin,
    canUsePremiumFeatures,
  } = usePermissions();

  const [form, setForm] = useState<DeviceForm>(emptyForm);
  const [loadingDevice, setLoadingDevice] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadDevice() {
      if (permissionsLoading) {
        return;
      }

      try {
        setLoadingDevice(true);
        setErrorMessage("");

        const deviceId = params.id;

        if (!deviceId) {
          throw new Error("Invalid device ID.");
        }

        if (!user) {
          router.push("/login");
          return;
        }

        const { data, error } =
          await applyHouseholdScope(
            supabase
              .from("devices")
              .select("*")
              .eq("id", deviceId),
            householdId,
            user.id
          ).maybeSingle();

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error("Device not found.");
        }

        setForm({
          device_name: data.device_name || "",
          category: data.category || "",
          brand: data.brand || "",
          model_number: data.model_number || "",
          serial_number: data.serial_number || "",
          purchase_date: data.purchase_date || "",
          warranty_date: data.warranty_date || "",
          purchase_price:
            data.purchase_price !== null &&
            data.purchase_price !== undefined
              ? String(data.purchase_price)
              : "",
          location: data.location || "",
          notes: data.notes || "",
        });
      } catch (error) {
        console.error("Unable to load device:", error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load this device."
        );
      } finally {
        setLoadingDevice(false);
      }
    }

    void loadDevice();
  }, [
    params.id,
    router,
    user,
    householdId,
    permissionsLoading,
  ]);

  function updateField(
    field: keyof DeviceForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.device_name.trim()) {
      alert("Please enter a device name.");
      return;
    }

    if (!user) {
      router.push("/login");
      return;
    }

    try {
      setSaving(true);

      const { error } =
        await applyHouseholdMutationScope(
          supabase
            .from("devices")
            .update({
              device_name:
                form.device_name.trim(),
              category:
                form.category.trim() || null,
              brand:
                form.brand.trim() || null,
              model_number:
                form.model_number.trim() ||
                null,
              serial_number:
                form.serial_number.trim() ||
                null,
              purchase_date:
                form.purchase_date || null,
              warranty_date:
                form.warranty_date || null,
              purchase_price: form.purchase_price
                ? Number(form.purchase_price)
                : null,
              location:
                form.location.trim() || null,
              notes:
                form.notes.trim() || null,
            })
            .eq("id", params.id),
          householdId,
          user.id
        );

      if (error) {
        throw error;
      }

      await recordActivity({
        activityType: "device.edited",
        title: getDefaultActivityTitle(
          "device.edited",
          form.device_name.trim()
        ),
        description:
          "Device details were updated.",
        userId: user.id,
        householdId,
        deviceId: params.id as string,
      });

      if (form.warranty_date) {
        await recordActivity({
          activityType: "warranty.added",
          title: getDefaultActivityTitle(
            "warranty.added",
            form.device_name.trim()
          ),
          description:
            "Warranty information was updated on this device.",
          userId: user.id,
          householdId,
          deviceId: params.id as string,
        });
      }

      alert("Device updated successfully.");
      router.push(`/devices/${params.id}`);
      router.refresh();
    } catch (error) {
      console.error("Unable to update device:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to update the device."
      );
    } finally {
      setSaving(false);
    }
  }

  const pageLoading =
    permissionsLoading || loadingDevice;

  const editAccess = getEditAccess({
    loading: permissionsLoading,
    isDemo: false,
    isAuthenticated: Boolean(user),
    isViewer,
    canEdit,
    feature: "devices",
    isPlatformAdmin: isVerifiedPlatformAdmin,
    canUsePremiumFeatures,
    canUseFamilySharing: canUsePremiumFeatures,
  });

  const editAccessMessage = getEditAccessMessage(
    editAccess.reason
  );

  const showEditDebug =
    isDevelopmentEnvironment() ||
    isVerifiedPlatformAdmin;

  if (pageLoading) {
    return (
      <PageShell>
        <PageCard className="flex min-h-64 items-center justify-center">
          <div className="flex items-center gap-3 text-text-secondary">
            <Loader2 className="animate-spin" size={22} />
            Loading device...
          </div>
        </PageCard>
      </PageShell>
    );
  }

  if (!editAccess.allowed) {
    return (
      <PageShell>
        <PageTitle
          eyebrow="Device Vault"
          title={editAccessMessage.title}
          description={editAccessMessage.body}
        />

        <PageCard className="text-center">
          <h2 className="text-2xl font-semibold text-text-primary">
            {editAccessMessage.title}
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-text-secondary">
            {editAccessMessage.body}
          </p>

          {editAccessMessage.showUpgrade ? (
            <Button href="/upgrade" className="mt-6">
              Upgrade Household
            </Button>
          ) : (
            <Button
              href={`/devices/${params.id}`}
              className="mt-6"
            >
              Back to Device
            </Button>
          )}
        </PageCard>
      </PageShell>
    );
  }

  if (errorMessage) {
    return (
      <PageShell>
        <PageCard className="border-red-200 bg-red-50 text-red-700">
          <h1 className="text-2xl font-bold">
            Unable to edit device
          </h1>

          <p className="mt-3">{errorMessage}</p>

          <Button
            className="mt-6"
            onClick={() => router.push("/devices")}
          >
            Back to Devices
          </Button>
        </PageCard>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {showEditDebug ? (
        <PageCard className="mb-4 border-dashed p-4 text-xs">
          <p className="font-semibold text-text-primary">
            Edit access debug
          </p>
          <dl className="mt-2 grid gap-1 font-mono text-text-secondary">
            <div>householdId: {householdId ?? "—"}</div>
            <div>role: {rawHouseholdRole ?? "—"}</div>
            <div>personalPlan: {personalPlan}</div>
            <div>effectivePlan: {effectivePlan}</div>
            <div>canUseProFeatures: {String(canUseProFeatures)}</div>
            <div>canEdit: {String(canEdit)}</div>
            <div>editAccess: {editAccess.reason}</div>
            <div>permissionsLoading: {String(permissionsLoading)}</div>
          </dl>
        </PageCard>
      ) : null}

      <PageTitle
        eyebrow="Device Vault"
        title="Edit Device"
        description="Update the saved information for this device."
        action={
          <Button
            variant="secondary"
            onClick={() =>
              router.push(`/devices/${params.id}`)
            }
          >
            <ArrowLeft size={17} />
            Cancel
          </Button>
        }
      />

      <PageCard>
        <form
          onSubmit={handleSubmit}
          className="grid gap-6 md:grid-cols-2"
        >
          <FormInput
            label="Device Name"
            value={form.device_name}
            onChange={(value) =>
              updateField("device_name", value)
            }
            placeholder="MacBook Pro"
            required
          />

          <FormInput
            label="Category"
            value={form.category}
            onChange={(value) =>
              updateField("category", value)
            }
            placeholder="Computer"
          />

          <FormInput
            label="Brand"
            value={form.brand}
            onChange={(value) =>
              updateField("brand", value)
            }
            placeholder="Apple"
          />

          <FormInput
            label="Model Number"
            value={form.model_number}
            onChange={(value) =>
              updateField("model_number", value)
            }
            placeholder="M3 Pro"
          />

          <FormInput
            label="Serial Number"
            value={form.serial_number}
            onChange={(value) =>
              updateField("serial_number", value)
            }
            placeholder="Serial number"
          />

          <FormInput
            label="Location"
            value={form.location}
            onChange={(value) =>
              updateField("location", value)
            }
            placeholder="Home Office"
          />

          <FormInput
            label="Purchase Date"
            type="date"
            value={form.purchase_date}
            onChange={(value) =>
              updateField("purchase_date", value)
            }
          />

          <FormInput
            label="Warranty Expiration"
            type="date"
            value={form.warranty_date}
            onChange={(value) =>
              updateField("warranty_date", value)
            }
          />

          <FormInput
            label="Purchase Price"
            type="number"
            value={form.purchase_price}
            onChange={(value) =>
              updateField("purchase_price", value)
            }
            placeholder="1999.00"
            step="0.01"
            min="0"
          />

          <div className="md:col-span-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-text-primary">
                Notes
              </span>

              <textarea
                value={form.notes}
                onChange={(event) =>
                  updateField("notes", event.target.value)
                }
                placeholder="Add notes about this device..."
                className="min-h-32 w-full resize-y rounded-xl border border-border-subtle bg-white px-4 py-3 text-text-primary outline-none focus:border-interaction focus:ring-2 focus:ring-interaction/15"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-border-subtle pt-6 md:col-span-2">
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

              {saving ? "Saving..." : "Save Changes"}
            </Button>

            <Button
              variant="secondary"
              onClick={() =>
                router.push(`/devices/${params.id}`)
              }
            >
              Cancel
            </Button>
          </div>
        </form>
      </PageCard>
    </PageShell>
  );
}

type FormInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  step?: string;
  min?: string;
};

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  step,
  min,
}: FormInputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-text-primary">
        {label}
      </span>

      <input
        type={type}
        value={value}
        required={required}
        step={step}
        min={min}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-xl border border-border-subtle bg-white px-4 py-3 text-text-primary outline-none focus:border-interaction focus:ring-2 focus:ring-interaction/15"
      />
    </label>
  );
}
