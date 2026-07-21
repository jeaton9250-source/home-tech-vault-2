export const SUPPORT_FIELD_LIMITS = {
  nameMin: 1,
  nameMax: 100,
  subjectMin: 3,
  subjectMax: 200,
  messageMin: 10,
  messageMax: 5000,
  sourcePageMax: 500,
  honeypotMax: 0,
} as const;

export const SUPPORT_RATE_LIMITS = {
  duplicateWindowMs: 2 * 60 * 1000,
  maxSubmissionsPerEmailPerHour: 5,
  maxSubmissionsPerIpPerHour: 8,
} as const;
