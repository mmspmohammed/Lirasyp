"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import CalculatorModal from "./calculator/CalculatorModal";

export default function FloatingActions() {
  const [calcOpen, setCalcOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => setCalcOpen(true)}
          className="h-14 w-14 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center transition hover:scale-110 active:scale-95"
          aria-label="الحاسبة"
          title="الحاسبة"
        >
          <Calculator className="h-6 w-6" />
        </button>
      </div>
      <CalculatorModal open={calcOpen} onClose={() => setCalcOpen(false)} />
    </>
  );
}
