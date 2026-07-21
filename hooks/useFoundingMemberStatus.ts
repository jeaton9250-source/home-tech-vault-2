"use client";

import { useEffect, useState } from "react";

import type { SafeFoundingMemberSummary } from "@/lib/founding-members/types";

const EMPTY_SUMMARY: SafeFoundingMemberSummary = {
  isFoundingMember: false,
  memberNumber: null,
  status: null,
  enrolledAt: null,
};

export function useFoundingMemberStatus(enabled = true) {
  const [summary, setSummary] =
    useState<SafeFoundingMemberSummary>(
      EMPTY_SUMMARY
    );
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(
          "/api/user/founding-member"
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load founding member status."
          );
        }

        const payload =
          (await response.json()) as SafeFoundingMemberSummary;

        if (!cancelled) {
          setSummary(payload);
        }
      } catch {
        if (!cancelled) {
          setSummary(EMPTY_SUMMARY);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return {
    ...summary,
    loading,
  };
}

export function formatFoundingMemberJoinedLabel(
  enrolledAt: string | null
) {
  if (!enrolledAt) {
    return null;
  }

  const date = new Date(enrolledAt);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return `Joined ${date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  })}`;
}
