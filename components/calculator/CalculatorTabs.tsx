// components/calculator/CalculatorTabs.tsx
"use client";

import { useState } from "react";

import CurrencyCalculator from "./CurrencyCalculator";
import CryptoCalculator from "./CryptoCalculator";
import GoldCalculator from "./GoldCalculator";
import ElectricityCalculator from "./ElectricityCalculator";
import FuelCalculator from "./FuelCalculator";

const tabs = [
  "العملات",
  "الكريبتو",
  "الذهب",
  "الكهرباء",
  "المحروقات",
];

export default function CalculatorTabs() {
  const [active, setActive] = useState("العملات");

  return (
    <div dir="rtl">
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`
              whitespace-nowrap
              rounded-full
              px-4
              py-2
              text-sm
              transition
              ${
                active === tab
                  ? "bg-primary text-white"
                  : "bg-muted"
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {active === "العملات" && <CurrencyCalculator />}
      {active === "الكريبتو" && <CryptoCalculator />}
      {active === "الذهب" && <GoldCalculator />}
      {active === "الكهرباء" && <ElectricityCalculator />}
      {active === "المحروقات" && <FuelCalculator />}
    </div>
  );
}
