// components/calculator/CalculatorModal.tsx
"use client";

import { useEffect, useCallback } from "react";
import CalculatorTabs from "./CalculatorTabs";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CalculatorModal({ open, onClose }: Props) {
  // ✅ إغلاق بـ Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="calculator-title"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="
          relative
          w-full
          sm:w-[600px]
          sm:max-w-[90vw]
          sm:rounded-2xl
          rounded-t-3xl
          bg-background
          shadow-2xl
          animate-in
          slide-in-from-bottom
          sm:slide-in-from-bottom-0
          sm:zoom-in-95
          duration-300
          flex
          flex-col
          max-h-[90vh]
          sm:max-h-[85vh]
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-lg">🧮</span>
            </div>
            <h2
              id="calculator-title"
              className="text-lg font-bold"
            >
              الحاسبة الذكية
            </h2>
          </div>

          <button
            onClick={onClose}
            className="
              w-8 h-8
              rounded-full
              flex items-center justify-center
              text-muted-foreground
              hover:bg-muted
              hover:text-foreground
              transition
              focus:outline-none focus:ring-2 focus:ring-primary
            "
            aria-label="إغلاق"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Drag Handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <CalculatorTabs />
        </div>

        {/* Footer hint */}
        <div className="px-5 py-3 border-t border-border text-center shrink-0">
          <p className="text-xs text-muted-foreground">
            ⚡ الأسعار محدثة لحظياً من مصادر موثوقة
          </p>
        </div>
      </div>
    </div>
  );
}
