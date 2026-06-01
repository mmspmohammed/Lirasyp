// components/calculator/ElectricityCalculator.tsx
"use client";

import { useState, useMemo } from "react";
import { useRates } from "@/hooks/useRates";
import { formatPrice } from "@/lib/format";
import { Zap, Calculator, Info } from "lucide-react";

// بيانات افتراضية للشرائح (إذا ما كان فيه بيانات بالداتا بيس)
const DEFAULT_TIERS = [
  { tier_key: "1", tier_name_ar: "الشريحة الأولى", price_per_kwh: 50, max_kwh: 300 },
  { tier_key: "2", tier_name_ar: "الشريحة الثانية", price_per_kwh: 125, max_kwh: 500 },
  { tier_key: "3", tier_name_ar: "الشريحة الثالثة", price_per_kwh: 250, max_kwh: 800 },
  { tier_key: "4", tier_name_ar: "الشريحة الرابعة", price_per_kwh: 450, max_kwh: 1000 },
  { tier_key: "5", tier_name_ar: "الشريحة الخامسة", price_per_kwh: 650, max_kwh: Infinity },
];

export default function ElectricityCalculator() {
  const { rates, loading } = useRates();
  const [consumption, setConsumption] = useState(300);
  const [showDetails, setShowDetails] = useState(false);

  // نحاول نجيب أسعار الكهرباء من الداتا بيس، وإذا ما كان فيه نستخدم الافتراضي
  // حالياً rates ما بيحتوي على electricity لأنه بيجيب من exchange_rates و asset_prices بس
  // فلازم نستخدم بيانات افتراضية أو نضيف hook جديد
  const tiers = DEFAULT_TIERS;

  const calculation = useMemo(() => {
    let remaining = consumption;
    let totalCost = 0;
    const breakdown: { tier: string; kwh: number; price: number; cost: number }[] = [];

    for (const tier of tiers) {
      if (remaining <= 0) break;
      
      const kwhInTier = Math.min(remaining, tier.max_kwh);
      const cost = kwhInTier * tier.price_per_kwh;
      
      breakdown.push({
        tier: tier.tier_name_ar,
        kwh: kwhInTier,
        price: tier.price_per_kwh,
        cost,
      });
      
      totalCost += cost;
      remaining -= kwhInTier;
    }

    return { totalCost, breakdown };
  }, [consumption, tiers]);

  const avgPrice = consumption > 0 ? calculation.totalCost / consumption : 0;

  return (
    <div className="space-y-4">
      {/* Consumption Input */}
      <div>
        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          استهلاك الشهر (كيلوواط)
        </label>
        <input
          type="number"
          value={consumption}
          onChange={(e) => setConsumption(Math.max(0, Number(e.target.value)))}
          min={0}
          step={10}
          className="w-full rounded-xl border border-border bg-background p-4 text-lg text-center focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
        <input
          type="range"
          value={consumption}
          onChange={(e) => setConsumption(Number(e.target.value))}
          min={0}
          max={2000}
          step={10}
          className="w-full mt-3 accent-yellow-500"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>0</span>
          <span>500</span>
          <span>1000</span>
          <span>1500</span>
          <span>2000</span>
        </div>
      </div>

      {/* Total Cost */}
      <div className="rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 p-6 text-center">
        <p className="text-sm text-muted-foreground mb-1">التكلفة التقديرية</p>
        <p className="text-4xl font-extrabold text-yellow-600">
          {formatPrice(calculation.totalCost, "SYP")}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          متوسط السعر: {formatPrice(avgPrice, "SYP")} / كيلوواط
        </p>
      </div>

      {/* Quick Presets */}
      <div className="flex gap-2 flex-wrap">
        {[100, 300, 500, 800, 1000, 1500].map((preset) => (
          <button
            key={preset}
            onClick={() => setConsumption(preset)}
            className={`
              px-3 py-2 rounded-lg text-sm transition border
              ${consumption === preset
                ? "bg-yellow-500 text-white border-yellow-500"
                : "bg-muted border-border hover:border-yellow-500/50"
              }
            `}
          >
            {preset} كيلوواط
          </button>
        ))}
      </div>

      {/* Breakdown Toggle */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 text-sm text-primary hover:underline transition"
      >
        <Calculator className="w-4 h-4" />
        {showDetails ? "إخفاء التفاصيل" : "عرض تفاصيل الحساب"}
      </button>

      {/* Detailed Breakdown */}
      {showDetails && (
        <div className="rounded-2xl bg-card border border-border p-4 space-y-2">
          <h4 className="font-bold text-sm mb-3">تفصيل الشرائح:</h4>
          {calculation.breakdown.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded bg-yellow-500/10 text-yellow-600">
                  شريحة {index + 1}
                </span>
                <span className="text-sm">{item.tier}</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">
                  {item.kwh} كيلوواط × {formatPrice(item.price, "SYP")}
                </p>
                <p className="text-xs text-muted-foreground">
                  = {formatPrice(item.cost, "SYP")}
                </p>
              </div>
            </div>
          ))}
          <div className="border-t border-border pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="font-bold">المجموع</span>
              <span className="font-bold text-lg text-yellow-600">
                {formatPrice(calculation.totalCost, "SYP")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="rounded-xl bg-muted/50 p-3 flex items-start gap-2">
        <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          ⚠️ هاد تقدير تقريبي. الأسعار الفعلية قد تختلف حسب المنطقة والاستهلاك الفعلي.
          شرائح الكهرباء تتدرج حسب كمية الاستهلاك.
        </p>
      </div>
    </div>
  );
}

