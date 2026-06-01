// components/calculator/CurrencyCalculator.tsx
"use client";

import { useMemo, useState } from "react";
import { useRates } from "@/hooks/useRates";
import { formatPrice } from "@/lib/format";

const CURRENCIES = [
  { code: "USD", name: "دولار أمريكي", flag: "🇺🇸" },
  { code: "SYP", name: "ليرة سورية", flag: "🇸🇾" },
  { code: "EUR", name: "يورو", flag: "🇪🇺" },
  { code: "TRY", name: "ليرة تركية", flag: "🇹🇷" },
  { code: "SAR", name: "ريال سعودي", flag: "🇸🇦" },
  { code: "AED", name: "درهم إماراتي", flag: "🇦🇪" },
  { code: "GBP", name: "جنيه إسترليني", flag: "🇬🇧" },
  { code: "JOD", name: "دينار أردني", flag: "🇯🇴" },
  { code: "CHF", name: "فرنك سويسري", flag: "🇨🇭" },
];

export default function CurrencyCalculator() {
  const { rates, loading, error } = useRates();
  const [amount, setAmount] = useState(1);
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("SYP");

  const result = useMemo(() => {
    if (loading || !rates[from] || !rates[to]) return null;

    const fromRate = rates[from];
    const toRate = rates[to];

    if (!fromRate || !toRate || fromRate === 0) return null;

    return (amount / fromRate) * toRate;
  }, [amount, from, to, rates, loading]);

  const fromCurrency = CURRENCIES.find((c) => c.code === from);
  const toCurrency = CURRENCIES.find((c) => c.code === to);

  // عدد العملات المتاحة
  const availableCount = CURRENCIES.filter(c => rates[c.code]).length;

  if (loading) {
    return (
      <div className="rounded-2xl bg-card p-6 animate-pulse">
        <div className="h-12 bg-muted rounded-xl mb-4" />
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="h-12 bg-muted rounded-xl" />
          <div className="h-12 bg-muted rounded-xl" />
        </div>
        <div className="h-20 bg-muted rounded-xl" />
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

  return (
    <div className="space-y-4">
      {/* عدد العملات المتاحة */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>💱 العملات المتاحة: {availableCount} / {CURRENCIES.length}</span>
        {availableCount < CURRENCIES.length && (
          <span className="text-yellow-500">جاري تحديث الباقي...</span>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">المبلغ</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          min={0}
          step={0.01}
          className="w-full rounded-xl border border-border bg-background p-4 text-lg text-center focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-2">من</label>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full rounded-xl border border-border bg-background p-3 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {CURRENCIES.map((c) => (
              <option 
                key={c.code} 
                value={c.code}
                disabled={!rates[c.code]}
              >
                {c.flag} {c.name} {!rates[c.code] ? "(قريباً)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">إلى</label>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full rounded-xl border border-border bg-background p-3 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {CURRENCIES.map((c) => (
              <option 
                key={c.code} 
                value={c.code}
                disabled={!rates[c.code]}
              >
                {c.flag} {c.name} {!rates[c.code] ? "(قريباً)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={() => {
          setFrom(to);
          setTo(from);
        }}
        className="w-full py-2 text-sm text-primary hover:underline transition"
      >
        🔄 عكس التحويل
      </button>

      <div className="rounded-2xl bg-primary/10 p-6 text-center">
        <p className="text-sm text-muted-foreground mb-1">
          {amount.toLocaleString("en-US")} {fromCurrency?.name}
        </p>
        <p className="text-3xl font-bold text-primary">
          {result !== null ? formatPrice(result, to === "SYP" ? "SYP" : "USD") : "—"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {toCurrency?.name}
        </p>
        {rates[from] && rates[to] && (
          <p className="text-xs text-muted-foreground mt-2">
            1 {from} = {formatPrice(rates[to] / rates[from], to === "SYP" ? "SYP" : "USD")} {to}
          </p>
        )}
      </div>

      <p className="text-xs text-center text-muted-foreground">
        ⚡ الأسعار محدثة لحظياً من مصادر موثوقة
      </p>
    </div>
  );
}
