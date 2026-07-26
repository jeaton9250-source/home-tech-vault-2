import { createHash } from "crypto";

export function normalizeApnsToken(token: string) {
  return token.trim().replace(/[\s<>]/g, "").toLowerCase();
}

export function hashPushToken(token: string) {
  return createHash("sha256").update(normalizeApnsToken(token)).digest("hex");
}

export function redactPushToken(token: string) {
  const normalized = normalizeApnsToken(token);
  return normalized.length <= 8
    ? "[redacted]"
    : `${normalized.slice(0, 4)}…${normalized.slice(-4)}`;
}
