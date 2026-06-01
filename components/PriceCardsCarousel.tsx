"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { getChangeUI } from "@/lib/format";

interface CardData {
  title: string;
  price: string;
  change: string;
  unit: string;
  href: string;
  color: string;
}

export default function PriceCardsCarousel({ cards }: { cards: CardData[] }) {
  const scrollRef = useRef<<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const interval = setInterval(() => {
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollTo({ left: el.scrollLeft + el.clientWidth * 0.8, behavior: "smooth" });
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
        {cards.map((card, i) => {
          const change = parseFloat(card.change) || 0;
          const { color: changeColor } = getChangeUI(change);
          const isPositive = change >= 0;
          return (
            <Link href={card.href} key={i} className="group block snap-start shrink-0 w-[85vw] sm:w-[300px]">
              <div className="rounded-2xl bg-card p-5 border border-border transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg">{card.title}</h3>
                  <ArrowLeft className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-extrabold">{card.price}</span>
                  <span className="text-sm text-muted-foreground">{card.unit}</span>
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${changeColor}`}>
                  {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{change > 0 ? "+" : ""}{change.toFixed(2)}%</span>
                  <span className="text-muted-foreground mr-1">آخر 24 ساعة</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="mt-4 text-center">
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('toggle-drawer'));
          }}
          className="px-6 py-2 rounded-full bg-card border border-border hover:border-primary transition text-sm font-medium"
        >
          التفاصيل ←
        </button>
      </div>
    </div>
  );
}
