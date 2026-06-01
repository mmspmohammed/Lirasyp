"use client";

import { useState, useMemo, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { formatPrice } from "@/lib/format";
import { Zap, Calculator, Info, Home, Factory } from "lucide-react";

type SectorType = "residential" | "commercial_industrial";

interface Tariff {
  id: string;
  tier_key: string;
  tier_name_ar: string;
  price_per_kwh: number;
  currency: string;
}

export default function ElectricityCalculator() {
  const [sector, setSector] = useState<SectorType>("residential");
  const [consumption, setConsumption] = useState(300);
  const [showDetails, setShowDetails] = useState(false);
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ جلب البيانات حصراً من سوبابيز
  useEffect(() => {
    async function fetchTariffs() {
      try {
        const supabase = createClient();
        const { data, error: supaError } = await supabase
          .from("electricity_tariffs")
          .select("id, tier_key, tier_name_ar, price_per_kwh, currency")
          .eq("is_active", true)
          .order("tier_key");

        if (supaError) throw supaError;
        setTariffs(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTariffs();
  }, []);

  // بناء خريطة الأسعار من البيانات
  const rates = useMemo(() => {
    const map: Record<string, number> = {};
    tariffs.forEach((t) => {
      map[t.tier_key] = t.price_per_kwh;
    });
    return map;
  }, [tariffs]);

  // الحساب
  const calculation = useMemo(() => {
    const under300 = rates["residential_under_300"] ?? 6;
    const over300 = rates["residential_over_300"] ?? 14;
    const commercial = rates["commercial"] ?? 14;
    const industrial = rates["industrial"] ?? 14;

    let totalCost = 0;
    const breakdown: { tier: string; kwh: number; price: number; cost: number }[] = [];

    if (sector === "residential") {
      if (consumption <= 300) {
        const cost = consumption * under300;
        breakdown.push({
          tier: tariffs.find((t) => t.tier_key === "residential_under_300")?.tier_name_ar || "منزلي أقل من 300 كيلوواط",
          kwh: consumption,
          price: under300,
          cost,
        });
        totalCost = cost;
      } else {
        // أول 300
        const firstCost = 300 * under300;
        breakdown.push({
          tier: tariffs.find((t) => t.tier_key === "residential_under_300")?.tier_name_ar || "منزلي أقل من 300 كيلوواط",
          kwh: 300,
          price: under300,
          cost: firstCost,
        });

        // الباقي
        const rest = consumption - 300;
        const restCost = rest * over300;
        breakdown.push({
          tier: tariffs.find((t) => t.tier_key === "residential_over_300")?.tier_name_ar || "منزلي أكثر من 300 كيلوواط",
          kwh: rest,
          price: over300,
          cost: restCost,
        });
        totalCost = firstCost + restCost;
      }
    } else {
      // صناعي وتجاري
      const rate = commercial || industrial || 14;
      const cost = consumption * rate;
      breakdown.push({
        tier: "صناعي وتجاري",
        kwh: consumption,
        price: rate,
        cost,
      });
      totalCost = cost;
    }

    return { totalCost, breakdown };
  }, [consumption, sector, rates, tariffs]);

  const avgPrice = consumption > 0 ? calculation.totalCost / consumption : 0;

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
        <p className="text-danger mb-2">⚠️ تعذر تحميل بيانات الكهرباء</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ✅ خيارين: منزلي / صناعي وتجاري */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setSector("residential")}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition ${
            sector === "residential"
              ? "bg-primary text-white border-primary"
              : "bg-muted border-border hover:border-primary/50"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="font-medium">منزلي</span>
        </button>
        <button
          onClick={() => setSector("commercial_industrial")}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition ${
            sector === "commercial_industrial"
              ? "bg-primary text-white border-primary"
              : "bg-muted border-border hover:border-primary/50"
          }`}
        >
          <Factory className="w-5 h-5" />
          <span className="font-medium">صناعي وتجاري</span>
        </button>
      </div>

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
          <h4 className="font-bold text-sm mb-3">تفصيل الحساب:</h4>
          {calculation.breakdown.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded bg-yellow-500/10 text-yellow-600">
                  {index + 1}
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
        الأسعار مأخوذة من قرار وزارة الكهرباء الرسمي.
        </p>
      </div>
    </div>
  );
}
