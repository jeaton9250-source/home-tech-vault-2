"use client";

import {
  FormEvent,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter, useSearchParams } from "next/navigation";

import {
  CheckCircle2,
  Loader2,
  Upload,
} from "lucide-react";

import OnboardingShell, {
  OnboardingActions,
  OnboardingDescription,
  OnboardingEyebrow,
  OnboardingField,
  OnboardingTitle,
  inputClassName,
} from "@/components/onboarding/OnboardingShell";

import Button from "@/components/ui/Button";

import { usePermissions } from "@/hooks/usePermissions";
import { useHouseholdLimits } from "@/hooks/useHouseholdLimits";

import {
  getDefaultActivityTitle,
  recordActivity,
} from "@/lib/activity";

import { supabase } from "@/lib/supabase";

import {
  applyHouseholdScope,
  withHouseholdInsertFields,
} from "@/lib/data/householdScope";

import {
  buildProgressSummary,
  completeOnboarding,
  getErrorMessage,
  loadOnboardingDataSnapshot,
  loadOnboardingProfile,
  nextStep,
  previousStep,
  resolveResumeStep,
  saveHomeName,
  saveOnboardingStep,
  skipOnboarding,
  trackFirstDeviceAdded,
  trackFirstDocumentUploaded,
  trackNetworkSetupCompleted,
  trackOnboardingCompleted,
  trackOnboardingSkipped,
  trackOnboardingStarted,
  trackOnboardingStepCompleted,
} from "@/lib/onboarding";

import type {
  OnboardingDataSnapshot,
  OnboardingStep,
} from "@/lib/onboarding/types";

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-surface-sunken">
          <div className="flex items-center gap-3 text-text-secondary">
            <Loader2
              size={22}
              className="animate-spin"
            />
            Preparing your setup...
          </div>
        </main>
      }
    >
      <OnboardingFlow />
    </Suspense>
  );
}

function OnboardingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const restart =
    searchParams.get("restart") === "1";

  const {
    user,
    isDemo,
    canCreate,
    canUpload,
    canEdit,
    householdId,
    householdOwnerId,
    hasFamilyFeatureAccess,
    loading: permissionsLoading,
  } = usePermissions();

  const quota = useHouseholdLimits();

  const [initializing, setInitializing] =
    useState(true);

  const [step, setStep] =
    useState<OnboardingStep>("welcome");

  const [profileName, setProfileName] =
    useState("");

  const [snapshot, setSnapshot] =
    useState<OnboardingDataSnapshot | null>(
      null
    );

  const [errorMessage, setErrorMessage] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [homeName, setHomeName] =
    useState("");

  const [deviceName, setDeviceName] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [brand, setBrand] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [modelNumber, setModelNumber] =
    useState("");

  const [purchaseDate, setPurchaseDate] =
    useState("");

  const [warrantyDate, setWarrantyDate] =
    useState("");

  const [deviceCount, setDeviceCount] =
    useState(0);

  const [documentCount, setDocumentCount] =
    useState(0);

  const [devices, setDevices] = useState<
    { id: string; device_name: string }[]
  >([]);

  const [uploadDeviceId, setUploadDeviceId] =
    useState("");

  const [fileType, setFileType] =
    useState("Receipt");

  const [documentName, setDocumentName] =
    useState("");

  const [file, setFile] =
    useState<File | null>(null);

  const [isp, setIsp] = useState("");

  const [routerBrand, setRouterBrand] =
    useState("");

  const [wifiName, setWifiName] =
    useState("");

  const [networkId, setNetworkId] =
    useState<string | null>(null);

  useEffect(() => {
    if (permissionsLoading) {
      return;
    }

    if (isDemo) {
      router.replace("/demo");
      return;
    }

    if (!user) {
      router.replace(
        "/login?redirect=/onboarding"
      );
      return;
    }

    const userId = user.id;

    let mounted = true;

    async function initialize() {
      try {
        setInitializing(true);
        setErrorMessage("");

        const profile =
          await loadOnboardingProfile(
            supabase,
            userId
          );

        if (
          (profile?.onboarding_completed_at ||
            profile?.onboarding_skipped_at) &&
          !restart
        ) {
          router.replace("/dashboard");
          return;
        }

        if (
          !restart &&
          !profile?.onboarding_step &&
          !profile?.onboarding_completed_at &&
          !profile?.onboarding_skipped_at
        ) {
          await saveOnboardingStep(
            supabase,
            userId,
            "welcome"
          );
        }

        const dataSnapshot =
          await loadOnboardingDataSnapshot(
            supabase,
            {
              userId,
              householdId,
              householdOwnerId,
            }
          );

        if (!mounted) {
          return;
        }

        setSnapshot(dataSnapshot);
        setProfileName(
          profile?.full_name?.trim() || ""
        );

        const resumeStep =
          resolveResumeStep(
            dataSnapshot,
            profile?.household_name ??
              null,
            profile?.onboarding_step ??
              null,
            restart
          );

        setStep(resumeStep);

        setHomeName(
          dataSnapshot.sharedHouseholdName ||
            profile?.household_name?.trim() ||
            ""
        );

        setDeviceCount(
          dataSnapshot.deviceCount
        );
        setDocumentCount(
          dataSnapshot.documentCount
        );

        const devicesResult =
          await applyHouseholdScope(
            supabase
              .from("devices")
              .select("id, device_name"),
            householdId,
            userId
          );

        if (!devicesResult.error) {
          const loadedDevices =
            (devicesResult.data ||
              []) as {
              id: string;
              device_name: string;
            }[];

          setDevices(loadedDevices);

          if (loadedDevices[0]?.id) {
            setUploadDeviceId(
              loadedDevices[0].id
            );
          }
        }

        if (dataSnapshot.networkConfigured) {
          const { data: networkRows } =
            await applyHouseholdScope(
              supabase
                .from("network_info")
                .select(
                  "id, isp, router_model, wifi_name"
                )
                .limit(1),
              householdId,
              userId
            );

          const row =
            (networkRows?.[0] as
              | {
                  id: string;
                  isp: string | null;
                  router_model:
                    | string
                    | null;
                  wifi_name:
                    | string
                    | null;
                }
              | undefined) ?? null;

          if (row) {
            setNetworkId(row.id);
            setIsp(row.isp ?? "");
            setRouterBrand(
              row.router_model ?? ""
            );
            setWifiName(
              row.wifi_name ?? ""
            );
          }
        }

        trackOnboardingStarted(restart);
      } catch (error) {
        console.error(
          "Unable to initialize onboarding:",
          error
        );

        if (mounted) {
          setErrorMessage(
            getErrorMessage(
              error,
              "Unable to load onboarding."
            )
          );
        }
      } finally {
        if (mounted) {
          setInitializing(false);
        }
      }
    }

    void initialize();

    return () => {
      mounted = false;
    };
  }, [
    user,
    isDemo,
    permissionsLoading,
    householdId,
    householdOwnerId,
    restart,
    router,
  ]);

  useEffect(() => {
    if (
      step !== "complete" ||
      !user ||
      permissionsLoading
    ) {
      return;
    }

    const userId = user.id;

    let mounted = true;

    async function refreshCompletionData() {
      const dataSnapshot =
        await loadOnboardingDataSnapshot(
          supabase,
          {
            userId,
            householdId,
            householdOwnerId,
          }
        );

      if (mounted) {
        setSnapshot(dataSnapshot);
      }
    }

    void refreshCompletionData();

    return () => {
      mounted = false;
    };
  }, [
    step,
    user,
    permissionsLoading,
    householdId,
    householdOwnerId,
  ]);

  const progressSummary = useMemo(() => {
    if (!snapshot) {
      return null;
    }

    return buildProgressSummary(
      snapshot,
      homeName
    );
  }, [snapshot, homeName]);

  const deviceLimitReached =
    !quota.loading &&
    quota.limits.maxDevices !== null &&
    Math.max(
      deviceCount,
      quota.usage.devices
    ) >= quota.limits.maxDevices;

  const documentLimitReached =
    !quota.loading &&
    quota.limits.maxDocuments !== null &&
    Math.max(
      documentCount,
      quota.usage.documents
    ) >= quota.limits.maxDocuments;

  const sharedHouseholdLocked =
    Boolean(
      snapshot?.hasSharedHousehold &&
        snapshot.sharedHouseholdName
    );

  async function persistStep(
    next: OnboardingStep
  ) {
    if (!user) {
      return;
    }

    await saveOnboardingStep(
      supabase,
      user.id,
      next
    );

    setStep(next);
  }

  async function handleGetStarted() {
    setErrorMessage("");

    try {
      setSubmitting(true);
      trackOnboardingStepCompleted(
        "welcome"
      );
      await persistStep("home");
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Unable to continue."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSkip(
    fromStep: OnboardingStep
  ) {
    if (!user) {
      return;
    }

    setErrorMessage("");

    try {
      setSubmitting(true);
      trackOnboardingSkipped(fromStep);
      await skipOnboarding(
        supabase,
        user.id,
        fromStep
      );
      router.replace("/dashboard");
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Unable to skip onboarding."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleHomeSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!user) {
      return;
    }

    setErrorMessage("");

    if (
      !sharedHouseholdLocked &&
      !homeName.trim()
    ) {
      setErrorMessage(
        "Enter a name for your home."
      );
      return;
    }

    try {
      setSubmitting(true);

      if (!sharedHouseholdLocked) {
        await saveHomeName(
          supabase,
          user.id,
          homeName
        );
      }

      trackOnboardingStepCompleted("home");
      await persistStep("device");
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Unable to save your home name."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeviceSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!user) {
      return;
    }

    setErrorMessage("");

    if (!canCreate) {
      setErrorMessage(
        "Your household role is read-only. You can skip this step for now."
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

    if (!category.trim()) {
      setErrorMessage(
        "Choose a category."
      );
      return;
    }

    if (!brand.trim()) {
      setErrorMessage("Enter a brand.");
      return;
    }

    if (!location.trim()) {
      setErrorMessage(
        "Enter a room or location."
      );
      return;
    }

    try {
      setSubmitting(true);

      const hadDevices =
        deviceCount > 0;

      const { data: createdDevice, error } =
        await supabase
          .from("devices")
          .insert({
            user_id: user.id,
            household_id: householdId,
            device_name:
              deviceName.trim(),
            category:
              category.trim(),
            brand: brand.trim(),
            model_number:
              modelNumber.trim() || null,
            purchase_date:
              purchaseDate || null,
            warranty_date:
              warrantyDate || null,
            location:
              location.trim(),
          })
          .select("id, device_name")
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
        await recordActivity({
          activityType: "device.added",
          title:
            getDefaultActivityTitle(
              "device.added",
              deviceName.trim()
            ),
          description:
            "Device saved during onboarding.",
          userId: user.id,
          householdId,
          deviceId: createdDevice.id,
        });

        setDevices((current) => [
          ...current,
          {
            id: createdDevice.id,
            device_name:
              createdDevice.device_name,
          },
        ]);

        setUploadDeviceId(
          createdDevice.id
        );
      }

      setDeviceCount((count) => count + 1);

      if (!hadDevices) {
        trackFirstDeviceAdded(
          "onboarding"
        );
      }

      trackOnboardingStepCompleted(
        "device"
      );
      await persistStep("document");
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Unable to save your device."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDocumentSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!user) {
      return;
    }

    setErrorMessage("");

    if (!canCreate || !canUpload) {
      setErrorMessage(
        "Your household role is read-only. You can skip this step for now."
      );
      return;
    }

    if (documentLimitReached) {
      if (
        quota.canUseProFeatures ||
        quota.billingManagedByHousehold
      ) {
        router.push("/family");
        return;
      }

      router.push(
        "/upgrade?reason=document-limit"
      );
      return;
    }

    if (!file) {
      setErrorMessage(
        "Choose a file to upload."
      );
      return;
    }

    try {
      setSubmitting(true);

      const hadDocuments =
        documentCount > 0;

      const safeFileName =
        file.name.replace(
          /[^a-zA-Z0-9._-]/g,
          "-"
        );

      const ownerPath =
        householdId || user.id;

      const filePath =
        `${ownerPath}/${uploadDeviceId || "unassigned"}/` +
        `${crypto.randomUUID()}-${safeFileName}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from("documents")
        .upload(filePath, file, {
          upsert: false,
          contentType:
            file.type || undefined,
        });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      const { error: dbError } =
        await supabase
          .from("documents")
          .insert(
            withHouseholdInsertFields(
              {
                device_id:
                  uploadDeviceId || null,
                file_name: file.name,
                document_name:
                  documentName.trim() ||
                  file.name,
                file_url:
                  publicUrlData.publicUrl,
                file_type: fileType,
              },
              householdId,
              user.id
            )
          );

      if (dbError) {
        await supabase.storage
          .from("documents")
          .remove([filePath]);

        throw dbError;
      }

      await recordActivity({
        activityType:
          fileType === "Receipt"
            ? "receipt.uploaded"
            : "document.uploaded",
        title: "Document uploaded",
        description:
          "Saved during onboarding.",
        userId: user.id,
        householdId,
        deviceId:
          uploadDeviceId || null,
      });

      setDocumentCount(
        (count) => count + 1
      );

      if (!hadDocuments) {
        trackFirstDocumentUploaded(
          "onboarding"
        );
      }

      trackOnboardingStepCompleted(
        "document"
      );
      await persistStep("network");
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Unable to upload your document."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleNetworkSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!user) {
      return;
    }

    setErrorMessage("");

    if (!canEdit) {
      setErrorMessage(
        "Your household role is read-only. You can skip this step for now."
      );
      return;
    }

    const trimmedIsp = isp.trim();
    const trimmedRouter =
      routerBrand.trim();
    const trimmedWifi =
      wifiName.trim();

    if (
      !trimmedIsp &&
      !trimmedRouter &&
      !trimmedWifi
    ) {
      setErrorMessage(
        "Add at least one network detail, or skip for now."
      );
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        isp: trimmedIsp || null,
        router_model:
          trimmedRouter || null,
        wifi_name: trimmedWifi || null,
        modem_model: null,
        wifi_password_hint: null,
        guest_network: null,
        admin_url: null,
        speed_download: null,
        speed_upload: null,
        notes: null,
      };

      if (networkId) {
        const { error } =
          await applyHouseholdScope(
            supabase
              .from("network_info")
              .update(payload)
              .eq("id", networkId),
            householdId,
            user.id
          );

        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase
          .from("network_info")
          .insert(
            withHouseholdInsertFields(
              payload,
              householdId,
              user.id
            )
          );

        if (error) {
          throw error;
        }
      }

      trackNetworkSetupCompleted(
        "onboarding"
      );
      trackOnboardingStepCompleted(
        "network"
      );
      await persistStep("complete");
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Unable to save network details."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFinish() {
    if (!user) {
      return;
    }

    setErrorMessage("");

    try {
      setSubmitting(true);
      await completeOnboarding(
        supabase,
        user.id
      );
      trackOnboardingCompleted();
      router.replace("/dashboard");
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Unable to finish onboarding."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function goBack() {
    const prior = previousStep(step);

    setErrorMessage("");

    try {
      await persistStep(prior);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Unable to go back."
        )
      );
    }
  }

  async function skipCurrentStep() {
    if (!user) {
      return;
    }

    setErrorMessage("");

    try {
      setSubmitting(true);

      if (step === "complete") {
        await handleFinish();
        return;
      }

      trackOnboardingStepCompleted(step);
      await persistStep(nextStep(step));
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Unable to continue."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (
    permissionsLoading ||
    initializing
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface-sunken">
        <div className="flex items-center gap-3 text-text-secondary">
          <Loader2
            size={22}
            className="animate-spin"
          />
          Preparing your setup...
        </div>
      </main>
    );
  }

  return (
    <OnboardingShell step={step}>
      {errorMessage && (
        <div
          className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      {step === "welcome" && (
        <>
          <OnboardingEyebrow>
            Welcome home
          </OnboardingEyebrow>

          <OnboardingTitle>
            Welcome to Home Tech Vault
            {profileName
              ? `, ${profileName.split(" ")[0]}`
              : ""}
            .
          </OnboardingTitle>

          <OnboardingDescription>
            Let&apos;s create one organized
            place for your home&apos;s
            technology. You can track
            devices, documents, warranties,
            and more — starting with the
            basics.
          </OnboardingDescription>

          <p className="mt-4 text-sm text-text-tertiary">
            Estimated setup time: about 3
            minutes
          </p>

          <OnboardingActions>
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                void handleSkip("welcome")
              }
              disabled={submitting}
            >
              Skip for now
            </Button>

            <Button
              type="button"
              onClick={() =>
                void handleGetStarted()
              }
              disabled={submitting}
            >
              {submitting ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : null}
              Get Started
            </Button>
          </OnboardingActions>
        </>
      )}

      {step === "home" && (
        <form
          onSubmit={handleHomeSubmit}
        >
          <OnboardingEyebrow>
            Your home
          </OnboardingEyebrow>

          <OnboardingTitle>
            Name your home
          </OnboardingTitle>

          <OnboardingDescription>
            This label helps personalize
            your vault. It does not create
            a shared household unless you
            later invite family members.
          </OnboardingDescription>

          {sharedHouseholdLocked ? (
            <div className="mt-6 rounded-2xl border border-border-subtle bg-surface-sunken p-4">
              <p className="text-sm font-medium text-text-primary">
                Shared household
              </p>

              <p className="mt-1 text-sm text-text-secondary">
                You&apos;re already part of{" "}
                <strong>
                  {
                    snapshot?.sharedHouseholdName
                  }
                </strong>
                . We&apos;ll use that
                household for your vault.
              </p>
            </div>
          ) : (
            <div className="mt-6">
              <OnboardingField
                label="Home name"
                htmlFor="home-name"
                required
              >
                <input
                  id="home-name"
                  value={homeName}
                  onChange={(event) =>
                    setHomeName(
                      event.target.value
                    )
                  }
                  placeholder="Eaton Residence"
                  className={
                    inputClassName
                  }
                  autoComplete="organization"
                />
              </OnboardingField>

              <p className="mt-2 text-xs text-text-tertiary">
                Examples: My Home, Beach
                House, Apartment
              </p>
            </div>
          )}

          <OnboardingActions>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  void goBack()
                }
                disabled={submitting}
              >
                Back
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  void handleSkip("home")
                }
                disabled={submitting}
              >
                Skip for now
              </Button>
            </div>

            <Button
              type="submit"
              disabled={submitting}
            >
              Continue
            </Button>
          </OnboardingActions>
        </form>
      )}

      {step === "device" && (
        <form
          onSubmit={handleDeviceSubmit}
        >
          <OnboardingEyebrow>
            Start with one device
          </OnboardingEyebrow>

          <OnboardingTitle>
            Add your first device
          </OnboardingTitle>

          <OnboardingDescription>
            Pick something important — a
            laptop, TV, router, or
            appliance. You can add more
            later.
          </OnboardingDescription>

          {deviceLimitReached && (
            <div className="mt-6 rounded-2xl border border-warning/40 bg-warning-soft p-4 text-sm text-text-secondary">
              {quota.canUseProFeatures
                ? "This household has reached its device limit. Skip this step for now or contact a household admin."
                : "This household has reached the Free plan device limit. Upgrade the household for unlimited devices, or skip this step for now."}
            </div>
          )}

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <OnboardingField
              label="Device name"
              htmlFor="device-name"
              required
            >
              <input
                id="device-name"
                value={deviceName}
                onChange={(event) =>
                  setDeviceName(
                    event.target.value
                  )
                }
                className={inputClassName}
                placeholder="MacBook Pro"
              />
            </OnboardingField>

            <OnboardingField
              label="Category"
              htmlFor="device-category"
              required
            >
              <input
                id="device-category"
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value
                  )
                }
                className={inputClassName}
                placeholder="Computer"
              />
            </OnboardingField>

            <OnboardingField
              label="Brand"
              htmlFor="device-brand"
              required
            >
              <input
                id="device-brand"
                value={brand}
                onChange={(event) =>
                  setBrand(
                    event.target.value
                  )
                }
                className={inputClassName}
                placeholder="Apple"
              />
            </OnboardingField>

            <OnboardingField
              label="Room or location"
              htmlFor="device-location"
              required
            >
              <input
                id="device-location"
                value={location}
                onChange={(event) =>
                  setLocation(
                    event.target.value
                  )
                }
                className={inputClassName}
                placeholder="Office"
              />
            </OnboardingField>

            <OnboardingField
              label="Model"
              htmlFor="device-model"
            >
              <input
                id="device-model"
                value={modelNumber}
                onChange={(event) =>
                  setModelNumber(
                    event.target.value
                  )
                }
                className={inputClassName}
              />
            </OnboardingField>

            <OnboardingField
              label="Purchase date"
              htmlFor="device-purchase-date"
            >
              <input
                id="device-purchase-date"
                type="date"
                value={purchaseDate}
                onChange={(event) =>
                  setPurchaseDate(
                    event.target.value
                  )
                }
                className={inputClassName}
              />
            </OnboardingField>

            <OnboardingField
              label="Warranty date"
              htmlFor="device-warranty-date"
            >
              <input
                id="device-warranty-date"
                type="date"
                value={warrantyDate}
                onChange={(event) =>
                  setWarrantyDate(
                    event.target.value
                  )
                }
                className={inputClassName}
              />
            </OnboardingField>
          </div>

          <OnboardingActions>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  void goBack()
                }
                disabled={submitting}
              >
                Back
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  void skipCurrentStep()
                }
                disabled={submitting}
              >
                Skip for now
              </Button>
            </div>

            <Button
              type="submit"
              disabled={
                submitting ||
                deviceLimitReached
              }
            >
              Save device
            </Button>
          </OnboardingActions>
        </form>
      )}

      {step === "document" && (
        <form
          onSubmit={handleDocumentSubmit}
        >
          <OnboardingEyebrow>
            Protect something important
          </OnboardingEyebrow>

          <OnboardingTitle>
            Upload one useful item
          </OnboardingTitle>

          <OnboardingDescription>
            Protect the information you may
            need later — a receipt,
            warranty, manual, or device
            photo.
          </OnboardingDescription>

          {documentLimitReached && (
            <div className="mt-6 rounded-2xl border border-warning/40 bg-warning-soft p-4 text-sm text-text-secondary">
              {quota.canUseProFeatures
                ? "This household has reached its document limit. Skip this step for now or contact a household admin."
                : "This household has reached the Free plan document limit. Upgrade the household for unlimited uploads, or skip this step for now."}
            </div>
          )}

          <div className="mt-6 space-y-5">
            {devices.length > 0 && (
              <OnboardingField
                label="Link to device"
                htmlFor="document-device"
              >
                <select
                  id="document-device"
                  value={uploadDeviceId}
                  onChange={(event) =>
                    setUploadDeviceId(
                      event.target.value
                    )
                  }
                  className={inputClassName}
                >
                  <option value="">
                    Unassigned
                  </option>

                  {devices.map((device) => (
                    <option
                      key={device.id}
                      value={device.id}
                    >
                      {device.device_name}
                    </option>
                  ))}
                </select>
              </OnboardingField>
            )}

            <OnboardingField
              label="Document type"
              htmlFor="document-type"
            >
              <select
                id="document-type"
                value={fileType}
                onChange={(event) =>
                  setFileType(
                    event.target.value
                  )
                }
                className={inputClassName}
              >
                <option value="Receipt">
                  Receipt
                </option>
                <option value="Warranty">
                  Warranty
                </option>
                <option value="Manual">
                  Manual
                </option>
                <option value="Photo">
                  Device photo
                </option>
              </select>
            </OnboardingField>

            <OnboardingField
              label="Document name"
              htmlFor="document-name"
            >
              <input
                id="document-name"
                value={documentName}
                onChange={(event) =>
                  setDocumentName(
                    event.target.value
                  )
                }
                className={inputClassName}
                placeholder="Purchase receipt"
              />
            </OnboardingField>

            <OnboardingField
              label="File"
              htmlFor="document-file"
            >
              <input
                id="document-file"
                type="file"
                onChange={(event) =>
                  setFile(
                    event.target.files?.[0] ??
                      null
                  )
                }
                className={inputClassName}
              />
            </OnboardingField>
          </div>

          <OnboardingActions>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  void goBack()
                }
                disabled={submitting}
              >
                Back
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  void skipCurrentStep()
                }
                disabled={submitting}
              >
                Skip for now
              </Button>
            </div>

            <Button
              type="submit"
              disabled={
                submitting ||
                documentLimitReached
              }
            >
              <Upload size={17} />
              Upload
            </Button>
          </OnboardingActions>
        </form>
      )}

      {step === "network" && (
        <form
          onSubmit={handleNetworkSubmit}
        >
          <OnboardingEyebrow>
            Connect the basics
          </OnboardingEyebrow>

          <OnboardingTitle>
            Add basic network details
          </OnboardingTitle>

          <OnboardingDescription>
            Save the essentials — no
            passwords required. You can
            add more detail later from
            Network.
          </OnboardingDescription>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <OnboardingField
              label="Internet provider"
              htmlFor="network-isp"
            >
              <input
                id="network-isp"
                value={isp}
                onChange={(event) =>
                  setIsp(event.target.value)
                }
                className={inputClassName}
                placeholder="Comcast"
              />
            </OnboardingField>

            <OnboardingField
              label="Router brand"
              htmlFor="network-router"
            >
              <input
                id="network-router"
                value={routerBrand}
                onChange={(event) =>
                  setRouterBrand(
                    event.target.value
                  )
                }
                className={inputClassName}
                placeholder="Eero"
              />
            </OnboardingField>

            <OnboardingField
              label="Network name"
              htmlFor="network-name"
            >
              <input
                id="network-name"
                value={wifiName}
                onChange={(event) =>
                  setWifiName(
                    event.target.value
                  )
                }
                className={inputClassName}
                placeholder="Home-Network"
              />
            </OnboardingField>
          </div>

          <OnboardingActions>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  void goBack()
                }
                disabled={submitting}
              >
                Back
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  void skipCurrentStep()
                }
                disabled={submitting}
              >
                Skip for now
              </Button>
            </div>

            <Button
              type="submit"
              disabled={submitting}
            >
              Save network details
            </Button>
          </OnboardingActions>
        </form>
      )}

      {step === "complete" && (
        <>
          <OnboardingEyebrow>
            You&apos;re ready
          </OnboardingEyebrow>

          <OnboardingTitle>
            Your Home Tech Vault is ready
          </OnboardingTitle>

          <OnboardingDescription>
            Here&apos;s what you set up.
            You can always add more from
            your dashboard.
          </OnboardingDescription>

          <ul className="mt-8 space-y-3">
            <ProgressItem
              label="Home named"
              complete={
                progressSummary?.householdNamed ??
                false
              }
            />

            <ProgressItem
              label="Devices added"
              complete={
                (progressSummary?.devicesAdded ??
                  0) > 0
              }
              detail={`${progressSummary?.devicesAdded ?? 0} device${(progressSummary?.devicesAdded ?? 0) === 1 ? "" : "s"}`}
            />

            <ProgressItem
              label="Documents added"
              complete={
                (progressSummary?.documentsAdded ??
                  0) > 0
              }
              detail={`${progressSummary?.documentsAdded ?? 0} document${(progressSummary?.documentsAdded ?? 0) === 1 ? "" : "s"}`}
            />

            <ProgressItem
              label="Network added"
              complete={
                progressSummary?.networkAdded ??
                false
              }
            />
          </ul>

          {hasFamilyFeatureAccess && (
            <p className="mt-6 text-sm leading-6 text-text-secondary">
              Invite family later from the
              Family section when you&apos;re
              ready to share your vault.
            </p>
          )}

          <OnboardingActions>
            <Button
              href="/devices"
              variant="ghost"
            >
              Explore Devices
            </Button>

            <Button
              type="button"
              onClick={() =>
                void handleFinish()
              }
              disabled={submitting}
            >
              Go to Home Pulse
            </Button>
          </OnboardingActions>
        </>
      )}
    </OnboardingShell>
  );
}

function ProgressItem({
  label,
  complete,
  detail,
}: {
  label: string;
  complete: boolean;
  detail?: string;
}) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface-sunken px-4 py-3">
      <CheckCircle2
        size={18}
        className={
          complete
            ? "text-home-health"
            : "text-text-tertiary"
        }
        aria-hidden="true"
      />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text-primary">
          {label}
        </p>

        {detail && (
          <p className="text-xs text-text-secondary">
            {detail}
          </p>
        )}
      </div>

      <span className="sr-only">
        {complete
          ? "Completed"
          : "Not completed"}
      </span>
    </li>
  );
}
