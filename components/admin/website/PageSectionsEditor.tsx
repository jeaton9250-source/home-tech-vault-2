"use client";
import { useMemo, useState } from "react";
import { pageCatalog, type PageOverrides } from "@/lib/cms/pageContent";
import ImageLibrary from "./ImageLibrary";
const inputClass =
  "mt-2 w-full rounded-xl border border-border-subtle bg-surface-card p-3 text-text-primary focus:outline-2 focus:outline-interaction";
export default function PageSectionsEditor({
  pages,
  onChange,
  onPreview,
}: {
  pages: PageOverrides;
  onChange: (pages: PageOverrides) => void;
  onPreview: (path: string) => void;
}) {
  const [path, setPath] = useState("/");
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("all");
  const [imageTarget, setImageTarget] = useState<string | null>(null);
  const [showChanged, setShowChanged] = useState(false);
  const [limit, setLimit] = useState(30);
  const values = pages[path] ?? {};
  const fields = useMemo(
    () =>
      pageCatalog[path].fields.filter(
        (field) =>
          (kind === "all" || field.kind === kind) &&
          (!showChanged || Object.hasOwn(pages[path] ?? {}, field.id)) &&
          `${field.value} ${field.section}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [path, kind, search, pages, showChanged],
  );
  function update(id: string, value: string) {
    onChange({ ...pages, [path]: { ...values, [id]: value } });
  }
  function reset(id: string) {
    const next = { ...values };
    delete next[id];
    onChange({ ...pages, [path]: next });
  }
  const target = pageCatalog[path].fields.find(
    (field) => field.id === imageTarget,
  );
  return (
    <div className="space-y-6">
      <p className="text-sm text-text-secondary">
        Edit a page’s wording and images. Original content stays in place unless
        you change a field. Save a draft or publish below. Homepage headline and
        main button settings remain in the Homepage tab; resource article text
        remains in Resource articles.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        <label>
          Page
          <select
            className={inputClass}
            value={path}
            onChange={(event) => {
              setPath(event.target.value);
              setImageTarget(null);
              setSearch("");
              setLimit(30);
            }}
          >
            {Object.entries(pageCatalog).map(([route, page]) => (
              <option key={route} value={route}>
                {page.label} · {route}
              </option>
            ))}
          </select>
        </label>
        <label>
          Show
          <select
            className={inputClass}
            value={kind}
            onChange={(event) => setKind(event.target.value)}
          >
            <option value="all">Wording and images</option>
            <option value="text">Wording</option>
            <option value="image">Images</option>
          </select>
        </label>
        <label>
          Find content
          <input
            className={inputClass}
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search the existing wording…"
          />
        </label>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showChanged}
            onChange={(event) => setShowChanged(event.target.checked)}
          />
          Only edited fields
        </label>
        <button
          type="button"
          onClick={() => onPreview(path)}
          className="rounded-xl border px-4 py-2"
        >
          Preview this page
        </button>
        <a href={path} target="_blank" rel="noreferrer" className="underline">
          View this page ↗
        </a>
      </div>
      {target ? (
        <section className="rounded-2xl border border-border-subtle p-4">
          <h3 className="font-semibold">Choose an image for this field</h3>
          <img
            src={values[target.id] ?? target.value}
            alt="Current image selected for editing"
            className="mt-3 max-h-44 rounded-xl object-contain"
          />
          <button
            type="button"
            className="mt-3 underline"
            onClick={() => setImageTarget(null)}
          >
            Close image picker
          </button>
          <ImageLibrary
            onSelect={(url) => {
              update(target.id, url);
              setImageTarget(null);
            }}
          />
        </section>
      ) : null}
      <p role="status" className="text-sm text-text-muted">
        {fields.length} matching fields
      </p>
      <div className="space-y-4">
        {fields.slice(0, limit).map((field) => (
          <details
            key={`${path}:${field.id}`}
            className="rounded-2xl border border-border-subtle p-4"
          >
            <summary className="cursor-pointer font-medium">
              {field.kind === "image" ? "Image" : "Text"}:{" "}
              {field.kind === "image"
                ? field.value.split("/").pop()?.split("?")[0]
                : field.value.slice(0, 100)}
              {Object.hasOwn(values, field.id) ? " · Edited" : ""}
            </summary>
            <label className="mt-4 block">
              {field.kind === "image" ? "Image URL" : "Wording"}
              {field.kind === "image" ? (
                <input
                  className={inputClass}
                  value={values[field.id] ?? field.value}
                  onChange={(event) => update(field.id, event.target.value)}
                />
              ) : (
                <textarea
                  rows={field.value.length > 200 ? 5 : 2}
                  className={inputClass}
                  maxLength={5000}
                  value={values[field.id] ?? field.value}
                  onChange={(event) => update(field.id, event.target.value)}
                />
              )}
            </label>
            {field.kind === "image" ? (
              <>
                <img
                  src={values[field.id] ?? field.value}
                  alt="Image preview"
                  className="mt-3 max-h-48 max-w-full rounded-xl object-contain"
                  loading="lazy"
                />
                <button
                  type="button"
                  className="mt-3 rounded-xl border px-4 py-2"
                  onClick={() => setImageTarget(field.id)}
                >
                  Upload or choose image
                </button>
              </>
            ) : null}
            <button
              type="button"
              className="ml-4 mt-3 underline"
              onClick={() => reset(field.id)}
            >
              Restore this field
            </button>
          </details>
        ))}
        {fields.length > limit ? (
          <button
            type="button"
            className="rounded-xl border px-4 py-2"
            onClick={() => setLimit((current) => current + 30)}
          >
            Show more fields
          </button>
        ) : null}
        {fields.length === 0 ? (
          <p>No matching fields. Try a different search or filter.</p>
        ) : null}
      </div>
    </div>
  );
}
