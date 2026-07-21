"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";

import { createPortal } from "react-dom";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import { useNavMenu } from "@/hooks/useNavMenu";

import { cn } from "@/lib/design-system/cn";

type TriggerRenderProps = {
  ref: RefObject<HTMLButtonElement | null>;
  onClick: () => void;
  "aria-expanded": boolean;
  "aria-controls": string;
  "aria-haspopup": "menu";
  id: string;
};

type DropdownMenuProps = {
  menuId: string;
  trigger: (
    props: TriggerRenderProps
  ) => ReactNode;
  children: ReactNode;
  align?: "start" | "end";
  widthClass?: string;
  className?: string;
  onOpen?: () => void;
};

export default function DropdownMenu({
  menuId,
  trigger,
  children,
  align = "start",
  widthClass = "w-[min(100vw-2rem,320px)]",
  className,
  onOpen,
}: DropdownMenuProps) {
  const panelId = useId();
  const instanceId = useId();
  const triggerRef =
    useRef<HTMLButtonElement>(null);
  const panelRef =
    useRef<HTMLDivElement>(null);

  const {
    isMenuOpen,
    toggleMenu,
    closeMenu,
  } = useNavMenu();

  const open = isMenuOpen(
    menuId,
    instanceId
  );

  const [position, setPosition] =
    useState({ top: 0, left: 0 });

  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      return;
    }

    function updatePosition() {
      const triggerEl =
        triggerRef.current;

      const panelEl =
        panelRef.current;

      if (!triggerEl) {
        return;
      }

      const rect =
        triggerEl.getBoundingClientRect();

      const panelWidth =
        panelEl?.offsetWidth ?? 288;

      let left =
        align === "end"
          ? rect.right - panelWidth
          : rect.left;

      left = Math.max(
        16,
        Math.min(
          left,
          window.innerWidth -
            panelWidth -
            16
        )
      );

      setPosition({
        top: rect.bottom + 8,
        left,
      });
    }

    updatePosition();

    window.addEventListener(
      "resize",
      updatePosition
    );

    window.addEventListener(
      "scroll",
      closeMenu,
      true
    );

    return () => {
      window.removeEventListener(
        "resize",
        updatePosition
      );

      window.removeEventListener(
        "scroll",
        closeMenu,
        true
      );
    };
  }, [open, align, closeMenu]);

  useEffect(() => {
    if (!open) {
      return;
    }

    onOpen?.();

    function handlePointerDown(
      event: MouseEvent
    ) {
      const target =
        event.target as Node;

      if (
        triggerRef.current?.contains(
          target
        )
      ) {
        return;
      }

      if (
        panelRef.current?.contains(
          target
        )
      ) {
        return;
      }

      closeMenu();
    }

    function handleKeyDown(
      event: globalThis.KeyboardEvent
    ) {
      if (event.key === "Escape") {
        closeMenu();

        triggerRef.current?.focus();
      }
    }

    document.addEventListener(
      "mousedown",
      handlePointerDown
    );

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open, closeMenu, onOpen]);

  useEffect(() => {
    if (!open || !panelRef.current) {
      return;
    }

    const firstItem =
      panelRef.current.querySelector<HTMLElement>(
        '[role="menuitem"]'
      );

    firstItem?.focus();
  }, [open]);

  function handlePanelKeyDown(
    event: KeyboardEvent<HTMLDivElement>
  ) {
    const items = Array.from(
      panelRef.current?.querySelectorAll<HTMLElement>(
        '[role="menuitem"]'
      ) ?? []
    );

    if (items.length === 0) {
      return;
    }

    const currentIndex =
      items.indexOf(
        document.activeElement as HTMLElement
      );

    if (event.key === "ArrowDown") {
      event.preventDefault();

      const nextIndex =
        currentIndex < 0
          ? 0
          : (currentIndex + 1) %
            items.length;

      items[nextIndex]?.focus();
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      const nextIndex =
        currentIndex < 0
          ? items.length - 1
          : (currentIndex -
              1 +
              items.length) %
            items.length;

      items[nextIndex]?.focus();
    }

    if (event.key === "Home") {
      event.preventDefault();
      items[0]?.focus();
    }

    if (event.key === "End") {
      event.preventDefault();
      items[
        items.length - 1
      ]?.focus();
    }

    if (
      event.key === "Tab"
    ) {
      closeMenu();
    }
  }

  const triggerProps: TriggerRenderProps =
    {
      ref: triggerRef,
      onClick: () =>
        toggleMenu(menuId, instanceId),
      "aria-expanded": open,
      "aria-controls": panelId,
      "aria-haspopup": "menu",
      id: `${panelId}-trigger`,
    };

  return (
    <>
      {trigger(triggerProps)}

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                ref={panelRef}
                id={panelId}
                role="menu"
                aria-labelledby={`${panelId}-trigger`}
                onKeyDown={
                  handlePanelKeyDown
                }
                initial={{
                  opacity: 0,
                  y: -6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -6,
                }}
                transition={{
                  duration: 0.16,
                  ease: [
                    0.22, 1, 0.36, 1,
                  ],
                }}
                style={{
                  position: "fixed",
                  top: position.top,
                  left: position.left,
                  zIndex: 200,
                }}
                className={cn(
                  "overflow-hidden rounded-[var(--radius-dialog)] border border-border-subtle bg-surface-card shadow-lg",
                  widthClass,
                  className
                )}
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}

export function closeMenuOnSelect(
  closeMenu: () => void
) {
  return () => closeMenu();
}
