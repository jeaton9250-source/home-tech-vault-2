export const DELETION_REASONS = [
  {
    id: "customer_request",
    label: "Customer request",
  },
  {
    id: "fraud_abuse",
    label: "Fraud or abuse",
  },
  {
    id: "duplicate_account",
    label: "Duplicate account",
  },
  {
    id: "terms_violation",
    label: "Terms violation",
  },
  {
    id: "data_cleanup",
    label: "Data cleanup / test account",
  },
  {
    id: "other",
    label: "Other (document in notes)",
  },
] as const;

export type DeletionReasonId =
  (typeof DELETION_REASONS)[number]["id"];
