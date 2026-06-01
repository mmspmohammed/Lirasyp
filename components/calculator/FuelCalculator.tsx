// components/calculator/FuelCalculator.tsx
"use client";

import { useState, useMemo } from "react";
import { useRates } from "@/hooks/useRates";
import { formatPrice } from "@/lib/format";
import { Fuel, Droplets, Flame, Info, ChevronDown, ChevronUp } from "lucide-react";

// بيانات افتراضية للمحروقات (إذا ما كان فيه بيانات بالداتا بيس)
const FUEL_TYPES = [
  {
    id: "gasoline_95",
    name: "بنزين أوكتان 95",
    icon: "⛽",
    color: "#ef4444",
    price_usd: 1.2,
    price_syp: 18000,
    unit: "لتر",
    tank_sizes: [30, 40, 50, 60],
  },
  {
    id: "diesel",
    name: "مازوت التدفئة",
    icon: "🛢️",
    color: "#f97316",
    price_usd: 0.9,
    price_syp: 13500,
    unit: "لتر",
    tank_sizes: [100, 200, 500, 1000],
  },
  {
    id: "gas",
    name: "غاز المنازل",
    icon: "🔥",
    color: "#3b82f6",
    price_usd: 8,
    price_syp: 120000,
    unit: "أسطوانة",
    tank_sizes: [1, 2, 3, 5],
  },
];

export default function FuelCalculator() {
  const { rates, loading } = useRates();
  const [selectedFuel, setSelectedFuel] = useState(FUEL_TYPES[0]);
  const [quantity, setQuantity] = useState(40);
  const [showDetails, setShowDetails] = useState(false);

  // نحاول نجيب أسعار المحروقات من الداتا بيس
  // حالياً rates ما بيحتوي على fuel لأنه بيجيب من exchange_rates و asset_prices بس
  // فلازم نستخدم بيانات افتراضية
  const fuelTypes = FUEL_TYPES;

  const totalCost = useMemo(() => {
    return {
      usd: quantity * selectedFuel.price_usd,
      syp: quantity * selectedFuel.price_syp,
    };
  }, [quantity, selectedFuel]);

  return (
    <div className="space-y-4">
      {/* Fuel Type Selector */}
      <div>
        <label className="block text-sm font-medium mb-2">نوع الوقود</label>
        <div className="grid grid-cols-3 gap-2">
          {fuelTypes.map((fuel) => (
            <button
              key={fuel.id}
              onClick={() => {
                setSelectedFuel(fuel);
                setQuantity(fuel.tank_sizes[1] || 1);
              }}
              className={`
                p-3 rounded-xl text-center transition border
                ${selectedFuel.id === fuel.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/30"
                }
              `}
            >
              <span className="text-2xl block mb-1">{fuel.icon}</span>
              <span className="text-xs font-medium">{fuel.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Info */}
      <div className="rounded-xl bg-card border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">السعر الحالي</span>
          <span
            className="text-xs px-2 py-1 rounded-full text-white"
            style={{ backgroundColor: selectedFuel.color }}
          >
            {selectedFuel.unit}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <p className="text-lg font-bold">{formatPrice(selectedFuel.price_usd, "USD")}</p>
            <p className="text-xs text-muted-foreground">دولار</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">{formatPrice(selectedFuel.price_syp, "SYP")}</p>
            <p className="text-xs text-muted-foreground">ليرة</p>
          </div>
        </div>
      </div>

      {/* Quantity Input */}
      <div>
        <label className="block text-sm font-medium mb-2">
          الكمية ({selectedFuel.unit})
        </label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(0, Number(e.target.value)))}
          min={0}
          step={selectedFuel.unit === "أسطوانة" ? 1 : 5}
          className="w-full rounded-xl border border-border bg-background p-4 text-lg text-center focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="range"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          min={0}
          max={selectedFuel.unit === "أسطوانة" ? 10 : 200}
          step={selectedFuel.unit === "أسطوانة" ? 1 : 5}
          className="w-full mt-3 accent-primary"
        />
      </div>

      {/* Tank Size Presets */}
      <div className="flex gap-2 flex-wrap">
        {selectedFuel.tank_sizes.map((size) => (
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
            {size} {selectedFuel.unit}
          </button>
        ))}
      </div>

      {/* Total Cost */}
      <div className="rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 p-6">
        <p className="text-sm text-muted-foreground text-center mb-1">
          {quantity} {selectedFuel.unit} {selectedFuel.name}
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
            <span className="text-sm">السعر لكل {selectedFuel.unit}</span>
            <span className="font-medium">{formatPrice(selectedFuel.price_syp, "SYP")}</span>
          </div>
          <div className="flex justify-between items-center p-2">
            <span className="text-sm">الكمية</span>
            <span className="font-medium">{quantity} {selectedFuel.unit}</span>
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
          {selectedFuel.unit === "لتر" && " سعر التنكة (20 لتر) = " + formatPrice(selectedFuel.price_syp * 20, "SYP")}
        </p>
      </div>
    </div>
  );
}
