// app/savings/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { formatPrice } from "@/lib/format";
import { ArrowLeft, Plus, Trash2, Wallet, TrendingUp, Gem, Bitcoin, DollarSign } from "lucide-react";

type AssetType = "currency" | "crypto" | "gold";

interface SavingEntry {
  id: string;
  type: AssetType;
  asset: string;
  amount: number;
  createdAt: number;
}

const CURRENCIES = [
  { code: "USD", name: "دولار أمريكي", icon: "🇺🇸" },
  { code: "SYP", name: "ليرة سورية", icon: "🇸🇾" },
  { code: "EUR", name: "يورو", icon: "🇪🇺" },
  { code: "TRY", name: "ليرة تركية", icon: "🇹🇷" },
  { code: "SAR", name: "ريال سعودي", icon: "🇸🇦" },
  { code: "AED", name: "درهم إماراتي", icon: "🇦🇪" },
  { code: "GBP", name: "جنيه إسترليني", icon: "🇬🇧" },
  { code: "JOD", name: "دينار أردني", icon: "🇯🇴" },
  { code: "CHF", name: "فرنك سويسري", icon: "🇨🇭" },
];

const CRYPTOS = [
  { code: "BTC", name: "بيتكوين", color: "#F7931A" },
  { code: "ETH", name: "إيثيريوم", color: "#627EEA" },
  { code: "BNB", name: "بينانس", color: "#F3BA2F" },
  { code: "SOL", name: "سولانا", color: "#00FFA3" },
  { code: "ADA", name: "كاردانو", color: "#0033AD" },
  { code: "TRX", name: "ترون", color: "#FF060A" },
  { code: "PAXG", name: "PAX Gold", color: "#C9A96E" },
];

const GOLD_KARATS = [
  { code: "24k", name: "24 قيراط", purity: 1.0 },
  { code: "22k", name: "22 قيراط", purity: 0.916 },
  { code: "21k", name: "21 قيراط", purity: 0.875 },
  { code: "18k", name: "18 قيراط", purity: 0.75 },
  { code: "14k", name: "14 قيراط", purity: 0.5833 },
];

const OUNCE_TO_GRAM = 31.1035;

export default function SavingsPage() {
  const [entries, setEntries] = useState<SavingEntry[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [sellRates, setSellRates] = useState<Record<string, number>>({});
  const [goldOunce, setGoldOunce] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ تحميل المدخرات من التخزين المحلي
  useEffect(() => {
    const saved = localStorage.getItem("lirasyp_savings");
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  // ✅ حفظ المدخرات محلياً
  useEffect(() => {
    localStorage.setItem("lirasyp_savings", JSON.stringify(entries));
  }, [entries]);

  // ✅ جلب الأسعار من سوبابيز
  useEffect(() => {
    async function fetchRates() {
      try {
        const supabase = createClient();

        const { data: exchangeData } = await supabase
          .from("exchange_rates")
          .select("target_currency, buy_price, sell_price")
          .eq("is_latest", true);

        const { data: assetData } = await supabase
          .from("asset_prices")
          .select("asset_code, price_usd")
          .eq("is_latest", true);

        const mapped: Record<string, number> = {};
        const sellMapped: Record<string, number> = {};
        mapped["USD"] = 1;

        exchangeData?.forEach((item: any) => {
          if (item.buy_price) mapped[item.target_currency] = Number(item.buy_price);
          if (item.sell_price) sellMapped[item.target_currency] = Number(item.sell_price);
        });

        assetData?.forEach((item: any) => {
          if (item.price_usd) mapped[item.asset_code] = Number(item.price_usd);
        });

        setRates(mapped);
        setSellRates(sellMapped);
        setGoldOunce(mapped["XAU"] || null);
      } catch (err) {
        console.error("Rates fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRates();
  }, []);

  const getUsdValue = (entry: SavingEntry): number => {
    if (entry.type === "currency") {
      if (entry.asset === "SYP") {
        // ✅ سعر البيع للدولار (كم ليرة = 1 دولار)
        const sellRate = sellRates["SYP"];
        if (!sellRate || sellRate === 0) return 0;
        return entry.amount / sellRate; // 1 USD = sellRate SYP
      }
      const rate = rates[entry.asset];
      if (!rate || rate === 0) return 0;
      return entry.amount * rate; // 1 unit = rate USD (معكوس من API)
    }

    if (entry.type === "crypto") {
      const price = rates[entry.asset];
      if (!price) return 0;
      return entry.amount * price;
    }

    if (entry.type === "gold") {
      if (!goldOunce || goldOunce <= 0) return 0;
      const karat = GOLD_KARATS.find((k) => k.code === entry.asset);
      if (!karat) return 0;
      const gram24k = goldOunce / OUNCE_TO_GRAM;
      const gramPrice = gram24k * karat.purity;
      return entry.amount * gramPrice;
    }

    return 0;
  };

  const totalUsd = useMemo(() => {
    return entries.reduce((sum, entry) => sum + getUsdValue(entry), 0);
  }, [entries, rates, sellRates, goldOunce]);

  function addEntry(type: AssetType, asset: string, amount: number) {
    const newEntry: SavingEntry = {
      id: crypto.randomUUID(),
      type,
      asset,
      amount,
      createdAt: Date.now(),
    };
    setEntries((prev) => [...prev, newEntry]);
    setShowAdd(false);
  }

  function removeEntry(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  const getAssetLabel = (entry: SavingEntry) => {
    if (entry.type === "currency") {
      const c = CURRENCIES.find((x) => x.code === entry.asset);
      return `${c?.icon || "💱"} ${c?.name || entry.asset}`;
    }
    if (entry.type === "crypto") {
      const c = CRYPTOS.find((x) => x.code === entry.asset);
      return `₿ ${c?.name || entry.asset}`;
    }
    const k = GOLD_KARATS.find((x) => x.code === entry.asset);
    return `🥇 ${k?.name || entry.asset}`;
  };

  const getTypeLabel = (type: AssetType) => {
    if (type === "currency") return { text: "عملة", icon: <DollarSign className="w-4 h-4" />, color: "text-blue-500 bg-blue-500/10" };
    if (type === "crypto") return { text: "كريبتو", icon: <Bitcoin className="w-4 h-4" />, color: "text-purple-500 bg-purple-500/10" };
    return { text: "ذهب", icon: <Gem className="w-4 h-4" />, color: "text-yellow-500 bg-yellow-500/10" };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition">الرئيسية</Link>
        <ArrowLeft className="w-4 h-4" />
        <span>مدخراتي</span>
      </nav>

      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold mb-2 flex items-center gap-2">
            <Wallet className="w-8 h-8 text-primary" />
            مدخراتي
          </h1>
          <p className="text-muted-foreground">تتبع مدخراتك من العملات والذهب والعملات الرقمية</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition shadow-lg"
        >
          <Plus className="w-5 h-5" />
          إضافة مدخرات
        </button>
      </div>

      <div className="rounded-2xl bg-card border border-border overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-medium">النوع</th>
                <th className="px-4 py-3 text-right text-sm font-medium">الأصل</th>
                <th className="px-4 py-3 text-right text-sm font-medium">الكمية</th>
                <th className="px-4 py-3 text-right text-sm font-medium">القيمة بالدولار</th>
                <th className="px-4 py-3 text-center text-sm font-medium w-16">حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    <Wallet className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                    <p>لا توجد مدخرات مسجلة</p>
                    <p className="text-sm mt-1">اضغط "إضافة مدخرات" لبدء التتبع</p>
                  </td>
                </tr>
              ) : (
                entries.map((entry) => {
                  const typeMeta = getTypeLabel(entry.type);
                  const usdValue = getUsdValue(entry);
                  return (
                    <tr key={entry.id} className="hover:bg-muted/30 transition">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${typeMeta.color}`}>
                          {typeMeta.icon}
                          {typeMeta.text}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">{getAssetLabel(entry)}</td>
                      <td className="px-4 py-3">
                        {entry.type === "gold"
                          ? `${entry.amount} غرام`
                          : entry.type === "currency"
                          ? `${entry.amount.toLocaleString("en-US")} ${entry.asset}`
                          : `${entry.amount} ${entry.asset}`}
                      </td>
                      <td className="px-4 py-3 font-bold text-primary">
                        {usdValue > 0 ? formatPrice(usdValue, "USD") : "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => removeEntry(entry.id)}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition"
                          aria-label="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 p-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">إجمالي المدخرات</p>
            <p className="text-xs text-muted-foreground">محوّل للدولار الأمريكي</p>
          </div>
        </div>
        <div className="text-left">
          <p className="text-4xl font-extrabold text-primary">
            {formatPrice(totalUsd, "USD")}
          </p>
        </div>
      </div>

      {showAdd && <AddModal onAdd={addEntry} onClose={() => setShowAdd(false)} ratesLoaded={!loading} />}
    </div>
  );
}

function AddModal({
  onAdd,
  onClose,
  ratesLoaded,
}: {
  onAdd: (type: "currency" | "crypto" | "gold", asset: string, amount: number) => void;
  onClose: () => void;
  ratesLoaded: boolean;
}) {
  const [tab, setTab] = useState<<"currency" | "crypto" | "gold">("currency");
  const [asset, setAsset] = useState("");
  const [amount, setAmount] = useState("");

  const tabs = [
    { key: "currency" as const, label: "عملات", icon: <DollarSign className="w-4 h-4" /> },
    { key: "crypto" as const, label: "كريبتو", icon: <Bitcoin className="w-4 h-4" /> },
    { key: "gold" as const, label: "ذهب", icon: <Gem className="w-4 h-4" /> },
  ];

  const getOptions = () => {
    if (tab === "currency") return CURRENCIES.map((c) => ({ value: c.code, label: `${c.icon} ${c.name}` }));
    if (tab === "crypto") return CRYPTOS.map((c) => ({ value: c.code, label: c.name }));
    return GOLD_KARATS.map((k) => ({ value: k.code, label: k.name }));
  };

  const getUnit = () => {
    if (tab === "gold") return "غرام";
    return "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!asset || isNaN(num) || num <= 0) return;
    onAdd(tab, asset, num);
  };

  useEffect(() => {
    setAsset("");
    setAmount("");
  }, [tab]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:w-[500px] sm:rounded-2xl rounded-t-3xl bg-background shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-lg font-bold">إضافة مدخرات</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-3 gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition ${
                  tab === t.key ? "bg-primary text-white border-primary" : "bg-muted border-border hover:border-primary/50"
                }`}
              >
                {t.icon}
                <span className="text-sm font-medium">{t.label}</span>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">الأصل</label>
            <select
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              className="w-full rounded-xl border border-border bg-background p-3 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">اختر...</option>
              {getOptions().map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              الكمية {getUnit() && `(${getUnit()})`}
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step={tab === "gold" ? "0.1" : "0.001"}
              placeholder={tab === "gold" ? "مثال: 10" : "مثال: 100"}
              className="w-full rounded-xl border border-border bg-background p-3 text-center focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {!ratesLoaded && (
            <p className="text-xs text-yellow-500 text-center">⚠️ جاري تحميل الأسعار...</p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition"
          >
            إضافة
          </button>
        </form>
      </div>
    </div>
  );
}
