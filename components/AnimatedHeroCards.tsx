// components/AnimatedHeroCards.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import SparklineChart from "@/components/SparklineChart";

interface HeroCardData {
  title: string;
  formattedPrice: string;
  rawPrice: number;
  change: number;
  unit: string;
  href: string;
  color: "primary" | "yellow" | "orange";
  sparklineData: number[];
  icon: React.ReactNode;
  changeLabel: string;
}

function AnimatedCounter({
  value,
  duration = 800,
}: {
  value: number;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);
  const frameRef = useRef<number>();

  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easing ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;
      setDisplay(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        prevValue.current = end;
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value, duration]);

  return (
    <span className="tabular-nums">
      {display.toLocaleString("en-US", { maximumFractionDigits: 0 })}
    </span>
  );
}

function LiveIndicator() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
      </span>
      <span className="text-green-600 dark:text-green-400">مباشر{dots}</span>
    </span>
  );
}

const colorMap: Record<string, { bg: string; border: string; glow: string; text: string; sparkline: string }> = {
  primary: {
    bg: "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
    border: "border-blue-200 dark:border-blue-800",
    glow: "shadow-blue-500/10",
    text: "text-blue-700 dark:text-blue-400",
    sparkline: "#3b82f6",
  },
  yellow: {
    bg: "from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20",
    border: "border-amber-200 dark:border-amber-800",
    glow: "shadow-amber-500/10",
    text: "text-amber-700 dark:text-amber-400",
    sparkline: "#f59e0b",
  },
  orange: {
    bg: "from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20",
    border: "border-orange-200 dark:border-orange-800",
    glow: "shadow-orange-500/10",
    text: "text-orange-700 dark:text-orange-400",
    sparkline: "#f97316",
  },
};

export default function AnimatedHeroCards({ cards }: { cards: HeroCardData[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const colors = colorMap[card.color] || colorMap.primary;
        const isUp = card.change >= 0;

        return (
          <Link
            key={card.title}
            href={card.href}
            className={`group relative rounded-2xl border p-5 bg-gradient-to-br ${colors.bg} ${colors.border} transition-all duration-500 hover:shadow-xl ${colors.glow} hover:-translate-y-1.5 overflow-hidden`}
          >
            {/* تأثير توهج خلفي عند hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl"
                style={{ backgroundColor: colors.sparkline, opacity: 0.15 }}
              />
            </div>

            {/* الهيدر */}
            <div className="flex items-center justify-between mb-2 relative z-10">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                {card.icon}
                {card.title}
              </span>
              <LiveIndicator />
            </div>

            {/* السعر الرئيسي المتحرك */}
            <div className="relative z-10 mb-3">
              <div className="text-3xl lg:text-4xl font-black tracking-tight font-mono">
                <AnimatedCounter value={card.rawPrice} />
                <span className="text-lg font-bold text-muted-foreground mr-1">
                  {" "}
                  {card.unit}
                </span>
              </div>
            </div>

            {/* التغير + الرسم البياني */}
            <div className="flex items-end justify-between relative z-10">
              <span
                className={`inline-flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-full ${
                  isUp
                    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                }`}
              >
                <span className="text-base">{isUp ? "↗" : "↘"}</span>
                {card.changeLabel}
                <span className="text-xs font-normal opacity-70">24س</span>
              </span>

              {/* الرسم البياني المصغر */}
              {card.sparklineData.length > 1 && (
                <div className="w-28 h-12 sm:w-32 sm:h-14">
                  <SparklineChart
                    data={card.sparklineData}
                    color={colors.sparkline}
                    positive={isUp}
                  />
                </div>
              )}
            </div>

            {/* مؤشر الاتجاه السفلي */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-1 transition-all duration-500 ${
                isUp ? "bg-green-500/60" : "bg-red-500/60"
              } group-hover:h-1.5`}
            />
          </Link>
        );
      })}
    </div>
  );
}
