"use client";

import { useState } from "react";

import { usePermissions } from "@/hooks/usePermissions";
import { useDevelopmentAccess } from "@/hooks/useDevelopmentAccess";

import {
  DEV_ACCESS_PROFILE_OPTIONS,
  DEV_SIMULATION_HOUSEHOLD_ID,
  isDevelopmentEnvironment,
  type DevAccessProfile,
} from "@/lib/permissions/developmentAccess";

import { FEATURE_LABELS } from "@/lib/permissions/features";

import type { FeatureKey } from "@/lib/permissions/types";

function formatLimit(
  value: number | null
): string {
  if (value === null) {
    return "Unlimited";
  }

  return String(value);
}

function enabledFeatures(
  featureAccess: Record<
    FeatureKey,
    boolean
  >
): string[] {
  return (
    Object.entries(featureAccess) as [
      FeatureKey,
      boolean,
    ][]
  )
    .filter(([, enabled]) => enabled)
    .map(
      ([key]) =>
        FEATURE_LABELS[key] ?? key
    );
}

export default function AccessTestingPanel() {
  const [isOpen, setIsOpen] =
    useState(false);

  const {
    profile,
    isOverrideActive,
    profileLabel,
    setProfile,
    resetProfile,
  } = useDevelopmentAccess();

  const permissions = usePermissions();

  if (!isDevelopmentEnvironment()) {
    return null;
  }

  const premiumFeatures =
    enabledFeatures(
      permissions.featureAccess
    );

  const usesSimulatedHousehold =
    isOverrideActive &&
    permissions.realHouseholdId ===
      null &&
    profile.startsWith("family-");

  return (
    <>
      {isOverrideActive && (
        <div
          className="fixed bottom-20 right-4 z-[9998] rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white shadow-lg"
          aria-live="polite"
        >
          Testing: {profileLabel}
        </div>
      )}

      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-[9999] rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg transition hover:bg-slate-800"
        >
          Access Tester
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-4 right-4 z-[9999] w-[min(100vw-2rem,24rem)] rounded-xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-start justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Access Testing Panel
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Development only. Client-side
                simulation — no Supabase,
                Stripe, or membership writes.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setIsOpen(false)
              }
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close access tester"
            >
              ✕
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto px-4 py-3">
            <fieldset className="space-y-1">
              <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                Simulation profile
              </legend>

              {DEV_ACCESS_PROFILE_OPTIONS.map(
                (option) => (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-left transition ${
                      profile === option.id
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="dev-access-profile"
                      value={option.id}
                      checked={
                        profile ===
                        option.id
                      }
                      onChange={() =>
                        setProfile(
                          option.id as DevAccessProfile
                        )
                      }
                      className="mt-0.5"
                    />

                    <span>
                      <span className="block text-sm font-medium text-slate-900">
                        {option.label}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {
                          option.description
                        }
                      </span>
                    </span>
                  </label>
                )
              )}
            </fieldset>

            {usesSimulatedHousehold && (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
                Household access is simulated
                only ({DEV_SIMULATION_HOUSEHOLD_ID}
                ). Shared screens still load
                your real household data when
                you belong to one; otherwise
                use Demo User for sample data.
              </p>
            )}

            <div className="mt-4 space-y-2 rounded-lg bg-slate-50 p-3 text-xs">
              <p className="font-medium text-slate-700">
                Resolved simulation
              </p>

              <dl className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1 text-slate-600">
                <dt>effectivePlan</dt>
                <dd className="font-mono text-slate-900">
                  {
                    permissions.effectivePlan
                  }
                </dd>

                <dt>householdRole</dt>
                <dd className="font-mono text-slate-900">
                  {permissions.householdRole ??
                    "null"}
                </dd>

                <dt>roleDisplayName</dt>
                <dd className="font-mono text-slate-900">
                  {
                    permissions.roleDisplayName
                  }
                </dd>

                <dt>isDemo</dt>
                <dd className="font-mono text-slate-900">
                  {String(
                    permissions.isDemo
                  )}
                </dd>

                <dt>canCreate</dt>
                <dd className="font-mono text-slate-900">
                  {String(
                    permissions.canCreate
                  )}
                </dd>

                <dt>canEdit</dt>
                <dd className="font-mono text-slate-900">
                  {String(
                    permissions.canEdit
                  )}
                </dd>

                <dt>canDelete</dt>
                <dd className="font-mono text-slate-900">
                  {String(
                    permissions.canDelete
                  )}
                </dd>

                <dt>canUpload</dt>
                <dd className="font-mono text-slate-900">
                  {String(
                    permissions.canUpload
                  )}
                </dd>

                <dt>canInvite</dt>
                <dd className="font-mono text-slate-900">
                  {String(
                    permissions.canInvite
                  )}
                </dd>

                <dt>canManageBilling</dt>
                <dd className="font-mono text-slate-900">
                  {String(
                    permissions.canManageBilling
                  )}
                </dd>

                <dt>canManageHousehold</dt>
                <dd className="font-mono text-slate-900">
                  {String(
                    permissions.canManageHousehold
                  )}
                </dd>

                <dt>deviceLimit</dt>
                <dd className="font-mono text-slate-900">
                  {formatLimit(
                    permissions.deviceLimit
                  )}
                </dd>

                <dt>documentLimit</dt>
                <dd className="font-mono text-slate-900">
                  {formatLimit(
                    permissions.documentLimit
                  )}
                </dd>
              </dl>

              <div>
                <p className="mb-1 text-slate-700">
                  Enabled premium features
                </p>
                <p className="text-slate-600">
                  {premiumFeatures.length > 0
                    ? premiumFeatures.join(
                        ", "
                      )
                    : "None"}
                </p>
              </div>

              {isOverrideActive && (
                <p className="text-slate-500">
                  Real household id for data
                  loaders:{" "}
                  <span className="font-mono text-slate-800">
                    {permissions.realHouseholdId ??
                      "null"}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 px-4 py-3">
            <button
              type="button"
              onClick={resetProfile}
              disabled={!isOverrideActive}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reset to Real Account
            </button>
          </div>
        </div>
      )}
    </>
  );
}
