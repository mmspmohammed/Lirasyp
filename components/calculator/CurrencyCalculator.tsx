// components/calculator/CurrencyCalculator.tsx

"use client";

import { useMemo, useState } from "react";

const rates: Record<string, number> = {
  USD: 1,
  SYP: 15000,
  EUR: 0.92,
  TRY: 32,
};

export default function CurrencyCalculator() {
  const [amount, setAmount] = useState(1);
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("SYP");

  const result = useMemo(() => {
    return (
      (amount / rates[from]) * rates[to]
    ).toFixed(2);
  }, [amount, from, to]);

  return (
    <div className="space-y-4">
      <input
        type="number"
        value={amount}
        onChange={(e) =>
          setAmount(Number(e.target.value))
        }
        className="w-full rounded-xl border p-3"
      />

      <div className="grid grid-cols-2 gap-3">
        <select
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="rounded-xl border p-3"
        >
          {Object.keys(rates).map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="rounded-xl border p-3"
        >
          {Object.keys(rates).map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl bg-card p-4 text-center text-2xl font-bold">
        {result}
      </div>
    </div>
  );
}
