import { NextResponse } from "next/server";

export const IOS_PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
};

export type IosApiErrorCode =
  | "NOT_AUTHENTICATED"
  | "SESSION_EXPIRED"
  | "HOUSEHOLD_REQUIRED"
  | "HOUSEHOLD_ACCESS_DENIED"
  | "ROLE_NOT_ALLOWED"
  | "PAID_PLAN_REQUIRED"
  | "SUBSCRIPTION_INACTIVE"
  | "PAIRING_RATE_LIMITED"
  | "PAIRING_CODE_EXPIRED"
  | "PAIRING_CODE_USED"
  | "PAIRING_NOT_FOUND"
  | "CONNECTOR_NOT_FOUND"
  | "CONNECTOR_REVOKED"
  | "DISCOVERED_DEVICE_NOT_FOUND"
  | "DEVICE_ALREADY_IMPORTED"
  | "BACKEND_UNAVAILABLE"
  | "VALIDATION_FAILED"
  | "INTERNAL_ERROR";

export class IosApiError extends Error {
  constructor(
    readonly code: IosApiErrorCode,
    message: string,
    readonly status = 400,
    readonly details?: Record<string, unknown>
  ) {
    super(message);
  }
}

export function iosJson<T>(body: T, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...IOS_PRIVATE_HEADERS,
      ...init?.headers,
    },
  });
}

export function iosError(
  code: IosApiErrorCode,
  message: string,
  status = 400,
  details?: Record<string, unknown>
) {
  return iosJson(
    {
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    { status }
  );
}

export function iosInternalError(context: string, error: unknown) {
  console.error(
    `[ios-api] ${context}:`,
    error instanceof Error ? error.message : error
  );

  return iosError(
    "INTERNAL_ERROR",
    "Something went wrong. Please try again.",
    500
  );
}

export function iosErrorResponse(error: unknown) {
  if (error instanceof IosApiError) {
    return iosError(
      error.code,
      error.message,
      error.status,
      error.details
    );
  }

  return null;
}
