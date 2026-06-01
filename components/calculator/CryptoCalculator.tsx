// components/calculator/CryptoCalculator.tsx
"use client";

import { useMemo, useState } from "react";
import { useCryptoRates } from "@/hooks/useRates";
import { formatPrice } from "@/lib/format";

const CRYPTOS = [
  { code: "BTC", name: "بيتكوين", icon: "₿", color: "#F7931A" },
  { code: "ETH", name: "إيثيريوم", icon: "Ξ", color: "#627EEA" },
  { code: "BNB", name: "بينانس", icon: "B", color: "#F3BA2F" },
  { code: "SOL", name: "سولانا", icon: "S", color: "#00FFA3" },
  { code: "ADA", name: "كاردانو", icon: "A", color: "#0033AD" },
  { code: "TRX", name: "ترون", icon: "T", color: "#FF060A" },
  { code: "PAXG", name: "PAX Gold", icon: "P", color: "#C9A96E" },
];

export default function CryptoCalculator() {
  const { rates, loading, error } = useCryptoRates();
  const [amount, setAmount] = useState(1);
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");

  const result = useMemo(() => {
    const rate = rates[selectedCrypto as keyof typeof rates];
    if (!rate) return null;
    return amount * rate;
  }, [amount, selectedCrypto, rates]);

  const crypto = CRYPTOS.find((c) => c.code === selectedCrypto);

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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {CRYPTOS.map((c) => {
          const rate = rates[c.code as keyof typeof rates];
          return (
            <button
              key={c.code}
              onClick={() => setSelectedCrypto(c.code)}
              className={`
                p-3 rounded-xl text-center transition border
                ${selectedCrypto === c.code
                  ? "bg-primary text-white border-primary"
                  : "bg-muted border-border hover:border-primary/50"
                }
                ${!rate ? "opacity-50 cursor-not-allowed" : ""}
              `}
              disabled={!rate}
            >
              <span className="text-2xl block mb-1">{c.icon}</span>
              <span className="text-xs font-medium">{c.code}</span>
            </button>
          );
        })}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          الكمية ({crypto?.name})
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          min={0}
          step={0.001}
          className="w-full rounded-xl border border-border bg-background p-4 text-lg text-center focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="rounded-2xl bg-primary/10 p-6 text-center">
        <p className="text-sm text-muted-foreground mb-1">
          {amount} {crypto?.code}
        </p>
        <p className="text-3xl font-bold text-primary">
          {result !== null ? formatPrice(result, "USD") : "—"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">دولار أمريكي</p>
        {rates[selectedCrypto as keyof typeof rates] && (
          <p className="text-xs text-muted-foreground mt-2">
            1 {selectedCrypto} = {formatPrice(rates[selectedCrypto as keyof typeof rates]!, "USD")}
          </p>
        )}
      </div>

      <div className="rounded-2xl bg-card p-4">
        <h4 className="text-sm font-medium mb-3">📊 جميع الأسعار</h4>
        <div className="space-y-2">
          {CRYPTOS.map((c) => {
            const rate = rates[c.code as keyof typeof rates];
            if (!rate) return null;
            return (
              <div key={c.code} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="text-sm">{c.name}</span>
                </div>
                <span className="text-sm font-medium">
                  {formatPrice(rate, "USD")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
