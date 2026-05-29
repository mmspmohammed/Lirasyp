// components/calculator/FloatingCalculator.tsx

"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import CalculatorModal from "./CalculatorModal";

export default function FloatingCalculator() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="
          fixed
          bottom-5
          left-5
          z-50
          h-14
          w-14
          rounded-full
          bg-primary
          text-white
          shadow-2xl
          backdrop-blur
          transition
          hover:scale-110
          active:scale-95
        "
      >
        <Calculator className="mx-auto h-6 w-6" />
      </button>

      <CalculatorModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
