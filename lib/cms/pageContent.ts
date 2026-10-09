import { z } from "zod";
import baseCatalog from "./pageCatalog.json";
import launchCatalog from "./launchPageCatalog.json";
const catalog = {
  definitions: { ...baseCatalog.definitions, ...launchCatalog.definitions },
  pages: { ...baseCatalog.pages, ...launchCatalog.pages },
};
import { safeLink } from "./links";
export type PageField = {
  id: string;
  kind: string;
  value: string;
  section: string;
};
const definitions: Record<string, PageField> = catalog.definitions;
export const pageCatalog: Record<
  string,
  { label: string; fields: PageField[] }
> = Object.fromEntries(
  Object.entries(catalog.pages).map(([path, page]) => [
    path,
    { label: page.label, fields: page.fields.map((id) => definitions[id]) },
  ]),
);
export type PageOverrides = Record<string, Record<string, string>>;
export function contentId(scope: string, kind: string, value: string) {
  let hash = 2166136261;
  for (const char of `${scope}|${kind}|${value}`)
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return `${kind}_${(hash >>> 0).toString(36)}`;
}
export const pageOverridesSchema = z
  .record(z.string(), z.record(z.string(), z.string().max(5000)))
  .superRefine((pages, context) => {
    for (const [path, values] of Object.entries(pages)) {
      const page = pageCatalog[path];
      if (!page) {
        context.addIssue({
          code: "custom",
          path: [path],
          message: "Choose an editable public page.",
        });
        continue;
      }
      const fields = new Map(page.fields.map((field) => [field.id, field]));
      for (const [key, value] of Object.entries(values)) {
        const field = fields.get(key);
        if (!field)
          context.addIssue({
            code: "custom",
            path: [path, key],
            message: "Unknown page field.",
          });
        else if (field.kind === "image" && !safeLink.safeParse(value).success)
          context.addIssue({
            code: "custom",
            path: [path, key],
            message: "Use a site image path or HTTPS image URL.",
          });
      }
    }
  });
