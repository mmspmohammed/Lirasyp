// components/LiveTickerBar.tsx
"use client";

import { formatPrice } from "@/lib/format";

interface TickerItem {
  label: string;
  buy?: number;
  sell?: number;
  price?: number;
  change: number;
  unit: string;
}

export default function LiveTickerBar({ items }: { items: TickerItem[] }) {
  // تكرار العناصر لإنشاء تأثير حلقة لا نهائية سلس
  const duplicated = [...items, ...items, ...items];

  return (
    <div className="w-full bg-card border-b border-border overflow-hidden py-2.5">
      <div className="ticker-track flex gap-8">
        {/* نستخدم CSS animation للتحريك */}
        <style jsx>{`
          .ticker-track {
            animation: ticker-scroll 40s linear infinite;
            width: max-content;
          }
          @keyframes ticker-scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-33.333%);
            }
          }
          .ticker-track:hover {
            animation-play-state: paused;
          }
        `}</style>

        {duplicated.map((item, i) => {
          const isUp = item.change >= 0;
          const value = item.price ?? item.sell ?? item.buy ?? 0;

          return (
            <div
              key={`${item.label}-${i}`}
              className="flex items-center gap-3 whitespace-nowrap px-3"
            >
              <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {item.label}
              </span>
              <span className="font-mono font-bold text-sm">
                {item.price !== undefined
                  ? `$${value.toLocaleString("en-US")}`
                  : formatPrice(value, item.unit)}
              </span>
              <span
                className={`text-xs font-bold ${
                  isUp ? "text-green-600" : "text-red-600"
                }`}
              >
                {isUp ? "▲" : "▼"} {Math.abs(item.change).toFixed(2)}%
              </span>
              <span className="text-muted-foreground/30 text-lg">|</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
