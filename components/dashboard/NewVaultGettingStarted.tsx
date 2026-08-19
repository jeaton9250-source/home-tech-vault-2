"use client";

/*
 * The first-time dashboard experience is now handled
 * by DashboardUnlockGate.
 *
 * Keep this compatibility component in place so any
 * existing imports do not break while the dashboard
 * transition is rolled out.
 */
export default function NewVaultGettingStarted(
  _props: {
    [key: string]: unknown;
  }
) {
  return null;
}
