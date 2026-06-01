// components/calculator/GoldCalculator.tsx
"use client";

import { useMemo, useState } from "react";
import { useGoldRate } from "@/hooks/useRates";
import { formatPrice } from "@/lib/format";

const KARATS = [
  { name: "24 قيراط", purity: 1.0, color: "#FFD700" },
  { name: "22 قيراط", purity: 0.916, color: "#E5C100" },
  { name: "21 قيراط", purity: 0.875, color: "#D4AF37" },
  { name: "18 قيراط", purity: 0.75, color: "#C5A028" },
  { name: "14 قيراط", purity: 0.5833, color: "#C5A028" },
];

const OUNCE_TO_GRAM = 31.1035;

export default function GoldCalculator() {
  const { ounceUsd, loading, error } = useGoldRate();
  const [grams, setGrams] = useState<number>();
  const [selectedKarats] = useState<string[]>(KARATS.map((k) => k.name));

  const results = useMemo(() => {
    if (!ounceUsd || ounceUsd <= 0) return [];

    const gram24kPrice = ounceUsd / OUNCE_TO_GRAM;

    return KARATS.filter((k) => selectedKarats.includes(k.name)).map((karat) => {
      const gramPrice = gram24kPrice * karat.purity;
      return {
        ...karat,
        gramPrice: gramPrice,
        totalPrice: gramPrice * grams,
      };
    });
  }, [ounceUsd, grams, selectedKarats]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-card p-6 animate-pulse space-y-4">
        <div className="h-12 bg-muted rounded-xl" />
        <div className="h-20 bg-muted rounded-xl" />
        <div className="h-40 bg-muted rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-card p-6 text-center">
        <p className="text-danger mb-2">⚠️ تعذر تحميل سعر الذهب</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!ounceUsd) {
    return (
      <div className="rounded-2xl bg-card p-6 text-center">
        <p className="text-muted-foreground">لا توجد بيانات متاحة حالياً</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-card p-4 text-center border border-border">
        <p className="text-sm text-muted-foreground mb-1">سعر الأونصة العالمية</p>
        <p className="text-2xl font-bold">{formatPrice(ounceUsd, "USD")}</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">عدد الغرامات</label>
        <input
          type="number"
          value={grams}
          onChange={(e) => setGrams(Number(e.target.value) || 0)}
          min={0.1}
          step={0.1}
          className="w-full rounded-xl border border-border bg-background p-4 text-lg text-center focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">العيارات</label>
        <div className="flex flex-wrap gap-2">
          {KARATS.map((karat) => (
            <button
              key={karat.name}
              onClick={() => {
                setSelectedKarats((prev) =>
                  prev.includes(karat.name)
                    ? prev.filter((k) => k !== karat.name)
                    : [...prev, karat.name]
                );
              }}
              className={`
                px-3 py-2 rounded-lg text-sm transition border
                ${selectedKarats.includes(karat.name)
                  ? "bg-primary text-white border-primary"
                  : "bg-muted border-border hover:border-primary/50"
                }
              `}
            >
              <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ backgroundColor: karat.color }} />
              {karat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {results.map((result) => (
          <div key={result.name} className="flex items-center justify-between rounded-xl bg-card p-4 border border-border">
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: result.color }} />
              <div>
                <p className="font-medium">{result.name}</p>
                <p className="text-xs text-muted-foreground">
                  {grams} غرام × {formatPrice(result.gramPrice, "USD")}
                </p>
              </div>
            </div>
            <p className="text-xl font-bold text-primary">
              {formatPrice(result.totalPrice, "USD")}
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs text-center text-muted-foreground">
        ⚡ الأسعار محدثة لحظياً | الأونصة = {OUNCE_TO_GRAM} غرام
      </p>
    </div>
  );
}
