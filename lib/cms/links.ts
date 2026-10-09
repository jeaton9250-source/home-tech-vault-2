import { z } from "zod";
export const safeLink = z
  .string()
  .trim()
  .max(2000)
  .refine(
    (value) =>
      /^\/(?!\/|\\)[^\\]*$/.test(value) ||
      (() => {
        try {
          const u = new URL(value);
          return u.protocol === "https:" && !u.username && !u.password;
        } catch {
          return false;
        }
      })(),
    "Use a site path or HTTPS URL.",
  );
