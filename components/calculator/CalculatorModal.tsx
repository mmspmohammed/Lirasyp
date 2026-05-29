// components/calculator/CalculatorModal.tsx

"use client";

import CalculatorTabs from "./CalculatorTabs";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CalculatorModal({
  open,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div
        className="
          absolute
          bottom-0
          left-0
          right-0
          h-[90vh]
          rounded-t-3xl
          bg-background
          p-4
          shadow-2xl
          animate-in
          slide-in-from-bottom
        "
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            الحاسبة
          </h2>

          <button
            onClick={onClose}
            className="text-2xl"
          >
            ×
          </button>
        </div>

        <CalculatorTabs />
      </div>
    </div>
  );
}
