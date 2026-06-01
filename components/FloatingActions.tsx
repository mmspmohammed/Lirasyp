// components/FloatingActions.tsx
"use client";

import { useState } from "react";
import { Calculator, Bell, MessageCircle } from "lucide-react";
import CalculatorModal from "./calculator/CalculatorModal";
import NotificationModal from "./NotificationModal";

export default function FloatingActions() {
  const [calcOpen, setCalcOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <>
      {/* الأزرار العائمة - 3 على جنب */}
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2">
        {/* زر الحاسبة */}
        <button
          onClick={() => setCalcOpen(true)}
          className="
            h-11 w-11
            rounded-full
            bg-primary
            text-white
            shadow-lg
            flex items-center justify-center
            transition
            hover:scale-110
            active:scale-95
            hover:shadow-xl
          "
          aria-label="الحاسبة"
          title="الحاسبة"
        >
          <Calculator className="h-5 w-5" />
        </button>

        {/* زر الإشعارات */}
        <button
          onClick={() => setNotifOpen(true)}
          className="
            h-11 w-11
            rounded-full
            bg-red-500
            text-white
            shadow-lg
            flex items-center justify-center
            transition
            hover:scale-110
            active:scale-95
            hover:shadow-xl
            relative
          "
          aria-label="الإشعارات"
          title="الإشعارات"
        >
          <Bell className="h-5 w-5" />
          {/* Badge - عدد الإشعارات */}
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-white text-red-500 text-[10px] font-bold flex items-center justify-center border border-red-500">
            3
          </span>
        </button>

        {/* زر الواتساب */}
        <a
          href="https://wa.me/963XXXXXXXXX?text=مرحبا%20LiraSYP"
          target="_blank"
          rel="noopener noreferrer"
          className="
            h-11 w-11
            rounded-full
            bg-green-500
            text-white
            shadow-lg
            flex items-center justify-center
            transition
            hover:scale-110
            active:scale-95
            hover:shadow-xl
          "
          aria-label="واتساب"
          title="تواصل عبر واتساب"
        >
          <MessageCircle className="h-5 w-5" />
        </a>
      </div>

      {/* Modals */}
      <CalculatorModal open={calcOpen} onClose={() => setCalcOpen(false)} />
      <NotificationModal open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
}
