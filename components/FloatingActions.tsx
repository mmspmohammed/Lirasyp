// components/FloatingActions.tsx
"use client";

import { useState, useCallback } from "react";
import { Calculator, Bell, Wallet } from "lucide-react";
import Link from "next/link";
import CalculatorModal from "./calculator/CalculatorModal";
import NotificationModal from "./NotificationModal";

export default function FloatingActions() {
  const [calcOpen, setCalcOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  const showLabel = useCallback((text: string) => {
    setActiveLabel(text);
    const timer = setTimeout(() => {
      setActiveLabel((curr) => (curr === text ? null : curr));
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-3">
        {/* الحاسبة */}
        <div className="relative group">
          <button
            onClick={() => setCalcOpen(true)}
            onMouseEnter={() => showLabel("الحاسبة")}
            className="h-14 w-14 rounded-full bg-primary text-white shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-2xl active:scale-95"
            aria-label="الحاسبة"
          >
            <Calculator className="h-6 w-6" />
          </button>
          <span
            className={`absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-lg bg-card/95 backdrop-blur border border-border shadow-lg text-sm font-medium whitespace-nowrap transition-all duration-300 pointer-events-none ${
              activeLabel === "الحاسبة"
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-2"
            }`}
          >
            الحاسبة
          </span>
        </div>

        {/* الإشعارات */}
        <div className="relative group">
          <button
            onClick={() => setNotifOpen(true)}
            onMouseEnter={() => showLabel("الإشعارات")}
            className="h-14 w-14 rounded-full bg-red-500 text-white shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-2xl active:scale-95"
            aria-label="الإشعارات"
          >
            <Bell className="h-6 w-6" />
          </button>
          <span
            className={`absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-lg bg-card/95 backdrop-blur border border-border shadow-lg text-sm font-medium whitespace-nowrap transition-all duration-300 pointer-events-none ${
              activeLabel === "الإشعارات"
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-2"
            }`}
          >
            الإشعارات
          </span>
        </div>

        {/* المدخرات */}
        <div className="relative group">
          <Link
            href="/savings"
            onMouseEnter={() => showLabel("مدخراتي")}
            className="h-14 w-14 rounded-full bg-green-500 text-white shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-2xl active:scale-95"
            aria-label="مدخراتي"
          >
            <Wallet className="h-6 w-6" />
          </Link>
          <span
            className={`absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-lg bg-card/95 backdrop-blur border border-border shadow-lg text-sm font-medium whitespace-nowrap transition-all duration-300 pointer-events-none ${
              activeLabel === "مدخراتي"
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-2"
            }`}
          >
            مدخراتي
          </span>
        </div>
      </div>

      <CalculatorModal open={calcOpen} onClose={() => setCalcOpen(false)} />
      <NotificationModal open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
}
