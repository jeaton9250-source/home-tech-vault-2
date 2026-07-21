"use client";

import {
  formatFoundingMemberJoinedLabel,
  useFoundingMemberStatus,
} from "@/hooks/useFoundingMemberStatus";

type FoundingMemberBadgeProps = {
  compact?: boolean;
  className?: string;
};

export default function FoundingMemberBadge({
  compact = false,
  className = "",
}: FoundingMemberBadgeProps) {
  const {
    isFoundingMember,
    memberNumber,
    enrolledAt,
    loading,
  } = useFoundingMemberStatus();

  if (loading || !isFoundingMember) {
    return null;
  }

  const joinedLabel =
    formatFoundingMemberJoinedLabel(enrolledAt);

  return (
    <div
      className={`inline-flex flex-col gap-0.5 rounded-full border border-[#D8CFC0] bg-[#F7F3EA] px-3 py-1.5 text-left ${className}`}
    >
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5C5348]">
        Founding Member
      </span>
      {!compact && joinedLabel ? (
        <span className="text-xs text-[#6B6258]">
          Member #{memberNumber} · {joinedLabel}
        </span>
      ) : (
        <span className="text-xs text-[#6B6258]">
          Member #{memberNumber}
        </span>
      )}
    </div>
  );
}
