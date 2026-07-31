"use client";

import {
  useEffect,
  useRef,
} from "react";

import {
  Play,
  X,
} from "lucide-react";

type ProductTourModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function ProductTourModal({
  open,
  onClose,
}: ProductTourModalProps) {
  const videoRef =
    useRef<HTMLVideoElement | null>(
      null
    );

  useEffect(() => {
    if (!open) {
      videoRef.current?.pause();
      return;
    }

    document.body.style.overflow =
      "hidden";

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        "";

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm md:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="Home Tech Vault product tour"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-6xl overflow-hidden rounded-[24px] border border-white/15 bg-black shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-black px-4 py-3 text-white md:px-5">
          <div className="flex items-center gap-2">
            <Play size={17} />

            <p className="text-sm font-semibold">
              Home Tech Vault Product Tour
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Close product tour"
          >
            <X size={18} />
          </button>
        </div>

        <video
          ref={videoRef}
          className="aspect-video w-full bg-black"
          src="/videos/homecore-product-tour.mp4"
          controls
          autoPlay
          playsInline
          preload="metadata"
        >
          Your browser does not support
          the video element.
        </video>
      </div>
    </div>
  );
}
