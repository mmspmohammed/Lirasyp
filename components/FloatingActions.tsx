"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import CalculatorModal from "./calculator/CalculatorModal";
import NotificationModal from "./NotificationModal";

export default function FloatingActions() {
  const [calcOpen, setCalcOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-4 left-4 z-50 flex flex-col items-center gap-2">
        <button
          onClick={() => setCalcOpen(true)}
          className="h-14 w-14 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center transition hover:scale-110 active:scale-95"
          aria-label="الحاسبة"
        >
          <Calculator className="h-6 w-6" />
        </button>

        <button
          onClick={() => setNotifOpen(true)}
          className="h-14 w-14 rounded-full bg-red-500 text-white shadow-2xl flex items-center justify-center transition hover:scale-110 active:scale-95"
          aria-label="الإشعارات"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
        </button>
      </div>

      <CalculatorModal open={calcOpen} onClose={() => setCalcOpen(false)} />
      <NotificationModal open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
}