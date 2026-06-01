// app/prices/currency/page.tsx
import { Suspense } from "react";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase-server";

import { formatPrice, formatChange, getChangeUI } from "@/lib/format";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, RefreshCw } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "أسعار العملات | الدولار والليرة السورية",
  description:
    "أسعار صرف الدولار الأمريكي مقابل الليرة السورية واليورو والليرة التركية والريال السعودي. تحديث لحظي من مصادر موثوقة.",
  keywords: [
    "سعر الدولار",
    "الليرة السورية",
    "صرف العملات",
    "يورو",
    "ليرة تركية",
    "ريال سعودي",
    "درهم إماراتي",
  ],
  openGraph: {
    title: "أسعار العملات | LiraSYP",
    description: "أسعار صرف الدولار والليرة السورية محدثة لحظياً.",
  },
};

export const revalidate = 60;

// ==================== Components ====================

function CurrencyRow({
  currency,
  buyPrice,
  sellPrice,
  change,
  isMain = false,
}: {
  currency: string;
  buyPrice: number;
  sellPrice: number;
  change: number;
  isMain?: boolean;
}) {
  const { icon, color } = getChangeUI(change);

  return (
    <div
      className={`
        flex items-center justify-between p-4 rounded-xl border transition
        ${isMain
          ? "bg-primary/5 border-primary/20"
          : "bg-card border-border hover:border-primary/20"
        }
      `}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">
          {currency === "USD" && "🇺🇸"}
          {currency === "SYP" && "🇸🇾"}
          {currency === "EUR" && "🇪🇺"}
          {currency === "TRY" && "🇹🇷"}
          {currency === "SAR" && "🇸🇦"}
          {currency === "AED" && "🇦🇪"}
          {currency === "GBP" && "🇬🇧"}
          {currency === "JOD" && "🇯🇴"}
          {currency === "CHF" && "🇨🇭"}
        </span>
        <div>
          <p className="font-bold">{currency}</p>
          <p className="text-xs text-muted-foreground">
            {currency === "USD" && "دولار أمريكي"}
            {currency === "SYP" && "ليرة سورية"}
            {currency === "EUR" && "يورو"}
            {currency === "TRY" && "ليرة تركية"}
            {currency === "SAR" && "ريال سعودي"}
            {currency === "AED" && "درهم إماراتي"}
            {currency === "GBP" && "جنيه إسترليني"}
            {currency === "JOD" && "دينار أردني"}
            {currency === "CHF" && "فرنك سويسري"}
          </p>
        </div>
      </div>
      <div className="text-left">
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">شراء</p>
            <p className="font-bold">{formatPrice(buyPrice, currency === "SYP" ? "SYP" : "USD")}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">مبيع</p>
            <p className="font-bold">{formatPrice(sellPrice, currency === "SYP" ? "SYP" : "USD")}</p>
          </div>
          <div className={`flex items-center gap-1 ${color}`}>
            {icon}
            <span className="text-sm font-medium">{formatChange(change)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== Data Fetching ====================

async function getCurrencyData() {
  const supabase = createServerSupabase();

  // جلب USD/SYP (الرئيسي)
  const { data: usdSyp } = await supabase
    .from("exchange_rates")
    .select("buy_price, sell_price, change_24h, fetched_at")
    .eq("base_currency", "USD")
    .eq("target_currency", "SYP")
    .eq("is_latest", true)
    .order("fetched_at", { ascending: false })
    .limit(1)
    .single();

  // جلب العملات العالمية
  const { data: currencies } = await supabase
    .from("exchange_rates")
    .select("target_currency, buy_price, sell_price, change_24h, fetched_at")
    .eq("base_currency", "USD")
    .neq("target_currency", "SYP")
    .eq("is_latest", true)
    .order("fetched_at", { ascending: false });

  // إزالة التكرارات (آخر سعر لكل عملة)
  const uniqueCurrencies = currencies
    ? Array.from(
        new Map(currencies.map((c) => [c.target_currency, c])).values()
      )
    : [];

  return { usdSyp, currencies: uniqueCurrencies };
}

// ==================== Main Page ====================

export default async function CurrencyPage() {
  const data = await getCurrencyData();

  const lastUpdated = data.usdSyp?.fetched_at
    ? new Date(data.usdSyp.fetched_at).toLocaleString("ar-SY", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition">الرئيسية</Link>
        <ArrowLeft className="w-4 h-4" />
        <span>أسعار العملات</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold mb-2 flex items-center gap-2">
          <DollarSign className="w-8 h-8 text-primary" />
          أسعار العملات
        </h1>
        <p className="text-muted-foreground">
          أسعار صرف الدولار الأمريكي مقابل الليرة السورية والعملات العالمية
        </p>
        {lastUpdated && (
          <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" />
            آخر تحديث: {lastUpdated}
          </p>
        )}
      </div>

      {/* USD/SYP Main Card */}
      {data.usdSyp && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4">الدولار / ليرة سورية</h2>
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 p-6">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-sm text-muted-foreground mb-1">سعر الشراء</p>
                <p className="text-4xl font-extrabold text-primary">
                  {formatPrice(data.usdSyp.buy_price, "SYP")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">ليرة سورية</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">سعر المبيع</p>
                <p className="text-4xl font-extrabold text-primary">
                  {formatPrice(data.usdSyp.sell_price, "SYP")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">ليرة سورية</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">التغير 24 ساعة</p>
                <div className={`text-2xl font-bold ${getChangeUI(data.usdSyp.change_24h || 0).color}`}>
                  <span className="flex items-center justify-center gap-1">
                    {getChangeUI(data.usdSyp.change_24h || 0).icon}
                    {formatChange(data.usdSyp.change_24h || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Currencies Table */}
      <section>
        <h2 className="text-lg font-bold mb-4">العملات العالمية</h2>
        {data.currencies.length > 0 ? (
          <div className="space-y-3">
            {data.currencies.map((c: any) => (
              <CurrencyRow
                key={c.target_currency}
                currency={c.target_currency}
                buyPrice={c.buy_price}
                sellPrice={c.sell_price}
                change={parseFloat(c.change_24h) || 0}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-card p-8 text-center border border-border">
            <p className="text-muted-foreground">لا توجد بيانات متاحة حالياً</p>
          </div>
        )}
      </section>

      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FinancialProduct",
            name: "أسعار صرف العملات",
            description: "أسعار صرف الدولار والليرة السورية والعملات العالمية",
            provider: {
              "@type": "Organization",
              name: "LiraSYP",
            },
            ...(data.usdSyp && {
              offers: {
                "@type": "Offer",
                price: data.usdSyp.sell_price,
                priceCurrency: "SYP",
              },
            }),
          }),
        }}
      />
    </div>
  );
}
