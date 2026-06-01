// components/calculator/FuelCalculator.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase";
import { formatPrice } from "@/lib/format";
import { Info, ChevronDown, ChevronUp } from "lucide-react";

interface FuelItem {
  id: string;
  material_type: string;
  material_name_ar: string;
  price_usd: number;
  price_syp: number;
  unit_ar: string;
  notes?: string;
}

const TYPE_META: Record<string, { icon: string; color: string; tank_sizes: number[] }> = {
  gasoline_95: { icon: "⛽", color: "#ef4444", tank_sizes: [30, 40, 50, 60] },
  gasoline_90: { icon: "⛽", color: "#dc2626", tank_sizes: [30, 40, 50, 60] },
  diesel: { icon: "🛢️", color: "#f97316", tank_sizes: [100, 200, 500, 1000] },
  gas_cylinder: { icon: "🔥", color: "#3b82f6", tank_sizes: [1, 2, 3, 5] },
};

export default function FuelCalculator() {
  const [fuels, setFuels] = useState<FuelItem[]>([]);
  const [selectedFuel, setSelectedFuel] = useState<FuelItem | null>(null);
  const [quantity, setQuantity] = useState(40);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFuels() {
      try {
        const supabase = createClient();
        const { data, error: supaError } = await supabase
          .from("fuel_prices")
          .select("id, material_type, material_name_ar, price_usd, price_syp, unit_ar, notes")
          .order("material_name_ar", { ascending: true });

        if (supaError) throw supaError;

        const items = data || [];
        setFuels(items);
        if (items.length > 0) {
          setSelectedFuel(items[0]);
          const meta = TYPE_META[items[0].material_type];
          setQuantity(meta?.tank_sizes[1] || 1);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchFuels();
  }, []);

  const totalCost = useMemo(() => {
    if (!selectedFuel) return { usd: 0, syp: 0 };
    return {
      usd: quantity * Number(selectedFuel.price_usd || 0),
      syp: quantity * Number(selectedFuel.price_syp || 0),
    };
  }, [quantity, selectedFuel]);

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
        <p className="text-danger mb-2">⚠️ تعذر تحميل الأسعار</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!selectedFuel) {
    return (
      <div className="rounded-2xl bg-card p-6 text-center">
        <p className="text-muted-foreground">لا توجد بيانات متاحة حالياً</p>
      </div>
    );
  }

  const meta = TYPE_META[selectedFuel.material_type] || { icon: "⛽", color: "#666", tank_sizes: [1, 5, 10] };
  const isCylinder = selectedFuel.unit_ar?.includes("أسطوانة");

  return (
    <div className="space-y-4">
      {/* Fuel Type Selector */}
      <div>
        <label className="block text-sm font-medium mb-2">نوع الوقود</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {fuels.map((fuel) => {
            const fuelMeta = TYPE_META[fuel.material_type] || { icon: "⛽", color: "#666" };
            return (
              <button
                key={fuel.id}
                onClick={() => {
                  setSelectedFuel(fuel);
                  const m = TYPE_META[fuel.material_type];
                  setQuantity(m?.tank_sizes[1] || 1);
                }}
                className={`
                  p-3 rounded-xl text-center transition border
                  ${selectedFuel.id === fuel.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/30"
                  }
                `}
              >
                <span className="text-2xl block mb-1">{fuelMeta.icon}</span>
                <span className="text-xs font-medium">{fuel.material_name_ar}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Info */}
      <div className="rounded-xl bg-card border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">السعر الحالي</span>
          <span
            className="text-xs px-2 py-1 rounded-full text-white"
            style={{ backgroundColor: meta.color }}
          >
            {selectedFuel.unit_ar}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <p className="text-lg font-bold">{formatPrice(Number(selectedFuel.price_usd || 0), "USD")}</p>
            <p className="text-xs text-muted-foreground">دولار</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">{formatPrice(Number(selectedFuel.price_syp || 0), "SYP")}</p>
            <p className="text-xs text-muted-foreground">ليرة</p>
          </div>
        </div>
      </div>

      {/* Quantity Input */}
      <div>
        <label className="block text-sm font-medium mb-2">
          الكمية ({selectedFuel.unit_ar})
        </label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(0, Number(e.target.value)))}
          min={0}
          step={isCylinder ? 1 : 5}
          className="w-full rounded-xl border border-border bg-background p-4 text-lg text-center focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="range"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          min={0}
          max={isCylinder ? 10 : 200}
          step={isCylinder ? 1 : 5}
          className="w-full mt-3 accent-primary"
        />
      </div>

      {/* Tank Size Presets */}
      <div className="flex gap-2 flex-wrap">
        {meta.tank_sizes.map((size) => (
          <button
            key={size}
            onClick={() => setQuantity(size)}
            className={`
              px-3 py-2 rounded-lg text-sm transition border
              ${quantity === size
                ? "bg-primary text-white border-primary"
                : "bg-muted border-border hover:border-primary/50"
              }
            `}
          >
            {size} {selectedFuel.unit_ar}
          </button>
        ))}
      </div>

      {/* Total Cost */}
      <div className="rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 p-6">
        <p className="text-sm text-muted-foreground text-center mb-1">
          {quantity} {selectedFuel.unit_ar} {selectedFuel.material_name_ar}
        </p>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div className="text-center">
            <p className="text-2xl font-extrabold text-red-600">
              {formatPrice(totalCost.usd, "USD")}
            </p>
            <p className="text-xs text-muted-foreground">دولار</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-extrabold text-red-600">
              {formatPrice(totalCost.syp, "SYP")}
            </p>
            <p className="text-xs text-muted-foreground">ليرة سورية</p>
          </div>
        </div>
      </div>

      {/* Details Toggle */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 text-sm text-primary hover:underline transition w-full justify-center"
      >
        {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {showDetails ? "إخفاء التفاصيل" : "عرض التفاصيل"}
      </button>

      {showDetails && (
        <div className="rounded-xl bg-card border border-border p-4 space-y-2">
          <div className="flex justify-between items-center p-2">
            <span className="text-sm">السعر لكل {selectedFuel.unit_ar}</span>
            <span className="font-medium">{formatPrice(Number(selectedFuel.price_syp || 0), "SYP")}</span>
          </div>
          <div className="flex justify-between items-center p-2">
            <span className="text-sm">الكمية</span>
            <span className="font-medium">{quantity} {selectedFuel.unit_ar}</span>
          </div>
          <div className="border-t border-border pt-2">
            <div className="flex justify-between items-center p-2">
              <span className="font-bold">المجموع</span>
              <span className="font-bold text-lg text-red-600">
                {formatPrice(totalCost.syp, "SYP")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="rounded-xl bg-muted/50 p-3 flex items-start gap-2">
        <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          ⚠️ الأسعار تقريبية وقد تختلف حسب المنطقة والمحطة.
          {!isCylinder && " سعر التنكة (20 لتر) = " + formatPrice(Number(selectedFuel.price_syp || 0) * 20, "SYP")}
        </p>
      </div>
    </div>
  );
}
