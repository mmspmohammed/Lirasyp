"use client";

import { useState } from "react";
import { Calculator, Bell, Wallet } from "lucide-react";
import Link from "next/link";
import CalculatorModal from "./calculator/CalculatorModal";
import NotificationModal from "./NotificationModal";

export default function FloatingActions() {
  const [calcOpen, setCalcOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-3">
        {/* الحاسبة */}
        <div className="relative group">
          <button
            onClick={() => setCalcOpen(true)}
            className="h-14 w-14 rounded-full bg-primary text-white shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-2xl active:scale-95"
            aria-label="الحاسبة"
          >
            <Calculator className="h-6 w-6" />
          </button>
          <span className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-lg bg-card/95 backdrop-blur border border-border shadow-lg text-sm font-medium whitespace-nowrap opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none">
            الحاسبة
          </span>
        </div>

        {/* الإشعارات */}
        <div className="relative group">
          <button
            onClick={() => setNotifOpen(true)}
            className="h-14 w-14 rounded-full bg-red-500 text-white shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-2xl active:scale-95"
            aria-label="الإشعارات"
          >
            <Bell className="h-6 w-6" />
          </button>
          <span className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-lg bg-card/95 backdrop-blur border border-border shadow-lg text-sm font-medium whitespace-nowrap opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none">
            الإشعارات
          </span>
        </div>

        {/* المدخرات */}
        <div className="relative group">
          <Link
            href="/savings"
            className="h-14 w-14 rounded-full bg-green-500 text-white shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-2xl active:scale-95"
            aria-label="مدخراتي"
          >
            <Wallet className="h-6 w-6" />
          </Link>
          <span className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-lg bg-card/95 backdrop-blur border border-border shadow-lg text-sm font-medium whitespace-nowrap opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none">
            مدخراتي
          </span>
        </div>
      </div>

      <CalculatorModal open={calcOpen} onClose={() => setCalcOpen(false)} />
      <NotificationModal open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
}
