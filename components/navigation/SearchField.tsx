"use client";

import {
  FormEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";

import { Search, X } from "lucide-react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";

import { cn } from "@/lib/design-system/cn";

type SearchFieldProps = {
  className?: string;
  compact?: boolean;
  /** Always-visible search bar for desktop header */
  prominent?: boolean;
  /** Icon button that opens an expandable search popover */
  collapsible?: boolean;
  autoFocus?: boolean;
  onClose?: () => void;
};

export default function SearchField({
  className,
  compact = false,
  prominent = false,
  collapsible = false,
  autoFocus = false,
  onClose,
}: SearchFieldProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({
    top: 0,
    right: 12,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    // Client-only portal mount (document.body is unavailable during SSR).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration gate for portal
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!collapsible || !open) {
      return;
    }

    function updatePosition() {
      const rect =
        triggerRef.current?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      setPosition({
        top: rect.bottom + 8,
        right: Math.max(
          12,
          window.innerWidth - rect.right
        ),
      });
    }

    updatePosition();

    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (triggerRef.current?.contains(target)) {
        return;
      }

      if (panelRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
      onClose?.();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        onClose?.();
        triggerRef.current?.focus();
      }
    }

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener(
        "scroll",
        updatePosition,
        true
      );
      document.removeEventListener(
        "mousedown",
        handlePointerDown
      );
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [collapsible, open, onClose]);

  useEffect(() => {
    if (!autoFocus || collapsible) {
      return;
    }

    inputRef.current?.focus();
  }, [autoFocus, collapsible]);

  function runSearch() {
    const query = search.trim();

    if (!query) {
      return;
    }

    router.push(
      `/smart-search?q=${encodeURIComponent(query)}`
    );

    if (collapsible) {
      setOpen(false);
      onClose?.();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runSearch();
  }

  function clearSearch() {
    setSearch("");

    if (pathname === "/smart-search") {
      router.push("/smart-search");
    }

    inputRef.current?.focus();
  }

  const placeholder = prominent
    ? "Search anything in your home..."
    : "Search anything in your home...";

  const searchForm = (
    <form
      onSubmit={handleSubmit}
      className={cn("w-full", !collapsible && className)}
    >
      <div className="relative">
        <Search
          size={prominent ? 20 : 18}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary"
        />

        <input
          ref={inputRef}
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={placeholder}
          className={cn(
            "htv-focus-ring w-full rounded-[var(--radius-input)] border border-border-subtle bg-surface-sunken text-text-primary outline-none focus:border-interaction",
            prominent
              ? "py-3 pl-11 pr-11 text-[0.9375rem] shadow-[var(--shadow-sm)]"
              : "py-2.5 pl-10 pr-10 text-sm",
            compact && !prominent && "py-2"
          )}
          aria-label="Search your home"
        />

        {search ? (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-text-tertiary hover:bg-surface-card hover:text-text-primary"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>
    </form>
  );

  if (prominent) {
    return searchForm;
  }

  if (!collapsible) {
    return searchForm;
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "htv-focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-border-subtle bg-surface-card text-text-primary transition hover:bg-surface-sunken",
          className
        )}
        aria-label="Search your home"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
      >
        <Search size={18} />
      </button>

      {mounted
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  ref={panelRef}
                  id={panelId}
                  role="dialog"
                  aria-label="Search your home"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{
                    duration: 0.16,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{
                    position: "fixed",
                    top: position.top,
                    right: position.right,
                    zIndex: 200,
                  }}
                  className="w-[min(360px,calc(100vw-24px))] rounded-[var(--radius-dialog)] border border-border-subtle bg-surface-card p-3 shadow-lg"
                >
                  {searchForm}
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body
          )
        : null}
    </>
  );
}
