"use client";

import { useState, useCallback } from "react";
import { Calculator, ClipboardList } from "lucide-react";
import CalculatorModal from "./calculator/CalculatorModal";
import NotificationModal from "./NotificationModal";

export default function FloatingActions() {
  const [calcOpen, setCalcOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [labelText, setLabelText] = useState<string | null>(null);

  const showLabel = useCallback((text: string) => {
    setLabelText(text);
    setTimeout(() => {
      setLabelText((current) => (current === text ? null : current));
    }, 2000);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showLabel("✅ تم النسخ");
    } catch {
      showLabel("❌ فشل النسخ");
    }
  };

  const isVisible = (text: string) => labelText === text;

  return (
    <>
      <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start gap-3">
        {/* الحاسبة */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCalcOpen(true)}
            onMouseEnter={() => showLabel("الحاسبة")}
            className="h-14 w-14 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center transition hover:scale-110 active:scale-95"
            aria-label="الحاسبة"
          >
            <Calculator className="h-6 w-6" />
          </button>
          <span className={`text-sm font-medium bg-card px-3 py-1.5 rounded-lg border border-border shadow-sm transition-all duration-300 whitespace-nowrap ${isVisible("الحاسبة") ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none"}`}>
            الحاسبة
          </span>
        </div>

        {/* الإشعارات */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setNotifOpen(true)}
            onMouseEnter={() => showLabel("الإشعارات")}
            className="h-14 w-14 rounded-full bg-red-500 text-white shadow-2xl flex items-center justify-center transition hover:scale-110 active:scale-95"
            aria-label="الإشعارات"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          </button>
          <span className={`text-sm font-medium bg-card px-3 py-1.5 rounded-lg border border-border shadow-sm transition-all duration-300 whitespace-nowrap ${isVisible("الإشعارات") ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none"}`}>
            الإشعارات
          </span>
        </div>

        {/* نسخ الرابط */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            onMouseEnter={() => showLabel("نسخ الرابط")}
            className="h-14 w-14 rounded-full bg-green-500 text-white shadow-2xl flex items-center justify-center transition hover:scale-110 active:scale-95"
            aria-label="نسخ الرابط"
          >
            <ClipboardList className="h-6 w-6" />
          </button>
          <span className={`text-sm font-medium bg-card px-3 py-1.5 rounded-lg border border-border shadow-sm transition-all duration-300 whitespace-nowrap ${isVisible("نسخ الرابط") || isVisible("✅ تم النسخ") || isVisible("❌ فشل النسخ") ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none"}`}>
            {labelText === "✅ تم النسخ" ? "✅ تم النسخ" : labelText === "❌ فشل النسخ" ? "❌ فشل النسخ" : "نسخ الرابط"}
          </span>
        </div>
      </div>

      <CalculatorModal open={calcOpen} onClose={() => setCalcOpen(false)} />
      <NotificationModal open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
}
