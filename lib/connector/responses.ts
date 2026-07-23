import { NextResponse } from "next/server";

export const CONNECTOR_PRIVATE_HEADERS = {
  "Cache-Control":
    "private, no-store, max-age=0",
};

export function connectorJsonResponse<T>(
  body: T,
  init?: ResponseInit
) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...CONNECTOR_PRIVATE_HEADERS,
      ...init?.headers,
    },
  });
}

export function connectorErrorResponse(
  message: string,
  status: number
) {
  return connectorJsonResponse(
    { error: message },
    { status }
  );
}

export function connectorServerErrorResponse() {
  return connectorErrorResponse(
    "Something went wrong. Please try again.",
    500
  );
}
